// Script to fix Supabase storage issues
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Supabase configuration
const supabaseUrl = 'https://yemkduykvfdjmldxfphq.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || ''; // You'll need to provide your service_role key

// Create Supabase client with admin privileges
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to check and fix storage bucket
async function fixStorageBucket() {
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
    console.log(`- ${bucket.name} (public: ${bucket.public})`);
  });
  
  // Check if venue-floor-plans bucket exists
  const floorPlansBucket = buckets.find(b => b.name === 'venue-floor-plans');
  
  if (!floorPlansBucket) {
    console.log('Creating venue-floor-plans bucket...');
    
    // Create the bucket
    const { data, error } = await supabase
      .storage
      .createBucket('venue-floor-plans', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
      });
    
    if (error) {
      console.error('Error creating bucket:', error);
      return false;
    }
    
    console.log('Created venue-floor-plans bucket successfully');
  } else if (!floorPlansBucket.public) {
    console.log('Updating venue-floor-plans bucket to be public...');
    
    // Update the bucket to be public
    const { data, error } = await supabase
      .storage
      .updateBucket('venue-floor-plans', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
      });
    
    if (error) {
      console.error('Error updating bucket:', error);
      return false;
    }
    
    console.log('Updated venue-floor-plans bucket successfully');
  } else {
    console.log('venue-floor-plans bucket already exists and is public');
  }
  
  return true;
}

// Function to test uploading a sample image
async function testUpload() {
  try {
    console.log('Testing upload to venue-floor-plans bucket...');
    
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
    
    // Upload the test image
    const testFileName = `test-upload-${Date.now()}.jpg`;
    const { data, error } = await supabase
      .storage
      .from('venue-floor-plans')
      .upload(`floor_plans/${testFileName}`, fs.readFileSync(testImagePath), {
        contentType: 'image/jpeg',
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('Test upload failed:', error);
      return false;
    }
    
    console.log('Test upload successful!');
    
    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('venue-floor-plans')
      .getPublicUrl(`floor_plans/${testFileName}`);
    
    console.log(`Test image public URL: ${publicUrl}`);
    
    // Clean up the test image
    const { error: deleteError } = await supabase
      .storage
      .from('venue-floor-plans')
      .remove([`floor_plans/${testFileName}`]);
    
    if (deleteError) {
      console.warn('Warning: Could not delete test image:', deleteError);
    } else {
      console.log('Test image deleted');
    }
    
    return true;
  } catch (error) {
    console.error('Error in test upload:', error);
    return false;
  }
}

// Function to check and fix the SeatingChart component
async function fixSeatingChartComponent() {
  try {
    console.log('Checking SeatingChart component...');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const seatingChartPath = path.join(__dirname, '..', 'src', 'pages', 'SeatingChart.tsx');
    
    if (!fs.existsSync(seatingChartPath)) {
      console.error('SeatingChart.tsx not found at expected path');
      return false;
    }
    
    let content = fs.readFileSync(seatingChartPath, 'utf8');
    
    // Check if the handleRoomFloorPlanUpload function needs fixing
    if (content.includes('handleRoomFloorPlanUpload')) {
      console.log('Found handleRoomFloorPlanUpload function in SeatingChart.tsx');
      
      // Check for common issues in the upload function
      let modified = false;
      
      // 1. Fix content type issue
      if (!content.includes('contentType:')) {
        console.log('Adding contentType parameter to storage upload');
        
        // Find the upload section
        const uploadRegex = /\.upload\(filePath, file\)/;
        if (uploadRegex.test(content)) {
          content = content.replace(
            uploadRegex,
            '.upload(filePath, file, { contentType: file.type })'
          );
          modified = true;
        }
      }
      
      // 2. Fix error handling
      if (!content.includes('if (uploadError) {')) {
        console.log('Improving error handling in upload function');
        
        // Find the error handling section
        const errorRegex = /if \(uploadError\) throw uploadError;/;
        if (errorRegex.test(content)) {
          content = content.replace(
            errorRegex,
            'if (uploadError) {\n' +
            '      console.error("Upload error details:", uploadError);\n' +
            '      throw uploadError;\n' +
            '    }'
          );
          modified = true;
        }
      }
      
      // 3. Add file size check
      if (!content.includes('file.size >')) {
        console.log('Adding file size check');
        
        // Find the beginning of the function
        const functionStartRegex = /const handleRoomFloorPlanUpload = async \(roomId: string, file: File\) =>\s*{/;
        if (functionStartRegex.test(content)) {
          content = content.replace(
            functionStartRegex,
            'const handleRoomFloorPlanUpload = async (roomId: string, file: File) => {\n' +
            '    // Check file size (max 5MB)\n' +
            '    if (file.size > 5 * 1024 * 1024) {\n' +
            '      setSnackbar({\n' +
            '        open: true,\n' +
            '        message: "File size exceeds 5MB limit",\n' +
            '        severity: "error"\n' +
            '      });\n' +
            '      return;\n' +
            '    }\n'
          );
          modified = true;
        }
      }
      
      if (modified) {
        console.log('Saving modified SeatingChart.tsx');
        fs.writeFileSync(seatingChartPath, content);
        console.log('SeatingChart.tsx updated successfully');
      } else {
        console.log('No modifications needed for SeatingChart.tsx');
      }
    } else {
      console.error('Could not find handleRoomFloorPlanUpload function in SeatingChart.tsx');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error fixing SeatingChart component:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Supabase Storage Fix Tool');
  console.log('========================');
  
  if (!supabaseKey) {
    console.error('Error: SUPABASE_KEY environment variable is required');
    console.log('Please run this script with your service_role key:');
    console.log('SUPABASE_KEY=your_service_role_key node scripts/fix_supabase_storage.mjs');
    process.exit(1);
  }
  
  // Step 1: Fix storage bucket
  const bucketFixed = await fixStorageBucket();
  if (!bucketFixed) {
    console.error('Failed to fix storage bucket');
    process.exit(1);
  }
  
  // Step 2: Test upload
  const uploadWorks = await testUpload();
  if (!uploadWorks) {
    console.error('Upload test failed');
    process.exit(1);
  }
  
  // Step 3: Fix SeatingChart component
  const componentFixed = await fixSeatingChartComponent();
  if (!componentFixed) {
    console.warn('Warning: Could not fix SeatingChart component');
  }
  
  console.log('\nStorage fix completed successfully!');
  console.log('Try uploading floor plans again through the UI.');
  console.log('If you still encounter issues, you can use the update_floor_plan_url.mjs script to update floor plan URLs directly in the database.');
}

main();
