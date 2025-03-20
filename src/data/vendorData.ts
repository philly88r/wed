import { Category } from '../types/vendor';

export interface LocalVendor {
  name: string;
  slug?: string;
  location: string;
  category_id: string;  // UUID of the category
  description?: string;
  social_media?: Record<string, string>;
  contact_info?: Record<string, any>;
  business_hours?: Record<string, any>;
  services_offered?: any[];
  pricing_details?: Record<string, any>;
  gallery_images?: any[];
  amenities?: any[];
  faq?: any[];
  address?: Record<string, any>;
  is_featured?: boolean;
  is_hidden?: boolean;
}

// Define our local categories to match Supabase structure
export const localCategories: Category[] = [
  {
    id: '051803d5-52fc-4b1d-916d-710c758b9df8',  // Music category from Supabase
    name: 'Music',
    slug: 'music',
    icon: 'music_note',
    description: 'DJs, bands, and musicians',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Initial local vendor data
export const localVendors: LocalVendor[] = [
  {
    name: "501 UNION",
    location: "NYC",
    category_id: '051803d5-52fc-4b1d-916d-710c758b9df8',
    description: 'Industrial chic venue in Gowanus',
    is_featured: false,
    is_hidden: false,
    social_media: {},
    contact_info: {},
    business_hours: {},
    services_offered: [],
    pricing_details: {},
    gallery_images: [],
    amenities: [],
    faq: [],
    address: {}
  }
];

// Helper functions for the vendor directory
export const getUniqueCategories = (): Category[] => {
  return localCategories;
};

export const getUniqueLocations = (): string[] => {
  return Array.from(new Set(localVendors.map(vendor => vendor.location)));
};

export const getVendorsByCategory = (categoryId: string): LocalVendor[] => {
  return localVendors.filter(vendor => vendor.category_id === categoryId);
};

export const getVendorsByLocation = (location: string): LocalVendor[] => {
  return localVendors.filter(vendor => vendor.location === location);
};

export const searchVendors = (query: string): LocalVendor[] => {
  const lowerQuery = query.toLowerCase();
  return localVendors.filter(vendor => {
    const category = localCategories.find(c => c.id === vendor.category_id);
    return vendor.name.toLowerCase().includes(lowerQuery) ||
           vendor.location.toLowerCase().includes(lowerQuery) ||
           category?.name.toLowerCase().includes(lowerQuery) ||
           vendor.description?.toLowerCase().includes(lowerQuery);
  });
};
