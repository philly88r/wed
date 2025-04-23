import React, { useRef } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// MoodboardTemplate component - displays images in a layout matching the reference design
// with color palette in the bottom right corner
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
  const templateRef = useRef<HTMLDivElement>(null);
  
  // Ensure we have exactly 6 image slots (fill with empty if needed)
  const filledImages = [...images];
  while (filledImages.length < 6) {
    filledImages.push({ id: `empty-${filledImages.length}`, url: '' });
  }
  
  // Take only the first 6 images if there are more
  const displayImages = filledImages.slice(0, 6);
  
  // Function to download the template as PDF
  const downloadAsPDF = async () => {
    if (!templateRef.current) return;
    
    try {
      const canvas = await html2canvas(templateRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Allow cross-origin images
        allowTaint: true,
        backgroundColor: '#FAFAFA'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate dimensions to fit the page perfectly
      const imgWidth = 297; // A4 width in landscape (mm)
      const imgHeight = 210; // A4 height in landscape (mm)
      
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save('wedding-moodboard.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={downloadAsPDF}
          sx={{
            backgroundColor: '#E8B4B4',
            color: '#054697',
            borderRadius: 0,
            '&:hover': {
              backgroundColor: '#FFD5CC'
            },
            textTransform: 'uppercase'
          }}
        >
          Download as PDF
        </Button>
      </Box>
      
      <Paper 
        ref={templateRef}
        elevation={0}
        sx={{
          width: '100%',
          // Set aspect ratio to match A4 landscape (297:210 = 1.41:1)
          aspectRatio: '1.41/1',
          backgroundColor: '#EEEEEE',
          p: 0,
          m: 0,
          border: 'none',
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
            backgroundColor: '#FF5C39',
            zIndex: 10
          }}
        />
        
        {/* Main content container with no padding */}
        <Box 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            ml: '8px', // Account for the red bar
            p: 0
          }}
        >
          {/* Top section with images */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(2, 1fr)',
              gap: 1,
              flex: 1,
              p: 1,
              pb: 0.5
            }}
          >
            {/* Large image on left */}
            <Box
              sx={{
                gridColumn: '1 / 2',
                gridRow: '1 / 3',
                backgroundColor: '#EEEEEE',
                overflow: 'hidden'
              }}
            >
              {displayImages[0].url ? (
                <img
                  src={displayImages[0].url}
                  alt={displayImages[0].title || 'Moodboard image 1'}
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
            
            {/* Top right image */}
            <Box
              sx={{
                gridColumn: '2 / 4',
                gridRow: '1 / 2',
                backgroundColor: '#EEEEEE',
                overflow: 'hidden'
              }}
            >
              {displayImages[1].url ? (
                <img
                  src={displayImages[1].url}
                  alt={displayImages[1].title || 'Moodboard image 2'}
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
            
            {/* Middle right image */}
            <Box
              sx={{
                gridColumn: '2 / 4',
                gridRow: '2 / 3',
                backgroundColor: '#EEEEEE',
                overflow: 'hidden'
              }}
            >
              {displayImages[2].url ? (
                <img
                  src={displayImages[2].url}
                  alt={displayImages[2].title || 'Moodboard image 3'}
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
          </Box>
          
          {/* Bottom section with images */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: '1fr',
              gap: 1,
              p: 1,
              pt: 0.5,
              pb: 0.5
            }}
          >
            {/* Bottom left image */}
            <Box
              sx={{
                gridColumn: '1 / 2',
                backgroundColor: '#EEEEEE',
                overflow: 'hidden'
              }}
            >
              {displayImages[3].url ? (
                <img
                  src={displayImages[3].url}
                  alt={displayImages[3].title || 'Moodboard image 4'}
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
            
            {/* Bottom middle image */}
            <Box
              sx={{
                gridColumn: '2 / 3',
                backgroundColor: '#EEEEEE',
                overflow: 'hidden'
              }}
            >
              {displayImages[4].url ? (
                <img
                  src={displayImages[4].url}
                  alt={displayImages[4].title || 'Moodboard image 5'}
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
            
            {/* Bottom right image */}
            <Box
              sx={{
                gridColumn: '3 / 4',
                backgroundColor: '#EEEEEE',
                overflow: 'hidden'
              }}
            >
              {displayImages[5].url ? (
                <img
                  src={displayImages[5].url}
                  alt={displayImages[5].title || 'Moodboard image 6'}
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
          </Box>
          
          {/* Altare logo in the center */}
          <Box
            sx={{
              width: '100%',
              textAlign: 'center',
              py: 1.5,
              backgroundColor: '#054697',
              mb: 0.5
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
              p: 1,
              pt: 0.5
            }}
          >
            {colors.map((color, index) => (
              <Box
                key={index}
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: color
                }}
              />
            ))}
          </Box>
        </Box>
      </Paper>
    </>
  );
};

export default MoodboardTemplate;
