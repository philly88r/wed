import pg from 'pg';
const { Client } = pg;

// Database connection configuration
const connectionString = 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres';

async function updateProfiles() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // 1. Ensure profiles table has all the necessary columns
    const addColumnsQuery = `
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS wedding_date DATE,
      ADD COLUMN IF NOT EXISTS budget NUMERIC DEFAULT 0,
      ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS selected_plan TEXT DEFAULT 'standard';
    `;
    
    await client.query(addColumnsQuery);
    console.log('Added necessary columns to profiles table');

    // 2. Update profiles with proper names
    const updateNamesQuery = `
      UPDATE profiles 
      SET 
        first_name = CASE 
          WHEN first_name IS NULL OR first_name = '' OR first_name = 'New' OR first_name = 'New User' 
          THEN INITCAP(SPLIT_PART(email, '@', 1))
          ELSE first_name 
        END,
        last_name = CASE 
          WHEN last_name IS NULL OR last_name = '' 
          THEN 'User' 
          ELSE last_name 
        END
      WHERE id IS NOT NULL;
    `;
    
    const nameResult = await client.query(updateNamesQuery);
    console.log(`Updated ${nameResult.rowCount} profiles with proper names`);

    // 3. Set example wedding dates for profiles that don't have one
    const updateDatesQuery = `
      UPDATE profiles
      SET wedding_date = '2025-06-15'
      WHERE wedding_date IS NULL;
    `;
    
    const dateResult = await client.query(updateDatesQuery);
    console.log(`Set wedding dates for ${dateResult.rowCount} profiles`);

    // 4. Copy wedding dates from timeline_questionnaire if available
    const syncDatesQuery = `
      UPDATE profiles p
      SET wedding_date = tq.wedding_date
      FROM timeline_questionnaire tq
      WHERE p.id = tq.user_id
      AND tq.wedding_date IS NOT NULL
      AND (p.wedding_date IS NULL OR p.wedding_date != tq.wedding_date);
    `;
    
    const syncResult = await client.query(syncDatesQuery);
    console.log(`Synced ${syncResult.rowCount} wedding dates from timeline_questionnaire`);

    // 5. Show sample profiles to verify changes
    const sampleQuery = `
      SELECT id, email, first_name, last_name, wedding_date, budget, location, guest_count, selected_plan
      FROM profiles
      LIMIT 5;
    `;
    
    const sampleResult = await client.query(sampleQuery);
    console.log('Sample profiles after updates:');
    console.log(sampleResult.rows);

    console.log('Profile updates completed successfully!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Close the database connection
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the function
updateProfiles();
