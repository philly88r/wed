-- Drop existing tables if they exist
drop table if exists guests cascade;
drop table if exists table_instances cascade;
drop table if exists seating_layouts cascade;
drop table if exists table_templates cascade;
drop table if exists venues cascade;
drop table if exists profiles cascade;
drop table if exists system_table_templates cascade;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create handle_new_user trigger function
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, first_name, last_name)
    values (new.id, new.email, 
           new.raw_user_meta_data->>'first_name',
           new.raw_user_meta_data->>'last_name')
    on conflict (id) do nothing;
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user handling
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Create venues table
create table venues (
    id uuid primary key default uuid_generate_v4(),
    created_by uuid references auth.users not null,
    name text not null,
    address text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create table templates
create table table_templates (
    id uuid primary key default uuid_generate_v4(),
    created_by uuid references auth.users not null,
    name text not null,
    shape text not null check (shape in ('round', 'rectangular', 'square', 'oval')),
    width numeric not null,
    length numeric not null,
    seats integer not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create seating layouts
create table seating_layouts (
    id uuid primary key default uuid_generate_v4(),
    created_by uuid references auth.users not null,
    name text not null,
    venue_id uuid references venues(id) not null,
    width numeric not null,
    length numeric not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create table instances
create table table_instances (
    id uuid primary key default uuid_generate_v4(),
    created_by uuid references auth.users not null,
    layout_id uuid references seating_layouts(id) not null,
    template_id uuid references table_templates(id) not null,
    name text not null,
    position_x numeric not null,
    position_y numeric not null,
    rotation numeric default 0 not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create guests table
create table guests (
    id uuid primary key default uuid_generate_v4(),
    created_by uuid references auth.users not null,
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
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS on all tables
alter table venues enable row level security;
alter table table_templates enable row level security;
alter table seating_layouts enable row level security;
alter table table_instances enable row level security;
alter table guests enable row level security;

-- Add RLS policies for all tables
create policy "venues_select" on venues for select using (created_by = auth.uid());
create policy "venues_insert" on venues for insert with check (created_by = auth.uid());
create policy "venues_update" on venues for update using (created_by = auth.uid());
create policy "venues_delete" on venues for delete using (created_by = auth.uid());

create policy "table_templates_select" on table_templates for select using (created_by = auth.uid());
create policy "table_templates_insert" on table_templates for insert with check (created_by = auth.uid());
create policy "table_templates_update" on table_templates for update using (created_by = auth.uid());
create policy "table_templates_delete" on table_templates for delete using (created_by = auth.uid());

create policy "seating_layouts_select" on seating_layouts for select using (created_by = auth.uid());
create policy "seating_layouts_insert" on seating_layouts for insert with check (created_by = auth.uid());
create policy "seating_layouts_update" on seating_layouts for update using (created_by = auth.uid());
create policy "seating_layouts_delete" on seating_layouts for delete using (created_by = auth.uid());

create policy "table_instances_select" on table_instances for select using (created_by = auth.uid());
create policy "table_instances_insert" on table_instances for insert with check (created_by = auth.uid());
create policy "table_instances_update" on table_instances for update using (created_by = auth.uid());
create policy "table_instances_delete" on table_instances for delete using (created_by = auth.uid());

create policy "guests_select" on guests for select using (created_by = auth.uid());
create policy "guests_insert" on guests for insert with check (created_by = auth.uid());
create policy "guests_update" on guests for update using (created_by = auth.uid());
create policy "guests_delete" on guests for delete using (created_by = auth.uid());

-- Create system templates table
create table system_table_templates (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    shape text not null check (shape in ('round', 'rectangular', 'square', 'oval')),
    width numeric not null,
    length numeric not null,
    seats integer not null,
    is_premium boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create profiles table
create table profiles (
    id uuid primary key references auth.users(id),
    email text,
    first_name text,
    last_name text,
    is_premium boolean default false,
    premium_until timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS on profiles and system templates
alter table system_table_templates enable row level security;
alter table profiles enable row level security;

-- Add RLS policies for profiles
create policy "Users can view own profile"
    on profiles for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on profiles for update
    using (auth.uid() = id);

-- Create premium check function
create or replace function has_premium_access()
returns boolean as $$
declare
    user_premium boolean;
    premium_expiry timestamptz;
begin
    select is_premium, premium_until
    into user_premium, premium_expiry
    from profiles
    where id = auth.uid();
    
    return user_premium and (premium_expiry > now());
end;
$$ language plpgsql security definer;

-- Add system templates policy
create policy "Users can view appropriate templates"
    on system_table_templates
    for select
    using (
        case 
            when is_premium then has_premium_access()
            else auth.role() = 'authenticated'
        end
    );

-- Create test user
insert into auth.users (
    instance_id,
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) values (
    '00000000-0000-0000-0000-000000000000',
    'dd36bf89-b634-4b48-b781-84c09d599d24',
    'test@wedding.com',
    '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name": "Test", "last_name": "User"}',
    false,
    'authenticated'
) on conflict (id) do nothing;

-- Create premium profile for test user
insert into profiles (
    id,
    email,
    first_name,
    last_name,
    is_premium,
    premium_until
) values (
    'dd36bf89-b634-4b48-b781-84c09d599d24',
    'test@wedding.com',
    'Test',
    'User',
    true,
    now() + interval '1 year'
) on conflict (id) do update set
    is_premium = excluded.is_premium,
    premium_until = excluded.premium_until;

-- Insert system-wide templates
insert into system_table_templates 
    (name, shape, width, length, seats, is_premium)
values 
    ('Round Table (8)', 'round', 5, 5, 8, false),
    ('Round Table (10)', 'round', 6, 6, 10, false),
    ('Round Table (12)', 'round', 7, 7, 12, false),
    ('Rectangular Table (8)', 'rectangular', 4, 8, 8, false),
    ('Rectangular Table (10)', 'rectangular', 4, 10, 10, false),
    ('Square Table (4)', 'square', 4, 4, 4, false),
    ('Square Table (8)', 'square', 6, 6, 8, false),
    ('Oval Table (12)', 'oval', 5, 12, 12, true),
    ('Head Table (16)', 'rectangular', 4, 16, 16, true),
    ('Sweetheart Table', 'rectangular', 3, 4, 2, true);

-- Add updated_at triggers
create trigger handle_venues_updated_at
    before update on venues
    for each row
    execute procedure handle_updated_at();

create trigger handle_table_templates_updated_at
    before update on table_templates
    for each row
    execute procedure handle_updated_at();

create trigger handle_seating_layouts_updated_at
    before update on seating_layouts
    for each row
    execute procedure handle_updated_at();

create trigger handle_table_instances_updated_at
    before update on table_instances
    for each row
    execute procedure handle_updated_at();

create trigger handle_guests_updated_at
    before update on guests
    for each row
    execute procedure handle_updated_at();

-- Verify setup
select 'Tables created successfully' as status;
select count(*) as template_count from system_table_templates;
select count(*) as premium_users from profiles where is_premium = true;
