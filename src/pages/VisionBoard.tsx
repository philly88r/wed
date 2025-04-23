import React, { useState, useEffect, useRef } from 'react';
import { Plus, Image as ImageIcon, X, ExternalLink } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { createCustomLink } from '../utils/customLinksHelper';
import MoodboardGenerator from '../components/MoodboardGenerator/MoodboardGenerator';
import MoodboardTemplate from '../components/MoodboardGenerator/MoodboardTemplate';
import { 
  Box, 
  Typography, 
  Button, 
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
  useTheme
} from '@mui/material';
import { HexColorPicker } from 'react-colorful';

interface InspirationImage {
  id: string;
  title: string;
  description?: string;
  url: string;
  category: string;
  source?: string;
}

// Categories for the moodboard
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
  const [falApiKey, setFalApiKey] = useState<string>('');
  const [showMoodboardTemplate, setShowMoodboardTemplate] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [classicColors, setClassicColors] = useState<string[]>([]);
  const [currentClassicColor, setCurrentClassicColor] = useState<string>('#054697');
  const [generatedImages, setGeneratedImages] = useState<{category: string, imageUrl: string}[]>([]);
  const [showAITemplate, setShowAITemplate] = useState(false);
  const [activeTab, setActiveTab] = useState<'classic' | 'ai'>('classic');

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

  useEffect(() => {
    // Extract colors from images for the moodboard template
    // This would ideally use color extraction from images
    // For now, we'll use a default palette if none is selected
    if (selectedColors.length === 0) {
      setSelectedColors(['#054697', '#FFE8E4', '#FF5C39', '#B8BDD7']);
    }
  }, [selectedColors]);

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

  // Convert AI-generated images to the format expected by MoodboardTemplate
  const convertGeneratedImagesToTemplateFormat = () => {
    return generatedImages.map((img, index) => ({
      id: `ai-${index}`,
      url: img.imageUrl,
      title: img.category.charAt(0).toUpperCase() + img.category.slice(1),
      category: img.category
    }));
  };

  // Handle when AI generates images
  const handleImagesGenerated = (images: {category: string, imageUrl: string}[]) => {
    setGeneratedImages(images);
    if (images.length > 0) {
      setShowAITemplate(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      <div 
        className="bg-white p-6 space-y-6"
        style={{
          border: '1px solid rgba(5, 70, 151, 0.1)',
          boxShadow: '0 4px 20px rgba(5, 70, 151, 0.05)',
          borderRadius: '4px'
        }}
      >
        <div className="flex items-center justify-between">
          <h1 
            className="text-2xl font-semibold"
            style={{ 
              fontFamily: "'Giaza', serif", 
              color: '#054697',
              letterSpacing: '-0.05em'
            }}
          >
            Wedding Vision Board
          </h1>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 
              className="text-xl font-medium"
              style={{ 
                fontFamily: "'Giaza', serif", 
                color: '#054697',
                letterSpacing: '-0.05em'
              }}
            >
              Vision Board Options
            </h2>
            <div>
              {!showAITemplate && activeTab === 'classic' && (
                <button
                  onClick={() => setShowMoodboardTemplate(!showMoodboardTemplate)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium"
                  style={{
                    backgroundColor: showMoodboardTemplate ? 'transparent' : '#E8B4B4',
                    color: '#054697',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 400,
                    textTransform: 'uppercase',
                    border: showMoodboardTemplate ? '1px solid #E8B4B4' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  {showMoodboardTemplate ? 'Back to Grid View' : 'View as Template'}
                </button>
              )}
              {showAITemplate && (
                <button
                  onClick={() => setShowAITemplate(false)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#054697',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 400,
                    textTransform: 'uppercase',
                    border: '1px solid #E8B4B4',
                    cursor: 'pointer'
                  }}
                >
                  Back to Generator
                </button>
              )}
            </div>
          </div>
          <div 
            className="border-b mb-4"
            style={{
              borderColor: 'rgba(5, 70, 151, 0.1)'
            }}
          >
            <div className="flex">
              <button
                onClick={() => {
                  setActiveTab('classic');
                  setShowAITemplate(false);
                }}
                className={`py-2 px-4 text-sm font-medium relative`}
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  textTransform: 'uppercase',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: activeTab === 'classic' ? '#054697' : 'rgba(5, 70, 151, 0.6)'
                }}
              >
                Classic Mood Board
                {activeTab === 'classic' && (
                  <div 
                    className="absolute bottom-0 left-0 w-full h-0.5"
                    style={{
                      backgroundColor: '#E8B4B4'
                    }}
                  ></div>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab('ai');
                  setShowMoodboardTemplate(false);
                }}
                className={`py-2 px-4 text-sm font-medium relative`}
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  textTransform: 'uppercase',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: activeTab === 'ai' ? '#054697' : 'rgba(5, 70, 151, 0.6)'
                }}
              >
                AI Mood Board Generator
                {activeTab === 'ai' && (
                  <div 
                    className="absolute bottom-0 left-0 w-full h-0.5"
                    style={{
                      backgroundColor: '#E8B4B4'
                    }}
                  ></div>
                )}
              </button>
            </div>
          </div>
        </div>

        {showAITemplate ? (
          <MoodboardTemplate 
            images={convertGeneratedImagesToTemplateFormat()} 
            colors={selectedColors}
          />
        ) : (
          <>
            {activeTab === 'classic' && (
              <>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => {
                      setNewImage({ category: categories[0] });
                      setShowForm(true);
                    }}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium"
                    style={{
                      backgroundColor: '#E8B4B4',
                      color: '#054697',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400,
                      textTransform: 'uppercase',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Image
                  </button>
                  <button
                    onClick={() => document.getElementById('import-board')?.click()}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium ml-2"
                    style={{
                      backgroundColor: '#E8B4B4',
                      color: '#054697',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400,
                      textTransform: 'uppercase',
                      border: 'none',
                      cursor: 'pointer',
                      marginLeft: '8px'
                    }}
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Import Board
                  </button>
                  <input
                    type="file"
                    id="import-board"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={handleImport}
                  />
                </div>

                {/* Color Palette Picker for Classic Board */}
                <div className="mb-6 p-4 border" style={{ borderColor: 'rgba(5, 70, 151, 0.1)' }}>
                  <h3 
                    className="text-lg font-medium mb-3"
                    style={{ 
                      fontFamily: "'Giaza', serif", 
                      color: '#054697',
                      letterSpacing: '-0.05em'
                    }}
                  >
                    Color Palette
                  </h3>
                  <p 
                    className="text-sm mb-4"
                    style={{ 
                      color: '#054697', 
                      opacity: 0.8,
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 300
                    }}
                  >
                    Select up to 5 colors for your moodboard
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    {classicColors.map((color, index) => (
                      <div 
                        key={index} 
                        className="relative"
                      >
                        <div 
                          style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: color,
                            border: '1px solid rgba(5, 70, 151, 0.1)',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setCurrentClassicColor(color);
                            const newColors = [...classicColors];
                            newColors.splice(index, 1);
                            setClassicColors(newColors);
                          }}
                        />
                        <button
                          onClick={() => {
                            const newColors = [...classicColors];
                            newColors.splice(index, 1);
                            setClassicColors(newColors);
                          }}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm"
                          style={{
                            color: '#054697',
                            border: '1px solid rgba(5, 70, 151, 0.1)'
                          }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {classicColors.length < 5 && (
                      <div 
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: '#EEEEEE',
                          border: '1px dashed rgba(5, 70, 151, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          if (classicColors.length < 5 && !classicColors.includes(currentClassicColor)) {
                            setClassicColors([...classicColors, currentClassicColor]);
                          }
                        }}
                      >
                        <Plus className="w-5 h-5" style={{ color: 'rgba(5, 70, 151, 0.5)' }} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <HexColorPicker 
                        color={currentClassicColor} 
                        onChange={setCurrentClassicColor} 
                        style={{ width: '200px', height: '200px' }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="mb-3">
                        <div 
                          style={{
                            width: '100%',
                            height: '40px',
                            backgroundColor: currentClassicColor,
                            marginBottom: '8px',
                            border: '1px solid rgba(5, 70, 151, 0.1)'
                          }}
                        />
                        <input
                          type="text"
                          value={currentClassicColor}
                          onChange={(e) => setCurrentClassicColor(e.target.value)}
                          className="w-full p-2 text-sm"
                          style={{
                            border: '1px solid rgba(5, 70, 151, 0.1)',
                            color: '#054697',
                            fontFamily: 'Poppins, sans-serif'
                          }}
                        />
                      </div>
                      
                      <button
                        onClick={() => {
                          if (classicColors.length < 5 && !classicColors.includes(currentClassicColor)) {
                            setClassicColors([...classicColors, currentClassicColor]);
                          }
                        }}
                        disabled={classicColors.length >= 5 || classicColors.includes(currentClassicColor)}
                        className="px-4 py-2 text-sm font-medium"
                        style={{
                          backgroundColor: classicColors.length >= 5 || classicColors.includes(currentClassicColor) ? '#EEEEEE' : '#E8B4B4',
                          color: '#054697',
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 400,
                          textTransform: 'uppercase',
                          border: 'none',
                          cursor: classicColors.length >= 5 || classicColors.includes(currentClassicColor) ? 'not-allowed' : 'pointer',
                          opacity: classicColors.length >= 5 || classicColors.includes(currentClassicColor) ? 0.5 : 1
                        }}
                      >
                        Add to Palette
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex flex-wrap gap-3 mb-4">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="px-3 py-1 text-sm font-medium"
                      style={{
                        backgroundColor: selectedCategory === 'all' ? '#E8B4B4' : 'rgba(5, 70, 151, 0.1)',
                        color: '#054697',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 400,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      All
                    </button>
                    {categories.map((category, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedCategory(category === selectedCategory ? 'all' : category)}
                        className="px-3 py-1 text-sm font-medium"
                        style={{
                          backgroundColor: category === selectedCategory ? '#E8B4B4' : 'rgba(5, 70, 151, 0.1)',
                          color: '#054697',
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 400,
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {showMoodboardTemplate ? (
                  <MoodboardTemplate 
                    images={filteredImages.map(img => ({ 
                      id: img.id, 
                      url: img.url, 
                      title: img.title,
                      category: img.category
                    }))} 
                    colors={classicColors}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredImages.map(image => (
                      <div 
                        key={image.id} 
                        className="bg-white overflow-hidden flex flex-col relative"
                        style={{
                          border: '1px solid rgba(5, 70, 151, 0.1)',
                          boxShadow: '0 2px 10px rgba(5, 70, 151, 0.03)',
                          borderRadius: '4px'
                        }}
                      >
                        <div 
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '4px',
                            height: '100%',
                            backgroundColor: '#054697'
                          }}
                        ></div>
                        <div className="relative aspect-w-16 aspect-h-9 bg-gray-200">
                          <img
                            src={image.url}
                            alt={image.title}
                            className="object-cover w-full h-full"
                          />
                          <button
                            onClick={() => deleteImage(image.id)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-white text-gray-700 hover:bg-gray-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-4 flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <h3 
                              className="text-lg font-medium"
                              style={{ 
                                fontFamily: "'Giaza', serif", 
                                color: '#054697',
                                letterSpacing: '-0.05em'
                              }}
                            >
                              {image.title}
                            </h3>
                            <span 
                              className="text-xs px-2 py-1"
                              style={{
                                backgroundColor: '#E8B4B4',
                                color: '#054697',
                                fontFamily: 'Poppins, sans-serif',
                                fontWeight: 400
                              }}
                            >
                              {image.category}
                            </span>
                          </div>
                          {image.description && (
                            <p 
                              className="text-sm mb-3"
                              style={{ 
                                color: '#054697', 
                                opacity: 0.8,
                                fontFamily: 'Poppins, sans-serif',
                                fontWeight: 300
                              }}
                            >
                              {image.description}
                            </p>
                          )}
                          {image.source && (
                            <a
                              href={image.source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs mt-2"
                              style={{ 
                                color: '#054697', 
                                opacity: 0.8,
                                fontFamily: 'Poppins, sans-serif',
                                fontWeight: 300
                              }}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Source
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'ai' && !showAITemplate && (
              <div 
                className="bg-white p-6 space-y-6"
                style={{ 
                  border: '1px solid rgba(5, 70, 151, 0.1)',
                  borderRadius: '4px'
                }}
              >
                <h2 
                  className="text-xl font-medium"
                  style={{ 
                    fontFamily: "'Giaza', serif", 
                    color: '#054697',
                    letterSpacing: '-0.05em'
                  }}
                >
                  AI Vision Board Generator
                </h2>
                <p 
                  className="text-sm"
                  style={{ 
                    color: '#054697', 
                    opacity: 0.8,
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 300
                  }}
                >
                  Describe your dream wedding and our AI will generate a vision board for you.
                </p>
                <MoodboardGenerator 
                  falApiKey={falApiKey} 
                  onColorsSelected={(colors) => setSelectedColors(colors)}
                  onImagesGenerated={handleImagesGenerated}
                />
              </div>
            )}
          </>
        )}
        {filteredImages.length === 0 && (
          <div 
            className="bg-gray-50 p-8 text-center border border-dashed"
            style={{
              borderColor: 'rgba(5, 70, 151, 0.2)',
            }}
          >
            <ImageIcon className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(5, 70, 151, 0.3)' }} />
            <h3 
              className="text-lg font-medium mb-2"
              style={{ 
                fontFamily: "'Giaza', serif", 
                color: '#054697',
                letterSpacing: '-0.05em'
              }}
            >
              No images yet
            </h3>
            <p 
              className="text-sm mb-4"
              style={{ 
                color: '#054697', 
                opacity: 0.8,
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 300
              }}
            >
              Start adding inspiration images to your mood board
            </p>
            {activeTab === 'classic' && (
              <button
                onClick={() => {
                  setNewImage({ category: categories[0] });
                  setShowForm(true);
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium"
                style={{
                  backgroundColor: '#E8B4B4',
                  color: '#054697',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add First Image
              </button>
            )}
          </div>
        )}
      </div>

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
                marginLeft: '2px',
                textTransform: 'uppercase'
              }}
            >
              Add Image
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
