-- Drop the tables in the correct order (due to foreign key constraints)
DROP TABLE IF EXISTS public.guests CASCADE;
DROP TABLE IF EXISTS public.table_instances CASCADE;
DROP TABLE IF EXISTS public.table_templates CASCADE;

-- Drop any related types
DROP TYPE IF EXISTS room_type CASCADE;
