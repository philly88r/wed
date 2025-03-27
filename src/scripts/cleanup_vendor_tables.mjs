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

async function cleanupVendorTables() {
  const client = await pool.connect();
  
  try {
    console.log('Analyzing database tables...');
    
    // Get all tables in the database
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const allTables = tablesResult.rows.map(row => row.table_name);
    console.log(`Found ${allTables.length} tables in the database:`);
    console.log(allTables);
    
    // Tables we know we're using
    const essentialTables = [
      'vendors',
      'vendor_categories',
      'users',
      'couples',
      'guests',
      'weddings'
      // Add any other tables you know are essential
    ];
    
    // Find vendor-related tables that are not in the essential list
    const vendorRelatedTables = allTables.filter(table => 
      (table.includes('vendor') || table.includes('auth')) && 
      !essentialTables.includes(table)
    );
    
    console.log(`\nFound ${vendorRelatedTables.length} potentially unused vendor-related tables:`);
    console.log(vendorRelatedTables);
    
    // Generate SQL to drop these tables
    if (vendorRelatedTables.length > 0) {
      const dropSql = vendorRelatedTables.map(table => `DROP TABLE IF EXISTS ${table} CASCADE;`).join('\n');
      
      // Save the SQL to a file
      fs.writeFileSync(
        './supabase/migrations/20250323_drop_unused_vendor_tables.sql', 
        `-- Auto-generated script to drop unused vendor-related tables\n\n${dropSql}\n`
      );
      
      console.log('\nGenerated SQL to drop unused tables:');
      console.log(dropSql);
      console.log('\nSQL saved to ./supabase/migrations/20250323_drop_unused_vendor_tables.sql');
      
      // Ask for confirmation before executing
      console.log('\nWARNING: This will permanently delete data. Review the SQL file before executing it.');
      console.log('To execute this SQL, run the following command:');
      console.log('psql "postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres" -f ./supabase/migrations/20250323_drop_unused_vendor_tables.sql');
    } else {
      console.log('\nNo unused vendor-related tables found.');
    }
    
  } catch (error) {
    console.error('Error analyzing database tables:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanupVendorTables();
