import { useState } from 'react';
import { Box, Button, CircularProgress, Container, Grid, Paper, Stepper, Step, StepLabel, TextField, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface VendorFormData {
  name: string;
  description: string;
  location: string;
  contact_info: {
    email: string;
    phone: string;
    website: string;
  };
  social_media: {
    instagram: string;
    facebook: string;
  };
  pricing_details: {
    tier: string;
    packages: any[];
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
  };
  services_offered: any[];
  amenities: string[];
  gallery_images: any[];
  availability: {
    lead_time_days: number;
    peak_season: string[];
    off_peak_season: string[];
    travel_zones: string[];
  };
}

interface VendorEditFormProps {
  vendorId: string;
  initialData?: Partial<VendorFormData>;
  onSave?: () => void;
}

const steps = [
  'Basic Information',
  'Contact Details',
  'Services & Pricing',
  'Gallery & Media',
  'Availability'
];

const VendorEditForm: React.FC<VendorEditFormProps> = ({ vendorId, initialData, onSave }) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<VendorFormData>({
    // Basic Information
    name: initialData?.name || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    
    // Contact Details
    contact_info: initialData?.contact_info || {
      email: '',
      phone: '',
      website: ''
    },
    social_media: initialData?.social_media || {
      instagram: '',
      facebook: ''
    },

    // Services & Pricing
    pricing_details: initialData?.pricing_details || {
      tier: 'moderate',
      packages: [],
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
    services_offered: initialData?.services_offered || [],
    amenities: initialData?.amenities || [],

    // Gallery & Media
    gallery_images: initialData?.gallery_images || [],

    // Availability
    availability: initialData?.availability || {
      lead_time_days: 0,
      peak_season: [],
      off_peak_season: [],
      travel_zones: []
    }
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (section: keyof VendorFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' ? 
        { ...prev[section], [field]: value } :
        value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('vendors')
        .update({
          name: formData.name,
          description: formData.description,
          location: formData.location,
          contact_info: formData.contact_info,
          social_media: formData.social_media,
          pricing_details: formData.pricing_details,
          services_offered: formData.services_offered,
          amenities: formData.amenities,
          gallery_images: formData.gallery_images,
          availability: formData.availability,
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId);

      if (updateError) throw updateError;

      onSave?.();
      navigate(`/vendors/${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Business Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', '', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', '', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', '', e.target.value)}
                required
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.contact_info.email}
                onChange={(e) => handleInputChange('contact_info', 'email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.contact_info.phone}
                onChange={(e) => handleInputChange('contact_info', 'phone', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website"
                value={formData.contact_info.website}
                onChange={(e) => handleInputChange('contact_info', 'website', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Instagram URL"
                value={formData.social_media.instagram}
                onChange={(e) => handleInputChange('social_media', 'instagram', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Facebook URL"
                value={formData.social_media.facebook}
                onChange={(e) => handleInputChange('social_media', 'facebook', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Minimum Price (USD)"
                type="number"
                value={formData.pricing_details.price_range.min}
                onChange={(e) => handleInputChange('pricing_details', 'price_range', {
                  ...formData.pricing_details.price_range,
                  min: parseInt(e.target.value)
                })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Maximum Price (USD)"
                type="number"
                value={formData.pricing_details.price_range.max}
                onChange={(e) => handleInputChange('pricing_details', 'price_range', {
                  ...formData.pricing_details.price_range,
                  max: parseInt(e.target.value)
                })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Deposit Percentage"
                type="number"
                value={formData.pricing_details.deposit_required.percentage}
                onChange={(e) => handleInputChange('pricing_details', 'deposit_required', {
                  ...formData.pricing_details.deposit_required,
                  percentage: parseInt(e.target.value)
                })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Cancellation Policy"
                value={formData.pricing_details.cancellation_policy}
                onChange={(e) => handleInputChange('pricing_details', 'cancellation_policy', e.target.value)}
                required
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Gallery Images
              </Typography>
              {/* Add image upload functionality here */}
              <Button variant="contained" color="primary">
                Upload Images
              </Button>
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lead Time (Days)"
                type="number"
                value={formData.availability.lead_time_days}
                onChange={(e) => handleInputChange('availability', 'lead_time_days', parseInt(e.target.value))}
                required
              />
            </Grid>
            {/* Add more availability fields here */}
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={0} sx={{ p: 4, mb: 4, bgcolor: 'white' }}>
        <Typography variant="h4" gutterBottom>
          Edit Vendor Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default VendorEditForm;
