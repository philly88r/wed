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
        // Use a PNG version of the logo instead of SVG for better PDF compatibility
        // First try to use a pre-converted PNG if available
        const pngLogoUrl = '/Altare-Primary-Blanc.png'; // PNG version of the logo
        
        try {
          // Try to fetch the PNG version first
          const response = await fetch(pngLogoUrl);
          if (response.ok) {
            const blob = await response.blob();
            const reader = new FileReader();
            
            reader.onload = () => {
              setLogoUrl(reader.result as string);
              setLogoLoaded(true);
            };
            
            reader.readAsDataURL(blob);
            return; // Exit if PNG version loaded successfully
          }
        } catch (pngError) {
          console.log('PNG logo not found, falling back to SVG conversion');
        }
        
        // If PNG not available, convert SVG to data URL
        const svgLogoUrl = '/Altare Primary-Blanc.svg';
        const svgResponse = await fetch(svgLogoUrl);
        const svgBlob = await svgResponse.blob();
        
        // Convert SVG to PNG using canvas
        const img = new Image();
        const svgUrl = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
          // Create canvas to convert SVG to PNG
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 200;
          canvas.height = img.height || 100;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Draw white background to ensure logo is visible on any background
            ctx.fillStyle = 'transparent';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw the SVG image
            ctx.drawImage(img, 0, 0);
            
            // Convert to data URL
            const pngDataUrl = canvas.toDataURL('image/png');
            setLogoUrl(pngDataUrl);
            setLogoLoaded(true);
            
            // Clean up
            URL.revokeObjectURL(svgUrl);
          }
        };
        
        img.src = svgUrl;
      } catch (error) {
        console.error('Error loading logo:', error);
        // Fallback to a simple text-based logo
        setLogoUrl('');
        setLogoLoaded(true);
      }
    };
    
    loadLogo();
  }, []);
  
  // Filter out empty images
  const validImages = images.filter(img => img.url);
  
  // Get primary color from selected colors or use default
  const primaryColor = colors.length > 0 ? colors[0] : '#E8B4B4';
  
  // Function to download the template as PDF
  const downloadAsPDF = async () => {
    if (!templateRef.current) return;
    
    try {
      // Wait for any pending renders to complete
      await new Promise(resolve => setTimeout(resolve, 800)); // Increased timeout for better rendering
      
      // Create a clone of the template for PDF generation
      const templateClone = templateRef.current.cloneNode(true) as HTMLElement;
      document.body.appendChild(templateClone);
      templateClone.style.position = 'absolute';
      templateClone.style.left = '-9999px';
      templateClone.style.top = '-9999px';
      
      // Ensure all images in the clone are loaded
      const allImages = templateClone.querySelectorAll('img');
      await Promise.all(Array.from(allImages).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve; // Continue even if an image fails
        });
      }));
      
      const canvas = await html2canvas(templateClone, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Allow cross-origin images
        allowTaint: true,
        backgroundColor: '#FAFAFA',
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
        }
      });
      
      // Remove the clone from the DOM
      document.body.removeChild(templateClone);
      
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
  
  // Function to determine the grid layout based on number of images
  const getGridLayout = () => {
    const count = validImages.length;
    
    if (count === 0) {
      return {
        columns: '1fr',
        rows: '1fr',
        areas: ['"empty"']
      };
    }
    
    if (count === 1) {
      return {
        columns: '1fr',
        rows: '1fr',
        areas: ['"img1"']
      };
    }
    
    if (count === 2) {
      return {
        columns: '1fr 1fr',
        rows: '1fr',
        areas: ['"img1 img2"']
      };
    }
    
    if (count === 3) {
      return {
        columns: '1fr 1fr',
        rows: '1fr 1fr',
        areas: [
          '"img1 img2"',
          '"img1 img3"'
        ]
      };
    }
    
    if (count === 4) {
      return {
        columns: '1fr 1fr',
        rows: '1fr 1fr',
        areas: [
          '"img1 img2"',
          '"img3 img4"'
        ]
      };
    }
    
    if (count === 5) {
      return {
        columns: '1fr 1fr 1fr',
        rows: '1fr 1fr',
        areas: [
          '"img1 img1 img2"',
          '"img3 img4 img5"'
        ]
      };
    }
    
    if (count === 6) {
      return {
        columns: '1fr 1fr 1fr',
        rows: '1fr 1fr',
        areas: [
          '"img1 img2 img3"',
          '"img4 img5 img6"'
        ]
      };
    }
    
    if (count === 7) {
      return {
        columns: '1fr 1fr 1fr 1fr',
        rows: '1fr 1fr',
        areas: [
          '"img1 img1 img2 img3"',
          '"img4 img5 img6 img7"'
        ]
      };
    }
    
    if (count === 8) {
      return {
        columns: '1fr 1fr 1fr 1fr',
        rows: '1fr 1fr',
        areas: [
          '"img1 img2 img3 img4"',
          '"img5 img6 img7 img8"'
        ]
      };
    }
    
    if (count === 9) {
      return {
        columns: '1fr 1fr 1fr',
        rows: '1fr 1fr 1fr',
        areas: [
          '"img1 img2 img3"',
          '"img4 img5 img6"',
          '"img7 img8 img9"'
        ]
      };
    }
    
    if (count === 10) {
      return {
        columns: '1fr 1fr 1fr 1fr',
        rows: '1fr 1fr 1fr',
        areas: [
          '"img1 img1 img2 img3"',
          '"img4 img5 img6 img7"',
          '"img8 img9 img10 img10"'
        ]
      };
    }
    
    if (count === 11) {
      return {
        columns: '1fr 1fr 1fr 1fr',
        rows: '1fr 1fr 1fr',
        areas: [
          '"img1 img2 img3 img4"',
          '"img5 img6 img7 img8"',
          '"img9 img10 img11 img11"'
        ]
      };
    }
    
    // 12 or more images
    return {
      columns: '1fr 1fr 1fr 1fr',
      rows: '1fr 1fr 1fr',
      areas: [
        '"img1 img2 img3 img4"',
        '"img5 img6 img7 img8"',
        '"img9 img10 img11 img12"'
      ]
    };
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
          aspectRatio: validImages.length > 0 ? '1.414/1' : 'auto', // A4 aspect ratio (landscape) if images exist
          backgroundColor: '#FAFAFA',
          overflow: 'hidden',
          position: 'relative',
          minHeight: validImages.length > 0 ? 'auto' : '300px' // Minimum height if no images
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
            boxSizing: 'border-box'
          }}
        >
          {/* Small logo box in top left */}
          <Box
            sx={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              width: '80px', // Increased size for better visibility
              height: '40px', // Increased size for better visibility
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '2px',
              backgroundColor: 'rgba(5, 70, 151, 0.8)', // Primary Blue background for logo
              padding: '4px'
            }}
          >
            {logoLoaded && logoUrl ? (
              <img 
                id="altare-logo-img"
                src={logoUrl}
                alt="Altare Logo" 
                style={{
                  maxWidth: '70px',
                  maxHeight: '30px',
                  objectFit: 'contain',
                  zIndex: 11,
                  filter: 'brightness(1.2)' // Make logo slightly brighter for better visibility
                }}
                crossOrigin="anonymous"
              />
            ) : (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#FFFFFF', // White text on blue background
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  letterSpacing: '0.05em'
                }}
              >
                ALTARE
              </Typography>
            )}
          </Box>
          
          {/* Color palette in top right corner */}
          {colors.length > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '4px',
                borderRadius: '2px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '2px',
                zIndex: 10,
                border: '1px solid rgba(5, 70, 151, 0.1)'
              }}
            >
              {colors.map((color, index) => (
                <Box
                  key={index}
                  sx={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: color,
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '2px'
                  }}
                />
              ))}
            </Box>
          )}
          
          {validImages.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
                pt: '40px', // Space for the logo and color palette
                boxSizing: 'border-box'
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
              sx={{
                display: 'grid',
                gridTemplateColumns: gridLayout.columns,
                gridTemplateRows: gridLayout.rows,
                gridTemplateAreas: gridLayout.areas.join(' '),
                gap: 1,
                width: '100%',
                height: '100%',
                pt: '40px', // Space for the logo and color palette
                boxSizing: 'border-box'
              }}
            >
              {validImages.map((image, index) => (
                <Box
                  key={image.id}
                  sx={{
                    gridArea: `img${index + 1}`,
                    backgroundColor: '#EEEEEE',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #B8BDD7' // Nude color for borders per Altare guidelines
                  }}
                >
                  {image.category && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '5px', // Moved higher (was 10px)
                        left: '10px',
                        backgroundColor: 'rgba(232, 180, 180, 0.8)', // Soft Pink per Altare guidelines
                        padding: '4px 8px', // Increased vertical padding (was 2px 8px)
                        maxWidth: '90%',
                        borderBottomRightRadius: '4px',
                        zIndex: 5
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#054697', // Primary Blue per Altare guidelines
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 400,
                          fontSize: '0.7rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'block',
                          lineHeight: 1, // Tighter line height to center text better
                          paddingTop: '1px' // Small top padding to center text vertically
                        }}
                      >
                        {image.category}
                      </Typography>
                    </Box>
                  )}
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.title || `Moodboard image ${index + 1}`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain', // Changed from 'cover' to 'contain' to prevent stretching
                        objectPosition: 'center', // Centers the image in the container
                        display: 'block', // Removes any extra space below the image
                        width: 'auto',
                        height: 'auto'
                      }}
                      crossOrigin="anonymous"
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default MoodboardTemplate;
