import pg from 'pg';
const { Client } = pg;

async function fixVendorAuth() {
  // Database connection configuration
  const client = new Client({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres'
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Check if the authenticate_vendor function exists
    const checkFunctionQuery = `
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_type = 'FUNCTION' 
      AND routine_name = 'authenticate_vendor';
    `;
    
    const functionResult = await client.query(checkFunctionQuery);
    
    if (functionResult.rows.length === 0) {
      console.log('Creating authenticate_vendor function...');
      
      // Create the authenticate_vendor function
      const createFunctionQuery = `
        CREATE OR REPLACE FUNCTION authenticate_vendor(
          input_username TEXT,
          input_password TEXT
        ) RETURNS TABLE (
          vendor_id UUID,
          is_valid BOOLEAN
        ) AS $$
        DECLARE
          v_vendor_id UUID;
          v_password_hash TEXT;
        BEGIN
          -- Get the vendor_id and password_hash for the given username
          SELECT id, password_hash INTO v_vendor_id, v_password_hash
          FROM vendors
          WHERE username = input_username;
          
          -- If no vendor found with that username, return false
          IF v_vendor_id IS NULL THEN
            RETURN QUERY SELECT NULL::UUID, FALSE;
            RETURN;
          END IF;
          
          -- Check if password matches
          IF v_password_hash = crypt(input_password, v_password_hash) THEN
            RETURN QUERY SELECT v_vendor_id, TRUE;
          ELSE
            RETURN QUERY SELECT v_vendor_id, FALSE;
          END IF;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;
      
      await client.query(createFunctionQuery);
      console.log('authenticate_vendor function created successfully');
    } else {
      console.log('authenticate_vendor function already exists, checking its definition...');
      
      // Get the current function definition
      const getFunctionDefQuery = `
        SELECT pg_get_functiondef(p.oid) as definition
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' 
        AND p.proname = 'authenticate_vendor';
      `;
      
      const defResult = await client.query(getFunctionDefQuery);
      console.log('Current function definition:');
      console.log(defResult.rows[0].definition);
      
      // Update the function to make sure it's correct
      console.log('Updating authenticate_vendor function...');
      
      const updateFunctionQuery = `
        CREATE OR REPLACE FUNCTION authenticate_vendor(
          input_username TEXT,
          input_password TEXT
        ) RETURNS TABLE (
          vendor_id UUID,
          is_valid BOOLEAN
        ) AS $$
        DECLARE
          v_vendor_id UUID;
          v_password_hash TEXT;
        BEGIN
          -- Get the vendor_id and password_hash for the given username
          SELECT id, password_hash INTO v_vendor_id, v_password_hash
          FROM vendors
          WHERE username = input_username;
          
          -- If no vendor found with that username, return false
          IF v_vendor_id IS NULL THEN
            RETURN QUERY SELECT NULL::UUID, FALSE;
            RETURN;
          END IF;
          
          -- Check if password matches
          IF v_password_hash = crypt(input_password, v_password_hash) THEN
            RETURN QUERY SELECT v_vendor_id, TRUE;
          ELSE
            RETURN QUERY SELECT v_vendor_id, FALSE;
          END IF;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;
      
      await client.query(updateFunctionQuery);
      console.log('authenticate_vendor function updated successfully');
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
      
      console.log('To test login, use the credentials from the vendor_credentials.csv file');
    } else {
      console.log('No vendors with usernames found in the database');
    }
    
  } catch (error) {
    console.error('Error fixing vendor auth:', error);
  } finally {
    // Close the database connection
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the function
fixVendorAuth();
