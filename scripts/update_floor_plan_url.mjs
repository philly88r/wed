// Script to update floor plan URLs directly in the database
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

const { Pool } = pg;

// Use the direct PostgreSQL connection string from memory
const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres'
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// List all venue rooms
async function listVenueRooms() {
  try {
    console.log('Fetching venue rooms...');
    
    const result = await pool.query(`
      SELECT 
        r.id AS room_id, 
        r.name AS room_name, 
        v.id AS venue_id, 
        v.name AS venue_name,
        r.floor_plan_url,
        v.created_by
      FROM 
        venue_rooms r
      JOIN 
        venues v ON r.venue_id = v.id
      ORDER BY 
        v.name, r.name
    `);
    
    if (result.rows.length === 0) {
      console.log('No venue rooms found.');
      return [];
    }
    
    console.log('\nVenue Rooms:');
    result.rows.forEach((room, index) => {
      console.log(`${index + 1}. Room: ${room.room_name} (ID: ${room.room_id})`);
      console.log(`   Venue: ${room.venue_name}`);
      console.log(`   Floor Plan URL: ${room.floor_plan_url || 'None'}`);
      console.log('');
    });
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching venue rooms:', error);
    return [];
  }
}

// Update floor plan URL for a room
async function updateFloorPlanUrl(roomId, floorPlanUrl) {
  try {
    console.log(`Updating floor plan URL for room ${roomId}...`);
    
    const result = await pool.query(`
      UPDATE venue_rooms
      SET 
        floor_plan_url = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, floor_plan_url
    `, [floorPlanUrl, roomId]);
    
    if (result.rows.length === 0) {
      console.log('Room not found or update failed.');
      return false;
    }
    
    console.log(`Updated floor plan URL for room ${result.rows[0].name} (${result.rows[0].id})`);
    console.log(`New URL: ${result.rows[0].floor_plan_url}`);
    return true;
  } catch (error) {
    console.error('Error updating floor plan URL:', error);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log('Floor Plan URL Updater');
    console.log('=====================');
    
    // List all venue rooms
    const rooms = await listVenueRooms();
    if (rooms.length === 0) {
      console.log('No rooms found. Exiting...');
      return;
    }
    
    // Get room selection
    const roomIndex = await prompt('Enter the number of the room to update (or q to quit): ');
    if (roomIndex.toLowerCase() === 'q') {
      console.log('Exiting...');
      return;
    }
    
    const selectedIndex = parseInt(roomIndex) - 1;
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= rooms.length) {
      console.log('Invalid selection. Exiting...');
      return;
    }
    
    const selectedRoom = rooms[selectedIndex];
    console.log(`Selected room: ${selectedRoom.room_name} (${selectedRoom.room_id})`);
    
    // Get new floor plan URL
    const newUrl = await prompt('Enter the new floor plan URL (or leave empty to cancel): ');
    if (!newUrl) {
      console.log('No URL provided. Exiting...');
      return;
    }
    
    // Update floor plan URL
    const success = await updateFloorPlanUrl(selectedRoom.room_id, newUrl);
    if (success) {
      console.log('Floor plan URL updated successfully!');
      console.log('You can now refresh the seating chart page to see the updated floor plan.');
    } else {
      console.log('Failed to update floor plan URL.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
    await pool.end();
  }
}

main();
