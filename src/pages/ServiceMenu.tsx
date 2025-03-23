import { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  useTheme,
  Button,
  Tooltip,
  Zoom,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { WeddingChecklistChat } from '../components/ui/wedding-checklist-chat';

interface ServiceCard {
  title: string;
  price: string;
  path: string;
  description: string;
  longDescription: string;
}

const services: ServiceCard[] = [
  {
    title: 'Wedding Planning Video Tutorials',
    price: '$59',
    path: '/tutorials',
    description: 'Step-by-step video guides for planning your perfect day',
    longDescription: 'Access our comprehensive library of professional wedding planning tutorials. Learn from expert planners about timelines, budgeting, vendor selection, and more. Perfect for DIY planners!'
  },
  {
    title: 'Address Book',
    price: '$39',
    path: '/guests',
    description: 'Organize your guest addresses beautifully',
    longDescription: 'Keep all your guest information in one place. Import contacts, manage RSVPs, track thank-you notes, and export for envelope printing. Makes addressing invitations a breeze!'
  },
  {
    title: 'Budget Calculator',
    price: '$29',
    path: '/budget',
    description: 'Track expenses and stay within your budget',
    longDescription: 'Smart budget tracking tool that helps you allocate funds, track expenses, and make informed decisions. Includes average cost guides and customizable categories for your unique needs.'
  },
  {
    title: 'Wedding Planning Checklist Calculator',
    price: '$19',
    path: '/checklist',
    description: 'Never miss a planning milestone',
    longDescription: 'Dynamic checklist that adapts to your wedding date. Get personalized reminders, track progress, and ensure every detail is covered. Perfect for staying organized and stress-free!'
  },
  {
    title: 'Wedding Checklist',
    price: '$29',
    path: '/wedding-checklist',
    description: 'Comprehensive quarter-by-quarter planning guide',
    longDescription: 'Complete wedding planning checklist with resources for every task. Organized by quarters with detailed tips and guidance for each stage of your wedding planning journey.'
  },
  {
    title: 'Vendor Directory',
    price: '$29',
    path: '/vendors',
    description: 'Find trusted vendors in your area',
    longDescription: 'Search our curated directory of wedding professionals by location, price range, and style. Read reviews, compare quotes, and connect directly with the best vendors in your area.'
  },
  {
    title: 'Day Of Timeline Calculator',
    price: '$29',
    path: '/timeline-creator',
    description: 'Create the perfect wedding day schedule',
    longDescription: 'Build a detailed timeline for your wedding day. Account for hair & makeup, photos, ceremony, reception, and more. Share with vendors and wedding party to keep everyone on schedule.'
  },
  {
    title: 'Floor Plan + Seating Chart Creator',
    price: '$59',
    path: '/seating-chart',
    description: 'Design your perfect reception layout',
    longDescription: 'Drag-and-drop seating chart creator with real-time collaboration. Import guest lists, arrange tables, manage dietary restrictions, and export professional layouts for your venue.'
  },
  {
    title: 'Day Of Coordination',
    price: '$300/hr (4 hour min)',
    path: '/coordination',
    description: 'Professional on-site coordination',
    longDescription: 'Expert day-of coordination services to ensure your wedding runs smoothly. Includes timeline management, vendor coordination, ceremony direction, and reception oversight. Available in select cities.'
  },
];

const bundlePrice = 289;

export default function ServiceMenu() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <Typography 
          variant="h1" 
          sx={{ 
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontFamily: "'Playfair Display', serif",
            mb: 2,
            color: theme.palette.primary.main
          }}
        >
          Welcome Lara,
        </Typography>
        <Typography 
          variant="h4" 
          sx={{ 
            fontFamily: "'Playfair Display', serif",
            color: theme.palette.text.secondary,
            fontWeight: 300
          }}
        >
          Let's make your dream wedding a reality
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {services.map((service, index) => (
          <Grid item xs={12} sm={6} md={3} key={service.title}>
            <Tooltip
              title={
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {service.title}
                  </Typography>
                  <Typography>
                    {service.longDescription}
                  </Typography>
                </Box>
              }
              placement="top"
              TransitionComponent={Zoom}
              enterDelay={200}
              arrow
            >
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
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    border: '2px solid transparent',
                    borderRadius: 'inherit',
                    transition: 'border-color 0.3s ease-in-out',
                  },
                  '&:hover::before': {
                    borderColor: theme.palette.primary.main,
                  },
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
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {service.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ 
                      mb: 2,
                      fontSize: '0.875rem',
                      fontFamily: "'Lato', sans-serif"
                    }}
                  >
                    {service.description}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 3,
                    bgcolor: theme.palette.accent?.blush,
                    color: theme.palette.primary.main, // Dark blue text for contrast
                    borderTop: '1px solid',
                    borderColor: theme.palette.accent?.blush,
                  }}
                >
                  <Typography 
                    variant="h5" 
                    component="p" 
                    align="center"
                    sx={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {service.price}
                  </Typography>
                </Box>
              </Paper>
            </Tooltip>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          mt: 8,
          p: 4,
          borderRadius: 4,
          bgcolor: theme.palette.background.paper,
          border: '2px solid',
          borderColor: theme.palette.primary.main,
          textAlign: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            border: '1px solid',
            borderColor: theme.palette.primary.light,
            borderRadius: 'inherit',
            opacity: 0.5,
          },
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{ 
            fontFamily: "'Playfair Display', serif",
            color: theme.palette.primary.main
          }}
        >
          WEDDING PLANNING BUNDLE ${bundlePrice}
        </Typography>
        <Typography 
          variant="body1" 
          paragraph
          sx={{ fontFamily: "'Lato', sans-serif" }}
        >
          Get everything you need to plan your perfect day
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {services.slice(0, -1).map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service.title}>
              <Paper
                onClick={() => navigate(service.path)}
                sx={{
                  height: '100%',
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'scale(1.02)',
                    transition: 'all 0.2s ease-in-out',
                  },
                }}
              >
                <Typography 
                  variant="body1"
                  sx={{ fontFamily: "'Lato', sans-serif" }}
                >
                  • {service.title}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ 
            mt: 4,
            px: 6,
            py: 1.5,
            borderRadius: 3,
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.2rem',
            textTransform: 'none',
            '&:hover': {
              transform: 'scale(1.05)',
            },
            transition: 'transform 0.3s ease-in-out',
          }}
          onClick={() => navigate('/bundle')}
        >
          Get the Bundle
        </Button>
      </Box>

      {/* WeddingChecklistChat Component */}
      <WeddingChecklistChat />

    </Container>
  );
}
