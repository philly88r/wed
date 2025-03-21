import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Rating,
  Chip,
  Tabs,
  Tab,
  ImageList,
  ImageListItem,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import WebIcon from '@mui/icons-material/Web';
import VerifiedIcon from '@mui/icons-material/Verified';

interface VendorDetails {
  id: string;
  name: string;
  description: string;
  location: string;
  contact_info: any;
  social_media: any;
  category: any;
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
    travel_zones: Array<{
      zone: string;
      radius_miles: number;
      fee: number;
    }>;
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
    videos: Array<{
      url: string;
      title: string;
      description: string;
    }>;
    photos: Array<{
      url: string;
      caption: string;
    }>;
    testimonials: Array<{
      client_name: string;
      date: string;
      rating: number;
      text: string;
      photos: string[];
    }>;
  };
  customization_options: {
    package_addons: Array<{
      name: string;
      price: number;
      description: string;
    }>;
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
    members: Array<{
      name: string;
      role: string;
      bio: string;
      photo_url: string;
    }>;
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
    preferred_vendors: Array<{
      name: string;
      type: string;
      discount: string;
    }>;
    venue_partnerships: Array<{
      venue: string;
      benefits: string;
    }>;
    package_deals: Array<{
      name: string;
      includes: string[];
      discount: string;
    }>;
    coordinator_experience: string;
  };
  is_featured?: boolean;
  gallery_images?: Array<{ url: string }>;
  slug?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function VendorDetail() {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<VendorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    fetchVendorDetails();
  }, [id]);

  const fetchVendorDetails = async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select(`
        *,
        category:vendor_categories(*),
        pricing_tier,
        availability,
        experience,
        portfolio,
        customization_options,
        team_info,
        logistics,
        collaboration
      `)
      .eq('id', id)
      .single();

    if (error) {
      setError('Error loading vendor details');
      setLoading(false);
      return;
    }

    setVendor(data);
    setLoading(false);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !vendor) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error || 'Vendor not found'}
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              {vendor.name}
              {vendor.is_featured && (
                <VerifiedIcon sx={{ color: theme.palette.primary.main, ml: 1 }} />
              )}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={vendor.experience.years_in_business} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {vendor.experience.years_in_business} years in business
              </Typography>
            </Box>

            <Typography variant="body1" paragraph>
              {vendor.description}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip icon={<LocationOnIcon />} label={vendor.location} />
              <Chip label={`Starting at $${vendor.pricing_tier.price_range.min}`} />
              <Chip label={`${vendor.experience.years_in_business} years in business`} />
            </Box>
          </Box>

          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="About" />
            <Tab label="Services" />
            <Tab label="Photos" />
            <Tab label="Reviews" />
            <Tab label="Availability" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="body1" paragraph>
              {vendor.description}
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Locations
            </Typography>
            <List>
              {vendor.availability.travel_zones.map((location, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>
                      <LocationOnIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={location.zone}
                    secondary={`${location.radius_miles} miles`}
                  />
                </ListItem>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {vendor.customization_options.package_addons.map((service, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {service.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {service.description}
                      </Typography>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                        }}
                      >
                        ${service.price}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <ImageList cols={3} gap={16}>
              {vendor.gallery_images?.map((item, index) => (
                <ImageListItem key={index}>
                  <img
                    src={item.url}
                    alt="Gallery image"
                    loading="lazy"
                  />
                </ImageListItem>
              )) || (
                <Typography variant="body1" color="text.secondary">
                  No gallery images available
                </Typography>
              )}
            </ImageList>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {vendor.portfolio.testimonials.map((review, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar src={review.photos[0]} sx={{ mr: 2 }}>
                    {review.client_name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {review.client_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                <Rating value={review.rating} readOnly size="small" />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {review.text}
                </Typography>
              </Paper>
            ))}
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Availability Calendar
              </Typography>
              {/* Add calendar component here */}
            </Box>
          </TabPanel>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 24 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              
              <List>
                {vendor.contact_info.phone && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <PhoneIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Phone"
                      secondary={vendor.contact_info.phone}
                    />
                  </ListItem>
                )}
                
                {vendor.contact_info.email && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <EmailIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Email"
                      secondary={vendor.contact_info.email}
                    />
                  </ListItem>
                )}
              </List>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', gap: 1 }}>
                {vendor.social_media.website_url && (
                  <Button
                    variant="outlined"
                    startIcon={<WebIcon />}
                    href={vendor.social_media.website_url}
                    target="_blank"
                  >
                    Website
                  </Button>
                )}
                
                {vendor.social_media.instagram_handle && (
                  <Button
                    variant="outlined"
                    startIcon={<InstagramIcon />}
                    href={`https://instagram.com/${vendor.social_media.instagram_handle}`}
                    target="_blank"
                  >
                    Instagram
                  </Button>
                )}
                
                {vendor.social_media.facebook_url && (
                  <Button
                    variant="outlined"
                    startIcon={<FacebookIcon />}
                    href={vendor.social_media.facebook_url}
                    target="_blank"
                  >
                    Facebook
                  </Button>
                )}
              </Box>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: theme.palette.accent.rose,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: theme.palette.accent.roseDark,
                    }
                  }}
                >
                  Contact Vendor
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
