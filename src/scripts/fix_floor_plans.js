import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Initialize environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixFloorPlansTable() {
  console.log('Checking if floor_plans table exists...');

  try {
    // Check if the table exists and has the correct columns
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'floor_plans' AND table_schema = 'public';
      `
    });

    if (columnsError) {
      console.error('Error checking floor_plans table columns:', columnsError);
      
      // Try to create the table from scratch
      console.log('Creating floor_plans table...');
      
      const { error: createTableError } = await supabase.rpc('exec_sql', {
        sql: `
          DROP TABLE IF EXISTS public.floor_plans;
          
          CREATE TABLE public.floor_plans (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            image_url TEXT NOT NULL,
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
        `
      });

      if (createTableError) {
        console.error('Error creating floor_plans table:', createTableError);
        return false;
      }

      console.log('Floor plans table created successfully');
      return true;
    }

    // If we get here, the table exists. Check if it has the correct columns
    const hasImageUrl = columns.some(col => col.column_name === 'imageurl');
    const hasImageUrlSnakeCase = columns.some(col => col.column_name === 'image_url');

    if (!hasImageUrl && !hasImageUrlSnakeCase) {
      console.log('Adding image_url column to floor_plans table...');
      
      const { error: alterTableError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE public.floor_plans 
          ADD COLUMN image_url TEXT NOT NULL DEFAULT '';
        `
      });

      if (alterTableError) {
        console.error('Error adding image_url column:', alterTableError);
        return false;
      }

      console.log('image_url column added successfully');
    } else if (hasImageUrl && !hasImageUrlSnakeCase) {
      console.log('Renaming imageurl column to image_url...');
      
      const { error: renameColumnError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE public.floor_plans 
          RENAME COLUMN imageurl TO image_url;
        `
      });

      if (renameColumnError) {
        console.error('Error renaming column:', renameColumnError);
        return false;
      }

      console.log('Column renamed successfully');
    } else {
      console.log('Floor plans table has the correct columns');
    }

    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

async function fixFloorPlansBucket() {
  console.log('Checking if floor_plans storage bucket exists...');

  try {
    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error('Error checking storage buckets:', bucketsError);
      return false;
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'floor_plans');

    if (!bucketExists) {
      console.log('Creating floor_plans bucket...');
      
      // Create the bucket with public access
      const { error: createBucketError } = await supabase.rpc('exec_sql', {
        sql: `
          INSERT INTO storage.buckets (id, name, public)
          VALUES ('floor_plans', 'floor_plans', true)
          ON CONFLICT (id) DO NOTHING;
        `
      });

      if (createBucketError) {
        console.error('Error creating floor_plans bucket:', createBucketError);
        return false;
      }

      // Set up storage policies
      const { error: policyError } = await supabase.rpc('exec_sql', {
        sql: `
          -- Set up storage policy to allow authenticated users to upload files
          CREATE POLICY storage_floor_plans_insert ON storage.objects
              FOR INSERT WITH CHECK (
                  bucket_id = 'floor_plans' AND
                  auth.role() = 'authenticated'
              );
          
          -- Set up storage policy to allow public access to files
          CREATE POLICY storage_floor_plans_select ON storage.objects
              FOR SELECT USING (
                  bucket_id = 'floor_plans'
              );
        `
      });

      if (policyError) {
        console.error('Error creating storage policies:', policyError);
        return false;
      }

      console.log('Floor plans bucket and policies created successfully');
      return true;
    } else {
      console.log('Floor plans bucket already exists');
      
      // Ensure policies are set correctly
      const { error: policyError } = await supabase.rpc('exec_sql', {
        sql: `
          -- Drop existing policies if they exist
          DROP POLICY IF EXISTS storage_floor_plans_insert ON storage.objects;
          DROP POLICY IF EXISTS storage_floor_plans_select ON storage.objects;
          
          -- Set up storage policy to allow authenticated users to upload files
          CREATE POLICY storage_floor_plans_insert ON storage.objects
              FOR INSERT WITH CHECK (
                  bucket_id = 'floor_plans' AND
                  auth.role() = 'authenticated'
              );
          
          -- Set up storage policy to allow public access to files
          CREATE POLICY storage_floor_plans_select ON storage.objects
              FOR SELECT USING (
                  bucket_id = 'floor_plans'
              );
        `
      });

      if (policyError) {
        console.error('Error updating storage policies:', policyError);
        return false;
      }
      
      return true;
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

// Run the script
async function main() {
  const tableFixed = await fixFloorPlansTable();
  const bucketFixed = await fixFloorPlansBucket();
  
  if (tableFixed && bucketFixed) {
    console.log('Floor plans setup fixed successfully');
  } else {
    console.error('Floor plans setup fix failed');
    process.exit(1);
  }
}

main();
