import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  useTheme,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { getSupabase } from '../../supabaseClient';

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
}

interface VenueSelectorProps {
  venues: Venue[];
  venueRooms: VenueRoom[];
  selectedVenue: Venue | null;
  selectedRoom: VenueRoom | null;
  onVenueChange: (venue: Venue) => void;
  onRoomChange: (room: VenueRoom) => void;
  onAddVenue: (name: string, address: string) => Promise<void>;
  onAddRoom: (name: string, width: number, length: number) => Promise<void>;
}

const VenueSelector: React.FC<VenueSelectorProps> = ({
  venues,
  venueRooms,
  selectedVenue,
  selectedRoom,
  onVenueChange,
  onRoomChange,
  onAddVenue,
  onAddRoom
}) => {
  const theme = useTheme();
  const [showAddVenueDialog, setShowAddVenueDialog] = useState(false);
  const [showAddRoomDialog, setShowAddRoomDialog] = useState(false);
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueAddress, setNewVenueAddress] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomWidth, setNewRoomWidth] = useState(50);
  const [newRoomLength, setNewRoomLength] = useState(80);

  const handleVenueChange = (event: SelectChangeEvent<string>) => {
    const venueId = event.target.value;
    const venue = venues.find(v => v.id === venueId);
    if (venue) {
      onVenueChange(venue);
    }
  };

  const handleRoomChange = (event: SelectChangeEvent<string>) => {
    const roomId = event.target.value;
    const room = venueRooms.find(r => r.id === roomId);
    if (room) {
      onRoomChange(room);
    }
  };

  const handleAddVenueSubmit = async () => {
    await onAddVenue(newVenueName, newVenueAddress);
    setNewVenueName('');
    setNewVenueAddress('');
    setShowAddVenueDialog(false);
  };

  const handleAddRoomSubmit = async () => {
    await onAddRoom(newRoomName, newRoomWidth, newRoomLength);
    setNewRoomName('');
    setShowAddRoomDialog(false);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2, 
          fontFamily: "'Giaza', serif",
          color: theme.palette.primary.main,
          letterSpacing: '-0.05em',
        }}
      >
        Venue Layout
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: theme.palette.primary.main,
              fontWeight: 500 
            }}
          >
            Select Venue
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setShowAddVenueDialog(true)}
            sx={{
              color: theme.palette.primary.main,
              borderColor: theme.palette.accent.rose,
              '&:hover': {
                backgroundColor: theme.palette.accent.rose,
              }
            }}
          >
            Add
          </Button>
        </Box>
        
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <Select
            value={selectedVenue?.id || ''}
            onChange={handleVenueChange}
            displayEmpty
            sx={{ 
              borderRadius: 0,
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(5, 70, 151, 0.2)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(5, 70, 151, 0.3)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
              },
              color: theme.palette.primary.main
            }}
          >
            <MenuItem value="" disabled>
              <em>Select a venue</em>
            </MenuItem>
            {venues.map((venue) => (
              <MenuItem key={venue.id} value={venue.id}>
                {venue.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {selectedVenue && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              backgroundColor: 'rgba(5, 70, 151, 0.05)',
              border: '1px solid rgba(5, 70, 151, 0.1)',
              mb: 3
            }}
          >
            <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>
              {selectedVenue.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <LocationOnIcon sx={{ fontSize: '1rem', mr: 0.5, color: theme.palette.primary.main }} />
              <Typography variant="body2" sx={{ color: theme.palette.primary.main, opacity: 0.8 }}>
                {selectedVenue.address}
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {selectedVenue && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 500 
              }}
            >
              Select Room
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setShowAddRoomDialog(true)}
              sx={{
                color: theme.palette.primary.main,
                borderColor: theme.palette.accent.rose,
                '&:hover': {
                  backgroundColor: theme.palette.accent.rose,
                }
              }}
            >
              Add
            </Button>
          </Box>
          
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <Select
              value={selectedRoom?.id || ''}
              onChange={handleRoomChange}
              displayEmpty
              sx={{ 
                borderRadius: 0,
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(5, 70, 151, 0.2)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(5, 70, 151, 0.3)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
                color: theme.palette.primary.main
              }}
            >
              <MenuItem value="" disabled>
                <em>Select a room</em>
              </MenuItem>
              {venueRooms.map((room) => (
                <MenuItem key={room.id} value={room.id}>
                  {room.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {selectedRoom && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                backgroundColor: 'rgba(5, 70, 151, 0.05)',
                border: '1px solid rgba(5, 70, 151, 0.1)',
              }}
            >
              <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>
                {selectedRoom.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <MeetingRoomIcon sx={{ fontSize: '1rem', mr: 0.5, color: theme.palette.primary.main }} />
                <Typography variant="body2" sx={{ color: theme.palette.primary.main, opacity: 0.8 }}>
                  {selectedRoom.width} x {selectedRoom.length} ft
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
      )}
      
      {/* Room layout visualization would go here */}
      {selectedRoom && (
        <Box sx={{ flex: 1, border: '1px dashed rgba(5, 70, 151, 0.3)', p: 2, position: 'relative' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              color: theme.palette.primary.main,
              opacity: 0.6
            }}
          >
            Room Layout Preview
          </Typography>
        </Box>
      )}
      
      {/* Add Venue Dialog */}
      <Dialog 
        open={showAddVenueDialog} 
        onClose={() => setShowAddVenueDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 0,
            p: 1,
            boxShadow: '0 4px 20px rgba(5, 70, 151, 0.1)',
            border: '1px solid rgba(5, 70, 151, 0.1)',
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
          }
        }}
      >
        <DialogTitle sx={{ color: theme.palette.primary.main, fontFamily: "'Giaza', serif", letterSpacing: '-0.05em' }}>
          Add New Venue
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Venue Name"
            fullWidth
            value={newVenueName}
            onChange={(e) => setNewVenueName(e.target.value)}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(5, 70, 151, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(5, 70, 151, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
              '& .MuiInputLabel-root': {
                color: theme.palette.primary.main,
                opacity: 0.8
              }
            }}
          />
          <TextField
            margin="dense"
            label="Address"
            fullWidth
            value={newVenueAddress}
            onChange={(e) => setNewVenueAddress(e.target.value)}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(5, 70, 151, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(5, 70, 151, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
              '& .MuiInputLabel-root': {
                color: theme.palette.primary.main,
                opacity: 0.8
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowAddVenueDialog(false)}
            sx={{ color: theme.palette.primary.main }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddVenueSubmit}
            variant="contained"
            sx={{ 
              backgroundColor: theme.palette.accent.rose,
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: '#FFD5CC',
              }
            }}
          >
            Add Venue
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Room Dialog */}
      <Dialog 
        open={showAddRoomDialog} 
        onClose={() => setShowAddRoomDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 0,
            p: 1,
            boxShadow: '0 4px 20px rgba(5, 70, 151, 0.1)',
            border: '1px solid rgba(5, 70, 151, 0.1)',
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
          }
        }}
      >
        <DialogTitle sx={{ color: theme.palette.primary.main, fontFamily: "'Giaza', serif", letterSpacing: '-0.05em' }}>
          Add New Room
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Room Name"
            fullWidth
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(5, 70, 151, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(5, 70, 151, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
              '& .MuiInputLabel-root': {
                color: theme.palette.primary.main,
                opacity: 0.8
              }
            }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              margin="dense"
              label="Width (ft)"
              type="number"
              value={newRoomWidth}
              onChange={(e) => setNewRoomWidth(Number(e.target.value))}
              sx={{ 
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(5, 70, 151, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(5, 70, 151, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.primary.main,
                  opacity: 0.8
                }
              }}
            />
            <TextField
              margin="dense"
              label="Length (ft)"
              type="number"
              value={newRoomLength}
              onChange={(e) => setNewRoomLength(Number(e.target.value))}
              sx={{ 
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(5, 70, 151, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(5, 70, 151, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.primary.main,
                  opacity: 0.8
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowAddRoomDialog(false)}
            sx={{ color: theme.palette.primary.main }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddRoomSubmit}
            variant="contained"
            sx={{ 
              backgroundColor: theme.palette.accent.rose,
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: '#FFD5CC',
              }
            }}
          >
            Add Room
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VenueSelector;
