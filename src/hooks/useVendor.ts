import { useState, useEffect } from 'react';
import { supabase, VendorProfile } from '../lib/supabase';

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

        if (supabaseError) throw supabaseError;
        if (data) setVendor(data as VendorProfile);
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
