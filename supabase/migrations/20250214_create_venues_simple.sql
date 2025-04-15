-- Drop existing table and policies
drop policy if exists "venues_select" on venues;
drop policy if exists "venues_insert" on venues;
drop policy if exists "venues_update" on venues;
drop policy if exists "venues_delete" on venues;
drop table if exists venues cascade;

-- Create venues table
create table venues (
    id uuid primary key default uuid_generate_v4(),
    created_by uuid references auth.users not null,
    name text not null,
    address text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table venues enable row level security;

-- Create a single policy first to test
create policy "venues_policy"
    on venues
    using (true);
