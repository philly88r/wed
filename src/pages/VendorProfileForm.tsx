import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  Chip,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  FormHelperText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabase = React.useState(() => createClient(supabaseUrl, supabaseAnonKey))[0];

// Define types
interface Category {
  id: string;
  name: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  website: string;
}

interface SocialMedia {
  instagram: string;
  facebook: string;
}

interface BusinessHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

interface ServiceOffered {
  name: string;
  description: string;
}

interface PricingDetail {
  service: string;
  price: string;
  description: string;
}

interface GalleryImage {
  image_url: string;
  caption: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface FormData {
  name: string;
  category_id: string;
  description: string;
  location: string;
  address: Address;
  contact_info: ContactInfo;
  social_media: SocialMedia;
  business_hours: BusinessHours;
  services_offered: ServiceOffered[];
  pricing_details: PricingDetail[];
  hero_image_url: string;
  gallery_images: GalleryImage[];
  amenities: string[];
  faq: FAQ[];
  is_featured: boolean;
  is_super_vendor: boolean;
}

interface FormErrors {
  name?: string;
  category_id?: string;
  description?: string;
  location?: string;
  email?: string;
  phone?: string;
  [key: string]: string | undefined;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

// Define event handler types
type ChangeEventType = { target: { name: string; value: string; checked?: boolean } };
type KeyboardEventType = { key: string };

const VendorProfileForm = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  
  // State for form data and UI
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [formValid, setFormValid] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [superVendorDialogOpen, setSuperVendorDialogOpen] = React.useState<boolean>(false);
  const [snackbar, setSnackbar] = React.useState<SnackbarState | null>(null);
  
  // Categories for dropdown
  const [categories, setCategories] = React.useState<Array<Category>>([]);

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
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Define steps
  const steps = [
    'Basic Information',
    'Location & Contact',
    'Services & Pricing',
    'Images & Media',
    'Additional Details',
    'Review & Submit'
  ];

  // Initialize form data
  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    description: '',
    category_id: '',
    location: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: ''
    },
    contact_info: {
      email: '',
      phone: '',
      website: ''
    },
    social_media: {
      instagram: '',
      facebook: ''
    },
    hero_image_url: '',
    gallery_images: [],
    services_offered: [{ name: '', description: '' }],
    pricing_details: [{ service: '', price: '', description: '' }],
    business_hours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    amenities: [],
    faq: [{ question: '', answer: '' }],
    is_super_vendor: false,
    is_featured: false,
  });

  // Form validation state
  const [formErrors, setFormErrors] = React.useState<FormErrors>({
    name: '',
    description: '',
    category_id: '',
    location: '',
    email: '',
    phone: ''
  });

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
            address: vendorData.address || prevData.address,
            contact_info: vendorData.contact_info || prevData.contact_info,
            social_media: vendorData.social_media || prevData.social_media,
            hero_image_url: vendorData.hero_image_url || '',
            gallery_images: vendorData.gallery_images || [],
            services_offered: vendorData.services_offered?.length 
              ? vendorData.services_offered 
              : [{ name: '', description: '' }],
            pricing_details: vendorData.pricing_details?.length 
              ? vendorData.pricing_details 
              : [{ service: '', price: '', description: '' }],
            business_hours: vendorData.business_hours || prevData.business_hours,
            amenities: vendorData.amenities || [],
            faq: vendorData.faq?.length 
              ? vendorData.faq 
              : [{ question: '', answer: '' }],
            is_super_vendor: vendorData.is_super_vendor || false,
            is_featured: vendorData.is_featured || false,
          }));
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load form data');
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
    const errors = {
      name: '',
      description: '',
      category_id: '',
      location: '',
      email: '',
      phone: ''
    };

    // Validate based on current step
    switch (activeStep) {
      case 0: // Basic Information
        if (!formData.name.trim()) {
          errors.name = 'Business name is required';
          isValid = false;
        }
        if (!formData.description.trim()) {
          errors.description = 'Description is required';
          isValid = false;
        } else if (formData.description.trim().length < 50) {
          errors.description = 'Description should be at least 50 characters';
          isValid = false;
        }
        if (!formData.category_id) {
          errors.category_id = 'Category is required';
          isValid = false;
        }
        break;
      
      case 1: // Location & Contact
        if (!formData.location.trim()) {
          errors.location = 'Location is required';
          isValid = false;
        }
        if (!formData.contact_info.email.trim()) {
          errors.email = 'Email is required';
          isValid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(formData.contact_info.email)) {
          errors.email = 'Invalid email format';
          isValid = false;
        }
        if (!formData.contact_info.phone.trim()) {
          errors.phone = 'Phone number is required';
          isValid = false;
        }
        break;
      
      // Other steps don't have required fields
      default:
        isValid = true;
    }

    setFormErrors(errors);
    setFormValid(isValid);
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

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prevData: FormData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleChange = (e: ChangeEventType) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prevData: FormData) => ({
        ...prevData,
        [parent]: {
          ...prevData[parent as keyof FormData],
          [child]: value
        }
      }));
    } else {
      setFormData((prevData: FormData) => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e: ChangeEventType) => {
    const { name, checked } = e.target as HTMLInputElement;
    
    if (name === 'is_super_vendor' && checked) {
      // Open confirmation dialog for super vendor
      setSuperVendorDialogOpen(true);
    } else {
      setFormData((prevData: FormData) => ({
        ...prevData,
        [name]: checked
      }));
    }
  };

  const confirmSuperVendor = () => {
    setFormData((prevData: FormData) => ({
      ...prevData,
      is_super_vendor: true
    }));
    setSuperVendorDialogOpen(false);
  };

  const cancelSuperVendor = () => {
    setFormData((prevData: FormData) => ({
      ...prevData,
      is_super_vendor: false
    }));
    setSuperVendorDialogOpen(false);
  };

  // Handle array field changes (services, pricing, gallery, faq)
  const handleArrayFieldChange = (
    index: number, 
    field: 'services_offered' | 'pricing_details' | 'gallery_images' | 'faq', 
    subField: string, 
    value: string
  ) => {
    setFormData((prevData: FormData) => {
      const newArray = [...prevData[field]];
      newArray[index] = {
        ...newArray[index],
        [subField]: value
      };
      return {
        ...prevData,
        [field]: newArray
      };
    });
  };

  // Add new item to array fields
  const addArrayItem = (field: 'services_offered' | 'pricing_details' | 'gallery_images' | 'faq') => {
    setFormData((prevData: FormData) => {
      let newItem: ServiceOffered | PricingDetail | GalleryImage | FAQ;
      
      switch (field) {
        case 'services_offered':
          newItem = { name: '', description: '' };
          break;
        case 'pricing_details':
          newItem = { service: '', price: '', description: '' };
          break;
        case 'gallery_images':
          newItem = { image_url: '', caption: '' };
          break;
        case 'faq':
          newItem = { question: '', answer: '' };
          break;
        default:
          throw new Error(`Invalid field: ${field}`);
      }
      
      return {
        ...prevData,
        [field]: [...prevData[field], newItem]
      };
    });
  };

  // Remove item from array fields
  const removeArrayItem = (field: 'services_offered' | 'pricing_details' | 'gallery_images' | 'faq', index: number) => {
    setFormData((prevData: FormData) => {
      const newArray = [...prevData[field]];
      newArray.splice(index, 1);
      
      // Ensure there's always at least one item
      if (newArray.length === 0) {
        let newItem: ServiceOffered | PricingDetail | GalleryImage | FAQ;
        switch (field) {
          case 'services_offered':
            newItem = { name: '', description: '' };
            break;
          case 'pricing_details':
            newItem = { service: '', price: '', description: '' };
            break;
          case 'gallery_images':
            newItem = { image_url: '', caption: '' };
            break;
          case 'faq':
            newItem = { question: '', answer: '' };
            break;
          default:
            throw new Error(`Invalid field: ${field}`);
        }
        newArray.push(newItem);
      }
      
      return {
        ...prevData,
        [field]: newArray
      };
    });
  };

  // Helper functions for amenities
  const handleAddAmenity = (amenity: string) => {
    if (!amenity || amenity.trim() === '') return;
    
    if (!formData.amenities.includes(amenity.trim())) {
      setFormData((prevData: FormData) => ({
        ...prevData,
        amenities: [...prevData.amenities, amenity.trim()]
      }));
    }
  };

  const handleDeleteAmenity = (amenityToDelete: string) => {
    setFormData((prevData: FormData) => ({
      ...prevData,
      amenities: prevData.amenities.filter(amenity => amenity !== amenityToDelete)
    }));
  };

  // Handle file uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'hero_image_url' | 'gallery') => {
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
      if (field === 'hero_image_url') {
        setFormData((prevData: FormData) => ({
          ...prevData,
          hero_image_url: publicUrl
        }));
      } else if (field === 'gallery') {
        setFormData((prevData: FormData) => ({
          ...prevData,
          gallery_images: [
            ...prevData.gallery_images,
            { image_url: publicUrl, caption: '' }
          ]
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
        address: formData.address,
        contact_info: formData.contact_info,
        social_media: formData.social_media,
        services_offered: formData.services_offered,
        pricing_details: formData.pricing_details,
        business_hours: formData.business_hours,
        hero_image_url: formData.hero_image_url,
        gallery_images: formData.gallery_images,
        amenities: formData.amenities,
        faq: formData.faq,
        is_super_vendor: formData.is_super_vendor,
        is_verified: false, // Default to false, admin will verify
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Insert vendor data into the database
      const { data, error: insertError } = await supabase
        .from('vendors')
        .insert([vendorData])
        .select();
      
      if (insertError) throw new Error(insertError.message);
      
      // If super vendor, process payment (in a real app, this would integrate with a payment gateway)
      if (formData.is_super_vendor) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert([{
            user_id: userId,
            vendor_id: data[0].id,
            amount: 250, // $250 for super vendor
            payment_method: 'credit_card',
            status: 'pending', // In a real app, this would be handled by a payment gateway
            created_at: new Date().toISOString()
          }]);
        
        if (paymentError) throw new Error(paymentError.message);
      }
      
      // Redirect to the vendor profile page
      navigate(`/vendors/${data[0].id}`);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting the form');
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev: SnackbarState | null) => ({
      ...prev,
      open: false
    }));
  };

  // Handle service field changes
  const handleServiceChange = (service: ServiceOffered, index: number, field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData: FormData) => {
      const newServices = [...prevData.services_offered];
      newServices[index] = {
        ...newServices[index],
        [field]: e.target.value
      };
      return {
        ...prevData,
        services_offered: newServices
      };
    });
  };

  // Handle pricing field changes
  const handlePricingChange = (pricing: PricingDetail, index: number, field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'price' ? e.target.value : e.target.value;
    
    setFormData((prevData: FormData) => {
      const newPricing = [...prevData.pricing_details];
      newPricing[index] = {
        ...newPricing[index],
        [field]: value
      };
      return {
        ...prevData,
        pricing_details: newPricing
      };
    });
  };

  // Handle gallery image caption changes
  const handleCaptionChange = (image: GalleryImage, index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData: FormData) => {
      const newImages = [...prevData.gallery_images];
      newImages[index] = {
        ...newImages[index],
        caption: e.target.value
      };
      return {
        ...prevData,
        gallery_images: newImages
      };
    });
  };

  // Handle FAQ field changes
  const handleFaqChange = (faq: FAQ, index: number, field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData: FormData) => {
      const newFaqs = [...prevData.faq];
      newFaqs[index] = {
        ...newFaqs[index],
        [field]: e.target.value
      };
      return {
        ...prevData,
        faq: newFaqs
      };
    });
  };

  // Render form content based on active step
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return renderLocationContactStep();
      case 2:
        return renderServicesPricingStep();
      case 3:
        return renderImagesMediaStep();
      case 4:
        return renderAdditionalDetailsStep();
      case 5:
        return renderReviewStep();
      default:
        return 'Unknown step';
    }
  };

  // Render each step content
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
          error={!!formErrors.name}
          helperText={formErrors.name}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth required error={!!formErrors.category_id}>
          <InputLabel>Category</InputLabel>
          <Select
            name="category_id"
            value={formData.category_id}
            onChange={handleSelectChange}
            label="Category"
          >
            {categories.map((c: Category) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
          {formErrors.category_id && <FormHelperText>{formErrors.category_id}</FormHelperText>}
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
          error={!!formErrors.description}
          helperText={formErrors.description || 'Describe your business in detail (min. 50 characters)'}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.is_super_vendor}
              onChange={handleCheckboxChange}
              name="is_super_vendor"
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography>Become a Super Vendor</Typography>
              <Chip 
                label="$250" 
                color="primary" 
                size="small" 
                sx={{ ml: 1 }} 
                icon={<AttachMoneyIcon />} 
              />
            </Box>
          }
        />
        <FormHelperText>
          Super Vendors get premium placement at the top of their category. Only one Super Vendor is allowed per category.
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
          error={!!formErrors.location}
          helperText={formErrors.location || 'e.g., New York, NY'}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Address</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Street Address"
          name="address.street"
          value={formData.address.street}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="City"
          name="address.city"
          value={formData.address.city}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField
          fullWidth
          label="State"
          name="address.state"
          value={formData.address.state}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField
          fullWidth
          label="ZIP Code"
          name="address.zip"
          value={formData.address.zip}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
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
          error={!!formErrors.email}
          helperText={formErrors.email}
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
          error={!!formErrors.phone}
          helperText={formErrors.phone}
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
        <Typography variant="body2" color="text.secondary" paragraph>
          List the services you offer to your clients.
        </Typography>
      </Grid>
      
      {formData.services_offered.map((service: ServiceOffered, index: number) => (
        <Grid item xs={12} key={index} sx={{ mb: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={11}>
                <TextField
                  fullWidth
                  label="Service Name"
                  value={service.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleServiceChange(service, index, 'name', e)}
                />
              </Grid>
              <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  color="error" 
                  onClick={() => removeArrayItem('services_offered', index)}
                  disabled={formData.services_offered.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Service Description"
                  value={service.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleServiceChange(service, index, 'description', e)}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      ))}
      
      <Grid item xs={12}>
        <Button 
          startIcon={<AddIcon />} 
          onClick={() => addArrayItem('services_offered')}
          variant="outlined"
          fullWidth
        >
          Add Another Service
        </Button>
      </Grid>
      
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>Pricing Details</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Provide pricing information for your services.
        </Typography>
      </Grid>
      
      {formData.pricing_details.map((pricing: PricingDetail, index: number) => (
        <Grid item xs={12} key={index} sx={{ mb: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Service Name"
                  value={pricing.service}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePricingChange(pricing, index, 'service', e)}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Price ($)"
                  type="number"
                  InputProps={{ startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box> }}
                  value={pricing.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePricingChange(pricing, index, 'price', e)}
                />
              </Grid>
              <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  color="error" 
                  onClick={() => removeArrayItem('pricing_details', index)}
                  disabled={formData.pricing_details.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={pricing.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePricingChange(pricing, index, 'description', e)}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      ))}
      
      <Grid item xs={12}>
        <Button 
          startIcon={<AddIcon />} 
          onClick={() => addArrayItem('pricing_details')}
          variant="outlined"
          fullWidth
        >
          Add Another Price Item
        </Button>
      </Grid>
      
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>Business Hours</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Specify your business hours or enter "Closed" if not open on a particular day.
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Monday"
          name="business_hours.monday"
          value={formData.business_hours.monday}
          onChange={handleChange}
          placeholder="e.g., 9:00 AM - 5:00 PM"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Tuesday"
          name="business_hours.tuesday"
          value={formData.business_hours.tuesday}
          onChange={handleChange}
          placeholder="e.g., 9:00 AM - 5:00 PM"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Wednesday"
          name="business_hours.wednesday"
          value={formData.business_hours.wednesday}
          onChange={handleChange}
          placeholder="e.g., 9:00 AM - 5:00 PM"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Thursday"
          name="business_hours.thursday"
          value={formData.business_hours.thursday}
          onChange={handleChange}
          placeholder="e.g., 9:00 AM - 5:00 PM"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Friday"
          name="business_hours.friday"
          value={formData.business_hours.friday}
          onChange={handleChange}
          placeholder="e.g., 9:00 AM - 5:00 PM"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Saturday"
          name="business_hours.saturday"
          value={formData.business_hours.saturday}
          onChange={handleChange}
          placeholder="e.g., 9:00 AM - 5:00 PM"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Sunday"
          name="business_hours.sunday"
          value={formData.business_hours.sunday}
          onChange={handleChange}
          placeholder="e.g., 9:00 AM - 5:00 PM"
        />
      </Grid>
    </Grid>
  );

  const renderImagesMediaStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Hero Image</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          This is the main image that will be displayed at the top of your profile.
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <Box sx={{ mb: 2 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="hero-image-upload"
            type="file"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e, 'hero_image_url')}
          />
          <label htmlFor="hero-image-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
            >
              Upload Hero Image
            </Button>
          </label>
        </Box>
        
        {formData.hero_image_url && (
          <Card sx={{ maxWidth: 500, mb: 2 }}>
            <CardMedia
              component="img"
              height="200"
              image={formData.hero_image_url}
              alt="Hero image"
            />
          </Card>
        )}
      </Grid>
      
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>Gallery Images</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Add images to showcase your work. You can add captions to each image.
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <Box sx={{ mb: 2 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="gallery-image-upload"
            type="file"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e, 'gallery')}
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
      </Grid>
      
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {formData.gallery_images.map((image: GalleryImage, index: number) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  height="150"
                  image={image.image_url}
                  alt={`Gallery image ${index + 1}`}
                />
                <CardContent>
                  <TextField
                    fullWidth
                    label="Caption"
                    value={image.caption}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCaptionChange(image, index, e)}
                    size="small"
                  />
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton 
                      color="error" 
                      onClick={() => removeArrayItem('gallery_images', index)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );

  const renderAdditionalDetailsStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Amenities</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          List amenities or features that make your business stand out.
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {formData.amenities.map((amenity: string, index: number) => (
            <Chip
              key={index}
              label={amenity}
              onDelete={() => handleDeleteAmenity(amenity)}
            />
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            label="Add Amenity"
            placeholder="e.g., Free Parking, Wheelchair Accessible"
            id="amenity-input"
            onKeyPress={(e: KeyboardEventType) => {
              if (e.key === 'Enter') {
                const input = document.getElementById('amenity-input') as HTMLInputElement;
                handleAddAmenity(input.value);
                input.value = '';
              }
            }}
          />
          <Button 
            variant="contained" 
            onClick={() => {
              const input = document.getElementById('amenity-input') as HTMLInputElement;
              handleAddAmenity(input.value);
              input.value = '';
            }}
          >
            Add
          </Button>
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>Frequently Asked Questions</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Add common questions and answers about your business.
        </Typography>
      </Grid>
      
      {formData.faq.map((faq: FAQ, index: number) => (
        <Grid item xs={12} key={index} sx={{ mb: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={11}>
                <TextField
                  fullWidth
                  label="Question"
                  value={faq.question}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFaqChange(faq, index, 'question', e)}
                />
              </Grid>
              <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  color="error" 
                  onClick={() => removeArrayItem('faq', index)}
                  disabled={formData.faq.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Answer"
                  value={faq.answer}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFaqChange(faq, index, 'answer', e)}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      ))}
      
      <Grid item xs={12}>
        <Button 
          startIcon={<AddIcon />} 
          onClick={() => addArrayItem('faq')}
          variant="outlined"
          fullWidth
        >
          Add Another FAQ
        </Button>
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
                {categories.find((c: Category) => c.id === formData.category_id)?.name || ''}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Description</Typography>
              <Typography>{formData.description}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Super Vendor Status</Typography>
              <Typography>{formData.is_super_vendor ? 'Yes' : 'No'}</Typography>
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
              <Typography variant="subtitle2">Address</Typography>
              <Typography>
                {formData.address.street && `${formData.address.street}, `}
                {formData.address.city && `${formData.address.city}, `}
                {formData.address.state && `${formData.address.state} `}
                {formData.address.zip}
              </Typography>
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
          <Typography variant="h6" gutterBottom>Services & Pricing</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Services Offered</Typography>
              {formData.services_offered.map((service: ServiceOffered, index: number) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">{service.name}</Typography>
                  <Typography variant="body2">{service.description}</Typography>
                </Box>
              ))}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Pricing Details</Typography>
              {formData.pricing_details.map((pricing: PricingDetail, index: number) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>{pricing.service}</strong>: ${pricing.price}
                    {pricing.description && ` - ${pricing.description}`}
                  </Typography>
                </Box>
              ))}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Business Hours</Typography>
              <Grid container spacing={1}>
                {Object.entries(formData.business_hours).map(([day, hours]) => (
                  hours && (
                    <Grid item xs={12} sm={6} key={day}>
                      <Typography variant="body2">
                        <strong>{day.charAt(0).toUpperCase() + day.slice(1)}</strong>: {hours}
                      </Typography>
                    </Grid>
                  )
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Images</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Hero Image</Typography>
              {formData.hero_image_url ? (
                <Box sx={{ maxWidth: 300, mt: 1 }}>
                  <img 
                    src={formData.hero_image_url} 
                    alt="Hero" 
                    style={{ width: '100%', height: 'auto', borderRadius: 4 }} 
                  />
                </Box>
              ) : (
                <Typography color="text.secondary">No hero image uploaded</Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Gallery Images</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                {formData.gallery_images.length > 0 ? (
                  formData.gallery_images.map((image: GalleryImage, index: number) => (
                    <Box key={index} sx={{ width: 100 }}>
                      <img 
                        src={image.image_url} 
                        alt={`Gallery ${index}`} 
                        style={{ width: '100%', height: 'auto', borderRadius: 4 }} 
                      />
                      <Typography variant="caption" display="block">
                        {image.caption || 'No caption'}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary">No gallery images uploaded</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Additional Details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Amenities</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {formData.amenities.length > 0 ? (
                  formData.amenities.map((amenity: string, index: number) => (
                    <Chip
                      key={index}
                      label={amenity}
                      size="small"
                    />
                  ))
                ) : (
                  <Typography color="text.secondary">No amenities added</Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">FAQs</Typography>
              {formData.faq.length > 0 ? (
                formData.faq.map((item: FAQ, index: number) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight="bold">{item.question}</Typography>
                    <Typography variant="body2">{item.answer}</Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">No FAQs added</Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
      {formData.is_super_vendor && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2, bgcolor: '#fff9c4' }}>
            <Typography variant="h6" gutterBottom>Super Vendor Payment</Typography>
            <Typography paragraph>
              You've selected to become a Super Vendor. A payment of $250 will be processed upon submission.
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                name="payment_method"
                value="credit_card"
                label="Payment Method"
              >
                <MenuItem value="credit_card">Credit Card</MenuItem>
                <MenuItem value="paypal">PayPal</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>
      )}
      
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
        return renderAdditionalDetailsStep();
      case 5:
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
            onClick={handleNext}
            endIcon={<ArrowForwardIcon />}
            disabled={!isStepValid()}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!isStepValid() || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            {loading ? 'Submitting...' : 'Submit Profile'}
          </Button>
        )}
      </Box>
    </Box>
  );

  // Validation function for each step
  const isStepValid = (): boolean => {
    switch (activeStep) {
      case 0: // Basic Info
        return (
          formData.name.trim() !== '' && 
          formData.description.trim() !== '' && 
          formData.category_id !== ''
        );
      case 1: // Location & Contact
        return (
          formData.location.trim() !== '' && 
          formData.address.city.trim() !== '' &&
          formData.address.state.trim() !== '' &&
          formData.contact_info.email.trim() !== '' &&
          formData.contact_info.phone.trim() !== '' &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_info.email) // Basic email validation
        );
      case 2: // Services & Pricing
        return (
          formData.services_offered.length > 0 &&
          formData.services_offered.every((service: ServiceOffered) => service.name.trim() !== '') &&
          formData.pricing_details.length > 0 &&
          formData.pricing_details.every((pricing: PricingDetail) => 
            pricing.service.trim() !== '' && 
            pricing.price.toString().trim() !== ''
          )
        );
      case 3: // Images & Media
        // Hero image is required, gallery images are optional
        return formData.hero_image_url.trim() !== '';
      case 4: // Additional Details
        // All fields in this step are optional
        return true;
      case 5: // Review
        // All validations should have been done in previous steps
        return true;
      default:
        return false;
    }
  };

  // Clean up unused variables
  const handleCleanup = () => {
    // This function would handle any cleanup needed when component unmounts
    // For example, revoking object URLs created for image previews
    formData.gallery_images.forEach((image: GalleryImage) => {
      if (image.image_url.startsWith('blob:')) {
        URL.revokeObjectURL(image.image_url);
      }
    });
    
    if (formData.hero_image_url.startsWith('blob:')) {
      URL.revokeObjectURL(formData.hero_image_url);
    }
  };

  // Use effect for cleanup
  React.useEffect(() => {
    return () => {
      handleCleanup();
    };
  }, []);

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
        open={snackbar?.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbar?.message}
        severity={snackbar?.severity}
      />
    </Container>
  );
};

export default VendorProfileForm;
