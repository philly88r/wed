import React, { useRef } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// MoodboardTemplate component - displays images in a layout matching the reference design
// with color palette in the bottom right corner
interface MoodboardTemplateProps {
  images: {
    id: string;
    url: string;
    title?: string;
    category?: string;
  }[];
  colors: string[];
  title?: string;
}

const MoodboardTemplate: React.FC<MoodboardTemplateProps> = ({ 
  images, 
  colors = [],
  title = "Altare"
}) => {
  const templateRef = useRef<HTMLDivElement>(null);
  
  // Ensure we have exactly 6 image slots (fill with empty if needed)
  const filledImages = [...images];
  while (filledImages.length < 6) {
    filledImages.push({ id: `empty-${filledImages.length}`, url: '' });
  }
  
  // Take only the first 6 images if there are more
  const displayImages = filledImages.slice(0, 6);
  
  // Layout configuration based on the reference image
  const layout = [
    { gridArea: '1 / 1 / 3 / 2', aspectRatio: '1/1.3' },     // Left large image
    { gridArea: '1 / 2 / 2 / 3', aspectRatio: '1.5/1' },     // Top right image
    { gridArea: '2 / 2 / 3 / 3', aspectRatio: '1.5/1' },     // Middle right image
    { gridArea: '3 / 1 / 4 / 2', aspectRatio: '1/0.5' },     // Bottom left image
    { gridArea: '3 / 2 / 4 / 3', aspectRatio: '0.5/0.5' },   // Bottom middle image
    { gridArea: '3 / 3 / 4 / 4', aspectRatio: '0.5/0.5' }    // Bottom right image
  ];

  // Function to download the template as PDF
  const downloadAsPDF = async () => {
    if (!templateRef.current) return;
    
    try {
      const canvas = await html2canvas(templateRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Allow cross-origin images
        allowTaint: true,
        backgroundColor: '#FAFAFA'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate dimensions to fit the page
      const imgWidth = 297; // A4 width in landscape (mm)
      const imgHeight = 210; // A4 height in landscape (mm)
      
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save('wedding-moodboard.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={downloadAsPDF}
          sx={{
            backgroundColor: '#E8B4B4',
            color: '#054697',
            borderRadius: 0,
            '&:hover': {
              backgroundColor: '#FFD5CC'
            },
            textTransform: 'uppercase'
          }}
        >
          Download as PDF
        </Button>
      </Box>
      
      <Paper 
        ref={templateRef}
        elevation={0}
        sx={{
          width: '100%',
          aspectRatio: '1.4/1',
          backgroundColor: '#FAFAFA',
          p: 0,
          border: '1px solid #E0E0E0',
          borderRadius: 0,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Red accent bar on left side */}
        <Box 
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '8px',
            height: '100%',
            backgroundColor: '#FF5C39',
            zIndex: 10
          }}
        />
        
        {/* Main content */}
        <Box sx={{ pl: 2, pr: 2, pt: 2, pb: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Image grid layout matching the reference image - top section */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(3, auto)',
              gap: 1,
              flex: 1,
              width: '100%',
              height: '100%'
            }}
          >
            {displayImages.map((image, index) => (
              <Box
                key={image.id}
                sx={{
                  gridArea: layout[index].gridArea,
                  aspectRatio: layout[index].aspectRatio,
                  backgroundColor: '#F0F0F0',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {image.url ? (
                  <img
                    src={image.url}
                    alt={image.title || `Moodboard image ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#EEEEEE'
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#AAAAAA',
                        fontStyle: 'italic'
                      }}
                    >
                      Image placeholder
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
          
          {/* Altare logo in the center */}
          <Box
            sx={{
              width: '100%',
              textAlign: 'center',
              py: 2,
              backgroundColor: '#054697',
              my: 2
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: '#FFFFFF',
                fontFamily: 'Giaza, serif',
                letterSpacing: '0.1em',
                fontWeight: 500
              }}
            >
              {title}
            </Typography>
          </Box>
          
          {/* Color palette in bottom right */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
              mt: 'auto'
            }}
          >
            {colors.map((color, index) => (
              <Box
                key={index}
                sx={{
                  width: 50,
                  height: 50,
                  backgroundColor: color,
                  border: '1px solid #E0E0E0'
                }}
              />
            ))}
          </Box>
        </Box>
      </Paper>
    </>
  );
};

export default MoodboardTemplate;
