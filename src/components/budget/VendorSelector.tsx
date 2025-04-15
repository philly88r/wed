import { useState, useEffect } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { getSupabase } from '../../supabaseClient';
import { Vendor } from '../../types/vendor';

interface VendorSelectorProps {
  categoryId: string;
  onSelectVendor: (vendorName: string, categoryId: string) => void;
}

export default function VendorSelector({ categoryId, onSelectVendor }: VendorSelectorProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    if (showModal) {
      fetchVendors();
    }
  }, [showModal, categoryId, searchTerm]);
  
  const fetchVendors = async () => {
    setLoading(true);
    try {
      // Map budget category IDs to vendor category UUIDs based on the database schema
      const categoryMapping: Record<string, string> = {
        'venue': 'bb1f9b43-7c2e-4b3f-a7f1-d92f7c4c3b2e', // Venue
        'catering': 'bb1f9b43-7c2e-4b3f-a7f1-d92f7c4c3b2f', // Catering
        'alcohol': 'bb1f9b43-7c2e-4b3f-a7f1-d92f7c4c3b30', // Alcohol/Beverages
        'rentals': 'bb1f9b43-7c2e-4b3f-a7f1-d92f7c4c3b31', // Rentals
        'florist': 'bb1f9b43-7c2e-4b3f-a7f1-d92f7c4c3b32', // Florist
        'photographer': 'bb1f9b43-7c2e-4b3f-a7f1-d92f7c4c3b33', // Photographer
        'videographer': 'bb1f9b43-7c2e-4b3f-a7f1-d92f7c4c3b34', // Videographer
        'band': 'bb1f9b43-7c2e-4b3f-a7f1-d92f7c4c3b35', // Band/Musicians
        'dj': 'bb1f9b43-7c2e-4b3f-a7f1-d92f7c4c3b36', // DJ
        'cake': 'bb1f9b43-7c2e-4b3f-a7f1-d92f7c4c3b2e', // Cake/Desserts (using same as venue for testing)
        'hairMakeup': 'bb1f9b43-7c2e-4b3f-a7f1-d92f7c4c3b37', // Hair & Makeup
        'transportation': 'bb1f9b43-7c2e-4b3f-a7f1-d92f7c4c3b38', // Transportation
        'officiant': 'bb1f9b43-7c2e-4b3f-a7f1-d92f7c4c3b39', // Officiant
      };
      
      const vendorCategoryId = categoryMapping[categoryId];
      const supabase = getSupabase();
      
      console.log('Fetching vendors for category:', categoryId, 'mapped to vendor_id:', vendorCategoryId);
      
      // Make sure supabase is not null
      if (!supabase) {
        console.error('Supabase client is null');
        setLoading(false);
        return;
      }
      
      // Select all fields we need from the vendors table
      let query = supabase.from('vendors').select('id, name, slug, category_id, location, contact_info, description');
      
      if (vendorCategoryId) {
        // Use the UUID format for category_id as shown in the schema
        query = query.eq('category_id', vendorCategoryId);
      }
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      const { data, error } = await query.limit(10);
      
      if (error) {
        console.error('Error fetching vendors:', error);
        return;
      }
      
      if (data) {
        console.log('Found vendors:', data.length, data);
        // Properly type and convert the data to Vendor[]
        const typedVendors = data.map((item: any) => {
          // Parse the contact_info JSON field
          let contactInfo;
          try {
            contactInfo = typeof item.contact_info === 'string' 
              ? JSON.parse(item.contact_info) 
              : (typeof item.contact_info === 'object' && item.contact_info ? item.contact_info : {});
          } catch (e) {
            console.error('Error parsing contact_info:', e);
            contactInfo = {};
          }
          
          const email = typeof contactInfo === 'object' && 'email' in contactInfo ? String(contactInfo.email || '') : '';
          const phone = typeof contactInfo === 'object' && 'phone' in contactInfo ? String(contactInfo.phone || '') : '';
          const website = typeof contactInfo === 'object' && 'website' in contactInfo ? String(contactInfo.website || '') : '';
          
          // Create a properly typed vendor object matching the database schema
          const vendor: Vendor = {
            id: String(item.id || ''),
            name: String(item.name || ''),
            slug: String(item.slug || ''),
            location: String(item.location || ''),
            category_id: String(item.category_id || ''),
            description: String(item.description || ''),
            contact_info: {
              email,
              phone,
              website
            },
            social_media: {},
            is_featured: Boolean(item.is_featured),
            created_at: String(item.created_at || ''),
            updated_at: String(item.updated_at || ''),
            email,
            phone,
            website
          };
          
          return vendor;
        });
        setVendors(typedVendors);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectVendor = (vendorName: string) => {
    onSelectVendor(vendorName, categoryId);
    setShowModal(false);
    setSearchTerm('');
  };
  
  return (
    <div style={{ marginTop: '8px' }}>
      <button
        onClick={() => {
          setShowModal(true);
          fetchVendors();
        }}
        className="flex items-center text-sm"
        style={{ 
          color: '#054697',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 400
        }}
      >
        <Search size={16} className="mr-1" />
        Select from Vendor Directory
      </button>
      
      {showModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999999
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              width: '350px',
              maxHeight: '80vh',
              overflowY: 'auto',
              border: '2px solid #054697',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-lg font-medium text-[#054697]">
                  Select Vendor
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-[#054697] hover:text-[#032d61]"
                >
                  <X size={20} />
                </button>
              </div>
              
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vendors..."
                className="w-full p-2 mb-4 border border-[#B8BDD7] focus:ring-[#054697] focus:border-[#054697]"
                style={{ 
                  fontFamily: 'Poppins, sans-serif', 
                  color: '#054697'
                }}
              />
              
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 size={24} className="animate-spin text-[#054697]" />
                  <span className="ml-2 text-[#054697]">Loading vendors...</span>
                </div>
              ) : vendors.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {vendors.map(vendor => (
                    <div 
                      key={vendor.id}
                      className="p-3 hover:bg-[#FFE8E4] cursor-pointer border-b border-[#B8BDD7] last:border-b-0"
                      onClick={() => handleSelectVendor(vendor.name)}
                    >
                      <div className="font-medium text-[#054697]">{vendor.name}</div>
                      {vendor.location && <div className="text-sm text-[#054697] opacity-80">{vendor.location}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="text-[#054697] font-medium">No vendors found</div>
                  <div className="text-sm text-[#054697] opacity-80 mt-2">Try a different search term</div>
                </div>
              )}
              
              <div className="mt-4 pt-3 border-t border-[#B8BDD7]">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full p-2 text-center"
                  style={{ 
                    backgroundColor: '#FFE8E4', 
                    color: '#054697',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 400,
                    textTransform: 'uppercase'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
