import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Create a Supabase client with the correct API key provided by the user
const supabaseUrl = 'https://yemkduykvfdjmldxfphq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbWtkdXlrdmZkam1sZHhmcGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NDY4NzQsImV4cCI6MjA1NTEyMjg3NH0.JoIg1NFwFPE8ucc7D4Du2qe8SEX3OvSKqJf_ecf-euk';

// Use a singleton pattern to ensure only one instance is created
let supabaseInstance: SupabaseClient | null = null;

// Initialize the Supabase client
function createSupabaseClient(): SupabaseClient {
  // Only create a new client if one doesn't exist
  if (!supabaseInstance) {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        storageKey: 'supabase_auth_token',
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      },
    });
    
    // Set up auth state change listener to persist session
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in:', session.user.email);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
    });
    
    supabaseInstance = client;
  }
  
  return supabaseInstance;
}

// Initialize the client immediately
const supabase = createSupabaseClient();

// Export a function to get the Supabase client
export const getSupabase = (): SupabaseClient => {
  return supabase;
};

// Export the supabase instance directly for backward compatibility
// This ensures there's only one instance throughout the app
export { supabase };
