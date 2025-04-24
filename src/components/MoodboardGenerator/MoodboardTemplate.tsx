import { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Radio, RadioGroup, FormControlLabel, FormControl } from '@mui/material';
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

interface ImagePosition {
  id: string;
  top: string;
  left: string;
  width: string;
  height: string;
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
  const [templateMode, setTemplateMode] = useState<'masonry' | 'fixed'>('masonry');
  
  // For image replacer functionality
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [imagePositioningMode, setImagePositioningMode] = useState<'contain' | 'cover'>('contain');
  
  // Define the positions of the replaceable images in the template
  const imagePositions: ImagePosition[] = [
    { id: 'img1', top: '96px', left: '94px', width: '340px', height: '232px' },
    { id: 'img2', top: '96px', left: '454px', width: '340px', height: '488px' },
    { id: 'img3', top: '348px', left: '94px', width: '340px', height: '232px' },
    { id: 'img4', top: '600px', left: '94px', width: '207px', height: '156px' },
    { id: 'img5', top: '600px', left: '321px', width: '207px', height: '156px' },
    { id: 'img6', top: '600px', left: '548px', width: '246px', height: '156px' },
    { id: 'img7', top: '864px', left: '94px', width: '246px', height: '280px' },
    { id: 'img8', top: '864px', left: '382px', width: '412px', height: '280px' },
  ];
  
  // State for fixed template images
  const [fixedImages, setFixedImages] = useState<{[key: string]: MoodboardImage}>({});
  
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
      
      // Initialize fixed template images if needed
      if (Object.keys(fixedImages).length === 0) {
        const initialFixedImages: {[key: string]: MoodboardImage} = {};
        imagePositions.forEach((pos, index) => {
          if (processedImages[index]) {
            initialFixedImages[pos.id] = {
              ...processedImages[index],
              width: parseInt(pos.width),
              height: parseInt(pos.height),
            };
          } else {
            initialFixedImages[pos.id] = {
              id: pos.id,
              url: '/placeholder-image.jpg',
              width: parseInt(pos.width),
              height: parseInt(pos.height),
              aspectRatio: parseInt(pos.width) / parseInt(pos.height)
            };
          }
        });
        setFixedImages(initialFixedImages);
      }
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
  
  // Function to handle image selection for fixed template
  const handleImageClick = (imageId: string) => {
    setActiveImageId(imageId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Function to handle file selection for fixed template
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && activeImageId) {
      const file = event.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      
      // Create a new image object to check dimensions
      const img = new Image();
      img.onload = () => {
        // Store the image with its original dimensions
        const pos = imagePositions.find(p => p.id === activeImageId);
        if (pos) {
          setFixedImages(prev => ({
            ...prev,
            [activeImageId]: {
              id: activeImageId,
              url: imageUrl,
              width: parseInt(pos.width),
              height: parseInt(pos.height),
              originalWidth: img.width,
              originalHeight: img.height,
              aspectRatio: img.width / img.height
            }
          }));
        }
      };
      img.src = imageUrl;
    }
    
    // Reset the file input so the same file can be selected again
    if (event.target) {
      event.target.value = '';
    }
  };

  // Function to handle resetting an image to a placeholder
  const handleResetImage = (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const pos = imagePositions.find(p => p.id === imageId);
    if (pos) {
      const width = parseInt(pos.width);
      const height = parseInt(pos.height);
      
      setFixedImages(prev => ({
        ...prev,
        [imageId]: { 
          id: imageId,
          url: '/placeholder-image.jpg', 
          width: width, 
          height: height, 
          aspectRatio: width/height 
        }
      }));
    }
  };
  
  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      {/* Template Mode Toggle */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <FormControl>
          <RadioGroup
            row
            value={templateMode}
            onChange={(e) => setTemplateMode(e.target.value as 'masonry' | 'fixed')}
          >
            <FormControlLabel 
              value="masonry" 
              control={<Radio sx={{ color: '#054697' }} />} 
              label="Masonry Gallery" 
            />
            <FormControlLabel 
              value="fixed" 
              control={<Radio sx={{ color: '#054697' }} />} 
              label="Fixed Template" 
            />
          </RadioGroup>
        </FormControl>
      </Box>
      
      {templateMode === 'masonry' ? (
        // Masonry Gallery Layout
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
      ) : (
        // Fixed Template Layout
        <Box sx={{ width: '100%', position: 'relative' }}>
          <Paper
            ref={templateRef}
            data-testid="moodboard-template-fixed"
            elevation={0}
            sx={{
              width: '100%',
              backgroundColor: '#FBFBF7',
              borderRadius: 0,
              overflow: 'hidden',
              boxShadow: 'none',
              border: '1px solid #FFFFFF',
              aspectRatio: '800/1200',
              maxHeight: '80vh',
              margin: '0 auto',
              position: 'relative'
            }}
          >
            {/* Images */}
            {imagePositions.map((pos) => (
              <Box
                key={pos.id}
                sx={{
                  position: 'absolute',
                  top: pos.top,
                  left: pos.left,
                  width: pos.width,
                  height: pos.height,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  '&:hover': {
                    opacity: 0.9,
                    border: '2px solid #054697'
                  },
                  border: '1px solid #FFFFFF'
                }}
                onClick={() => handleImageClick(pos.id)}
              >
                <Box sx={{ 
                  width: '100%', 
                  height: '100%', 
                  bgcolor: '#f5f5f5', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  <img
                    src={fixedImages[pos.id]?.url || '/placeholder-image.jpg'}
                    alt={`Template image ${pos.id}`}
                    style={{
                      objectFit: imagePositioningMode,
                      maxWidth: '100%',
                      maxHeight: '100%'
                    }}
                  />
                </Box>
                <Box sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0, 0, 0, 0.2)',
                  opacity: 0,
                  '&:hover': {
                    opacity: 1
                  }
                }}>
                  <Typography sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                    Click to replace
                  </Typography>
                  {fixedImages[pos.id]?.url !== '/placeholder-image.jpg' && (
                    <Button 
                      variant="contained"
                      size="small"
                      sx={{ 
                        bgcolor: '#FFE8E4', 
                        color: '#054697',
                        '&:hover': {
                          bgcolor: '#FFD5CC'
                        },
                        fontSize: '0.7rem',
                        minWidth: '60px',
                        height: '24px'
                      }}
                      onClick={(e) => handleResetImage(pos.id, e)}
                    >
                      Reset
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
            
            {/* Altare logo */}
            <Box 
              sx={{ 
                position: 'absolute', 
                top: '772px', 
                left: '94px', 
                width: '700px', 
                height: '72px', 
                bgcolor: '#054697', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <Typography sx={{ color: 'white', fontSize: '3rem', fontFamily: 'Giaza, serif' }}>
                Altare
              </Typography>
            </Box>
            
            {/* Color swatches at the bottom */}
            <Box sx={{ position: 'absolute', top: '1064px', left: '382px', display: 'flex', gap: 1 }}>
              {colors.map((color, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    width: '40px', 
                    height: '40px', 
                    bgcolor: color,
                    borderRadius: '50%',
                    border: '1px solid #FFFFFF'
                  }}
                />
              ))}
            </Box>
          </Paper>
          
          {/* Image Fit Options for Fixed Template */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, boxShadow: 1 }}>
              <Typography sx={{ fontWeight: 'bold', mb: 1, color: '#054697' }}>
                Image Fit Options:
              </Typography>
              <FormControl>
                <RadioGroup
                  row
                  value={imagePositioningMode}
                  onChange={(e) => setImagePositioningMode(e.target.value as 'contain' | 'cover')}
                >
                  <FormControlLabel 
                    value="contain" 
                    control={<Radio sx={{ color: '#054697' }} />} 
                    label="Fit entire image (may show background)" 
                  />
                  <FormControlLabel 
                    value="cover" 
                    control={<Radio sx={{ color: '#054697' }} />} 
                    label="Fill frame (may crop image)" 
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          </Box>
        </Box>
      )}
      
      {/* Hidden file input for fixed template */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept="image/*"
      />
    </Box>
  );
}
