import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the correct credentials
const supabaseUrl = 'https://yemkduykvfdjmldxfphq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbWtkdXlrdmZkam1sZHhmcGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA1NjY0MDAsImV4cCI6MTk5NjE0MjQwMH0.S3-NxrP3OqcXJhKYOv6XPBu1NlOvJmQnSEw6BPrLsXQ';

// Use a singleton pattern to ensure only one instance is created
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      db: {
        schema: 'public',
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      },
    });
  }
  return supabaseInstance;
};

// For backward compatibility with existing code
export const supabase = getSupabase();
