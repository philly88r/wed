import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Grid, 
  Card, 
  CardContent, 
  Tabs, 
  Tab, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  InputAdornment,
  Icon,
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import SortIcon from '@mui/icons-material/Sort';
import { localVendors, localCategories, getUniqueLocations } from '../data/vendorData';

enum ViewMode {
  Alphabetical = "alphabetical",
  ByCategory = "byCategory",
  ByLocation = "byLocation"
}

const VendorDirectoryLocal: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Alphabetical);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  
  const locations = useMemo(() => getUniqueLocations(), []);

  // Filter vendors based on search, category, and location
  const filteredVendors = useMemo(() => {
    return localVendors.filter(vendor => {
      const category = localCategories.find(c => c.id === vendor.category_id);
      const matchesSearch = searchTerm === '' || 
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || vendor.category_id === selectedCategory;
      const matchesLocation = selectedLocation === '' || vendor.location === selectedLocation;
      
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [searchTerm, selectedCategory, selectedLocation]);

  // Sort vendors based on view mode
  const sortedVendors = useMemo(() => {
    const vendors = [...filteredVendors];
    switch (viewMode) {
      case ViewMode.Alphabetical:
        return vendors.sort((a, b) => a.name.localeCompare(b.name));
      case ViewMode.ByCategory:
        return vendors.sort((a, b) => {
          const catA = localCategories.find(c => c.id === a.category_id)?.name || '';
          const catB = localCategories.find(c => c.id === b.category_id)?.name || '';
          return catA.localeCompare(catB) || a.name.localeCompare(b.name);
        });
      case ViewMode.ByLocation:
        return vendors.sort((a, b) => 
          a.location.localeCompare(b.location) || a.name.localeCompare(b.name)
        );
      default:
        return vendors;
    }
  }, [filteredVendors, viewMode]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleViewModeChange = (_: React.SyntheticEvent, newMode: ViewMode) => {
    setViewMode(newMode);
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedCategory(event.target.value);
  };

  const handleLocationChange = (event: SelectChangeEvent<string>) => {
    setSelectedLocation(event.target.value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Local Vendor Directory
        </Typography>
        
        {/* Search and Filter Controls */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select<string>
                labelId="category-select-label"
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Category"
                startAdornment={
                  <InputAdornment position="start">
                    <CategoryIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Categories</MenuItem>
                {localCategories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Icon sx={{ mr: 1 }}>{category.icon}</Icon>
                      {category.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="location-select-label">Location</InputLabel>
              <Select<string>
                labelId="location-select-label"
                value={selectedLocation}
                onChange={handleLocationChange}
                label="Location"
                startAdornment={
                  <InputAdornment position="start">
                    <LocationOnIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Locations</MenuItem>
                {locations.map(location => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* View Mode Tabs */}
        <Tabs
          value={viewMode}
          onChange={handleViewModeChange}
          sx={{ mb: 2 }}
        >
          <Tab 
            icon={<SortIcon />} 
            label="Alphabetical" 
            value={ViewMode.Alphabetical} 
          />
          <Tab 
            icon={<CategoryIcon />} 
            label="By Category" 
            value={ViewMode.ByCategory} 
          />
          <Tab 
            icon={<LocationOnIcon />} 
            label="By Location" 
            value={ViewMode.ByLocation} 
          />
        </Tabs>
      </Box>

      {/* Vendor Grid */}
      <Grid container spacing={3}>
        {sortedVendors.map(vendor => (
          <Grid item xs={12} sm={6} md={4} key={vendor.name}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2">
                  {vendor.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                    {vendor.location}
                  </Box>
                </Typography>
                <Typography color="textSecondary">
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Icon sx={{ mr: 1 }}>
                      {localCategories.find(c => c.id === vendor.category_id)?.icon}
                    </Icon>
                    {localCategories.find(c => c.id === vendor.category_id)?.name}
                  </Box>
                </Typography>
                {vendor.description && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {vendor.description}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default VendorDirectoryLocal;
