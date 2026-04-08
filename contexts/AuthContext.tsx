import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User, CreditPurchase } from '@/types/database';
import { Alert, Linking } from 'react-native';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone?: string, location?: string, referralCode?: string) => Promise<void>;
  requestPasswordResetOtp: (identifier: string, method: 'email' | 'phone') => Promise<void>;
  verifyResetOtpAndUpdatePassword: (
    identifier: string,
    otp: string | undefined,
    newPassword: string,
    method: 'email' | 'phone'
  ) => Promise<void>;
  signOut: () => Promise<void>;
  loadUserProfile: (userId: string) => Promise<void>;
  checkCredits: () => Promise<boolean>;
  deductCredit: () => Promise<boolean>;
  requestCreditPurchase: (amount: number, credits: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_ROLES = ['admin', 'super_admin', 'owner'];

const getRoleFromAuthUser = (authUser?: SupabaseUser | null): string | null => {
  if (!authUser) return null;

  const appRole =
    (authUser.app_metadata?.role as string | undefined) ||
    (authUser.app_metadata?.user_role as string | undefined);

  const userRole =
    (authUser.user_metadata?.role as string | undefined) ||
    (authUser.user_metadata?.user_role as string | undefined);

  return (appRole || userRole || null)?.toLowerCase() || null;
};

const isUserAdmin = (profile: User | null, authUser?: SupabaseUser | null): boolean => {
  if ((profile as any)?.is_admin === true) return true;

  // Check role column on users table (set via Supabase table editor)
  const profileRole = ((profile as any)?.role || (profile as any)?.user_role || '').toString().toLowerCase();
  if (ADMIN_ROLES.includes(profileRole)) return true;

  const authRole = getRoleFromAuthUser(authUser);
  return !!authRole && ADMIN_ROLES.includes(authRole);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = useMemo(() => isUserAdmin(user, session?.user), [user, session]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureUserProfile = async (
    userId: string,
    profile: { name: string; email: string; phone?: string; location?: string }
  ) => {
    const { data: existingProfile, error: existingError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existingProfile) {
      return existingProfile;
    }

    const { data: createdProfile, error: createError } = await supabase
      .from('users')
      .insert({
        id: userId,
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        location: profile.location || '',
        is_verified: false,
        credits: 1,
        total_spent: 0,
      })
      .select('*')
      .single();

    if (createError) throw createError;
    return createdProfile;
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUser(data);
        return;
      }

      // Fallback: if profile is missing, attempt self-heal for signed-in user.
      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData?.user;

      if (authUser && authUser.id === userId) {
        const createdProfile = await ensureUserProfile(userId, {
          name: (authUser.user_metadata?.name as string) || 'Utilisateur',
          email: authUser.email || `${userId}@marchecd.com`,
          phone: authUser.user_metadata?.phone as string | undefined,
          location: authUser.user_metadata?.location as string | undefined,
        });

        setUser(createdProfile);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, phone?: string, location?: string, referralCode?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            location,
            referral_code: referralCode || null,
          },
        },
      });

      if (error) throw error;

      // Create initial user profile when a session exists immediately.
      // If email confirmation is enabled and session is null, DB trigger should create the row.
      if (data.user && data.session) {
        try {
          await ensureUserProfile(data.user.id, {
            name,
            email,
            phone,
            location,
          });
        } catch (profileErr) {
          console.error('Error creating initial profile:', profileErr);
          // Continue since the trigger should handle this
        }
      }

      return;
    } catch (error: any) {
      throw new Error(error.message || 'Error creating account');
    }
  };

  const recordLogin = async (userId: string) => {
    try {
      await supabase.from('user_logins').insert({ user_id: userId });
    } catch {
      // Non-critical — don't block sign-in if this fails
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.session?.user) {
        await loadUserProfile(data.session.user.id);
        void recordLogin(data.session.user.id);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error signing in');
    }
  };

  const requestPasswordResetOtp = async (identifier: string, method: 'email' | 'phone') => {
    try {
      const normalizedIdentifier = identifier.trim();
      const redirectTo =
        process.env.EXPO_PUBLIC_PASSWORD_RESET_REDIRECT_URL || 'marchecd://auth/reset-password';

      if (!normalizedIdentifier) {
        throw new Error('Missing identifier');
      }

      const { error } = method === 'email'
        ? await supabase.auth.resetPasswordForEmail(normalizedIdentifier, {
            redirectTo,
          })
        : await supabase.auth.signInWithOtp({
            phone: normalizedIdentifier,
            options: { shouldCreateUser: false },
          });

      if (error) throw error;
    } catch (error: any) {
      if (method === 'phone') {
        const message = (error?.message || '').toLowerCase();
        if (message.includes('sms') || message.includes('phone') || message.includes('provider')) {
          throw new Error('Phone reset is not configured yet. Please contact support or use your email if available.');
        }
      }

      throw new Error(error?.message || 'Unable to send reset code');
    }
  };

  const verifyResetOtpAndUpdatePassword = async (
    identifier: string,
    otp: string | undefined,
    newPassword: string,
    method: 'email' | 'phone'
  ) => {
    try {
      const normalizedIdentifier = identifier.trim();
      const normalizedOtp = otp?.trim();

      if (!newPassword) {
        throw new Error('Missing verification data');
      }

      if (normalizedOtp) {
        const { error: verifyError } = method === 'email'
          ? await supabase.auth.verifyOtp({
              email: normalizedIdentifier,
              token: normalizedOtp,
              type: 'email',
            })
          : await supabase.auth.verifyOtp({
              phone: normalizedIdentifier,
              token: normalizedOtp,
              type: 'sms',
            });

        if (verifyError) throw verifyError;
      } else if (method === 'email') {
        // Email recovery links create a temporary recovery session.
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          throw new Error('Please open the password reset link from your email first.');
        }
      } else {
        throw new Error('OTP code is required for phone reset.');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      // Return users to a clean signed-out state after resetting credentials.
      await supabase.auth.signOut();
    } catch (error: any) {
      throw new Error(error?.message || 'Unable to reset password');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error: any) {
      throw new Error(error.message || 'Error signing out');
    }
  };

  const checkCredits = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data.credits > 0;
    } catch (error) {
      console.error('Error checking credits:', error);
      return false;
    }
  };

  const deductCredit = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('users')
        .update({ credits: user.credits - 1 })
        .eq('id', user.id);

      if (error) throw error;
      
      // Update local user state
      setUser(prev => prev ? { ...prev, credits: prev.credits - 1 } : null);
      return true;
    } catch (error) {
      console.error('Error deducting credit:', error);
      return false;
    }
  };

  const requestCreditPurchase = async (amount: number, credits: number) => {
    if (!user) return;

    try {
      // Log the purchase request
      const { error: purchaseError } = await supabase
        .from('credit_purchases')
        .insert({
          user_id: user.id,
          amount,
          credits,
          status: 'pending'
        });

      if (purchaseError) throw purchaseError;

      // Open WhatsApp with prefilled message
      const message = `Hello! I would like to buy ${credits} credits for $${amount}. My user ID is: ${user.id}`;
      const whatsappUrl = `https://wa.me/27672727343?text=${encodeURIComponent(message)}`;
      
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('Error', "Couldn't open WhatsApp. Please make sure it's installed on your device.");
      }
    } catch (error) {
      console.error('Error requesting credit purchase:', error);
      Alert.alert('Error', 'Failed to process your purchase request. Please try again.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAdmin,
        loading,
        signIn,
        signUp,
        requestPasswordResetOtp,
        verifyResetOtpAndUpdatePassword,
        signOut,
        loadUserProfile,
        checkCredits,
        deductCredit,
        requestCreditPurchase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
