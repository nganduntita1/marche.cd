-- Add push_token column to users table for push notifications
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_push_token ON users(push_token) WHERE push_token IS NOT NULL;

-- Add comment
COMMENT ON COLUMN users.push_token IS 'Expo push notification token for the user';
