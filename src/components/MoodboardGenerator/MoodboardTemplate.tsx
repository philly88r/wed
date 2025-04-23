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
        {/* Grid container for the 9 areas */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            gap: 0.5,
            width: '100%',
            height: '100%',
            padding: 0.5,
            boxSizing: 'border-box'
          }}
        >
          {/* Area 1: Logo in top left with blush background */}
          <Box
            sx={{
              gridColumn: '1 / 2',
              gridRow: '1 / 2',
              backgroundColor: '#E8B4B4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {logoLoaded ? (
              <img 
                src={logoUrl}
                alt="Altare Logo" 
                style={{
                  maxWidth: '80%',
                  maxHeight: '80%',
                  objectFit: 'contain'
                }}
                crossOrigin="anonymous"
              />
            ) : (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#FFFFFF',
                  fontStyle: 'italic'
                }}
              >
                Loading logo...
              </Typography>
            )}
          </Box>
          
          {/* Areas 2-8: Images (7 total) */}
          {displayImages.map((image, index) => (
            <Box
              key={image.id}
              sx={{
                gridColumn: index === 0 ? '2 / 3' : index === 1 ? '3 / 4' : 
                           index === 2 ? '1 / 2' : index === 3 ? '2 / 3' : 
                           index === 4 ? '3 / 4' : index === 5 ? '1 / 2' : '2 / 3',
                gridRow: index === 0 ? '1 / 2' : index === 1 ? '1 / 2' : 
                         index === 2 ? '2 / 3' : index === 3 ? '2 / 3' : 
                         index === 4 ? '2 / 3' : index === 5 ? '3 / 4' : '3 / 4',
                overflow: 'hidden',
                position: 'relative',
                backgroundColor: '#EEEEEE'
              }}
            >
              {image.url ? (
                <img
                  src={image.url}
                  alt={image.title || 'Moodboard image'}
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
              
              {image.category && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    backgroundColor: 'rgba(232, 180, 180, 0.8)',
                    padding: '2px 8px',
                    maxWidth: '90%'
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#054697',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400,
                      fontSize: '0.7rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {image.category}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
          
          {/* Area 9: Color palette in bottom right */}
          <Box
            sx={{
              gridColumn: '3 / 4',
              gridRow: '3 / 4',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 1,
              border: '1px solid rgba(5, 70, 151, 0.1)'
            }}
          >
            {colors.length > 0 ? (
              <>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#054697',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 400,
                    fontSize: '0.7rem',
                    marginBottom: 0.5,
                    textTransform: 'uppercase'
                  }}
                >
                  Color Palette
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: 0.5,
                    width: '100%'
                  }}
                >
                  {colors.map((color, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: color,
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '2px'
                      }}
                    />
                  ))}
                </Box>
              </>
            ) : (
              <Typography
                variant="caption"
                sx={{
                  color: '#AAAAAA',
                  fontStyle: 'italic'
                }}
              >
                No colors selected
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default MoodboardTemplate;
