import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, alpha, IconButton, Menu, MenuItem } from '@mui/material';
import { Download as DownloadIcon, Maximize2, Minimize2, Move } from 'lucide-react';
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
const DraggableImage = ({ 
  image, 
  index, 
  moveImage, 
  size, 
  onSizeChange
}: { 
  image: MoodboardImage; 
  index: number; 
  moveImage: (dragIndex: number, hoverIndex: number) => void;
  size: 'small' | 'medium' | 'large' | 'wide' | 'tall';
  onSizeChange: (index: number, newSize: 'small' | 'medium' | 'large' | 'wide' | 'tall') => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleSizeChange = (newSize: 'small' | 'medium' | 'large' | 'wide' | 'tall') => {
    onSizeChange(index, newSize);
    handleClose();
  };
  
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
  
  // Get grid span based on size
  const gridSpan = (() => {
    switch (size) {
      case 'large':
        return {
          gridColumn: 'span 2',
          gridRow: 'span 2',
        };
      case 'medium':
        return {
          gridColumn: 'span 1',
          gridRow: 'span 1',
        };
      case 'small':
        return {
          gridColumn: 'span 1',
          gridRow: 'span 1',
        };
      case 'wide':
        return {
          gridColumn: 'span 2',
          gridRow: 'span 1',
        };
      case 'tall':
        return {
          gridColumn: 'span 1',
          gridRow: 'span 2',
        };
      default:
        return {
          gridColumn: 'span 1',
          gridRow: 'span 1',
        };
    }
  })();
  
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
        border: '1px solid #FFFFFF',
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
      
      {/* Resize controls */}
      <IconButton
        size="small"
        onClick={handleClick}
        className="resize-control"
        sx={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          },
          width: '30px',
          height: '30px'
        }}
      >
        <Move size={16} color="#054697" />
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleSizeChange('small')} disabled={size === 'small'}>
          <Minimize2 size={16} style={{ marginRight: '8px' }} />
          Small
        </MenuItem>
        <MenuItem onClick={() => handleSizeChange('medium')} disabled={size === 'medium'}>
          <Move size={16} style={{ marginRight: '8px' }} />
          Medium
        </MenuItem>
        <MenuItem onClick={() => handleSizeChange('large')} disabled={size === 'large'}>
          <Maximize2 size={16} style={{ marginRight: '8px' }} />
          Large
        </MenuItem>
        <MenuItem onClick={() => handleSizeChange('wide')} disabled={size === 'wide'}>
          <Maximize2 size={16} style={{ marginRight: '8px' }} />
          Wide
        </MenuItem>
        <MenuItem onClick={() => handleSizeChange('tall')} disabled={size === 'tall'}>
          <Maximize2 size={16} style={{ marginRight: '8px' }} />
          Tall
        </MenuItem>
      </Menu>
    </Box>
  );
};

// Layout templates based on number of images
const layoutTemplates = {
  1: [{ size: 'large' }],
  2: [{ size: 'large' }, { size: 'large' }],
  3: [{ size: 'large' }, { size: 'medium' }, { size: 'medium' }],
  4: [{ size: 'large' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }],
  5: [{ size: 'large' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }],
  6: [{ size: 'large' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }],
  7: [{ size: 'large' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }],
  8: [{ size: 'large' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }],
  9: [{ size: 'large' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }],
  10: [{ size: 'large' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }, { size: 'medium' }],
};

export default function MoodboardTemplate({ images, colors = [] }: MoodboardTemplateProps) {
  const templateRef = useRef<HTMLDivElement>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [moodboardImages, setMoodboardImages] = useState<MoodboardImage[]>([]);
  const [imageSizes, setImageSizes] = useState<Record<number, 'small' | 'medium' | 'large' | 'wide' | 'tall'>>({});
  
  // Initialize moodboard images
  useEffect(() => {
    setMoodboardImages(images.filter(img => img.url));
    
    // Initialize image sizes based on templates
    const initialSizes: Record<number, 'small' | 'medium' | 'large' | 'wide' | 'tall'> = {};
    const validImages = images.filter(img => img.url);
    const count = validImages.length;
    
    // Use template if available, otherwise use default sizes
    const template = layoutTemplates[count as keyof typeof layoutTemplates] || [];
    
    validImages.forEach((_, index) => {
      initialSizes[index] = template[index]?.size || 'medium';
    });
    
    setImageSizes(initialSizes);
  }, [images]);
  
  // Function to move an image (for drag and drop)
  const moveImage = (dragIndex: number, hoverIndex: number) => {
    const draggedImage = moodboardImages[dragIndex];
    const newImages = [...moodboardImages];
    newImages.splice(dragIndex, 1);
    newImages.splice(hoverIndex, 0, draggedImage);
    setMoodboardImages(newImages);
    
    // Update image sizes after reordering
    const newSizes = { ...imageSizes };
    const draggedSize = newSizes[dragIndex];
    
    // Shift all sizes between drag and hover indices
    if (dragIndex < hoverIndex) {
      for (let i = dragIndex; i < hoverIndex; i++) {
        newSizes[i] = newSizes[i + 1];
      }
    } else {
      for (let i = dragIndex; i > hoverIndex; i--) {
        newSizes[i] = newSizes[i - 1];
      }
    }
    
    newSizes[hoverIndex] = draggedSize;
    setImageSizes(newSizes);
  };
  
  // Function to change image size
  const handleSizeChange = (index: number, newSize: 'small' | 'medium' | 'large' | 'wide' | 'tall') => {
    setImageSizes(prev => ({
      ...prev,
      [index]: newSize
    }));
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
          // Hide resize controls in the PDF
          const resizeButtons = clonedDoc.querySelectorAll('.resize-control');
          resizeButtons.forEach(button => {
            (button as HTMLElement).style.display = 'none';
          });
          
          // Hide menus in the PDF
          const menus = clonedDoc.querySelectorAll('[role="menu"]');
          menus.forEach(menu => {
            (menu as HTMLElement).style.display = 'none';
          });
          
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
            margin: '0 auto' // Center the moodboard
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
          
          {/* Image grid */}
          <Box sx={{ 
            padding: '4px',
            height: 'calc(100% - 120px)' // Subtract header height
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
              /* CSS Grid layout for images */
              <Box
                className="moodboard-grid"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gridAutoRows: 'minmax(100px, auto)',
                  gap: '4px',
                  width: '100%',
                  height: '100%',
                  boxSizing: 'border-box',
                  backgroundColor: '#FBFBF7'
                }}
              >
                {validImages.map((image, index) => (
                  <DraggableImage
                    key={image.id}
                    image={image}
                    index={index}
                    moveImage={moveImage}
                    size={imageSizes[index] || 'medium'}
                    onSizeChange={handleSizeChange}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </DndProvider>
  );
}
