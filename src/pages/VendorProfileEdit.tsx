import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  Save as SaveIcon,
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
    address: { street: '', city: '', state: '', zip: '' },
    contact_info: { email: '', phone: '', whatsapp: '', contact_name: '' },
    social_media: { instagram: '', facebook: '', twitter: '', website: '' },
    business_hours: {
      monday: '', tuesday: '', wednesday: '', thursday: '',
      friday: '', saturday: '', sunday: '', notes: ''
    },
    services_offered: [],
    pricing_details: { base_price: 0, currency: 'USD', packages: [] },
    gallery_images: [],
    amenities: [],
    faq: [],
    is_featured: false
  });

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
        .select('*, category:vendor_categories(*)')
        .eq('id', vendorId)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          name: data.name,
          category_id: data.category_id,
          description: data.description || '',
          location: data.location,
          address: data.address || { street: '', city: '', state: '', zip: '' },
          contact_info: data.contact_info || { email: '', phone: '', whatsapp: '', contact_name: '' },
          social_media: data.social_media || { instagram: '', facebook: '', twitter: '', website: '' },
          business_hours: data.business_hours || {
            monday: '', tuesday: '', wednesday: '', thursday: '',
            friday: '', saturday: '', sunday: '', notes: ''
          },
          services_offered: data.services_offered || [],
          pricing_details: data.pricing_details || { base_price: 0, currency: 'USD', packages: [] },
          gallery_images: data.gallery_images || [],
          amenities: data.amenities || [],
          faq: data.faq || [],
          is_featured: data.is_featured
        });
      }
    } catch (err: any) {
      console.error('Error fetching vendor data:', err);
      setError('Failed to load vendor data');
    } finally {
      setLoading(false);
    }
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
          address: formData.address,
          contact_info: formData.contact_info,
          social_media: formData.social_media,
          business_hours: formData.business_hours,
          services_offered: formData.services_offered,
          pricing_details: formData.pricing_details,
          gallery_images: formData.gallery_images,
          amenities: formData.amenities,
          faq: formData.faq,
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
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
                value={formData.contact_info?.email}
                onChange={handleTextChange}
                type="email"
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="contact_info.phone"
                value={formData.contact_info?.phone}
                onChange={handleTextChange}
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
                value={formData.social_media?.instagram}
                onChange={handleTextChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Facebook"
                name="social_media.facebook"
                value={formData.social_media?.facebook}
                onChange={handleTextChange}
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
      </Paper>
    </Container>
  );
}
