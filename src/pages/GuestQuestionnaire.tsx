import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSupabase } from '../supabaseClient';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  useTheme,
} from '@mui/material';

interface FormData {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  email: string;
}

export default function GuestQuestionnaire() {
  const theme = useTheme();
  const { weddingName } = useParams();
  const [coupleName, setCoupleName] = useState('');
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    email: '',
  });

  useEffect(() => {
    const fetchCoupleInfo = async () => {
      const supabaseClient = getSupabase();
      const { data } = await supabaseClient
        .from('custom_links')
        .select('name')
        .eq('questionnaire_path', `/${weddingName}`)
        .single();

      if (data) {
        // Convert smithswedding to "the Smiths"
        const name = data.name.toLowerCase()
          .replace('wedding', '')
          .replace(/s$/, '')
          .trim();
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
        setCoupleName(`the ${formattedName}s`);
      }
    };

    if (weddingName) {
      fetchCoupleInfo();
    }
  }, [weddingName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const supabaseClient = getSupabase();
    // First, add to guests table
    const { error: guestError } = await supabaseClient
      .from('guests')
      .insert([{
        full_name: formData.fullName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        country: formData.country,
        email: formData.email
      }]);

    if (guestError) {
      console.error('Error submitting to guests:', guestError);
      return;
    }

    // Also store in guest_responses for backup
    const { error: responseError } = await supabaseClient
      .from('guest_responses')
      .insert([{
        wedding_name: weddingName,
        ...formData
      }]);

    if (responseError) {
      console.error('Error submitting response:', responseError);
      return;
    }

    // Show success message and clear form
    alert('Thank you! Your information has been submitted.');
    setFormData({
      fullName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      email: '',
    });
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 8
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontFamily: "'Playfair Display', serif",
              color: theme.palette.primary.main,
              mb: 2
            }}
          >
            Altare
          </Typography>
          <img 
            src="/logo.png" 
            alt="Altare Logo" 
            style={{ 
              width: 120, 
              height: 'auto',
              margin: '0 auto 2rem'
            }} 
          />
        </Box>

        <Paper 
          elevation={3}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: theme.palette.primary.main,
            }
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "'Playfair Display', serif",
                color: theme.palette.text.primary,
                mb: 3
              }}
            >
              You're Invited
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '1.1rem',
                lineHeight: 1.6,
                maxWidth: '600px',
                margin: '0 auto'
              }}
            >
              {coupleName} are excited to share their special day with you! To ensure you receive all the important details about their wedding celebration, please take a moment to provide your contact information below.
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Full Name"
                required
                fullWidth
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
              <TextField
                label="Current Home Address"
                required
                fullWidth
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <TextField
                  label="City"
                  required
                  fullWidth
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <TextField
                  label="State"
                  required
                  fullWidth
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <TextField
                  label="Zip or Postal Code"
                  required
                  fullWidth
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                />
                <TextField
                  label="Country"
                  required
                  fullWidth
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </Box>
              <TextField
                label="Email Address"
                type="email"
                required
                fullWidth
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  mt: 2,
                  py: 2,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  borderRadius: 2
                }}
              >
                Submit Information
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
