import React, { useRef, useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';

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
  const [imagePosition, setImagePosition] = useState<ImagePosition>({ x: 100, y: 100, scale: 0.5 });
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
  };
  
  // Handle position changes
  const handlePositionChange = (property: keyof ImagePosition, value: number) => {
    setImagePosition(prev => ({ ...prev, [property]: value }));
  };
  
  // Apply image to PDF and download
  const applyImageAndDownload = async () => {
    if (!pdfDoc || !selectedImage) return;
    
    // Clone the PDF document to avoid modifying the original
    const modifiedPdfDoc = await PDFDocument.load(await pdfDoc.save());
    
    // Embed the image
    let image;
    if (selectedImage.type === 'png') {
      image = await modifiedPdfDoc.embedPng(selectedImage.data);
    } else {
      image = await modifiedPdfDoc.embedJpg(selectedImage.data);
    }
    
    // Scale the image
    const imageDims = image.scale(imagePosition.scale);
    
    // Get the first page
    const pages = modifiedPdfDoc.getPages();
    const firstPage = pages[0];
    
    // Draw the image on the page
    firstPage.drawImage(image, {
      x: imagePosition.x,
      y: firstPage.getHeight() - imagePosition.y - imageDims.height, // Convert from top-left to bottom-left coordinate system
      width: imageDims.width,
      height: imageDims.height,
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
  };
  
  // Clean up URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);
  
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
            <div style={{ border: '1px solid #B8BDD7', borderRadius: 6, padding: 8, height: 600, overflow: 'hidden' }}>
              <iframe 
                src={previewUrl} 
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="PDF Preview"
              />
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
            Note: The preview shows the original PDF. The image will be applied when you download.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PdfLibDemo;
