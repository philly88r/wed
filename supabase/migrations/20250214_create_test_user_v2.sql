-- Create test user with email/password
INSERT INTO auth.users (
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
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'test-user-id',
    'test@example.com',
    crypt('password123', gen_salt('bf')), -- This will properly hash the password
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Create corresponding profile
INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    created_at,
    updated_at
) VALUES (
    'test-user-id',
    'test@example.com',
    'Test',
    'User',
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;
