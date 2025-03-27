import pg from 'pg';
const { Pool } = pg;

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.kdhwrlhzevzekoanusbs.supabase.co:5432/postgres'
});

async function checkVendorSlugs() {
  const client = await pool.connect();
  
  try {
    // Query to get all vendor slugs
    const result = await client.query(`
      SELECT id, name, slug FROM vendors
    `);
    
    console.log('Vendor slugs in the database:');
    console.log('----------------------------');
    
    if (result.rows.length === 0) {
      console.log('No vendors found in the database.');
    } else {
      result.rows.forEach(vendor => {
        console.log(`ID: ${vendor.id}, Name: ${vendor.name}, Slug: ${vendor.slug}`);
      });
    }
  } catch (error) {
    console.error('Error checking vendor slugs:', error);
  } finally {
    // Release the client back to the pool
    client.release();
    pool.end();
  }
}

checkVendorSlugs();
