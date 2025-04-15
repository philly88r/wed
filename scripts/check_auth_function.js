import pg from 'pg';
const { Client } = pg;

async function checkAuthFunction() {
  // Database connection configuration
  const client = new Client({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres'
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Get the complete function definition
    const getFunctionDefQuery = `
      SELECT pg_get_functiondef(p.oid) as definition
      FROM pg_proc p 
      JOIN pg_namespace n ON p.pronamespace = n.oid 
      WHERE n.nspname = 'public' 
      AND p.proname = 'authenticate_vendor';
    `;
    
    const defResult = await client.query(getFunctionDefQuery);
    
    if (defResult.rows.length > 0) {
      console.log('authenticate_vendor function definition:');
      console.log(defResult.rows[0].definition);
    } else {
      console.log('authenticate_vendor function not found');
    }
    
    // Test the function with a vendor from the CSV file
    console.log('\nTesting authenticate_vendor function with a sample vendor...');
    
    // Get a sample vendor from the vendors table
    const sampleVendorQuery = `
      SELECT id, name, username 
      FROM vendors 
      WHERE username IS NOT NULL 
      LIMIT 1;
    `;
    
    const sampleVendorResult = await client.query(sampleVendorQuery);
    
    if (sampleVendorResult.rows.length > 0) {
      const sampleVendor = sampleVendorResult.rows[0];
      console.log(`Sample vendor: ${sampleVendor.name} (${sampleVendor.username})`);
      
      // Look up the password from the CSV data
      const passwordQuery = `
        SELECT password_hash
        FROM vendors
        WHERE id = $1;
      `;
      
      const passwordResult = await client.query(passwordQuery, [sampleVendor.id]);
      
      if (passwordResult.rows.length > 0) {
        console.log(`Password hash exists in database: ${passwordResult.rows[0].password_hash ? 'Yes' : 'No'}`);
      }
      
      // Try to call the function directly
      try {
        const testAuthQuery = `
          SELECT * FROM authenticate_vendor($1, 'test_password');
        `;
        
        const testResult = await client.query(testAuthQuery, [sampleVendor.username]);
        console.log('Function test result:');
        console.log(testResult.rows);
      } catch (testError) {
        console.error('Error testing function:', testError.message);
      }
    } else {
      console.log('No vendors with usernames found in the database');
    }
    
  } catch (error) {
    console.error('Error checking auth function:', error);
  } finally {
    // Close the database connection
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the function
checkAuthFunction();
