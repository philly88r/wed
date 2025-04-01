import { createClient } from '@supabase/supabase-js';

// In Vite, environment variables are accessed through import.meta.env
const supabaseUrl = 'https://yemkduykvfdjmldxfphq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbWtkdXlrdmZkam1sZHhmcGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NDY4NzQsImV4cCI6MjA1NTEyMjg3NH0.JoIg1NFwFPE8ucc7D4Du2qe8SEX3OvSKqJf_ecf-euk';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Temporary mock data until database is running
export const mockVideos = [
  {
    id: '1',
    title: 'Your Why?',
    description: 'Discover the deeper meaning behind your wedding planning journey and how to create a celebration that truly reflects your values.',
    youtube_id: '-0gAzhbt2TM',
    thumbnail_url: 'https://img.youtube.com/vi/-0gAzhbt2TM/maxresdefault.jpg',
    category: 'Getting Started',
    duration: '8:24',
    has_journal_prompt: true,
    related_feature: null
  }
];

// Types for our database tables
export interface Comment {
  id: string;
  created_at: string;
  section: string;
  content: string;
  commenter_name: string;
  parent_id: string | null;
  resolved: boolean;
  resolved_at: string | null;
}

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

// Types for our enhanced vendor profile
export interface VendorProfile {
  id: string;
  name: string;
  slug: string;
  description?: string;
  location: string;
  category_id: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    description: string;
    slug: string;
    created_at: string;
    updated_at: string;
  } | null;
  is_featured: boolean;
  contact_info: {
    email: string;
    phone: string;
    website?: string;
  };
  email: string;
  phone: string;
  website?: string;
  social_media?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
  };
  gallery_images?: Array<{
    id?: string;
    url: string;
    alt_text?: string;
    caption?: string;
    order?: number;
    is_featured?: boolean;
  }>;
  gallery_limit?: number;
  video_link?: string;
  pricing_tier?: {
    tier: string;
    avg_price?: number;
  };
  pricing_details?: {
    tier: string;
    price_range?: {
      min: number;
      max: number;
      currency: string;
    };
    deposit_required?: {
      percentage: number;
      amount: number;
      currency: string;
    };
    payment_methods?: string[];
    cancellation_policy?: string;
  };
  availability: {
    lead_time_days: number;
    peak_season: string[];
    off_peak_season: string[];
    travel_zones: Array<{
      zone: string;
      radius_miles: number;
      fee: number;
    }>;
    calendar_sync_enabled: boolean;
    calendar_url: string | null;
  };
  experience: {
    years_in_business: number;
    weddings_completed: number;
    awards: string[];
    certifications: string[];
    insurance: {
      has_insurance: boolean;
      coverage_details: string;
    };
    associations: string[];
    media_features: string[];
  };
  portfolio: {
    videos: Array<{
      url: string;
      title: string;
      description: string;
    }>;
    photos: Array<{
      url: string;
      caption: string;
    }>;
    testimonials: Array<{
      client_name: string;
      date: string;
      rating: number;
      text: string;
      photos: string[];
    }>;
  };
  customization_options: {
    package_addons: Array<{
      name: string;
      price: number;
      description: string;
    }>;
    special_requests_policy: string;
    cultural_expertise: string[];
    multi_day_events: {
      available: boolean;
      details: string;
    };
    equipment: string[];
  };
  team_info: {
    size: number;
    roles: string[];
    backup_policy: string;
    members: Array<{
      name: string;
      role: string;
      bio: string;
      photo_url: string;
    }>;
    languages: string[];
    dress_code: string;
  };
  logistics: {
    setup_time_minutes: number;
    breakdown_time_minutes: number;
    space_requirements: string;
    technical_requirements: string[];
    parking_needs: string;
    weather_policy: string;
  };
  collaboration: {
    preferred_vendors: Array<{
      name: string;
      type: string;
      discount: string;
    }>;
    venue_partnerships: Array<{
      venue: string;
      benefits: string;
    }>;
    package_deals: Array<{
      name: string;
      includes: string[];
      discount: string;
    }>;
    coordinator_experience: string;
  };
}

export const VENDOR_PHOTOS_BUCKET = 'vendor-photos';

export async function uploadVendorPhoto(file: File, vendorId: string): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${vendorId}/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from(VENDOR_PHOTOS_BUCKET)
    .upload(fileName, file, {
      upsert: true
    });

  if (error) {
    console.error('Error uploading file:', error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(VENDOR_PHOTOS_BUCKET)
    .getPublicUrl(fileName);

  return publicUrl;
}
