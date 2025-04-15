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

async function applyMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration...');
    
    // Check if the floor_plans table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'floor_plans'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    
    if (tableExists) {
      console.log('floor_plans table exists, checking columns...');
      
      // Check if imageUrl column exists
      const imageUrlCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'floor_plans' 
          AND column_name = 'imageUrl'
        );
      `);
      
      if (imageUrlCheck.rows[0].exists) {
        console.log('Renaming imageUrl column to image_url...');
        await client.query(`
          ALTER TABLE public.floor_plans 
          RENAME COLUMN "imageUrl" TO "image_url";
        `);
        console.log('Column renamed successfully!');
      } else {
        // Check if image_url column exists
        const imageUrlCheck2 = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'floor_plans' 
            AND column_name = 'image_url'
          );
        `);
        
        if (imageUrlCheck2.rows[0].exists) {
          console.log('image_url column already exists, no changes needed.');
        } else {
          console.log('Neither imageUrl nor image_url column exists. Adding image_url column...');
          await client.query(`
            ALTER TABLE public.floor_plans 
            ADD COLUMN "image_url" TEXT;
          `);
          console.log('Column added successfully!');
        }
      }
    } else {
      console.log('floor_plans table does not exist, creating it...');
      
      // Create the floor_plans table with the correct column name
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
      `);
      
      console.log('floor_plans table created successfully!');
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
    
    console.log('Migration completed successfully!');
    
  } catch (err) {
    console.error('Error applying migration:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
applyMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
