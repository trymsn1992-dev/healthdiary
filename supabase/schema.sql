
-- Create a table for mood logs
create table mood_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null,
  mood_score integer check (mood_score >= 1 and mood_score <= 5),
  note text
);

-- Create a table for symptom logs
create table symptom_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null,
  symptoms jsonb default '[]'::jsonb, -- Array of strings or objects
  note text
);

-- Enable Row Level Security (RLS)
alter table mood_logs enable row level security;
alter table symptom_logs enable row level security;

-- Create policies to allow users to interpret their own data only
create policy "Users can view their own mood logs"
on mood_logs for select
using ( auth.uid() = user_id );

create policy "Users can insert their own mood logs"
on mood_logs for insert
with check ( auth.uid() = user_id );

create policy "Users can update their own mood logs"
on mood_logs for update
using ( auth.uid() = user_id );

create policy "Users can delete their own mood logs"
on mood_logs for delete
using ( auth.uid() = user_id );

-- Same policies for symptom logs
create policy "Users can view their own symptom logs"
on symptom_logs for select
using ( auth.uid() = user_id );

create policy "Users can insert their own symptom logs"
on symptom_logs for insert
with check ( auth.uid() = user_id );

create policy "Users can update their own symptom logs"
on symptom_logs for update
using ( auth.uid() = user_id );

create policy "Users can delete their own symptom logs"
on symptom_logs for delete
using ( auth.uid() = user_id );
