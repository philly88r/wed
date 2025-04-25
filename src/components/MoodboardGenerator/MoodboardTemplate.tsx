
import { Box, Typography, Button, Paper } from '@mui/material';

interface MoodboardImage {
  id: string;
  url: string;
  title?: string;
  category?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
}

interface MoodboardTemplateProps {
  images: MoodboardImage[];
  colors?: string[];
}

export default function MoodboardTemplate(_props: MoodboardTemplateProps) {
  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 800, mx: 'auto', my: 4 }}>
        <Typography variant="h4" sx={{ mb: 2, fontFamily: 'Giaza, serif', color: '#054697' }}>
          Altare Moodboard Generator
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3, color: 'rgba(5, 70, 151, 0.8)' }}>
          Please use the AI Moodboard Generator to create beautiful moodboards with the Altare template.
          Our new AI-powered tool allows you to generate images and place them perfectly around the Altare logo.
        </Typography>
        
        <Button
          variant="contained"
          href="/ai-moodboard"
          sx={{
            mt: 2,
            bgcolor: '#FFE8E4',
            color: '#054697',
            '&:hover': {
              bgcolor: '#FFD5CC'
            },
            fontFamily: 'Poppins, sans-serif',
            px: 4,
            py: 1.5
          }}
        >
          Go to AI Moodboard Generator
        </Button>
      </Paper>
    </Box>
  );
}
