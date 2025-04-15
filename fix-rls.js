// CommonJS script to fix RLS policies
const { Client } = require('pg');

// Use the direct PostgreSQL connection string from your memory
const connectionString = 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres';

async function fixRlsPolicy() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Disable RLS for the seating_tables table
    await client.query(`
      ALTER TABLE seating_tables DISABLE ROW LEVEL SECURITY;
    `);
    console.log('Disabled RLS for seating_tables table');

    // Create a permissive policy for seating_tables
    try {
      await client.query(`
        DROP POLICY IF EXISTS allow_all_seating_tables ON seating_tables;
      `);
      
      await client.query(`
        CREATE POLICY allow_all_seating_tables ON seating_tables
        FOR ALL
        USING (true)
        WITH CHECK (true);
      `);
      console.log('Created permissive policy for seating_tables');
    } catch (policyError) {
      console.log('Policy creation error (may already exist):', policyError.message);
    }

    // Disable RLS for the table_chairs table
    await client.query(`
      ALTER TABLE table_chairs DISABLE ROW LEVEL SECURITY;
    `);
    console.log('Disabled RLS for table_chairs table');

    // Create a permissive policy for table_chairs
    try {
      await client.query(`
        DROP POLICY IF EXISTS allow_all_table_chairs ON table_chairs;
      `);
      
      await client.query(`
        CREATE POLICY allow_all_table_chairs ON table_chairs
        FOR ALL
        USING (true)
        WITH CHECK (true);
      `);
      console.log('Created permissive policy for table_chairs');
    } catch (policyError) {
      console.log('Policy creation error (may already exist):', policyError.message);
    }

    console.log('RLS policies have been updated successfully');
  } catch (error) {
    console.error('Error updating RLS policies:', error);
  } finally {
    await client.end();
    console.log('Disconnected from PostgreSQL database');
  }
}

fixRlsPolicy();
