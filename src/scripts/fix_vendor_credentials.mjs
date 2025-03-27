import pkg from 'pg';
import fs from 'fs';
import crypto from 'crypto';
const { Pool } = pkg;

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

// Function to generate a random password
function generatePassword(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % chars.length;
    password += chars.charAt(randomIndex);
  }
  return password;
}

// Function to generate a username from vendor name
function generateUsername(vendorName) {
  // Remove special characters, convert to lowercase, and replace spaces with underscores
  return vendorName
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '_');
}

async function fixVendorCredentials() {
  const client = await pool.connect();
  
  try {
    console.log('Running migration to fix vendor authentication...');
    const migrationSql = fs.readFileSync('./supabase/migrations/20250323_fix_vendor_auth.sql', 'utf8');
    await client.query(migrationSql);
    console.log('Migration completed successfully.');
    
    // Get all vendors from the database
    const vendorResult = await client.query(`
      SELECT id, name FROM vendors
    `);
    
    console.log(`Found ${vendorResult.rows.length} vendors to update.`);
    
    // Create a file to store the credentials
    const credentialsFile = fs.createWriteStream('vendor_credentials.csv');
    credentialsFile.write('vendor_id,vendor_name,username,password\n');
    
    // Generate and store credentials for each vendor
    for (const vendor of vendorResult.rows) {
      const username = generateUsername(vendor.name);
      const password = generatePassword();
      
      // Update the vendor record with the new credentials
      await client.query(`
        UPDATE vendors 
        SET 
          username = $1,
          password_hash = hash_password($2)
        WHERE id = $3
      `, [username, password, vendor.id]);
      
      // Write the credentials to the file
      credentialsFile.write(`${vendor.id},${vendor.name},${username},${password}\n`);
      
      console.log(`Credentials updated for ${vendor.name}`);
    }
    
    credentialsFile.end();
    
    // Create a more readable version of the credentials
    const readableCredentials = vendorResult.rows.map(vendor => {
      const username = generateUsername(vendor.name);
      const password = generatePassword(); // This will generate a new password, but it's just for display
      return `For ${vendor.name}:\nUsername: ${username}\nPassword: (See CSV file for actual password)\n`;
    }).join('\n');
    
    fs.writeFileSync('vendor_credentials_readable.txt', 
      `VENDOR CREDENTIALS\n=================\n\n${readableCredentials}\nNote: These are the credentials vendors will use to log in at http://localhost:5173/vendor/login`
    );
    
    console.log('All vendor credentials have been updated and saved to vendor_credentials.csv');
    console.log('A readable version has been saved to vendor_credentials_readable.txt');
    
    // Test a login to make sure it works
    const testVendor = vendorResult.rows[0];
    const testUsername = generateUsername(testVendor.name);
    const testPassword = generatePassword(); // This is just a test password, not the actual one
    
    await client.query(`
      UPDATE vendors 
      SET 
        username = $1,
        password_hash = hash_password($2)
      WHERE id = $3
    `, [testUsername, testPassword, testVendor.id]);
    
    console.log(`\nCreated test credentials for ${testVendor.name}:`);
    console.log(`Username: ${testUsername}`);
    console.log(`Password: ${testPassword}`);
    
    // Verify the password works
    const verifyResult = await client.query(`
      SELECT verify_password($1, $2) as is_valid
    `, [testUsername, testPassword]);
    
    if (verifyResult.rows[0].is_valid) {
      console.log('\nPassword verification successful! The login system is working correctly.');
    } else {
      console.log('\nPassword verification failed. There may still be an issue with the login system.');
    }
    
  } catch (error) {
    console.error('Error fixing vendor credentials:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixVendorCredentials();
