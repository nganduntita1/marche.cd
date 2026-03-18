/* @ts-nocheck */

import { createClient } from 'jsr:@supabase/supabase-js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
}

const serverClient = createClient(SUPABASE_URL ?? '', SERVICE_ROLE_KEY ?? '', {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Commission rates and settings
const COMMISSION_RATE = 0.15; // 15% commission
const MINIMUM_PURCHASE_AMOUNT = 5; // Only reward after $5+ purchase
const COMMISSION_AUTO_PAY = true; // Auto-credit referrer (set false for manual approval)

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  };

  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const body = await req.json().catch(() => ({}));
    const { purchaseId } = body;

    if (!purchaseId) {
      return new Response(JSON.stringify({ error: 'purchaseId is required' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Fetch the credit purchase
    const { data: purchase, error: purchaseError } = await serverClient
      .from('credit_purchases')
      .select('*')
      .eq('id', purchaseId)
      .single();

    if (purchaseError) throw purchaseError;

    if (!purchase) {
      return new Response(JSON.stringify({ error: 'Purchase not found' }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Only process if status is 'completed'
    if (purchase.status !== 'completed') {
      return new Response(JSON.stringify({ message: 'Purchase not completed yet' }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Check if purchase amount meets minimum threshold
    if (purchase.amount < MINIMUM_PURCHASE_AMOUNT) {
      return new Response(
        JSON.stringify({ message: 'Purchase amount below minimum for commission' }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Check if referral signup exists for this user
    const { data: referralSignup, error: signupError } = await serverClient
      .from('referral_signups')
      .select('referral_code_id')
      .eq('referred_user_id', purchase.user_id)
      .single();

    if (signupError && signupError.code !== 'PGRST116') {
      throw signupError;
    }

    if (!referralSignup) {
      // User didn't sign up with a referral code
      return new Response(
        JSON.stringify({ message: 'No referral signup found for user' }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Get the referrer from the referral code
    const { data: referralCode, error: codeError } = await serverClient
      .from('referral_codes')
      .select('user_id')
      .eq('id', referralSignup.referral_code_id)
      .single();

    if (codeError) throw codeError;

    const referrerId = referralCode.user_id;

    // Prevent self-referral
    if (referrerId === purchase.user_id) {
      return new Response(
        JSON.stringify({ message: 'Self-referral detected, no commission' }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Check if commission already exists for this purchase
    const { data: existingCommission, error: existingError } = await serverClient
      .from('referral_commissions')
      .select('id')
      .eq('source_purchase_id', purchaseId)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      throw existingError;
    }

    if (existingCommission) {
      return new Response(
        JSON.stringify({ message: 'Commission already created for this purchase' }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Calculate commission
    const commissionAmount = Number((purchase.amount * COMMISSION_RATE).toFixed(2));
    // Estimate credits as same commission rate applied to purchased credits
    const commissionCredits = Math.floor(purchase.credits * COMMISSION_RATE);

    if (commissionCredits <= 0) {
      return new Response(
        JSON.stringify({ message: 'Commission rounds to 0 credits' }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Create commission record
    const { data: commission, error: commissionError } = await serverClient
      .from('referral_commissions')
      .insert({
        referrer_id: referrerId,
        referred_user_id: purchase.user_id,
        source_purchase_id: purchaseId,
        commission_amount: commissionAmount,
        commission_credits: commissionCredits,
        status: COMMISSION_AUTO_PAY ? 'paid' : 'pending_admin',
        paid_at: COMMISSION_AUTO_PAY ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (commissionError) throw commissionError;

    // If auto-pay enabled, credit the referrer immediately
    if (COMMISSION_AUTO_PAY) {
      // Get current credits
      const { data: referrerUser, error: userError } = await serverClient
        .from('users')
        .select('credits')
        .eq('id', referrerId)
        .single();

      if (userError) throw userError;

      // Update referrer credits
      const { error: updateError } = await serverClient
        .from('users')
        .update({
          credits: (referrerUser.credits || 0) + commissionCredits,
        })
        .eq('id', referrerId);

      if (updateError) throw updateError;

      // Update referral aggregate stats safely
      const { count: signupCount, error: countError } = await serverClient
        .from('referral_signups')
        .select('*', { count: 'exact', head: true })
        .eq('referral_code_id', referralSignup.referral_code_id);

      if (countError) throw countError;

      const { data: currentCode, error: currentCodeError } = await serverClient
        .from('referral_codes')
        .select('id, total_commission')
        .eq('id', referralSignup.referral_code_id)
        .single();

      if (currentCodeError) throw currentCodeError;

      const { error: updateCodeError } = await serverClient
        .from('referral_codes')
        .update({
          total_referrals: signupCount || 0,
          total_commission: Number(currentCode.total_commission || 0) + commissionAmount,
        })
        .eq('id', referralSignup.referral_code_id);

      if (updateCodeError) throw updateCodeError;
    }

    return new Response(
      JSON.stringify({
        message: 'Commission processed successfully',
        commission: {
          id: commission.id,
          amount: commissionAmount,
          credits: commissionCredits,
          status: commission.status,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in process-referral-commission function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
