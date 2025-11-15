// Supabase Edge Function: listen to pg_notify and relay to broadcast
// This function subscribes to the 'broadcast_message' channel and forwards
// notifications to the broadcast-message function. Deploy as 'broadcast-listener'.
/* @ts-nocheck */

import { createClient } from 'jsr:@supabase/supabase-js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  Deno.exit(1);
}

const serverClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// This function should be invoked manually or on a schedule to start listening
Deno.serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
        },
      });
    }

    // Start listening to notifications
    console.log('Starting broadcast-listener...');

    const subscription = serverClient
      .channel('pg-notify-listener')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        console.log('Received postgres change:', payload);
        // This is handled by the client already; log for debugging
      })
      .subscribe(async (status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to postgres changes');
        }
      });

    // Keep listening for a bit (this won't work for long-lived connections in serverless)
    // For production, consider a dedicated server or cron-triggered function
    await new Promise((resolve) => setTimeout(resolve, 30000));

    return new Response(JSON.stringify({ status: 'listener ran', timeout: '30s' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
  }
});
