import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          We're working hard to bring you this feature. Please check back soon!
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/')}
      >
        Back to Home
      </Button>
    </Container>
  );
}
