-- Drop existing tables if they exist
drop table if exists guests cascade;
drop table if exists table_instances cascade;
drop table if exists seating_layouts cascade;
drop table if exists table_templates cascade;
drop table if exists venues cascade;
drop table if exists profiles cascade;
drop table if exists system_table_templates cascade;

-- 1. Create all base tables
\echo 'Creating base tables...'
\ir create_tables_first.sql

-- 2. Add RLS policies
\echo 'Adding RLS policies...'
\ir add_rls_policies.sql

-- 3. Create system templates table and functions
\echo 'Creating system templates...'
\ir create_system_templates.sql

-- 4. Create profiles and test user
\echo 'Creating profiles and test user...'
\ir create_profiles.sql

-- Verify setup
\echo 'Verifying setup...'
\dt
select count(*) from system_table_templates;
select count(*) from profiles where is_premium = true;
