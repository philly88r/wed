import pkg from 'pg';
import fs from 'fs';
const { Pool } = pkg;

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function executeDropTables() {
  const client = await pool.connect();
  
  try {
    console.log('Reading SQL file...');
    const sql = fs.readFileSync('./supabase/migrations/20250323_drop_unused_vendor_tables.sql', 'utf8');
    
    console.log('Executing SQL to drop unused vendor tables...');
    await client.query(sql);
    
    console.log('Successfully dropped the following tables:');
    console.log('- vendor_access');
    console.log('- vendor_auth');
    console.log('- vendor_availability');
    console.log('- vendor_images');
    console.log('- vendor_locations');
    console.log('- vendor_reviews');
    console.log('- vendor_services');
    console.log('- vendor_tags');
    
    // Verify tables were dropped
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
        AND table_name IN (
          'vendor_access', 
          'vendor_auth', 
          'vendor_availability', 
          'vendor_images', 
          'vendor_locations', 
          'vendor_reviews', 
          'vendor_services', 
          'vendor_tags'
        )
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('\nWARNING: Some tables could not be dropped:');
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    } else {
      console.log('\nAll tables were successfully dropped.');
    }
    
  } catch (error) {
    console.error('Error executing SQL:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

executeDropTables();
