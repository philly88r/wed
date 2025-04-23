import { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
  const [moodboardImages, setMoodboardImages] = useState<MoodboardImage[]>([]);
  
  // Initialize moodboard images
  useEffect(() => {
    setMoodboardImages(images.filter(img => img.url));
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
  
  // Get image size based on index and total images
  const getImageSize = (index: number, totalImages: number) => {
    // Base size calculation
    if (totalImages <= 4) {
      return { width: '45%', height: '300px' };
    } else if (totalImages <= 8) {
      return { width: '30%', height: '250px' };
    } else {
      return { width: '22%', height: '200px' };
    }
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
        
        {/* Flexible Drag and Drop Image Gallery */}
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
                      gap: '16px',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start'
                    }}
                  >
                    {validImages.map((image, index) => {
                      const { width, height } = getImageSize(index, validImages.length);
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
