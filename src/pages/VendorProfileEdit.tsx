import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Switch,
  FormControlLabel
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  Save as SaveIcon
} from '@mui/icons-material';

// Define interfaces that match the actual vendor structure in the database
interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

interface SocialMedia {
  instagram: string;
  facebook: string;
  website?: string;
  twitter?: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  website?: string;
}

interface PricingTier {
  tier: string;
  avg_price?: number | null;
}

interface PricingDetails {
  tier: string;
  packages: any[];
  price_range: PriceRange;
}

interface Availability {
  lead_time_days: number;
  peak_season: string[];
  off_peak_season: string[];
}

interface FormData {
  name: string;
  category_id: string;
  description: string;
  location: string;
  is_featured: boolean;
  is_hidden: boolean;
  contact_info: ContactInfo;
  social_media: SocialMedia;
  pricing_tier: PricingTier;
  pricing_details: PricingDetails;
  availability: Availability;
  services_offered: any[];
  amenities: Record<string, any>;
  gallery_images: any[];
  faq: any[];
}

export default function VendorProfileEdit() {
  const navigate = useNavigate();
  const { vendorId } = useParams<{ vendorId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<Array<{ id: string; name: string; icon: string }>>([]);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category_id: '',
    description: '',
    location: '',
    is_featured: false,
    is_hidden: false,
    contact_info: {
      email: '',
      phone: '',
      website: ''
    },
    social_media: {
      instagram: '',
      facebook: '',
      website: ''
    },
    pricing_tier: {
      tier: 'budget',
      avg_price: null
    },
    pricing_details: {
      tier: 'unset',
      packages: [],
      price_range: {
        min: 0,
        max: 0,
        currency: 'USD'
      }
    },
    availability: {
      lead_time_days: 0,
      peak_season: [],
      off_peak_season: []
    },
    services_offered: [],
    amenities: {},
    gallery_images: [],
    faq: []
  });

  const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    
    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        } else {
          current[keys[i]] = { ...current[keys[i]] };
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      handleNestedSelectChange(e);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleNestedSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    
    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        } else {
          current[keys[i]] = { ...current[keys[i]] };
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  useEffect(() => {
    const checkAuth = async () => {
      const storedVendorId = sessionStorage.getItem('vendorId');
      if (!storedVendorId || storedVendorId !== vendorId) {
        navigate('/vendor/login');
        return;
      }
      await fetchVendorData();
      await fetchCategories();
    };

    checkAuth();
  }, [vendorId, navigate]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      if (data) setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    }
  };

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching vendor data for ID:', vendorId);
      
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (data) {
        console.log('Raw vendor data:', data);
        
        // Create a properly structured form data object with all required fields
        const formattedData: FormData = {
          name: data.name || '',
          category_id: data.category_id || '',
          description: data.description || '',
          location: data.location || '',
          is_featured: !!data.is_featured,
          is_hidden: !!data.is_hidden,
          
          // Contact info
          contact_info: {
            email: data.contact_info?.email || '',
            phone: data.contact_info?.phone || '',
            website: data.contact_info?.website || ''
          },
          
          // Social media
          social_media: {
            instagram: data.social_media?.instagram || '',
            facebook: data.social_media?.facebook || '',
            website: data.social_media?.website || '',
            twitter: data.social_media?.twitter || ''
          },
          
          // Pricing tier
          pricing_tier: {
            tier: data.pricing_tier?.tier || 'budget',
            avg_price: data.pricing_tier?.avg_price || null
          },
          
          // Pricing details
          pricing_details: {
            tier: data.pricing_details?.tier || 'unset',
            packages: Array.isArray(data.pricing_details?.packages) ? data.pricing_details.packages : [],
            price_range: {
              min: data.pricing_details?.price_range?.min || 0,
              max: data.pricing_details?.price_range?.max || 0,
              currency: data.pricing_details?.price_range?.currency || 'USD'
            }
          },
          
          // Availability
          availability: {
            lead_time_days: data.availability?.lead_time_days || 0,
            peak_season: Array.isArray(data.availability?.peak_season) ? data.availability.peak_season : [],
            off_peak_season: Array.isArray(data.availability?.off_peak_season) ? data.availability.off_peak_season : []
          },
          
          // Services and amenities
          services_offered: Array.isArray(data.services_offered) ? data.services_offered : [],
          amenities: data.amenities || {},
          gallery_images: Array.isArray(data.gallery_images) ? data.gallery_images : [],
          faq: Array.isArray(data.faq) ? data.faq : []
        };

        console.log('Setting form data:', formattedData);
        setFormData(formattedData);
      }
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching vendor data:', err);
      setError('Failed to load vendor data: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      console.log('Submitting form data:', formData);
      
      const { error } = await supabase
        .from('vendors')
        .update({
          name: formData.name,
          category_id: formData.category_id,
          description: formData.description,
          location: formData.location,
          is_featured: formData.is_featured,
          is_hidden: formData.is_hidden,
          contact_info: formData.contact_info,
          social_media: formData.social_media,
          pricing_tier: formData.pricing_tier,
          pricing_details: formData.pricing_details,
          availability: formData.availability,
          services_offered: formData.services_offered,
          amenities: formData.amenities,
          gallery_images: formData.gallery_images,
          faq: formData.faq,
          updated_at: new Date()
        })
        .eq('id', vendorId);

      if (error) throw error;
      
      setSuccess('Profile updated successfully!');
      setSaving(false);
    } catch (err: any) {
      console.error('Error updating vendor profile:', err);
      setError('Failed to update profile: ' + (err.message || 'Unknown error'));
      setSaving(false);
    }
  };

  const pricingTierOptions = [
    { value: '$', label: '$ (Budget)' },
    { value: '$$', label: '$$ (Mid-Range)' },
    { value: '$$$', label: '$$$ (Premium)' }
  ];

  if (loading) {
    return (
      <Container sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Vendor Profile
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Vendor Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                name="category_id"
                value={formData.category_id}
                onChange={handleSelectChange}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={4}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="pricing-tier-label">Pricing Tier</InputLabel>
              <Select
                labelId="pricing-tier-label"
                name="pricing_details.tier"
                value={formData.pricing_details?.tier || '$'}
                onChange={handleNestedSelectChange}
                label="Pricing Tier"
              >
                {pricingTierOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              name="contact_info.email"
              value={formData.contact_info.email}
              onChange={handleNestedChange}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              name="contact_info.phone"
              value={formData.contact_info.phone}
              onChange={handleNestedChange}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Website"
              name="contact_info.website"
              value={formData.contact_info.website || ''}
              onChange={handleNestedChange}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Instagram"
              name="social_media.instagram"
              value={formData.social_media.instagram}
              onChange={handleNestedChange}
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">@</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Facebook"
              name="social_media.facebook"
              value={formData.social_media.facebook}
              onChange={handleNestedChange}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Minimum Price ($)"
              name="pricing_details.price_range.min"
              value={formData.pricing_details.price_range.min}
              onChange={(e) => handleNestedChange({
                target: { 
                  name: 'pricing_details.price_range.min', 
                  value: e.target.value 
                }
              } as React.ChangeEvent<HTMLInputElement>)}
              margin="normal"
              type="number"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Maximum Price ($)"
              name="pricing_details.price_range.max"
              value={formData.pricing_details.price_range.max}
              onChange={(e) => handleNestedChange({
                target: { 
                  name: 'pricing_details.price_range.max', 
                  value: e.target.value 
                }
              } as React.ChangeEvent<HTMLInputElement>)}
              margin="normal"
              type="number"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Lead Time (days)"
              name="availability.lead_time_days"
              value={formData.availability.lead_time_days}
              onChange={(e) => handleNestedChange({
                target: { 
                  name: 'availability.lead_time_days', 
                  value: e.target.value 
                }
              } as React.ChangeEvent<HTMLInputElement>)}
              margin="normal"
              type="number"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_featured}
                  onChange={handleCheckboxChange}
                  name="is_featured"
                  color="primary"
                />
              }
              label="Featured Vendor"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_hidden}
                  onChange={handleCheckboxChange}
                  name="is_hidden"
                  color="primary"
                />
              }
              label="Hidden Profile"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={24} /> : <SaveIcon />}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}
