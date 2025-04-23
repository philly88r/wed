import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, alpha } from '@mui/material';
import { Download as DownloadIcon } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);
  
  // Load the logo as a data URL to ensure it appears in the PDF
  useEffect(() => {
    const loadLogo = async () => {
      try {
        // Use the new Peri submark logo
        const absoluteLogoUrl = new URL('/altare-submark-peri.png', window.location.origin).href;
        
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
        setLogoUrl('/altare-submark-peri.png');
        setLogoLoaded(true);
      }
    };
    
    loadLogo();
  }, []);
  
  // Filter out empty images
  const validImages = images.filter(img => img.url);
  
  // Function to determine the grid layout based on number of images
  const getGridLayout = () => {
    const count = validImages.length;
    console.log('Number of images in template:', count);
    
    // Simple layouts that work well for both display and PDF
    if (count <= 1) {
      return {
        gridTemplateColumns: '1fr',
        gridAutoRows: 'minmax(300px, auto)',
        gridGap: '2px'
      };
    }
    
    if (count <= 3) {
      return {
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridAutoRows: 'minmax(250px, auto)',
        gridGap: '2px'
      };
    }
    
    if (count <= 6) {
      return {
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridAutoRows: 'minmax(200px, auto)',
        gridGap: '2px'
      };
    }
    
    if (count <= 9) {
      return {
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridAutoRows: 'minmax(180px, auto)',
        gridGap: '2px'
      };
    }
    
    // For more than 9 images
    return {
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridAutoRows: 'minmax(160px, auto)',
      gridGap: '2px'
    };
  };
  
  // Function to determine if an image should be larger (span multiple cells)
  const getImageSpan = (index: number, totalImages: number): { rowSpan: number, colSpan: number } => {
    // Default is 1x1
    const defaultSpan = { rowSpan: 1, colSpan: 1 };
    
    // For 1-3 images
    if (totalImages <= 3) {
      if (index === 0) return { rowSpan: 2, colSpan: 1 }; // First image is taller
    }
    
    // For 4-6 images
    if (totalImages <= 6) {
      if (index === 0) return { rowSpan: 2, colSpan: 2 }; // First image is large
    }
    
    // For 7-9 images
    if (totalImages <= 9) {
      if (index === 0) return { rowSpan: 2, colSpan: 2 }; // First image is large
    }
    
    // For 10+ images
    if (index === 0) return { rowSpan: 2, colSpan: 2 }; // First image is large
    
    return defaultSpan;
  };

  // Function to download the template as PDF
  const downloadAsPDF = async () => {
    if (!templateRef.current) {
      console.error('Template reference is null');
      return;
    }
    
    try {
      // Show loading indicator
      setIsLoading(true);
      
      // Wait for any pending renders to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the template element
      const templateElement = templateRef.current;
      
      // Make sure all images are loaded before generating PDF
      const images = Array.from(templateElement.querySelectorAll('img'));
      await Promise.all(
        images.map(img => 
          new Promise(resolve => {
            if (img.complete) {
              resolve(null);
            } else {
              img.onload = () => resolve(null);
              img.onerror = () => {
                console.error('Image failed to load:', img.src);
                resolve(null);
              };
            }
          })
        )
      );
      
      console.log('All images loaded, generating PDF...');
      
      // Create canvas with better settings
      const canvas = await html2canvas(templateElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FBFBF7',
        logging: true,
        onclone: (clonedDoc) => {
          const clonedTemplate = clonedDoc.querySelector('[data-testid="moodboard-template"]');
          if (clonedTemplate) {
            (clonedTemplate as HTMLElement).style.backgroundColor = '#FBFBF7';
          }
          
          // Ensure all images are visible
          const images = clonedDoc.querySelectorAll('img');
          images.forEach(img => {
            img.setAttribute('crossOrigin', 'anonymous');
            img.style.display = 'block';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
          });
        }
      });
      
      // Create PDF with proper dimensions
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Use fixed dimensions for more reliable output
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate dimensions to maintain aspect ratio
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add the image to the PDF
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save('wedding-moodboard.pdf');
      
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const layout = getGridLayout();
  const count = validImages.length;
  
  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Button
        variant="contained"
        onClick={downloadAsPDF}
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
        disabled={isLoading}
        sx={{
          position: 'absolute',
          top: '-50px',
          right: '0',
          backgroundColor: '#054697',
          color: 'white',
          '&:hover': {
            backgroundColor: alpha('#054697', 0.8)
          },
          borderRadius: 0,
          fontFamily: 'Poppins',
          fontWeight: 500,
          fontSize: '14px',
          textTransform: 'uppercase'
        }}
      >
        {isLoading ? 'Generating PDF...' : 'Download PDF'}
      </Button>
      
      <Paper
        ref={templateRef}
        elevation={0}
        sx={{
          width: '100%',
          backgroundColor: '#FBFBF7', // Cream background color
          overflow: 'hidden',
          position: 'relative',
          minHeight: validImages.length > 0 ? 'auto' : '300px',
          border: '1px solid #B8BDD7' // Subtle border for definition
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
            p: 1,
            position: 'relative',
            boxSizing: 'border-box',
            backgroundColor: '#FBFBF7' // Ensure inner container also has the cream background
          }}
        >
          {/* Dedicated header area */}
          <Box
            sx={{
              width: '100%',
              height: '80px', // Taller header area
              position: 'relative',
              marginBottom: '10px',
              borderBottom: '1px solid rgba(184, 189, 215, 0.3)', // Subtle separator
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FBFBF7' // Ensure header has the cream background
            }}
          >
            {/* Logo box in header - made bigger */}
            <Box
              sx={{
                width: '150px', // Wider logo container
                height: '70px', // Taller logo container
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '10px'
              }}
            >
              {logoLoaded && (
                <img 
                  id="altare-logo-img"
                  src={logoUrl}
                  alt="Altare Logo" 
                  style={{
                    maxWidth: '130px', // Larger logo
                    maxHeight: '65px',
                    objectFit: 'contain',
                    zIndex: 11
                  }}
                  crossOrigin="anonymous"
                />
              )}
              {!logoLoaded && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#054697',
                    fontStyle: 'italic'
                  }}
                >
                  Loading...
                </Typography>
              )}
            </Box>

            {/* Color palette in header */}
            {colors.length > 0 && (
              <Box
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  padding: '4px',
                  borderRadius: '2px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '2px',
                  zIndex: 10,
                  border: '1px solid rgba(5, 70, 151, 0.1)',
                  marginRight: '10px'
                }}
              >
                {colors.map((color, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: '15px',
                      height: '15px',
                      backgroundColor: color,
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '2px'
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
          
          {validImages.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: '#FBFBF7' // Ensure empty state has cream background
              }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#054697',
                  opacity: 0.6,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 300
                }}
              >
                Add images to create your moodboard
              </Typography>
            </Box>
          ) : (
            /* Dynamic grid layout for images */
            <Box
              className="moodboard-grid"
              sx={{
                display: 'grid',
                gridTemplateColumns: layout.gridTemplateColumns,
                gridAutoRows: layout.gridAutoRows,
                gap: layout.gridGap,
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: '#FBFBF7', // Ensure grid container has cream background
                minHeight: '400px', // Ensure minimum height for grid
                padding: '2px'
              }}
            >
              {validImages.map((image, index) => {
                const span = getImageSpan(index, count);
                
                return (
                  <Box
                    key={image.id}
                    sx={{
                      backgroundColor: '#FBFBF7',
                      overflow: 'hidden',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #B8BDD7',
                      gridRow: `span ${span.rowSpan}`,
                      gridColumn: `span ${span.colSpan}`,
                      minHeight: '100%'
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.title || `Moodboard image ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        display: 'block'
                      }}
                      crossOrigin="anonymous"
                      loading="eager"
                      onError={(e) => {
                        console.error(`Failed to load image: ${image.url}`);
                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
        
        {/* Download button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Button
            variant="contained"
            onClick={downloadAsPDF}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
            disabled={isLoading}
            sx={{
              backgroundColor: '#054697',
              color: 'white',
              '&:hover': {
                backgroundColor: alpha('#054697', 0.8)
              },
              px: 4,
              py: 1.5,
              borderRadius: 0,
              fontFamily: 'Poppins',
              fontWeight: 500,
              fontSize: '16px',
              textTransform: 'uppercase'
            }}
          >
            {isLoading ? 'Generating PDF...' : 'Download PDF'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default MoodboardTemplate;
