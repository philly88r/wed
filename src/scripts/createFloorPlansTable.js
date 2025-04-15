import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = 'https://yemkduykvfdjmldxfphq.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createFloorPlansTable() {
  try {
    // Create the floor_plans table
    const { error: tableError } = await supabase.rpc('create_floor_plans_table');
    
    if (tableError) {
      console.error('Error creating floor_plans table:', tableError);
      return;
    }
    
    console.log('Floor plans table created successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

createFloorPlansTable();
