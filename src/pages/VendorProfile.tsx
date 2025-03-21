import { Box, Button, Card, CardContent, CardMedia, Chip, CircularProgress, Container, Divider, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText, Paper, Tab, Tabs, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WebIcon from '@mui/icons-material/Web';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import Alert from '@mui/material/Alert';
import { useState } from 'react';
import TabPanel from '../components/TabPanel';
import { useVendor } from '../hooks/useVendor';

const VendorProfile: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const { vendor, loading, error } = useVendor(slug);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', bgcolor: theme.palette.accent.nude }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !vendor) {
    return (
      <Container maxWidth="lg" sx={{ bgcolor: theme.palette.accent.nude }}>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Vendor not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ bgcolor: theme.palette.accent.nude }}>
      <Box sx={{ mb: 4 }}>
        <Card sx={{ position: 'relative', bgcolor: 'white' }}>
          <CardMedia
            component="img"
            height="300"
            image={vendor.gallery_images?.[0]?.url || '/placeholder-vendor.jpg'}
            alt={vendor.name}
            sx={{ objectFit: 'cover' }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
            }}
          >
            <IconButton 
              onClick={() => navigate('/vendors')} 
              sx={{ 
                bgcolor: 'white',
                '&:hover': {
                  bgcolor: theme.palette.accent.rose,
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              bgcolor: 'white',
              borderTop: `4px solid ${theme.palette.accent.rose}`,
              p: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
              <Typography variant="h3" component="h1" sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 600,
              }}>
                {vendor.name}
              </Typography>
              {vendor.is_featured && (
                <Chip
                  icon={<VerifiedIcon />}
                  label="Featured"
                  sx={{
                    bgcolor: theme.palette.accent.rose,
                    color: theme.palette.primary.main,
                    '& .MuiChip-icon': { color: theme.palette.primary.main },
                  }}
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={<LocationOnIcon />}
                label={vendor.location}
                variant="filled"
                sx={{
                  bgcolor: theme.palette.accent.rose,
                  color: theme.palette.primary.main,
                  '& .MuiChip-icon': { color: theme.palette.primary.main },
                }}
              />
              <Chip
                label={vendor.category?.name}
                variant="filled"
                sx={{
                  bgcolor: theme.palette.accent.rose,
                  color: theme.palette.primary.main,
                }}
              />
            </Box>
          </Box>
        </Card>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={0}
              sx={{ 
                mb: 4,
                border: `1px solid ${theme.palette.accent.nude}`,
                bgcolor: 'white',
              }}
            >
              <Box sx={{ 
                borderBottom: `1px solid ${theme.palette.accent.nude}`,
                bgcolor: 'white',
                position: 'sticky',
                top: 0,
                zIndex: 1,
              }}>
                <Tabs
                  value={tabValue}
                  onChange={(_, newValue) => setTabValue(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    minHeight: 64,
                    '& .MuiTab-root': {
                      minHeight: 64,
                      color: theme.palette.text.secondary,
                      '&.Mui-selected': {
                        color: theme.palette.primary.main,
                      },
                      '&:hover': {
                        bgcolor: theme.palette.accent.rose,
                        color: theme.palette.primary.main,
                      },
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: theme.palette.primary.main,
                      height: 3,
                    },
                  }}
                >
                  <Tab icon={<InfoIcon />} label="Overview" />
                  <Tab icon={<AttachMoneyIcon />} label="Pricing" />
                  <Tab icon={<EventIcon />} label="Availability" />
                  <Tab icon={<GroupIcon />} label="Team" />
                  <Tab icon={<SettingsIcon />} label="Services" />
                </Tabs>
              </Box>

              <Box sx={{ p: 4, bgcolor: 'white' }}>
                <TabPanel value={tabValue} index={0}>
                  <Typography variant="body1" sx={{ mb: 3, color: theme.palette.primary.main, opacity: 0.8 }}>
                    {vendor.description}
                  </Typography>

                  {vendor.gallery_images && vendor.gallery_images.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                        Gallery
                      </Typography>
                      <Grid container spacing={2}>
                        {vendor.gallery_images?.map((image: { url: string; caption?: string }, index: number) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card sx={{ height: '200px' }}>
                              <CardMedia
                                component="img"
                                height="200"
                                image={image.url}
                                alt={`Gallery image ${index + 1}`}
                                sx={{ objectFit: 'cover' }}
                              />
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {vendor.experience && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                        Experience
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, opacity: 0.8 }}>
                              Years in Business
                            </Typography>
                            <Typography variant="h4">
                              {vendor.experience.years_in_business}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, opacity: 0.8 }}>
                              Weddings Completed
                            </Typography>
                            <Typography variant="h4">
                              {vendor.experience.weddings_completed}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  {vendor.pricing_tier && (
                    <>
                      <Typography variant="h6" sx={{ mb: 3, color: theme.palette.primary.main }}>
                        {vendor.pricing_tier.tier} Tier
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Paper sx={{ p: 3 }}>
                            <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, opacity: 0.8 }}>
                              Price Range
                            </Typography>
                            <Typography variant="h5">
                              {vendor.pricing_tier.price_range.currency}
                              {vendor.pricing_tier.price_range.min.toLocaleString()} - 
                              {vendor.pricing_tier.price_range.max.toLocaleString()}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Paper sx={{ p: 3 }}>
                            <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, opacity: 0.8 }}>
                              Deposit Required
                            </Typography>
                            <Typography variant="h5">
                              {vendor.pricing_tier.deposit_required.percentage}% 
                              ({vendor.pricing_tier.deposit_required.currency}
                              {vendor.pricing_tier.deposit_required.amount.toLocaleString()})
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  {vendor.availability && (
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                          <Typography variant="subtitle1" sx={{ mb: 2, color: theme.palette.primary.main }}>
                            Lead Time Required
                          </Typography>
                          <Typography variant="body1">
                            {vendor.availability.lead_time_days} days
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                          <Typography variant="subtitle1" sx={{ mb: 2, color: theme.palette.primary.main }}>
                            Travel Zones
                          </Typography>
                          <List>
                            {vendor.availability?.travel_zones?.map((zone: { zone: string; fee: number; radius_miles: number }, index: number) => (
                              <ListItem key={index}>
                                <ListItemText
                                  primary={zone.zone}
                                  secondary={zone.fee > 0 ? `Travel fee: ${zone.fee}` : 'No travel fee'}
                                  sx={{
                                    '& .MuiTypography-root': {
                                      color: theme.palette.primary.main,
                                      opacity: 0.8,
                                    }
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Paper>
                      </Grid>
                    </Grid>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  {vendor.team_info && (
                    <>
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                          Team Size
                        </Typography>
                        <Typography variant="body1">
                          {vendor.team_info.size} members
                        </Typography>
                      </Box>

                      {vendor.team_info?.members?.map((member: { name: string; role: string; bio?: string; photo_url?: string }, index: number) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card>
                            <CardMedia
                              component="img"
                              height="200"
                              image={member.photo_url || '/placeholder-team.jpg'}
                              alt={member.name}
                              sx={{ objectFit: 'cover' }}
                            />
                            <CardContent>
                              <Typography variant="h6">
                                {member.name}
                              </Typography>
                              <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main, opacity: 0.8 }}>
                                {member.role}
                              </Typography>
                              {member.bio && (
                                <Typography variant="body2" sx={{ color: theme.palette.primary.main, opacity: 0.8, mt: 1 }}>
                                  {member.bio}
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={4}>
                  {vendor.customization_options && (
                    <>
                      <Typography variant="h6" sx={{ mb: 3, color: theme.palette.primary.main }}>
                        Available Add-ons
                      </Typography>
                      <Grid container spacing={2}>
                        {vendor.customization_options?.package_addons?.map((addon: { name: string; price: number; description: string }, index: number) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Paper sx={{ p: 2 }}>
                              <Typography variant="subtitle1">
                                {addon.name}
                              </Typography>
                              <Typography variant="h6" color={theme.palette.primary.main}>
                                ${addon.price}
                              </Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.primary.main, opacity: 0.8 }}>
                                {addon.description}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}
                </TabPanel>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 3,
                border: `1px solid ${theme.palette.accent.nude}`,
                bgcolor: 'white',
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                Contact Information
              </Typography>
              <List>
                {vendor.contact_info.email && (
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon sx={{ color: theme.palette.primary.main }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={vendor.contact_info.email}
                      sx={{
                        '& .MuiTypography-root': {
                          color: theme.palette.primary.main,
                          opacity: 0.8,
                        }
                      }}
                    />
                  </ListItem>
                )}
                {vendor.contact_info.phone && (
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon sx={{ color: theme.palette.primary.main }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={vendor.contact_info.phone}
                      sx={{
                        '& .MuiTypography-root': {
                          color: theme.palette.primary.main,
                          opacity: 0.8,
                        }
                      }}
                    />
                  </ListItem>
                )}
                {vendor.contact_info.website && (
                  <ListItem>
                    <ListItemIcon>
                      <WebIcon sx={{ color: theme.palette.primary.main }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={vendor.contact_info.website}
                      primaryTypographyProps={{
                        component: 'a',
                        href: vendor.contact_info.website,
                        target: '_blank',
                        color: theme.palette.primary.main,
                        sx: { 
                          textDecoration: 'none',
                          '&:hover': {
                            color: theme.palette.primary.main,
                            bgcolor: theme.palette.accent.rose,
                          },
                        },
                      }}
                    />
                  </ListItem>
                )}
              </List>

              {vendor.social_media && (
                <>
                  <Divider sx={{ my: 2, borderColor: theme.palette.accent.nude }} />
                  <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                    Social Media
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {vendor.social_media.instagram && (
                      <IconButton
                        href={vendor.social_media.instagram}
                        target="_blank"
                        sx={{ 
                          color: theme.palette.primary.main,
                          '&:hover': {
                            bgcolor: theme.palette.accent.rose,
                          },
                        }}
                      >
                        <InstagramIcon />
                      </IconButton>
                    )}
                    {vendor.social_media.facebook && (
                      <IconButton
                        href={vendor.social_media.facebook}
                        target="_blank"
                        sx={{ 
                          color: theme.palette.primary.main,
                          '&:hover': {
                            bgcolor: theme.palette.accent.rose,
                          },
                        }}
                      >
                        <FacebookIcon />
                      </IconButton>
                    )}
                  </Box>
                </>
              )}
            </Paper>

            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{ 
                mb: 2, 
                bgcolor: theme.palette.accent.rose, 
                color: theme.palette.primary.main,
                '&:hover': { 
                  bgcolor: theme.palette.accent.roseDark
                } 
              }}
              href={`mailto:${vendor.contact_info.email}?subject=Inquiry about your services`}
            >
              Contact Vendor
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default VendorProfile;
