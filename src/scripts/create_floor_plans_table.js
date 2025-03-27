const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createFloorPlansTable() {
  console.log('Checking if floor_plans table exists...');

  try {
    // Check if the floor_plans table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('floor_plans')
      .select('id')
      .limit(1);

    if (tableCheckError && tableCheckError.code === '42P01') {
      console.log('Floor plans table does not exist. Creating it...');
      
      // Execute the SQL to create the table
      const { error: createTableError } = await supabase.rpc('exec_sql', {
        sql: `
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
        `
      });

      if (createTableError) {
        console.error('Error creating floor_plans table:', createTableError);
        return false;
      }

      console.log('Floor plans table created successfully');
      return true;
    } else if (tableCheckError) {
      console.error('Error checking if floor_plans table exists:', tableCheckError);
      return false;
    } else {
      console.log('Floor plans table already exists');
      return true;
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

async function createFloorPlansBucket() {
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
      console.log('Floor plans bucket does not exist. Creating it...');
      
      // Create the bucket
      const { error: createBucketError } = await supabase
        .storage
        .createBucket('floor_plans', { public: true });

      if (createBucketError) {
        console.error('Error creating floor_plans bucket:', createBucketError);
        return false;
      }

      console.log('Floor plans bucket created successfully');
      
      // Set up storage policy
      const { error: policyError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE POLICY storage_floor_plans_insert ON storage.objects
              FOR INSERT WITH CHECK (
                  bucket_id = 'floor_plans' AND
                  auth.role() = 'authenticated'
              );
          
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

      return true;
    } else {
      console.log('Floor plans bucket already exists');
      return true;
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

// Run the script
async function main() {
  const tableCreated = await createFloorPlansTable();
  const bucketCreated = await createFloorPlansBucket();
  
  if (tableCreated && bucketCreated) {
    console.log('Floor plans setup completed successfully');
  } else {
    console.error('Floor plans setup failed');
    process.exit(1);
  }
}

main();
