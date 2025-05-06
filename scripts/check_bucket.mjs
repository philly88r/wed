// Script to check if the venue-floor-plans bucket exists
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://yemkduykvfdjmldxfphq.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || ''; // You'll need to provide your service_role key

// Create Supabase client with admin privileges
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log('Checking storage buckets...');
    
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }
    
    console.log(`Found ${buckets.length} buckets:`);
    buckets.forEach(bucket => {
      console.log(`- ${bucket.name} (public: ${bucket.public})`);
    });
    
    // Check if venue-floor-plans bucket exists
    const floorPlansBucket = buckets.find(b => b.name === 'venue-floor-plans');
    
    if (!floorPlansBucket) {
      console.log('venue-floor-plans bucket DOES NOT EXIST!');
      
      // Create the bucket
      console.log('Creating venue-floor-plans bucket...');
      const { data, error } = await supabase
        .storage
        .createBucket('venue-floor-plans', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
        });
      
      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('Created venue-floor-plans bucket successfully');
      }
    } else {
      console.log('venue-floor-plans bucket exists:');
      console.log(floorPlansBucket);
      
      // Try to update the bucket to be public
      console.log('Updating venue-floor-plans bucket to be public...');
      const { data, error } = await supabase
        .storage
        .updateBucket('venue-floor-plans', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
        });
      
      if (error) {
        console.error('Error updating bucket:', error);
      } else {
        console.log('Updated venue-floor-plans bucket successfully');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
