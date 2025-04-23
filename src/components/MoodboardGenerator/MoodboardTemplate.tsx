import { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Grid } from '@mui/material';
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

export default function MoodboardTemplate({ images, colors = [] }: MoodboardTemplateProps) {
  const templateRef = useRef<HTMLDivElement>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [moodboardImages, setMoodboardImages] = useState<MoodboardImage[]>([]);
  
  // Initialize moodboard images
  useEffect(() => {
    setMoodboardImages(images.filter(img => img.url));
  }, [images]);
  
  // Load the logo as a data URL to ensure it appears in the PDF
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const logoPath = '/altare-submark-peri.png';
        const response = await fetch(logoPath);
        const blob = await response.blob();
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        
        setLogoUrl(dataUrl);
        setLogoLoaded(true);
      } catch (error) {
        console.error('Failed to load logo:', error);
        // Fallback to direct path if data URL loading fails
        setLogoUrl('/altare-submark-peri.png');
        setLogoLoaded(true);
      }
    };
    
    loadLogo();
  }, []);
  
  // Filter out empty images
  const validImages = moodboardImages.filter(img => img.url);
  
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
      
      // Create a clone of the template for PDF generation
      const clone = templateElement.cloneNode(true) as HTMLElement;
      document.body.appendChild(clone);
      
      // Set fixed dimensions for PDF (A4 size)
      clone.style.width = '210mm';
      clone.style.height = '297mm';
      clone.style.position = 'absolute';
      clone.style.top = '-9999px';
      clone.style.left = '-9999px';
      clone.style.overflow = 'hidden';
      
      // Create canvas with better settings
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FBFBF7',
        logging: true,
        onclone: (clonedDoc) => {
          // Hide any controls in the PDF
          const controls = clonedDoc.querySelectorAll('.control-element');
          controls.forEach(control => {
            (control as HTMLElement).style.display = 'none';
          });
          
          // Ensure all images are visible
          const images = clonedDoc.querySelectorAll('img');
          images.forEach(img => {
            img.setAttribute('crossOrigin', 'anonymous');
            img.style.display = 'block';
          });
        }
      });
      
      // Remove the clone from the document
      document.body.removeChild(clone);
      
      // Create PDF with A4 dimensions
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add the image to fill the entire PDF
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      
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
  
  // Get layout configuration based on number of images
  const getLayoutConfig = (index: number, totalImages: number) => {
    // Different layouts based on total number of images
    switch (totalImages) {
      case 1:
        return { xs: 12, height: '80vh' }; // Full width for single image
      
      case 2:
        return { xs: 6, height: '60vh' }; // Two equal columns
      
      case 3:
        if (index === 0) {
          return { xs: 12, height: '40vh' }; // First image full width
        }
        return { xs: 6, height: '30vh' }; // Other two split bottom row
      
      case 4:
        if (index < 2) {
          return { xs: 6, height: '40vh' }; // Top row: 2 equal columns
        }
        return { xs: 6, height: '30vh' }; // Bottom row: 2 equal columns
      
      case 5:
        if (index === 0) {
          return { xs: 12, height: '35vh' }; // First image full width
        }
        return { xs: 6, height: '25vh' }; // Other 4 in 2x2 grid
      
      case 6:
        if (index === 0) {
          return { xs: 8, height: '35vh' }; // First image larger
        }
        if (index === 1) {
          return { xs: 4, height: '35vh' }; // Second image smaller
        }
        return { xs: 4, height: '25vh' }; // Other 4 in bottom row
      
      case 7:
        if (index === 0) {
          return { xs: 8, height: '35vh' }; // First image larger
        }
        if (index === 1) {
          return { xs: 4, height: '35vh' }; // Second image smaller
        }
        return { xs: 4, height: '20vh' }; // Other 5 in bottom rows
      
      case 8:
        if (index < 2) {
          return { xs: 6, height: '30vh' }; // Top row: 2 equal columns
        }
        return { xs: 3, height: '25vh' }; // Bottom rows: 6 equal columns (3x2)
      
      case 9:
        if (index === 0) {
          return { xs: 6, height: '30vh' }; // First image larger
        }
        if (index < 3) {
          return { xs: 3, height: '30vh' }; // Complete top row
        }
        return { xs: 3, height: '20vh' }; // Bottom two rows: 6 equal columns (3x2)
      
      case 10:
        if (index < 2) {
          return { xs: 6, height: '25vh' }; // Top row: 2 equal columns
        }
        if (index < 5) {
          return { xs: 4, height: '20vh' }; // Middle row: 3 equal columns
        }
        return { xs: 3, height: '20vh' }; // Bottom rows: 5 equal columns
      
      default:
        // For more than 10 images, use a standard grid
        return { xs: 3, height: '20vh' };
    }
  };
  
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
          backgroundColor: '#FFE8E4', // Soft Pink per Altare brand guidelines
          color: '#054697', // Primary Blue per Altare brand guidelines
          '&:hover': {
            backgroundColor: '#FFD5CC' // Darker Soft Pink for hover state
          },
          borderRadius: 0,
          fontFamily: 'Poppins',
          fontWeight: 500,
          fontSize: '14px',
          textTransform: 'uppercase'
        }}
        className="control-element"
      >
        {isLoading ? 'Generating PDF...' : 'Download PDF'}
      </Button>
      
      <Paper
        ref={templateRef}
        data-testid="moodboard-template"
        elevation={0}
        sx={{
          width: '100%',
          backgroundColor: '#FBFBF7', // Cream color background per request
          borderRadius: 0,
          overflow: 'hidden',
          boxShadow: 'none',
          border: '1px solid #FFFFFF',
          aspectRatio: '210/297', // A4 aspect ratio
          maxHeight: '80vh', // Limit height for viewing on screen
          margin: '0 auto', // Center the moodboard
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Compact header with logo on left and colors on right */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '5px 10px',
            backgroundColor: '#FBFBF7',
            borderBottom: '1px solid #FFFFFF',
            height: '40px', // Even smaller height
          }}
        >
          {/* Logo on left */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              height: '35px'
            }}
          >
            {logoLoaded ? (
              <img
                id="altare-logo-img"
                src={logoUrl}
                alt="Altare Logo"
                style={{
                  height: '100%',
                  width: 'auto',
                  objectFit: 'contain'
                }}
                crossOrigin="anonymous"
              />
            ) : (
              <Box
                sx={{
                  height: '35px',
                  width: '35px',
                  backgroundColor: '#FBFBF7'
                }}
              />
            )}
          </Box>
          
          {/* Color palette on right */}
          {colors && colors.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '5px',
              }}
            >
              {colors.map((color, index) => (
                <Box
                  key={index}
                  sx={{
                    width: '18px',
                    height: '18px',
                    backgroundColor: color,
                    borderRadius: '50%',
                    border: '1px solid #FFFFFF'
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
        
        {/* Image Grid - optimized for PDF */}
        <Box sx={{ 
          padding: '2px',
          flex: 1,
          overflow: 'hidden'
        }}>
          {validImages.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                backgroundColor: '#FBFBF7',
                border: '1px dashed #B8BDD7',
                color: '#054697',
                opacity: 0.8,
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              <Typography variant="body1">
                No images to display. Add images to create your moodboard.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={1}>
              {validImages.map((image, index) => {
                const { xs, height } = getLayoutConfig(index, validImages.length);
                return (
                  <Grid item xs={xs} key={image.id}>
                    <Box
                      sx={{
                        width: '100%',
                        height,
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid #FFFFFF',
                      }}
                    >
                      <img
                        src={image.url}
                        alt={image.title || `Moodboard image ${index + 1}`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
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
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
