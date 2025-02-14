import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdqbcvqvmyxjvzqhxnxe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkcWJjdnF2bXl4anZ6cWh4bnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5MjgzMzUsImV4cCI6MjAyMzUwNDMzNX0.Nf0ABCZMmw_LYWyPY5KPXpgBhQWqWGf9JVuSGvYj0Hs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type Profile = {
  id: string;
  created_at: string;
  updated_at: string;
  role: 'admin' | 'user';
  email: string;
  full_name: string | null;
  partner_name: string | null;
  wedding_date: string | null;
  wedding_location: string | null;
  guest_count: number | null;
  budget: number | null;
  onboarding_completed: boolean;
};
