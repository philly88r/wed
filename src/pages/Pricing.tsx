import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import { Heart } from 'lucide-react';

interface PricingTier {
  title: string;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'outlined' | 'contained';
  highlighted?: boolean;
}

const tiers: PricingTier[] = [
  {
    title: 'Basic',
    price: {
      monthly: 9.99,
      yearly: 99,
    },
    description: 'Essential tools for planning your special day',
    features: [
      'Guest List Management',
      'Basic Timeline',
      'Budget Tracking',
      'Checklist Templates',
      'Basic Vendor Directory',
      'Email Support',
    ],
    buttonText: 'Start Planning',
    buttonVariant: 'outlined',
  },
  {
    title: 'Premium',
    price: {
      monthly: 19.99,
      yearly: 199,
    },
    description: 'Everything you need for a perfect wedding',
    features: [
      'All Basic Features',
      'Advanced Timeline',
      'Seating Arrangements',
      'Custom Checklist Templates',
      'Vendor Collaboration Tools',
      'Priority Email Support',
      'Wedding Website',
      'Digital Invitations',
      'Mobile App Access',
    ],
    buttonText: 'Get Premium',
    buttonVariant: 'contained',
    highlighted: true,
  },
  {
    title: 'Ultimate',
    price: {
      monthly: 29.99,
      yearly: 299,
    },
    description: 'The complete luxury wedding planning suite',
    features: [
      'All Premium Features',
      'Dedicated Wedding Planner',
      'Virtual Planning Sessions',
      'Premium Design Templates',
      'Unlimited Storage',
      'Priority 24/7 Support',
      'Custom Domain',
      'Social Media Integration',
      'Analytics Dashboard',
      'Vendor Negotiation Support',
    ],
    buttonText: 'Go Ultimate',
    buttonVariant: 'outlined',
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const navigate = useNavigate();
  
  const handleSelectPlan = (plan: string) => {
    // In testing mode, redirect to dashboard page regardless of plan selected
    navigate('/', { state: { selectedPlan: plan } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9F9FF]">
      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#FFE8E4]/20 blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#B8BDD7]/10 blur-3xl"></div>
      
      <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Box textAlign="center" mb={8} className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 -mt-6 text-[#FFE8E4]">
            <Heart className="w-12 h-12 opacity-20" />
          </div>
          
          <Typography
            component="h1"
            variant="h2"
            sx={{
              color: '#054697',
              fontWeight: 600,
              fontFamily: "'Giaza', serif",
              mb: 2,
            }}
          >
            Choose Your Perfect Plan
          </Typography>
          
          <Typography
            variant="h5"
            sx={{
              color: '#054697',
              opacity: 0.8,
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 300,
              maxWidth: '700px',
              mx: 'auto',
            }}
          >
            Invest in your perfect day with our comprehensive wedding planning tools
          </Typography>
          
          <Box mt={6} mb={2}>
            <div className="w-24 h-1 bg-[#FFE8E4] mx-auto mb-6"></div>
            <FormControlLabel
              control={
                <Switch
                  checked={yearly}
                  onChange={() => setYearly(!yearly)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#FFE8E4',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 232, 228, 0.08)',
                      },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#FFE8E4',
                    },
                  }}
                />
              }
              label={
                <Typography
                  variant="h6"
                  sx={{
                    color: '#054697',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 400,
                  }}
                >
                  {yearly ? 'YEARLY (SAVE 17%)' : 'MONTHLY'}
                </Typography>
              }
            />
          </Box>
        </Box>

        {/* Pricing Cards */}
        <Grid container spacing={4} alignItems="flex-start">
          {tiers.map((tier) => (
            <Grid
              item
              key={tier.title}
              xs={12}
              sm={tier.highlighted ? 12 : 6}
              md={4}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.3s ease-in-out',
                  borderRadius: 0,
                  boxShadow: 'none',
                  border: tier.highlighted ? '2px solid #FFE8E4' : '1px solid #B8BDD7',
                  backgroundColor: tier.highlighted ? 'rgba(255, 232, 228, 0.05)' : 'white',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 10px 30px rgba(5, 70, 151, 0.1)',
                    borderColor: tier.highlighted ? '#FFE8E4' : '#B8BDD7',
                  },
                }}
              >
                {tier.highlighted && (
                  <Chip
                    label="MOST POPULAR"
                    sx={{
                      position: 'absolute',
                      top: -16,
                      right: 16,
                      px: 2,
                      backgroundColor: '#FFE8E4',
                      color: '#054697',
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 500,
                      borderRadius: 0,
                      '& .MuiChip-label': {
                        px: 2,
                      },
                    }}
                  />
                )}
                
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Box mb={4} textAlign="center">
                    <Typography
                      component="h2"
                      variant="h3"
                      sx={{
                        color: '#054697',
                        fontFamily: "'Giaza', serif",
                        mb: 3,
                      }}
                    >
                      {tier.title}
                    </Typography>
                    
                    <Typography
                      component="h3"
                      variant="h3"
                      sx={{
                        color: '#054697',
                        fontWeight: 600,
                        fontFamily: "'Poppins', sans-serif",
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'center',
                      }}
                    >
                      <Box component="span" sx={{ fontSize: '1.5rem', mr: 0.5 }}>$</Box>
                      {yearly ? tier.price.yearly : tier.price.monthly}
                      <Typography
                        component="span"
                        variant="h6"
                        sx={{
                          color: '#054697',
                          opacity: 0.8,
                          ml: 1,
                          fontWeight: 300,
                        }}
                      >
                        {yearly ? '/year' : '/month'}
                      </Typography>
                    </Typography>
                    
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: '#054697',
                        opacity: 0.8,
                        mt: 2,
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 300,
                      }}
                    >
                      {tier.description}
                    </Typography>
                  </Box>

                  <Box sx={{ width: '100%', height: '1px', backgroundColor: '#B8BDD7', opacity: 0.3, my: 3 }} />

                  <List sx={{ mb: 4 }}>
                    {tier.features.map((feature) => (
                      <ListItem key={feature} sx={{ py: 1, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckIcon sx={{ color: '#054697' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          sx={{
                            '& .MuiListItemText-primary': {
                              color: '#054697',
                              opacity: 0.8,
                              fontFamily: "'Poppins', sans-serif",
                              fontWeight: 300,
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>

                <CardActions sx={{ p: 4, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={tier.buttonVariant}
                    size="large"
                    onClick={() => handleSelectPlan(tier.title)}
                    sx={{
                      py: 2,
                      fontSize: '1rem',
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderRadius: 0,
                      backgroundColor: tier.highlighted ? '#FFE8E4' : 'transparent',
                      color: '#054697',
                      border: '1px solid #FFE8E4',
                      '&:hover': {
                        backgroundColor: tier.highlighted ? '#FFD5CC' : 'rgba(255, 232, 228, 0.1)',
                        border: '1px solid #FFE8E4',
                      },
                    }}
                  >
                    {tier.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Contact Section */}
        <Box mt={12} textAlign="center" className="relative">
          <div className="w-24 h-1 bg-[#FFE8E4] mx-auto mb-6"></div>
          <Typography
            variant="h5"
            sx={{
              color: '#054697',
              fontFamily: "'Giaza', serif",
              mb: 2,
            }}
          >
            Need a Custom Solution?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#054697',
              opacity: 0.8,
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 300,
              maxWidth: '600px',
              mx: 'auto',
              mb: 4,
            }}
          >
            Our team can create a tailored package to meet your unique wedding planning needs
          </Typography>
          <Button
            variant="outlined"
            size="large"
            sx={{
              py: 2,
              px: 4,
              fontSize: '1rem',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              borderRadius: 0,
              color: '#054697',
              border: '1px solid #FFE8E4',
              '&:hover': {
                backgroundColor: 'rgba(255, 232, 228, 0.1)',
                border: '1px solid #FFE8E4',
              },
            }}
          >
            Contact Us
          </Button>
        </Box>
      </Container>
    </div>
  );
}
