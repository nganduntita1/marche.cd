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

// Generate unique referral code
function generateUniqueCode(userId: string): string {
  // Format: MARCHE_[5 random alphanumeric] => total length 12
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'MARCHE_';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Get the token from the authorization header
    const token = authHeader.replace('Bearer ', '');

    // Verify the token and get user
    const { data: { user }, error: userError } = await serverClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Check if user already has a referral code
    const { data: existingCode, error: checkError } = await serverClient
      .from('referral_codes')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw checkError;
    }

    if (existingCode) {
      // Return existing code
      return new Response(JSON.stringify({ code: existingCode.code, isNew: false }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate new unique code (retry if collision)
    let newCode = '';
    let retries = 0;
    const maxRetries = 10;

    while (retries < maxRetries) {
      newCode = generateUniqueCode(user.id);

      const { data: codeExists } = await serverClient
        .from('referral_codes')
        .select('code')
        .eq('code', newCode)
        .single();

      if (!codeExists) break; // Code is unique
      retries++;
    }

    if (retries >= maxRetries) {
      throw new Error('Failed to generate unique code after retries');
    }

    // Create referral code record
    const { data: newReferralCode, error: createError } = await serverClient
      .from('referral_codes')
      .insert({
        user_id: user.id,
        code: newCode,
        is_active: true,
      })
      .select()
      .single();

    if (createError) throw createError;

    return new Response(
      JSON.stringify({
        code: newReferralCode.code,
        isNew: true,
        createdAt: newReferralCode.created_at,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in generate-referral-code function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
