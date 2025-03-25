import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { VendorProfile } from '../lib/supabase';

export const useVendor = (slug?: string) => {
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('No vendor slug provided');
      setLoading(false);
      return;
    }

    const fetchVendor = async () => {
      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from('vendors')
          .select(`
            *,
            category:vendor_categories(*)
          `)
          .eq('slug', slug)
          .single();

        if (supabaseError) {
          console.error('Supabase error:', supabaseError);
          throw supabaseError;
        }
        
        if (data) {
          // Ensure the data structure matches the VendorProfile interface
          const vendorData: VendorProfile = {
            ...data,
            category: data.category ? {
              id: data.category.id || '',
              name: data.category.name || '',
              icon: data.category.icon || '',
              description: data.category.description || '',
              slug: data.category.slug || '',
              created_at: data.category.created_at || '',
              updated_at: data.category.updated_at || ''
            } : null,
            gallery_images: data.gallery_images || [],
            gallery_limit: data.gallery_limit || 2, // Default to 2 for free tier
            video_link: data.video_link || null,
            social_media: data.social_media || {},
            contact_info: data.contact_info || {},
            pricing_tier: data.pricing_tier || {},
            pricing_details: data.pricing_details || {},
            availability: data.availability || {},
            experience: data.experience || {},
            portfolio: data.portfolio || {},
            customization_options: data.customization_options || {},
            team_info: data.team_info || {},
            logistics: data.logistics || {},
            collaboration: data.collaboration || {}
          };
          
          console.log('Vendor data loaded:', vendorData);
          setVendor(vendorData);
        } else {
          setError('Vendor not found');
        }
      } catch (err) {
        console.error('Error fetching vendor:', err);
        setError('Failed to load vendor details');
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [slug]);

  return { vendor, loading, error };
};
