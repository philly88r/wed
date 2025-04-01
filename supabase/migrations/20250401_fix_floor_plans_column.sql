-- Fix the floor_plans table column name to match the code
ALTER TABLE IF EXISTS public.floor_plans 
  RENAME COLUMN "imageUrl" TO "image_url";

-- If the table doesn't exist yet, create it with the correct column name
CREATE TABLE IF NOT EXISTS public.floor_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    scale FLOAT NOT NULL DEFAULT 1,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies if they don't exist
ALTER TABLE public.floor_plans ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own floor plans
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'select_floor_plans' AND tablename = 'floor_plans'
    ) THEN
        CREATE POLICY select_floor_plans ON public.floor_plans
            FOR SELECT USING (auth.uid() = created_by);
    END IF;
END
$$;

-- Create policy to allow users to insert their own floor plans
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'insert_floor_plans' AND tablename = 'floor_plans'
    ) THEN
        CREATE POLICY insert_floor_plans ON public.floor_plans
            FOR INSERT WITH CHECK (auth.uid() = created_by);
    END IF;
END
$$;

-- Create policy to allow users to update their own floor plans
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'update_floor_plans' AND tablename = 'floor_plans'
    ) THEN
        CREATE POLICY update_floor_plans ON public.floor_plans
            FOR UPDATE USING (auth.uid() = created_by);
    END IF;
END
$$;

-- Create policy to allow users to delete their own floor plans
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'delete_floor_plans' AND tablename = 'floor_plans'
    ) THEN
        CREATE POLICY delete_floor_plans ON public.floor_plans
            FOR DELETE USING (auth.uid() = created_by);
    END IF;
END
$$;

-- Create storage bucket for floor plans if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('floor_plans', 'floor_plans', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy to allow authenticated users to upload files
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'storage_floor_plans_insert' AND tablename = 'objects'
    ) THEN
        CREATE POLICY storage_floor_plans_insert ON storage.objects
            FOR INSERT WITH CHECK (
                bucket_id = 'floor_plans' AND
                auth.role() = 'authenticated'
            );
    END IF;
END
$$;

-- Set up storage policy to allow users to read their own files
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'storage_floor_plans_select' AND tablename = 'objects'
    ) THEN
        CREATE POLICY storage_floor_plans_select ON storage.objects
            FOR SELECT USING (
                bucket_id = 'floor_plans' AND
                (auth.uid() = owner OR owner IS NULL)
            );
    END IF;
END
$$;
