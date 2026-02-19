-- Create a table for user settings (e.g. calendar URL)
create table user_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  calendar_url text
);

-- Enable RLS
alter table user_settings enable row level security;

-- Policies for user_settings
create policy "Users can view their own settings"
on user_settings for select
using ( auth.uid() = user_id );

create policy "Users can insert their own settings"
on user_settings for insert
with check ( auth.uid() = user_id );

create policy "Users can update their own settings"
on user_settings for update
using ( auth.uid() = user_id );

create policy "Users can delete their own settings"
on user_settings for delete
using ( auth.uid() = user_id );
