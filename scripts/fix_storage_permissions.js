// Script to diagnose and fix Supabase storage permissions
const { Pool } = require('pg');

// Use the direct PostgreSQL connection string from memory
const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres'
});

async function main() {
  try {
    console.log('Checking storage bucket configuration...');
    
    // Check if the venue-floor-plans bucket exists
    const bucketResult = await pool.query(`
      SELECT id, name, public, file_size_limit, allowed_mime_types
      FROM storage.buckets
      WHERE name = 'venue-floor-plans'
    `);
    
    if (bucketResult.rows.length === 0) {
      console.log('Venue floor plans bucket does not exist. Creating it...');
      
      // Create the bucket if it doesn't exist
      await pool.query(`
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('venue-floor-plans', 'venue-floor-plans', true, 5242880, '{image/jpeg,image/png,image/gif}')
      `);
      
      console.log('Created venue-floor-plans bucket with 5MB file size limit');
    } else {
      console.log('Venue floor plans bucket exists:', bucketResult.rows[0]);
      
      // Update the bucket to ensure it has the right permissions
      await pool.query(`
        UPDATE storage.buckets
        SET 
          public = true,
          file_size_limit = 10485760, -- Increase to 10MB
          allowed_mime_types = '{image/jpeg,image/png,image/gif}'
        WHERE name = 'venue-floor-plans'
      `);
      
      console.log('Updated venue-floor-plans bucket with 10MB file size limit');
    }
    
    // Check and update storage policies
    console.log('Checking storage policies...');
    
    // Check if there's an insert policy for authenticated users
    const policyResult = await pool.query(`
      SELECT id, name, definition
      FROM storage.policies
      WHERE bucket_id = 'venue-floor-plans' AND name = 'Allow uploads for authenticated users'
    `);
    
    if (policyResult.rows.length === 0) {
      console.log('Creating upload policy for authenticated users...');
      
      // Create a policy allowing authenticated users to upload
      await pool.query(`
        INSERT INTO storage.policies (name, bucket_id, operation, definition)
        VALUES (
          'Allow uploads for authenticated users',
          'venue-floor-plans',
          'INSERT',
          '(auth.uid() IS NOT NULL)'
        )
      `);
      
      console.log('Created upload policy for authenticated users');
    } else {
      console.log('Upload policy exists:', policyResult.rows[0]);
    }
    
    // Check if there's a select policy for authenticated users
    const selectPolicyResult = await pool.query(`
      SELECT id, name, definition
      FROM storage.policies
      WHERE bucket_id = 'venue-floor-plans' AND name = 'Allow viewing for authenticated users'
    `);
    
    if (selectPolicyResult.rows.length === 0) {
      console.log('Creating view policy for authenticated users...');
      
      // Create a policy allowing authenticated users to view
      await pool.query(`
        INSERT INTO storage.policies (name, bucket_id, operation, definition)
        VALUES (
          'Allow viewing for authenticated users',
          'venue-floor-plans',
          'SELECT',
          '(auth.uid() IS NOT NULL)'
        )
      `);
      
      console.log('Created view policy for authenticated users');
    } else {
      console.log('View policy exists:', selectPolicyResult.rows[0]);
    }
    
    // Check if there's a public access policy
    const publicPolicyResult = await pool.query(`
      SELECT id, name, definition
      FROM storage.policies
      WHERE bucket_id = 'venue-floor-plans' AND name = 'Allow public access'
    `);
    
    if (publicPolicyResult.rows.length === 0) {
      console.log('Creating public access policy...');
      
      // Create a policy allowing public access to view files
      await pool.query(`
        INSERT INTO storage.policies (name, bucket_id, operation, definition)
        VALUES (
          'Allow public access',
          'venue-floor-plans',
          'SELECT',
          '(bucket_id = ''venue-floor-plans'')'
        )
      `);
      
      console.log('Created public access policy');
    } else {
      console.log('Public access policy exists:', publicPolicyResult.rows[0]);
    }
    
    console.log('Storage configuration updated successfully!');
  } catch (error) {
    console.error('Error updating storage configuration:', error);
  } finally {
    await pool.end();
  }
}

main();
