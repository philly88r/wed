// Script to run the SQL fix for floor plan storage
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Use the direct PostgreSQL connection string
const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres'
});

async function main() {
  try {
    console.log('Reading SQL file...');
    const sqlPath = path.join(__dirname, 'fix_floor_plan_storage.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing SQL script...');
    const result = await pool.query(sql);
    
    console.log('SQL script executed successfully!');
    
    // The last query in the SQL file returns all venue rooms
    if (result && result.rows && result.rows.length > 0) {
      console.log('\nVenue Rooms:');
      result.rows.forEach(room => {
        console.log(`- Room ID: ${room.room_id}`);
        console.log(`  Name: ${room.room_name}`);
        console.log(`  Venue: ${room.venue_name}`);
        console.log(`  Floor Plan URL: ${room.floor_plan_url || 'None'}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Error executing SQL script:', error);
  } finally {
    await pool.end();
  }
}

main();
