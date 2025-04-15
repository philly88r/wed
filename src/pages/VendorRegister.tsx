import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  SelectChangeEvent
} from '@mui/material';
import AuroraBackground from '../components/ui/AuroraBackground';

export default function VendorRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    categoryId: '',
    website: '',
    instagram: ''
  });
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
  const navigate = useNavigate();
  const theme = useTheme();

  // Fetch vendor categories on component mount
  useState(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('vendor_categories')
          .select('id, name')
          .order('name');
          
        if (error) throw error;
        if (data) setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  });

  // Create separate handlers for text fields and select fields
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.businessName || !formData.email || !formData.username || 
        !formData.password || !formData.categoryId) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Check if username already exists
      const { data: existingUser, error: userError } = await supabase
        .from('vendors')
        .select('id')
        .eq('username', formData.username)
        .maybeSingle();
        
      if (userError) throw userError;
      
      if (existingUser) {
        throw new Error('Username already exists. Please choose another one.');
      }
      
      // Generate a slug from business name
      const slug = formData.businessName
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      // Prepare vendor data
      const vendorData = {
        name: formData.businessName.toUpperCase(),
        slug: slug,
        category_id: formData.categoryId,
        username: formData.username,
        contact_info: {
          email: formData.email,
          phone: formData.phone,
          contact_name: formData.contactName
        },
        social_media: {
          website: formData.website,
          instagram: formData.instagram ? `https://instagram.com/${formData.instagram.replace('@', '')}` : ''
        },
        is_pending_approval: true
      };
      
      // Insert vendor record
      const { error: insertError } = await supabase
        .from('vendors')
        .insert(vendorData)
        .select('id')
        .single();
        
      if (insertError) throw insertError;
      
      // Set password using RPC function
      const { error: passwordError } = await supabase
        .rpc('set_vendor_password', { 
          vendor_username: formData.username, 
          vendor_password: formData.password 
        });
        
      if (passwordError) throw passwordError;
      
      setSuccess('Registration successful! Your account is pending approval. You will be notified when your account is approved.');
      
      // Clear form
      setFormData({
        businessName: '',
        contactName: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        confirmPassword: '',
        categoryId: '',
        website: '',
        instagram: ''
      });
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/vendor/login');
      }, 3000);
      
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        bgcolor: theme.palette.accent.rose,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0 }}>
        <AuroraBackground>
          <Box sx={{ height: '100vh' }} />
        </AuroraBackground>
      </Box>
      
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        <Card elevation={8} sx={{ bgcolor: 'white', borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box 
              component="img"
              src="/Altare Primary-Blanc.svg"
              alt="Altare Logo"
              sx={{ 
                width: '200px',
                display: 'block',
                mx: 'auto',
                mb: 3
              }}
            />
            
            <Typography variant="h5" component="h1" align="center" gutterBottom>
              Vendor Registration
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Business Information
              </Typography>
              
              <TextField
                name="businessName"
                label="Business Name *"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formData.businessName}
                onChange={handleTextChange}
                disabled={loading}
                required
              />
              
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="category-label">Vendor Category *</InputLabel>
                <Select
                  labelId="category-label"
                  name="categoryId"
                  value={formData.categoryId}
                  label="Vendor Category *"
                  onChange={handleSelectChange}
                  disabled={loading}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Select the category that best describes your business</FormHelperText>
              </FormControl>
              
              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                Contact Information
              </Typography>
              
              <TextField
                name="contactName"
                label="Contact Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formData.contactName}
                onChange={handleTextChange}
                disabled={loading}
              />
              
              <TextField
                name="email"
                label="Email Address *"
                type="email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formData.email}
                onChange={handleTextChange}
                disabled={loading}
                required
              />
              
              <TextField
                name="phone"
                label="Phone Number"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formData.phone}
                onChange={handleTextChange}
                disabled={loading}
              />
              
              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                Online Presence
              </Typography>
              
              <TextField
                name="website"
                label="Website URL"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formData.website}
                onChange={handleTextChange}
                disabled={loading}
                placeholder="https://yourwebsite.com"
              />
              
              <TextField
                name="instagram"
                label="Instagram Handle"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formData.instagram}
                onChange={handleTextChange}
                disabled={loading}
                placeholder="@yourbusiness"
              />
              
              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                Account Credentials
              </Typography>
              
              <TextField
                name="username"
                label="Username *"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formData.username}
                onChange={handleTextChange}
                disabled={loading}
                required
                helperText="This will be used to log in to your account"
              />
              
              <TextField
                name="password"
                label="Password *"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formData.password}
                onChange={handleTextChange}
                disabled={loading}
                required
                helperText="Must be at least 8 characters long"
              />
              
              <TextField
                name="confirmPassword"
                label="Confirm Password *"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formData.confirmPassword}
                onChange={handleTextChange}
                disabled={loading}
                required
              />
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Register'}
              </Button>
              
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?
                </Typography>
              </Divider>
              
              <Button
                component={Link}
                to="/vendor/login"
                variant="outlined"
                color="primary"
                fullWidth
                size="large"
              >
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
