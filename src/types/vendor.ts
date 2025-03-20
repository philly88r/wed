export interface SocialMedia {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  whatsapp?: string;
  contact_name?: string;
}

export interface BusinessHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  notes?: string;
}

export interface ServicesOffered {
  name: string;
  description?: string;
  price_range?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface PricingDetails {
  base_price?: number;
  currency?: string;
  packages?: Array<{
    name: string;
    price: number;
    description?: string;
    included_services?: string[];
  }>;
}

export interface GalleryImage {
  url: string;
  caption?: string;
  alt?: string;
  order?: number;
}

export interface Amenity {
  name: string;
  description?: string;
  icon?: string;
}

export interface FAQ {
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

export interface Category {
  id: string;  // UUID
  name: string;
  slug: string;
  icon: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;  // UUID
  name: string;
  slug: string;
  category_id: string;  // UUID reference to Category
  category?: Category;  // Joined data from vendor_categories
  location: string;
  description?: string;
  address?: Address;
  contact_info?: ContactInfo;
  social_media?: SocialMedia;
  business_hours?: BusinessHours;
  services_offered?: ServicesOffered[];
  pricing_details?: PricingDetails;
  gallery_images?: GalleryImage[];
  amenities?: Amenity[];
  faq?: FAQ[];
  is_featured: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}
