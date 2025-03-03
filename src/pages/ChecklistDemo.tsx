import { Container, Typography, Box } from '@mui/material';
import { WeddingChecklistChat } from '../components/ui/wedding-checklist-chat';

export default function ChecklistDemo() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <Typography 
          variant="h2" 
          sx={{ 
            fontFamily: "'Playfair Display', serif",
            mb: 2,
          }}
        >
          Wedding Checklist Demo
        </Typography>
        <Typography 
          variant="h5" 
          sx={{ 
            fontFamily: "'Lato', sans-serif",
            fontWeight: 300,
            mb: 4
          }}
        >
          Explore the interactive wedding planning checklist
        </Typography>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" paragraph>
          This demo showcases our interactive wedding planning checklist. The checklist is designed to help you stay organized throughout your wedding planning journey.
        </Typography>
        <Typography variant="body1" paragraph>
          Features:
        </Typography>
        <ul>
          <li>Interactive timeline with tasks organized by quarters</li>
          <li>Mark tasks as "Not Started", "In Progress", or "Completed"</li>
          <li>Set your wedding date to adjust the timeline</li>
          <li>Chat with the assistant for planning advice</li>
          <li>Toggle between chat and checklist views</li>
        </ul>
        <Typography variant="body1" paragraph sx={{ mt: 2 }}>
          Click the chat icon in the bottom right corner to get started!
        </Typography>
      </Box>
      
      <WeddingChecklistChat />
    </Container>
  );
}
