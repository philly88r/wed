import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

// MoodboardTemplate component - displays images in a layout matching the reference design
// with color palette in the bottom right corner
// Trigger new build
interface MoodboardTemplateProps {
  images: {
    id: string;
    url: string;
    title?: string;
    category?: string;
  }[];
  colors: string[];
  title?: string;
}

const MoodboardTemplate: React.FC<MoodboardTemplateProps> = ({ 
  images, 
  colors = [],
  title = "Altare"
}) => {
  // Ensure we have exactly 6 image slots (fill with empty if needed)
  const filledImages = [...images];
  while (filledImages.length < 6) {
    filledImages.push({ id: `empty-${filledImages.length}`, url: '' });
  }
  
  // Take only the first 6 images if there are more
  const displayImages = filledImages.slice(0, 6);
  
  // Layout configuration based on the reference image
  const layout = [
    { gridArea: '1 / 1 / 3 / 2', aspectRatio: '1/1.3' },     // Left large image
    { gridArea: '1 / 2 / 2 / 3', aspectRatio: '1.5/1' },     // Top right image
    { gridArea: '2 / 2 / 3 / 3', aspectRatio: '1.5/1' },     // Middle right image
    { gridArea: '3 / 1 / 4 / 2', aspectRatio: '1/0.5' },     // Bottom left image
    { gridArea: '3 / 2 / 4 / 3', aspectRatio: '0.5/0.5' },   // Bottom middle image
    { gridArea: '3 / 3 / 4 / 4', aspectRatio: '0.5/0.5' }    // Bottom right image
  ];

  return (
    <Paper 
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: '#FAFAFA',
        p: 2,
        border: '1px solid #E0E0E0',
        borderRadius: 0,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Red accent bar on left side */}
      <Box 
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '8px',
          height: '100%',
          backgroundColor: '#FF5C39'
        }}
      />
      
      {/* Main content */}
      <Box sx={{ pl: 2 }}>
        {/* Image grid layout matching the reference image */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, auto)',
            gap: 2,
            mb: 2
          }}
        >
          {displayImages.map((image, index) => (
            <Box
              key={image.id}
              sx={{
                gridArea: layout[index].gridArea,
                aspectRatio: layout[index].aspectRatio,
                backgroundColor: '#F0F0F0',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {image.url ? (
                <img
                  src={image.url}
                  alt={image.title || `Moodboard image ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#EEEEEE'
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#AAAAAA',
                      fontStyle: 'italic'
                    }}
                  >
                    Image placeholder
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
        
        {/* Altare logo in the center */}
        <Box
          sx={{
            width: '100%',
            textAlign: 'center',
            py: 2,
            backgroundColor: '#054697',
            mb: 2
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: '#FFFFFF',
              fontFamily: 'Giaza, serif',
              letterSpacing: '0.1em',
              fontWeight: 500
            }}
          >
            {title}
          </Typography>
        </Box>
        
        {/* Color palette in bottom right */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1
              }}
            >
              {colors.map((color, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 50,
                    height: 50,
                    backgroundColor: color,
                    border: '1px solid #E0E0E0'
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default MoodboardTemplate;
