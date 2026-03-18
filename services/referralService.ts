import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Referral Service - Handles all referral-related operations
 */

export const referralService = {
  /**
   * Store referral code temporarily (during signup before user is created)
   */
  storeSignupReferralCode: async (code: string): Promise<boolean> => {
    try {
      // Store in AsyncStorage or local state
      // This will be used after user creation to link the referral
      await AsyncStorage.setItem('temp_referral_code', code);
      return true;
    } catch (error) {
      console.error('Error storing referral code:', error);
      return false;
    }
  },

  /**
   * Get temporarily stored referral code
   */
  getStoredReferralCode: async (): Promise<string | null> => {
    try {
      const code = await AsyncStorage.getItem('temp_referral_code');
      return code;
    } catch (error) {
      console.error('Error retrieving stored referral code:', error);
      return null;
    }
  },

  /**
   * Apply referral code after user signup
   */
  applyReferralCodeToNewUser: async (userId: string, code: string): Promise<boolean> => {
    try {
      // Find the referral code
      const { data: referralCode, error: codeError } = await supabase
        .from('referral_codes')
        .select('id')
        .eq('code', code)
        .eq('is_active', true)
        .maybeSingle();

      if (codeError || !referralCode) {
        console.error('Invalid or inactive referral code');
        return false;
      }

      // Check if user already has a referral signup (shouldn't happen, but safety check)
      const { data: existingSignup } = await supabase
        .from('referral_signups')
        .select('id')
        .eq('referred_user_id', userId)
        .maybeSingle();

      if (existingSignup) {
        console.warn('User already has a referral signup');
        return false;
      }

      // Create referral signup record
      const { error: signupError } = await supabase
        .from('referral_signups')
        .insert({
          referral_code_id: referralCode.id,
          referred_user_id: userId,
        });

      if (signupError) {
        if (signupError.code === '23505') {
          // Already linked (idempotent race with DB trigger or prior attempt)
          await AsyncStorage.removeItem('temp_referral_code');
          return true;
        }
        console.error('Error creating referral signup:', signupError);
        return false;
      }

      // Clear the stored code
      await AsyncStorage.removeItem('temp_referral_code');

      return true;
    } catch (error) {
      console.error('Error applying referral code:', error);
      return false;
    }
  },

  /**
   * Validate referral code format and existence
   */
  validateReferralCode: async (code: string): Promise<{
    isValid: boolean;
    message: string;
    referrerName?: string;
  }> => {
    try {
      // Validate format
      if (!code || code.length < 5) {
        return { isValid: false, message: 'Code invalide' };
      }

      // Check if code exists and is active
      const { data: referralCode, error } = await supabase
        .from('referral_codes')
        .select('*, users(name)')
        .eq('code', code)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !referralCode) {
        return { isValid: false, message: 'Code de parrainage invalide ou expiré' };
      }

      return {
        isValid: true,
        message: 'Code valide',
        referrerName: referralCode.users?.name || 'Utilisateur',
      };
    } catch (error) {
      console.error('Error validating referral code:', error);
      return { isValid: false, message: 'Erreur lors de la validation du code' };
    }
  },

  /**
   * Get user's referral stats
   */
  getUserReferralStats: async (userId: string) => {
    try {
      // Get referral code
      const { data: referralCode } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Get commissions
      const { data: commissions } = await supabase
        .from('referral_commissions')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      // Get referral signups
      let refSignups = [];
      if (referralCode) {
        const { data: signups } = await supabase
          .from('referral_signups')
          .select('*')
          .eq('referral_code_id', referralCode.id);
        refSignups = signups || [];
      }

      return {
        referralCode,
        commissions: commissions || [],
        signups: refSignups,
        totalReferrals: refSignups.length,
        totalCommissionEarned:
          commissions?.reduce((sum, c) => sum + c.commission_amount, 0) || 0,
        totalCommissionCredits:
          commissions?.reduce((sum, c) => sum + c.commission_credits, 0) || 0,
        paidCommissionCredits:
          commissions?.filter((c) => c.status === 'paid').reduce((sum, c) => sum + c.commission_credits, 0) || 0,
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return null;
    }
  },

  /**
   * Trigger commission processing for a purchase
   */
  processCommissionForPurchase: async (purchaseId: string, accessToken: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/process-referral-commission`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ purchaseId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Commission processing error:', data.error);
        return false;
      }

      console.log('Commission processed:', data);
      return true;
    } catch (error) {
      console.error('Error processing commission:', error);
      return false;
    }
  },

  /**
   * Get shareable referral link/message
   */
  getShareableReferralMessage: (code: string, isFrench: boolean = false): string => {
    if (isFrench) {
      return `Rejoignez-moi sur Marché! Utilisez mon code de parrainage: ${code}\n\nGagnez des crédits gratuits sur vos achats!`;
    }
    return `Join me on Marché! Use my referral code: ${code}\n\nGet free credits on your purchases!`;
  },
};
