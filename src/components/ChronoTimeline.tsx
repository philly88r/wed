import { useState, useEffect } from 'react';
import { Chrono } from 'react-chrono';
import { Box, Typography, CircularProgress, Alert, useTheme, useMediaQuery, Paper } from '@mui/material';
import { TimelineEvent, formatTime } from '../utils/timelineCreatorUtils';

interface ChronoTimelineProps {
  events: TimelineEvent[];
  weddingDate?: string;
  className?: string;
}

// Interface for Chrono timeline items
interface ChronoItem {
  title: string;
  cardTitle: string;
  cardSubtitle: string;
  cardDetailedText: string;
  media?: {
    name: string;
    source: {
      url: string;
    };
  };
}

// Category icon mapping
const categoryIcons: Record<string, string> = {
  'Ceremony': '💒',
  'Reception': '🎉',
  'Photos': '📸',
  'Preparation': '💇‍♀️',
  'Transportation': '🚗',
  'Vendor': '👨‍🍳',
  'Custom': '✨',
  'Meal': '🍽️',
  'Entertainment': '🎵',
  'Family': '👪',
  'Tradition': '💝'
};

// Get icon for category, with fallback
const getCategoryIcon = (category: string): string => {
  return categoryIcons[category] || '📅';
};

// Category color mapping
const categoryColors: Record<string, string> = {
  'Ceremony': '#4CAF50',  // Green
  'Reception': '#2196F3',  // Blue
  'Photos': '#9C27B0',    // Purple
  'Preparation': '#FF9800', // Orange
  'Transportation': '#795548', // Brown
  'Vendor': '#607D8B',    // Blue Grey
  'Custom': '#F44336',    // Red
  'Meal': '#FFEB3B',      // Yellow
  'Entertainment': '#00BCD4', // Cyan
  'Family': '#E91E63',    // Pink
  'Tradition': '#673AB7'  // Deep Purple
};

// Get color for category, with fallback
const getCategoryColor = (category: string): string => {
  return categoryColors[category] || '#9E9E9E'; // Grey as default
};

const ChronoTimeline = ({ events, weddingDate, className = '' }: ChronoTimelineProps) => {
  const [timelineItems, setTimelineItems] = useState<ChronoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  useEffect(() => {
    try {
      if (!events || events.length === 0) {
        setError('No timeline events available');
        setLoading(false);
        return;
      }
      
      // Sort events by time
      const sortedEvents = [...events].sort((a, b) => {
        const timeA = a.time;
        const timeB = b.time;
        return timeA.localeCompare(timeB);
      });
      
      // Convert events to Chrono format
      const items: ChronoItem[] = sortedEvents.map(event => ({
        title: formatTime(event.time),
        cardTitle: `${getCategoryIcon(event.category)} ${event.event}`,
        cardSubtitle: event.category,
        cardDetailedText: event.notes || 'No additional details',
      }));
      
      setTimelineItems(items);
      setLoading(false);
    } catch (error) {
      console.error('Error preparing timeline data:', error);
      setError('Error preparing timeline data');
      setLoading(false);
    }
  }, [events]);
  
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '300px',
        width: '100%' 
      }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Preparing timeline...
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (timelineItems.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No events to display. Add events to see your timeline.
      </Alert>
    );
  }
  
  // Generate custom styles for each category
  const customTheme = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    cardBgColor: '#f9f9f9',
    cardForeColor: theme.palette.text.primary,
    titleColor: theme.palette.text.primary,
  };

  // Add custom CSS for category colors
  const categoryStyles = Object.entries(categoryColors).map(([category, color]) => `
    .timeline-card[data-category="${category}"] {
      border-left: 4px solid ${color};
    }
  `).join('\n');
  
  return (
    <Box className={className} sx={{ width: '100%', position: 'relative', minHeight: '400px' }}>
      <style>
        {`
          .timeline-card {
            transition: transform 0.3s ease;
            border-left: 4px solid #9E9E9E;
          }
          .timeline-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }
          ${categoryStyles}
        `}
      </style>
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Wedding Timeline {weddingDate ? `- ${weddingDate}` : ''}
        </Typography>
        
        <Box sx={{ height: isMobile ? '500px' : '600px', width: '100%' }}>
          <Chrono
            items={timelineItems}
            mode={isMobile ? "VERTICAL" : "VERTICAL_ALTERNATING"}
            cardHeight={150}
            scrollable={{ scrollbar: true }}
            theme={customTheme}
            fontSizes={{
              cardSubtitle: '0.85rem',
              cardText: '0.9rem',
              cardTitle: '1.1rem',
              title: '1rem',
            }}
            classNames={{
              card: 'timeline-card',
              cardMedia: 'timeline-card-media',
              cardSubTitle: 'timeline-card-subtitle',
              cardText: 'timeline-card-text',
              cardTitle: 'timeline-card-title',
              controls: 'timeline-controls',
              title: 'timeline-title',
            }}
            itemWidth={150}
            onItemSelected={(itemIndex: number) => {
              // Apply category color to selected card
              const selectedItem = timelineItems[itemIndex];
              if (selectedItem) {
                const category = selectedItem.cardSubtitle;
                const color = getCategoryColor(category);
                console.log(`Selected item category: ${category}, color: ${color}`);
              }
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default ChronoTimeline;
