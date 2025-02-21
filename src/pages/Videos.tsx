import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Dialog,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { supabase } from '../lib/supabase';

interface Video {
  id: string;
  title: string;
  description: string;
  youtube_id: string;
  thumbnail_url: string;
  category: string;
  duration: string;
}

const CustomVideoPlayer = ({ videoId, onClose }: { videoId: string; onClose: () => void }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      fullScreen={fullScreen}
      maxWidth="lg"
      open={true}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: 'black',
          boxShadow: 'none',
          overflow: 'hidden',
          ...(fullScreen ? {} : {
            minWidth: '80vw',
            minHeight: '80vh'
          })
        }
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.7)'
            },
            zIndex: 1
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box
          sx={{
            position: 'relative',
            paddingTop: '56.25%', // 16:9 aspect ratio
            width: '100%',
            height: '100%'
          }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&controls=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none'
            }}
          />
        </Box>
      </Box>
    </Dialog>
  );
};

const VideoCard = ({ video, onPlay }: { video: Video; onPlay: (id: string) => void }) => {
  return (
    <Card 
      sx={{ 
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)'
        }
      }}
      onClick={() => onPlay(video.youtube_id)}
    >
      <Box
        sx={{
          position: 'relative',
          paddingTop: '56.25%', // 16:9 aspect ratio
          backgroundColor: '#000',
          overflow: 'hidden'
        }}
      >
        <Box
          component="img"
          src={video.thumbnail_url}
          alt={video.title}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            bgcolor: 'rgba(0,0,0,0.8)',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.875rem'
          }}
        >
          {video.duration}
        </Box>
      </Box>
      <CardContent>
        <Typography variant="h6" gutterBottom noWrap>
          {video.title}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {video.description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching videos:', error);
      return;
    }

    setVideos(data || []);
  };

  const handlePlay = (videoId: string) => {
    setSelectedVideo(videoId);
  };

  const handleClose = () => {
    setSelectedVideo(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Wedding Planning Videos
      </Typography>

      <Grid container spacing={3}>
        {videos.map((video) => (
          <Grid item xs={12} sm={6} md={4} key={video.id}>
            <VideoCard video={video} onPlay={handlePlay} />
          </Grid>
        ))}
      </Grid>

      {selectedVideo && (
        <CustomVideoPlayer videoId={selectedVideo} onClose={handleClose} />
      )}
    </Container>
  );
}
