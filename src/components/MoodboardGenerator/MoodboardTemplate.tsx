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
    
    if (count === 0) {
      return {
        columns: '1fr',
        rows: 'auto',
        areas: ['"empty"'],
        gap: '4px'
      };
    }
    
    if (count === 1) {
      return {
        columns: '1fr',
        rows: 'auto',
        areas: ['"img1"'],
        gap: '4px'
      };
    }
    
    if (count === 2) {
      return {
        columns: '1fr 1fr',
        rows: 'auto',
        areas: ['"img1 img2"'],
        gap: '4px'
      };
    }
    
    if (count === 3) {
      return {
        columns: '2fr 1fr',
        rows: 'auto auto',
        areas: [
          '"img1 img2"',
          '"img1 img3"'
        ],
        gap: '4px'
      };
    }
    
    if (count === 4) {
      return {
        columns: '2fr 1fr',
        rows: 'auto auto',
        areas: [
          '"img1 img2"',
          '"img3 img4"'
        ],
        gap: '4px'
      };
    }
    
    if (count === 5) {
      return {
        columns: '2fr 1fr 1fr',
        rows: 'auto auto',
        areas: [
          '"img1 img2 img3"',
          '"img1 img4 img5"'
        ],
        gap: '4px'
      };
    }
    
    if (count === 6) {
      return {
        columns: '1fr 1fr 1fr',
        rows: 'auto auto',
        areas: [
          '"img1 img2 img3"',
          '"img4 img5 img6"'
        ],
        gap: '4px'
      };
    }
    
    if (count === 7) {
      return {
        columns: '2fr 1fr 1fr 1fr',
        rows: 'auto auto',
        areas: [
          '"img1 img2 img3 img4"',
          '"img1 img5 img6 img7"'
        ],
        gap: '4px'
      };
    }
    
    if (count === 8) {
      return {
        columns: '1fr 1fr 1fr 1fr',
        rows: 'auto auto',
        areas: [
          '"img1 img2 img3 img4"',
          '"img5 img6 img7 img8"'
        ],
        gap: '4px'
      };
    }
    
    if (count === 9) {
      return {
        columns: '2fr 1fr 1fr',
        rows: 'auto auto auto',
        areas: [
          '"img1 img2 img3"',
          '"img1 img4 img5"',
          '"img6 img7 img8 img9"'
        ],
        gap: '4px'
      };
    }
    
    if (count === 10) {
      return {
        columns: '2fr 1fr 1fr 1fr',
        rows: 'auto auto auto',
        areas: [
          '"img1 img2 img3 img4"',
          '"img1 img5 img6 img7"',
          '"img8 img9 img10 img10"'
        ],
        gap: '4px'
      };
    }
    
    // For more than 10 images
    return {
      columns: '2fr 1fr 1fr 1fr',
      rows: 'auto auto auto',
      areas: [
        '"img1 img2 img3 img4"',
        '"img1 img5 img6 img7"',
        '"img8 img9 img10 img11"'
      ],
      gap: '4px'
    };
  };
  
  // Function to download the template as PDF
  const downloadAsPDF = async () => {
    if (!templateRef.current) return;
    
    try {
      // Wait for any pending renders to complete
      await new Promise(resolve => setTimeout(resolve, 800)); // Increased timeout for better rendering
      
      // Clone the template element to avoid modifying the original
      const templateClone = templateRef.current.cloneNode(true) as HTMLElement;
      
      // Apply styles to ensure PDF matches the screen view
      templateClone.style.width = '100%';
      templateClone.style.height = 'auto';
      templateClone.style.backgroundColor = '#FBFBF7';
      
      // Ensure all images in the clone are loaded
      const images = templateClone.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));
      
      const canvas = await html2canvas(templateRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Allow cross-origin images
        allowTaint: true,
        backgroundColor: '#FBFBF7',
        logging: true, // Enable logging for debugging
        onclone: (clonedDoc) => {
          // Fix for SVG images in PDF
          const svgElements = clonedDoc.querySelectorAll('svg');
          svgElements.forEach(svg => {
            svg.setAttribute('width', svg.getBoundingClientRect().width.toString());
            svg.setAttribute('height', svg.getBoundingClientRect().height.toString());
          });
          
          // Ensure logo is visible in the cloned document
          const logoImg = clonedDoc.querySelector('#altare-logo-img');
          if (logoImg) {
            (logoImg as HTMLImageElement).style.visibility = 'visible';
            (logoImg as HTMLImageElement).style.opacity = '1';
            // Force the logo to be visible
            (logoImg as HTMLImageElement).setAttribute('crossOrigin', 'anonymous');
          }
          
          // Pre-load all images to ensure they're rendered in the PDF
          const images = clonedDoc.querySelectorAll('img');
          images.forEach(img => {
            img.setAttribute('crossOrigin', 'anonymous');
            // Force image to be fully loaded
            if (!img.complete) {
              img.style.opacity = '1';
              img.style.visibility = 'visible';
            }
          });
          
          // Ensure grid layout is preserved
          const gridContainer = clonedDoc.querySelector('.moodboard-grid');
          if (gridContainer) {
            (gridContainer as HTMLElement).style.display = 'grid';
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Create PDF with dimensions matching the canvas aspect ratio
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const pdfWidth = 210; // A4 width in mm (portrait)
      const pdfHeight = (canvasHeight / canvasWidth) * pdfWidth;
      
      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
      
      // Add the image to fill the entire PDF
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('wedding-moodboard.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };
  
  const gridLayout = getGridLayout();
  
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
          backgroundColor: '#E8B4B4', // Soft Pink/Blush color per Altare brand guidelines
          color: '#054697', // Primary Blue for text per Altare brand guidelines
          '&:hover': {
            backgroundColor: '#FFD5CC', // Darker Soft Pink for hover state
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
                gridTemplateColumns: gridLayout.columns,
                gridTemplateRows: gridLayout.rows,
                gridTemplateAreas: gridLayout.areas.join(' '),
                gap: '0px',
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: '#FBFBF7', // Ensure grid container has cream background
                minHeight: '400px' // Ensure minimum height for grid
              }}
            >
              {validImages.map((image, index) => {
                // Determine if this image should be larger based on its position
                const isLargeImage = index === 0 || 
                  (validImages.length >= 3 && index === 0) || 
                  (validImages.length >= 9 && index === 8);
                
                return (
                  <Box
                    key={image.id}
                    sx={{
                      gridArea: `img${index + 1}`,
                      backgroundColor: '#FBFBF7', // Match container background
                      overflow: 'hidden',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #B8BDD7', // Nude color for borders per Altare guidelines
                      // Different aspect ratios for variety
                      aspectRatio: isLargeImage ? '1/1' : 
                        index % 3 === 0 ? '16/9' : 
                        index % 3 === 1 ? '4/3' : 
                        '3/4',
                      minHeight: isLargeImage ? '300px' : '200px' // Minimum height for each image
                    }}
                  >
                    {/* Image container with natural fitting */}
                    <img
                      src={image.url}
                      alt={image.title || `Moodboard image ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center'
                      }}
                      crossOrigin="anonymous"
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default MoodboardTemplate;
