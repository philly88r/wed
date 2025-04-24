import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { Box, Typography, Button, Radio, RadioGroup, FormControlLabel, FormControl, Paper, Grid, CircularProgress } from '@mui/material';

// Configure PDF.js worker
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
  { id: 'living-room', page: 0, x: 55.77258113727666, y: 677.7864475250244, width: 157.87764650836357, height: 120, name: 'Living Room' },
  { id: 'record-player', page: 0, x: 240, y: 650, width: 160, height: 120, name: 'Record Player Area' },
  { id: 'studio-light', page: 0, x: 410, y: 650, width: 160, height: 120, name: 'Studio Light' },
  { id: 'fashion', page: 0, x: 70, y: 250, width: 230, height: 300, name: 'Fashion Photo' },
  { id: 'wood-panel', page: 0, x: 310, y: 250, width: 260, height: 300, name: 'Wood Panel Room' },
  { id: 'art-shelf', page: 0, x: 310, y: 180, width: 60, height: 60, name: 'Art Shelf' },
  { id: 'decor1', page: 0, x: 380, y: 180, width: 60, height: 60, name: 'Decor 1' },
  { id: 'decor2', page: 0, x: 450, y: 180, width: 60, height: 60, name: 'Decor 2' },
];

const WeddingPDFImageReplacer: React.FC = () => {
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pdfRendered, setPdfRendered] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<ImageCoordinates | null>(null);
  const [replacementImages, setReplacementImages] = useState<ReplacementImages>({});
  const [imageStyle, setImageStyle] = useState<ImageStyle>('contain');
  const [pdfScale, setPdfScale] = useState<number>(1.0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [pdfLoaded, setPdfLoaded] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const draggedItemRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [editableCoordinates, setEditableCoordinates] = useState<ImageCoordinates[]>([...IMAGE_COORDINATES]);
  const resizingRef = useRef<boolean>(false);
  const resizeDirectionRef = useRef<string | null>(null);
  const resizeStartPosRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const resizeItemRef = useRef<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const templatePdfRef = useRef<pdfjs.PDFDocumentProxy | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Load the template PDF on component mount
  useEffect(() => {
    const loadTemplatePDF = async (): Promise<void> => {
      try {
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
        setPdfLoaded(true);
      } catch (error) {
        console.error('Error loading template PDF:', error);
        alert('Error loading the Altare moodboard template. Please try again.');
        setPdfLoaded(true);
      }
    };
    
    loadTemplatePDF();
  }, []);
  
  // Render the PDF once the canvas is available
  useEffect(() => {
    if (pdfBytes) {
      const timer = setTimeout(() => {
        if (canvasRef.current) {
          console.log('Canvas is ready, rendering PDF...');
          renderPDF(pdfBytes);
        } else {
          console.log('Canvas still not available after delay');
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [pdfBytes]);
  
  // Function to render the PDF
  const renderPDF = async (pdfData: ArrayBuffer): Promise<void> => {
    try {
      const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
      templatePdfRef.current = pdf;
      console.log('PDF document loaded successfully with', pdf.numPages, 'pages');
      
      // Get first page
      const page = await pdf.getPage(1);
      console.log('PDF page loaded successfully');
      
      // Set a fixed scale to match the expected dimensions (567 x 850.5)
      const targetWidth = 567;
      const originalViewport = page.getViewport({ scale: 1.0 });
      const fixedScale = targetWidth / originalViewport.width;
      const viewport = page.getViewport({ scale: fixedScale });
      console.log('PDF viewport created with dimensions:', viewport.width, 'x', viewport.height);
      
      // Get the canvas element and set its dimensions
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('Canvas element not found');
        return;
      }
      
      // Set explicit dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      console.log('Canvas dimensions set to:', canvas.width, 'x', canvas.height);
      
      // Get the rendering context
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Could not get canvas context');
        return;
      }
      
      // Clear the canvas before rendering
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set up the rendering context
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      
      console.log('Starting PDF rendering...');
      
      // Render the PDF page
      await page.render(renderContext).promise;
      console.log('PDF rendered successfully');
      
      // Update state to indicate rendering is complete
      setPdfRendered(true);
      setPdfScale(fixedScale);
      
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
  
  // Toggle edit mode
  const toggleEditMode = (): void => {
    setEditMode(prev => !prev);
    if (editMode) {
      // Exiting edit mode - clean up any event listeners
      document.removeEventListener('mousemove', handleMouseMoveGlobalRef);
      document.removeEventListener('mouseup', handleMouseUpGlobalRef);
      document.removeEventListener('mousemove', handleResizeMoveGlobalRef);
      document.removeEventListener('mouseup', handleResizeUpGlobalRef);
    } else {
      // Entering edit mode - reset to editable coordinates
      setEditableCoordinates([...IMAGE_COORDINATES]);
    }
  };
  
  // Save the current coordinates
  const saveCoordinates = (): void => {
    console.log('Saving coordinates:', editableCoordinates);
    alert('Coordinates saved to console! Check developer tools and copy the new coordinates.');
    setEditMode(false);
  };

  // Handle resize start with direct DOM manipulation
  const handleResizeStart = (e: React.MouseEvent, id: string, direction: string): void => {
    if (!editMode) return;
    
    // Prevent event propagation to avoid triggering drag
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`Resize started: ${id}, direction: ${direction}`);
    
    // Get the element being resized
    const element = e.currentTarget.parentElement;
    if (!element) return;
    
    // Set resize state
    resizingRef.current = true;
    resizeItemRef.current = id;
    resizeDirectionRef.current = direction;
    resizeStartPosRef.current = { x: e.clientX, y: e.clientY };
    
    // Store initial element dimensions
    const item = editableCoordinates.find(coord => coord.id === id);
    if (!item) return;
    
    // Cancel any ongoing drag operation
    if (draggedItemRef.current) {
      draggedItemRef.current = null;
      setDraggedItem(null);
    }
    
    // Add event listeners for mouse move and mouse up
    document.addEventListener('mousemove', handleResizeMoveGlobalRef);
    document.addEventListener('mouseup', handleResizeUpGlobalRef);
  };

  // Ultra-simple resize handler based on TableEditor approach
  const handleResizeMoveGlobalRef = (e: MouseEvent): void => {
    if (!resizingRef.current || !resizeItemRef.current || !resizeDirectionRef.current || !canvasRef.current) return;

    // Find the item in our state
    const itemIndex = editableCoordinates.findIndex(coord => coord.id === resizeItemRef.current);
    if (itemIndex === -1) return;
    
    const item = { ...editableCoordinates[itemIndex] };
    const newCoordinates = [...editableCoordinates];
    
    // Get canvas dimensions for scaling
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    
    // Calculate mouse movement in screen pixels
    const deltaX = e.clientX - resizeStartPosRef.current.x;
    const deltaY = e.clientY - resizeStartPosRef.current.y;
    
    // Calculate scaling factor to convert screen pixels to PDF units
    const scaleX = canvas.width / canvasRect.width / pdfScale;
    const scaleY = canvas.height / canvasRect.height / pdfScale;
    
    // Convert screen deltas to PDF coordinate deltas
    const pdfDeltaX = deltaX * scaleX;
    const pdfDeltaY = deltaY * scaleY;
    
    // Apply resize based on handle direction
    switch (resizeDirectionRef.current) {
      case 'e': // Right edge
        newCoordinates[itemIndex] = {
          ...item,
          width: item.width + pdfDeltaX
        };
        break;
        
      case 'w': // Left edge
        newCoordinates[itemIndex] = {
          ...item,
          x: item.x + pdfDeltaX,
          width: item.width - pdfDeltaX
        };
        break;
        
      case 's': // Bottom edge
        newCoordinates[itemIndex] = {
          ...item,
          height: item.height - pdfDeltaY
        };
        break;
        
      case 'n': // Top edge
        newCoordinates[itemIndex] = {
          ...item,
          y: item.y - pdfDeltaY,
          height: item.height + pdfDeltaY
        };
        break;
        
      case 'se': // Bottom-right corner
        newCoordinates[itemIndex] = {
          ...item,
          width: item.width + pdfDeltaX,
          height: item.height - pdfDeltaY
        };
        break;
        
      case 'sw': // Bottom-left corner
        newCoordinates[itemIndex] = {
          ...item,
          x: item.x + pdfDeltaX,
          width: item.width - pdfDeltaX,
          height: item.height - pdfDeltaY
        };
        break;
        
      case 'ne': // Top-right corner
        newCoordinates[itemIndex] = {
          ...item,
          y: item.y - pdfDeltaY,
          width: item.width + pdfDeltaX,
          height: item.height + pdfDeltaY
        };
        break;
        
      case 'nw': // Top-left corner
        newCoordinates[itemIndex] = {
          ...item,
          x: item.x + pdfDeltaX,
          y: item.y - pdfDeltaY,
          width: item.width - pdfDeltaX,
          height: item.height + pdfDeltaY
        };
        break;
    }
    
    // Update state with new coordinates
    setEditableCoordinates(newCoordinates);
    
    // Update start position for next move
    resizeStartPosRef.current = { x: e.clientX, y: e.clientY };
  };

  // Clean up resize listeners
  const handleResizeUpGlobalRef = (): void => {
    resizingRef.current = false;
    resizeItemRef.current = null;
    resizeDirectionRef.current = null;
    document.removeEventListener('mousemove', handleResizeMoveGlobalRef);
    document.removeEventListener('mouseup', handleResizeUpGlobalRef);
  };

  // Handle mouse down for dragging in edit mode
  const handleMouseDown = (e: React.MouseEvent, id: string): void => {
    if (!editMode || resizingRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Find the element being dragged
    const element = editableCoordinates.find(coord => coord.id === id);
    if (!element) return;
    
    // Calculate the offset from the mouse position to the element's top-left corner
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    draggedItemRef.current = id;
    dragOffsetRef.current = { x: offsetX, y: offsetY };
    setDraggedItem(id);
    
    // Add event listeners for mouse move and mouse up
    document.addEventListener('mousemove', handleMouseMoveGlobalRef);
    document.addEventListener('mouseup', handleMouseUpGlobalRef);
  };
  
  // Improved smooth drag handler similar to TableEditor
  const handleMouseMoveGlobalRef = (e: MouseEvent): void => {
    if (!draggedItemRef.current || !canvasRef.current) return;
    
    // Get canvas dimensions and position
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    
    // Get the element being dragged to ensure we have its dimensions
    const draggedElement = editableCoordinates.find(coord => coord.id === draggedItemRef.current);
    if (!draggedElement) return;

    // Find the element in the DOM
    const elements = document.querySelectorAll(`[data-id="${draggedItemRef.current}"]`);
    if (elements.length === 0) return;
    
    const element = elements[0] as HTMLElement;
    
    // Calculate new position in screen coordinates with smooth movement
    const newScreenX = e.clientX - canvasRect.left - dragOffsetRef.current.x;
    const newScreenY = e.clientY - canvasRect.top - dragOffsetRef.current.y;
    
    // Ensure we don't go outside the canvas
    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;
    const boundedX = Math.max(0, Math.min(canvasRect.width - elementWidth, newScreenX));
    const boundedY = Math.max(0, Math.min(canvasRect.height - elementHeight, newScreenY));
    
    // Convert screen coordinates to PDF coordinates
    const scaleFactorX = canvas.width / canvasRect.width;
    const scaleFactorY = canvas.height / canvasRect.height;
    
    // Calculate PDF coordinates
    const pdfX = (boundedX * scaleFactorX) / pdfScale;
    const pdfY = (canvas.height - ((boundedY + elementHeight) * scaleFactorY)) / pdfScale;
    
    // Update coordinates with immediate feedback
    setEditableCoordinates(prev => {
      return prev.map(coord => {
        if (coord.id === draggedItemRef.current) {
          return { ...coord, x: pdfX, y: pdfY };
        }
        return coord;
      });
    });
  };

  // Clean up drag listeners
  const handleMouseUpGlobalRef = (): void => {
    draggedItemRef.current = null;
    setDraggedItem(null);
    document.removeEventListener('mousemove', handleMouseMoveGlobalRef);
    document.removeEventListener('mouseup', handleMouseUpGlobalRef);
  };

  // This function is no longer used as we're using handleMouseUpGlobalRef instead
  
  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobalRef);
      document.removeEventListener('mouseup', handleMouseUpGlobalRef);
      document.removeEventListener('mousemove', handleResizeMoveGlobalRef);
      document.removeEventListener('mouseup', handleResizeUpGlobalRef);
    };
  }, []);
  
  // Handle clicking on an image area
  const handleAreaClick = (coords: ImageCoordinates): void => {
    if (editMode) {
      // In edit mode, don't open file selector
      return;
    }
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
      [coords.id]: {
        file,
        url: imageUrl,
        coords
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
    
    console.log('Drawing replacement images on canvas with dimensions:', canvas.width, 'x', canvas.height);
    
    Object.values(replacementImages).forEach(replacement => {
      const img = new Image();
      img.onload = () => {
        const { coords } = replacement;
        const { x, y, width, height } = coords;
        console.log('Processing image:', coords.name, 'with coords:', { x, y, width, height });
        
        // Calculate the canvas-to-PDF ratio
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Get PDF dimensions from the viewport
        const pdfWidth = canvasWidth / pdfScale;
        const pdfHeight = canvasHeight / pdfScale;
        
        // Calculate position based on PDF coordinates and canvas dimensions
        const scaledX = (x / pdfWidth) * canvasWidth;
        const scaledY = ((pdfHeight - y - height) / pdfHeight) * canvasHeight;
        const scaledWidth = (width / pdfWidth) * canvasWidth;
        const scaledHeight = (height / pdfHeight) * canvasHeight;
        
        console.log('Calculated scaled coordinates:', { scaledX, scaledY, scaledWidth, scaledHeight });
        
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
      console.log('Starting PDF generation...');
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(pdfBytes);
      console.log('PDF document loaded successfully');
      
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      console.log('Got first page from PDF');
      
      // Process each replacement image
      for (const replacement of Object.values(replacementImages)) {
        const { file, coords } = replacement;
        console.log('Processing image for', coords.name);
        
        const imageBytes = await file.arrayBuffer();
        console.log('Image loaded as array buffer, size:', imageBytes.byteLength);
        
        // Embed the image based on type
        let image;
        try {
          if (file.type === 'image/jpeg' || file.type.includes('jpg')) {
            image = await pdfDoc.embedJpg(imageBytes);
            console.log('Embedded JPEG image');
          } else if (file.type === 'image/png') {
            image = await pdfDoc.embedPng(imageBytes);
            console.log('Embedded PNG image');
          } else {
            console.error('Unsupported image type:', file.type);
            continue;
          }
        } catch (embedError) {
          console.error('Error embedding image:', embedError);
          continue;
        }
        
        // Calculate dimensions based on fitting style
        const { x, y, width, height } = coords;
        
        // PDF coordinates start from bottom-left
        // y needs to be adjusted from the bottom of the page
        const pdfHeight = firstPage.getHeight();
        const adjustedY = pdfHeight - y - height;
        console.log('Adjusted coordinates:', { x, y: adjustedY, width, height });
        
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
          
          console.log('Drawing image with contain style');
          
          try {
            // Skip drawing the background rectangle to avoid color issues
            // Just draw the image directly
            firstPage.drawImage(image, {
              x: x + offsetX,
              y: adjustedY + offsetY,
              width: drawWidth,
              height: drawHeight,
            });
            console.log('Image drawn successfully');
          } catch (drawError) {
            console.error('Error drawing image:', drawError);
          }
        } else {
          // Cover - fill the frame, may crop image
          const imgWidth = image.width;
          const imgHeight = image.height;
          const imgRatio = imgWidth / imgHeight;
          const frameRatio = width / height;
          
          console.log('Drawing image with cover style');
          
          try {
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
            console.log('Image drawn successfully');
          } catch (drawError) {
            console.error('Error drawing image:', drawError);
          }
        }
      }
      
      console.log('All images processed, saving PDF...');
      
      try {
        // Save the PDF
        const modifiedPdfBytes = await pdfDoc.save();
        console.log('PDF saved successfully, size:', modifiedPdfBytes.length);
        
        // Create a download link
        const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'altare_moodboard_completed.pdf';
        console.log('Initiating download...');
        link.click();
      } catch (saveError) {
        console.error('Error saving or downloading PDF:', saveError);
        alert('Error saving the PDF. Please try again.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Pick the first editable coordinate, or a default if empty
  const coords = (editMode ? editableCoordinates : IMAGE_COORDINATES)[0] || { id: 'single', x: 100, y: 100, width: 100, height: 100, name: 'Single' };

  return (
    <Box sx={{ p: 4, maxWidth: '1200px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#054697', fontFamily: 'Giaza, serif' }}>
          Altare Moodboard Template
        </Typography>
        <Box>
          <Button
            onClick={toggleEditMode}
            sx={{
              mr: 2,
              bgcolor: editMode ? '#FF5722' : '#FFE8E4',
              color: editMode ? 'white' : '#054697',
              '&:hover': {
                bgcolor: editMode ? '#E64A19' : '#FFD5CC',
              },
              borderRadius: 0,
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            {editMode ? 'Cancel Edit' : 'Edit Grid Layout'}
          </Button>
          {editMode && (
            <Button
              onClick={saveCoordinates}
              sx={{
                bgcolor: '#054697',
                color: 'white',
                '&:hover': {
                  bgcolor: '#043876',
                },
                borderRadius: 0,
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Save Layout
            </Button>
          )}
        </Box>
      </Box>
      
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
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Box 
            sx={{
              position: 'relative',
              mb: 3,
              border: '1px solid #B8BDD7',
              borderRadius: 0,
              display: 'inline-block',
              margin: '0 auto',
              padding: 0,
              backgroundColor: '#ffffff'
            }}
            ref={containerRef}
          >
            <canvas 
              id="pdfCanvas"
              ref={canvasRef} 
              style={{ 
                display: 'block', 
                margin: 0,
                border: '1px solid #FFE8E4',
                maxWidth: 'none',
                width: '100%',
                height: '800px'
              }} 
            />
            
            {/* Clickable area (single square for debugging) */}
            
              <Box
                key={coords.id}
                data-id={coords.id}
                sx={{
                  position: 'absolute',
                  left: `${(coords.x / (canvasRef.current?.width ?? 0) / pdfScale) * (canvasRef.current?.width ?? 0)}px`,
                  top: `${(canvasRef.current?.height ?? 0) - ((coords.y + coords.height) / (canvasRef.current?.height ?? 0) / pdfScale) * (canvasRef.current?.height ?? 0)}px`,
                  width: `${(coords.width / (canvasRef.current?.width ?? 0) / pdfScale) * (canvasRef.current?.width ?? 0)}px`,
                  height: `${(coords.height / (canvasRef.current?.height ?? 0) / pdfScale) * (canvasRef.current?.height ?? 0)}px`,
                  cursor: editMode ? 'move' : 'pointer',
                  border: editMode
                    ? '2px solid #FF5722'
                    : (replacementImages[coords.id] 
                      ? '2px solid #FFE8E4' 
                      : '1px solid #B8BDD7'),
                  '&:hover': {
                    border: editMode 
                      ? '2px solid #E64A19'
                      : '2px solid #054697'
                  },
                  zIndex: draggedItem === coords.id || resizeItemRef.current === coords.id ? 10 : 1,
                  pointerEvents: editMode ? 'auto' : 'auto',
                  transition: 'all 0.2s'
                }}
              onClick={(e) => {
                if (editMode) {
                  e.stopPropagation();
                } else {
                  handleAreaClick(coords);
                }
              }}
              onMouseDown={(e) => {
                // Only handle drag if we're not already resizing
                if (!resizingRef.current) {
                  handleMouseDown(e, coords.id);
                }
              }}
              >
                {/* Resize handles - only show in edit mode */}
                {editMode && (
                  <>
                    {/* Corner resize handles - enlarged and more visible */}
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: -8, 
                        left: -8, 
                        width: 16, 
                        height: 16, 
                        bgcolor: '#FF5722', 
                        cursor: 'nw-resize',
                        zIndex: 30,
                        border: '1px solid white',
                        '&:hover': {
                          transform: 'scale(1.2)',
                          bgcolor: '#E64A19'
                        }
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleResizeStart(e, coords.id, 'nw');
                      }}
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: -8, 
                        right: -8, 
                        width: 16, 
                        height: 16, 
                        bgcolor: '#FF5722', 
                        cursor: 'ne-resize',
                        zIndex: 30,
                        border: '1px solid white',
                        '&:hover': {
                          transform: 'scale(1.2)',
                          bgcolor: '#E64A19'
                        }
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleResizeStart(e, coords.id, 'ne');
                      }}
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        bottom: -8, 
                        right: -8, 
                        width: 16, 
                        height: 16, 
                        bgcolor: '#FF5722', 
                        cursor: 'se-resize',
                        zIndex: 30,
                        border: '1px solid white',
                        '&:hover': {
                          transform: 'scale(1.2)',
                          bgcolor: '#E64A19'
                        }
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleResizeStart(e, coords.id, 'se');
                      }}
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        bottom: -8, 
                        left: -8, 
                        width: 16, 
                        height: 16, 
                        bgcolor: '#FF5722', 
                        cursor: 'sw-resize',
                        zIndex: 30,
                        border: '1px solid white',
                        '&:hover': {
                          transform: 'scale(1.2)',
                          bgcolor: '#E64A19'
                        }
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleResizeStart(e, coords.id, 'sw');
                      }}
                    />
                    
                    {/* Edge resize handles - enlarged and more visible */}
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: -8, 
                        left: 'calc(50% - 8px)', 
                        width: 16, 
                        height: 16, 
                        bgcolor: '#FF5722', 
                        cursor: 'n-resize',
                        zIndex: 30,
                        border: '1px solid white',
                        '&:hover': {
                          transform: 'scale(1.2)',
                          bgcolor: '#E64A19'
                        }
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleResizeStart(e, coords.id, 'n');
                      }}
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        right: -8, 
                        top: 'calc(50% - 8px)', 
                        width: 16, 
                        height: 16, 
                        bgcolor: '#FF5722', 
                        cursor: 'e-resize',
                        zIndex: 30,
                        border: '1px solid white',
                        '&:hover': {
                          transform: 'scale(1.2)',
                          bgcolor: '#E64A19'
                        }
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleResizeStart(e, coords.id, 'e');
                      }}
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        bottom: -8, 
                        left: 'calc(50% - 8px)', 
                        width: 16, 
                        height: 16, 
                        bgcolor: '#FF5722', 
                        cursor: 's-resize',
                        zIndex: 30,
                        border: '1px solid white',
                        '&:hover': {
                          transform: 'scale(1.2)',
                          bgcolor: '#E64A19'
                        }
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleResizeStart(e, coords.id, 's');
                      }}
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        left: -8, 
                        top: 'calc(50% - 8px)', 
                        width: 16, 
                        height: 16, 
                        bgcolor: '#FF5722', 
                        cursor: 'w-resize',
                        zIndex: 30,
                        border: '1px solid white',
                        '&:hover': {
                          transform: 'scale(1.2)',
                          bgcolor: '#E64A19'
                        }
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleResizeStart(e, coords.id, 'w');
                      }}
                    />
                  </>
                )}
                <Box 
                  sx={(theme) => ({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: theme.palette.accent.nude,
  '&:hover': {
    bgcolor: theme.palette.accent.rose,
  },
})}
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
                    <Typography variant="caption" sx={{ display: 'block', fontSize: '0.6rem' }}>
                      x:{coords.x} y:{coords.y} w:{coords.width} h:{coords.height}
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
          </Box>
          
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
                            bgcolor: theme => theme.palette.accent.nude,
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