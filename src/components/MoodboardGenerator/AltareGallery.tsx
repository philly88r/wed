import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, Modal, IconButton, Fade } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DownloadIcon from '@mui/icons-material/Download';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  date: string;
}

interface AltareGalleryProps {
  images: GalleryImage[];
  onDownload?: (imageId: string) => void;
}

const AltareGallery: React.FC<AltareGalleryProps> = ({ images, onDownload }) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleOpen = (index: number) => {
    setSelectedImageIndex(index);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleDownload = (e: React.MouseEvent, imageId: string) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(imageId);
    }
  };

  return (
    <Box sx={{ width: '100%', py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h2" 
          sx={{ 
            color: '#054697', 
            fontFamily: 'Giaza, serif',
            letterSpacing: '-0.05em',
            fontSize: { xs: '2.5rem', md: '3.5rem' }
          }}
        >
          Altare Gallery
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: 'rgba(5, 70, 151, 0.8)', 
            maxWidth: '700px', 
            mx: 'auto',
            mt: 1
          }}
        >
          Your AI-generated moodboards showcasing your unique wedding vision
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {images.map((image, index) => (
          <Grid item xs={12} sm={6} md={4} key={image.id}>
            <Paper 
              elevation={2}
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 8
                }
              }}
              onClick={() => handleOpen(index)}
            >
              <Box sx={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }}>
                <Box 
                  component="img"
                  src={image.url}
                  alt={image.title}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                />
                <Box 
                  sx={{ 
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(5, 70, 151, 0.8))',
                    p: 2,
                    color: 'white'
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {image.title}
                  </Typography>
                  <Typography variant="body2">
                    {image.date}
                  </Typography>
                </Box>
              </Box>
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bgcolor: '#FFE8E4'
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#054697',
                    fontWeight: 'medium'
                  }}
                >
                  View Details
                </Typography>
                <IconButton 
                  size="small" 
                  sx={{ 
                    color: '#054697',
                    '&:hover': {
                      bgcolor: '#FFD5CC'
                    }
                  }}
                  onClick={(e) => handleDownload(e, image.id)}
                >
                  <DownloadIcon />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Fullscreen Modal */}
      <Modal
        open={openModal}
        onClose={handleClose}
        closeAfterTransition
      >
        <Fade in={openModal}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            outline: 'none',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <Box sx={{ position: 'relative', height: '80vh' }}>
              {/* Close button */}
              <IconButton
                onClick={handleClose}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  zIndex: 10,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>

              {/* Navigation buttons */}
              <IconButton
                onClick={handlePrevious}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 16,
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  zIndex: 10,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)'
                  }
                }}
              >
                <ArrowBackIosNewIcon />
              </IconButton>

              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: 16,
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  zIndex: 10,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)'
                  }
                }}
              >
                <ArrowForwardIosIcon />
              </IconButton>

              {/* Image */}
              <Box
                component="img"
                src={images[selectedImageIndex]?.url}
                alt={images[selectedImageIndex]?.title}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>

            {/* Image details */}
            <Box sx={{ 
              p: 3, 
              bgcolor: '#054697', 
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {images[selectedImageIndex]?.title}
                </Typography>
                <Typography variant="body1">
                  {images[selectedImageIndex]?.date}
                </Typography>
              </Box>
              <IconButton 
                sx={{ 
                  color: 'white',
                  bgcolor: '#FFE8E4',
                  '&:hover': {
                    bgcolor: '#FFD5CC'
                  }
                }}
                onClick={(e) => handleDownload(e, images[selectedImageIndex]?.id)}
              >
                <DownloadIcon sx={{ color: '#054697' }} />
              </IconButton>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default AltareGallery;
