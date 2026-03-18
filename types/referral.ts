// Referral System Types

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  is_active: boolean;
  total_referrals: number;
  total_commission: number;
  created_at: string;
  updated_at: string;
}

export interface ReferralSignup {
  id: string;
  referral_code_id: string;
  referred_user_id: string;
  used_at: string;
}

export interface ReferralCommission {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  source_purchase_id: string;
  commission_amount: number;
  commission_credits: number;
  status: 'earned' | 'pending_admin' | 'paid';
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferralStats {
  totalReferrals: number;
  totalCommissionEarned: number;
  pendingCommission: number;
  activeCode: string | null;
  commissions: ReferralCommission[];
}

export interface ReferredUser {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  purchaseAmount: number | null;
  purchaseStatus: string | null;
  referredAt: string;
  commissionStatus: 'earned' | 'pending_admin' | 'paid';
}
