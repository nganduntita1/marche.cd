-- Trust & Safety MVP: reports, block list, and chat message abuse controls

-- 1) REPORTS TABLE
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  reason TEXT NOT NULL CHECK (reason IN ('scam', 'spam', 'harassment', 'fake_listing', 'other')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'action_taken', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (reporter_id <> reported_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_reports_reporter_id ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_user_id ON user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_created_at ON user_reports(created_at DESC);

ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own reports" ON user_reports;
CREATE POLICY "Users can insert own reports"
  ON user_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can view own submitted reports" ON user_reports;
CREATE POLICY "Users can view own submitted reports"
  ON user_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- 2) BLOCKED USERS TABLE
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, blocked_user_id),
  CHECK (user_id <> blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_users_user_id ON blocked_users(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_user_id ON blocked_users(blocked_user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_active ON blocked_users(is_active);

ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own blocks" ON blocked_users;
CREATE POLICY "Users can view own blocks"
  ON blocked_users FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own blocks" ON blocked_users;
CREATE POLICY "Users can create own blocks"
  ON blocked_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND user_id <> blocked_user_id);

DROP POLICY IF EXISTS "Users can update own blocks" ON blocked_users;
CREATE POLICY "Users can update own blocks"
  ON blocked_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND user_id <> blocked_user_id);

DROP POLICY IF EXISTS "Users can delete own blocks" ON blocked_users;
CREATE POLICY "Users can delete own blocks"
  ON blocked_users FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3) MESSAGE RATE-LIMIT STATE TABLE
CREATE TABLE IF NOT EXISTS message_rate_limits (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE message_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own message rate limit" ON message_rate_limits;
CREATE POLICY "Users can view own message rate limit"
  ON message_rate_limits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE policy for clients: only trigger/function should mutate this table.

-- 4) HELPER FUNCTION: CHECK IF TWO USERS ARE BLOCKED
CREATE OR REPLACE FUNCTION is_blocked_between(user_a UUID, user_b UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM blocked_users b
    WHERE b.is_active = TRUE
      AND (
        (b.user_id = user_a AND b.blocked_user_id = user_b)
        OR
        (b.user_id = user_b AND b.blocked_user_id = user_a)
      )
  );
$$;

-- 5) RPC: BLOCK USER
CREATE OR REPLACE FUNCTION block_user(target_user_id UUID, block_reason TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
BEGIN
  caller_id := auth.uid();

  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  IF target_user_id IS NULL OR target_user_id = caller_id THEN
    RAISE EXCEPTION 'INVALID_TARGET';
  END IF;

  INSERT INTO blocked_users (user_id, blocked_user_id, reason, is_active)
  VALUES (caller_id, target_user_id, block_reason, TRUE)
  ON CONFLICT (user_id, blocked_user_id)
  DO UPDATE
    SET is_active = TRUE,
        reason = COALESCE(EXCLUDED.reason, blocked_users.reason),
        updated_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION block_user(UUID, TEXT) TO authenticated;

-- 6) RPC: REPORT USER
CREATE OR REPLACE FUNCTION report_user(
  target_user_id UUID,
  report_reason TEXT,
  report_details TEXT DEFAULT NULL,
  report_conversation_id UUID DEFAULT NULL,
  report_message_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  created_report_id UUID;
BEGIN
  caller_id := auth.uid();

  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  IF target_user_id IS NULL OR target_user_id = caller_id THEN
    RAISE EXCEPTION 'INVALID_TARGET';
  END IF;

  IF report_reason IS NULL OR report_reason NOT IN ('scam', 'spam', 'harassment', 'fake_listing', 'other') THEN
    RAISE EXCEPTION 'INVALID_REASON';
  END IF;

  INSERT INTO user_reports (
    reporter_id,
    reported_user_id,
    conversation_id,
    message_id,
    reason,
    details
  )
  VALUES (
    caller_id,
    target_user_id,
    report_conversation_id,
    report_message_id,
    report_reason,
    report_details
  )
  RETURNING id INTO created_report_id;

  RETURN created_report_id;
END;
$$;

GRANT EXECUTE ON FUNCTION report_user(UUID, TEXT, TEXT, UUID, UUID) TO authenticated;

-- 7) ENFORCEMENT TRIGGER ON CHAT MESSAGES
CREATE OR REPLACE FUNCTION enforce_message_safety()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  other_participant_id UUID;
  current_window_start TIMESTAMPTZ;
  current_count INTEGER;
  max_messages_per_minute CONSTANT INTEGER := 20;
BEGIN
  caller_id := auth.uid();

  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  IF NEW.sender_id IS NULL OR NEW.sender_id <> caller_id THEN
    RAISE EXCEPTION 'INVALID_SENDER';
  END IF;

  -- Resolve the other participant in this conversation
  SELECT
    CASE
      WHEN c.buyer_id = NEW.sender_id THEN c.seller_id
      ELSE c.buyer_id
    END
  INTO other_participant_id
  FROM conversations c
  WHERE c.id = NEW.conversation_id;

  IF other_participant_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_CONVERSATION';
  END IF;

  -- Blocked user enforcement
  IF is_blocked_between(NEW.sender_id, other_participant_id) THEN
    RAISE EXCEPTION 'BLOCKED_USER';
  END IF;

  -- Rate-limit enforcement (rolling 1-minute bucket)
  SELECT window_start, message_count
  INTO current_window_start, current_count
  FROM message_rate_limits
  WHERE user_id = NEW.sender_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO message_rate_limits (user_id, window_start, message_count, updated_at)
    VALUES (NEW.sender_id, NOW(), 1, NOW());
    RETURN NEW;
  END IF;

  IF current_window_start < NOW() - INTERVAL '1 minute' THEN
    UPDATE message_rate_limits
    SET window_start = NOW(),
        message_count = 1,
        updated_at = NOW()
    WHERE user_id = NEW.sender_id;
    RETURN NEW;
  END IF;

  IF current_count >= max_messages_per_minute THEN
    RAISE EXCEPTION 'RATE_LIMIT_EXCEEDED';
  END IF;

  UPDATE message_rate_limits
  SET message_count = message_count + 1,
      updated_at = NOW()
  WHERE user_id = NEW.sender_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_message_safety ON messages;
CREATE TRIGGER trg_enforce_message_safety
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION enforce_message_safety();

-- 8) Optional updated_at trigger wiring for new tables
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
  ) THEN
    DROP TRIGGER IF EXISTS update_user_reports_updated_at ON user_reports;
    CREATE TRIGGER update_user_reports_updated_at
      BEFORE UPDATE ON user_reports
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_blocked_users_updated_at ON blocked_users;
    CREATE TRIGGER update_blocked_users_updated_at
      BEFORE UPDATE ON blocked_users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_message_rate_limits_updated_at ON message_rate_limits;
    CREATE TRIGGER update_message_rate_limits_updated_at
      BEFORE UPDATE ON message_rate_limits
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;