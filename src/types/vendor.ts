export type PriceTier = '$' | '$$' | '$$$';

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface DepositRequired {
  percentage: number;
  amount: number;
  currency: string;
}

export interface PricingDetails {
  tier: string;
  price_range: {
    min: number;
    max: number;
    currency: string;
  };
  deposit_required: {
    percentage: number;
    amount: number;
    currency: string;
  };
  payment_methods: string[];
  cancellation_policy: string;
}

export interface TravelZone {
  zone: string;
  radius_miles: number;
  fee: number;
}

export interface Availability {
  lead_time_days: number;
  peak_season: string[];
  off_peak_season: string[];
  travel_zones: TravelZone[];
  calendar_sync_enabled: boolean;
  calendar_url: string | null;
}

export interface Insurance {
  has_insurance: boolean;
  coverage_details: string;
}

export interface Experience {
  years_in_business: number;
  weddings_completed: number;
  awards: string[];
  certifications: string[];
  insurance: Insurance;
  associations: string[];
  media_features: string[];
}

export interface Video {
  url: string;
  title: string;
  description: string;
}

export interface Photo {
  url: string;
  caption: string;
}

export interface Testimonial {
  client_name: string;
  date: string;
  rating: number;
  text: string;
  photos: string[];
}

export interface Portfolio {
  videos: Video[];
  photos: Photo[];
  testimonials: Testimonial[];
  featured_work: string[];
  sample_work: string[];
}

export interface PackageAddon {
  name: string;
  price: number;
  description: string;
}

export interface MultiDayEvents {
  available: boolean;
  details: string;
}

export interface CustomizationOptions {
  package_addons: PackageAddon[];
  special_requests_policy: string;
  cultural_expertise: string[];
  multi_day_events: MultiDayEvents;
  equipment: string[];
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  photo_url: string;
}

export interface TeamInfo {
  size: number;
  roles: string[];
  backup_policy: string;
  members: TeamMember[];
  languages: string[];
  dress_code: string;
}

export interface Logistics {
  setup_time_minutes: number;
  breakdown_time_minutes: number;
  space_requirements: string;
  technical_requirements: string[];
  parking_needs: string;
  weather_policy: string;
}

export interface PreferredVendor {
  name: string;
  type: string;
  discount: string;
}

export interface VenuePartnership {
  venue: string;
  benefits: string;
}

export interface PackageDeal {
  name: string;
  includes: string[];
  discount: string;
}

export interface Collaboration {
  preferred_vendors: PreferredVendor[];
  venue_partnerships: VenuePartnership[];
  package_deals: PackageDeal[];
  coordinator_experience: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
}

export interface SocialMedia {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
}

export interface GalleryImage {
  url: string;
  title?: string;
  description?: string;
  order?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  description?: string;
  location: string;
  category_id: string;
  category?: Category;
  is_featured: boolean;
  contact_info: {
    email: string;
    phone: string;
    website?: string;
  };
  email: string;
  phone: string;
  website?: string;
  social_media?: SocialMedia;
  gallery_images?: GalleryImage[];
  gallery_limit?: number;
  video_link?: string;
  pricing_tier?: PriceTier;
  pricing_details?: PricingDetails;
  availability?: {
    lead_time_days: number;
    peak_season: string[];
    off_peak_season: string[];
    travel_zones: Array<{
      zone: string;
      fee?: number;
    }>;
  };
  experience?: {
    years_in_business: number;
    weddings_completed: number;
    awards?: string[];
    certifications?: string[];
  };
  team_info?: {
    size: number;
    roles: string[];
    languages: string[];
  };
  logistics?: {
    setup_time: string;
    breakdown_time: string;
    space_requirements?: string;
    technical_requirements?: string[];
    weather_contingency?: string;
  };
  customization_options?: {
    packages: Array<{
      name: string;
      description: string;
      price?: number;
    }>;
    add_ons: Array<{
      name: string;
      description: string;
      price?: number;
    }>;
  };
  created_at: string;
  updated_at: string;
}
