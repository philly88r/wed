import pkg from 'pg';
const { Pool } = pkg;

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkVendorCredentials() {
  const client = await pool.connect();
  
  try {
    console.log('Checking vendor credentials in the database...');
    
    // Check if the username exists
    const usernameResult = await client.query(`
      SELECT id, name, username, password_hash IS NOT NULL AS has_password
      FROM vendors
      WHERE username IN ('purslane_catering', 'rev_annie')
    `);
    
    if (usernameResult.rows.length === 0) {
      console.log('No vendors found with the specified usernames.');
    } else {
      console.log('Found vendors with the specified usernames:');
      usernameResult.rows.forEach(row => {
        console.log(`- ${row.name} (ID: ${row.id})`);
        console.log(`  Username: ${row.username}`);
        console.log(`  Has password hash: ${row.has_password}`);
      });
    }
    
    // Check if the verify_password function exists
    const functionResult = await client.query(`
      SELECT proname, proargtypes
      FROM pg_proc
      WHERE proname = 'verify_password'
    `);
    
    if (functionResult.rows.length === 0) {
      console.log('\nThe verify_password function does not exist in the database.');
    } else {
      console.log('\nThe verify_password function exists in the database.');
    }
    
    // Check if pgcrypto extension is installed
    const extensionResult = await client.query(`
      SELECT extname
      FROM pg_extension
      WHERE extname = 'pgcrypto'
    `);
    
    if (extensionResult.rows.length === 0) {
      console.log('\nThe pgcrypto extension is not installed.');
    } else {
      console.log('\nThe pgcrypto extension is installed.');
    }
    
  } catch (error) {
    console.error('Error checking vendor credentials:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkVendorCredentials();
