-- Create comments table
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  section text not null,
  content text not null,
  commenter_name text not null,
  parent_id uuid references public.comments(id) on delete set null,
  resolved boolean default false,
  resolved_at timestamptz,
  position jsonb -- For storing x,y coordinates if needed for positioning
);

-- Enable RLS
alter table public.comments enable row level security;

-- Create policy to allow anyone to read comments
create policy "Anyone can read comments"
  on public.comments for select
  using (true);

-- Create policy to allow anyone to insert comments
create policy "Anyone can insert comments"
  on public.comments for insert
  with check (true);

-- Create policy to allow anyone to update comments (for resolving)
create policy "Anyone can update comments"
  on public.comments for update
  using (true);
