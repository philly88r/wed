import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  Alert,
  ImageList,
  ImageListItem,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

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

interface GalleryImage {
  id: string;
  url: string;
  alt_text?: string;
  caption?: string;
  order?: number;
  is_featured?: boolean;
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
  gallery_images: GalleryImage[];
  gallery_limit: number; 
  video_link?: string;
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
  const [newImageUrl, setNewImageUrl] = useState('');
  const theme = useTheme();
  
  const initialData: FormData = {
    name: '',
    slug: '',
    category_id: '',
    description: '',
    location: '',
    is_featured: false,
    is_hidden: false,
    contact_info: {
      email: '',
      phone: '',
      website: '',
    },
    social_media: {
      instagram: '',
      facebook: '',
      twitter: '',
      website: '',
    },
    pricing_tier: {
      tier: '$',
      avg_price: null,
    },
    pricing_details: {
      tier: '$',
      packages: [],
      price_range: {
        min: 0,
        max: 0,
        currency: '$',
      },
    },
    availability: {
      lead_time_days: 30,
      peak_season: [],
      off_peak_season: [],
    },
    services_offered: [],
    amenities: {},
    gallery_images: [],
    gallery_limit: 10, 
    video_link: '',
    faq: [],
  };

  const [formData, setFormData] = useState<FormData>(initialData);

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
        
        const formattedData: FormData = {
          name: data.name || '',
          category_id: data.category_id || '',
          description: data.description || '',
          location: data.location || '',
          is_featured: !!data.is_featured,
          is_hidden: !!data.is_hidden,
          
          contact_info: {
            email: data.contact_info?.email || '',
            phone: data.contact_info?.phone || '',
            website: data.contact_info?.website || ''
          },
          
          social_media: {
            instagram: data.social_media?.instagram || '',
            facebook: data.social_media?.facebook || '',
            website: data.social_media?.website || '',
            twitter: data.social_media?.twitter || ''
          },
          
          pricing_tier: {
            tier: data.pricing_tier?.tier || 'budget',
            avg_price: data.pricing_tier?.avg_price || null
          },
          
          pricing_details: {
            tier: data.pricing_details?.tier || 'unset',
            packages: Array.isArray(data.pricing_details?.packages) ? data.pricing_details.packages : [],
            price_range: {
              min: data.pricing_details?.price_range?.min || 0,
              max: data.pricing_details?.price_range?.max || 0,
              currency: data.pricing_details?.price_range?.currency || 'USD'
            }
          },
          
          availability: {
            lead_time_days: data.availability?.lead_time_days || 0,
            peak_season: Array.isArray(data.availability?.peak_season) ? data.availability.peak_season : [],
            off_peak_season: Array.isArray(data.availability?.off_peak_season) ? data.availability.off_peak_season : []
          },
          
          services_offered: Array.isArray(data.services_offered) ? data.services_offered : [],
          amenities: data.amenities || {},
          gallery_images: Array.isArray(data.gallery_images) ? data.gallery_images : [],
          gallery_limit: data.gallery_limit || 10, 
          video_link: data.video_link,
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

  // Generate a slug from a string (name)
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Check if a slug exists in the database
  const checkSlugExists = async (slug: string, excludeId?: string): Promise<boolean> => {
    let query = supabase
      .from('vendors')
      .select('id')
      .eq('slug', slug);
    
    // If we're updating an existing vendor, exclude its ID from the check
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error checking slug:', error);
      return true; // Assume it exists to be safe
    }
    
    return data && data.length > 0;
  };

  // Generate a unique slug
  const generateUniqueSlug = async (baseName: string, excludeId?: string): Promise<string> => {
    let slug = generateSlug(baseName);
    let exists = await checkSlugExists(slug, excludeId);
    let counter = 1;
    
    // If the slug exists, append a number until we find a unique one
    while (exists && counter < 100) { // Limit to prevent infinite loops
      slug = `${generateSlug(baseName)}-${counter}`;
      exists = await checkSlugExists(slug, excludeId);
      counter++;
    }
    
    return slug;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // If the name field is being changed, update the slug field too
    if (name === 'name' && value !== formData.name) {
      // We'll update the slug asynchronously
      generateUniqueSlug(value, vendorId).then(uniqueSlug => {
        setFormData(prev => ({
          ...prev,
          slug: uniqueSlug
        }));
      });
    }
    
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
      
      // Only generate a new slug if one doesn't exist or if the name has changed
      // First, get the original vendor data to compare
      const { data: originalVendor } = await supabase
        .from('vendors')
        .select('name, slug')
        .eq('id', vendorId)
        .single();
      
      let slugToUse = formData.slug;
      
      // If there's no slug or the name has changed from the original, we need to ensure a unique slug
      if (!slugToUse || (originalVendor && formData.name !== originalVendor.name)) {
        // If we already have a slug and the name hasn't changed, keep using the existing slug
        if (originalVendor && originalVendor.slug && formData.name === originalVendor.name) {
          slugToUse = originalVendor.slug;
        } else {
          // Generate a new slug based on the new name
          slugToUse = await generateUniqueSlug(formData.name, vendorId);
        }
      }

      const { error } = await supabase
        .from('vendors')
        .update({
          name: formData.name,
          slug: slugToUse,
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
          gallery_limit: formData.gallery_limit, 
          video_link: formData.video_link,
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
      
      {/* Display current slug information */}
      {formData.slug && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Your profile URL will be: /vendors/{formData.slug}
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
                <Checkbox
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
                <Checkbox
                  checked={formData.is_hidden}
                  onChange={handleCheckboxChange}
                  name="is_hidden"
                  color="primary"
                />
              }
              label="Hidden Profile"
            />
          </Grid>
          
          {/* Gallery Section */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 4, mb: 2, color: theme.palette.primary.main }}>
              Photo Gallery & Video
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.primary }}>
              You can upload up to 10 photos and add a video link
            </Typography>
            
            {/* Gallery Images */}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Gallery Images ({formData.gallery_images.length}/10)
                  </Typography>
                  
                  {formData.gallery_images.length > 0 ? (
                    <ImageList sx={{ width: '100%', height: 'auto' }} cols={3} gap={8}>
                      {formData.gallery_images.map((image, index) => (
                        <ImageListItem key={index} sx={{ position: 'relative' }}>
                          <img
                            src={image.url}
                            alt={image.alt_text || `Gallery image ${index + 1}`}
                            loading="lazy"
                            style={{ 
                              height: '120px',
                              width: '100%',
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 5,
                              right: 5,
                              bgcolor: 'rgba(255, 255, 255, 0.7)',
                              '&:hover': {
                                bgcolor: 'rgba(255, 0, 0, 0.7)',
                                color: 'white'
                              }
                            }}
                            onClick={() => {
                              const updatedImages = [...formData.gallery_images];
                              updatedImages.splice(index, 1);
                              setFormData({ ...formData, gallery_images: updatedImages });
                            }}
                          >
                            ✕
                          </IconButton>
                        </ImageListItem>
                      ))}
                    </ImageList>
                  ) : (
                    <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontStyle: 'italic' }}>
                      No gallery images added yet.
                    </Typography>
                  )}
                  
                  {formData.gallery_images.length < 10 && (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="Add Image URL (photos only)"
                        placeholder="https://example.com/image.jpg"
                        margin="normal"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Button 
                                variant="contained" 
                                color="primary"
                                disabled={!newImageUrl}
                                onClick={() => {
                                  if (newImageUrl) {
                                    const newImage: GalleryImage = {
                                      id: `img-${Date.now()}`,
                                      url: newImageUrl,
                                      alt_text: `Gallery image ${formData.gallery_images.length + 1}`,
                                      order: formData.gallery_images.length
                                    };
                                    setFormData({
                                      ...formData,
                                      gallery_images: [...formData.gallery_images, newImage]
                                    });
                                    setNewImageUrl('');
                                  }
                                }}
                              >
                                Add
                              </Button>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Box>
                  )}
                </Paper>
              </Grid>
              
              {/* Video Link - Available for all vendors */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                  Video Showcase
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.primary }}>
                  Add a video link to showcase your work (YouTube, Vimeo, etc.)
                </Typography>
                <TextField
                  fullWidth
                  label="Video Showcase Link (e.g. https://youtube.com/watch?v=example)"
                  name="video_link"
                  value={formData.video_link || ''}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/watch?v=example"
                  helperText="Add a link to your video showcase (YouTube, Vimeo, etc.)"
                  margin="normal"
                />
              </Grid>
            </Grid>
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
