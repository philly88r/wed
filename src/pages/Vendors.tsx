import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Box,
  Container,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Chip,
  Rating,
  InputAdornment,
  Divider,
  Stack,
} from '@mui/material';
import { Search, Phone, Mail, Globe, MapPin, DollarSign } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  category: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  city: string;
  state: string;
  rating: number;
  price_range: string;
}

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name');

      if (error) throw error;
      setVendors(data || []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const alphabet = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLetter = !selectedLetter || vendor.name.toUpperCase().startsWith(selectedLetter);
    
    return matchesSearch && matchesLetter;
  });

  const getPriceRangeDisplay = (range: string) => {
    return range.split('').map(() => '$').join('');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Vendor Directory
        </Typography>
        
        {/* Search Bar */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search vendors by name, category, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        {/* A-Z Filter */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            mb: 3,
            flexWrap: 'wrap',
            gap: 1,
            '& > *': { mb: 1 }
          }}
        >
          <Button
            variant={selectedLetter === null ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setSelectedLetter(null)}
          >
            All
          </Button>
          {alphabet.map((letter) => (
            <Button
              key={letter}
              variant={selectedLetter === letter ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setSelectedLetter(letter)}
            >
              {letter}
            </Button>
          ))}
        </Stack>

        {loading ? (
          <Typography>Loading vendors...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredVendors.map((vendor) => (
              <Grid item xs={12} sm={6} md={4} key={vendor.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {vendor.name}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={vendor.category}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip 
                        label={getPriceRangeDisplay(vendor.price_range)}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Rating value={vendor.rating} precision={0.1} readOnly />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {vendor.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <MapPin size={16} style={{ marginRight: 8 }} />
                      <Typography variant="body2">
                        {vendor.city}, {vendor.state}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {vendor.phone && (
                        <IconButton size="small" href={`tel:${vendor.phone}`}>
                          <Phone size={16} />
                        </IconButton>
                      )}
                      {vendor.email && (
                        <IconButton size="small" href={`mailto:${vendor.email}`}>
                          <Mail size={16} />
                        </IconButton>
                      )}
                      {vendor.website && (
                        <IconButton size="small" href={vendor.website} target="_blank">
                          <Globe size={16} />
                        </IconButton>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
}
