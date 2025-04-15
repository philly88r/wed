import pg from 'pg';
const { Client } = pg;

async function getVendorCredentials() {
  // Database connection configuration
  const client = new Client({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres'
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Query to get vendor credentials including passwords
    // Note: In a real system, passwords should be hashed and not directly retrievable
    const query = `
      SELECT 
        v.id, 
        v.name, 
        v.username, 
        v.password_hash,
        v.location,
        v.category_id,
        vc.name as category_name
      FROM 
        vendors v
      LEFT JOIN 
        vendor_categories vc ON v.category_id = vc.id
      WHERE 
        v.username IS NOT NULL
      ORDER BY 
        v.name;
    `;

    // Execute the query
    const result = await client.query(query);
    
    console.log('Vendor Credentials:');
    console.log('===================');
    
    // Format and display the results
    result.rows.forEach(vendor => {
      console.log(`ID: ${vendor.id}`);
      console.log(`Name: ${vendor.name}`);
      console.log(`Username: ${vendor.username}`);
      console.log(`Password Hash: ${vendor.password_hash || 'N/A'}`);
      console.log(`Category: ${vendor.category_name || 'N/A'}`);
      console.log(`Location: ${vendor.location || 'N/A'}`);
      console.log(`Login URL: ${process.env.VITE_APP_URL || 'http://localhost:3000'}/vendor/login`);
      console.log('-------------------');
    });

    console.log(`Total vendors with credentials: ${result.rows.length}`);
    
    // Check if there's a vendor_access table with temporary passwords
    try {
      const accessQuery = `
        SELECT 
          va.vendor_id,
          v.name,
          va.access_token,
          va.password_hash,
          va.expires_at
        FROM 
          vendor_access va
        JOIN
          vendors v ON va.vendor_id = v.id
        WHERE
          va.expires_at > NOW()
        ORDER BY
          va.expires_at DESC;
      `;
      
      const accessResult = await client.query(accessQuery);
      
      if (accessResult.rows.length > 0) {
        console.log('\nTemporary Access Credentials:');
        console.log('============================');
        
        accessResult.rows.forEach(access => {
          console.log(`Vendor ID: ${access.vendor_id}`);
          console.log(`Vendor Name: ${access.name}`);
          console.log(`Access Token: ${access.access_token}`);
          console.log(`Password Hash: ${access.password_hash}`);
          console.log(`Expires At: ${access.expires_at}`);
          console.log(`Login URL: ${process.env.VITE_APP_URL || 'http://localhost:3000'}/vendor/login/${access.access_token}`);
          console.log('-------------------');
        });
        
        console.log(`Total temporary access credentials: ${accessResult.rows.length}`);
      }
    } catch (accessError) {
      console.log('No vendor_access table found or error retrieving temporary credentials');
    }
    
  } catch (error) {
    console.error('Error retrieving vendor credentials:', error);
  } finally {
    // Close the database connection
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the function
getVendorCredentials();
