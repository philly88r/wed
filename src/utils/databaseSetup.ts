import { supabase } from '../supabaseClient';

/**
 * Automatically sets up the database structure needed for the moodboard functionality
 * This eliminates the need to manually run SQL scripts
 */
export const setupMoodboardDatabase = async (): Promise<void> => {
  try {
    console.log('Setting up moodboard database...');
    
    // 1. Create storage bucket for moodboard images if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(bucket => bucket.name === 'moodboard-images')) {
      await supabase.storage.createBucket('moodboard-images', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      console.log('Created moodboard-images storage bucket');
    }
    
    // 2. Create the moodboards table if it doesn't exist
    await supabase.rpc('create_moodboards_table_if_not_exists');
    
    // 3. Create the moodboard_images table if it doesn't exist
    await supabase.rpc('create_moodboard_images_table_if_not_exists');
    
    // 4. Set up RLS policies
    await supabase.rpc('setup_moodboard_rls_policies');
    
    // 5. Create public access policies
    await supabase.rpc('setup_moodboard_public_access');
    
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
    
    // Check if user has a moodboard
    const { data: moodboards, error: fetchError } = await supabase
      .from('moodboards')
      .select('id')
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
