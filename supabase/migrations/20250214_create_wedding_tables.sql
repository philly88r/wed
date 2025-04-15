-- Create venues table first
create table if not exists public.venues (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    name text not null,
    address text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies for venues
alter table public.venues enable row level security;

create policy "Users can view their own venues"
    on public.venues for select
    using (auth.uid() = user_id);

create policy "Users can insert their own venues"
    on public.venues for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own venues"
    on public.venues for update
    using (auth.uid() = user_id);

create policy "Users can delete their own venues"
    on public.venues for delete
    using (auth.uid() = user_id);

-- Create table templates
create table if not exists public.table_templates (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    name text not null,
    shape text not null check (shape in ('round', 'rectangular', 'square', 'oval')),
    width numeric not null,
    length numeric not null,
    seats integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies for table_templates
alter table public.table_templates enable row level security;

create policy "Users can view their own table templates"
    on public.table_templates for select
    using (auth.uid() = user_id);

create policy "Users can insert their own table templates"
    on public.table_templates for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own table templates"
    on public.table_templates for update
    using (auth.uid() = user_id);

create policy "Users can delete their own table templates"
    on public.table_templates for delete
    using (auth.uid() = user_id);

-- Create seating layouts
create table if not exists public.seating_layouts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    name text not null,
    venue_id uuid references venues(id) not null,
    width numeric not null,
    length numeric not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies for seating_layouts
alter table public.seating_layouts enable row level security;

create policy "Users can view their own seating layouts"
    on public.seating_layouts for select
    using (auth.uid() = user_id);

create policy "Users can insert their own seating layouts"
    on public.seating_layouts for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own seating layouts"
    on public.seating_layouts for update
    using (auth.uid() = user_id);

create policy "Users can delete their own seating layouts"
    on public.seating_layouts for delete
    using (auth.uid() = user_id);

-- Create table instances
create table if not exists public.table_instances (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    layout_id uuid references seating_layouts(id) not null,
    template_id uuid references table_templates(id) not null,
    name text not null,
    position_x numeric not null,
    position_y numeric not null,
    rotation numeric default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies for table_instances
alter table public.table_instances enable row level security;

create policy "Users can view their own table instances"
    on public.table_instances for select
    using (auth.uid() = user_id);

create policy "Users can insert their own table instances"
    on public.table_instances for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own table instances"
    on public.table_instances for update
    using (auth.uid() = user_id);

create policy "Users can delete their own table instances"
    on public.table_instances for delete
    using (auth.uid() = user_id);

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

-- Add RLS policies for guests
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

-- Add updated_at trigger function if it doesn't exist
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Add updated_at triggers for all tables
create trigger handle_venues_updated_at
    before update on public.venues
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_table_templates_updated_at
    before update on public.table_templates
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_seating_layouts_updated_at
    before update on public.seating_layouts
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_table_instances_updated_at
    before update on public.table_instances
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_guests_updated_at
    before update on public.guests
    for each row
    execute procedure public.handle_updated_at();

-- Insert some default table templates
insert into public.table_templates (user_id, name, shape, width, length, seats)
values 
    (auth.uid(), 'Round Table (8)', 'round', 5, 5, 8),
    (auth.uid(), 'Round Table (10)', 'round', 6, 6, 10),
    (auth.uid(), 'Rectangular Table (8)', 'rectangular', 3, 8, 8),
    (auth.uid(), 'Square Table (4)', 'square', 4, 4, 4),
    (auth.uid(), 'Oval Table (12)', 'oval', 4, 10, 12);
