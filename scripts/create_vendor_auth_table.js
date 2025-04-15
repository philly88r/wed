import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

async function createVendorAuthTable() {
  // Database connection configuration
  const client = new Client({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres'
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // First, check if vendor_auth table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'vendor_auth'
      );
    `;
    
    const tableResult = await client.query(checkTableQuery);
    const tableExists = tableResult.rows[0].exists;
    
    if (!tableExists) {
      console.log('Creating vendor_auth table...');
      
      // Create the vendor_auth table
      const createTableQuery = `
        CREATE TABLE vendor_auth (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          vendor_id UUID NOT NULL REFERENCES vendors(id),
          username VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Create index for faster lookups
        CREATE INDEX vendor_auth_username_idx ON vendor_auth(username);
        CREATE INDEX vendor_auth_vendor_id_idx ON vendor_auth(vendor_id);
      `;
      
      await client.query(createTableQuery);
      console.log('vendor_auth table created successfully');
      
      // Read credentials from CSV file
      console.log('Reading credentials from CSV file...');
      const csvFilePath = path.resolve('vendor_credentials.csv');
      const csvData = fs.readFileSync(csvFilePath, 'utf8');
      const records = parse(csvData, { columns: true, skip_empty_lines: true });
      
      // Insert credentials into vendor_auth table
      console.log(`Found ${records.length} credentials in CSV file`);
      
      let insertedCount = 0;
      for (const record of records) {
        // Hash the password
        const hashPasswordQuery = `SELECT hash_password($1) as hashed_password;`;
        const hashResult = await client.query(hashPasswordQuery, [record.password]);
        const passwordHash = hashResult.rows[0].hashed_password;
        
        // Insert into vendor_auth table
        const insertQuery = `
          INSERT INTO vendor_auth (vendor_id, username, password_hash)
          VALUES ($1, $2, $3)
          ON CONFLICT (username) DO NOTHING
          RETURNING id;
        `;
        
        const insertResult = await client.query(insertQuery, [
          record.vendor_id,
          record.username,
          passwordHash
        ]);
        
        if (insertResult.rows.length > 0) {
          insertedCount++;
        }
      }
      
      console.log(`Inserted ${insertedCount} credentials into vendor_auth table`);
    } else {
      console.log('vendor_auth table already exists');
    }
    
    // Drop and recreate the authenticate_vendor function
    console.log('Updating authenticate_vendor function...');
    
    // First drop the existing function
    const dropFunctionQuery = `
      DROP FUNCTION IF EXISTS authenticate_vendor(text, text);
    `;
    
    await client.query(dropFunctionQuery);
    
    // Create the new function
    const createFunctionQuery = `
      CREATE OR REPLACE FUNCTION authenticate_vendor(
        input_username TEXT,
        input_password TEXT
      ) RETURNS TABLE (
        vendor_id UUID,
        auth_id UUID,
        is_valid BOOLEAN
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT
          va.vendor_id,
          va.id as auth_id,
          va.password_hash = crypt(input_password, va.password_hash) as is_valid  
        FROM vendor_auth va
        WHERE va.username = input_username
        AND va.is_active = true;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    await client.query(createFunctionQuery);
    console.log('authenticate_vendor function updated successfully');
    
    // Test the function with a vendor from the CSV file
    console.log('\nTesting authenticate_vendor function with a sample vendor...');
    
    // Get a sample vendor from the vendor_auth table
    const sampleVendorQuery = `
      SELECT vendor_id, username 
      FROM vendor_auth 
      LIMIT 1;
    `;
    
    const sampleVendorResult = await client.query(sampleVendorQuery);
    
    if (sampleVendorResult.rows.length > 0) {
      const sampleVendor = sampleVendorResult.rows[0];
      
      // Get vendor name
      const vendorNameQuery = `
        SELECT name FROM vendors WHERE id = $1;
      `;
      
      const nameResult = await client.query(vendorNameQuery, [sampleVendor.vendor_id]);
      const vendorName = nameResult.rows[0]?.name || 'Unknown';
      
      console.log(`Sample vendor: ${vendorName} (${sampleVendor.username})`);
      
      // Look up the password from the CSV file
      const csvFilePath = path.resolve('vendor_credentials.csv');
      const csvData = fs.readFileSync(csvFilePath, 'utf8');
      const records = parse(csvData, { columns: true, skip_empty_lines: true });
      
      const vendorRecord = records.find(r => r.vendor_id === sampleVendor.vendor_id);
      
      if (vendorRecord) {
        console.log(`Found password in CSV: ${vendorRecord.password}`);
        
        // Test authentication
        const testAuthQuery = `
          SELECT * FROM authenticate_vendor($1, $2);
        `;
        
        const testResult = await client.query(testAuthQuery, [
          sampleVendor.username,
          vendorRecord.password
        ]);
        
        console.log('Authentication test result:');
        console.log(testResult.rows);
        
        if (testResult.rows.length > 0 && testResult.rows[0].is_valid) {
          console.log('Authentication successful!');
          console.log(`\nVendors can now log in at http://localhost:3000/vendor/login`);
          console.log('Use the username and password from the vendor_credentials.csv file');
        } else {
          console.log('Authentication failed. Check the password in the CSV file.');
        }
      } else {
        console.log('Could not find password in CSV file');
      }
    } else {
      console.log('No vendors found in vendor_auth table');
    }
    
  } catch (error) {
    console.error('Error creating vendor auth table:', error);
  } finally {
    // Close the database connection
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the function
createVendorAuthTable();
