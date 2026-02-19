
-- Drop the old constraint (assuming it was named automatically or we knwo the name)
-- Note: Supabase/Postgres usually names check constraints as table_column_check.
-- Let's try to drop it by name 'mood_logs_mood_score_check' which is the default naming convention.

alter table mood_logs drop constraint if exists mood_logs_mood_score_check;

-- Add the new constraint for 1-10 range
alter table mood_logs add constraint mood_logs_mood_score_check check (mood_score >= 1 and mood_score <= 10);
