-- Create floor_plans table
CREATE TABLE IF NOT EXISTS public.floor_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    imageUrl TEXT NOT NULL,
    scale FLOAT NOT NULL DEFAULT 1,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.floor_plans ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own floor plans
CREATE POLICY select_floor_plans ON public.floor_plans
    FOR SELECT USING (auth.uid() = created_by);

-- Create policy to allow users to insert their own floor plans
CREATE POLICY insert_floor_plans ON public.floor_plans
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Create policy to allow users to update their own floor plans
CREATE POLICY update_floor_plans ON public.floor_plans
    FOR UPDATE USING (auth.uid() = created_by);

-- Create policy to allow users to delete their own floor plans
CREATE POLICY delete_floor_plans ON public.floor_plans
    FOR DELETE USING (auth.uid() = created_by);

-- Create storage bucket for floor plans if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('floor_plans', 'floor_plans', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy to allow authenticated users to upload files
CREATE POLICY storage_floor_plans_insert ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'floor_plans' AND
        auth.role() = 'authenticated'
    );

-- Set up storage policy to allow users to read their own files
CREATE POLICY storage_floor_plans_select ON storage.objects
    FOR SELECT USING (
        bucket_id = 'floor_plans' AND
        (auth.uid() = owner OR owner IS NULL)
    );
