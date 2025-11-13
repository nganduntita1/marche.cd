// Supabase Edge Function (Deno) to fetch a message by id and broadcast it to a channel.
// This file targets the Supabase Edge Functions (Deno) runtime. The local TypeScript
// tooling in this repo may not have Deno types; disable checking locally so the
// repository linter doesn't flag Deno globals. The runtime will run under Deno on
// Supabase Edge and has access to Deno.env and std library.
/* @ts-nocheck */

import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

// Deno.env is available at runtime in Supabase Edge. Keep these env var names
// matching your Supabase project (set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY).
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
}

const serverClient = createClient(SUPABASE_URL ?? '', SERVICE_ROLE_KEY ?? '', {
  auth: { persistSession: false, autoRefreshToken: false },
});

serve(async (req: Request) => {
  try {
    // Basic CORS handling for browser preflight
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
    const body = await req.json().catch(() => ({}));
    const messageId = body?.messageId;

    if (!messageId) {
      return new Response(JSON.stringify({ error: 'messageId is required' }), { status: 400 });
    }

    // Fetch the message row
    const { data: message, error: fetchError } = await serverClient
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (fetchError || !message) {
      return new Response(JSON.stringify({ error: fetchError?.message || 'Message not found' }), { status: 500 });
    }

    // Compose the channel name used by clients
    const channelName = `messages-${message.conversation_id}`;

    // Create a channel and broadcast the message. We subscribe and then send a
    // broadcast event to ensure connected clients receive the low-latency event.
    const channel = serverClient.channel(channelName);

    await new Promise((resolve, reject) => {
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel
            .send({ type: 'broadcast', event: 'new-message', payload: message })
            .then((result) => resolve(result), (err) => reject(err));
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          reject(new Error('channel subscribe failed: ' + status));
        }
      });

      // safety timeout
      setTimeout(() => reject(new Error('subscribe timeout')), 5000);
    });

    // success
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error('broadcast-message error', err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
  }
});
