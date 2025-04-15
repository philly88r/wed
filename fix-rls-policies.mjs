import pg from 'pg';
const { Pool } = pg;

// Use the direct PostgreSQL connection string from your memory
const connectionString = 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres';

async function fixRLSPolicies() {
  const pool = new Pool({
    connectionString,
  });

  try {
    console.log('Fixing RLS policies for seating_tables and table_chairs tables...');
    
    // Disable RLS on seating_tables
    await pool.query(`
      ALTER TABLE public.seating_tables DISABLE ROW LEVEL SECURITY;
    `);
    console.log('Disabled RLS on seating_tables');
    
    // Disable RLS on table_chairs
    await pool.query(`
      ALTER TABLE public.table_chairs DISABLE ROW LEVEL SECURITY;
    `);
    console.log('Disabled RLS on table_chairs');
    
    // Drop existing policies on seating_tables if they exist
    await pool.query(`
      DROP POLICY IF EXISTS allow_all_seating_tables ON public.seating_tables;
    `);
    
    // Create permissive policy for seating_tables
    await pool.query(`
      CREATE POLICY allow_all_seating_tables ON public.seating_tables
      USING (true)
      WITH CHECK (true);
    `);
    console.log('Created permissive policy for seating_tables');
    
    // Drop existing policies on table_chairs if they exist
    await pool.query(`
      DROP POLICY IF EXISTS allow_all_table_chairs ON public.table_chairs;
    `);
    
    // Create permissive policy for table_chairs
    await pool.query(`
      CREATE POLICY allow_all_table_chairs ON public.table_chairs
      USING (true)
      WITH CHECK (true);
    `);
    console.log('Created permissive policy for table_chairs');
    
    console.log('RLS policies have been fixed successfully!');

  } catch (error) {
    console.error('Error fixing RLS policies:', error);
  } finally {
    await pool.end();
  }
}

fixRLSPolicies();
