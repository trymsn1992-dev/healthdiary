-- Add columns to user_settings for Google OAuth tokens
ALTER TABLE user_settings ADD COLUMN google_refresh_token text;
ALTER TABLE user_settings ADD COLUMN google_access_token text;
ALTER TABLE user_settings ADD COLUMN google_token_expiry bigint;
