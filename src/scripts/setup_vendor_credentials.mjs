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
function generatePassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
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

async function setupVendorCredentials() {
  const client = await pool.connect();
  
  try {
    // First, run the migration to add the necessary columns and functions
    console.log('Running migration to add username and password columns...');
    const migrationSql = fs.readFileSync('./supabase/migrations/20250323_add_vendor_credentials.sql', 'utf8');
    await client.query(migrationSql);
    console.log('Migration completed successfully.');
    
    // Get all vendors from the database
    const vendorResult = await client.query(`
      SELECT id, name FROM vendors WHERE username IS NULL
    `);
    
    console.log(`Found ${vendorResult.rows.length} vendors without credentials.`);
    
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
      
      console.log(`Credentials generated for ${vendor.name}`);
    }
    
    credentialsFile.end();
    console.log('All vendor credentials have been set up and saved to vendor_credentials.csv');
    
  } catch (error) {
    console.error('Error setting up vendor credentials:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

setupVendorCredentials();
