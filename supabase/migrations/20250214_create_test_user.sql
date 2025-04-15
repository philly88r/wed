-- Create a test user
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
);

-- Add default templates for the test user
select add_default_templates_for_user('dd36bf89-b634-4b48-b781-84c09d599d24');
