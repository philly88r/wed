import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { Box, Typography, Button, Radio, RadioGroup, FormControlLabel, FormControl, Paper, Grid, CircularProgress } from '@mui/material';

// Configure PDF.js worker
// Using a known working version (2.16.105) with a reliable CDN
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.min.js';

// Define types
interface ImageCoordinates {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
}

interface ReplacementImage {
  file: File;
  url: string;
  coords: ImageCoordinates;
}

type ImageStyle = 'contain' | 'cover';

type ReplacementImages = {
  [key: string]: ReplacementImage;
};

// Exact image coordinates for the wedding template PDF
const IMAGE_COORDINATES: ImageCoordinates[] = [
  { id: 'living-room', page: 0, x: 94, y: 1124, width: 340, height: 232, name: 'Living Room' },
  { id: 'studio-light', page: 0, x: 454, y: 1124, width: 340, height: 488, name: 'Studio Light' },
  { id: 'record-player', page: 0, x: 94, y: 872, width: 340, height: 232, name: 'Record Player Area' },
  { id: 'art-shelf', page: 0, x: 94, y: 696, width: 207, height: 156, name: 'Art Shelf' },
  { id: 'decor1', page: 0, x: 321, y: 696, width: 207, height: 156, name: 'Yellow Couch' },
  { id: 'decor2', page: 0, x: 548, y: 696, width: 246, height: 156, name: 'Orange Pillows' },
  { id: 'fashion', page: 0, x: 94, y: 396, width: 246, height: 280, name: 'Fashion Photo' },
  { id: 'wood-panel', page: 0, x: 382, y: 396, width: 412, height: 280, name: 'Wood Panel Room' },
];

const WeddingPDFImageReplacer: React.FC = () => {
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pdfRendered, setPdfRendered] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<ImageCoordinates | null>(null);
  const [replacementImages, setReplacementImages] = useState<ReplacementImages>({});
  const [imageStyle, setImageStyle] = useState<ImageStyle>('contain');
  const [pdfScale, setPdfScale] = useState<number>(1.0);
  const [pdfLoaded, setPdfLoaded] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const templatePdfRef = useRef<pdfjs.PDFDocumentProxy | null>(null);
  
  // Load the template PDF on component mount
  useEffect(() => {
    const loadTemplatePDF = async (): Promise<void> => {
      try {
        // Load the Altare moodboard template with absolute path
        console.log('Attempting to load PDF template...');
        const pdfUrl = `${window.location.origin}/wedding_template.pdf`;
        console.log('Loading PDF from:', pdfUrl);
        
        const response = await fetch(pdfUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        console.log('PDF template loaded successfully, size:', arrayBuffer.byteLength);
        setPdfBytes(arrayBuffer);
        await renderPDF(arrayBuffer);
        setPdfLoaded(true);
      } catch (error) {
        console.error('Error loading template PDF:', error);
        alert('Error loading the Altare moodboard template. Please try again.');
        setPdfLoaded(true);
      }
    };
    
    loadTemplatePDF();
  }, []);
  
  // Function to render the PDF
  const renderPDF = async (pdfData: ArrayBuffer): Promise<void> => {
    try {
      const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
      templatePdfRef.current = pdf;
      
      const page = await pdf.getPage(1); // Get first page
      const viewport = page.getViewport({ scale: pdfScale });
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      setPdfRendered(true);
      
      // After rendering, draw any replacement images
      if (Object.keys(replacementImages).length > 0) {
        drawReplacementImages();
      }
    } catch (error) {
      console.error('Error rendering PDF:', error);
    }
  };
  
  // Upload a custom template PDF
  const handleTemplateUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      setPdfBytes(arrayBuffer);
      await renderPDF(arrayBuffer);
    }
  };
  
  // Handle clicking on an image area
  const handleAreaClick = (coords: ImageCoordinates): void => {
    setSelectedImage(coords);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle replacement image selection
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = event.target.files;
    if (!selectedImage || !files || files.length === 0) return;
    
    const file = files[0];
    const imageUrl = URL.createObjectURL(file);
    
    // Store the replacement image info
    setReplacementImages(prev => ({
      ...prev,
      [selectedImage.id]: {
        file,
        url: imageUrl,
        coords: selectedImage
      }
    }));
    
    // Draw the replacement image on canvas
    drawReplacementImages();
  };
  
  // Draw all replacement images on the canvas
  const drawReplacementImages = (): void => {
    if (!canvasRef.current || !pdfRendered) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    Object.values(replacementImages).forEach(replacement => {
      const img = new Image();
      img.onload = () => {
        const { coords } = replacement;
        const { x, y, width, height } = coords;
        
        // Adjust y-coordinate for PDF coordinate system
        // PDF coordinates start from bottom-left, canvas from top-left
        const adjustedY = canvas.height - y - height;
        
        // Scale coordinates based on PDF scale
        const scaledX = x * pdfScale;
        const scaledY = adjustedY * pdfScale;
        const scaledWidth = width * pdfScale;
        const scaledHeight = height * pdfScale;
        
        if (imageStyle === 'contain') {
          // Maintain aspect ratio, fit entire image
          const imgRatio = img.width / img.height;
          const frameRatio = scaledWidth / scaledHeight;
          
          let drawWidth: number, drawHeight: number;
          let offsetX = 0, offsetY = 0;
          
          if (imgRatio > frameRatio) {
            // Image is wider than frame
            drawWidth = scaledWidth;
            drawHeight = drawWidth / imgRatio;
            offsetY = (scaledHeight - drawHeight) / 2;
          } else {
            // Image is taller than frame
            drawHeight = scaledHeight;
            drawWidth = drawHeight * imgRatio;
            offsetX = (scaledWidth - drawWidth) / 2;
          }
          
          // Clear the area first
          ctx.fillStyle = '#FBFBF7'; // Light background color matching Altare theme
          ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
          
          // Draw the image centered in the frame
          ctx.drawImage(img, scaledX + offsetX, scaledY + offsetY, drawWidth, drawHeight);
        } else {
          // Cover - fill the frame, may crop image
          const imgRatio = img.width / img.height;
          const frameRatio = scaledWidth / scaledHeight;
          
          let sourceX = 0, sourceY = 0;
          let sourceWidth = img.width, sourceHeight = img.height;
          
          if (imgRatio > frameRatio) {
            // Image is wider than frame
            sourceWidth = img.height * frameRatio;
            sourceX = (img.width - sourceWidth) / 2;
          } else {
            // Image is taller than frame
            sourceHeight = img.width / frameRatio;
            sourceY = (img.height - sourceHeight) / 2;
          }
          
          // Draw the image filling the frame
          ctx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,
            scaledX, scaledY, scaledWidth, scaledHeight
          );
        }
      };
      img.src = replacement.url;
    });
  };
  
  // Reset a specific image
  const handleResetImage = (e: React.MouseEvent, imageId: string): void => {
    e.stopPropagation();
    
    // Remove the image from replacements
    const newReplacements = {...replacementImages};
    delete newReplacements[imageId];
    setReplacementImages(newReplacements);
    
    // Re-render the PDF and remaining replacement images
    if (pdfBytes) {
      renderPDF(pdfBytes);
    }
  };
  
  // Change image fitting style
  const handleStyleChange = (style: ImageStyle): void => {
    setImageStyle(style);
    
    // Redraw images with new style
    if (pdfBytes && Object.keys(replacementImages).length > 0) {
      // We need to re-render the base PDF first
      renderPDF(pdfBytes);
    }
  };
  
  // Generate the final PDF with replaced images
  const generateFinalPDF = async (): Promise<void> => {
    if (!pdfBytes) return;
    
    try {
      setIsGenerating(true);
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      
      // Process each replacement image
      for (const replacement of Object.values(replacementImages)) {
        const { file, coords } = replacement;
        const imageBytes = await file.arrayBuffer();
        
        // Embed the image based on type
        let image;
        if (file.type === 'image/jpeg' || file.type.includes('jpg')) {
          image = await pdfDoc.embedJpg(imageBytes);
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          console.error('Unsupported image type:', file.type);
          continue;
        }
        
        // Calculate dimensions based on fitting style
        const { x, y, width, height } = coords;
        
        // PDF coordinates start from bottom-left
        // y needs to be adjusted from the bottom of the page
        const pdfHeight = firstPage.getHeight();
        const adjustedY = pdfHeight - y - height;
        
        if (imageStyle === 'contain') {
          // Maintain aspect ratio within the frame
          const imgWidth = image.width;
          const imgHeight = image.height;
          const imgRatio = imgWidth / imgHeight;
          const frameRatio = width / height;
          
          let drawWidth = width;
          let drawHeight = height;
          let offsetX = 0;
          let offsetY = 0;
          
          if (imgRatio > frameRatio) {
            // Image is wider than frame
            drawHeight = width / imgRatio;
            offsetY = (height - drawHeight) / 2;
          } else {
            // Image is taller than frame
            drawWidth = height * imgRatio;
            offsetX = (width - drawWidth) / 2;
          }
          
          // Draw a white background for the frame
          firstPage.drawRectangle({
            x,
            y: adjustedY,
            width,
            height,
            color: { r: 0.984, g: 0.984, b: 0.968 }, // #FBFBF7 in RGB
          });
          
          // Draw the image centered in the frame
          firstPage.drawImage(image, {
            x: x + offsetX,
            y: adjustedY + offsetY,
            width: drawWidth,
            height: drawHeight,
          });
        } else {
          // Cover - fill the frame, may crop image
          const imgWidth = image.width;
          const imgHeight = image.height;
          const imgRatio = imgWidth / imgHeight;
          const frameRatio = width / height;
          
          // For PDF lib, we can't easily crop the source image
          // We'll use a different approach, scaling to the appropriate dimension
          if (imgRatio > frameRatio) {
            // Image is wider than frame - scale to height
            const scaleFactor = height / imgHeight;
            const scaledWidth = imgWidth * scaleFactor;
            const offsetX = (scaledWidth - width) / 2;
            
            firstPage.drawImage(image, {
              x: x - offsetX,
              y: adjustedY,
              width: scaledWidth,
              height,
            });
          } else {
            // Image is taller than frame - scale to width
            const scaleFactor = width / imgWidth;
            const scaledHeight = imgHeight * scaleFactor;
            const offsetY = (scaledHeight - height) / 2;
            
            firstPage.drawImage(image, {
              x,
              y: adjustedY - offsetY,
              width,
              height: scaledHeight,
            });
          }
        }
      }
      
      // Save the PDF
      const modifiedPdfBytes = await pdfDoc.save();
      
      // Create a download link
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'altare_moodboard_completed.pdf';
      link.click();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Box sx={{ p: 4, maxWidth: '1200px', mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', color: '#054697', fontFamily: 'Giaza, serif' }}>
        Altare Moodboard Template
      </Typography>
      
      {!pdfLoaded ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            p: 6, 
            border: '2px dashed #B8BDD7', 
            borderRadius: 0
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, color: '#054697' }}>
            Loading template...
          </Typography>
          <CircularProgress sx={{ color: '#054697' }} />
        </Box>
      ) : pdfBytes ? (
        <Box>
          <Paper 
            elevation={0} 
            sx={{ 
              position: 'relative', 
              mb: 3, 
              border: '1px solid #B8BDD7', 
              borderRadius: 0,
              overflow: 'visible', 
              maxHeight: 'none',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 'fit-content',
              margin: '0 auto'
            }}
          >
            <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto' }} />
            
            {/* Clickable areas */}
            {IMAGE_COORDINATES.map((coords) => (
              <Box
                key={coords.id}
                sx={{
                  position: 'absolute',
                  left: `${coords.x * pdfScale}px`,
                  top: `${(canvasRef.current?.height ?? 0) - ((coords.y + coords.height) * pdfScale)}px`,
                  width: `${coords.width * pdfScale}px`,
                  height: `${coords.height * pdfScale}px`,
                  cursor: 'pointer',
                  border: replacementImages[coords.id] 
                    ? '2px solid #FFE8E4' 
                    : '1px solid #B8BDD7',
                  '&:hover': {
                    border: '2px solid #054697'
                  },
                  transition: 'all 0.2s'
                }}
                onClick={() => handleAreaClick(coords)}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    inset: 0, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'rgba(0, 0, 0, 0)',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <Typography 
                    sx={{ 
                      color: 'white', 
                      fontWeight: 'bold', 
                      opacity: 0,
                      '&:hover': { opacity: 1 },
                      textAlign: 'center',
                      px: 1,
                      textShadow: '0 0 4px rgba(0,0,0,0.7)'
                    }}
                  >
                    {replacementImages[coords.id] ? 'Replace' : 'Add'} Image
                    <br />
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      {coords.name}
                    </Typography>
                  </Typography>
                  
                  {replacementImages[coords.id] && (
                    <Button
                      onClick={(e) => handleResetImage(e, coords.id)}
                      size="small"
                      sx={{ 
                        mt: 1, 
                        opacity: 0, 
                        bgcolor: '#FFE8E4',
                        color: '#054697',
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 500,
                        borderRadius: 0,
                        '&:hover': {
                          opacity: 1,
                          bgcolor: '#FFD5CC'
                        }
                      }}
                    >
                      Reset
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </Paper>
          
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3, 
              bgcolor: 'white', 
              borderRadius: 0,
              border: '1px solid #B8BDD7'
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 1, color: '#054697', fontWeight: 'bold' }}>
                  Image Fit Style:
                </Typography>
                <FormControl>
                  <RadioGroup
                    row
                    value={imageStyle}
                    onChange={(e) => handleStyleChange(e.target.value as ImageStyle)}
                  >
                    <FormControlLabel
                      value="contain"
                      control={<Radio sx={{ color: '#054697', '&.Mui-checked': { color: '#054697' } }} />}
                      label={<Typography sx={{ color: '#054697', opacity: 0.8 }}>Fit entire image (no stretch)</Typography>}
                    />
                    
                    <FormControlLabel
                      value="cover"
                      control={<Radio sx={{ color: '#054697', '&.Mui-checked': { color: '#054697' } }} />}
                      label={<Typography sx={{ color: '#054697', opacity: 0.8 }}>Fill frame (may crop)</Typography>}
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
              
              <Button
                onClick={generateFinalPDF}
                disabled={Object.keys(replacementImages).length === 0 || isGenerating}
                sx={{
                  px: 3,
                  py: 1.5,
                  bgcolor: '#FFE8E4',
                  color: '#054697',
                  borderRadius: 0,
                  textTransform: 'uppercase',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500,
                  '&:hover': {
                    bgcolor: '#FFD5CC'
                  },
                  '&.Mui-disabled': {
                    bgcolor: '#f0f0f0',
                    color: '#999999'
                  }
                }}
                startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isGenerating ? 'Generating PDF...' : 'Generate Final PDF'}
              </Button>
            </Box>
          </Paper>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {IMAGE_COORDINATES.map((coords) => (
              <Grid item xs={6} sm={4} md={3} key={coords.id}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 0,
                    border: replacementImages[coords.id]
                      ? '1px solid #FFE8E4'
                      : '1px solid #B8BDD7',
                    bgcolor: replacementImages[coords.id]
                      ? 'rgba(255, 232, 228, 0.1)'
                      : '#FBFBF7'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: '#054697', fontWeight: 'bold' }}>
                      {coords.name}
                    </Typography>
                    <Box 
                      sx={{ 
                        px: 1, 
                        py: 0.5, 
                        bgcolor: replacementImages[coords.id] ? '#FFE8E4' : '#B8BDD7',
                        color: '#054697',
                        fontSize: '0.7rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {replacementImages[coords.id] ? 'Added' : 'Needed'}
                    </Box>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      height: '100px', 
                      bgcolor: 'white', 
                      borderRadius: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #B8BDD7',
                      overflow: 'hidden'
                    }}
                    onClick={() => handleAreaClick(coords)}
                  >
                    {replacementImages[coords.id] ? (
                      <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                        <img 
                          src={replacementImages[coords.id].url} 
                          alt={coords.name}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }}
                        />
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            inset: 0, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            bgcolor: 'rgba(0, 0, 0, 0)',
                            opacity: 0,
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.3)',
                              opacity: 1
                            }
                          }}
                        >
                          <Button
                            size="small"
                            sx={{ 
                              mr: 1,
                              bgcolor: '#FFE8E4',
                              color: '#054697',
                              fontSize: '0.7rem',
                              borderRadius: 0,
                              '&:hover': {
                                bgcolor: '#FFD5CC'
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAreaClick(coords);
                            }}
                          >
                            Change
                          </Button>
                          <Button
                            size="small"
                            sx={{ 
                              bgcolor: '#054697',
                              color: 'white',
                              fontSize: '0.7rem',
                              borderRadius: 0,
                              '&:hover': {
                                bgcolor: '#043d82'
                              }
                            }}
                            onClick={(e) => handleResetImage(e, coords.id)}
                          >
                            Remove
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography sx={{ color: '#054697', opacity: 0.6, fontSize: '0.9rem' }}>
                        Click to add
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Box 
          sx={{ 
            textAlign: 'center', 
            p: 6, 
            border: '2px dashed #B8BDD7', 
            borderRadius: 0
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, color: '#054697' }}>
            No template loaded.
          </Typography>
        </Box>
      )}
      
      {/* Hidden file input for image uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        style={{ display: 'none' }}
        accept="image/*"
      />
      
      {/* For demo purposes, allow uploading a different template */}
      <Paper 
        elevation={0} 
        sx={{ 
          mt: 4, 
          p: 3, 
          bgcolor: '#FBFBF7', 
          borderRadius: 0,
          border: '1px solid #B8BDD7'
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, color: '#054697', fontWeight: 'bold' }}>
          Advanced Options:
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#054697', opacity: 0.8 }}>
          If you have a different template, you can upload it here:
        </Typography>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleTemplateUpload}
          style={{ 
            color: '#054697', 
            fontSize: '0.9rem',
            fontFamily: 'Poppins, sans-serif'
          }}
        />
      </Paper>
    </Box>
  );
};

export default WeddingPDFImageReplacer;
