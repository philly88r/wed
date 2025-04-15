import React, { useState, useEffect, useRef } from 'react';
import { Plus, Image as ImageIcon, X, ExternalLink, Download } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { createCustomLink } from '../utils/customLinksHelper';
import MoodboardGenerator from '../components/MoodboardGenerator';
import { 
  Tabs, 
  Tab, 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  Paper
} from '@mui/material';

interface InspirationImage {
  id: string;
  title: string;
  description?: string;
  url: string;
  category: string;
  source?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`moodboard-tabpanel-${index}`}
      aria-labelledby={`moodboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const categories = [
  'Ceremony',
  'Reception',
  'Decor',
  'Flowers',
  'Attire',
  'Hair & Makeup',
  'Food & Cake',
  'Other'
];

export default function VisionBoard() {
  const theme = useTheme();
  const [images, setImages] = useState<InspirationImage[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newImage, setNewImage] = useState<Partial<InspirationImage>>({
    category: categories[0]
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [falApiKey, setFalApiKey] = useState<string>('');

  // Create a custom link for the current path to fix the 406 error
  useEffect(() => {
    const setupCustomLink = async () => {
      try {
        // Create a custom link for both paths to ensure they work
        await createCustomLink('vision-board', 'Mood Board');
        await createCustomLink('mood-board', 'Mood Board');
        console.log('Custom links created successfully');
      } catch (error) {
        console.error('Error creating custom links:', error);
      }
    };
    
    setupCustomLink();
  }, []);

  useEffect(() => {
    // Try to load from mood-board key first, then fall back to vision-board for backward compatibility
    const savedImages = localStorage.getItem('wedding-mood-board') || localStorage.getItem('wedding-vision-board');
    if (savedImages) {
      setImages(JSON.parse(savedImages));
    }
  }, []);

  useEffect(() => {
    // Save to the new mood-board key
    localStorage.setItem('wedding-mood-board', JSON.stringify(images));
  }, [images]);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from('images')
        .select('*');
      if (error) {
        console.error(error);
      } else {
        setImages(data);
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    const saveImages = async () => {
      const { error } = await supabase
        .from('images')
        .upsert(images);
      if (error) {
        console.error(error);
      }
    };
    saveImages();
  }, [images]);

  useEffect(() => {
    // Get FAL API key from environment variables
    if (import.meta.env.VITE_FAL_KEY) {
      setFalApiKey(import.meta.env.VITE_FAL_KEY as string);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(prev => ({ ...prev, url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newImage.url && newImage.title) {
      setImages(prev => [
        ...prev,
        { ...newImage, id: Date.now().toString() } as InspirationImage
      ]);
      setNewImage({ category: categories[0] });
      setShowForm(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteImage = (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      setImages(prev => prev.filter(image => image.id !== id));
    }
  };

  const filteredImages = images.filter(
    image => selectedCategory === 'all' || image.category === selectedCategory
  );

  const downloadBoard = () => {
    const data = JSON.stringify(images, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wedding-mood-board.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const importedData = JSON.parse(reader.result as string);
          setImages(importedData);
          localStorage.setItem('wedding-mood-board', JSON.stringify(importedData));
          alert('Mood board imported successfully!');
        } catch (error) {
          alert('Error importing mood board. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ 
      backgroundColor: '#FAFAFA', 
      minHeight: '100vh',
      pt: 4, 
      pb: 8 
    }}>
      <Container maxWidth="lg">
        <Box sx={{ 
          mb: 6, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              color: theme.palette.primary.main,
              textAlign: 'center',
              fontFamily: 'Giaza, serif',
              letterSpacing: '-0.05em',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Wedding Vision Board
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: theme.palette.primary.main, 
              opacity: 0.8, 
              textAlign: 'center',
              maxWidth: '700px',
              mb: 4
            }}
          >
            Create a visual collection of your wedding inspiration. Add images that inspire your wedding style, colors, and overall aesthetic.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4, gap: 2 }}>
          <Button
            variant="outlined"
            onClick={downloadBoard}
            startIcon={<Download />}
            sx={{ 
              color: theme.palette.primary.main,
              borderColor: theme.palette.accent?.rose || '#FFE8E4',
              borderRadius: 0, // Square corners per brand guidelines
              '&:hover': {
                backgroundColor: `${theme.palette.accent?.rose || '#FFE8E4'}20`,
                borderColor: theme.palette.accent?.rose || '#FFE8E4'
              },
              textTransform: 'uppercase'
            }}
          >
            Export Board
          </Button>
          <Button
            variant="outlined"
            onClick={() => document.getElementById('import-board')?.click()}
            startIcon={<ExternalLink />}
            sx={{ 
              color: theme.palette.primary.main,
              borderColor: theme.palette.accent?.rose || '#FFE8E4',
              borderRadius: 0, // Square corners per brand guidelines
              '&:hover': {
                backgroundColor: `${theme.palette.accent?.rose || '#FFE8E4'}20`,
                borderColor: theme.palette.accent?.rose || '#FFE8E4'
              },
              textTransform: 'uppercase'
            }}
          >
            Import Board
          </Button>
          <input
            type="file"
            id="import-board"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
          <Button
            variant="contained"
            onClick={() => {
              setNewImage({ category: categories[0] });
              setShowForm(true);
            }}
            startIcon={<Plus />}
            sx={{ 
              backgroundColor: theme.palette.accent?.rose || '#FFE8E4',
              color: theme.palette.primary.main,
              borderRadius: 0, // Square corners per brand guidelines
              '&:hover': {
                backgroundColor: theme.palette.accent?.roseDark || '#FFD5CC'
              },
              textTransform: 'uppercase'
            }}
          >
            Add Image
          </Button>
        </Box>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
          <Chip 
            label="All"
            onClick={() => setSelectedCategory('all')}
            sx={{
              borderRadius: 0, // Square corners per brand guidelines
              backgroundColor: selectedCategory === 'all' ? (theme.palette.accent?.rose || '#FFE8E4') : 'transparent',
              color: theme.palette.primary.main,
              border: `1px solid ${theme.palette.accent?.rose || '#FFE8E4'}`,
              '&:hover': {
                backgroundColor: selectedCategory === 'all' ? (theme.palette.accent?.roseDark || '#FFD5CC') : `${theme.palette.accent?.rose || '#FFE8E4'}20`
              },
              textTransform: 'uppercase',
              fontWeight: 'regular',
              px: 2
            }}
          />
          {categories.map((category, index) => (
            <Chip
              key={index}
              label={category}
              onClick={() => setSelectedCategory(category === selectedCategory ? 'all' : category)}
              sx={{
                borderRadius: 0, // Square corners per brand guidelines
                backgroundColor: category === selectedCategory ? (theme.palette.accent?.rose || '#FFE8E4') : 'transparent',
                color: theme.palette.primary.main,
                border: `1px solid ${theme.palette.accent?.rose || '#FFE8E4'}`,
                '&:hover': {
                  backgroundColor: category === selectedCategory ? (theme.palette.accent?.roseDark || '#FFD5CC') : `${theme.palette.accent?.rose || '#FFE8E4'}20`
                },
                textTransform: 'uppercase',
                fontWeight: 'regular',
                px: 2
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            color: theme.palette.primary.main,
            mb: 2,
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 'medium',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          Vision Board Options
        </Typography>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          sx={{ 
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.accent?.rose || '#FFE8E4',
              height: 3
            },
            '& .MuiTab-root': {
              color: `${theme.palette.primary.main}80`,
              textTransform: 'uppercase',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 'regular',
              '&.Mui-selected': {
                color: theme.palette.primary.main
              }
            }
          }}
        >
          <Tab label="Classic Mood Board" />
          <Tab label="AI Mood Board Generator" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {filteredImages.map(image => (
            <Grid item xs={12} sm={6} md={4} key={image.id}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                  },
                  borderRadius: 0, // Square corners per brand guidelines
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    image={image.url}
                    alt={image.title}
                    sx={{ 
                      height: 0,
                      paddingTop: '56.25%', // 16:9 aspect ratio
                      position: 'relative'
                    }}
                  />
                  <IconButton
                    onClick={() => deleteImage(image.id)}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: theme.palette.accent?.rose || '#FFE8E4',
                      color: theme.palette.primary.main,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      borderRadius: 0, // Square corners per brand guidelines
                      '&:hover': {
                        backgroundColor: theme.palette.accent?.roseDark || '#FFD5CC',
                        opacity: 1
                      },
                      '.MuiCard-root:hover &': {
                        opacity: 1
                      }
                    }}
                  >
                    <X size={16} />
                  </IconButton>
                </Box>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        color: theme.palette.primary.main,
                        fontWeight: 'medium',
                        mb: 0
                      }}
                    >
                      {image.title}
                    </Typography>
                    <Chip 
                      label={image.category} 
                      size="small"
                      sx={{ 
                        borderRadius: 0, // Square corners per brand guidelines
                        backgroundColor: theme.palette.accent?.rose || '#FFE8E4',
                        color: theme.palette.primary.main,
                        textTransform: 'uppercase',
                        fontSize: '0.7rem',
                        fontWeight: 'medium',
                        ml: 1
                      }}
                    />
                  </Box>
                  {image.description && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.palette.primary.main,
                        opacity: 0.8,
                        mb: 2 
                      }}
                    >
                      {image.description}
                    </Typography>
                  )}
                  {image.source && (
                    <Button
                      href={image.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<ExternalLink size={16} />}
                      size="small"
                      sx={{ 
                        mt: 'auto',
                        color: theme.palette.primary.main,
                        textTransform: 'none',
                        padding: 0,
                        '&:hover': {
                          backgroundColor: 'transparent',
                          textDecoration: 'underline'
                        },
                        justifyContent: 'flex-start',
                        minWidth: 'auto'
                      }}
                    >
                      Source
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 0, // Square corners per brand guidelines
            mb: 4
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 2, 
              color: theme.palette.primary.main,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 'medium',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            AI Vision Board Generator
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3, 
              color: theme.palette.primary.main,
              opacity: 0.8
            }}
          >
            Describe your dream wedding and our AI will generate a vision board for you.
          </Typography>
          <MoodboardGenerator falApiKey={falApiKey} />
        </Paper>
      </TabPanel>

      {showForm && (
        <Dialog 
          open={showForm} 
          onClose={() => setShowForm(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 0, // Square corners per brand guidelines
              p: 3
            }
          }}
        >
          <DialogTitle sx={{ 
            p: 0, 
            mb: 2,
            color: theme.palette.primary.main,
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 'medium',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h5" component="h2">
              Add to Vision Board
            </Typography>
            <IconButton 
              onClick={() => setShowForm(false)}
              sx={{ 
                color: theme.palette.primary.main,
                p: 1
              }}
            >
              <X size={20} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle2" 
                  component="label"
                  htmlFor="image-upload"
                  sx={{ 
                    display: 'block', 
                    mb: 1,
                    color: theme.palette.primary.main
                  }}
                >
                  Image
                </Typography>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  style={{ width: '100%' }}
                  required
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Title"
                  value={newImage.title || ''}
                  onChange={e => setNewImage(prev => ({ ...prev, title: e.target.value }))}
                  required
                  variant="outlined"
                  InputLabelProps={{
                    sx: { color: theme.palette.primary.main }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: theme.palette.divider,
                        borderRadius: 0 // Square corners per brand guidelines
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.accent?.rose || '#FFE8E4'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.accent?.rose || '#FFE8E4'
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: theme.palette.primary.main
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Description"
                  value={newImage.description || ''}
                  onChange={e => setNewImage(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={3}
                  variant="outlined"
                  InputLabelProps={{
                    sx: { color: theme.palette.primary.main }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: theme.palette.divider,
                        borderRadius: 0 // Square corners per brand guidelines
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.accent?.rose || '#FFE8E4'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.accent?.rose || '#FFE8E4'
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: theme.palette.primary.main
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel 
                    id="category-label"
                    sx={{ color: theme.palette.primary.main }}
                  >
                    Category
                  </InputLabel>
                  <Select
                    labelId="category-label"
                    value={newImage.category}
                    onChange={e => setNewImage(prev => ({ ...prev, category: e.target.value }))}
                    label="Category"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.divider,
                        borderRadius: 0 // Square corners per brand guidelines
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.accent?.rose || '#FFE8E4'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.accent?.rose || '#FFE8E4'
                      },
                      color: theme.palette.primary.main
                    }}
                  >
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Source URL (Optional)"
                  value={newImage.source || ''}
                  onChange={e => setNewImage(prev => ({ ...prev, source: e.target.value }))}
                  type="url"
                  variant="outlined"
                  InputLabelProps={{
                    sx: { color: theme.palette.primary.main }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: theme.palette.divider,
                        borderRadius: 0 // Square corners per brand guidelines
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.accent?.rose || '#FFE8E4'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.accent?.rose || '#FFE8E4'
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: theme.palette.primary.main
                    }
                  }}
                />
              </Box>
            </form>
          </DialogContent>
          <DialogActions sx={{ p: 0, mt: 2 }}>
            <Button
              onClick={() => setShowForm(false)}
              variant="outlined"
              sx={{ 
                color: theme.palette.primary.main,
                borderColor: theme.palette.divider,
                borderRadius: 0, // Square corners per brand guidelines
                '&:hover': {
                  borderColor: theme.palette.divider,
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                },
                textTransform: 'uppercase'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{ 
                backgroundColor: theme.palette.accent?.rose || '#FFE8E4',
                color: theme.palette.primary.main,
                borderRadius: 0, // Square corners per brand guidelines
                '&:hover': {
                  backgroundColor: theme.palette.accent?.roseDark || '#FFD5CC'
                },
                ml: 2,
                textTransform: 'uppercase'
              }}
            >
              Add Image
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {filteredImages.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <ImageIcon size={64} style={{ margin: '0 auto', color: theme.palette.primary.main, opacity: 0.6 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              mt: 3, 
              color: theme.palette.primary.main,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 'medium'
            }}
          >
            Your Vision Board is Empty
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 1, 
              color: theme.palette.primary.main,
              opacity: 0.8,
              maxWidth: '400px',
              mx: 'auto'
            }}
          >
            Start adding images to create your perfect wedding vision board.
          </Typography>
          <Button
            onClick={() => setShowForm(true)}
            variant="contained"
            sx={{ 
              mt: 4,
              backgroundColor: theme.palette.accent?.rose || '#FFE8E4',
              color: theme.palette.primary.main,
              borderRadius: 0, // Square corners per brand guidelines
              '&:hover': {
                backgroundColor: theme.palette.accent?.roseDark || '#FFD5CC'
              },
              textTransform: 'uppercase',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 'medium',
              px: 3,
              py: 1
            }}
          >
            Add Your First Image
          </Button>
        </Box>
      )}
      </Container>
    </Box>
  );
}
