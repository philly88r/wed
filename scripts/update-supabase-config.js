// Script to update Supabase configuration
const { createClient } = require('@supabase/supabase-js');

// Define the correct Supabase URL and key
const supabaseUrl = 'https://yemkduykvfdjmldxfphq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbWtkdXlrdmZkam1sZHhmcGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA1NjY0MDAsImV4cCI6MTk5NjE0MjQwMH0.S3-NxrP3OqcXJhKYOv6XPBu1NlOvJmQnSEw6BPrLsXQ';

// Create a Supabase client with the correct credentials
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test the connection
async function testConnection() {
  try {
    console.log('Testing connection to Supabase...');
    
    // Try to get the current user to test authentication
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error connecting to Supabase:', error.message);
    } else {
      console.log('Successfully connected to Supabase!');
      
      // Test database access
      const { data: tablesData, error: tablesError } = await supabase
        .from('seating_tables')
        .select('count(*)');
      
      if (tablesError) {
        console.error('Error accessing seating_tables:', tablesError.message);
      } else {
        console.log('Successfully accessed seating_tables table!');
        console.log(`Number of tables: ${tablesData[0]?.count || 0}`);
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testConnection();

// Instructions for updating the .env file
console.log('\nTo update your Supabase configuration, add the following to your .env file:');
console.log(`VITE_SUPABASE_URL=${supabaseUrl}`);
console.log(`VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}`);
