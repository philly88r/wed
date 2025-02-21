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
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import WebIcon from '@mui/icons-material/Web';
import VerifiedIcon from '@mui/icons-material/Verified';

interface VendorDetails {
  id: string;
  business_name: string;
  description: string;
  short_description: string;
  logo_url: string;
  website_url: string;
  phone: string;
  email: string;
  instagram_handle: string;
  facebook_url: string;
  starting_price: number;
  price_range: string;
  years_in_business: number;
  is_verified: boolean;
  average_rating: number;
  total_reviews: number;
  images: Array<{ image_url: string; caption: string }>;
  services: Array<{ name: string; description: string; price_starts_at: number }>;
  locations: Array<{ address_line1: string; city: string; state: string; zip_code: string }>;
  reviews: Array<{
    rating: number;
    review_text: string;
    user: { name: string; avatar_url: string };
    created_at: string;
  }>;
  availability: Array<{ date: string; status: string }>;
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
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    fetchVendorDetails();
  }, [id]);

  const fetchVendorDetails = async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select(`
        *,
        images:vendor_images(*),
        services:vendor_services(*),
        locations:vendor_locations(*),
        reviews:vendor_reviews(
          rating,
          review_text,
          created_at,
          user:users(name, avatar_url)
        ),
        availability:vendor_availability(*)
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
              {vendor.business_name}
              {vendor.is_verified && (
                <VerifiedIcon color="primary" sx={{ ml: 1 }} />
              )}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={vendor.average_rating} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {vendor.average_rating.toFixed(1)} ({vendor.total_reviews} reviews)
              </Typography>
            </Box>

            <Typography variant="body1" paragraph>
              {vendor.short_description}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip icon={<LocationOnIcon />} label={vendor.locations[0]?.city + ', ' + vendor.locations[0]?.state} />
              <Chip label={`Starting at $${vendor.starting_price}`} />
              <Chip label={`${vendor.years_in_business} years in business`} />
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
              {vendor.locations.map((location, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>
                      <LocationOnIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={location.address_line1}
                    secondary={`${location.city}, ${location.state} ${location.zip_code}`}
                  />
                </ListItem>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {vendor.services.map((service, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {service.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {service.description}
                      </Typography>
                      <Typography variant="subtitle1" color="primary">
                        Starting at ${service.price_starts_at}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <ImageList cols={3} gap={16}>
              {vendor.images.map((item, index) => (
                <ImageListItem key={index}>
                  <img
                    src={item.image_url}
                    alt={item.caption || 'Gallery image'}
                    loading="lazy"
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {vendor.reviews.map((review, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar src={review.user.avatar_url} sx={{ mr: 2 }}>
                    {review.user.name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {review.user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                <Rating value={review.rating} readOnly size="small" />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {review.review_text}
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
                {vendor.phone && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <PhoneIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Phone"
                      secondary={vendor.phone}
                    />
                  </ListItem>
                )}
                
                {vendor.email && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <EmailIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Email"
                      secondary={vendor.email}
                    />
                  </ListItem>
                )}
              </List>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', gap: 1 }}>
                {vendor.website_url && (
                  <Button
                    variant="outlined"
                    startIcon={<WebIcon />}
                    href={vendor.website_url}
                    target="_blank"
                  >
                    Website
                  </Button>
                )}
                
                {vendor.instagram_handle && (
                  <Button
                    variant="outlined"
                    startIcon={<InstagramIcon />}
                    href={`https://instagram.com/${vendor.instagram_handle}`}
                    target="_blank"
                  >
                    Instagram
                  </Button>
                )}
                
                {vendor.facebook_url && (
                  <Button
                    variant="outlined"
                    startIcon={<FacebookIcon />}
                    href={vendor.facebook_url}
                    target="_blank"
                  >
                    Facebook
                  </Button>
                )}
              </Box>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
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
