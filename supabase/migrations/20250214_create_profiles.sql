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

-- Enable RLS
alter table profiles enable row level security;

-- Add RLS policies
create policy "Users can view own profile"
    on profiles for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on profiles for update
    using (auth.uid() = id);

-- Create test user if not exists
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
    'dd36bf89-b634-4b48-b781-84c09d599d24',  -- Test user ID
    'test@wedding.com',
    '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF',  -- Dummy hashed password
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
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
);

-- Function to check if user has premium access
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

-- Modify system templates policy to check premium status
drop policy if exists "Users can view all system templates" on system_table_templates;

create policy "Users can view appropriate templates"
    on system_table_templates
    for select
    using (
        case 
            when is_premium then has_premium_access()
            else auth.role() = 'authenticated'
        end
    );
