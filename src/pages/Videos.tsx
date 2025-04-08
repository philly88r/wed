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
  Button,
  Avatar,
} from '@mui/material';
import { Close as CloseIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { supabase, mockVideos } from '../lib/supabase';
import { JournalPrompts } from '../components/ui/journal-prompts';

interface Video {
  id: string;
  title: string;
  description: string;
  youtube_id: string;
  thumbnail_url: string;
  category: string;
  duration: string;
  has_journal_prompt: boolean;
  related_feature: string | null;
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
          width: '100%',
          height: '100%',
          maxWidth: '90vw',
          maxHeight: '90vh',
          borderRadius: 0 // Square corners per brand guidelines
        }
      }}
    >
      <Box sx={{ 
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: 'white',
            bgcolor: theme.palette.accent?.rose || '#FFE8E4',
            '&:hover': {
              bgcolor: theme.palette.accent?.roseDark || '#FFD5CC'
            },
            zIndex: 2,
            borderRadius: 0 // Square corners per brand guidelines
          }}
        >
          <CloseIcon sx={{ color: theme.palette.primary.main }} />
        </IconButton>
        <Box sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          '& iframe': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none'
          }
        }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&color=white&controls=1&iv_load_policy=3&playsinline=1&enablejsapi=1&origin=${window.location.origin}&widget_referrer=${window.location.origin}&cc_load_policy=0&fs=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video Player"
          />
          {/* Top gradient overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '120px',
              background: `linear-gradient(to bottom, ${theme.palette.primary.main}CC, ${theme.palette.accent?.rose || '#FFE8E4'}99, transparent)`,
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
          {/* Bottom gradient overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '120px',
              background: `linear-gradient(to top, ${theme.palette.primary.main}CC, ${theme.palette.accent?.rose || '#FFE8E4'}99, transparent)`,
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
          {/* Side gradients */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '100px',
              background: `linear-gradient(to right, ${theme.palette.primary.main}CC, ${theme.palette.accent?.rose || '#FFE8E4'}99, transparent)`,
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100px',
              background: `linear-gradient(to left, ${theme.palette.primary.main}CC, ${theme.palette.accent?.rose || '#FFE8E4'}99, transparent)`,
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
        </Box>
      </Box>
    </Dialog>
  );
};

const VideoCard = ({ video, onPlay }: { video: Video; onPlay: (id: string) => void }) => {
  const theme = useTheme();
  const [showJournal, setShowJournal] = useState(false);

  return (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
        },
        borderRadius: 0, // Square corners per brand guidelines
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Box
        sx={{
          position: 'relative',
          paddingTop: '56.25%', // 16:9 aspect ratio
          cursor: 'pointer',
          '&:hover': {
            '& .playOverlay': {
              opacity: 1
            }
          }
        }}
        onClick={() => onPlay(video.youtube_id)}
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
          className="playOverlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s'
          }}
        >
          <Box
            sx={{
              width: '60px',
              height: '60px',
              borderRadius: 0, // Square corners per brand guidelines
              backgroundColor: theme.palette.accent?.rose || '#FFE8E4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PlayArrowIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
          </Box>
        </Box>
      </Box>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            color: theme.palette.primary.main,
            fontWeight: 'medium'
          }}
        >
          {video.title}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: theme.palette.primary.main,
            opacity: 0.8,
            mb: 1
          }}
        >
          {video.duration} • {video.category}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.primary.main,
            opacity: 0.8,
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {video.description}
        </Typography>
        {video.has_journal_prompt && (
          <Box sx={{ mt: 'auto' }}>
            {showJournal ? (
              <JournalPrompts videoId={video.id} />
            ) : (
              <Button 
                variant="outlined"
                onClick={() => setShowJournal(true)}
                sx={{
                  width: '100%',
                  color: theme.palette.primary.main,
                  borderColor: theme.palette.accent?.rose || '#FFE8E4',
                  backgroundColor: 'transparent',
                  borderRadius: 0, // Square corners per brand guidelines
                  '&:hover': {
                    backgroundColor: `${theme.palette.accent?.rose || '#FFE8E4'}20`,
                    borderColor: theme.palette.accent?.rose || '#FFE8E4'
                  },
                  textTransform: 'uppercase',
                  fontWeight: 'regular'
                }}
              >
                Open Journal Prompts
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Temporarily use mock data until database is running
      setVideos(mockVideos);
      setLoading(false);
      return;

      const { data, error: supabaseError } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      // Handle Supabase error
      const errorMessage = supabaseError?.message ?? 'An error occurred while fetching videos';
      if (supabaseError) {
        console.error('Error fetching videos:', errorMessage);
        setError(errorMessage);
        return;
      }

      setVideos(data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (videoId: string) => {
    setSelectedVideo(videoId);
  };

  const handleClose = () => {
    setSelectedVideo(null);
  };

  return (
    <Box sx={{ 
      backgroundColor: '#FAFAFA', 
      minHeight: '100vh',
      pt: 4, 
      pb: 8 
    }}>
      {/* Welcome Section */}
      <Container maxWidth="lg">
        <Box sx={{ 
          mb: 6, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              color: theme.palette.primary.main,
              textAlign: 'center',
              fontFamily: 'Giaza, serif',
              letterSpacing: '-0.05em',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Wedding Planning Videos
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: theme.palette.primary.main, 
              opacity: 0.8, 
              textAlign: 'center',
              maxWidth: '700px',
              mb: 4
            }}
          >
            Explore our collection of wedding planning tutorials to help you prepare for your special day. From venue selection to guest management, we've got you covered.
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: theme.palette.primary.main, opacity: 0.8 }}>
              Loading videos...
            </Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
          </Box>
        )}

        {!loading && !error && videos.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: theme.palette.primary.main, opacity: 0.8 }}>
              No videos available yet.
            </Typography>
          </Box>
        )}

        {!loading && !error && videos.length > 0 && (
          <Grid container spacing={3}>
            {videos.map((video) => (
              <Grid item xs={12} sm={6} md={4} key={video.id}>
                <VideoCard video={video} onPlay={handlePlay} />
              </Grid>
            ))}
          </Grid>
        )}

      {selectedVideo && (
        <CustomVideoPlayer videoId={selectedVideo} onClose={handleClose} />
      )}
      </Container>
    </Box>
  );
}
