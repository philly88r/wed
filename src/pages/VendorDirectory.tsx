import { useState, useEffect } from 'react';
import { getSupabase } from '../supabaseClient';
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
  useTheme,
  Chip,
  Checkbox,
  FormControlLabel,
  Divider,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Search as SearchIcon,
  Verified as VerifiedIcon,
  Star as StarIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { Vendor, Category } from '../types/vendor';

export default function VendorDirectory() {
  const theme = useTheme();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [priceRanges, setPriceRanges] = useState<string[]>(['$', '$$', '$$$']);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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
  }, [searchTerm, selectedCategory, selectedLocation, selectedPriceRange, featuredOnly]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const supabase = getSupabase();
      if (!supabase) {
        console.error('Supabase client is null');
        setSnackbar({
          open: true,
          message: 'Error connecting to database',
          severity: 'error'
        });
        return;
      }
      
      const { data: categories, error } = await supabase
        .from('vendor_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        setSnackbar({
          open: true,
          message: `Error loading categories: ${error.message}`,
          severity: 'error'
        });
        return;
      }

      if (categories) {
        setCategories(categories as Category[]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setSnackbar({
        open: true,
        message: 'Unexpected error loading categories',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const supabase = getSupabase();
      if (!supabase) {
        console.error('Supabase client is null');
        setSnackbar({
          open: true,
          message: 'Error connecting to database',
          severity: 'error'
        });
        return;
      }
      
      let query = supabase
        .from('vendors')
        .select(`
          *,
          category:vendor_categories(id, name)
        `);

      // Apply filters
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      if (selectedLocation !== 'all') {
        query = query.eq('location', selectedLocation);
      }
      
      if (featuredOnly) {
        query = query.eq('is_featured', true);
      }
      
      if (selectedPriceRange !== 'all') {
        // Filter by price tier if selected
        query = query.eq('price_tier->>tier', selectedPriceRange);
      }

      if (searchTerm) {
        // Enhanced search across multiple fields
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('is_featured', { ascending: false }).order('name');

      if (error) {
        console.error('Database error fetching vendors:', error);
        setSnackbar({
          open: true,
          message: `Error loading vendors: ${error.message}`,
          severity: 'error'
        });
        return;
      }

      if (data) {
        setVendors(data as Vendor[]);
        // Extract unique locations
        const uniqueLocations = [...new Set(data.map(vendor => vendor.location))].filter(Boolean).sort();
        setLocations(uniqueLocations as string[]);
      }
    } catch (error) {
      console.error('Unexpected error fetching vendors:', error);
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
    const matchesPriceRange = selectedPriceRange === 'all' || vendor.pricing_tier === selectedPriceRange;
    const matchesFeatured = !featuredOnly || vendor.is_featured === true;

    return matchesSearch && matchesCategory && matchesLocation && matchesPriceRange && matchesFeatured;
  });

  const handleCategoryChange = (e: SelectChangeEvent) => {
    setSelectedCategory(e.target.value);
  };

  const handleLocationChange = (e: SelectChangeEvent) => {
    setSelectedLocation(e.target.value);
  };
  
  const handlePriceRangeChange = (e: SelectChangeEvent) => {
    setSelectedPriceRange(e.target.value);
  };
  
  const handleFeaturedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeaturedOnly(e.target.checked);
  };
  
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSelectedPriceRange('all');
    setFeaturedOnly(false);
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
              placeholder="Search vendors by name, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: theme.palette.primary.main }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchTerm('')} size="small">
                      <CloseIcon sx={{ color: theme.palette.primary.main }} />
                    </IconButton>
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
                <MenuItem value="featured">Featured Vendors</MenuItem>
                <Divider />
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={featuredOnly}
                    onChange={handleFeaturedChange}
                    sx={{
                      color: theme.palette.primary.main,
                      '&.Mui-checked': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center' }}>
                    Featured Only <StarIcon fontSize="small" sx={{ ml: 0.5, color: theme.palette.accent.rose }} />
                  </Typography>
                }
                sx={{ mr: 1 }}
              />
              <Button
                variant="outlined"
                onClick={toggleAdvancedFilters}
                startIcon={<FilterListIcon />}
                sx={{ 
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.accent.rose,
                  }
                }}
              >
                Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {showAdvancedFilters && (
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
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
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined" sx={{ bgcolor: 'background.default' }}>
                  <InputLabel id="price-label" sx={{ color: theme.palette.primary.main }}>Price Range</InputLabel>
                  <Select
                    labelId="price-label"
                    value={selectedPriceRange}
                    onChange={handlePriceRangeChange}
                    label="Price Range"
                    sx={{ color: theme.palette.primary.main }}
                  >
                    <MenuItem value="all">All Price Ranges</MenuItem>
                    <MenuItem value="$">$ (Budget Friendly)</MenuItem>
                    <MenuItem value="$$">$$ (Mid-Range)</MenuItem>
                    <MenuItem value="$$$">$$$ (Luxury)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button 
                  variant="contained" 
                  onClick={clearFilters}
                  sx={{ 
                    bgcolor: theme.palette.accent.rose,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: '#FFD5CC',
                    }
                  }}
                >
                  Clear All Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
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
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      noWrap 
                      sx={{ 
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        mr: 1,
                        flexGrow: 1
                      }}
                    >
                      {vendor.name}
                    </Typography>
                    {vendor.is_featured && (
                      <Tooltip title="Featured Vendor">
                        <StarIcon sx={{ color: theme.palette.accent.rose }} fontSize="small" />
                      </Tooltip>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {vendor.pricing_tier && (
                      <Chip 
                        size="small" 
                        label={
                          typeof vendor.pricing_tier === 'object' && vendor.pricing_tier !== null
                            ? vendor.pricing_tier.tier || 'Standard'
                            : typeof vendor.pricing_tier === 'string'
                              ? vendor.pricing_tier
                              : 'Standard'
                        } 
                        icon={<MoneyIcon fontSize="small" />}
                        sx={{ 
                          bgcolor: theme.palette.accent.rose, 
                          color: theme.palette.primary.main,
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }} 
                      />
                    )}
                    {vendor.is_featured && (
                      <Chip 
                        size="small" 
                        label="Featured" 
                        icon={<StarIcon fontSize="small" />}
                        sx={{ 
                          bgcolor: theme.palette.accent.rose, 
                          color: theme.palette.primary.main,
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }} 
                      />
                    )}
                  </Box>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: theme.palette.primary.main,
                      mb: 1,
                    }}
                  >
                    {typeof vendor.category === 'object' && vendor.category !== null 
                      ? vendor.category.name 
                      : typeof vendor.category === 'string' 
                        ? vendor.category 
                        : 'Unknown Category'}
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
