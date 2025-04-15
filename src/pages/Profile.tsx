import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Avatar,
  IconButton,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { getSupabase } from '../supabaseClient';

// Define profile data interface
interface ProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  wedding_date?: string;
  partner_name?: string;
  [key: string]: any;
}

export default function Profile() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    weddingDate: '',
    partnerName: '',
    location: '',
  });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    // Check if a plan was selected from the pricing page
    if (location.state && location.state.selectedPlan) {
      setSelectedPlan(location.state.selectedPlan);
      setNotification(`Thank you for selecting the ${location.state.selectedPlan} plan!`);
    }
    
    // Fetch user profile data
    const fetchUserProfile = async () => {
      try {
        const supabaseClient = getSupabase();
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (user) {
          // Get user profile from the profiles table
          const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching profile:', error);
          } else if (data) {
            const profileData = data as ProfileData;
            setFormData({
              firstName: profileData.first_name || '',
              lastName: profileData.last_name || '',
              email: user.email || '',
              phone: profileData.phone || '',
              weddingDate: profileData.wedding_date || '',
              partnerName: profileData.partner_name || '',
              location: profileData.location || '',
            });
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [location]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    
    try {
      const supabaseClient = getSupabase();
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (user) {
        // Format the wedding date properly for PostgreSQL (YYYY-MM-DD)
        const formattedWeddingDate = formData.weddingDate ? 
          new Date(formData.weddingDate).toISOString().split('T')[0] : null;

        // Create an update object with only the fields we know exist
        const updateData: any = {
          first_name: formData.firstName || '',
          last_name: formData.lastName || '',
          wedding_date: formattedWeddingDate,
          partner_name: formData.partnerName || '',
          phone: formData.phone || '',
          location: formData.location ? formData.location.trim() : '',
          updated_at: new Date(),
        };

        // Try to update the profile with only the fields we know exist
        const { error } = await supabaseClient
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);
          
        if (error) {
          console.error('Error updating profile:', error);
          setNotification('Error updating profile. Please try again.');
        } else {
          setNotification('Profile updated successfully!');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setNotification('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Get greeting with user's name or last name
  const getGreeting = () => {
    if (formData.firstName) {
      return `Welcome, ${formData.firstName}!`;
    } else if (formData.lastName) {
      return `Welcome, ${formData.lastName} Family!`;
    } else {
      return 'Welcome to Your Profile';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ 
          color: 'primary.main',
          fontFamily: "'Giaza', serif",
          letterSpacing: '-0.05em',
        }}
      >
        {getGreeting()}
      </Typography>
      
      {selectedPlan && (
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3, 
            backgroundColor: '#FFE8E4',
            borderRadius: 0,
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'primary.main',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Thank you for choosing our {selectedPlan} plan!
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'primary.main', 
              opacity: 0.8,
              mt: 1,
            }}
          >
            Your subscription has been activated. You now have access to all the features included in this plan.
          </Typography>
        </Paper>
      )}

      <Paper 
        sx={{ 
          p: 3, 
          mt: 3,
          borderRadius: 0,
          border: '1px solid',
          borderColor: 'primary.main',
          borderOpacity: 0.1,
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: '#FFE8E4',
                color: 'primary.main',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '2rem',
              }}
            >
              {formData.firstName?.[0] || formData.lastName?.[0] || 'A'}
            </Avatar>
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="label"
              sx={{
                color: 'primary.main',
                backgroundColor: '#FFE8E4',
                '&:hover': {
                  backgroundColor: '#FFD5CC',
                },
              }}
            >
              <input hidden accept="image/*" type="file" />
              <PhotoCamera />
            </IconButton>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                sx={{
                  '& .MuiInputLabel-root': {
                    color: 'primary.main',
                    opacity: 0.8,
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'primary.main',
                      opacity: 0.3,
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                      opacity: 0.5,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                sx={{
                  '& .MuiInputLabel-root': {
                    color: 'primary.main',
                    opacity: 0.8,
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'primary.main',
                      opacity: 0.3,
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                      opacity: 0.5,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                sx={{
                  '& .MuiInputLabel-root': {
                    color: 'primary.main',
                    opacity: 0.8,
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'primary.main',
                      opacity: 0.3,
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                      opacity: 0.5,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                sx={{
                  '& .MuiInputLabel-root': {
                    color: 'primary.main',
                    opacity: 0.8,
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'primary.main',
                      opacity: 0.3,
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                      opacity: 0.5,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Wedding Date"
                name="weddingDate"
                type="date"
                value={formData.weddingDate}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiInputLabel-root': {
                    color: 'primary.main',
                    opacity: 0.8,
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'primary.main',
                      opacity: 0.3,
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                      opacity: 0.5,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Partner's Name"
                name="partnerName"
                value={formData.partnerName}
                onChange={handleChange}
                sx={{
                  '& .MuiInputLabel-root': {
                    color: 'primary.main',
                    opacity: 0.8,
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'primary.main',
                      opacity: 0.3,
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                      opacity: 0.5,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Wedding Location"
                name="location"
                placeholder="City, State"
                value={formData.location}
                onChange={handleChange}
                sx={{
                  '& .MuiInputLabel-root': {
                    color: 'primary.main',
                    opacity: 0.8,
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'primary.main',
                      opacity: 0.3,
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                      opacity: 0.5,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                px: 4,
                backgroundColor: '#FFE8E4',
                color: 'primary.main',
                borderRadius: 0,
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                '&:hover': {
                  backgroundColor: '#FFD5CC',
                },
              }}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
      </Paper>
      
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNotification('')} 
          severity="success" 
          sx={{ 
            width: '100%',
            backgroundColor: '#FFE8E4',
            color: 'primary.main',
            '& .MuiAlert-icon': {
              color: 'primary.main',
            },
          }}
        >
          {notification}
        </Alert>
      </Snackbar>
    </Container>
  );
}
