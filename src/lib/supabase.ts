// Import the singleton Supabase client from the main supabaseClient.ts file
import { getSupabase, supabase } from '../supabaseClient';

// Re-export the supabase client for backward compatibility
export { supabase, getSupabase };

// Temporary mock data until database is running
export const mockVideos = [
  {
    id: '1',
    title: 'Your Why?',
    description: 'Discover the deeper meaning behind your wedding planning journey and how to create a celebration that truly reflects your values.',
    youtube_id: 'WHm_U7uyhWg',
    thumbnail_url: 'https://img.youtube.com/vi/WHm_U7uyhWg/maxresdefault.jpg',
    category: 'Getting Started',
    duration: '8:24',
    has_journal_prompt: true,
    related_feature: null
  },
  {
    id: '2',
    title: "Let's Get Started",
    description: 'Begin your wedding planning journey by creating your ideal guest list and organizing your initial thoughts.',
    youtube_id: 'Tcrxki6QgvI',
    thumbnail_url: 'https://img.youtube.com/vi/Tcrxki6QgvI/maxresdefault.jpg',
    category: 'Getting Started',
    duration: '7:15',
    has_journal_prompt: true,
    related_feature: 'directory'
  },
  {
    id: '3',
    title: 'Securing Your Vendor Team',
    description: 'Learn how to select and secure the perfect vendor team for your special day.',
    youtube_id: 'ybWu6R-LWjU',
    thumbnail_url: 'https://img.youtube.com/vi/ybWu6R-LWjU/maxresdefault.jpg',
    category: 'Vendor Planning',
    duration: '6:42',
    has_journal_prompt: true,
    related_feature: 'vendors'
  },
  {
    id: '4',
    title: 'Dividing Your Day',
    description: 'Organize your wedding day timeline to ensure everything runs smoothly.',
    youtube_id: 'DLSV-qkSu98',
    thumbnail_url: 'https://img.youtube.com/vi/DLSV-qkSu98/maxresdefault.jpg',
    category: 'Timeline Planning',
    duration: '8:10',
    has_journal_prompt: true,
    related_feature: 'timeline'
  },
  {
    id: '5',
    title: 'Loose Ends',
    description: 'Tie up any loose ends in your wedding planning process and address final concerns.',
    youtube_id: 'esbxFsnOQT4',
    thumbnail_url: 'https://img.youtube.com/vi/esbxFsnOQT4/maxresdefault.jpg',
    category: 'Progress Check',
    duration: '7:30',
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
