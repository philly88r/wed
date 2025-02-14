-- Drop existing tables
drop table if exists guests cascade;
drop table if exists table_instances cascade;
drop table if exists seating_layouts cascade;
drop table if exists table_templates cascade;
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
