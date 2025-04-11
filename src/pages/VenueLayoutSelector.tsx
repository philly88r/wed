import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  useTheme,
  SelectChangeEvent,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import { getSupabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import VenueSelector from '../components/SeatingChart/VenueSelector';

interface Venue {
  id: string;
  name: string;
  address: string;
  created_at: string;
}

interface VenueRoom {
  id: string;
  venue_id: string;
  name: string;
  width: number;
  length: number;
  floor_plan_url?: string;
  room_type?: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

export default function VenueLayoutSelector() {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Venue management state
  const [venues, setVenues] = useState<Venue[]>([]);
  const [venueRooms, setVenueRooms] = useState<VenueRoom[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<VenueRoom | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });
  
  useEffect(() => {
    fetchVenues();
  }, []);
  
  // Fetch venues from the database or create sample venues if none exist
  const fetchVenues = async () => {
    try {
      setLoading(true);
      const supabase = getSupabase();
      
      // Get the current user session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        setError('Please log in to view venue layouts');
        setLoading(false);
        return;
      }
      
      // Check if venues exist
      const { data: existingVenues, error: checkError } = await supabase
        .from('venues')
        .select('*');
      
      if (checkError) {
        console.error('Error checking venues:', checkError);
        setError('Error loading venues');
        setLoading(false);
        return;
      }
      
      // If no venues exist, create sample venues
      if (!existingVenues || existingVenues.length === 0) {
        await createSampleVenues(userId);
      } else {
        setVenues(existingVenues);
        
        // If venues exist, fetch rooms for the first venue
        if (existingVenues.length > 0) {
          setSelectedVenue(existingVenues[0]);
          fetchVenueRooms(existingVenues[0].id);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching venues:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };
  
  // Create sample venues if none exist
  const createSampleVenues = async (userId: string) => {
    try {
      const supabase = getSupabase();
      
      // Sample venue data
      const sampleVenues = [
        { name: 'Grand Ballroom', address: '123 Main St, Philadelphia, PA', created_by: userId },
        { name: 'Garden Terrace', address: '456 Park Ave, Philadelphia, PA', created_by: userId },
        { name: 'Lakeside Manor', address: '789 Lake Rd, Philadelphia, PA', created_by: userId }
      ];
      
      // Insert sample venues
      const { data: venuesData, error: venuesError } = await supabase
        .from('venues')
        .insert(sampleVenues)
        .select();
      
      if (venuesError) {
        console.error('Error creating sample venues:', venuesError);
        setError('Error creating sample venues');
        return;
      }
      
      // Set venues state
      if (venuesData) {
        setVenues(venuesData);
        
        // Create sample rooms for each venue
        for (const venue of venuesData) {
          // Sample room data for this venue
          const sampleRooms = [
            { 
              venue_id: venue.id, 
              name: 'Main Hall', 
              width: 50, 
              length: 80,
              room_type: 'reception'
            },
            { 
              venue_id: venue.id, 
              name: 'Ceremony Space', 
              width: 40, 
              length: 60,
              room_type: 'ceremony'
            }
          ];
          
          // Insert sample rooms
          await supabase
            .from('venue_rooms')
            .insert(sampleRooms);
        }
        
        // Select the first venue and fetch its rooms
        if (venuesData.length > 0) {
          setSelectedVenue(venuesData[0]);
          fetchVenueRooms(venuesData[0].id);
        }
      }
    } catch (err) {
      console.error('Error creating sample venues:', err);
      setError('Error creating sample venues');
    }
  };
  
  // Fetch rooms for a specific venue
  const fetchVenueRooms = async (venueId: string) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('venue_rooms')
        .select('*')
        .eq('venue_id', venueId);
      
      if (error) {
        console.error('Error fetching venue rooms:', error);
        setSnackbar({
          open: true,
          message: 'Error loading rooms',
          severity: 'error'
        });
        return;
      }
      
      setVenueRooms(data || []);
      
      // Select the first room if available
      if (data && data.length > 0) {
        setSelectedRoom(data[0]);
      } else {
        setSelectedRoom(null);
      }
    } catch (err) {
      console.error('Error:', err);
      setSnackbar({
        open: true,
        message: 'Error loading rooms',
        severity: 'error'
      });
    }
  };
  
  // Handle venue change
  const handleVenueChange = (venue: Venue) => {
    setSelectedVenue(venue);
    fetchVenueRooms(venue.id);
  };
  
  // Handle room change
  const handleRoomChange = (room: VenueRoom) => {
    setSelectedRoom(room);
  };
  
  // Handle adding a new venue
  const handleAddVenue = async (name: string, address: string) => {
    try {
      if (!name.trim()) {
        setSnackbar({
          open: true,
          message: 'Please enter a venue name',
          severity: 'error'
        });
        return;
      }
      
      const supabase = getSupabase();
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        setSnackbar({
          open: true,
          message: 'Please log in to add venues',
          severity: 'error'
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('venues')
        .insert({
          name,
          address,
          created_by: userId
        })
        .select();
      
      if (error) {
        console.error('Error adding venue:', error);
        setSnackbar({
          open: true,
          message: 'Error adding venue',
          severity: 'error'
        });
        return;
      }
      
      if (data && data.length > 0) {
        // Add the new venue to the state
        setVenues(prev => [...prev, data[0]]);
        setSelectedVenue(data[0]);
        
        setSnackbar({
          open: true,
          message: 'Venue added successfully',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error adding venue:', err);
      setSnackbar({
        open: true,
        message: 'Error adding venue',
        severity: 'error'
      });
    }
  };
  
  // Handle adding a new room to a venue
  const handleAddRoom = async (name: string, width: number, length: number) => {
    try {
      if (!selectedVenue) {
        setSnackbar({
          open: true,
          message: 'Please select a venue first',
          severity: 'error'
        });
        return;
      }
      
      if (!name.trim()) {
        setSnackbar({
          open: true,
          message: 'Please enter a room name',
          severity: 'error'
        });
        return;
      }
      
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('venue_rooms')
        .insert({
          venue_id: selectedVenue.id,
          name,
          width,
          length,
          room_type: 'reception'
        })
        .select();
      
      if (error) {
        console.error('Error adding room:', error);
        setSnackbar({
          open: true,
          message: 'Error adding room',
          severity: 'error'
        });
        return;
      }
      
      if (data && data.length > 0) {
        // Add the new room to the state
        setVenueRooms(prev => [...prev, data[0]]);
        setSelectedRoom(data[0]);
        
        setSnackbar({
          open: true,
          message: 'Room added successfully',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error adding room:', err);
      setSnackbar({
        open: true,
        message: 'Error adding room',
        severity: 'error'
      });
    }
  };
  
  // Go to seating chart with selected venue and room
  const handleGoToSeatingChart = () => {
    if (selectedVenue && selectedRoom) {
      navigate('/seating-chart', { 
        state: { 
          venueId: selectedVenue.id, 
          roomId: selectedRoom.id 
        } 
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Please select a venue and room first',
        severity: 'error'
      });
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button 
          variant="contained" 
          onClick={() => fetchVenues()}
          sx={{ 
            backgroundColor: theme.palette.accent.rose,
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: '#FFD5CC',
            }
          }}
        >
          Try Again
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box 
        sx={{ 
          mb: 4, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'relative',
          pb: 2,
          borderBottom: '1px solid rgba(5, 70, 151, 0.1)',
        }}
      >
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontFamily: "'Giaza', serif", 
              color: theme.palette.primary.main,
              letterSpacing: '-0.05em',
              mb: 1
            }}
          >
            Venue Layout
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: theme.palette.primary.main, 
              opacity: 0.8,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 300
            }}
          >
            Select a venue and room to create your seating chart
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          onClick={handleGoToSeatingChart}
          disabled={!selectedVenue || !selectedRoom}
          startIcon={<TableRestaurantIcon />}
          sx={{
            backgroundColor: theme.palette.accent.rose,
            color: theme.palette.primary.main,
            textTransform: 'uppercase',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 400,
            borderRadius: 0,
            px: 3,
            py: 1,
            '&:hover': {
              backgroundColor: '#FFD5CC',
            },
            '&.Mui-disabled': {
              backgroundColor: 'rgba(232, 180, 180, 0.5)',
              color: 'rgba(5, 70, 151, 0.5)',
            }
          }}
        >
          Go to Seating Chart
        </Button>
      </Box>
      
      {/* Main content */}
      <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 200px)' }}>
        {/* Venue selector sidebar */}
        <Paper 
          sx={{ 
            flex: 1, 
            p: 2, 
            height: '100%', 
            overflow: 'auto',
            borderRadius: 0,
            border: '1px solid rgba(5, 70, 151, 0.1)',
            boxShadow: '0 4px 20px rgba(5, 70, 151, 0.05)',
            backgroundColor: '#FBFBF7',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              backgroundColor: theme.palette.primary.main,
            }
          }}
        >
          <VenueSelector 
            venues={venues}
            venueRooms={venueRooms}
            selectedVenue={selectedVenue}
            selectedRoom={selectedRoom}
            onVenueChange={handleVenueChange}
            onRoomChange={handleRoomChange}
            onAddVenue={handleAddVenue}
            onAddRoom={handleAddRoom}
          />
        </Paper>
        
        {/* Room preview */}
        <Paper 
          sx={{ 
            flex: 3, 
            p: 3, 
            position: 'relative', 
            overflow: 'auto',
            borderRadius: 0,
            border: '1px solid rgba(5, 70, 151, 0.1)',
            boxShadow: '0 4px 20px rgba(5, 70, 151, 0.05)',
            backgroundColor: '#FBFBF7',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              backgroundColor: theme.palette.primary.main,
            }
          }}
        >
          {selectedRoom ? (
            <Box sx={{ height: '100%', position: 'relative' }}>
              <Box sx={{ 
                position: 'absolute', 
                top: 10, 
                left: 10, 
                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                p: 1,
                border: '1px solid rgba(5, 70, 151, 0.1)',
              }}>
                <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>
                  {selectedRoom.name}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.primary.main, opacity: 0.8 }}>
                  {selectedRoom.width} x {selectedRoom.length} ft
                </Typography>
              </Box>
              
              <Box 
                sx={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px dashed rgba(5, 70, 151, 0.3)',
                  backgroundColor: 'rgba(5, 70, 151, 0.02)'
                }}
              >
                <Box 
                  sx={{ 
                    width: `${Math.min(selectedRoom.width * 5, 600)}px`,
                    height: `${Math.min(selectedRoom.length * 5, 400)}px`,
                    border: '2px solid rgba(5, 70, 151, 0.3)',
                    position: 'relative',
                    backgroundColor: 'white'
                  }}
                >
                  <Typography 
                    sx={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: '50%', 
                      transform: 'translate(-50%, -50%)',
                      color: theme.palette.primary.main,
                      opacity: 0.6
                    }}
                  >
                    Click "Go to Seating Chart" to arrange tables
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              flexDirection: 'column',
              gap: 2
            }}>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main, opacity: 0.6 }}>
                Select a venue and room to view layout
              </Typography>
              <MeetingRoomIcon sx={{ fontSize: 60, color: theme.palette.primary.main, opacity: 0.3 }} />
            </Box>
          )}
        </Paper>
      </Box>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%', 
            borderRadius: 0,
            backgroundColor: snackbar.severity === 'success' ? 'rgba(232, 180, 180, 0.9)' : undefined,
            color: snackbar.severity === 'success' ? theme.palette.primary.main : undefined,
            '& .MuiAlert-icon': {
              color: snackbar.severity === 'success' ? theme.palette.primary.main : undefined,
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
