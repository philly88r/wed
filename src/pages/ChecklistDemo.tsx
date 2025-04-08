import { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Grid, LinearProgress, Chip } from '@mui/material';
import { weddingChecklistData } from '../data/wedding-checklist';
import { Check, Clock, AlertTriangle, Calendar, Heart, Gift, Camera, Music, Utensils, MapPin } from 'lucide-react';
import { TimelineItem } from '../components/ui/wedding-timeline';
import confetti from 'canvas-confetti';

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  'Venue': <MapPin size={18} />,
  'Photography': <Camera size={18} />,
  'Catering': <Utensils size={18} />,
  'Music': <Music size={18} />,
  'Gifts': <Gift size={18} />,
  'Ceremony': <Heart size={18} />,
  'Planning': <Calendar size={18} />
};

// Define the extended timeline item type with category
interface CategorizedTimelineItem extends TimelineItem {
  category: string;
}

// Add categories to checklist items
const categorizedChecklist: CategorizedTimelineItem[] = weddingChecklistData.map(item => {
  // Assign categories based on keywords in the task
  let category = 'Planning';
  if (item.task.toLowerCase().includes('venue') || item.task.toLowerCase().includes('location')) {
    category = 'Venue';
  } else if (item.task.toLowerCase().includes('photo') || item.task.toLowerCase().includes('video')) {
    category = 'Photography';
  } else if (item.task.toLowerCase().includes('cater') || item.task.toLowerCase().includes('food') || item.task.toLowerCase().includes('cake')) {
    category = 'Catering';
  } else if (item.task.toLowerCase().includes('music') || item.task.toLowerCase().includes('dj') || item.task.toLowerCase().includes('band')) {
    category = 'Music';
  } else if (item.task.toLowerCase().includes('gift') || item.task.toLowerCase().includes('registry')) {
    category = 'Gifts';
  } else if (item.task.toLowerCase().includes('ceremony') || item.task.toLowerCase().includes('officiant') || item.task.toLowerCase().includes('vows')) {
    category = 'Ceremony';
  }
  
  return {
    ...item,
    category
  };
});

export default function ChecklistDemo() {
  const [checklist, setChecklist] = useState<CategorizedTimelineItem[]>(categorizedChecklist);
  const [weddingDate, setWeddingDate] = useState<Date>(() => {
    // Default to 6 months from now
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    return date;
  });
  const [activeQuarter, setActiveQuarter] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [daysLeft, setDaysLeft] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Calculate progress and days left
  useEffect(() => {
    const completed = checklist.filter(item => item.status === 'COMPLETED').length;
    const total = checklist.length;
    setProgress(Math.round((completed / total) * 100));
    
    const today = new Date();
    const timeLeft = Math.max(0, Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    setDaysLeft(timeLeft);
  }, [checklist, weddingDate]);

  // Trigger confetti when a task is completed
  useEffect(() => {
    if (showConfetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleUpdateTaskStatus = (id: string, status: TimelineItem['status']) => {
    const prevStatus = checklist.find(item => item.id === id)?.status;
    
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status } : item
      )
    );
    
    // Trigger confetti when marking as completed
    if (status === 'COMPLETED' && prevStatus !== 'COMPLETED') {
      setShowConfetti(true);
    }
  };

  const getStatusIcon = (status: TimelineItem['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'IN PROGRESS':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'NOT STARTED':
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  // This function is used for styling reference in comments
  /* 
  const getStatusClass = (status: TimelineItem['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'IN PROGRESS':
        return 'bg-amber-100 border-amber-300 text-amber-800';
      case 'NOT STARTED':
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };
  */

  // Group items by quarter and deadline
  const groupedItems: Record<number, Record<string, CategorizedTimelineItem[]>> = checklist.reduce<Record<number, Record<string, CategorizedTimelineItem[]>>>((acc, item) => {
    if (!acc[item.quarter]) {
      acc[item.quarter] = {};
    }
    
    if (!acc[item.quarter][item.deadline]) {
      acc[item.quarter][item.deadline] = [];
    }
    
    // Only add if no category filter or matching category
    if (!activeCategory || item.category === activeCategory) {
      acc[item.quarter][item.deadline].push(item);
    }
    
    return acc;
  }, {});

  // Get all unique categories
  const categories = Array.from(new Set(categorizedChecklist.map(item => item.category)));

  // Get deadline order for sorting
  const getDeadlineOrder = (deadline: TimelineItem['deadline']) => {
    const order: Record<TimelineItem['deadline'], number> = {
      'First': 1,
      'Second': 2,
      'Third': 3,
      '30 Days Before WD': 4,
      '10 Days Before WD': 5,
      '1 Day Before WD': 6,
      'WD': 7,
      '1 Day After WD': 8
    };
    return order[deadline] || 0;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header section with improved styling */}
      <Box 
        sx={{ 
          mb: 6, 
          position: 'relative',
          pb: 2,
          borderBottom: '1px solid rgba(5, 70, 151, 0.1)'
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontFamily: "'Giaza', serif", 
            color: '#054697',
            letterSpacing: '-0.05em',
            mb: 1
          }}
        >
          Wedding Checklist
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#054697', 
            opacity: 0.8,
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 300,
            mb: 2
          }}
        >
          Track your wedding planning progress with our comprehensive checklist
        </Typography>
        
        {/* Accent line at the top */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: -8, 
            left: 0, 
            width: '100%', 
            height: '2px', 
            background: 'linear-gradient(to right, #054697, #E8B4B4)' 
          }} 
        />
      </Box>

      {/* Progress section with improved styling */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 6, 
          borderRadius: 0,
          border: '1px solid rgba(5, 70, 151, 0.1)',
          boxShadow: '0 4px 20px rgba(5, 70, 151, 0.05)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            backgroundColor: '#054697',
          }
        }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontFamily: "'Giaza', serif", 
                  color: '#054697',
                  letterSpacing: '-0.05em',
                  mb: 1
                }}
              >
                {weddingDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#054697', 
                  opacity: 0.8,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 300
                }}
              >
                Your wedding date
              </Typography>
            </Box>
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
                backgroundColor: '#E8B4B4',
                color: '#054697',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                textTransform: 'uppercase',
                borderRadius: 0
              }}
            >
              Change Wedding Date
            </button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontFamily: "'Giaza', serif", 
                  color: '#054697',
                  letterSpacing: '-0.05em',
                  mb: 1
                }}
              >
                {daysLeft} days left
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#054697', 
                  opacity: 0.8,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 300,
                  mb: 2
                }}
              >
                Until your special day
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  mr: 2,
                  color: '#054697', 
                  opacity: 0.8,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 300
                }}
              >
                {progress}% complete
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 0,
                    backgroundColor: 'rgba(5, 70, 151, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#E8B4B4',
                    }
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Category filter section with improved styling */}
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip 
          label="All Categories" 
          onClick={() => setActiveCategory('')}
          sx={{ 
            backgroundColor: activeCategory === '' ? '#E8B4B4' : 'transparent',
            color: '#054697',
            border: '1px solid #E8B4B4',
            borderRadius: 0,
            '&:hover': {
              backgroundColor: activeCategory === '' ? '#E8B4B4' : 'rgba(232, 180, 180, 0.1)',
            },
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 400,
            textTransform: 'uppercase',
            fontSize: '0.75rem'
          }}
        />
        
        {categories.map((category) => (
          <Chip 
            key={category}
            icon={categoryIcons[category] as React.ReactElement}
            label={category}
            onClick={() => setActiveCategory(category === activeCategory ? '' : category)}
            sx={{ 
              backgroundColor: category === activeCategory ? '#E8B4B4' : 'transparent',
              color: '#054697',
              border: '1px solid #E8B4B4',
              borderRadius: 0,
              '&:hover': {
                backgroundColor: category === activeCategory ? '#E8B4B4' : 'rgba(232, 180, 180, 0.1)',
              },
              '& .MuiChip-icon': {
                color: '#054697',
              },
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              textTransform: 'uppercase',
              fontSize: '0.75rem'
            }}
          />
        ))}
      </Box>

      {/* Quarter navigation */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        {[1, 2, 3, 4].map(quarter => (
          <button
            key={quarter}
            onClick={() => setActiveQuarter(quarter)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeQuarter === quarter ? '#E8B4B4' : '#f0f0f0',
              color: activeQuarter === quarter ? '#054697' : '#054697',
              opacity: activeQuarter === quarter ? 1 : 0.8,
              border: 'none',
              borderRadius: 0,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              textTransform: 'uppercase'
            }}
          >
            Quarter {quarter}
          </button>
        ))}
      </Box>
        
      {/* Timeline */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 0,
          border: '1px solid rgba(5, 70, 151, 0.1)',
          boxShadow: '0 4px 20px rgba(5, 70, 151, 0.05)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            backgroundColor: '#054697',
          }
        }}
      >
        {Object.entries(groupedItems[activeQuarter] || {})
          .sort(([deadlineA], [deadlineB]) => getDeadlineOrder(deadlineA as TimelineItem['deadline']) - getDeadlineOrder(deadlineB as TimelineItem['deadline']))
          .map(([deadline, items]) => (
            <Box key={deadline} sx={{ mb: 4 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  pb: 1, 
                  borderBottom: '2px solid',
                  borderImage: 'linear-gradient(45deg, #054697, #E8B4B4) 1',
                  display: 'inline-block',
                  fontFamily: "'Giaza', serif",
                  color: '#054697',
                  letterSpacing: '-0.05em'
                }}
              >
                {deadline} Deadline
              </Typography>
              <Grid container spacing={2}>
                {items.map((item: CategorizedTimelineItem) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        height: '100%',
                        borderRadius: 0,
                        border: '1px solid rgba(5, 70, 151, 0.1)',
                        boxShadow: '0 4px 20px rgba(5, 70, 151, 0.05)',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '4px',
                          height: '100%',
                          backgroundColor: '#054697',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                        <Chip 
                          icon={categoryIcons[item.category] as React.ReactElement}
                          label={item.category} 
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(5, 70, 151, 0.1)',
                            color: '#054697',
                            border: '1px solid #E8B4B4',
                            borderRadius: 0,
                            '&:hover': {
                              backgroundColor: 'rgba(232, 180, 180, 0.1)',
                            },
                            '& .MuiChip-icon': {
                              color: '#054697',
                            },
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 400,
                            textTransform: 'uppercase',
                            fontSize: '0.75rem'
                          }}
                        />
                        <button
                          onClick={() => {
                            const nextStatus: Record<TimelineItem['status'], TimelineItem['status']> = {
                              'NOT STARTED': 'IN PROGRESS',
                              'IN PROGRESS': 'COMPLETED',
                              'COMPLETED': 'NOT STARTED'
                            };
                            handleUpdateTaskStatus(item.id, nextStatus[item.status]);
                          }}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#E8B4B4',
                            color: '#054697',
                            border: 'none',
                            borderRadius: 0,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 400,
                            textTransform: 'uppercase'
                          }}
                        >
                          {getStatusIcon(item.status)}
                        </button>
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'Poppins, sans-serif', color: '#054697' }}>
                        {item.task}
                      </Typography>
                      {item.note && (
                        <Typography variant="body2" sx={{ color: '#054697', opacity: 0.8, fontFamily: 'Poppins, sans-serif', fontWeight: 300, mb: 1 }}>
                          {item.note}
                        </Typography>
                      )}
                      {item.condition && (
                        <Typography variant="caption" sx={{ color: '#054697', opacity: 0.5, fontStyle: 'italic', display: 'block', fontFamily: 'Poppins, sans-serif' }}>
                          {item.condition}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        
        {/* Empty state */}
        {(!groupedItems[activeQuarter] || Object.keys(groupedItems[activeQuarter]).length === 0) && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" sx={{ color: '#054697', opacity: 0.8, fontFamily: 'Poppins, sans-serif', fontWeight: 300, mb: 2 }}>
              No tasks found for this quarter
            </Typography>
            {activeCategory && (
              <Typography variant="body2" sx={{ color: '#054697', opacity: 0.5, fontFamily: 'Poppins, sans-serif', fontWeight: 300 }}>
                Try selecting a different category or quarter
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
}
