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
}

const MoodboardTemplate: React.FC<MoodboardTemplateProps> = ({ 
  images, 
  colors = []
}) => {
  const templateRef = useRef<HTMLDivElement>(null);
  
  // Ensure we have exactly 7 image slots (fill with empty if needed)
  const filledImages = [...images];
  while (filledImages.length < 7) {
    filledImages.push({ id: `empty-${filledImages.length}`, url: '' });
  }
  
  // Take only the first 7 images if there are more
  const displayImages = filledImages.slice(0, 7);
  
  // Get primary color from selected colors or use default
  const primaryColor = colors.length > 0 ? colors[0] : '#E8B4B4';
  
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
            backgroundColor: primaryColor,
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
            p: 0,
            position: 'relative'
          }}
        >
          {/* Altare logo in top left corner */}
          <Box
            sx={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 10,
              padding: '5px',
              borderRadius: '2px'
            }}
          >
            <img 
              src="/Altare Primary-Blanc.svg" 
              alt="Altare Logo" 
              style={{
                height: '30px',
                maxWidth: '120px',
                objectFit: 'contain'
              }}
            />
          </Box>
          
          {/* Top section with images */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
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
                gridColumn: '1 / 3',
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
            
            {/* Top right images */}
            <Box
              sx={{
                gridColumn: '3 / 4',
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
            
            {/* Top far right image */}
            <Box
              sx={{
                gridColumn: '4 / 5',
                gridRow: '1 / 2',
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
            
            {/* Middle right images */}
            <Box
              sx={{
                gridColumn: '3 / 4',
                gridRow: '2 / 3',
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
            
            {/* Middle far right image */}
            <Box
              sx={{
                gridColumn: '4 / 5',
                gridRow: '2 / 3',
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
          </Box>
          
          {/* Bottom section with images */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: '1fr',
              gap: 1,
              p: 1,
              pt: 0.5,
              pb: 0.5
            }}
          >
            {/* Bottom left images */}
            <Box
              sx={{
                gridColumn: '1 / 3',
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
            
            {/* Bottom right image */}
            <Box
              sx={{
                gridColumn: '3 / 5',
                backgroundColor: '#EEEEEE',
                overflow: 'hidden'
              }}
            >
              {displayImages[6].url ? (
                <img
                  src={displayImages[6].url}
                  alt={displayImages[6].title || 'Moodboard image 7'}
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
          
          {/* Altare logo in the center banner */}
          <Box
            sx={{
              width: '100%',
              textAlign: 'center',
              py: 1.5,
              backgroundColor: primaryColor,
              mb: 0.5,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <img 
              src="/Altare Primary-Blanc.svg" 
              alt="Altare Logo" 
              style={{
                height: '40px',
                maxWidth: '180px',
                objectFit: 'contain'
              }}
            />
          </Box>
          
          {/* Color palette in bottom left */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
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
                  backgroundColor: color,
                  border: '1px solid #ddd'
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
