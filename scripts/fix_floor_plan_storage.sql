-- Fix Floor Plan Storage Permissions
-- This script fixes the Supabase storage bucket permissions for venue floor plans

-- Check if the venue-floor-plans bucket exists and create it if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'venue-floor-plans') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('venue-floor-plans', 'venue-floor-plans', true, 10485760, '{image/jpeg,image/png,image/gif}');
        RAISE NOTICE 'Created venue-floor-plans bucket with 10MB file size limit';
    ELSE
        UPDATE storage.buckets
        SET 
            public = true,
            file_size_limit = 10485760, -- 10MB
            allowed_mime_types = '{image/jpeg,image/png,image/gif}'
        WHERE name = 'venue-floor-plans';
        RAISE NOTICE 'Updated venue-floor-plans bucket with 10MB file size limit';
    END IF;
END $$;

-- Create or update storage policies for venue-floor-plans bucket

-- 1. Allow uploads for authenticated users
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.policies WHERE bucket_id = 'venue-floor-plans' AND name = 'Allow uploads for authenticated users') THEN
        INSERT INTO storage.policies (name, bucket_id, operation, definition)
        VALUES (
            'Allow uploads for authenticated users',
            'venue-floor-plans',
            'INSERT',
            '(auth.uid() IS NOT NULL)'
        );
        RAISE NOTICE 'Created upload policy for authenticated users';
    ELSE
        UPDATE storage.policies
        SET definition = '(auth.uid() IS NOT NULL)'
        WHERE bucket_id = 'venue-floor-plans' AND name = 'Allow uploads for authenticated users';
        RAISE NOTICE 'Updated upload policy for authenticated users';
    END IF;
END $$;

-- 2. Allow viewing for authenticated users
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.policies WHERE bucket_id = 'venue-floor-plans' AND name = 'Allow viewing for authenticated users') THEN
        INSERT INTO storage.policies (name, bucket_id, operation, definition)
        VALUES (
            'Allow viewing for authenticated users',
            'venue-floor-plans',
            'SELECT',
            '(auth.uid() IS NOT NULL)'
        );
        RAISE NOTICE 'Created view policy for authenticated users';
    ELSE
        UPDATE storage.policies
        SET definition = '(auth.uid() IS NOT NULL)'
        WHERE bucket_id = 'venue-floor-plans' AND name = 'Allow viewing for authenticated users';
        RAISE NOTICE 'Updated view policy for authenticated users';
    END IF;
END $$;

-- 3. Allow public access
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.policies WHERE bucket_id = 'venue-floor-plans' AND name = 'Allow public access') THEN
        INSERT INTO storage.policies (name, bucket_id, operation, definition)
        VALUES (
            'Allow public access',
            'venue-floor-plans',
            'SELECT',
            '(bucket_id = ''venue-floor-plans'')'
        );
        RAISE NOTICE 'Created public access policy';
    ELSE
        UPDATE storage.policies
        SET definition = '(bucket_id = ''venue-floor-plans'')'
        WHERE bucket_id = 'venue-floor-plans' AND name = 'Allow public access';
        RAISE NOTICE 'Updated public access policy';
    END IF;
END $$;

-- 4. Allow updates for authenticated users
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.policies WHERE bucket_id = 'venue-floor-plans' AND name = 'Allow updates for authenticated users') THEN
        INSERT INTO storage.policies (name, bucket_id, operation, definition)
        VALUES (
            'Allow updates for authenticated users',
            'venue-floor-plans',
            'UPDATE',
            '(auth.uid() IS NOT NULL)'
        );
        RAISE NOTICE 'Created update policy for authenticated users';
    ELSE
        UPDATE storage.policies
        SET definition = '(auth.uid() IS NOT NULL)'
        WHERE bucket_id = 'venue-floor-plans' AND name = 'Allow updates for authenticated users';
        RAISE NOTICE 'Updated update policy for authenticated users';
    END IF;
END $$;

-- 5. Allow deletes for authenticated users
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.policies WHERE bucket_id = 'venue-floor-plans' AND name = 'Allow deletes for authenticated users') THEN
        INSERT INTO storage.policies (name, bucket_id, operation, definition)
        VALUES (
            'Allow deletes for authenticated users',
            'venue-floor-plans',
            'DELETE',
            '(auth.uid() IS NOT NULL)'
        );
        RAISE NOTICE 'Created delete policy for authenticated users';
    ELSE
        UPDATE storage.policies
        SET definition = '(auth.uid() IS NOT NULL)'
        WHERE bucket_id = 'venue-floor-plans' AND name = 'Allow deletes for authenticated users';
        RAISE NOTICE 'Updated delete policy for authenticated users';
    END IF;
END $$;

-- Create a function to directly update a room's floor plan URL
CREATE OR REPLACE FUNCTION public.update_room_floor_plan(
    room_id UUID,
    floor_plan_url TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE venue_rooms
    SET 
        floor_plan_url = floor_plan_url,
        updated_at = NOW()
    WHERE id = room_id;
    
    RETURN FOUND;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.update_room_floor_plan TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_room_floor_plan TO service_role;

-- List all venue rooms for reference
SELECT 
    r.id AS room_id, 
    r.name AS room_name, 
    v.id AS venue_id, 
    v.name AS venue_name,
    r.floor_plan_url
FROM 
    venue_rooms r
JOIN 
    venues v ON r.venue_id = v.id
ORDER BY 
    v.name, r.name;
