import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Rating,
  Snackbar
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import VerifiedIcon from '@mui/icons-material/Verified';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import WebIcon from '@mui/icons-material/Web';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vendor-tabpanel-${index}`}
      aria-labelledby={`vendor-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

interface Vendor {
  id: string;
  name: string;
  business_name: string;
  category_id: string;
  category_name: string;
  description: string;
  logo_url: string;
  price_range: string;
  average_rating: number;
  total_reviews: number;
  is_verified: boolean;
  is_super_vendor: boolean;
  starting_price: number;
  location: string;
  address: any;
  contact_info: any;
  hero_image_url: string;
  gallery_images: any[];
  services_offered: any[];
  pricing_details: any[];
  business_hours: any;
  social_media: any;
  amenities: string[];
  faq: any[];
  instagram_handle?: string;
  facebook_url?: string;
  website_url?: string;
}

const VendorProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!slug) {
          throw new Error('Vendor slug is required');
        }

        // Fetch vendor details
        const { data, error: vendorError } = await supabase
          .from('vendors')
          .select(`
            *,
            category:vendor_categories(*)
          `)
          .eq('slug', slug)
          .single();

        if (vendorError) throw vendorError;
        if (!data) throw new Error('Vendor not found');

        // Transform data to match our interface
        const vendorData: Vendor = {
          ...data,
          category_name: data.category?.name || 'Uncategorized',
          business_name: data.name || data.business_name,
          gallery_images: data.gallery_images || [],
          services_offered: data.services_offered || [],
          pricing_details: data.pricing_details || [],
          business_hours: data.business_hours || {},
          social_media: data.social_media || {},
          amenities: data.amenities || [],
          faq: data.faq || []
        };

        setVendor(vendorData);
      } catch (err: any) {
        console.error('Error fetching vendor details:', err);
        setError(err.message || 'Failed to load vendor details');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorDetails();
  }, [slug]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleContactVendor = async (type: 'email' | 'phone' | 'website') => {
    if (!vendor) return;

    try {
      // Log contact event
      await supabase
        .from('vendor_contact_events')
        .insert({
          vendor_id: vendor.id,
          contact_type: type,
          user_id: (await supabase.auth.getUser()).data.user?.id || null
        });

      // Open appropriate contact method
      if (type === 'email' && vendor.contact_info?.email) {
        window.location.href = `mailto:${vendor.contact_info.email}`;
      } else if (type === 'phone' && vendor.contact_info?.phone) {
        window.location.href = `tel:${vendor.contact_info.phone}`;
      } else if (type === 'website' && vendor.website_url) {
        window.open(vendor.website_url, '_blank');
      }
    } catch (err) {
      console.error('Error logging contact event:', err);
    }
  };

  const formatPriceRange = (priceRange: string) => {
    const dollarSigns = priceRange.length;
    return '$'.repeat(dollarSigns);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !vendor) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Vendor not found'}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/vendors')}
          sx={{ mt: 2 }}
        >
          Back to Vendors
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/vendors')}
        sx={{ mb: 2 }}
      >
        Back to Vendors
      </Button>

      {/* Hero Section */}
      <Paper 
        sx={{ 
          position: 'relative', 
          height: 300, 
          mb: 4, 
          backgroundImage: `url(${vendor.hero_image_url || '/placeholder-hero.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            p: 3, 
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h4" component="h1">
              {vendor.business_name}
              {vendor.is_verified && (
                <VerifiedIcon sx={{ ml: 1, width: 24, height: 24 }} />
              )}
            </Typography>
            {vendor.is_super_vendor && (
              <Chip 
                label="Super Vendor" 
                color="primary" 
                sx={{ 
                  fontWeight: 'bold', 
                  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                  color: 'white'
                }} 
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Chip 
              label={vendor.category_name} 
              size="small" 
              sx={{ mr: 1 }} 
            />
            <Rating value={vendor.average_rating} readOnly size="small" />
            <Typography variant="body2" sx={{ ml: 1 }}>
              ({vendor.total_reviews} reviews)
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="vendor tabs">
              <Tab label="Overview" />
              <Tab label="Services & Pricing" />
              <Tab label="Gallery" />
              <Tab label="FAQ" />
            </Tabs>
          </Box>

          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>About</Typography>
            <Typography paragraph>{vendor.description}</Typography>

            {vendor.amenities && vendor.amenities.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Amenities</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {vendor.amenities.map((amenity, index) => (
                    <Chip key={index} label={amenity} variant="outlined" />
                  ))}
                </Box>
              </>
            )}

            {vendor.business_hours && Object.keys(vendor.business_hours).length > 0 && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Business Hours</Typography>
                <List dense>
                  {Object.entries(vendor.business_hours).map(([day, hours]) => (
                    <ListItem key={day}>
                      <ListItemIcon>
                        <EventIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${day.charAt(0).toUpperCase() + day.slice(1)}`} 
                        secondary={hours || 'Closed'} 
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </TabPanel>

          {/* Services & Pricing Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>Services & Pricing</Typography>
            
            {vendor.pricing_details && vendor.pricing_details.length > 0 ? (
              <List>
                {vendor.pricing_details.map((item: any, index: number) => (
                  <ListItem key={index} divider={index < vendor.pricing_details.length - 1}>
                    <ListItemIcon>
                      <AttachMoneyIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.service} 
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            ${item.price}
                          </Typography>
                          {item.description && (
                            <Typography component="span" variant="body2" display="block">
                              {item.description}
                            </Typography>
                          )}
                        </>
                      } 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No pricing information available yet.
              </Typography>
            )}

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Price Range: {formatPriceRange(vendor.price_range || '$$')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Starting at ${vendor.starting_price}
            </Typography>
          </TabPanel>

          {/* Gallery Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>Gallery</Typography>
            
            {vendor.gallery_images && vendor.gallery_images.length > 0 ? (
              <Grid container spacing={2}>
                {vendor.gallery_images.map((image: any, index: number) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper sx={{ p: 2 }}>
                      <img 
                        src={image.url || '/placeholder.jpg'} 
                        alt={`Gallery image ${index + 1}`} 
                        style={{ width: '100%', height: 180, objectFit: 'cover' }}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary">
                No gallery images available yet.
              </Typography>
            )}
          </TabPanel>

          {/* FAQ Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>Frequently Asked Questions</Typography>
            
            {vendor.faq && vendor.faq.length > 0 ? (
              <List>
                {vendor.faq.map((item: any, index: number) => (
                  <ListItem key={index} divider={index < vendor.faq.length - 1} alignItems="flex-start">
                    <ListItemIcon>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.question} 
                      secondary={item.answer} 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No FAQ information available yet.
              </Typography>
            )}
          </TabPanel>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Contact Information</Typography>
            
            <List dense>
              {vendor.contact_info?.email && (
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email" 
                    secondary={vendor.contact_info.email} 
                  />
                </ListItem>
              )}
              
              {vendor.contact_info?.phone && (
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Phone" 
                    secondary={vendor.contact_info.phone} 
                  />
                </ListItem>
              )}
              
              {vendor.location && (
                <ListItem>
                  <ListItemIcon>
                    <LocationOnIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Location" 
                    secondary={vendor.location} 
                  />
                </ListItem>
              )}
            </List>

            <Box sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={() => handleContactVendor('email')}
                disabled={!vendor.contact_info?.email}
                sx={{ mb: 1 }}
              >
                Email Vendor
              </Button>
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={() => handleContactVendor('phone')}
                disabled={!vendor.contact_info?.phone}
                sx={{ mb: 1 }}
              >
                Call Vendor
              </Button>
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={() => handleContactVendor('website')}
                disabled={!vendor.website_url}
              >
                Visit Website
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Social Media</Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              {vendor.social_media?.instagram && (
                <IconButton 
                  color="primary" 
                  href={`https://instagram.com/${vendor.social_media.instagram}`}
                  target="_blank"
                >
                  <InstagramIcon fontSize="large" />
                </IconButton>
              )}
              
              {vendor.social_media?.facebook && (
                <IconButton 
                  color="primary" 
                  href={vendor.social_media.facebook}
                  target="_blank"
                >
                  <FacebookIcon fontSize="large" />
                </IconButton>
              )}
              
              {vendor.website_url && (
                <IconButton 
                  color="primary" 
                  href={vendor.website_url}
                  target="_blank"
                >
                  <WebIcon fontSize="large" />
                </IconButton>
              )}
            </Box>
            
            {(!vendor.social_media?.instagram && !vendor.social_media?.facebook && !vendor.website_url) && (
              <Typography color="text.secondary">
                No social media links available.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default VendorProfile;
