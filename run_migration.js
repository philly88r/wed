import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the migration file path from command line arguments
const migrationFilePath = process.argv[2];

if (!migrationFilePath) {
  console.error('Please provide a migration file path as an argument');
  process.exit(1);
}

// Read the migration SQL file
const migrationSQL = fs.readFileSync(
  path.join(__dirname, migrationFilePath),
  'utf8'
);

// Connect to the database
const client = new Client({
  connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres'
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to the database');
    
    // Execute the migration SQL
    await client.query(migrationSQL);
    console.log('Migration executed successfully');
    
  } catch (error) {
    console.error('Error executing migration:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

runMigration();
