import { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  useTheme,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface ServiceCard {
  title: string;
  price: string;
  path: string;
  description?: string;
}

const services: ServiceCard[] = [
  {
    title: 'Wedding Planning Video Tutorials',
    price: '$59',
    path: '/tutorials',
  },
  {
    title: 'Address Book',
    price: '$39',
    path: '/address-book',
  },
  {
    title: 'Budget Calculator',
    price: '$29',
    path: '/budget',
  },
  {
    title: 'Wedding Planning Checklist Calculator',
    price: '$19',
    path: '/checklist',
  },
  {
    title: 'Vendor Directory',
    price: '$29',
    path: '/vendors',
    description: 'Choose the city/state to find your perfect vendor',
  },
  {
    title: 'Day Of Timeline Calculator',
    price: '$29',
    path: '/timeline',
  },
  {
    title: 'Floor Plan + Seating Chart Creator',
    price: '$59',
    path: '/seating-chart',
  },
  {
    title: 'Day Of Coordination',
    price: '$300/hr (4 hour min)',
    path: '/coordination',
    description: 'Available by city/state',
  },
];

const bundlePrice = 260;

export default function ServiceMenu() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography 
        variant="h2" 
        align="center" 
        gutterBottom
        sx={{ 
          fontWeight: 'bold',
          mb: 6,
          fontSize: { xs: '2.5rem', md: '3.5rem' }
        }}
      >
        SERVICE MENU
      </Typography>

      <Grid container spacing={4}>
        {services.map((service, index) => (
          <Grid item xs={12} sm={6} md={3} key={service.title}>
            <Paper
              elevation={hoveredCard === index ? 8 : 2}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 4,
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
                cursor: 'pointer',
                transform: hoveredCard === index ? 'scale(1.02)' : 'scale(1)',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
                position: 'relative',
                bgcolor: theme.palette.background.paper,
              }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate(service.path)}
            >
              <Box sx={{ p: 3, flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  component="h2"
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    minHeight: 64,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {service.title}
                </Typography>
                {service.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, fontSize: '0.875rem' }}
                  >
                    {service.description}
                  </Typography>
                )}
              </Box>
              <Box
                sx={{
                  p: 3,
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                }}
              >
                <Typography variant="h5" component="p" align="center">
                  {service.price}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          mt: 8,
          p: 4,
          borderRadius: 4,
          bgcolor: theme.palette.primary.main,
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" gutterBottom>
          WEDDING PLANNING BUNDLE ${bundlePrice}
        </Typography>
        <Typography variant="body1" paragraph>
          Includes:
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {services.slice(0, -1).map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service.title}>
              <Typography variant="body1">• {service.title}</Typography>
            </Grid>
          ))}
        </Grid>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          sx={{ mt: 4 }}
          onClick={() => navigate('/bundle')}
        >
          Get the Bundle
        </Button>
      </Box>
    </Container>
  );
}
