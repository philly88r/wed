// Script to fix custom_links table for Mood Board
import pg from 'pg';
const { Pool } = pg;

// Direct PostgreSQL connection using the connection string
const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres'
});

async function fixCustomLinks() {
  try {
    console.log('Connecting to PostgreSQL database...');
    const client = await pool.connect();
    
    try {
      // Check if the custom_links table exists
      const tableCheckQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'custom_links'
        );
      `;
      
      const tableExists = await client.query(tableCheckQuery);
      
      if (!tableExists.rows[0].exists) {
        console.error('custom_links table does not exist');
        return;
      }
      
      // Check the structure of the custom_links table
      console.log('Checking custom_links table structure...');
      const tableStructureQuery = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'custom_links';
      `;
      
      const tableStructure = await client.query(tableStructureQuery);
      console.log('Table structure:', tableStructure.rows);
      
      // Get existing records
      console.log('Fetching existing custom_links records...');
      const existingRecordsQuery = `SELECT * FROM custom_links LIMIT 10;`;
      const existingRecords = await client.query(existingRecordsQuery);
      console.log('Existing records:', existingRecords.rows);
      
      // Check if vision-board path exists
      const checkVisionBoardQuery = `
        SELECT * FROM custom_links 
        WHERE questionnaire_path = '/vision-board';
      `;
      
      const visionBoardExists = await client.query(checkVisionBoardQuery);
      
      if (visionBoardExists.rows.length > 0) {
        console.log('Vision board path already exists, updating...');
        const updateQuery = `
          UPDATE custom_links 
          SET name = 'MoodBoard' 
          WHERE questionnaire_path = '/vision-board' 
          RETURNING *;
        `;
        
        const updateResult = await client.query(updateQuery);
        console.log('Updated record:', updateResult.rows[0]);
      } else {
        console.log('Creating new record for vision-board path...');
        const insertQuery = `
          INSERT INTO custom_links (name, questionnaire_path, link) 
          VALUES ('MoodBoard', '/vision-board', 'https://wedding-p.netlify.app/vision-board') 
          RETURNING *;
        `;
        
        const insertResult = await client.query(insertQuery);
        console.log('Inserted record:', insertResult.rows[0]);
      }
      
      // Check if mood-board path exists
      const checkMoodBoardQuery = `
        SELECT * FROM custom_links 
        WHERE questionnaire_path = '/mood-board';
      `;
      
      const moodBoardExists = await client.query(checkMoodBoardQuery);
      
      if (moodBoardExists.rows.length > 0) {
        console.log('Mood board path already exists, updating...');
        const updateQuery = `
          UPDATE custom_links 
          SET name = 'MoodBoard2' 
          WHERE questionnaire_path = '/mood-board' 
          RETURNING *;
        `;
        
        const updateResult = await client.query(updateQuery);
        console.log('Updated record:', updateResult.rows[0]);
      } else {
        console.log('Creating new record for mood-board path...');
        const insertQuery = `
          INSERT INTO custom_links (name, questionnaire_path, link) 
          VALUES ('MoodBoard2', '/mood-board', 'https://wedding-p.netlify.app/mood-board') 
          RETURNING *;
        `;
        
        const insertResult = await client.query(insertQuery);
        console.log('Inserted record:', insertResult.rows[0]);
      }
      
      console.log('Custom links fixed successfully!');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fixing custom links:', error);
  } finally {
    pool.end();
  }
}

fixCustomLinks();
