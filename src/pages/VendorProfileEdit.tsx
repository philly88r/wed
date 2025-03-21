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
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  InputAdornment,
  Rating
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  Save as SaveIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Vendor } from '../types/vendor';

type FormData = Omit<Vendor, 'id' | 'category' | 'slug' | 'is_hidden' | 'created_at' | 'updated_at'>;

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
    pricing_tier: {
      tier: 'budget',
      price_range: {
        min: 0,
        max: 0,
        currency: 'USD'
      },
      deposit_required: {
        percentage: 0,
        amount: 0,
        currency: 'USD'
      },
      payment_methods: [],
      cancellation_policy: ''
    },
    availability: {
      lead_time_days: 0,
      peak_season: [],
      off_peak_season: [],
      travel_zones: [],
      calendar_sync_enabled: false,
      calendar_url: null
    },
    experience: {
      years_in_business: 0,
      weddings_completed: 0,
      awards: [],
      certifications: [],
      insurance: {
        has_insurance: false,
        coverage_details: ''
      },
      associations: [],
      media_features: []
    },
    portfolio: {
      videos: [],
      photos: [],
      testimonials: [],
      featured_work: [],
      sample_work: []
    },
    customization_options: {
      package_addons: [],
      special_requests_policy: '',
      cultural_expertise: [],
      multi_day_events: {
        available: false,
        details: ''
      },
      equipment: []
    },
    team_info: {
      size: 0,
      roles: [],
      backup_policy: '',
      members: [],
      languages: [],
      dress_code: ''
    },
    logistics: {
      setup_time_minutes: 0,
      breakdown_time_minutes: 0,
      space_requirements: '',
      technical_requirements: [],
      parking_needs: '',
      weather_policy: ''
    },
    collaboration: {
      preferred_vendors: [],
      venue_partnerships: [],
      package_deals: [],
      coordinator_experience: ''
    },
    contact_info: {
      email: '',
      phone: ''
    },
    social_media: {
      instagram: '',
      facebook: ''
    },
    is_featured: false
  });

  const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    
    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
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
  }, [vendorId]);

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
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single();

      if (error) throw error;

      if (data) {
        console.log('Raw vendor data:', data);
        
        // Ensure portfolio exists with proper structure
        const portfolio = {
          videos: [],
          photos: [],
          featured_work: [],
          sample_work: [],
          ...data.portfolio || {},
          // Ensure testimonials is an array
          testimonials: Array.isArray(data.portfolio?.testimonials) ? data.portfolio.testimonials : []
        };

        console.log('Processed portfolio:', portfolio);

        const formattedData = {
          ...data,
          portfolio,
          pricing_tier: data.pricing_tier || {
            tier: 'budget',
            price_range: { min: 0, max: 0, currency: 'USD' },
            deposit_required: { percentage: 0, amount: 0, currency: 'USD' },
            payment_methods: [],
            cancellation_policy: ''
          }
        };

        console.log('Setting form data:', formattedData);
        setFormData(formattedData);
      }
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching vendor data:', err);
      setError('Failed to load vendor data');
      setLoading(false);
    }
  };

  const handleAddTestimonial = () => {
    setFormData(prev => ({
      ...prev,
      portfolio: {
        ...prev.portfolio,
        testimonials: [
          ...(Array.isArray(prev.portfolio?.testimonials) ? prev.portfolio.testimonials : []),
          {
            client_name: '',
            date: new Date().toISOString().split('T')[0],
            rating: 5,
            text: '',
            photos: []
          }
        ]
      }
    }));
  };

  const handleUpdateTestimonial = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const testimonials = Array.isArray(prev.portfolio?.testimonials) ? [...prev.portfolio.testimonials] : [];
      testimonials[index] = {
        ...testimonials[index],
        [field]: value
      };
      return {
        ...prev,
        portfolio: {
          ...prev.portfolio,
          testimonials
        }
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          name: formData.name,
          category_id: formData.category_id,
          description: formData.description,
          location: formData.location,
          pricing_tier: formData.pricing_tier,
          availability: formData.availability,
          experience: formData.experience,
          portfolio: formData.portfolio,
          customization_options: formData.customization_options,
          team_info: formData.team_info,
          logistics: formData.logistics,
          collaboration: formData.collaboration,
          contact_info: formData.contact_info,
          social_media: formData.social_media,
          is_featured: formData.is_featured
        })
        .eq('id', vendorId);

      if (error) throw error;
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      console.error('Error updating vendor:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!name) return;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (!name) return;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const uploadVendorPhoto = async (file: File, vendorId: string): Promise<string | null> => {
    try {
      const { error } = await supabase.storage
        .from('vendor-photos')
        .upload(`${vendorId}/${Date.now()}-${file.name}`, file, {
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('vendor-photos')
        .getPublicUrl(`${vendorId}/${Date.now()}-${file.name}`);

      return publicUrl;
    } catch (err) {
      console.error('Error uploading photo:', err);
      return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Profile
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

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Business Name"
                name="name"
                value={formData.name}
                onChange={handleTextChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleSelectChange}
                  required
                >
                  {categories.map(category => (
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
                onChange={handleTextChange}
                multiline
                rows={4}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleTextChange}
                required
              />
            </Grid>

            {/* Pricing Tier */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Pricing
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Select Your Price Range</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant={formData.pricing_tier.tier === 'budget' ? 'contained' : 'outlined'}
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    pricing_tier: {
                      ...prev.pricing_tier,
                      tier: 'budget'
                    }
                  }))}
                  sx={{
                    minWidth: 120,
                    bgcolor: formData.pricing_tier.tier === 'budget' ? 'primary.main' : 'transparent',
                    color: formData.pricing_tier.tier === 'budget' ? 'white' : 'text.primary',
                    '&:hover': {
                      bgcolor: formData.pricing_tier.tier === 'budget' ? 'primary.dark' : 'action.hover'
                    }
                  }}
                >
                  <Typography variant="h6">$</Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>Budget</Typography>
                </Button>

                <Button
                  variant={formData.pricing_tier.tier === 'mid_range' ? 'contained' : 'outlined'}
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    pricing_tier: {
                      ...prev.pricing_tier,
                      tier: 'mid_range'
                    }
                  }))}
                  sx={{
                    minWidth: 120,
                    bgcolor: formData.pricing_tier.tier === 'mid_range' ? 'primary.main' : 'transparent',
                    color: formData.pricing_tier.tier === 'mid_range' ? 'white' : 'text.primary',
                    '&:hover': {
                      bgcolor: formData.pricing_tier.tier === 'mid_range' ? 'primary.dark' : 'action.hover'
                    }
                  }}
                >
                  <Typography variant="h6">$$</Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>Mid-Range</Typography>
                </Button>

                <Button
                  variant={formData.pricing_tier.tier === 'premium' ? 'contained' : 'outlined'}
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    pricing_tier: {
                      ...prev.pricing_tier,
                      tier: 'premium'
                    }
                  }))}
                  sx={{
                    minWidth: 120,
                    bgcolor: formData.pricing_tier.tier === 'premium' ? 'primary.main' : 'transparent',
                    color: formData.pricing_tier.tier === 'premium' ? 'white' : 'text.primary',
                    '&:hover': {
                      bgcolor: formData.pricing_tier.tier === 'premium' ? 'primary.dark' : 'action.hover'
                    }
                  }}
                >
                  <Typography variant="h6">$$$</Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>Premium</Typography>
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price Range Min"
                name="pricing_tier.price_range.min"
                value={formData.pricing_tier.price_range.min}
                onChange={handleNestedChange}
                type="number"
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price Range Max"
                name="pricing_tier.price_range.max"
                value={formData.pricing_tier.price_range.max}
                onChange={handleNestedChange}
                type="number"
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>

            {/* Availability */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Availability
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lead Time Days"
                name="availability.lead_time_days"
                value={formData.availability.lead_time_days}
                onChange={handleNestedChange}
                type="number"
                required
              />
            </Grid>

            {/* Experience */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Experience
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Years in Business"
                name="experience.years_in_business"
                value={formData.experience.years_in_business}
                onChange={handleNestedChange}
                type="number"
                required
              />
            </Grid>

            {/* Portfolio */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Portfolio
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Videos</Typography>
              {formData.portfolio.videos.map((video, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Video URL"
                      name={`portfolio.videos.${index}.url`}
                      value={video.url}
                      onChange={(e) => {
                        const newVideos = [...formData.portfolio.videos];
                        newVideos[index] = { ...video, url: e.target.value };
                        setFormData(prev => ({
                          ...prev,
                          portfolio: { ...prev.portfolio, videos: newVideos }
                        }));
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Title"
                      name={`portfolio.videos.${index}.title`}
                      value={video.title}
                      onChange={(e) => {
                        const newVideos = [...formData.portfolio.videos];
                        newVideos[index] = { ...video, title: e.target.value };
                        setFormData(prev => ({
                          ...prev,
                          portfolio: { ...prev.portfolio, videos: newVideos }
                        }));
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Description"
                      name={`portfolio.videos.${index}.description`}
                      value={video.description}
                      onChange={(e) => {
                        const newVideos = [...formData.portfolio.videos];
                        newVideos[index] = { ...video, description: e.target.value };
                        setFormData(prev => ({
                          ...prev,
                          portfolio: { ...prev.portfolio, videos: newVideos }
                        }));
                      }}
                    />
                  </Grid>
                </Grid>
              ))}
              <Button
                variant="outlined"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    portfolio: {
                      ...prev.portfolio,
                      videos: [...prev.portfolio.videos, { url: '', title: '', description: '' }]
                    }
                  }));
                }}
                sx={{ mt: 1 }}
              >
                Add Video
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Photos</Typography>
              <Grid container spacing={2}>
                {formData.portfolio.photos.map((photo, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="200"
                        image={photo.url}
                        alt={photo.caption || 'Portfolio photo'}
                      />
                      <CardContent>
                        <TextField
                          fullWidth
                          label="Caption"
                          value={photo.caption}
                          onChange={(e) => {
                            const newPhotos = [...formData.portfolio.photos];
                            newPhotos[index] = { ...photo, caption: e.target.value };
                            setFormData(prev => ({
                              ...prev,
                              portfolio: { ...prev.portfolio, photos: newPhotos }
                            }));
                          }}
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => {
                            const newPhotos = [...formData.portfolio.photos];
                            newPhotos.splice(index, 1);
                            setFormData(prev => ({
                              ...prev,
                              portfolio: { ...prev.portfolio, photos: newPhotos }
                            }));
                          }}
                        >
                          Remove
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CardContent>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="photo-upload"
                        type="file"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const vendorId = sessionStorage.getItem('vendorId');
                          if (!vendorId) {
                            console.error('No vendor ID found');
                            return;
                          }

                          try {
                            const url = await uploadVendorPhoto(file, vendorId);
                            if (url) {
                              setFormData(prev => ({
                                ...prev,
                                portfolio: {
                                  ...prev.portfolio,
                                  photos: [
                                    ...prev.portfolio.photos,
                                    { url, caption: '' }
                                  ]
                                }
                              }));
                            }
                          } catch (error) {
                            console.error('Error uploading photo:', error);
                          }
                        }}
                      />
                      <label htmlFor="photo-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<AddPhotoAlternateIcon />}
                        >
                          Upload Photo
                        </Button>
                      </label>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Reviews/Testimonials */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Reviews & Testimonials
              </Typography>
              {Array.isArray(formData.portfolio?.testimonials) && formData.portfolio.testimonials.map((testimonial, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Client Name"
                          value={testimonial.client_name || ''}
                          onChange={(e) => handleUpdateTestimonial(index, 'client_name', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Review Date"
                          value={testimonial.date || new Date().toISOString().split('T')[0]}
                          onChange={(e) => handleUpdateTestimonial(index, 'date', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography component="legend">Rating</Typography>
                          <Rating
                            value={testimonial.rating || 5}
                            onChange={(_, newValue) => handleUpdateTestimonial(index, 'rating', newValue || 0)}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Review Text"
                          value={testimonial.text || ''}
                          onChange={(e) => handleUpdateTestimonial(index, 'text', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id={`review-photo-${index}`}
                          type="file"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            const vendorId = sessionStorage.getItem('vendorId');
                            if (!vendorId) return;

                            const url = await uploadVendorPhoto(file, vendorId);
                            if (!url) return;

                            handleUpdateTestimonial(index, 'photos', [...(testimonial.photos || []), url]);
                          }}
                        />
                        <label htmlFor={`review-photo-${index}`}>
                          <Button
                            component="span"
                            variant="outlined"
                            startIcon={<AddPhotoAlternateIcon />}
                            sx={{ mt: 1 }}
                          >
                            Add Photo
                          </Button>
                        </label>
                      </Grid>
                      {testimonial.photos?.length > 0 && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Review Photos
                          </Typography>
                          <Grid container spacing={1}>
                            {testimonial.photos.map((photo, photoIndex) => (
                              <Grid item key={photoIndex}>
                                <Card sx={{ position: 'relative', width: 100, height: 100 }}>
                                  <CardMedia
                                    component="img"
                                    height="100"
                                    image={photo}
                                    alt={`Review photo ${photoIndex + 1}`}
                                  />
                                  <IconButton
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      right: 0,
                                      bgcolor: 'background.paper',
                                      '&:hover': { bgcolor: 'error.light', color: 'white' }
                                    }}
                                    onClick={() => {
                                      const newPhotos = [...testimonial.photos];
                                      newPhotos.splice(photoIndex, 1);
                                      handleUpdateTestimonial(index, 'photos', newPhotos);
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        const newTestimonials = [...(formData.portfolio?.testimonials || [])];
                        newTestimonials.splice(index, 1);
                        setFormData(prev => ({
                          ...prev,
                          portfolio: {
                            ...prev.portfolio,
                            testimonials: newTestimonials
                          }
                        }));
                      }}
                    >
                      Remove
                    </Button>
                  </CardActions>
                </Card>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddTestimonial}
                sx={{ mt: 1 }}
              >
                Add Testimonial
              </Button>
            </Grid>

            {/* Customization Options */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Customization Options
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Package Add-ons</Typography>
              {formData.customization_options.package_addons.map((addon, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Name"
                      name={`customization_options.package_addons.${index}.name`}
                      value={addon.name}
                      onChange={(e) => {
                        const newAddons = [...formData.customization_options.package_addons];
                        newAddons[index] = { ...addon, name: e.target.value };
                        setFormData(prev => ({
                          ...prev,
                          customization_options: {
                            ...prev.customization_options,
                            package_addons: newAddons
                          }
                        }));
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Price"
                      name={`customization_options.package_addons.${index}.price`}
                      value={addon.price}
                      onChange={(e) => {
                        const newAddons = [...formData.customization_options.package_addons];
                        newAddons[index] = { ...addon, price: Number(e.target.value) };
                        setFormData(prev => ({
                          ...prev,
                          customization_options: {
                            ...prev.customization_options,
                            package_addons: newAddons
                          }
                        }));
                      }}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Description"
                      name={`customization_options.package_addons.${index}.description`}
                      value={addon.description}
                      onChange={(e) => {
                        const newAddons = [...formData.customization_options.package_addons];
                        newAddons[index] = { ...addon, description: e.target.value };
                        setFormData(prev => ({
                          ...prev,
                          customization_options: {
                            ...prev.customization_options,
                            package_addons: newAddons
                          }
                        }));
                      }}
                    />
                  </Grid>
                </Grid>
              ))}
              <Button
                variant="outlined"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    customization_options: {
                      ...prev.customization_options,
                      package_addons: [
                        ...prev.customization_options.package_addons,
                        { name: '', price: 0, description: '' }
                      ]
                    }
                  }));
                }}
                sx={{ mt: 1 }}
              >
                Add Package Add-on
              </Button>
            </Grid>

            {/* Team Info */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Team Info
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Team Size"
                name="team_info.size"
                value={formData.team_info.size}
                onChange={handleNestedChange}
                type="number"
                required
              />
            </Grid>

            {/* Logistics */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Logistics
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Setup Time Minutes"
                name="logistics.setup_time_minutes"
                value={formData.logistics.setup_time_minutes}
                onChange={handleNestedChange}
                type="number"
                required
              />
            </Grid>

            {/* Collaboration */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Collaboration
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Preferred Vendors</Typography>
              {formData.collaboration.preferred_vendors.map((vendor, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Name"
                      name={`collaboration.preferred_vendors.${index}.name`}
                      value={vendor.name}
                      onChange={(e) => {
                        const newVendors = [...formData.collaboration.preferred_vendors];
                        newVendors[index] = { ...vendor, name: e.target.value };
                        setFormData(prev => ({
                          ...prev,
                          collaboration: {
                            ...prev.collaboration,
                            preferred_vendors: newVendors
                          }
                        }));
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Type"
                      name={`collaboration.preferred_vendors.${index}.type`}
                      value={vendor.type}
                      onChange={(e) => {
                        const newVendors = [...formData.collaboration.preferred_vendors];
                        newVendors[index] = { ...vendor, type: e.target.value };
                        setFormData(prev => ({
                          ...prev,
                          collaboration: {
                            ...prev.collaboration,
                            preferred_vendors: newVendors
                          }
                        }));
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Discount"
                      name={`collaboration.preferred_vendors.${index}.discount`}
                      value={vendor.discount}
                      onChange={(e) => {
                        const newVendors = [...formData.collaboration.preferred_vendors];
                        newVendors[index] = { ...vendor, discount: e.target.value };
                        setFormData(prev => ({
                          ...prev,
                          collaboration: {
                            ...prev.collaboration,
                            preferred_vendors: newVendors
                          }
                        }));
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>
                      }}
                    />
                  </Grid>
                </Grid>
              ))}
              <Button
                variant="outlined"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    collaboration: {
                      ...prev.collaboration,
                      preferred_vendors: [
                        ...prev.collaboration.preferred_vendors,
                        { name: '', type: '', discount: '' }
                      ]
                    }
                  }));
                }}
                sx={{ mt: 1 }}
              >
                Add Preferred Vendor
              </Button>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Contact Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="contact_info.email"
                value={formData.contact_info.email}
                onChange={handleNestedChange}
                type="email"
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="contact_info.phone"
                value={formData.contact_info.phone}
                onChange={handleNestedChange}
                required
              />
            </Grid>

            {/* Social Media */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Social Media
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Instagram"
                name="social_media.instagram"
                value={formData.social_media.instagram}
                onChange={handleNestedChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Facebook"
                name="social_media.facebook"
                value={formData.social_media.facebook}
                onChange={handleNestedChange}
              />
            </Grid>

            {/* Save Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                sx={{ mt: 3 }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
