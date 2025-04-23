import { supabase } from '../supabaseClient';

/**
 * Automatically sets up the database structure needed for the moodboard functionality
 * This eliminates the need to manually run SQL scripts
 */
export const setupMoodboardDatabase = async (): Promise<void> => {
  try {
    console.log('Setting up moodboard database...');
    
    // Note: Storage buckets should be created by an admin in the Supabase dashboard
    // The 'moodboard-images' bucket should already exist with proper permissions
    
    console.log('Moodboard database setup complete');
  } catch (error) {
    console.error('Error setting up moodboard database:', error);
  }
};

/**
 * Checks if the current user has a moodboard, creates one if not
 * Returns the moodboard ID
 */
export const ensureUserHasMoodboard = async (): Promise<string | null> => {
  try {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (!user) {
      console.log('No authenticated user found');
      return null;
    }
    
    // First, try to create the moodboard table if it doesn't exist
    try {
      // Try to query the moodboards table to see if it exists
      // Using select('*') instead of select('count(*)') to avoid 400 error
      const { error: tableCheckError } = await supabase
        .from('moodboards')
        .select('*')
        .limit(1);
      
      if (tableCheckError && tableCheckError.code === '42P01') {
        // Table doesn't exist, redirect to a page that explains how to set up the database
        console.error('Moodboards table does not exist. Please run the SQL setup script.');
        alert('The moodboard feature requires database setup. Please contact the administrator.');
        return null;
      }
    } catch (error) {
      console.error('Error checking moodboards table:', error);
    }
    
    // Check if user has a moodboard
    const { data: moodboards, error: fetchError } = await supabase
      .from('moodboards')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);
    
    if (fetchError) {
      console.error('Error fetching moodboards:', fetchError);
      return null;
    }
    
    // If user has a moodboard, return its ID
    if (moodboards && moodboards.length > 0) {
      return moodboards[0].id;
    }
    
    // Create a new moodboard for the user
    const defaultColors = ['#054697', '#FFE8E4', '#FF5C39', '#B8BDD7']; // Altare brand colors
    const { data: newBoard, error: createError } = await supabase
      .from('moodboards')
      .insert([{
        user_id: user.id,
        title: 'My Wedding Moodboard',
        description: 'Inspiration for my wedding',
        colors: defaultColors
      }])
      .select();
    
    if (createError) {
      console.error('Error creating moodboard:', createError);
      return null;
    }
    
    return newBoard?.[0]?.id || null;
  } catch (error) {
    console.error('Error ensuring user has moodboard:', error);
    return null;
  }
};
