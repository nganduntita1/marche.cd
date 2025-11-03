import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User, CreditPurchase } from '@/types/database';
import { Alert, Linking } from 'react-native';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadUserProfile: (userId: string) => Promise<void>;
  checkCredits: () => Promise<boolean>;
  deductCredit: () => Promise<boolean>;
  requestCreditPurchase: (amount: number, credits: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      // Create initial user profile
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              name,
              email,
              phone: '',
              location: '',
              is_verified: false,
              credits: 1, // Start with 1 free credit
              total_spent: 0,
            });

          if (profileError) throw profileError;
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

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.session?.user) {
        await loadUserProfile(data.session.user.id);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error signing in');
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
        loading,
        signIn,
        signUp,
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
