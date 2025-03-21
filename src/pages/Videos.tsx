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
import { supabase, mockVideos } from '../lib/supabase';
import { JournalPrompts } from '../components/ui/journal-prompts';
import { Button } from '../components/ui/button';

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
          maxHeight: '90vh'
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
            right: 8,
            top: 8,
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.7)'
            },
            zIndex: 2
          }}
        >
          <CloseIcon />
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
          />
          {/* Top gradient overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '120px',
              background: 'linear-gradient(to bottom, rgba(5,70,151,0.95), rgba(255,232,228,0.6), transparent)',
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
              background: 'linear-gradient(to top, rgba(5,70,151,0.95), rgba(255,232,228,0.6), transparent)',
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
              background: 'linear-gradient(to right, rgba(5,70,151,0.95), rgba(255,232,228,0.6), transparent)',
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
              background: 'linear-gradient(to left, rgba(5,70,151,0.95), rgba(255,232,228,0.6), transparent)',
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
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)'
        }
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
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s'
          }}
        >
          <Box
            component="img"
            src="/play-button.svg"
            alt="Play"
            sx={{ width: 64, height: 64 }}
          />
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
                variant="outline"
                className="w-full border-accent-rose text-primary hover:bg-accent-rose/10"
                onClick={() => setShowJournal(true)}
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          color: theme.palette.primary.main,
          textAlign: 'center',
          mb: 4
        }}
      >
        Wedding Planning Video Tutorials
      </Typography>

      {loading && (
        <Typography sx={{ color: theme.palette.primary.main, opacity: 0.8, textAlign: 'center' }}>
          Loading videos...
        </Typography>
      )}

      {error && (
        <Typography color="error" gutterBottom sx={{ textAlign: 'center' }}>
          {error}
        </Typography>
      )}

      {!loading && !error && videos.length === 0 && (
        <Typography sx={{ color: theme.palette.primary.main, opacity: 0.8, textAlign: 'center' }}>
          No videos available yet.
        </Typography>
      )}

      <Grid container spacing={3}>
        {videos && videos.map((video) => (
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
