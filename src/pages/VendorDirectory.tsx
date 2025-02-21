import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Rating,
  Button,
  IconButton,
  Drawer,
  InputAdornment,
  Alert,
  CircularProgress,
  Pagination,
  Slider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import WebIcon from '@mui/icons-material/Web';

interface Vendor {
  id: string;
  business_name: string;
  category_id: string;
  description: string;
  logo_url: string;
  price_range: string;
  average_rating: number;
  total_reviews: number;
  is_verified: boolean;
  starting_price: number;
  locations: VendorLocation[];
  images: { image_url: string }[];
  tags: { name: string }[];
  instagram_handle?: string;
  facebook_url?: string;
  website_url?: string;
}

interface VendorLocation {
  city: string;
  state: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function VendorDirectory() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [rating, setRating] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const states = ['New York', 'New Jersey']; // Add more states as needed
  const itemsPerPage = 12;

  useEffect(() => {
    fetchCategories();
    fetchVendors();
  }, [page, searchTerm, selectedCategory, selectedState, priceRange, rating]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('vendor_categories')
      .select('*')
      .order('name');

    if (error) {
      setError('Error loading categories');
      return;
    }

    setCategories(data);
  };

  const fetchVendors = async () => {
    setLoading(true);
    let query = supabase
      .from('vendors')
      .select(`
        *,
        locations:vendor_locations(city, state),
        images:vendor_images(image_url),
        tags:vendor_tags_junction(vendor_tags(name))
      `)
      .eq('status', 'active')
      .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

    if (searchTerm) {
      query = query.ilike('business_name', `%${searchTerm}%`);
    }

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }

    if (selectedState) {
      query = query.eq('locations.state', selectedState);
    }

    if (priceRange[0] > 0 || priceRange[1] < 10000) {
      query = query
        .gte('starting_price', priceRange[0])
        .lte('starting_price', priceRange[1]);
    }

    if (rating > 0) {
      query = query.gte('average_rating', rating);
    }

    const { data, error, count } = await query;

    if (error) {
      setError('Error loading vendors');
      setLoading(false);
      return;
    }

    setVendors(data || []);
    setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    setLoading(false);
  };

  const toggleFavorite = async (vendorId: string) => {
    const newFavorites = favorites.includes(vendorId)
      ? favorites.filter(id => id !== vendorId)
      : [...favorites, vendorId];
    setFavorites(newFavorites);

    // Save to user's favorites in database
    const { error } = await supabase
      .from('user_favorite_vendors')
      .upsert({ 
        user_id: supabase.auth.user()?.id,
        vendor_id: vendorId,
        created_at: new Date()
      });

    if (error) {
      console.error('Error saving favorite:', error);
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    setSelectedCategory(event.target.value);
  };

  const handleStateChange = (event: SelectChangeEvent<string>) => {
    setSelectedState(event.target.value);
  };

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  const handleRatingChange = (event: React.SyntheticEvent, newValue: number | null) => {
    setRating(newValue || 0);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
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
            onChange={handleSelectChange}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>State</InputLabel>
          <Select
            value={selectedState}
            onChange={handleStateChange}
          >
            <MenuItem value="">All States</MenuItem>
            {states.map((state) => (
              <MenuItem key={state} value={state}>
                {state}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mt: 3 }}>
          <Typography gutterBottom>Price Range</Typography>
          <Slider
            value={priceRange}
            onChange={handleSliderChange}
            valueLabelDisplay="auto"
            min={0}
            max={10000}
            step={100}
          />
          <Typography variant="caption" color="textSecondary">
            ${priceRange[0]} - ${priceRange[1]}
          </Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography gutterBottom>Minimum Rating</Typography>
          <Rating
            value={rating}
            onChange={handleRatingChange}
          />
        </Box>
      </Box>
    </Drawer>
  );

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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {vendors.map((vendor) => (
              <Grid item xs={12} sm={6} md={4} key={vendor.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={vendor.images[0]?.image_url || '/placeholder.jpg'}
                    alt={vendor.business_name}
                  />
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" gutterBottom>
                        {vendor.business_name}
                        {vendor.is_verified && (
                          <VerifiedIcon color="primary" sx={{ ml: 1, width: 20 }} />
                        )}
                      </Typography>
                      <IconButton onClick={() => toggleFavorite(vendor.id)}>
                        {favorites.includes(vendor.id) ? (
                          <FavoriteIcon color="error" />
                        ) : (
                          <FavoriteBorderIcon />
                        )}
                      </IconButton>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={vendor.average_rating} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({vendor.total_reviews})
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOnIcon sx={{ width: 20, mr: 0.5 }} color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {vendor.locations.map(loc => `${loc.city}, ${loc.state}`).join(' | ')}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      Starting at ${vendor.starting_price}
                    </Typography>

                    <Box sx={{ mt: 1 }}>
                      {vendor.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag.name}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      {vendor.instagram_handle && (
                        <IconButton size="small" color="primary">
                          <InstagramIcon />
                        </IconButton>
                      )}
                      {vendor.facebook_url && (
                        <IconButton size="small" color="primary">
                          <FacebookIcon />
                        </IconButton>
                      )}
                      {vendor.website_url && (
                        <IconButton size="small" color="primary">
                          <WebIcon />
                        </IconButton>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}

      <FilterDrawer />
    </Container>
  );
}
