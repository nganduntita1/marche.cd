-- Migration: create trigger to POST new messages to the Edge Function
-- This migration attempts to use the pg_net extension (if available) to POST to
-- the Edge Function endpoint. If pg_net is not available on your hosted DB,
-- the script will instead use pg_notify to emit a payload that an external
-- worker (or Supabase function) can subscribe to.

-- Replace <PROJECT_REF> with your Supabase project ref or use env variable in your deploy tooling.
-- Example Edge Function URL:
-- https://<PROJECT_REF>.supabase.co/functions/v1/broadcast-message

-- Creates a trigger function that attempts to POST the new message id to the
-- Edge Function. If the pg_net extension (pg_net_post) is not available, the
-- function falls back to emitting a channel notification with pg_notify.

-- IMPORTANT: Replace <PROJECT_REF> with your Supabase project ref. If you
-- prefer not to hardcode, set a GUC 'app.supabase_project_ref' before running.

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.broadcast_message_to_edge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  message_row jsonb;
  edge_url text := format('https://%s.supabase.co/functions/v1/broadcast-message', 'vmrauuruhiukbyfjgfzb');
  payload text;
BEGIN
  message_row := row_to_json(NEW)::jsonb;
  payload := jsonb_build_object('messageId', NEW.id)::text;

  -- Try to use pg_net if available (hosting providers may not allow this extension)
  BEGIN
    -- pg_net_post(url text, payload text, content_type text)
    PERFORM public.pg_net_post(edge_url, payload, 'application/json');
    RETURN NEW;
  EXCEPTION WHEN undefined_function THEN
    -- Fallback: emit a NOTIFY payload so a worker can listen and broadcast
    PERFORM pg_notify('broadcast_message', payload);
    RETURN NEW;
  END;
END;
$$;

-- Create trigger if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_broadcast_message'
  ) THEN
    CREATE TRIGGER trigger_broadcast_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.broadcast_message_to_edge();
  END IF;
END$$;

-- NOTE: Replace '<PROJECT_REF>' above with your actual Supabase project ref.
-- If you have the pg_net extension installed, this will POST to your Edge
-- function URL. Otherwise it emits pg_notify('broadcast_message', payload)
-- which you can handle with a separate worker or listen via LISTEN/pg_notify.
