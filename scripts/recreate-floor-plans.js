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

async function recreateFloorPlansTable() {
  const client = await pool.connect();
  
  try {
    console.log('Starting floor_plans table recreation...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Drop existing table if it exists
    console.log('Dropping existing floor_plans table if it exists...');
    await client.query(`
      DROP TABLE IF EXISTS public.floor_plans CASCADE;
    `);
    
    // Create the table with the correct column names
    console.log('Creating new floor_plans table...');
    await client.query(`
      CREATE TABLE public.floor_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        image_url TEXT NOT NULL,
        scale FLOAT NOT NULL DEFAULT 1,
        created_by UUID NOT NULL REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // Add RLS policies
    console.log('Adding RLS policies...');
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
    
    // Force Supabase to refresh its schema cache
    console.log('Refreshing schema cache...');
    await client.query(`
      NOTIFY pgrst, 'reload schema';
    `);
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Verify the table and column exist
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'floor_plans'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('floor_plans table exists, checking columns...');
      
      const columnCheck = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'floor_plans';
      `);
      
      console.log('Columns in floor_plans table:');
      columnCheck.rows.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`);
      });
      
      const imageUrlCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'floor_plans' 
          AND column_name = 'image_url'
        );
      `);
      
      if (imageUrlCheck.rows[0].exists) {
        console.log('VERIFICATION: image_url column exists in floor_plans table.');
      } else {
        console.log('WARNING: image_url column still does not exist in floor_plans table!');
      }
    } else {
      console.log('WARNING: floor_plans table does not exist after creation!');
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
    
    console.log('Floor plans table recreation completed!');
    
  } catch (err) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error recreating floor_plans table:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the recreation script
recreateFloorPlansTable().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
