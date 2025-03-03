import { Container, Typography, Box, Paper, Grid, LinearProgress, Chip } from '@mui/material';
import WeddingTimeline from '../components/ui/wedding-timeline';
import { weddingChecklistData } from '../data/wedding-checklist';
import { useState, useEffect } from 'react';
import { Check, Clock, AlertTriangle, Calendar, Heart, Gift, Camera, Music, Utensils, MapPin } from 'lucide-react';
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

// Add categories to checklist items
const categorizedChecklist = weddingChecklistData.map(item => {
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
  const [checklist, setChecklist] = useState(categorizedChecklist);
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

  const handleUpdateTaskStatus = (id: string, status: 'NOT STARTED' | 'IN PROGRESS' | 'COMPLETED') => {
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

  const getStatusIcon = (status: 'NOT STARTED' | 'IN PROGRESS' | 'COMPLETED') => {
    switch (status) {
      case 'COMPLETED':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'IN PROGRESS':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'NOT STARTED':
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusClass = (status: 'NOT STARTED' | 'IN PROGRESS' | 'COMPLETED') => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'IN PROGRESS':
        return 'bg-amber-100 border-amber-300 text-amber-800';
      case 'NOT STARTED':
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  // Group items by quarter and deadline
  const groupedItems = checklist.reduce<Record<number, Record<string, typeof categorizedChecklist[0]>>>((acc, item) => {
    if (!acc[item.quarter]) {
      acc[item.quarter] = {};
    }
    
    if (!acc[item.quarter][item.deadline]) {
      acc[item.quarter][item.deadline] = [];
    }
    
    // Only add if no category filter or matching category
    if (!activeCategory || (item as any).category === activeCategory) {
      acc[item.quarter][item.deadline].push(item);
    }
    
    return acc;
  }, {});

  // Get all unique categories
  const categories = Array.from(new Set(categorizedChecklist.map(item => (item as any).category)));

  // Get deadline order for sorting
  const getDeadlineOrder = (deadline: typeof categorizedChecklist[0]['deadline']) => {
    const order: Record<typeof categorizedChecklist[0]['deadline'], number> = {
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
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography 
          variant="h2" 
          sx={{ 
            fontFamily: "'Playfair Display', serif",
            mb: 2,
            background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Your Wedding Journey
        </Typography>
        <Typography 
          variant="h5" 
          sx={{ 
            fontFamily: "'Lato', sans-serif",
            fontWeight: 300,
            mb: 4
          }}
        >
          A beautiful path to your special day
        </Typography>
      </Box>
      
      {/* Dashboard */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" sx={{ fontFamily: "'Playfair Display', serif", mb: 1 }}>
                {weddingDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
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
                background: 'linear-gradient(45deg, #9c27b0 30%, #d81b60 90%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 3px 5px 2px rgba(156, 39, 176, .3)',
                transition: 'all 0.3s ease',
                fontWeight: 'bold'
              }}
            >
              Change Wedding Date
            </button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" sx={{ fontFamily: "'Playfair Display', serif", mb: 1 }}>
                {daysLeft} days left
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                Until your special day
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {progress}% complete
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(45deg, #9c27b0 30%, #d81b60 90%)',
                      borderRadius: 5
                    }
                  }} 
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Category filters */}
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip 
          label="All Categories" 
          onClick={() => setActiveCategory(null)}
          color={activeCategory === null ? "primary" : "default"}
          sx={{ 
            fontWeight: activeCategory === null ? 'bold' : 'normal',
            '&.MuiChip-colorPrimary': {
              background: 'linear-gradient(45deg, #9c27b0 30%, #d81b60 90%)',
            }
          }}
        />
        {categories.map(category => (
          <Chip 
            key={category}
            icon={categoryIcons[category]}
            label={category} 
            onClick={() => setActiveCategory(category)}
            color={activeCategory === category ? "primary" : "default"}
            sx={{ 
              fontWeight: activeCategory === category ? 'bold' : 'normal',
              '&.MuiChip-colorPrimary': {
                background: 'linear-gradient(45deg, #9c27b0 30%, #d81b60 90%)',
              }
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
              background: activeQuarter === quarter 
                ? 'linear-gradient(45deg, #9c27b0 30%, #d81b60 90%)' 
                : '#f0f0f0',
              color: activeQuarter === quarter ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: activeQuarter === quarter 
                ? '0 3px 5px 2px rgba(156, 39, 176, .3)'
                : 'none',
              transition: 'all 0.3s ease',
              fontWeight: 'bold'
            }}
          >
            Quarter {quarter}
          </button>
        ))}
      </Box>
      
      {/* Timeline */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: '16px',
          background: 'white',
          transition: 'all 0.3s ease',
        }}
      >
        {Object.entries(groupedItems[activeQuarter] || {})
          .sort(([deadlineA], [deadlineB]) => getDeadlineOrder(deadlineA as any) - getDeadlineOrder(deadlineB as any))
          .map(([deadline, items]) => (
            <Box key={deadline} sx={{ mb: 4 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  pb: 1, 
                  borderBottom: '2px solid',
                  borderImage: 'linear-gradient(45deg, #9c27b0 30%, #d81b60 90%) 1',
                  display: 'inline-block'
                }}
              >
                {deadline} Deadline
              </Typography>
              <Grid container spacing={2}>
                {items.map(item => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        height: '100%',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                        <Chip 
                          icon={categoryIcons[(item as any).category]}
                          label={(item as any).category} 
                          size="small"
                          sx={{ 
                            background: 'rgba(156, 39, 176, 0.1)',
                            color: '#9c27b0'
                          }}
                        />
                        <button
                          onClick={() => {
                            const nextStatus: Record<'NOT STARTED' | 'IN PROGRESS' | 'COMPLETED', 'NOT STARTED' | 'IN PROGRESS' | 'COMPLETED'> = {
                              'NOT STARTED': 'IN PROGRESS',
                              'IN PROGRESS': 'COMPLETED',
                              'COMPLETED': 'NOT STARTED'
                            };
                            handleUpdateTaskStatus(item.id, nextStatus[item.status]);
                          }}
                          className={getStatusClass(item.status)}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            border: '1px solid',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          title="Click to change status"
                        >
                          {getStatusIcon(item.status)}
                        </button>
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {item.task}
                      </Typography>
                      {item.note && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          {item.note}
                        </Typography>
                      )}
                      {item.condition && (
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic', display: 'block' }}>
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
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
              No tasks found for this quarter
            </Typography>
            {activeCategory && (
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                Try selecting a different category or quarter
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
}
