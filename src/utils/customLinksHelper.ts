import { supabase } from '../supabaseClient';

/**
 * Helper function to safely fetch custom links data
 * @param path The questionnaire path to look up
 * @returns The name associated with the path or null if not found
 */
export const getCustomLinkName = async (path: string): Promise<string | null> => {
  try {
    // Add leading slash if not present
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    const { data, error } = await supabase
      .from('custom_links')
      .select('name')
      .eq('questionnaire_path', normalizedPath)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching custom link:', error);
      return null;
    }
    
    return data?.name || null;
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
      
      return !error;
    } else {
      // Create new link
      const { error } = await supabase
        .from('custom_links')
        .insert({ questionnaire_path: normalizedPath, name });
      
      return !error;
    }
  } catch (error) {
    console.error('Error creating custom link:', error);
    return false;
  }
};
