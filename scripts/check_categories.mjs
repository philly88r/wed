import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkCategories() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    try {
      console.log('Fetching vendor categories...');
      const { rows } = await client.query('SELECT id, name FROM vendor_categories');
      
      console.log('\nAvailable vendor categories:');
      rows.forEach(row => {
        console.log(`- ${row.name}: ${row.id}`);
      });
      
    } catch (error) {
      console.error('❌ Error executing query:', error.message);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkCategories();
