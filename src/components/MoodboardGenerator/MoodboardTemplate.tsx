import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface MoodboardImage {
  id: string;
  url: string;
  title?: string;
  category?: string;
}

interface MoodboardTemplateProps {
  images: MoodboardImage[];
  colors?: string[];
}

const MoodboardTemplate: React.FC<MoodboardTemplateProps> = ({ 
  images, 
  colors = []
}) => {
  const templateRef = useRef<HTMLDivElement>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  
  // Load the logo as a data URL to ensure it appears in the PDF
  useEffect(() => {
    const loadLogo = async () => {
      try {
        // Get the absolute URL for the logo
        const absoluteLogoUrl = new URL('/Altare Primary-Blanc.svg', window.location.origin).href;
        
        // Fetch the logo and convert to data URL
        const response = await fetch(absoluteLogoUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onload = () => {
          setLogoUrl(reader.result as string);
          setLogoLoaded(true);
        };
        
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error loading logo:', error);
        // Fallback to direct URL if data URL fails
        setLogoUrl('/Altare Primary-Blanc.svg');
        setLogoLoaded(true);
      }
    };
    
    loadLogo();
  }, []);
  
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
        backgroundColor: '#FAFAFA',
        logging: true, // Enable logging for debugging
        onclone: (document) => {
          // Fix for SVG images in PDF
          const svgElements = document.querySelectorAll('svg');
          svgElements.forEach(svg => {
            svg.setAttribute('width', svg.getBoundingClientRect().width.toString());
            svg.setAttribute('height', svg.getBoundingClientRect().height.toString());
          });
        }
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
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Button
        variant="contained"
        startIcon={<Download />}
        onClick={downloadAsPDF}
        sx={{
          position: 'absolute',
          top: '-50px',
          right: 0,
          backgroundColor: primaryColor,
          color: '#054697',
          '&:hover': {
            backgroundColor: primaryColor,
            opacity: 0.9
          },
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 400,
          textTransform: 'uppercase'
        }}
      >
        Download PDF
      </Button>
      
      <Paper
        ref={templateRef}
        elevation={0}
        sx={{
          width: '100%',
          aspectRatio: '1.414/1', // A4 aspect ratio (landscape)
          backgroundColor: '#FAFAFA',
          overflow: 'hidden',
          position: 'relative'
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
        
        {/* Main content container */}
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
          {/* Small logo box in top left */}
          <Box
            sx={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              width: '80px',
              height: '40px',
              backgroundColor: '#E8B4B4',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '2px'
            }}
          >
            {logoLoaded ? (
              <img 
                src={logoUrl}
                alt="Altare Logo" 
                style={{
                  maxWidth: '70px',
                  maxHeight: '30px',
                  objectFit: 'contain'
                }}
                crossOrigin="anonymous"
              />
            ) : (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#FFFFFF',
                  fontStyle: 'italic'
                }}
              >
                Loading...
              </Typography>
            )}
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
                  crossOrigin="anonymous"
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
                  crossOrigin="anonymous"
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
                  crossOrigin="anonymous"
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
                  crossOrigin="anonymous"
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
                  crossOrigin="anonymous"
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
                  crossOrigin="anonymous"
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
                overflow: 'hidden',
                position: 'relative'
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
                  crossOrigin="anonymous"
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
              
              {/* Color palette in bottom right corner */}
              {colors.length > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: '4px',
                    borderTopLeftRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: '100px',
                    border: '1px solid rgba(5, 70, 151, 0.1)'
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#054697',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400,
                      fontSize: '0.6rem',
                      marginBottom: '2px',
                      textTransform: 'uppercase'
                    }}
                  >
                    Colors
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      gap: '2px',
                      width: '100%'
                    }}
                  >
                    {colors.map((color, index) => (
                      <Box
                        key={index}
                        sx={{
                          width: '16px',
                          height: '16px',
                          backgroundColor: color,
                          border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: '2px'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default MoodboardTemplate;
