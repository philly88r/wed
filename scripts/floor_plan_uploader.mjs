// Floor Plan Uploader - Direct PostgreSQL Script
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Use the direct PostgreSQL connection string
const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres'
});

// Supabase client for storage operations
const supabaseUrl = 'https://yemkduykvfdjmldxfphq.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || ''; // You'll need to provide this when running the script

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Fix storage bucket permissions
async function fixStorageBucketPermissions() {
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
        VALUES ('venue-floor-plans', 'venue-floor-plans', true, 10485760, '{image/jpeg,image/png,image/gif}')
      `);
      
      console.log('Created venue-floor-plans bucket with 10MB file size limit');
    } else {
      console.log('Venue floor plans bucket exists:', bucketResult.rows[0]);
      
      // Update the bucket to ensure it has the right permissions
      await pool.query(`
        UPDATE storage.buckets
        SET 
          public = true,
          file_size_limit = 10485760, -- 10MB
          allowed_mime_types = '{image/jpeg,image/png,image/gif}'
        WHERE name = 'venue-floor-plans'
      `);
      
      console.log('Updated venue-floor-plans bucket with 10MB file size limit');
    }
    
    // Create or update storage policies
    const policies = [
      {
        name: 'Allow uploads for authenticated users',
        operation: 'INSERT',
        definition: '(auth.uid() IS NOT NULL)'
      },
      {
        name: 'Allow viewing for authenticated users',
        operation: 'SELECT',
        definition: '(auth.uid() IS NOT NULL)'
      },
      {
        name: 'Allow public access',
        operation: 'SELECT',
        definition: '(bucket_id = ''venue-floor-plans'')'
      },
      {
        name: 'Allow updates for authenticated users',
        operation: 'UPDATE',
        definition: '(auth.uid() IS NOT NULL)'
      },
      {
        name: 'Allow deletes for authenticated users',
        operation: 'DELETE',
        definition: '(auth.uid() IS NOT NULL)'
      }
    ];
    
    for (const policy of policies) {
      const policyResult = await pool.query(`
        SELECT id, name, definition
        FROM storage.policies
        WHERE bucket_id = 'venue-floor-plans' AND name = $1
      `, [policy.name]);
      
      if (policyResult.rows.length === 0) {
        console.log(`Creating policy: ${policy.name}`);
        
        await pool.query(`
          INSERT INTO storage.policies (name, bucket_id, operation, definition)
          VALUES ($1, 'venue-floor-plans', $2, $3)
        `, [policy.name, policy.operation, policy.definition]);
        
        console.log(`Created policy: ${policy.name}`);
      } else {
        console.log(`Policy exists: ${policy.name}`);
        
        // Update the policy to ensure it has the right definition
        await pool.query(`
          UPDATE storage.policies
          SET definition = $1
          WHERE bucket_id = 'venue-floor-plans' AND name = $2
        `, [policy.definition, policy.name]);
        
        console.log(`Updated policy: ${policy.name}`);
      }
    }
    
    console.log('Storage configuration updated successfully!');
    return true;
  } catch (error) {
    console.error('Error updating storage configuration:', error);
    return false;
  }
}

// Upload a floor plan image directly to Supabase storage
async function uploadFloorPlan(filePath, roomId, userId) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return null;
    }

    const fileContent = fs.readFileSync(filePath);
    const fileExt = path.extname(filePath).substring(1);
    const fileName = `room-${roomId}-${Date.now()}.${fileExt}`;
    const storagePath = `floor_plans/${fileName}`;
    
    console.log(`Uploading file to ${storagePath}...`);
    
    // Upload the file to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('venue-floor-plans')
      .upload(storagePath, fileContent, {
        contentType: `image/${fileExt}`,
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('venue-floor-plans')
      .getPublicUrl(storagePath);
    
    console.log(`File uploaded successfully. Public URL: ${publicUrl}`);
    
    // Update the venue room with the floor plan URL
    const { error: updateError } = await pool.query(`
      UPDATE venue_rooms
      SET 
        floor_plan_url = $1,
        updated_at = NOW()
      WHERE id = $2
    `, [publicUrl, roomId]);
    
    if (updateError) {
      console.error('Error updating venue room:', updateError);
      return null;
    }
    
    console.log(`Updated venue room ${roomId} with floor plan URL`);
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadFloorPlan:', error);
    return null;
  }
}

// Get all venue rooms for a user
async function getVenueRooms(userId) {
  try {
    const result = await pool.query(`
      SELECT r.id, r.name, r.venue_id, r.floor_plan_url, v.name as venue_name
      FROM venue_rooms r
      JOIN venues v ON r.venue_id = v.id
      WHERE v.created_by = $1
      ORDER BY v.name, r.name
    `, [userId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting venue rooms:', error);
    return [];
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log(`
Usage:
  node floor_plan_uploader.mjs fix-permissions
  node floor_plan_uploader.mjs list-rooms <userId>
  node floor_plan_uploader.mjs upload <filePath> <roomId> <userId>
    `);
    process.exit(1);
  }
  
  try {
    if (command === 'fix-permissions') {
      await fixStorageBucketPermissions();
    } else if (command === 'list-rooms') {
      const userId = args[1];
      if (!userId) {
        console.error('Error: userId is required');
        process.exit(1);
      }
      
      const rooms = await getVenueRooms(userId);
      console.log('Venue Rooms:');
      rooms.forEach(room => {
        console.log(`- Room ID: ${room.id}, Name: ${room.name}, Venue: ${room.venue_name}`);
        console.log(`  Floor Plan URL: ${room.floor_plan_url || 'None'}`);
      });
    } else if (command === 'upload') {
      const filePath = args[1];
      const roomId = args[2];
      const userId = args[3];
      
      if (!filePath || !roomId || !userId) {
        console.error('Error: filePath, roomId, and userId are required');
        process.exit(1);
      }
      
      const publicUrl = await uploadFloorPlan(filePath, roomId, userId);
      if (publicUrl) {
        console.log(`Floor plan uploaded successfully: ${publicUrl}`);
      } else {
        console.error('Failed to upload floor plan');
        process.exit(1);
      }
    } else {
      console.error(`Unknown command: ${command}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
