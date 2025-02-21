import { useState } from 'react';
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
  useTheme,
  Chip,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';

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
  const theme = useTheme();
  const [yearly, setYearly] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" mb={8}>
        <Typography
          component="h1"
          variant="h2"
          color="text.primary"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          Simple, Transparent Pricing
        </Typography>
        <Typography variant="h5" color="text.secondary" component="p">
          Choose the perfect plan for your perfect day
        </Typography>
        <Box mt={4}>
          <FormControlLabel
            control={
              <Switch
                checked={yearly}
                onChange={() => setYearly(!yearly)}
                color="primary"
              />
            }
            label={
              <Typography variant="h6">
                {yearly ? 'Yearly (Save 17%)' : 'Monthly'}
              </Typography>
            }
          />
        </Box>
      </Box>

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
                transition: 'transform 0.2s ease-in-out',
                ...(tier.highlighted && {
                  transform: { sm: 'scale(1.05)' },
                  zIndex: 1,
                  boxShadow: theme.shadows[10],
                  border: `2px solid ${theme.palette.primary.main}`,
                }),
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              {tier.highlighted && (
                <Chip
                  label="Most Popular"
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: -16,
                    right: 16,
                    px: 2,
                  }}
                />
              )}
              <CardContent sx={{ flexGrow: 1, p: 4 }}>
                <Box mb={4}>
                  <Typography
                    component="h2"
                    variant="h3"
                    color="text.primary"
                    gutterBottom
                  >
                    {tier.title}
                  </Typography>
                  <Typography
                    component="h3"
                    variant="h3"
                    color="primary.main"
                    sx={{ fontWeight: 700 }}
                  >
                    ${yearly ? tier.price.yearly : tier.price.monthly}
                    <Typography
                      component="span"
                      variant="h6"
                      color="text.secondary"
                    >
                      {yearly ? '/year' : '/month'}
                    </Typography>
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    {tier.description}
                  </Typography>
                </Box>

                <List sx={{ mb: 4 }}>
                  {tier.features.map((feature) => (
                    <ListItem key={feature} sx={{ py: 1, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>

              <CardActions sx={{ p: 4, pt: 0 }}>
                <Button
                  fullWidth
                  variant={tier.buttonVariant}
                  color="primary"
                  size="large"
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    ...(tier.highlighted && {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    }),
                  }}
                >
                  {tier.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={8} textAlign="center">
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Need something special?
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          sx={{ mt: 2 }}
        >
          Contact Us for Custom Plans
        </Button>
      </Box>
    </Container>
  );
}
