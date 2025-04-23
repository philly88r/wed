import { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface MoodboardImage {
  id: string;
  url: string;
  title?: string;
  category?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
}

interface MoodboardTemplateProps {
  images: MoodboardImage[];
  colors?: string[];
}

export default function MoodboardTemplate({ images, colors = [] }: MoodboardTemplateProps) {
  const templateRef = useRef<HTMLDivElement>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [moodboardImages, setMoodboardImages] = useState<MoodboardImage[]>([]);
  
  // Initialize moodboard images with aspect ratios
  useEffect(() => {
    const processImages = async () => {
      const processedImages = await Promise.all(
        images.filter(img => img.url).map(async (image) => {
          // If image already has aspect ratio, use it
          if (image.aspectRatio) {
            return image;
          }
          
          // Otherwise, calculate aspect ratio from image dimensions or load the image
          if (image.width && image.height) {
            return {
              ...image,
              aspectRatio: image.width / image.height
            };
          }
          
          // Try to get dimensions from the actual image
          try {
            return new Promise<MoodboardImage>((resolve) => {
              const img = new Image();
              img.onload = () => {
                resolve({
                  ...image,
                  width: img.width,
                  height: img.height,
                  aspectRatio: img.width / img.height
                });
              };
              img.onerror = () => {
                // Default to 3:2 aspect ratio if image can't be loaded
                resolve({
                  ...image,
                  aspectRatio: 1.5
                });
              };
              img.src = image.url;
            });
          } catch (error) {
            console.error('Error loading image:', error);
            return {
              ...image,
              aspectRatio: 1.5 // Default to 3:2 aspect ratio
            };
          }
        })
      );
      
      setMoodboardImages(processedImages);
    };
    
    processImages();
  }, [images]);
  
  // Load the logo as a data URL
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
  
  // Handle drag end event
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(moodboardImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setMoodboardImages(items);
  };
  
  // Calculate masonry layout dimensions
  const getMasonryItemSize = (image: MoodboardImage, index: number, totalImages: number) => {
    const aspectRatio = image.aspectRatio || 1.5; // Default to 3:2 if not available
    
    // Base width calculation
    let width = '100%';
    let height = 'auto';
    
    if (totalImages <= 3) {
      // For 1-3 images, make them larger
      if (index === 0 && totalImages > 1) {
        width = '60%'; // First image is larger
      } else {
        width = totalImages === 1 ? '100%' : '40%';
      }
    } else if (totalImages <= 6) {
      // For 4-6 images
      if (index === 0) {
        width = '50%'; // First image is medium
      } else if (aspectRatio > 1.2) {
        width = '40%'; // Wider images
      } else if (aspectRatio < 0.8) {
        width = '30%'; // Taller images
      } else {
        width = '33%'; // Square-ish images
      }
    } else {
      // For 7+ images
      if (aspectRatio > 1.2) {
        width = '32%'; // Wider images
      } else if (aspectRatio < 0.8) {
        width = '24%'; // Taller images
      } else {
        width = '28%'; // Square-ish images
      }
    }
    
    // Calculate height based on width and aspect ratio
    // We'll set a base height and let the image's natural aspect ratio determine the final height
    const baseHeight = totalImages <= 3 ? 300 : totalImages <= 6 ? 220 : 180;
    
    // Adjust height based on aspect ratio
    if (aspectRatio < 1) {
      // Taller images
      height = `${baseHeight * (1 / aspectRatio) * 0.8}px`;
    } else {
      // Wider or square images
      height = `${baseHeight}px`;
    }
    
    return { width, height };
  };
  
  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
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
          minHeight: '80vh', // Flexible height
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
            height: '40px', // Compact height
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
        
        {/* Masonry Gallery with Drag and Drop */}
        <Box sx={{ 
          padding: '16px',
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
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="moodboard-images" direction="horizontal">
                {(provided) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start'
                    }}
                  >
                    {validImages.map((image, index) => {
                      const { width, height } = getMasonryItemSize(image, index, validImages.length);
                      return (
                        <Draggable key={image.id} draggableId={image.id} index={index}>
                          {(provided, snapshot) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                width,
                                height,
                                position: 'relative',
                                overflow: 'hidden',
                                border: '1px solid #FFFFFF',
                                boxShadow: snapshot.isDragging ? '0 5px 10px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s ease',
                                transform: snapshot.isDragging ? 'scale(1.02)' : 'scale(1)',
                                zIndex: snapshot.isDragging ? 10 : 1,
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
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
