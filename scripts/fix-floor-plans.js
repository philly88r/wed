import pg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection configuration
const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.kdhwrlhzevzekoanusbs.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function fixFloorPlansTable() {
  const client = await pool.connect();
  
  try {
    console.log('Starting floor_plans table fix...');
    
    // First check if the table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'floor_plans'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('floor_plans table does not exist, creating it...');
      
      // Create the table with the correct column names
      await client.query(`
        CREATE TABLE public.floor_plans (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          image_url TEXT,
          scale FLOAT NOT NULL DEFAULT 1,
          created_by UUID NOT NULL REFERENCES auth.users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      
      // Add RLS policies
      await client.query(`
        ALTER TABLE public.floor_plans ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY select_floor_plans ON public.floor_plans
          FOR SELECT USING (auth.uid() = created_by);
        
        CREATE POLICY insert_floor_plans ON public.floor_plans
          FOR INSERT WITH CHECK (auth.uid() = created_by);
        
        CREATE POLICY update_floor_plans ON public.floor_plans
          FOR UPDATE USING (auth.uid() = created_by);
        
        CREATE POLICY delete_floor_plans ON public.floor_plans
          FOR DELETE USING (auth.uid() = created_by);
      `);
      
      console.log('floor_plans table created successfully!');
    } else {
      console.log('floor_plans table exists, checking columns...');
      
      // Check for both possible column names
      const imageUrlCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'floor_plans' 
        AND column_name IN ('imageUrl', 'image_url');
      `);
      
      if (imageUrlCheck.rows.length === 0) {
        console.log('Neither imageUrl nor image_url column exists. Adding image_url column...');
        await client.query(`
          ALTER TABLE public.floor_plans 
          ADD COLUMN image_url TEXT;
        `);
        console.log('image_url column added successfully!');
      } else if (imageUrlCheck.rows[0].column_name === 'imageUrl') {
        console.log('Found imageUrl column, renaming to image_url...');
        await client.query(`
          ALTER TABLE public.floor_plans 
          RENAME COLUMN "imageUrl" TO "image_url";
        `);
        console.log('Column renamed successfully!');
      } else {
        console.log('image_url column already exists, no changes needed.');
      }
      
      // Force Supabase to refresh its schema cache
      try {
        console.log('Attempting to refresh schema cache...');
        await client.query(`
          NOTIFY pgrst, 'reload schema';
        `);
        console.log('Schema cache refresh notification sent.');
      } catch (err) {
        console.log('Note: Could not send schema refresh notification. This is normal if you do not have the necessary permissions.');
      }
    }
    
    // Verify the column exists
    const finalCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'floor_plans' 
        AND column_name = 'image_url'
      );
    `);
    
    if (finalCheck.rows[0].exists) {
      console.log('VERIFICATION: image_url column exists in floor_plans table.');
    } else {
      console.log('WARNING: image_url column still does not exist in floor_plans table!');
    }
    
    // Check if the storage bucket exists
    try {
      console.log('Ensuring floor_plans storage bucket exists...');
      await client.query(`
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('floor_plans', 'floor_plans', true)
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log('Storage bucket setup complete.');
    } catch (err) {
      console.log('Note: Storage bucket may already exist or require admin privileges.');
    }
    
    console.log('Floor plans table fix completed!');
    
  } catch (err) {
    console.error('Error fixing floor_plans table:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the fix
fixFloorPlansTable().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
