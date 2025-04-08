import pg from 'pg';
const { Pool } = pg;

// Use the direct PostgreSQL connection string from your memory
const connectionString = 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres';

async function checkRLSStatus() {
  const pool = new Pool({
    connectionString,
  });

  try {
    console.log('Checking RLS status for seating_tables and table_chairs tables...');
    
    // Check if RLS is enabled on seating_tables
    const tablesResult = await pool.query(`
      SELECT rls_enabled 
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'seating_tables'
    `);
    
    const tablesRLSEnabled = tablesResult.rows[0]?.rls_enabled;
    console.log(`RLS on seating_tables: ${tablesRLSEnabled ? 'ENABLED' : 'DISABLED'}`);
    
    // Check if RLS is enabled on table_chairs
    const chairsResult = await pool.query(`
      SELECT rls_enabled 
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'table_chairs'
    `);
    
    const chairsRLSEnabled = chairsResult.rows[0]?.rls_enabled;
    console.log(`RLS on table_chairs: ${chairsRLSEnabled ? 'ENABLED' : 'DISABLED'}`);

    // Check policies on seating_tables
    const tablesPoliciesResult = await pool.query(`
      SELECT policyname, permissive, cmd, qual
      FROM pg_policies
      WHERE tablename = 'seating_tables'
    `);
    
    console.log('\nPolicies on seating_tables:');
    if (tablesPoliciesResult.rows.length === 0) {
      console.log('No policies found');
    } else {
      tablesPoliciesResult.rows.forEach(policy => {
        console.log(`- ${policy.policyname}: ${policy.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'}, ${policy.cmd}, ${policy.qual}`);
      });
    }

    // Check policies on table_chairs
    const chairsPoliciesResult = await pool.query(`
      SELECT policyname, permissive, cmd, qual
      FROM pg_policies
      WHERE tablename = 'table_chairs'
    `);
    
    console.log('\nPolicies on table_chairs:');
    if (chairsPoliciesResult.rows.length === 0) {
      console.log('No policies found');
    } else {
      chairsPoliciesResult.rows.forEach(policy => {
        console.log(`- ${policy.policyname}: ${policy.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'}, ${policy.cmd}, ${policy.qual}`);
      });
    }

  } catch (error) {
    console.error('Error checking RLS status:', error);
  } finally {
    await pool.end();
  }
}

checkRLSStatus();
