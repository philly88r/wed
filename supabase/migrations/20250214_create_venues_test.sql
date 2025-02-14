-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create venues table first
drop table if exists public.venues cascade;

create table public.venues (
    id uuid default uuid_generate_v4() primary key,
    created_by uuid references auth.users not null,
    name text not null,
    address text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies for venues
alter table public.venues enable row level security;

create policy "venues_select"
    on venues for select
    using (created_by = auth.uid());

create policy "venues_insert"
    on venues for insert
    with check (created_by = auth.uid());

create policy "venues_update"
    on venues for update
    using (created_by = auth.uid());

create policy "venues_delete"
    on venues for delete
    using (created_by = auth.uid());
