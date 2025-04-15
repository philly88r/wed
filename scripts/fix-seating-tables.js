const { Client } = require('pg');

// Use the direct PostgreSQL connection string
const connectionString = 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres';

async function fixSeatingTables() {
  const client = new Client({
    connectionString,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    // Check if the length column already exists
    const checkLengthQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'seating_tables' 
      AND column_name = 'length';
    `;
    
    const lengthResult = await client.query(checkLengthQuery);
    
    if (lengthResult.rows.length === 0) {
      console.log('Length column does not exist. Adding it now...');
      
      // Add the length column if it doesn't exist
      const addLengthQuery = `
        ALTER TABLE seating_tables 
        ADD COLUMN length NUMERIC DEFAULT 100;
      `;
      
      await client.query(addLengthQuery);
      console.log('Successfully added length column to seating_tables table');
      
      // Update existing records to have a default value
      const updateLengthQuery = `
        UPDATE seating_tables 
        SET length = 100 
        WHERE length IS NULL;
      `;
      
      await client.query(updateLengthQuery);
      console.log('Updated existing records with default length value');
    } else {
      console.log('Length column already exists in seating_tables table');
    }
    
    // Check if width column exists and add it if needed
    const checkWidthQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'seating_tables' 
      AND column_name = 'width';
    `;
    
    const widthResult = await client.query(checkWidthQuery);
    
    if (widthResult.rows.length === 0) {
      console.log('Width column does not exist. Adding it now...');
      
      // Add the width column if it doesn't exist
      const addWidthQuery = `
        ALTER TABLE seating_tables 
        ADD COLUMN width NUMERIC DEFAULT 100;
      `;
      
      await client.query(addWidthQuery);
      console.log('Successfully added width column to seating_tables table');
      
      // Update existing records to have a default value
      const updateWidthQuery = `
        UPDATE seating_tables 
        SET width = 100 
        WHERE width IS NULL;
      `;
      
      await client.query(updateWidthQuery);
      console.log('Updated existing records with default width value');
    } else {
      console.log('Width column already exists in seating_tables table');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the migration
fixSeatingTables();
