import { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { Download as DownloadIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MasonryPhotoAlbum } from "react-photo-album";
import type { Photo as PhotoType } from "react-photo-album";

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
  
  // Format images for react-photo-album
  const photos: PhotoType[] = validImages.map((image, index) => {
    // Create a random but consistent aspect ratio for each image
    // We'll use the image id to generate a consistent aspect ratio
    const hash = image.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const aspectRatio = 0.8 + (hash % 10) / 10; // Between 0.8 and 1.8
    
    return {
      src: image.url,
      key: image.id,
      width: 1000,
      height: Math.round(1000 / aspectRatio),
      alt: image.title || `Moodboard image ${index + 1}`,
    };
  });
  
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
        {/* Header with logo and color palette */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 20px 10px',
            backgroundColor: '#FBFBF7',
            borderBottom: '1px solid #FFFFFF'
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 2,
              height: '80px'
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
                  height: '80px',
                  width: '80px',
                  backgroundColor: '#FBFBF7'
                }}
              />
            )}
          </Box>
          
          {/* Color palette */}
          {colors && colors.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                marginTop: 1,
                marginBottom: 1
              }}
            >
              {colors.map((color, index) => (
                <Box
                  key={index}
                  sx={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: color,
                    borderRadius: '50%',
                    border: '1px solid #FFFFFF'
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
        
        {/* Masonry Photo Album */}
        <Box sx={{ 
          padding: '8px',
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
            <MasonryPhotoAlbum
              photos={photos}
              spacing={4}
              layout="masonry"
              columns={(containerWidth) => {
                // Responsive columns based on container width
                if (containerWidth < 500) return 2;
                if (containerWidth < 800) return 3;
                return 4;
              }}
              // Apply custom styling to all photos
              imgClassName="moodboard-image"
              containerWidth={templateRef.current?.clientWidth || 800}
            />
          )}
        </Box>
      </Paper>
      
      {/* Add global styles for the masonry images */}
      <style jsx global>{`
        .moodboard-image {
          object-fit: cover;
          width: 100%;
          height: 100%;
          border: 1px solid #FFFFFF;
        }
      `}</style>
    </Box>
  );
}
