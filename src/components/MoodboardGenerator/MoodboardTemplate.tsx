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
  
  // Get grid size based on total number of images
  const getGridSize = (totalImages: number) => {
    // For 10 images, use a consistent 4-column grid
    return 3; // 4 images per row (12/3 = 4 columns)
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
              {validImages.map((image, index) => (
                <Grid item xs={getGridSize(validImages.length)} key={image.id}>
                  <Box
                    sx={{
                      width: '100%',
                      paddingTop: '100%', // 1:1 Aspect ratio
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
              ))}
            </Grid>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
