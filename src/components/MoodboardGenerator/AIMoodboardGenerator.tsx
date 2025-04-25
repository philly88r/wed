import React, { useRef, useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Box, Tabs, Tab } from '@mui/material';
import AltareGallery from './AltareGallery';

// Define template position interface
interface TemplatePosition {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TemplatePosition {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Sample gallery images
const sampleGalleryImages = [
  {
    id: '1',
    url: 'https://via.placeholder.com/600x450/054697/FFFFFF?text=Elegant+Wedding',
    title: 'Elegant Wedding Theme',
    date: 'April 24, 2025'
  },
  {
    id: '2',
    url: 'https://via.placeholder.com/600x450/054697/FFFFFF?text=Rustic+Garden',
    title: 'Rustic Garden Inspiration',
    date: 'April 23, 2025'
  },
  {
    id: '3',
    url: 'https://via.placeholder.com/600x450/054697/FFFFFF?text=Modern+Minimalist',
    title: 'Modern Minimalist Design',
    date: 'April 22, 2025'
  },
  {
    id: '4',
    url: 'https://via.placeholder.com/600x450/054697/FFFFFF?text=Bohemian+Chic',
    title: 'Bohemian Chic Celebration',
    date: 'April 21, 2025'
  },
  {
    id: '5',
    url: 'https://via.placeholder.com/600x450/054697/FFFFFF?text=Classic+Romance',
    title: 'Classic Romance Theme',
    date: 'April 20, 2025'
  },
  {
    id: '6',
    url: 'https://via.placeholder.com/600x450/054697/FFFFFF?text=Beach+Destination',
    title: 'Beach Destination Wedding',
    date: 'April 19, 2025'
  }
];

const AIMoodboardGenerator: React.FC = () => {
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  // Input ref for prompt field
  
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [generatedImages, setGeneratedImages] = useState<{ top: Uint8Array | null, bottom: Uint8Array | null }>({ top: null, bottom: null });
  const [isGenerating, setIsGenerating] = useState<{ top: boolean, bottom: boolean }>({ top: false, bottom: false });
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [pdfName, setPdfName] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [activePosition, setActivePosition] = useState<'top' | 'bottom'>('top');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [galleryImages, setGalleryImages] = useState(sampleGalleryImages);
  
  // Template positions for top and bottom images
  const templatePositions: { [key: string]: TemplatePosition } = {
    top: { name: 'Top Image', x: 100, y: 100, width: 400, height: 200 },
    bottom: { name: 'Bottom Image', x: 100, y: 500, width: 400, height: 200 }
  };
  
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
  
  // Generate AI image
  const generateAIImage = async (position: 'top' | 'bottom') => {
    if (!prompt) {
      alert('Please enter a prompt for the AI image generation.');
      return;
    }
    
    setIsGenerating({ ...isGenerating, [position]: true });
    
    try {
      // Simulate AI image generation (replace with actual API call)
      console.log(`Generating ${position} image with prompt: ${prompt}`);
      
      // In a real implementation, this would be an API call to an image generation service
      // For now, we'll simulate a delay and then use a placeholder image
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fetch a placeholder image
      const response = await fetch('https://via.placeholder.com/400x200/054697/FFFFFF?text=AI+Generated+Image');
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const imageData = new Uint8Array(arrayBuffer);
      
      // Update the generated images state
      setGeneratedImages(prev => ({
        ...prev,
        [position]: imageData
      }));
      
      console.log(`${position} image generated successfully`);
    } catch (error) {
      console.error(`Error generating ${position} image:`, error);
      alert(`There was an error generating the ${position} image. Please try again.`);
    } finally {
      setIsGenerating({ ...isGenerating, [position]: false });
    }
  };
  
  // Apply images to PDF and download
  const applyImagesAndDownload = async () => {
    if (!pdfDoc) {
      alert('Please upload a PDF template first.');
      return;
    }
    
    if (!generatedImages.top && !generatedImages.bottom) {
      alert('Please generate at least one image before downloading.');
      return;
    }
    
    try {
      // Clone the PDF document to avoid modifying the original
      const modifiedPdfDoc = await PDFDocument.load(await pdfDoc.save());
      console.log('PDF document cloned successfully');
      
      // Get the first page
      const pages = modifiedPdfDoc.getPages();
      const firstPage = pages[0];
      
      // Get page dimensions
      const { height: pageHeight } = firstPage.getSize();
      
      // Embed and place the top image if it exists
      if (generatedImages.top) {
        try {
          const topImage = await modifiedPdfDoc.embedJpg(generatedImages.top);
          const topPosition = templatePositions.top;
          
          // Calculate position (PDF uses bottom-left origin)
          const topX = topPosition.x;
          const topY = pageHeight - topPosition.y - topPosition.height;
          
          // Draw the image on the page
          firstPage.drawImage(topImage, {
            x: topX,
            y: topY,
            width: topPosition.width,
            height: topPosition.height,
            opacity: 1.0
          });
          
          console.log('Top image placed successfully');
        } catch (error) {
          console.error('Error embedding top image:', error);
        }
      }
      
      // Embed and place the bottom image if it exists
      if (generatedImages.bottom) {
        try {
          const bottomImage = await modifiedPdfDoc.embedJpg(generatedImages.bottom);
          const bottomPosition = templatePositions.bottom;
          
          // Calculate position (PDF uses bottom-left origin)
          const bottomX = bottomPosition.x;
          const bottomY = pageHeight - bottomPosition.y - bottomPosition.height;
          
          // Draw the image on the page
          firstPage.drawImage(bottomImage, {
            x: bottomX,
            y: bottomY,
            width: bottomPosition.width,
            height: bottomPosition.height,
            opacity: 1.0
          });
          
          console.log('Bottom image placed successfully');
        } catch (error) {
          console.error('Error embedding bottom image:', error);
        }
      }
      
      // Save and trigger download
      const modifiedPdfBytes = await modifiedPdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `altare_moodboard_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('PDF successfully created with your AI images! Check your downloads folder.');
    } catch (error) {
      console.error('Error applying images to PDF:', error);
      alert('There was an error adding your images to the PDF. Please try again.');
    }
  };
  
  // State to store PDF page dimensions for accurate preview
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number } | null>(null);
  
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
  
  const positionButtonStyle = (isActive: boolean) => ({
    ...buttonStyle,
    background: isActive ? '#054697' : '#FFE8E4',
    color: isActive ? '#FFFFFF' : '#054697',
    padding: '8px 16px',
    fontSize: 14,
  });

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle gallery image download
  const handleGalleryDownload = (imageId: string) => {
    const image = galleryImages.find(img => img.id === imageId);
    if (image) {
      // In a real implementation, this would download the actual PDF
      alert(`Downloading moodboard: ${image.title}`);
      
      // For demonstration, open the image in a new tab
      window.open(image.url, '_blank');
    }
  };

  return (
    <div style={{ padding: 32, fontFamily: 'Poppins, sans-serif', background: '#FFF', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ color: '#054697', textAlign: 'center', fontFamily: 'Giaza, serif', fontSize: '3rem', marginBottom: 8 }}>Altare Moodboard Studio</h1>
      <p style={{ color: 'rgba(5, 70, 151, 0.8)', textAlign: 'center', maxWidth: 700, margin: '0 auto 24px' }}>
        Create beautiful wedding moodboards with AI-generated images perfectly positioned around the Altare logo.
      </p>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          centered
          sx={{
            '& .MuiTab-root': { color: 'rgba(5, 70, 151, 0.6)' },
            '& .Mui-selected': { color: '#054697', fontWeight: 'bold' },
            '& .MuiTabs-indicator': { backgroundColor: '#054697' }
          }}
        >
          <Tab label="Create Moodboard" />
          <Tab label="Gallery" />
        </Tabs>
      </Box>
      
      {activeTab === 0 ? (
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
        <div style={{ flex: '1 1 300px' }}>
          <h2 style={{ color: '#054697', fontSize: 20 }}>1. Upload Altare Template</h2>
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
            Select PDF Template
          </button>
          {pdfName && <p style={{ color: 'rgba(5, 70, 151, 0.8)' }}>Selected: {pdfName}</p>}
          
          <h2 style={{ color: '#054697', fontSize: 20, marginTop: 24 }}>2. Generate AI Images</h2>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: 'rgba(5, 70, 151, 0.8)', marginBottom: 4 }}>
              Enter Prompt for AI Image:
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              style={inputStyle}
            />
          </div>
          
          <div style={{ display: 'flex', marginBottom: 16 }}>
            <button
              style={positionButtonStyle(activePosition === 'top')}
              onClick={() => setActivePosition('top')}
              onMouseOver={e => !isGenerating.top && (e.currentTarget.style.background = activePosition === 'top' ? '#043d82' : '#FFD5CC')}
              onMouseOut={e => !isGenerating.top && (e.currentTarget.style.background = activePosition === 'top' ? '#054697' : '#FFE8E4')}
            >
              Top Image
            </button>
            <button
              style={positionButtonStyle(activePosition === 'bottom')}
              onClick={() => setActivePosition('bottom')}
              onMouseOver={e => !isGenerating.bottom && (e.currentTarget.style.background = activePosition === 'bottom' ? '#043d82' : '#FFD5CC')}
              onMouseOut={e => !isGenerating.bottom && (e.currentTarget.style.background = activePosition === 'bottom' ? '#054697' : '#FFE8E4')}
            >
              Bottom Image
            </button>
          </div>
          
          <button
            onClick={() => generateAIImage(activePosition)}
            disabled={!pdfDoc || isGenerating[activePosition] || !prompt}
            style={{
              ...buttonStyle,
              opacity: (!pdfDoc || isGenerating[activePosition] || !prompt) ? 0.5 : 1,
              cursor: (!pdfDoc || isGenerating[activePosition] || !prompt) ? 'not-allowed' : 'pointer',
            }}
            onMouseOver={e => (pdfDoc && !isGenerating[activePosition] && prompt) && (e.currentTarget.style.background = '#FFD5CC')}
            onMouseOut={e => (pdfDoc && !isGenerating[activePosition] && prompt) && (e.currentTarget.style.background = '#FFE8E4')}
          >
            {isGenerating[activePosition] ? `Generating ${activePosition} image...` : `Generate ${activePosition} image`}
          </button>
          
          <div style={{ marginTop: 16 }}>
            <h3 style={{ color: '#054697', fontSize: 16 }}>Generated Images:</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
              <div style={{ 
                width: 150, 
                height: 75, 
                border: '1px solid #B8BDD7', 
                borderRadius: 4, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: generatedImages.top ? '#054697' : '#f8f9fa',
                color: generatedImages.top ? '#FFFFFF' : 'rgba(5, 70, 151, 0.8)',
                fontSize: 12,
                position: 'relative'
              }}>
                {generatedImages.top ? 'Top Image Ready' : 'No Top Image'}
                {isGenerating.top && (
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    background: 'rgba(5, 70, 151, 0.8)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#FFFFFF'
                  }}>
                    Generating...
                  </div>
                )}
              </div>
              
              <div style={{ 
                width: 150, 
                height: 75, 
                border: '1px solid #B8BDD7', 
                borderRadius: 4, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: generatedImages.bottom ? '#054697' : '#f8f9fa',
                color: generatedImages.bottom ? '#FFFFFF' : 'rgba(5, 70, 151, 0.8)',
                fontSize: 12,
                position: 'relative'
              }}>
                {generatedImages.bottom ? 'Bottom Image Ready' : 'No Bottom Image'}
                {isGenerating.bottom && (
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    background: 'rgba(5, 70, 151, 0.8)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#FFFFFF'
                  }}>
                    Generating...
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={applyImagesAndDownload}
            disabled={!pdfDoc || (!generatedImages.top && !generatedImages.bottom)}
            style={{
              ...buttonStyle,
              background: '#054697',
              color: '#FFFFFF',
              padding: '14px 28px',
              fontSize: 18,
              marginTop: 24,
              opacity: (!pdfDoc || (!generatedImages.top && !generatedImages.bottom)) ? 0.5 : 1,
              cursor: (!pdfDoc || (!generatedImages.top && !generatedImages.bottom)) ? 'not-allowed' : 'pointer',
            }}
            onMouseOver={e => (pdfDoc && (generatedImages.top || generatedImages.bottom)) && (e.currentTarget.style.background = '#043d82')}
            onMouseOut={e => (pdfDoc && (generatedImages.top || generatedImages.bottom)) && (e.currentTarget.style.background = '#054697')}
          >
            Apply Images & Download PDF
          </button>
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
              
              {/* Visual indicators for image placement */}
              {pdfDimensions && (
                <>
                  <div 
                    style={{
                      position: 'absolute',
                      top: `${templatePositions.top.y}px`,
                      left: `${templatePositions.top.x}px`,
                      width: `${templatePositions.top.width}px`,
                      height: `${templatePositions.top.height}px`,
                      border: '2px dashed #054697',
                      backgroundColor: generatedImages.top ? 'rgba(5, 70, 151, 0.4)' : 'rgba(5, 70, 151, 0.1)',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#054697',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      zIndex: 1000,
                    }}
                  >
                    {generatedImages.top ? 'Top Image (Generated)' : 'Top Image Area'}
                  </div>
                  
                  <div 
                    style={{
                      position: 'absolute',
                      top: `${templatePositions.bottom.y}px`,
                      left: `${templatePositions.bottom.x}px`,
                      width: `${templatePositions.bottom.width}px`,
                      height: `${templatePositions.bottom.height}px`,
                      border: '2px dashed #054697',
                      backgroundColor: generatedImages.bottom ? 'rgba(5, 70, 151, 0.4)' : 'rgba(5, 70, 151, 0.1)',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#054697',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      zIndex: 1000,
                    }}
                  >
                    {generatedImages.bottom ? 'Bottom Image (Generated)' : 'Bottom Image Area'}
                  </div>
                </>
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
              Upload the Altare template PDF to see preview
            </div>
          )}
          <p style={{ color: 'rgba(5, 70, 151, 0.8)', fontSize: 14, marginTop: 8 }}>
            <strong>Note:</strong> This preview shows the approximate positions where AI-generated images will be placed. The actual placement in the PDF will be precise.
          </p>
        </div>
      </div>
      ) : (
        <AltareGallery images={galleryImages} onDownload={handleGalleryDownload} />
      )}
    </div>
  );
};

export default AIMoodboardGenerator;
