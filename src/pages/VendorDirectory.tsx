import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardMedia,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  SelectChangeEvent,
  InputAdornment,
  Paper,
  useTheme
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Search as SearchIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { Vendor, Category } from '../types/vendor';

export default function VendorDirectory() {
  const theme = useTheme();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchVendors();
    fetchCategories();
  }, [searchTerm, selectedCategory, selectedLocation]);

  const fetchCategories = async () => {
    try {
      const { data: categories, error } = await supabase
        .from('vendor_categories')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      if (categories) {
        setCategories(categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          *,
          category:vendor_categories(*)
        `)
        .order('name');

      if (error) {
        throw error;
      }

      if (data) {
        setVendors(data);
        // Extract unique locations
        const uniqueLocations = [...new Set(data.map(vendor => vendor.location))];
        setLocations(uniqueLocations);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setSnackbar({
        open: true,
        message: 'Error loading vendors. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = searchTerm === '' || 
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || vendor.category_id === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || vendor.location === selectedLocation;

    return matchesSearch && matchesCategory && matchesLocation;
  });

  const handleCategoryChange = (e: SelectChangeEvent) => {
    setSelectedCategory(e.target.value);
  };

  const handleLocationChange = (e: SelectChangeEvent) => {
    setSelectedLocation(e.target.value);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h1" component="h1" gutterBottom sx={{ color: theme.palette.primary.main }}>
          Find Your Perfect Vendor
        </Typography>
        <Typography variant="subtitle1" sx={{ 
          maxWidth: '600px', 
          mx: 'auto', 
          mb: 4,
          color: theme.palette.primary.main,
        }}>
          Discover and connect with the best wedding vendors in your area
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'background.paper' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: theme.palette.primary.main }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.default',
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
                color: theme.palette.primary.main,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined" sx={{ bgcolor: 'background.default' }}>
              <InputLabel id="category-label" sx={{ color: theme.palette.primary.main }}>Category</InputLabel>
              <Select
                labelId="category-label"
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Category"
                sx={{ color: theme.palette.primary.main }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined" sx={{ bgcolor: 'background.default' }}>
              <InputLabel id="location-label" sx={{ color: theme.palette.primary.main }}>Location</InputLabel>
              <Select
                labelId="location-label"
                value={selectedLocation}
                onChange={handleLocationChange}
                label="Location"
                sx={{ color: theme.palette.primary.main }}
              >
                <MenuItem value="all">All Locations</MenuItem>
                {locations.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredVendors.map((vendor) => (
            <Grid item xs={12} sm={6} md={4} key={vendor.id}>
              <Card 
                component={Link} 
                to={`/vendors/${vendor.slug}`}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={vendor.gallery_images?.[0]?.url || '/placeholder-vendor.jpg'}
                  alt={vendor.name}
                  sx={{ objectFit: 'cover' }}
                />
                <Box sx={{ 
                  p: 2,
                  bgcolor: 'white',
                  borderTop: `4px solid ${theme.palette.accent.rose}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {vendor.is_featured && (
                      <VerifiedIcon sx={{ color: theme.palette.primary.main, mr: 1 }} fontSize="small" />
                    )}
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      noWrap 
                      sx={{ 
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                      }}
                    >
                      {vendor.name}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: theme.palette.primary.main,
                      mb: 1,
                    }}
                  >
                    {vendor.category?.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon sx={{ color: theme.palette.primary.main, fontSize: '1rem' }} />
                    <Typography variant="body2" sx={{ color: theme.palette.primary.main }} noWrap>
                      {vendor.location}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
