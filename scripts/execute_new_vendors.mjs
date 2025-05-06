import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function executeSQL() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    try {
      console.log('Executing SQL commands...');
      await client.query('BEGIN');
      
      // Execute each SQL file in sequence
      const sqlFiles = [
        'add_photographers.sql',
        'add_rentals.sql',
        'add_florals.sql',
        'add_styling.sql',
        'add_venues.sql',
        'add_credentials.sql'
      ];
      
      for (const file of sqlFiles) {
        console.log(`Processing ${file}...`);
        const sqlFilePath = path.join(__dirname, file);
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        await client.query(sqlContent);
      }
      
      await client.query('COMMIT');
      console.log('✅ Successfully added all new vendors to the database!');
      
      // Count the added vendors
      const { rows } = await client.query(`
        SELECT category_id, COUNT(*) as count
        FROM vendors
        WHERE created_at > NOW() - INTERVAL '10 minutes'
        GROUP BY category_id
      `);
      
      console.log('\nVendors added:');
      for (const row of rows) {
        const categoryName = await getCategoryName(client, row.category_id);
        console.log(`- ${categoryName}: ${row.count} vendors`);
      }
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error executing SQL:', error.message);
      console.error('Transaction rolled back');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

async function getCategoryName(client, categoryId) {
  try {
    const { rows } = await client.query('SELECT name FROM vendor_categories WHERE id = $1', [categoryId]);
    return rows.length > 0 ? rows[0].name : 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}

executeSQL();
