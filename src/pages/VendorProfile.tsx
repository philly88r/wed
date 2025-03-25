import { Box, Card, CardMedia, Chip, CircularProgress, Container, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText, Paper, Tab, Tabs, Typography, ImageList, ImageListItem, Dialog, DialogContent, Link } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import Alert from '@mui/material/Alert';
import { useState, useEffect } from 'react';
import TabPanel from '../components/TabPanel';
import { useVendor } from '../hooks/useVendor';

const VendorProfile: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const { vendor, loading, error } = useVendor(slug);
  const [imageUrl, setImageUrl] = useState<string>('/placeholder-vendor.jpg');
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    // Set the gallery image if available
    if (vendor?.gallery_images && vendor.gallery_images.length > 0 && vendor.gallery_images[0]?.url) {
      setImageUrl(vendor.gallery_images[0].url);
    }
  }, [vendor]);

  // For debugging
  useEffect(() => {
    if (vendor) {
      console.log('Vendor data in component:', vendor);
    }
  }, [vendor]);

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
            image={imageUrl}
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
                label={vendor.category?.name || 'Uncategorized'}
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
                  <Tab icon={<PhotoLibraryIcon />} label="Gallery" />
                  <Tab icon={<GroupIcon />} label="Contact" />
                </Tabs>
              </Box>

              <Box sx={{ p: 4, bgcolor: 'white' }}>
                <TabPanel value={tabValue} index={0}>
                  {vendor.description ? (
                    <Typography variant="body1" sx={{ mb: 3, color: theme.palette.primary.main, opacity: 0.8 }}>
                      {vendor.description}
                    </Typography>
                  ) : (
                    <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary, fontStyle: 'italic' }}>
                      This vendor hasn't added a description yet.
                    </Typography>
                  )}
                  
                  {/* Gallery images */}
                  {vendor.gallery_images && vendor.gallery_images.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                        Gallery
                      </Typography>
                      <Grid container spacing={2}>
                        {vendor.gallery_images.map((image, index) => (
                          <Grid item xs={6} md={4} key={index}>
                            <Box
                              component="img"
                              src={image.url || '/placeholder-vendor.jpg'}
                              alt={`Gallery image ${index + 1}`}
                              sx={{
                                width: '100%',
                                height: 150,
                                objectFit: 'cover',
                                borderRadius: 1,
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  {vendor.pricing_details ? (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                        Pricing Information
                      </Typography>
                      
                      {/* Display the pricing tier as dollar signs */}
                      <Typography variant="h3" sx={{ mb: 3, color: theme.palette.primary.main, fontWeight: 'bold' }}>
                        {vendor.pricing_details.tier}
                      </Typography>
                      
                      <List>
                        {vendor.pricing_details.price_range && (
                          <ListItem>
                            <ListItemText 
                              primary="Price Range"
                              secondary={`${vendor.pricing_details.price_range.currency || '$'}${vendor.pricing_details.price_range.min || 0} - ${vendor.pricing_details.price_range.currency || '$'}${vendor.pricing_details.price_range.max || 0}`}
                              primaryTypographyProps={{
                                sx: { color: theme.palette.text.secondary }
                              }}
                              secondaryTypographyProps={{
                                sx: { color: theme.palette.primary.main }
                              }}
                            />
                          </ListItem>
                        )}
                        
                        {vendor.pricing_details.deposit_required && (
                          <ListItem>
                            <ListItemText 
                              primary="Deposit Required"
                              secondary={`${vendor.pricing_details.deposit_required.percentage || 0}% (${vendor.pricing_details.deposit_required.currency || '$'}${vendor.pricing_details.deposit_required.amount || 0})`}
                              primaryTypographyProps={{
                                sx: { color: theme.palette.text.secondary }
                              }}
                              secondaryTypographyProps={{
                                sx: { color: theme.palette.primary.main }
                              }}
                            />
                          </ListItem>
                        )}
                        
                        {vendor.pricing_details.payment_methods && vendor.pricing_details.payment_methods.length > 0 && (
                          <ListItem>
                            <ListItemText 
                              primary="Payment Methods"
                              secondary={vendor.pricing_details.payment_methods.join(', ')}
                              primaryTypographyProps={{
                                sx: { color: theme.palette.text.secondary }
                              }}
                              secondaryTypographyProps={{
                                sx: { color: theme.palette.primary.main }
                              }}
                            />
                          </ListItem>
                        )}
                        
                        {vendor.pricing_details.cancellation_policy && (
                          <ListItem>
                            <ListItemText 
                              primary="Cancellation Policy"
                              secondary={vendor.pricing_details.cancellation_policy}
                              primaryTypographyProps={{
                                sx: { color: theme.palette.text.secondary }
                              }}
                              secondaryTypographyProps={{
                                sx: { color: theme.palette.primary.main }
                              }}
                            />
                          </ListItem>
                        )}
                      </List>
                    </Box>
                  ) : (
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}>
                      Pricing information will be available soon.
                    </Typography>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  {vendor.availability ? (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                        Availability Information
                      </Typography>
                      <List>
                        {vendor.availability.lead_time_days !== undefined && (
                          <ListItem>
                            <ListItemText 
                              primary="Lead Time"
                              secondary={`${vendor.availability.lead_time_days} days`}
                              primaryTypographyProps={{
                                sx: { color: theme.palette.text.secondary }
                              }}
                              secondaryTypographyProps={{
                                sx: { color: theme.palette.primary.main }
                              }}
                            />
                          </ListItem>
                        )}
                        
                        {vendor.availability.peak_season && vendor.availability.peak_season.length > 0 && (
                          <ListItem>
                            <ListItemText 
                              primary="Peak Season"
                              secondary={vendor.availability.peak_season.join(', ')}
                              primaryTypographyProps={{
                                sx: { color: theme.palette.text.secondary }
                              }}
                              secondaryTypographyProps={{
                                sx: { color: theme.palette.primary.main }
                              }}
                            />
                          </ListItem>
                        )}
                        
                        {vendor.availability.off_peak_season && vendor.availability.off_peak_season.length > 0 && (
                          <ListItem>
                            <ListItemText 
                              primary="Off-Peak Season"
                              secondary={vendor.availability.off_peak_season.join(', ')}
                              primaryTypographyProps={{
                                sx: { color: theme.palette.text.secondary }
                              }}
                              secondaryTypographyProps={{
                                sx: { color: theme.palette.primary.main }
                              }}
                            />
                          </ListItem>
                        )}
                      </List>
                    </Box>
                  ) : (
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}>
                      Availability information will be available soon.
                    </Typography>
                  )}
                </TabPanel>

                {/* Gallery Tab */}
                <TabPanel value={tabValue} index={3}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                      Photo Gallery
                    </Typography>
                    
                    {vendor.gallery_images && vendor.gallery_images.length > 0 ? (
                      <>
                        <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                          {vendor.gallery_limit === 2 ? 'Free tier: 2 photos maximum' : 'Premium tier: Up to 10 photos'}
                        </Typography>
                        
                        <ImageList sx={{ width: '100%', height: 'auto' }} cols={2} gap={8}>
                          {vendor.gallery_images.slice(0, vendor.gallery_limit || 2).map((image, index) => (
                            <ImageListItem 
                              key={index} 
                              onClick={() => {
                                setSelectedImage(image.url);
                                setOpenImageDialog(true);
                              }}
                              sx={{ 
                                cursor: 'pointer',
                                '&:hover': {
                                  opacity: 0.9,
                                  transform: 'scale(1.02)',
                                  transition: 'all 0.3s ease'
                                }
                              }}
                            >
                              <img
                                src={image.url}
                                alt={image.alt_text || `Gallery image ${index + 1}`}
                                loading="lazy"
                                style={{ 
                                  borderRadius: '8px',
                                  height: '200px',
                                  width: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </ImageListItem>
                          ))}
                        </ImageList>
                        
                        {/* Image Dialog for fullscreen view */}
                        <Dialog
                          open={openImageDialog}
                          onClose={() => setOpenImageDialog(false)}
                          maxWidth="lg"
                        >
                          <DialogContent sx={{ p: 0, bgcolor: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img
                              src={selectedImage}
                              alt="Gallery image fullscreen"
                              style={{ maxWidth: '100%', maxHeight: '90vh' }}
                            />
                          </DialogContent>
                        </Dialog>
                      </>
                    ) : (
                      <Typography variant="body1" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic', mb: 4 }}>
                        No gallery images available.
                      </Typography>
                    )}
                    
                    {/* Video section - only for paid vendors */}
                    {vendor.gallery_limit && vendor.gallery_limit > 2 && (
                      <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                          Video Showcase
                        </Typography>
                        
                        {vendor.video_link ? (
                          <Box sx={{ mt: 2 }}>
                            <Link 
                              href={vendor.video_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                color: theme.palette.primary.main,
                                textDecoration: 'none',
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              }}
                            >
                              <VideoLibraryIcon />
                              <Typography variant="body1">
                                Watch Video Showcase
                              </Typography>
                            </Link>
                          </Box>
                        ) : (
                          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}>
                            No video showcase available.
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </TabPanel>
                
                {/* Contact Tab - index changed from 3 to 4 */}
                <TabPanel value={tabValue} index={4}>
                  {vendor.contact_info ? (
                    <Box>
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
                              primary="Email"
                              secondary={vendor.contact_info.email}
                              primaryTypographyProps={{
                                sx: { color: theme.palette.text.secondary }
                              }}
                              secondaryTypographyProps={{
                                sx: { color: theme.palette.primary.main }
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
                              primary="Phone"
                              secondary={vendor.contact_info.phone}
                              primaryTypographyProps={{
                                sx: { color: theme.palette.text.secondary }
                              }}
                              secondaryTypographyProps={{
                                sx: { color: theme.palette.primary.main }
                              }}
                            />
                          </ListItem>
                        )}
                        
                        {vendor.contact_info.website && (
                          <ListItem>
                            <ListItemIcon>
                              <LanguageIcon sx={{ color: theme.palette.primary.main }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Website"
                              secondary={vendor.contact_info.website}
                              primaryTypographyProps={{
                                sx: { color: theme.palette.text.secondary }
                              }}
                              secondaryTypographyProps={{
                                sx: { color: theme.palette.primary.main }
                              }}
                            />
                          </ListItem>
                        )}
                      </List>
                    </Box>
                  ) : (
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}>
                      Contact information will be available soon.
                    </Typography>
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
                border: `1px solid ${theme.palette.accent.nude}`,
                bgcolor: 'white',
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                Quick Info
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <LocationOnIcon sx={{ color: theme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Location"
                    secondary={vendor.location}
                    primaryTypographyProps={{
                      sx: { color: theme.palette.text.secondary }
                    }}
                    secondaryTypographyProps={{
                      sx: { color: theme.palette.primary.main }
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SettingsIcon sx={{ color: theme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Category"
                    secondary={vendor.category?.name || 'Uncategorized'}
                    primaryTypographyProps={{
                      sx: { color: theme.palette.text.secondary }
                    }}
                    secondaryTypographyProps={{
                      sx: { color: theme.palette.primary.main }
                    }}
                  />
                </ListItem>
                
                {/* Social Media Links */}
                {vendor.social_media && (Object.keys(vendor.social_media).length > 0) && (
                  <ListItem>
                    <ListItemText 
                      primary="Social Media"
                      secondary={
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                          {vendor.social_media.instagram && (
                            <Typography variant="body2" sx={{ color: theme.palette.primary.main }}>
                              Instagram: {vendor.social_media.instagram}
                            </Typography>
                          )}
                          {vendor.social_media.facebook && (
                            <Typography variant="body2" sx={{ color: theme.palette.primary.main }}>
                              Facebook: {vendor.social_media.facebook}
                            </Typography>
                          )}
                        </Box>
                      }
                      primaryTypographyProps={{
                        sx: { color: theme.palette.text.secondary }
                      }}
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default VendorProfile;
