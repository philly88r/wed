import pg from 'pg';
const { Client } = pg;

async function checkVendorAuth() {
  // Database connection configuration
  const client = new Client({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres'
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Check if username and password_hash columns exist in vendors table
    const columnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'vendors' 
      AND column_name IN ('username', 'password_hash');
    `;
    
    const columnsResult = await client.query(columnsQuery);
    console.log('Columns in vendors table:');
    columnsResult.rows.forEach(row => {
      console.log(`- ${row.column_name}`);
    });
    
    // Check if the verify_password function exists
    const functionQuery = `
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_type = 'FUNCTION' 
      AND routine_name IN ('verify_password', 'hash_password');
    `;
    
    const functionResult = await client.query(functionQuery);
    console.log('\nFunctions in database:');
    functionResult.rows.forEach(row => {
      console.log(`- ${row.routine_name}`);
    });
    
    // Check if any RPC functions are registered for vendor authentication
    const rpcQuery = `
      SELECT p.proname 
      FROM pg_proc p 
      JOIN pg_namespace n ON p.pronamespace = n.oid 
      WHERE n.nspname = 'public' 
      AND p.proname LIKE '%vendor%' OR p.proname LIKE '%auth%';
    `;
    
    const rpcResult = await client.query(rpcQuery);
    console.log('\nPotential vendor auth RPC functions:');
    rpcResult.rows.forEach(row => {
      console.log(`- ${row.proname}`);
    });
    
    // Try to find the actual login function being used
    console.log('\nChecking for login-related functions:');
    
    const loginFunctionQuery = `
      SELECT p.proname, pg_get_functiondef(p.oid) as definition
      FROM pg_proc p 
      JOIN pg_namespace n ON p.pronamespace = n.oid 
      WHERE n.nspname = 'public' 
      AND (p.proname LIKE '%login%' OR p.proname LIKE '%authenticate%' OR p.proname LIKE '%vendor%');
    `;
    
    const loginFunctionResult = await client.query(loginFunctionQuery);
    console.log(`Found ${loginFunctionResult.rows.length} potential login functions`);
    loginFunctionResult.rows.forEach(row => {
      console.log(`\nFunction: ${row.proname}`);
      // Only print the first 200 characters of the definition to avoid overwhelming output
      console.log(`Definition preview: ${row.definition.substring(0, 200)}...`);
    });
    
  } catch (error) {
    console.error('Error checking vendor auth:', error);
  } finally {
    // Close the database connection
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the function
checkVendorAuth();
