-- Create guests table
create table if not exists public.guests (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    first_name text not null,
    last_name text not null,
    email text,
    phone text,
    relationship text,
    dietary_restrictions text,
    plus_one boolean default false,
    rsvp_status text default 'pending',
    table_assignment uuid references table_instances(id),
    seat_number integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.guests enable row level security;

create policy "Users can view their own guests"
    on public.guests for select
    using (auth.uid() = user_id);

create policy "Users can insert their own guests"
    on public.guests for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own guests"
    on public.guests for update
    using (auth.uid() = user_id);

create policy "Users can delete their own guests"
    on public.guests for delete
    using (auth.uid() = user_id);

-- Add updated_at trigger
create trigger handle_guests_updated_at
    before update on public.guests
    for each row
    execute procedure public.handle_updated_at();
