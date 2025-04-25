import React, { useRef, useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { motion } from 'framer-motion';

interface ImagePosition {
  x: number;
  y: number;
  scale: number;
}

const PdfLibDemo: React.FC = () => {
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ data: Uint8Array; type: string } | null>(null);
  const [imagePosition, setImagePosition] = useState<ImagePosition>({ x: 334, y: 124, scale: 0.5 });
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [pdfName, setPdfName] = useState<string>('');
  
  // Handle PDF upload
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setPdfName(file.name);
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF
    const loadedPdfDoc = await PDFDocument.load(arrayBuffer);
    setPdfDoc(loadedPdfDoc);
    
    // Get page dimensions for accurate preview
    const pages = loadedPdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    setPdfDimensions({ width, height });
    console.log('PDF dimensions loaded:', width, height);
    
    // Create preview
    const previewBytes = await loadedPdfDoc.save();
    
    // Create preview URL
    const blob = new Blob([previewBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
  };
  
  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const imageArrayBuffer = await file.arrayBuffer();
    const imageData = new Uint8Array(imageArrayBuffer);
    
    // Determine image type
    const imageType = file.type.includes('png') ? 'png' : 'jpeg';
    
    setSelectedImage({ data: imageData, type: imageType });
    
    // Log for debugging
    console.log('Image uploaded:', file.name, 'Type:', imageType, 'Size:', imageData.length);
  };
  
  // Handle position changes
  const handlePositionChange = (property: keyof ImagePosition, value: number) => {
    setImagePosition(prev => ({ ...prev, [property]: value }));
  };
  
  // State to store PDF page dimensions for accurate preview
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number } | null>(null);

  // Apply image to PDF and download
  const applyImageAndDownload = async () => {
    if (!pdfDoc || !selectedImage) {
      console.error('Missing PDF or image:', { pdfDoc: !!pdfDoc, selectedImage: !!selectedImage });
      return;
    }
    
    try {
      // Clone the PDF document to avoid modifying the original
      const modifiedPdfDoc = await PDFDocument.load(await pdfDoc.save());
      console.log('PDF document cloned successfully');
      
      // Embed the image
      let image;
      try {
        if (selectedImage.type === 'png') {
          console.log('Embedding PNG image, size:', selectedImage.data.length);
          image = await modifiedPdfDoc.embedPng(selectedImage.data);
        } else {
          console.log('Embedding JPG image, size:', selectedImage.data.length);
          image = await modifiedPdfDoc.embedJpg(selectedImage.data);
        }
        console.log('Image embedded successfully');
      } catch (embedError) {
        console.error('Error embedding image:', embedError);
        alert('Error embedding image. Please try a different image format.');
        return;
      }
      
      // Get the first page
      const pages = modifiedPdfDoc.getPages();
      const firstPage = pages[0];
      
      // Get page dimensions
      const { width: pageWidth, height: pageHeight } = firstPage.getSize();
      
      // Scale the image while preserving aspect ratio
      const imageDims = image.scale(imagePosition.scale);
      
      console.log('Page dimensions:', pageWidth, pageHeight);
      console.log('Image dimensions after scaling:', imageDims.width, imageDims.height);
      console.log('Placing image at:', imagePosition.x, imagePosition.y);
      
      // Calculate the actual position based on PDF coordinates
      // PDF uses bottom-left origin, our UI uses top-left origin
      const pdfX = imagePosition.x;
      const pdfY = pageHeight - imagePosition.y - imageDims.height;
      
      console.log('PDF coordinates:', pdfX, pdfY);
      
      // Draw the image on the page
      firstPage.drawImage(image, {
        x: pdfX,
        y: pdfY,
        width: imageDims.width,
        height: imageDims.height,
        opacity: 1.0, // Ensure full opacity
      });
      
      // Save and trigger download
      const modifiedPdfBytes = await modifiedPdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `edited_${pdfName || 'document.pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('PDF successfully created with your image! Check your downloads folder.');
    } catch (error) {
      console.error('Error applying image to PDF:', error);
      alert('There was an error adding your image to the PDF. Please try again.');
    }
  };
  
  // Calculate the preview scaling factor
  const getPreviewScaling = () => {
    if (!pdfDimensions) return 1;
    
    // Get the iframe container dimensions
    const previewContainer = document.querySelector('.pdf-preview-container');
    if (!previewContainer) return 1;
    
    const containerWidth = previewContainer.clientWidth - 16; // Account for padding
    const containerHeight = previewContainer.clientHeight - 16;
    
    // Calculate scaling factors
    const scaleX = containerWidth / pdfDimensions.width;
    const scaleY = containerHeight / pdfDimensions.height;
    
    // Use the smaller scaling factor to ensure the entire PDF fits
    return Math.min(scaleX, scaleY);
  };
  
  // Clean up URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);
  
  // Update preview when PDF dimensions change
  useEffect(() => {
    if (pdfDimensions) {
      console.log('PDF dimensions for preview scaling:', pdfDimensions);
    }
  }, [pdfDimensions]);
  
  const buttonStyle = {
    background: '#FFE8E4',
    color: '#054697',
    border: '1px solid #B8BDD7',
    borderRadius: 6,
    padding: '12px 20px',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Poppins, sans-serif',
    transition: 'background 0.2s',
    margin: '0 8px 8px 0',
  };
  
  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #B8BDD7',
    borderRadius: 4,
    marginBottom: 8,
    color: '#054697',
  };

  return (
    <div style={{ padding: 32, fontFamily: 'Poppins, sans-serif', background: '#FFF', maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ color: '#054697' }}>PDF Image Editor</h1>
      <p style={{ color: 'rgba(5, 70, 151, 0.8)' }}>
        Upload a PDF and add images on top using <b>pdf-lib</b>.
      </p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
        <div style={{ flex: '1 1 300px' }}>
          <h2 style={{ color: '#054697', fontSize: 20 }}>1. Upload PDF</h2>
          <input
            type="file"
            accept="application/pdf"
            ref={pdfInputRef}
            style={{ display: 'none' }}
            onChange={handlePdfUpload}
          />
          <button
            onClick={() => pdfInputRef.current?.click()}
            style={buttonStyle}
            onMouseOver={e => (e.currentTarget.style.background = '#FFD5CC')}
            onMouseOut={e => (e.currentTarget.style.background = '#FFE8E4')}
          >
            Select PDF
          </button>
          {pdfName && <p style={{ color: 'rgba(5, 70, 151, 0.8)' }}>Selected: {pdfName}</p>}
          
          <h2 style={{ color: '#054697', fontSize: 20, marginTop: 24 }}>2. Add Image</h2>
          <input
            type="file"
            accept="image/png,image/jpeg"
            ref={imageInputRef}
            style={{ display: 'none' }}
            onChange={handleImageUpload}
            disabled={!pdfDoc}
          />
          <button
            onClick={() => imageInputRef.current?.click()}
            style={{
              ...buttonStyle,
              opacity: pdfDoc ? 1 : 0.5,
              cursor: pdfDoc ? 'pointer' : 'not-allowed',
            }}
            disabled={!pdfDoc}
            onMouseOver={e => pdfDoc && (e.currentTarget.style.background = '#FFD5CC')}
            onMouseOut={e => pdfDoc && (e.currentTarget.style.background = '#FFE8E4')}
          >
            Select Image
          </button>
          {selectedImage && <p style={{ color: 'rgba(5, 70, 151, 0.8)' }}>Image selected!</p>}
          
          {selectedImage && (
            <div>
              <h2 style={{ color: '#054697', fontSize: 20, marginTop: 24 }}>3. Position Image</h2>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', color: 'rgba(5, 70, 151, 0.8)', marginBottom: 4 }}>
                  X Position (from left):
                </label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={imagePosition.x}
                  onChange={(e) => handlePositionChange('x', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
                <input
                  type="number"
                  value={imagePosition.x}
                  onChange={(e) => handlePositionChange('x', parseInt(e.target.value) || 0)}
                  style={inputStyle}
                />
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', color: 'rgba(5, 70, 151, 0.8)', marginBottom: 4 }}>
                  Y Position (from top):
                </label>
                <input
                  type="range"
                  min="0"
                  max="800"
                  value={imagePosition.y}
                  onChange={(e) => handlePositionChange('y', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
                <input
                  type="number"
                  value={imagePosition.y}
                  onChange={(e) => handlePositionChange('y', parseInt(e.target.value) || 0)}
                  style={inputStyle}
                />
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', color: 'rgba(5, 70, 151, 0.8)', marginBottom: 4 }}>
                  Scale:
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={imagePosition.scale}
                  onChange={(e) => handlePositionChange('scale', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={imagePosition.scale}
                  onChange={(e) => handlePositionChange('scale', parseFloat(e.target.value) || 0.5)}
                  style={inputStyle}
                />
              </div>
              
              <button
                onClick={applyImageAndDownload}
                style={{
                  ...buttonStyle,
                  background: '#054697',
                  color: '#FFFFFF',
                  padding: '14px 28px',
                  fontSize: 18,
                  marginTop: 16,
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#043d82')}
                onMouseOut={e => (e.currentTarget.style.background = '#054697')}
              >
                Apply Image & Download PDF
              </button>
            </div>
          )}
        </div>
        
        <div style={{ flex: '1 1 500px' }}>
          <h2 style={{ color: '#054697', fontSize: 20 }}>Preview</h2>
          {previewUrl ? (
            <div 
              className="pdf-preview-container"
              style={{ 
                position: 'relative', 
                border: '1px solid #B8BDD7', 
                borderRadius: 6, 
                padding: 8, 
                height: 600, 
                overflow: 'hidden' 
              }}
            >
              <iframe 
                src={previewUrl} 
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="PDF Preview"
              />
              
              {/* Visual indicator for image placement */}
              {selectedImage && pdfDimensions && (
                <motion.div 
                  drag
                  dragMomentum={false}
                  dragConstraints={{
                    top: 0,
                    left: 0,
                    right: 500,
                    bottom: 500
                  }}
                  onDrag={(_, info) => {
                    // Update position in real-time during drag
                    const newX = Math.max(0, imagePosition.x + info.delta.x);
                    const newY = Math.max(0, imagePosition.y + info.delta.y);
                    setImagePosition(prev => ({
                      ...prev,
                      x: newX,
                      y: newY
                    }));
                  }}
                  // Reset drag state after drag ends
                  onDragEnd={() => {}}
                  style={{
                    position: 'absolute',
                    top: `${imagePosition.y}px`,
                    left: `${imagePosition.x}px`,
                    width: `${150 * imagePosition.scale * getPreviewScaling()}px`,
                    height: `${150 * imagePosition.scale * getPreviewScaling()}px`,
                    border: '2px dashed #054697',
                    backgroundColor: 'rgba(5, 70, 151, 0.2)',
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#054697',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    zIndex: 1000, // Ensure it appears on top
                    transformOrigin: 'top left',
                  }}
                  whileDrag={{ cursor: 'grabbing', opacity: 0.8 }}
                >
                  <div style={{ pointerEvents: 'none' }}>Drag to position</div>
                </motion.div>
              )}
            </div>
          ) : (
            <div 
              style={{ 
                border: '1px solid #B8BDD7', 
                borderRadius: 6, 
                padding: 8, 
                height: 600, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                color: 'rgba(5, 70, 151, 0.8)'
              }}
            >
              Upload a PDF to see preview
            </div>
          )}
          <p style={{ color: 'rgba(5, 70, 151, 0.8)', fontSize: 14, marginTop: 8 }}>
            <strong>Important:</strong> The preview shows an approximate position. The actual placement in the PDF may vary slightly depending on the PDF dimensions.
          </p>
          <p style={{ color: '#054697', fontSize: 14, marginTop: 4 }}>
            <strong>Tip:</strong> You can now drag the image directly on the preview to position it precisely.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PdfLibDemo;
