import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, alpha } from '@mui/material';
import { Download as DownloadIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

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

// Define drag item type
const ItemTypes = {
  IMAGE: 'image'
};

// Draggable image component
const DraggableImage = ({ image, index, moveImage, size }: { 
  image: MoodboardImage; 
  index: number; 
  moveImage: (dragIndex: number, hoverIndex: number) => void;
  size: 'small' | 'medium' | 'large';
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.IMAGE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [, drop] = useDrop({
    accept: ItemTypes.IMAGE,
    hover: (item: { index: number }) => {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Move the image
      moveImage(dragIndex, hoverIndex);
      
      // Update the item's index for future drags
      item.index = hoverIndex;
    },
  });
  
  // Apply the drag and drop refs
  drag(drop(ref));
  
  // Calculate grid span based on size
  const getGridSpan = () => {
    switch (size) {
      case 'large':
        return {
          gridColumn: 'span 2',
          gridRow: 'span 2',
          minHeight: '300px'
        };
      case 'medium':
        return {
          gridColumn: 'span 2',
          gridRow: 'span 1',
          minHeight: '200px'
        };
      case 'small':
      default:
        return {
          gridColumn: 'span 1',
          gridRow: 'span 1',
          minHeight: '150px'
        };
    }
  };
  
  const gridSpan = getGridSpan();
  
  return (
    <Box
      ref={ref}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        backgroundColor: '#FBFBF7',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #B8BDD7',
        height: '100%',
        transition: 'transform 0.2s ease',
        ...gridSpan
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
};

const MoodboardTemplate: React.FC<MoodboardTemplateProps> = ({ 
  images, 
  colors = []
}) => {
  const templateRef = useRef<HTMLDivElement>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [moodboardImages, setMoodboardImages] = useState<MoodboardImage[]>([]);
  
  // Initialize moodboard images
  useEffect(() => {
    setMoodboardImages(images.filter(img => img.url));
  }, [images]);
  
  // Function to move an image (for drag and drop)
  const moveImage = (dragIndex: number, hoverIndex: number) => {
    const draggedImage = moodboardImages[dragIndex];
    const newImages = [...moodboardImages];
    newImages.splice(dragIndex, 1);
    newImages.splice(hoverIndex, 0, draggedImage);
    setMoodboardImages(newImages);
  };
  
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
  
  // Function to calculate grid layout based on image count
  const getGridLayout = (count: number) => {
    // For 1-2 images, use 4 columns (to allow for spanning)
    if (count <= 2) {
      return {
        columns: 4,
        gap: 2
      };
    }
    
    // For 3-5 images, use 6 columns (to allow for spanning)
    if (count <= 5) {
      return {
        columns: 6,
        gap: 2
      };
    }
    
    // For 6+ images, use 8 columns (to allow for spanning)
    return {
      columns: 8,
      gap: 2
    };
  };

  // Function to determine image size based on position and total count
  const getImageSize = (index: number, totalCount: number): 'small' | 'medium' | 'large' => {
    // For 1-2 images
    if (totalCount <= 2) {
      return index === 0 ? 'large' : 'medium';
    }
    
    // For 3-5 images
    if (totalCount <= 5) {
      if (index === 0) return 'large';
      if (index === 1) return 'medium';
      return 'small';
    }
    
    // For 6-9 images
    if (totalCount <= 9) {
      if (index === 0) return 'large';
      if (index === 1 || index === 4) return 'medium';
      return 'small';
    }
    
    // For 10+ images
    if (index === 0) return 'large';
    if (index % 5 === 0 || index % 7 === 0) return 'medium';
    return 'small';
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
  
  // Calculate layout
  const layout = getGridLayout(validImages.length);
  
  return (
    <DndProvider backend={HTML5Backend}>
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
          data-testid="moodboard-template"
          elevation={0}
          sx={{
            width: '100%',
            backgroundColor: '#FBFBF7', // Cream color background per request
            borderRadius: 0,
            overflow: 'hidden',
            boxShadow: 'none',
            border: '1px solid #B8BDD7'
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
              borderBottom: '1px solid #B8BDD7'
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
                      border: '1px solid #B8BDD7'
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
          
          {/* Image grid */}
          <Box sx={{ padding: '10px' }}>
            {validImages.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '300px',
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
              /* CSS Grid layout for images */
              <Box
                className="moodboard-grid"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
                  gap: `${layout.gap}px`,
                  width: '100%',
                  boxSizing: 'border-box',
                  backgroundColor: '#FBFBF7',
                  minHeight: '400px',
                  padding: '2px'
                }}
              >
                {validImages.map((image, index) => (
                  <DraggableImage
                    key={image.id}
                    image={image}
                    index={index}
                    moveImage={moveImage}
                    size={getImageSize(index, validImages.length)}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </DndProvider>
  );
};

export default MoodboardTemplate;
