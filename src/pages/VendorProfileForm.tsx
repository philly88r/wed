import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import {
  Box,
  Button,
  Card,
  CardMedia,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define types
interface Category {
  id: string;
  name: string;
  icon: string;
}

interface FormData {
  name: string;
  category_id: string;
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
  is_featured: boolean;
  gallery_images: Array<{ url: string }>;
  slug: string;
  pricing_tier: {
    tier: string;
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
  availability: {
    lead_time_days: number;
    peak_season: string[];
    off_peak_season: string[];
    travel_zones: string[];
    calendar_sync_enabled: boolean;
    calendar_url: string | null;
  };
  experience: {
    years_in_business: number;
    weddings_completed: number;
    awards: string[];
    certifications: string[];
    insurance: {
      has_insurance: boolean;
      coverage_details: string;
    };
    associations: string[];
    media_features: string[];
  };
  portfolio: {
    videos: string[];
    photos: string[];
    testimonials: string[];
  };
  customization_options: {
    package_addons: string[];
    special_requests_policy: string;
    cultural_expertise: string[];
    multi_day_events: {
      available: boolean;
      details: string;
    };
    equipment: string[];
  };
  team_info: {
    size: number;
    roles: string[];
    backup_policy: string;
    members: string[];
    languages: string[];
    dress_code: string;
  };
  logistics: {
    setup_time_minutes: number;
    breakdown_time_minutes: number;
    space_requirements: string;
    technical_requirements: string[];
    parking_needs: string;
    weather_policy: string;
  };
  collaboration: {
    preferred_vendors: string[];
    venue_partnerships: string[];
    package_deals: string[];
    coordinator_experience: string;
  };
  services_offered: Array<{
    name: string;
    description: string;
    price_range: {
      min: number;
      max: number;
      currency: string;
    };
  }>;
  [key: string]: any; // Add index signature for dynamic access
}

// Define event handler types
type ChangeEventType = { target: { name: string; value: string; checked?: boolean } };

// Define form error types
interface ServiceError {
  name?: string;
  description?: string;
  'price_range.min'?: string;
  'price_range.max'?: string;
}

interface FormErrors {
  name: string;
  category_id: string;
  description: string;
  location: string;
  'contact_info.email': string;
  'contact_info.phone': string;
  services_offered: (string | ServiceError)[];
}

const VendorProfileForm = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const theme = useTheme();
  
  // State for form data and UI
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [formErrors, setFormErrors] = React.useState<FormErrors>({
    name: '',
    category_id: '',
    description: '',
    location: '',
    'contact_info.email': '',
    'contact_info.phone': '',
    services_offered: []
  });

  // Helper function to get service error
  const getServiceError = (index: number, field: keyof ServiceError): { error: boolean; helperText: string } => {
    const error = formErrors.services_offered[index];
    if (typeof error === 'string') {
      return { error: false, helperText: '' };
    }
    const errorMessage = error?.[field] || '';
    return { error: !!errorMessage, helperText: errorMessage };
  };

  // Helper function to get general service error
  const getGeneralServiceError = (): string => {
    const error = formErrors.services_offered[0];
    return typeof error === 'string' ? error : '';
  };

  // Define steps
  const steps = [
    'Basic Information',
    'Location & Contact',
    'Services & Pricing',
    'Images & Media',
    'Experience & Team',
    'Logistics & Customization',
    'Partnerships',
    'Review & Submit'
  ] as const;

  // Initialize form data
  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    category_id: '',
    description: '',
    location: '',
    contact_info: {
      email: '',
      phone: '',
      website: ''
    },
    social_media: {
      instagram: '',
      facebook: ''
    },
    is_featured: false,
    gallery_images: [],
    slug: '',
    services_offered: [
      {
        name: '',
        description: '',
        price_range: {
          min: 0,
          max: 0,
          currency: 'USD'
        }
      }
    ],
    pricing_tier: {
      tier: 'mid_range',
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
      lead_time_days: 30,
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
      testimonials: []
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
      size: 1,
      roles: [],
      backup_policy: '',
      members: [],
      languages: [],
      dress_code: ''
    },
    logistics: {
      setup_time_minutes: 60,
      breakdown_time_minutes: 60,
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
  });

  // Categories for dropdown
  const [categories, setCategories] = React.useState<Category[]>([]);

  // Fetch categories from database
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('vendor_categories')
          .select('*')
          .order('name');
        
        if (error) throw error;
        if (data) setCategories(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Error fetching categories:', err.message);
        } else {
          console.error('Error fetching categories:', err);
        }
      }
    };

    fetchCategories();
  }, []);

  // Fetch vendor data and categories on component mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        if (!token) {
          throw new Error('Form token is required');
        }

        // Fetch form link data to get vendor ID
        const { data: linkData, error: linkError } = await supabase
          .from('vendor_form_links')
          .select('vendor_id, is_used, expires_at')
          .eq('token', token)
          .single();

        if (linkError) throw linkError;
        if (!linkData) throw new Error('Invalid form link');

        // Check if link is valid
        if (linkData.is_used) {
          throw new Error('This form link has already been used');
        }

        if (new Date(linkData.expires_at) < new Date()) {
          throw new Error('This form link has expired');
        }

        // Fetch vendor data
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', linkData.vendor_id)
          .single();

        if (vendorError) throw vendorError;
        if (!vendorData) throw new Error('Vendor not found');

        // Populate form with existing vendor data if available
        if (vendorData) {
          setFormData(prevData => ({
            ...prevData,
            name: vendorData.name || '',
            description: vendorData.description || '',
            category_id: vendorData.category_id || '',
            location: vendorData.location || '',
            contact_info: vendorData.contact_info || prevData.contact_info,
            social_media: vendorData.social_media || prevData.social_media,
            is_featured: vendorData.is_featured || false,
            gallery_images: vendorData.gallery_images || [],
            slug: vendorData.slug || '',
            pricing_tier: vendorData.pricing_tier || prevData.pricing_tier,
            availability: vendorData.availability || prevData.availability,
            experience: vendorData.experience || prevData.experience,
            portfolio: vendorData.portfolio || prevData.portfolio,
            customization_options: vendorData.customization_options || prevData.customization_options,
            team_info: vendorData.team_info || prevData.team_info,
            logistics: vendorData.logistics || prevData.logistics,
            collaboration: vendorData.collaboration || prevData.collaboration,
            services_offered: vendorData.services_offered || []
          }));
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Error fetching data:', err.message);
        } else {
          console.error('Error fetching data:', err);
        }
        setError('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Validate form based on current step
  React.useEffect(() => {
    validateForm();
  }, [activeStep, formData]);

  const validateForm = () => {
    let isValid = true;
    const errors: FormErrors = {
      name: '',
      category_id: '',
      description: '',
      location: '',
      'contact_info.email': '',
      'contact_info.phone': '',
      services_offered: []
    };

    // Basic validation
    if (formData.name.trim() === '') {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (formData.category_id === '') {
      errors.category_id = 'Category is required';
      isValid = false;
    }

    if (formData.description.trim() === '') {
      errors.description = 'Description is required';
      isValid = false;
    }

    if (formData.location.trim() === '') {
      errors.location = 'Location is required';
      isValid = false;
    }

    // Contact info validation
    if (formData.contact_info.email.trim() === '') {
      errors['contact_info.email'] = 'Email is required';
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.contact_info.email)) {
      errors['contact_info.email'] = 'Invalid email format';
      isValid = false;
    }

    if (formData.contact_info.phone.trim() === '') {
      errors['contact_info.phone'] = 'Phone number is required';
      isValid = false;
    }

    // Services validation
    if (activeStep === 2) { // Services & Pricing step
      if (formData.services_offered.length === 0) {
        errors.services_offered = ['At least one service is required'];
        isValid = false;
      } else {
        const serviceErrors = formData.services_offered.map(service => {
          const serviceError: ServiceError = {};
          if (!service.name.trim()) {
            serviceError['name'] = 'Service name is required';
            isValid = false;
          }
          if (!service.description.trim()) {
            serviceError['description'] = 'Service description is required';
            isValid = false;
          }
          if (service.price_range.min < 0) {
            serviceError['price_range.min'] = 'Minimum price cannot be negative';
            isValid = false;
          }
          if (service.price_range.max < service.price_range.min) {
            serviceError['price_range.max'] = 'Maximum price must be greater than minimum price';
            isValid = false;
          }
          return serviceError;
        });
        errors.services_offered = serviceErrors;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleNext = () => {
    if (validateForm()) {
      setActiveStep((prevStep: number) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep: number) => prevStep - 1);
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleChange = (e: ChangeEventType) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prevData) => ({
        ...prevData,
        [parent]: {
          ...prevData[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e: ChangeEventType) => {
    const { name, checked } = e.target as HTMLInputElement;
    
    if (name === 'is_featured' && checked) {
      // Open confirmation dialog for featured vendor
      // setSuperVendorDialogOpen(true);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: checked
      }));
    }
  };

  // Handle file uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'gallery_images') => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `vendor-images/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('vendors')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('vendors')
        .getPublicUrl(filePath);
        
      const publicUrl = data.publicUrl;
      
      // Update form data based on field
      if (field === 'gallery_images') {
        setFormData((prevData) => ({
          ...prevData,
          gallery_images: [...prevData.gallery_images, { url: publicUrl }]
        }));
      }
      
      showSnackbar('Image uploaded successfully', 'success');
    } catch (err: any) {
      console.error('Error uploading file:', err);
      showSnackbar(`Error uploading file: ${err.message}`, 'error');
    }
  };

  // Form submission handler
  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw new Error(userError.message);
      if (!userData.user) throw new Error('User not authenticated');
      
      const userId = userData.user.id;
      
      // Prepare vendor data for submission
      const vendorData = {
        user_id: userId,
        business_name: formData.name,
        category_id: formData.category_id,
        description: formData.description,
        location: formData.location,
        contact_info: formData.contact_info,
        social_media: formData.social_media,
        is_featured: formData.is_featured,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pricing_tier: formData.pricing_tier,
        availability: formData.availability,
        experience: formData.experience,
        portfolio: formData.portfolio,
        customization_options: formData.customization_options,
        team_info: formData.team_info,
        logistics: formData.logistics,
        collaboration: formData.collaboration,
        services_offered: formData.services_offered
      };
      
      // Insert vendor data into the database
      const { data, error: insertError } = await supabase
        .from('vendors')
        .insert([vendorData])
        .select();
      
      if (insertError) throw new Error(insertError.message);
      
      // Redirect to the vendor profile page
      navigate(`/vendors/${data[0].id}`);
      
    } catch (err: any) {
      if (err instanceof Error) {
        setError(err.message || 'An error occurred while submitting the form');
      } else {
        setError('An error occurred while submitting the form');
      }
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      open: false,
      message: '',
      severity: snackbar.severity
    });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Render form content based on active step
  const renderBasicInfoStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          label="Business Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={formData.name.trim() === ''}
          helperText={formData.name.trim() === '' ? 'Business name is required' : ''}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth required error={formData.category_id === ''}>
          <InputLabel>Category</InputLabel>
          <Select
            name="category_id"
            value={formData.category_id}
            onChange={handleSelectChange}
            label="Category"
          >
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
          {formData.category_id === '' && <FormHelperText>Category is required</FormHelperText>}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          multiline
          rows={6}
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={formData.description.trim() === '' || formData.description.trim().length < 50}
          helperText={formData.description.trim() === '' ? 'Description is required' : formData.description.trim().length < 50 ? 'Description should be at least 50 characters' : ''}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.is_featured}
              onChange={handleCheckboxChange}
              name="is_featured"
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography>Become a Featured Vendor</Typography>
            </Box>
          }
        />
        <FormHelperText>
          Featured Vendors get premium placement at the top of their category.
        </FormHelperText>
      </Grid>
    </Grid>
  );

  const renderLocationContactStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          error={formData.location.trim() === ''}
          helperText={formData.location.trim() === '' ? 'Location is required' : ''}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Contact Information</Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="Email"
          name="contact_info.email"
          value={formData.contact_info.email}
          onChange={handleChange}
          error={formData.contact_info.email.trim() === '' || !/^\S+@\S+\.\S+$/.test(formData.contact_info.email)}
          helperText={formData.contact_info.email.trim() === '' ? 'Email is required' : !/^\S+@\S+\.\S+$/.test(formData.contact_info.email) ? 'Invalid email format' : ''}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="Phone"
          name="contact_info.phone"
          value={formData.contact_info.phone}
          onChange={handleChange}
          error={formData.contact_info.phone.trim() === ''}
          helperText={formData.contact_info.phone.trim() === '' ? 'Phone number is required' : ''}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Website"
          name="contact_info.website"
          value={formData.contact_info.website}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>Social Media</Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Instagram Handle"
          name="social_media.instagram"
          value={formData.social_media.instagram}
          onChange={handleChange}
          InputProps={{
            startAdornment: <Box component="span" sx={{ mr: 1 }}>@</Box>,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Facebook URL"
          name="social_media.facebook"
          value={formData.social_media.facebook}
          onChange={handleChange}
        />
      </Grid>
    </Grid>
  );

  const renderServicesPricingStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Services Offered</Typography>
      </Grid>

      {formData.services_offered.map((service, index) => (
        <React.Fragment key={index}>
          <Grid item xs={12}>
            <Card sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Service Name"
                    name={`services_offered.${index}.name`}
                    value={service.name}
                    onChange={(e) => {
                      const newServices = [...formData.services_offered];
                      newServices[index] = { ...service, name: e.target.value };
                      setFormData(prev => ({
                        ...prev,
                        services_offered: newServices
                      }));
                    }}
                    error={getServiceError(index, 'name').error}
                    helperText={getServiceError(index, 'name').helperText}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Service Description"
                    name={`services_offered.${index}.description`}
                    value={service.description}
                    onChange={(e) => {
                      const newServices = [...formData.services_offered];
                      newServices[index] = { ...service, description: e.target.value };
                      setFormData(prev => ({
                        ...prev,
                        services_offered: newServices
                      }));
                    }}
                    error={getServiceError(index, 'description').error}
                    helperText={getServiceError(index, 'description').helperText}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Minimum Price"
                    name={`services_offered.${index}.price_range.min`}
                    value={service.price_range.min}
                    onChange={(e) => {
                      const newServices = [...formData.services_offered];
                      newServices[index] = {
                        ...service,
                        price_range: {
                          ...service.price_range,
                          min: Number(e.target.value)
                        }
                      };
                      setFormData(prev => ({
                        ...prev,
                        services_offered: newServices
                      }));
                    }}
                    InputProps={{
                      startAdornment: <Typography>$</Typography>
                    }}
                    error={getServiceError(index, 'price_range.min').error}
                    helperText={getServiceError(index, 'price_range.min').helperText}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Maximum Price"
                    name={`services_offered.${index}.price_range.max`}
                    value={service.price_range.max}
                    onChange={(e) => {
                      const newServices = [...formData.services_offered];
                      newServices[index] = {
                        ...service,
                        price_range: {
                          ...service.price_range,
                          max: Number(e.target.value)
                        }
                      };
                      setFormData(prev => ({
                        ...prev,
                        services_offered: newServices
                      }));
                    }}
                    InputProps={{
                      startAdornment: <Typography>$</Typography>
                    }}
                    error={getServiceError(index, 'price_range.max').error}
                    helperText={getServiceError(index, 'price_range.max').helperText}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      const newServices = formData.services_offered.filter((_, i) => i !== index);
                      setFormData(prev => ({
                        ...prev,
                        services_offered: newServices
                      }));
                    }}
                  >
                    Remove Service
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </React.Fragment>
      ))}

      {getGeneralServiceError() && (
        <Grid item xs={12}>
          <Typography color="error">{getGeneralServiceError()}</Typography>
        </Grid>
      )}

      <Grid item xs={12}>
        <Button
          variant="contained"
          sx={{
            bgcolor: theme.palette.accent.rose,
            color: theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme.palette.accent.roseDark,
            }
          }}
          onClick={() => {
            setFormData(prev => ({
              ...prev,
              services_offered: [
                ...prev.services_offered,
                {
                  name: '',
                  description: '',
                  price_range: { min: 0, max: 0, currency: 'USD' }
                }
              ]
            }));
          }}
        >
          Add Service
        </Button>
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>Pricing Information</Typography>
        <FormControl fullWidth required>
          <InputLabel>Pricing Tier</InputLabel>
          <Select
            name="pricing_tier.tier"
            value={formData.pricing_tier.tier}
            onChange={handleSelectChange}
            label="Pricing Tier"
          >
            <MenuItem value="$">$ (Budget-Friendly)</MenuItem>
            <MenuItem value="$$">$$ (Mid-Range)</MenuItem>
            <MenuItem value="$$$">$$$ (Premium)</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Minimum Price"
          name="pricing_tier.price_range.min"
          value={formData.pricing_tier.price_range.min}
          onChange={handleChange}
          InputProps={{
            startAdornment: <Typography>$</Typography>
          }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Maximum Price"
          name="pricing_tier.price_range.max"
          value={formData.pricing_tier.price_range.max}
          onChange={handleChange}
          InputProps={{
            startAdornment: <Typography>$</Typography>
          }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Deposit Percentage"
          name="pricing_tier.deposit_required.percentage"
          value={formData.pricing_tier.deposit_required.percentage}
          onChange={handleChange}
          InputProps={{
            endAdornment: <Typography>%</Typography>
          }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Deposit Amount"
          name="pricing_tier.deposit_required.amount"
          value={formData.pricing_tier.deposit_required.amount}
          onChange={handleChange}
          InputProps={{
            startAdornment: <Typography>$</Typography>
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Cancellation Policy"
          name="pricing_tier.cancellation_policy"
          value={formData.pricing_tier.cancellation_policy}
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>Availability</Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Lead Time (Days)"
          name="availability.lead_time_days"
          value={formData.availability.lead_time_days}
          onChange={handleChange}
          helperText="Minimum days of advance notice needed"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.availability.calendar_sync_enabled}
              onChange={handleChange}
              name="availability.calendar_sync_enabled"
            />
          }
          label="Enable Calendar Sync"
        />
      </Grid>

      {formData.availability.calendar_sync_enabled && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Calendar URL"
            name="availability.calendar_url"
            value={formData.availability.calendar_url || ''}
            onChange={handleChange}
            helperText="Enter your calendar URL (iCal/Google Calendar)"
          />
        </Grid>
      )}

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Peak Season Availability"
          name="availability.peak_season"
          value={formData.availability.peak_season.join(', ')}
          onChange={(e) => {
            const seasons = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            setFormData(prev => ({
              ...prev,
              availability: {
                ...prev.availability,
                peak_season: seasons
              }
            }));
          }}
          helperText="Enter months separated by commas (e.g., June, July, August)"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Off-Peak Season Availability"
          name="availability.off_peak_season"
          value={formData.availability.off_peak_season.join(', ')}
          onChange={(e) => {
            const seasons = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            setFormData(prev => ({
              ...prev,
              availability: {
                ...prev.availability,
                off_peak_season: seasons
              }
            }));
          }}
          helperText="Enter months separated by commas (e.g., January, February)"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Travel Zones"
          name="availability.travel_zones"
          value={formData.availability.travel_zones.join(', ')}
          onChange={(e) => {
            const zones = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            setFormData(prev => ({
              ...prev,
              availability: {
                ...prev.availability,
                travel_zones: zones
              }
            }));
          }}
          helperText="Enter areas you service, separated by commas (e.g., Manhattan, Brooklyn, Queens)"
        />
      </Grid>
    </Grid>
  );

  const renderImagesMediaStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Gallery Images</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Add images to showcase your work.
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <Box sx={{ mb: 2 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="gallery-image-upload"
            type="file"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e, 'gallery_images')}
          />
          <label htmlFor="gallery-image-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
            >
              Add Gallery Image
            </Button>
          </label>
        </Box>
        
        {formData.gallery_images.length > 0 && (
          <Grid container spacing={2}>
            {formData.gallery_images.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardMedia
                    component="img"
                    height="150"
                    image={image.url}
                    alt={`Gallery image ${index + 1}`}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
    </Grid>
  );

  const renderExperienceTeamStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Experience & Achievements</Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Years in Business"
          name="experience.years_in_business"
          value={formData.experience.years_in_business}
          onChange={handleChange}
          InputProps={{ inputProps: { min: 0 } }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Weddings Completed"
          name="experience.weddings_completed"
          value={formData.experience.weddings_completed}
          onChange={handleChange}
          InputProps={{ inputProps: { min: 0 } }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Awards & Recognition"
          name="experience.awards"
          value={formData.experience.awards.join(', ')}
          onChange={(e) => {
            const awards = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            setFormData(prev => ({
              ...prev,
              experience: {
                ...prev.experience,
                awards
              }
            }));
          }}
          helperText="Enter awards separated by commas"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Certifications"
          name="experience.certifications"
          value={formData.experience.certifications.join(', ')}
          onChange={(e) => {
            const certs = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            setFormData(prev => ({
              ...prev,
              experience: {
                ...prev.experience,
                certifications: certs
              }
            }));
          }}
          helperText="Enter certifications separated by commas"
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.experience.insurance.has_insurance}
              onChange={handleChange}
              name="experience.insurance.has_insurance"
            />
          }
          label="Business Insurance"
        />
      </Grid>

      {formData.experience.insurance.has_insurance && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Insurance Coverage Details"
            name="experience.insurance.coverage_details"
            value={formData.experience.insurance.coverage_details}
            onChange={handleChange}
            helperText="Describe your insurance coverage"
          />
        </Grid>
      )}

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Professional Associations"
          name="experience.associations"
          value={formData.experience.associations.join(', ')}
          onChange={(e) => {
            const assocs = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            setFormData(prev => ({
              ...prev,
              experience: {
                ...prev.experience,
                associations: assocs
              }
            }));
          }}
          helperText="Enter professional associations separated by commas"
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>Team Information</Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Team Size"
          name="team_info.size"
          value={formData.team_info.size}
          onChange={handleChange}
          InputProps={{ inputProps: { min: 1 } }}
          helperText="Total number of team members"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Team Roles"
          name="team_info.roles"
          value={formData.team_info.roles.join(', ')}
          onChange={(e) => {
            const roles = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            setFormData(prev => ({
              ...prev,
              team_info: {
                ...prev.team_info,
                roles
              }
            }));
          }}
          helperText="Enter team roles separated by commas (e.g., Lead DJ, Sound Engineer, MC)"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Languages Spoken"
          name="team_info.languages"
          value={formData.team_info.languages.join(', ')}
          onChange={(e) => {
            const langs = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            setFormData(prev => ({
              ...prev,
              team_info: {
                ...prev.team_info,
                languages: langs
              }
            }));
          }}
          helperText="Enter languages separated by commas"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Backup Policy"
          name="team_info.backup_policy"
          value={formData.team_info.backup_policy}
          onChange={handleChange}
          helperText="Describe your backup plan for emergencies"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Dress Code"
          name="team_info.dress_code"
          value={formData.team_info.dress_code}
          onChange={handleChange}
          helperText="Describe your team's standard attire for events"
        />
      </Grid>
    </Grid>
  );

  const renderLogisticsCustomizationStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Setup & Logistics</Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Setup Time (Minutes)"
          name="logistics.setup_time_minutes"
          value={formData.logistics.setup_time_minutes}
          onChange={handleChange}
          InputProps={{ inputProps: { min: 0 } }}
          helperText="Time needed for setup before event"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Breakdown Time (Minutes)"
          name="logistics.breakdown_time_minutes"
          value={formData.logistics.breakdown_time_minutes}
          onChange={handleChange}
          InputProps={{ inputProps: { min: 0 } }}
          helperText="Time needed for breakdown after event"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Space Requirements"
          name="logistics.space_requirements"
          value={formData.logistics.space_requirements}
          onChange={handleChange}
          helperText="Describe your space and setup area requirements"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Technical Requirements"
          name="logistics.technical_requirements"
          value={formData.logistics.technical_requirements.join(', ')}
          onChange={(e) => {
            const reqs = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            setFormData(prev => ({
              ...prev,
              logistics: {
                ...prev.logistics,
                technical_requirements: reqs
              }
            }));
          }}
          helperText="Enter technical requirements separated by commas (e.g., power outlets, WiFi)"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Parking Requirements"
          name="logistics.parking_needs"
          value={formData.logistics.parking_needs}
          onChange={handleChange}
          helperText="Describe your parking needs for equipment and team"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Weather Contingency Plan"
          name="logistics.weather_policy"
          value={formData.logistics.weather_policy}
          onChange={handleChange}
          helperText="Describe your plan for inclement weather"
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>Customization & Collaboration</Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Package Add-ons"
          name="customization_options.package_addons"
          value={formData.customization_options.package_addons.join(', ')}
          onChange={(e) => {
            const addons = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            setFormData(prev => ({
              ...prev,
              customization_options: {
                ...prev.customization_options,
                package_addons: addons
              }
            }));
          }}
          helperText="Enter available add-ons separated by commas"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Cultural Expertise"
          name="customization_options.cultural_expertise"
          value={formData.customization_options.cultural_expertise.join(', ')}
          onChange={(e) => {
            const expertise = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            setFormData(prev => ({
              ...prev,
              customization_options: {
                ...prev.customization_options,
                cultural_expertise: expertise
              }
            }));
          }}
          helperText="Enter cultural events/traditions you specialize in"
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.customization_options.multi_day_events.available}
              onChange={handleChange}
              name="customization_options.multi_day_events.available"
            />
          }
          label="Available for Multi-day Events"
        />
      </Grid>

      {formData.customization_options.multi_day_events.available && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Multi-day Event Details"
            name="customization_options.multi_day_events.details"
            value={formData.customization_options.multi_day_events.details}
            onChange={handleChange}
            helperText="Describe your multi-day event services"
          />
        </Grid>
      )}

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Equipment List"
          name="customization_options.equipment"
          value={formData.customization_options.equipment.join(', ')}
          onChange={(e) => {
            const equipment = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            setFormData(prev => ({
              ...prev,
              customization_options: {
                ...prev.customization_options,
                equipment
              }
            }));
          }}
          helperText="Enter your equipment list separated by commas"
        />
      </Grid>
    </Grid>
  );

  const renderPartnershipsStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Partnerships</Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Preferred Vendors"
          name="collaboration.preferred_vendors"
          value={formData.collaboration.preferred_vendors.join(', ')}
          onChange={(e) => {
            const vendors = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            setFormData(prev => ({
              ...prev,
              collaboration: {
                ...prev.collaboration,
                preferred_vendors: vendors
              }
            }));
          }}
          helperText="Enter preferred vendor partners separated by commas"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Venue Partnerships"
          name="collaboration.venue_partnerships"
          value={formData.collaboration.venue_partnerships.join(', ')}
          onChange={(e) => {
            const venues = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            setFormData(prev => ({
              ...prev,
              collaboration: {
                ...prev.collaboration,
                venue_partnerships: venues
              }
            }));
          }}
          helperText="Enter partner venues separated by commas"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Package Deals"
          name="collaboration.package_deals"
          value={formData.collaboration.package_deals.join(', ')}
          onChange={(e) => {
            const deals = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            setFormData(prev => ({
              ...prev,
              collaboration: {
                ...prev.collaboration,
                package_deals: deals
              }
            }));
          }}
          helperText="Enter available package deals separated by commas"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Wedding Coordinator Experience"
          name="collaboration.coordinator_experience"
          value={formData.collaboration.coordinator_experience}
          onChange={handleChange}
          helperText="Describe your experience working with wedding coordinators"
        />
      </Grid>
    </Grid>
  );

  const renderReviewStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Please review your information before submitting. You can go back to any section to make changes.
        </Alert>
      </Grid>
      
      <Grid item xs={12}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Basic Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Business Name</Typography>
              <Typography>{formData.name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Category</Typography>
              <Typography>
                {categories.find((c) => c.id === formData.category_id)?.name || ''}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Description</Typography>
              <Typography>{formData.description}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Featured Vendor Status</Typography>
              <Typography>{formData.is_featured ? 'Yes' : 'No'}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Location & Contact</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Location</Typography>
              <Typography>{formData.location}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Email</Typography>
              <Typography>{formData.contact_info.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Phone</Typography>
              <Typography>{formData.contact_info.phone}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Website</Typography>
              <Typography>{formData.contact_info.website || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Social Media</Typography>
              <Typography>
                {formData.social_media.instagram && `Instagram: @${formData.social_media.instagram}`}
                {formData.social_media.instagram && formData.social_media.facebook && ', '}
                {formData.social_media.facebook && `Facebook: ${formData.social_media.facebook}`}
                {!formData.social_media.instagram && !formData.social_media.facebook && 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Gallery Images</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Gallery Images</Typography>
              {formData.gallery_images.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                  {formData.gallery_images.map((image, index) => (
                    <Box key={index} sx={{ width: 100 }}>
                      <img 
                        src={image.url} 
                        alt={`Gallery ${index}`} 
                        style={{ width: '100%', height: 'auto', borderRadius: 4 }} 
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No gallery images uploaded</Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Alert severity="warning">
          By submitting this form, you confirm that all information provided is accurate and complete.
        </Alert>
      </Grid>
    </Grid>
  );

  const renderForm = () => {
    switch (activeStep) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return renderLocationContactStep();
      case 2:
        return renderServicesPricingStep();
      case 3:
        return renderImagesMediaStep();
      case 4:
        return renderExperienceTeamStep();
      case 5:
        return renderLogisticsCustomizationStep();
      case 6:
        return renderPartnershipsStep();
      case 7:
        return renderReviewStep();
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  const renderNavButtons = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
      <Button
        color="inherit"
        disabled={activeStep === 0}
        onClick={handleBack}
        startIcon={<ArrowBackIcon />}
      >
        Back
      </Button>
      <Box>
        {activeStep < steps.length - 1 ? (
          <Button 
            variant="contained" 
            sx={{
              bgcolor: theme.palette.accent.rose,
              color: theme.palette.primary.main,
              '&:hover': {
                bgcolor: theme.palette.accent.roseDark,
              }
            }}
            onClick={handleNext}
            endIcon={<ArrowForwardIcon />}
            disabled={!validateForm()}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            sx={{
              bgcolor: theme.palette.accent.rose,
              color: theme.palette.primary.main,
              '&:hover': {
                bgcolor: theme.palette.accent.roseDark,
              }
            }}
            onClick={handleSubmit}
            disabled={!validateForm() || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            {loading ? 'Submitting...' : 'Submit Profile'}
          </Button>
        )}
      </Box>
    </Box>
  );

  // Render form
  if (loading && !formData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Vendor Profile Form
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph align="center">
          Complete your vendor profile to be listed in our directory
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderForm()}
        {renderNavButtons()}
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default VendorProfileForm;
