import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Drawer,
  Snackbar,
  Alert,
  SelectChangeEvent,
  InputAdornment,
  Button,
  Icon
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Instagram as InstagramIcon,
  Verified as VerifiedIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { Vendor, Category } from '../types/vendor';

export default function VendorDirectory() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
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
      const { data, error } = await supabase
        .from('vendors')
        .select('*, category:vendor_categories(*)')
        .order('name');

      if (error) {
        throw error;
      }

      if (data) {
        setVendors(data);
        const uniqueLocations = [...new Set(data.map(v => v.location))];
        setLocations(uniqueLocations);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

  const handleLocationChange = (event: SelectChangeEvent) => {
    setSelectedLocation(event.target.value);
  };

  const filteredVendors = vendors.filter(vendor => {
    const categoryMatch = selectedCategory === 'all' || vendor.category?.id === selectedCategory;
    const locationMatch = selectedLocation === 'all' || vendor.location === selectedLocation;
    const searchMatch = !searchTerm || 
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && locationMatch && searchMatch;
  });

  const renderVendorCard = (vendor: Vendor) => (
    <Grid item xs={12} sm={6} md={4} key={vendor.id}>
      <Link to={`/vendors/${vendor.slug}`} style={{ textDecoration: 'none' }}>
        <Card 
          sx={{ 
            textDecoration: 'none', 
            color: 'inherit',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 3,
              cursor: 'pointer'
            }
          }}
        >
          <CardMedia
            component="img"
            height="200"
            image={(vendor.gallery_images && vendor.gallery_images[0]?.url) || '/placeholder.jpg'}
            alt={vendor.name}
          />
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h6" gutterBottom>
                {vendor.name}
                {vendor.is_featured && (
                  <VerifiedIcon color="primary" sx={{ ml: 1, width: 20 }} />
                )}
              </Typography>
              <IconButton 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(vendor.id);
                }}
              >
                {favorites.includes(vendor.id) ? (
                  <FavoriteIcon color="error" />
                ) : (
                  <FavoriteBorderIcon />
                )}
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                {vendor.category?.icon && (
                  <Icon sx={{ mr: 0.5, fontSize: '1.2rem' }}>{vendor.category.icon}</Icon>
                )}
                {vendor.category?.name || 'Uncategorized'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon sx={{ width: 20, mr: 0.5 }} color="action" />
                <Typography variant="body2" color="text.secondary">
                  {vendor.location}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" paragraph>
              {vendor.description ? vendor.description : 'No description available'}
            </Typography>

            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              {vendor.social_media?.instagram && (
                <IconButton 
                  size="small" 
                  color="primary"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (vendor.social_media?.instagram) {
                      window.open(vendor.social_media.instagram, '_blank');
                    }
                  }}
                >
                  <InstagramIcon />
                </IconButton>
              )}
            </Box>
          </CardContent>
        </Card>
      </Link>
    </Grid>
  );

  const checkFavoriteStatus = async (vendorId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: favorite } = await supabase
        .from('user_favorite_vendors')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('vendor_id', vendorId)
        .single();

      return !!favorite;
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async (vendorId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Handle not logged in state
        showSnackbar('Please log in to save favorites', 'error');
        return;
      }

      const isFavorite = await checkFavoriteStatus(vendorId);
      
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorite_vendors')
          .delete()
          .eq('user_id', session.user.id)
          .eq('vendor_id', vendorId);

        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorite_vendors')
          .insert({
            user_id: session.user.id,
            vendor_id: vendorId
          });

        if (error) throw error;
      }

      // Update local state
      const newFavorites = isFavorite
        ? favorites.filter(id => id !== vendorId)
        : [...favorites, vendorId];
      setFavorites(newFavorites);
      
      showSnackbar(
        isFavorite ? 'Removed from favorites' : 'Added to favorites',
        'success'
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showSnackbar('Error updating favorites', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const FilterDrawer = () => (
    <Drawer
      anchor="right"
      open={isFilterDrawerOpen}
      onClose={() => setIsFilterDrawerOpen(false)}
    >
      <Box sx={{ width: 300, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <MenuItem value="all">
              <Box component="span" sx={{ mr: 1, display: 'inline-flex', verticalAlign: 'middle' }}>
                <Icon>category</Icon>
              </Box>
              All Categories
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.icon && (
                  <Box component="span" sx={{ mr: 1, display: 'inline-flex', verticalAlign: 'middle' }}>
                    <Icon>{category.icon}</Icon>
                  </Box>
                )}
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Location</InputLabel>
          <Select
            value={selectedLocation}
            onChange={handleLocationChange}
          >
            <MenuItem value="all">All Locations</MenuItem>
            {locations.map((location) => (
              <MenuItem key={location} value={location}>
                {location}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Drawer>
  );

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Find Your Perfect Wedding Vendor
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setIsFilterDrawerOpen(true)}
            >
              Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredVendors.map(renderVendorCard)}
          </Grid>
        </>
      )}

      <FilterDrawer />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
