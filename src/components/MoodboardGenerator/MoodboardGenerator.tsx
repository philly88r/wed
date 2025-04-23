import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  CircularProgress, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
  Paper
} from '@mui/material';
import { HexColorPicker } from 'react-colorful';
import { configureFalClient, generateMoodboardImage, generateWeddingPrompt } from '../../utils/falClient';
import { supabase } from '../../utils/supabaseClient';

// Wedding style options
const weddingStyles = [
  'Modern', 'Rustic', 'Bohemian', 'Classic', 'Vintage', 'Minimalist', 
  'Glamorous', 'Beach', 'Garden', 'Industrial', 'Romantic', 'Whimsical'
];

// Wedding vibe options
const weddingVibes = [
  'Elegant', 'Relaxed', 'Intimate', 'Festive', 'Sophisticated', 
  'Playful', 'Dramatic', 'Cozy', 'Luxurious', 'Ethereal'
];

// Wedding season options
const weddingSeasons = ['Spring', 'Summer', 'Fall', 'Winter'];

// Wedding venue options
const weddingVenues = [
  'Outdoor', 'Indoor', 'Beach', 'Garden', 'Barn', 'Ballroom', 
  'Vineyard', 'Urban', 'Mountain', 'Historic', 'Destination'
];

// Wedding categories for image generation
const weddingCategories = [
  'decor', 'flowers', 'attire', 'venue', 'cake', 'tablescape', 'invitation'
];

interface MoodboardGeneratorProps {
  falApiKey?: string;
  onColorsSelected?: (colors: string[]) => void;
  onImagesGenerated?: (images: {category: string, imageUrl: string}[]) => void;
}

const MoodboardGenerator: React.FC<MoodboardGeneratorProps> = ({ 
  falApiKey,
  onColorsSelected,
  onImagesGenerated
}) => {
  // Configure fal.ai client
  useEffect(() => {
    configureFalClient(falApiKey);
  }, [falApiKey]);

  // State for the stepper
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Choose Colors', 'Wedding Details', 'Generate Moodboard'];

  // State for color selection
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [currentColor, setCurrentColor] = useState('#ffffff');
  
  // State for wedding details
  const [weddingStyle, setWeddingStyle] = useState('');
  const [weddingVibe, setWeddingVibe] = useState('');
  const [weddingSeason, setWeddingSeason] = useState('');
  const [weddingVenue, setWeddingVenue] = useState('');
  
  // State for generated images
  const [generatedImages, setGeneratedImages] = useState<{category: string, imageUrl: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  
  // State for error handling
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'error' | 'info' | 'success' | 'warning'
  });

  // Handle color selection
  const handleAddColor = () => {
    if (selectedColors.length < 5 && !selectedColors.includes(currentColor)) {
      const newColors = [...selectedColors, currentColor];
      setSelectedColors(newColors);
      // Notify parent component about color changes
      if (onColorsSelected) {
        onColorsSelected(newColors);
      }
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    const newColors = selectedColors.filter(color => color !== colorToRemove);
    setSelectedColors(newColors);
    // Notify parent component about color changes
    if (onColorsSelected) {
      onColorsSelected(newColors);
    }
  };

  // Handle step navigation
  const handleNext = () => {
    if (activeStep === 0 && selectedColors.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one color',
        severity: 'warning'
      });
      return;
    }
    
    if (activeStep === 1 && (!weddingStyle || !weddingVibe || !weddingSeason || !weddingVenue)) {
      setSnackbar({
        open: true,
        message: 'Please fill in all wedding details',
        severity: 'warning'
      });
      return;
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    
    // If moving to the final step, start generating images
    if (activeStep === 1) {
      generateMoodboard();
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedColors([]);
    setCurrentColor('#ffffff');
    setWeddingStyle('');
    setWeddingVibe('');
    setWeddingSeason('');
    setWeddingVenue('');
    setGeneratedImages([]);
  };

  // Generate moodboard images
  const generateMoodboard = async () => {
    setIsGenerating(true);
    setGeneratedImages([]);
    
    try {
      // Create an array to collect all generated images
      const newGeneratedImages: {category: string, imageUrl: string}[] = [];
      
      // Generate one image for each category
      for (const category of weddingCategories) {
        setCurrentCategory(category);
        
        // Generate the prompt for this category
        const prompt = generateWeddingPrompt(
          selectedColors, 
          weddingStyle, 
          weddingVibe, 
          weddingSeason, 
          weddingVenue,
          category
        );
        
        console.log(`Generating ${category} image with prompt: ${prompt}`);
        
        // Generate the image
        const result = await generateMoodboardImage(prompt);
        
        if (result && result.images && result.images.length > 0) {
          const newImage = { category, imageUrl: result.images[0].url };
          newGeneratedImages.push(newImage);
          
          // Update state with new image
          setGeneratedImages(prev => [...prev, newImage]);
          
          // Save the image to local storage
          const moodboardData = JSON.parse(localStorage.getItem('wedding-mood-board') || '{}');
          moodboardData[category] = {
            imageUrl: result.images[0].url,
            prompt,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('wedding-mood-board', JSON.stringify(moodboardData));
        }
      }
      
      setSnackbar({
        open: true,
        message: 'Moodboard generated successfully!',
        severity: 'success'
      });

      // Notify parent component about generated images after all are generated
      if (onImagesGenerated && newGeneratedImages.length > 0) {
        onImagesGenerated(newGeneratedImages);
      }
    } catch (error) {
      console.error('Error generating moodboard:', error);
      setSnackbar({
        open: true,
        message: 'Error generating moodboard. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsGenerating(false);
      setCurrentCategory('');
    }
  };

  // Save moodboard to user account
  const saveMoodboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSnackbar({
          open: true,
          message: 'Please log in to save your moodboard',
          severity: 'warning'
        });
        return;
      }
      
      const moodboardData = {
        user_id: user.id,
        colors: selectedColors,
        style: weddingStyle,
        vibe: weddingVibe,
        season: weddingSeason,
        venue: weddingVenue,
        images: generatedImages,
        created_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('moodboards')
        .insert([moodboardData]);
      
      if (error) throw error;
      
      setSnackbar({
        open: true,
        message: 'Moodboard saved to your account!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving moodboard:', error);
      setSnackbar({
        open: true,
        message: 'Error saving moodboard. Please try again.',
        severity: 'error'
      });
    }
  };

  // Render the color selection step
  const renderColorSelection = () => (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Select up to 5 colors for your wedding palette
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Color Picker
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <HexColorPicker color={currentColor} onChange={setCurrentColor} />
              <Box 
                sx={{ 
                  width: 100, 
                  height: 50, 
                  bgcolor: currentColor, 
                  border: '1px solid #ccc',
                  borderRadius: 1,
                  mt: 2
                }} 
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {currentColor}
              </Typography>
              <Button 
                variant="contained" 
                onClick={handleAddColor}
                disabled={selectedColors.length >= 5 || selectedColors.includes(currentColor)}
                sx={{ mt: 2 }}
              >
                Add Color
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Selected Colors ({selectedColors.length}/5)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {selectedColors.map((color, index) => (
                <Chip
                  key={index}
                  label={color}
                  onDelete={() => handleRemoveColor(color)}
                  sx={{ 
                    bgcolor: color, 
                    color: isLightColor(color) ? '#000' : '#fff',
                    '& .MuiChip-deleteIcon': {
                      color: isLightColor(color) ? '#000' : '#fff',
                    }
                  }}
                />
              ))}
              {selectedColors.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No colors selected yet. Add up to 5 colors.
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 3 }}>
              {selectedColors.map((color, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    width: 50, 
                    height: 50, 
                    bgcolor: color, 
                    border: '1px solid #ccc',
                    borderRadius: 1
                  }} 
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  // Render the wedding details step
  const renderWeddingDetails = () => (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Tell us about your wedding
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Wedding Style</InputLabel>
            <Select
              value={weddingStyle}
              onChange={(e) => setWeddingStyle(e.target.value)}
              label="Wedding Style"
            >
              {weddingStyles.map((style) => (
                <MenuItem key={style} value={style}>{style}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Wedding Vibe</InputLabel>
            <Select
              value={weddingVibe}
              onChange={(e) => setWeddingVibe(e.target.value)}
              label="Wedding Vibe"
            >
              {weddingVibes.map((vibe) => (
                <MenuItem key={vibe} value={vibe}>{vibe}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Season</InputLabel>
            <Select
              value={weddingSeason}
              onChange={(e) => setWeddingSeason(e.target.value)}
              label="Season"
            >
              {weddingSeasons.map((season) => (
                <MenuItem key={season} value={season}>{season}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Venue Type</InputLabel>
            <Select
              value={weddingVenue}
              onChange={(e) => setWeddingVenue(e.target.value)}
              label="Venue Type"
            >
              {weddingVenues.map((venue) => (
                <MenuItem key={venue} value={venue}>{venue}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Your Wedding Palette
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          {selectedColors.map((color, index) => (
            <Box 
              key={index}
              sx={{ 
                width: 50, 
                height: 50, 
                bgcolor: color, 
                border: '1px solid #ccc',
                borderRadius: 1
              }} 
            />
          ))}
        </Box>
      </Box>
    </Box>
  );

  // Render the moodboard generation step
  const renderMoodboardGeneration = () => (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Your Wedding Moodboard
      </Typography>
      
      {isGenerating && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Generating {currentCategory ? `${currentCategory} images` : 'moodboard'}...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This may take a minute or two
          </Typography>
        </Box>
      )}
      
      {!isGenerating && generatedImages.length > 0 && (
        <>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {generatedImages.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={image.imageUrl}
                    alt={`${image.category} inspiration`}
                  />
                  <CardContent>
                    <Typography variant="subtitle1" component="div">
                      {capitalizeFirstLetter(image.category)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={saveMoodboard}
              sx={{ mr: 2 }}
            >
              Save to My Account
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => generateMoodboard()}
            >
              Regenerate
            </Button>
          </Box>
        </>
      )}
      
      {!isGenerating && generatedImages.length === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
          <Typography variant="body1">
            No images generated yet. Click "Generate" to create your moodboard.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={generateMoodboard}
            sx={{ mt: 2 }}
          >
            Generate
          </Button>
        </Box>
      )}
    </Box>
  );

  // Helper function to determine if a color is light or dark
  const isLightColor = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  };

  // Helper function to capitalize the first letter of a string
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Wedding Moodboard Generator
      </Typography>
      
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Create a personalized wedding moodboard with AI-generated images based on your preferences
      </Typography>
      
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {activeStep === 0 && renderColorSelection()}
      {activeStep === 1 && renderWeddingDetails()}
      {activeStep === 2 && renderMoodboardGeneration()}
      
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 4 }}>
        <Button
          color="inherit"
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep === steps.length - 1 ? (
          <Button onClick={handleReset}>
            Start Over
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            {activeStep === steps.length - 2 ? 'Generate' : 'Next'}
          </Button>
        )}
      </Box>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MoodboardGenerator;
