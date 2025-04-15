// Import the Supabase client
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

// Initialize the Supabase client
const supabaseUrl = 'https://yemkduykvfdjmldxfphq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbWtkdXlrdmZkam1sZHhmcGhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMTM5NDMwMywiZXhwIjoyMDI2OTcwMzAzfQ.Kj7intGwgkLJRyK9yyPEW1CnJmXKBGPOYOQQP_YOJww'; // Service role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function createFloorPlansTable() {
  try {
    console.log('Creating floor_plans table...');
    
    // First, create the floor_plans table
    const { error: tableError } = await supabase
      .from('floor_plans')
      .insert([
        { 
          name: 'Test Floor Plan',
          imageUrl: 'https://example.com/test.jpg',
          scale: 1,
          created_by: '9d5b9d80-0349-47d1-878d-5bdae612c844' // Sample user ID
        }
      ])
      .select();

    if (tableError) {
      // If the table doesn't exist, create it using SQL
      if (tableError.code === '42P01') {
        console.log('Table does not exist. Creating SQL migration file...');
        
        // Create SQL migration file
        const sqlMigration = `
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
`;
        
        // Write SQL migration to file
        writeFileSync('../supabase/migrations/20250325_create_floor_plans_table.sql', sqlMigration);
        console.log('SQL migration file created. Please run this SQL in the Supabase dashboard SQL editor.');
      } else {
        console.error('Error creating floor_plans table:', tableError);
      }
      return;
    }

    console.log('Floor plans table created successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

createFloorPlansTable();
