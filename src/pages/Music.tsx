import { Box, Typography, Paper } from '@mui/material';

export default function Music() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Music Playlist
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Coming soon...</Typography>
      </Paper>
    </Box>
  );
}
