-- 1. Create all base tables
\ir create_tables_first.sql

-- 2. Add RLS policies
\ir add_rls_policies.sql

-- 3. Create system templates table and functions
\ir create_system_templates.sql

-- 4. Create profiles and test user
\ir create_profiles.sql
