// Script to diagnose Supabase storage issues
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// PostgreSQL connection
const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres'
});

// Supabase client
const supabaseUrl = 'https://yemkduykvfdjmldxfphq.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || ''; // Provide your service_role key when running

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Check storage bucket configuration
async function checkStorageBucket() {
  try {
    console.log('Checking storage buckets...');
    
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return false;
    }
    
    console.log(`Found ${buckets.length} buckets:`);
    buckets.forEach(bucket => {
      console.log(`- ${bucket.name} (public: ${bucket.public}, allowed_mime_types: ${bucket.allowed_mime_types})`);
    });
    
    // Check if venue-floor-plans bucket exists
    const floorPlansBucket = buckets.find(b => b.name === 'venue-floor-plans');
    
    if (!floorPlansBucket) {
      console.error('venue-floor-plans bucket DOES NOT EXIST!');
      return false;
    }
    
    console.log('\nVenue floor plans bucket details:');
    console.log(JSON.stringify(floorPlansBucket, null, 2));
    
    // Check storage policies
    try {
      console.log('\nChecking storage policies via PostgreSQL...');
      const policiesResult = await pool.query(`
        SELECT id, name, bucket_id, operation, definition
        FROM storage.policies
        WHERE bucket_id = 'venue-floor-plans'
      `);
      
      console.log(`Found ${policiesResult.rows.length} policies for venue-floor-plans bucket:`);
      policiesResult.rows.forEach(policy => {
        console.log(`- ${policy.name} (${policy.operation}): ${policy.definition}`);
      });
    } catch (pgError) {
      console.error('Error querying storage policies:', pgError);
    }
    
    return true;
  } catch (error) {
    console.error('Error checking storage bucket:', error);
    return false;
  }
}

// Test upload with different content types
async function testUpload() {
  try {
    console.log('\nTesting uploads with different content types...');
    
    // Create a small test image
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    
    // Check if we need to create a test image
    if (!fs.existsSync(testImagePath)) {
      console.log('Creating test image...');
      
      // Create a simple 1x1 pixel JPEG
      const buffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
        0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00,
        0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0x37,
        0xff, 0xd9
      ]);
      
      fs.writeFileSync(testImagePath, buffer);
      console.log('Test image created');
    }
    
    // Read the test image
    const fileBuffer = fs.readFileSync(testImagePath);
    
    // Test 1: Upload with explicit content type
    console.log('\nTest 1: Upload with explicit content type...');
    const fileName1 = `test-explicit-type-${Date.now()}.jpg`;
    const { data: data1, error: error1 } = await supabase
      .storage
      .from('venue-floor-plans')
      .upload(`floor_plans/${fileName1}`, fileBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600'
      });
    
    if (error1) {
      console.error('Test 1 failed:', error1);
    } else {
      console.log('Test 1 succeeded:', data1);
      
      // Clean up
      await supabase.storage.from('venue-floor-plans').remove([`floor_plans/${fileName1}`]);
    }
    
    // Test 2: Upload with File object
    console.log('\nTest 2: Upload with File object (simulated)...');
    // Since we can't create a real File object in Node, we'll use a Blob-like approach
    const fileName2 = `test-file-object-${Date.now()}.jpg`;
    
    // This is similar to what happens in the browser
    const { data: data2, error: error2 } = await supabase
      .storage
      .from('venue-floor-plans')
      .upload(`floor_plans/${fileName2}`, fileBuffer, {
        contentType: 'image/jpeg'
      });
    
    if (error2) {
      console.error('Test 2 failed:', error2);
    } else {
      console.log('Test 2 succeeded:', data2);
      
      // Clean up
      await supabase.storage.from('venue-floor-plans').remove([`floor_plans/${fileName2}`]);
    }
    
    // Test 3: Upload without content type
    console.log('\nTest 3: Upload without content type...');
    const fileName3 = `test-no-content-type-${Date.now()}.jpg`;
    const { data: data3, error: error3 } = await supabase
      .storage
      .from('venue-floor-plans')
      .upload(`floor_plans/${fileName3}`, fileBuffer);
    
    if (error3) {
      console.error('Test 3 failed:', error3);
    } else {
      console.log('Test 3 succeeded:', data3);
      
      // Clean up
      await supabase.storage.from('venue-floor-plans').remove([`floor_plans/${fileName3}`]);
    }
    
    return true;
  } catch (error) {
    console.error('Error in test upload:', error);
    return false;
  }
}

// Check existing files in the bucket
async function listFiles() {
  try {
    console.log('\nListing files in venue-floor-plans bucket...');
    
    const { data, error } = await supabase
      .storage
      .from('venue-floor-plans')
      .list('floor_plans');
    
    if (error) {
      console.error('Error listing files:', error);
      return;
    }
    
    console.log(`Found ${data.length} files:`);
    data.forEach(file => {
      console.log(`- ${file.name} (size: ${file.metadata.size} bytes, created: ${file.created_at})`);
    });
  } catch (error) {
    console.error('Error listing files:', error);
  }
}

// Main function
async function main() {
  console.log('Supabase Storage Diagnostics');
  console.log('===========================');
  
  if (!supabaseKey) {
    console.error('Error: SUPABASE_KEY environment variable is required');
    console.log('Please run this script with your service_role key:');
    console.log('SUPABASE_KEY=your_service_role_key node scripts/diagnose_storage.mjs');
    process.exit(1);
  }
  
  // Check storage bucket configuration
  await checkStorageBucket();
  
  // List existing files
  await listFiles();
  
  // Test uploads
  await testUpload();
  
  // Close PostgreSQL connection
  await pool.end();
}

main();
