// import { useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  useTheme,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { WeddingChecklistChat } from '../components/ui/wedding-checklist-chat';
import CardWithTheme from '../components/CardWithTheme';
import DashboardWithTheme from '../components/DashboardWithTheme';
import ThemeWrapper from '../components/ThemeWrapper';

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
    path: '/directory',
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
    title: 'Mood Board',
    price: '$29',
    path: '/mood-board',
    description: 'Visualize your wedding style and inspiration',
    longDescription: 'Create a beautiful digital mood board for your wedding. Collect and organize inspiration images for decor, flowers, attire, and more. Share with vendors to communicate your vision clearly.'
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

export default function ServiceMenuWithTheme() {
  const navigate = useNavigate();
  const theme = useTheme();
  // We'll use this state in future enhancements if needed
  // const [hoveredService, setHoveredService] = useState<string | null>(null);

  // Convert services to dashboard card format
  const serviceCards = services.map(service => ({
    title: service.title,
    content: (
      <>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 2 }}
        >
          {service.description}
        </Typography>
        <Box sx={{ 
          p: 2, 
          bgcolor: theme.palette.accent?.blush,
          textAlign: 'center',
          mt: 'auto'
        }}>
          <Typography 
            variant="h5" 
            component="p" 
            sx={{ fontFamily: "'Giaza', serif" }}
          >
            {service.price}
          </Typography>
        </Box>
      </>
    ),
    onClick: () => navigate(service.path),
    width: 4 as 4, // 3 cards per row on medium screens
    sx: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }));

  return (
    <ThemeWrapper>
      <DashboardWithTheme
        title="Wedding Planning Services"
        subtitle="Professional tools to make your wedding planning journey smooth and stress-free"
        cards={serviceCards}
        containerSx={{ mb: 6 }}
      />

      <Container maxWidth="lg">
        <Box
          sx={{
            mt: 8,
            p: 4,
            borderRadius: 0,
            bgcolor: theme.palette.background.paper,
            border: `2px solid ${theme.palette.primary.main}`,
            textAlign: 'center',
            position: 'relative',
            mb: 6
          }}
        >
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{ 
              fontFamily: "'Giaza', serif",
              color: theme.palette.primary.main
            }}
          >
            WEDDING PLANNING BUNDLE ${bundlePrice}
          </Typography>
          <Typography 
            variant="body1" 
            paragraph
          >
            Get everything you need to plan your perfect day
          </Typography>
          
          <Grid container spacing={2} justifyContent="center">
            {services.slice(0, -1).map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service.title}>
                <CardWithTheme
                  title={service.title}
                  onClick={() => navigate(service.path)}
                  sx={{ height: '100%' }}
                />
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
              borderRadius: 0,
              fontFamily: "'Giaza', serif",
              fontSize: '1.2rem',
              textTransform: 'uppercase',
              backgroundColor: theme.palette.accent?.rose,
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.accent?.roseDark,
              }
            }}
            onClick={() => navigate('/bundle')}
          >
            Get the Bundle
          </Button>
        </Box>

        {/* WeddingChecklistChat Component */}
        <WeddingChecklistChat />
      </Container>
    </ThemeWrapper>
  );
}
