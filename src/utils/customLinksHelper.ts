import { getSupabase } from '../supabaseClient';

/**
 * Helper function to safely fetch custom links data
 * @param path The questionnaire path to look up
 * @returns The name associated with the path or null if not found
 */
export const getCustomLinkName = async (path: string): Promise<string | null> => {
  try {
    // Add leading slash if not present
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    const supabase = getSupabase();
    if (!supabase) {
      console.error('Supabase client is null');
      return null;
    }
    
    const { data, error } = await supabase
      .from('custom_links')
      .select('name')
      .eq('questionnaire_path', normalizedPath)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching custom link:', error);
      return null;
    }
    
    // Ensure we return a string or null, not an empty object
    if (data && typeof data === 'object' && 'name' in data && typeof data.name === 'string') {
      return data.name;
    }
    return null;
  } catch (error) {
    console.error('Unexpected error in getCustomLinkName:', error);
    return null;
  }
};

/**
 * Creates a custom link entry if it doesn't exist
 * @param path The questionnaire path
 * @param name The name to associate with the path
 */
export const createCustomLink = async (path: string, name: string): Promise<boolean> => {
  try {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://altare.netlify.app';
    const link = `${baseUrl}${normalizedPath}`;
    
    const supabase = getSupabase();
    if (!supabase) {
      console.error('Supabase client is null');
      return false;
    }
    
    // Check if the link already exists
    const { data: existingLink } = await supabase
      .from('custom_links')
      .select('id')
      .eq('questionnaire_path', normalizedPath)
      .maybeSingle();
    
    if (existingLink) {
      // Update existing link
      const { error } = await supabase
        .from('custom_links')
        .update({ name })
        .eq('id', existingLink.id);
      
      if (error) {
        console.error('Error creating link:', error);
        return false;
      }
      return true;
    } else {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return false;
      }
      
      // Create new link
      const { error } = await supabase
        .from('custom_links')
        .insert({ 
          questionnaire_path: normalizedPath, 
          name,
          link,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error creating link:', error);
        return false;
      }
      return true;
    }
  } catch (error) {
    console.error('Error creating custom link:', error);
    return false;
  }
};
