import { Container, Typography, Box, Paper } from '@mui/material';
import WeddingTimeline from '../components/ui/wedding-timeline';
import { weddingChecklistData } from '../data/wedding-checklist';
import { useState } from 'react';

export default function ChecklistDemo() {
  const [checklist, setChecklist] = useState(weddingChecklistData);
  const [weddingDate, setWeddingDate] = useState<Date>(() => {
    // Default to 6 months from now
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    return date;
  });

  const handleUpdateTaskStatus = (id: string, status: 'NOT STARTED' | 'IN PROGRESS' | 'COMPLETED') => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status } : item
      )
    );
  };

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
        </ul>
      </Box>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h6">
            Wedding Date: {weddingDate.toLocaleDateString()}
          </Typography>
          <button 
            onClick={() => {
              const dateStr = prompt('Please enter your wedding date (YYYY-MM-DD):', 
                weddingDate.toISOString().split('T')[0]);
              
              if (dateStr) {
                const newDate = new Date(dateStr);
                if (!isNaN(newDate.getTime())) {
                  setWeddingDate(newDate);
                }
              }
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#9c27b0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Change Wedding Date
          </button>
        </Box>
        
        <WeddingTimeline 
          weddingDate={weddingDate}
          items={checklist}
          onUpdateStatus={handleUpdateTaskStatus}
        />
      </Paper>
    </Container>
  );
}
