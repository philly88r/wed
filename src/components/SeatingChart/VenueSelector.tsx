import React, { useState, useEffect } from 'react';
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
  SelectChangeEvent,
  CircularProgress,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import UploadIcon from '@mui/icons-material/Upload';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import { getSupabase } from '../../supabaseClient';

interface Venue {
  id: string;
  name: string;
  address: string;
  created_at: string;
  floor_plan_id?: string;
}

interface VenueRoom {
  id: string;
  venue_id: string;
  name: string;
  width: number;
  length: number;
  floor_plan_url?: string;
}

interface FloorPlan {
  id: string;
  name: string;
  image_url: string;
  created_at: string;
  created_by: string;
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
  onFloorPlanUpload?: (venueId: string, file: File) => Promise<void>;
}

const VenueSelector: React.FC<VenueSelectorProps> = ({
  venues,
  venueRooms,
  selectedVenue,
  selectedRoom,
  onVenueChange,
  onRoomChange,
  onAddVenue,
  onAddRoom,
  onFloorPlanUpload
}) => {
  const theme = useTheme();
  const [showAddVenueDialog, setShowAddVenueDialog] = useState(false);
  const [showAddRoomDialog, setShowAddRoomDialog] = useState(false);
  const [showFloorPlanDialog, setShowFloorPlanDialog] = useState(false);
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueAddress, setNewVenueAddress] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomWidth, setNewRoomWidth] = useState(50);
  const [newRoomLength, setNewRoomLength] = useState(80);
  const [uploading, setUploading] = useState(false);
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Fetch floor plans when component mounts
  useEffect(() => {
    if (selectedVenue) {
      fetchFloorPlans();
    }
  }, [selectedVenue]);
  
  const fetchFloorPlans = async () => {
    if (!selectedVenue) return;
    
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('floor_plans')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setFloorPlans(data || []);
    } catch (error) {
      console.error('Error fetching floor plans:', error);
    }
  };

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
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };
  
  const handleFloorPlanUpload = async () => {
    if (!selectedFile || !selectedVenue || !onFloorPlanUpload) return;
    
    try {
      setUploading(true);
      await onFloorPlanUpload(selectedVenue.id, selectedFile);
      setSelectedFile(null);
      setShowFloorPlanDialog(false);
      fetchFloorPlans();
    } catch (error) {
      console.error('Error uploading floor plan:', error);
    } finally {
      setUploading(false);
    }
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
          <Box sx={{ display: 'flex', gap: 1 }}>
            {selectedVenue && (
              <Button
                size="small"
                startIcon={<UploadIcon />}
                onClick={() => setShowFloorPlanDialog(true)}
                sx={{
                  color: theme.palette.primary.main,
                  borderColor: theme.palette.accent.rose,
                  '&:hover': {
                    backgroundColor: theme.palette.accent.rose,
                  }
                }}
              >
                Floor Plan
              </Button>
            )}
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

      {/* Floor Plan Upload Dialog */}
      <Dialog
        open={showFloorPlanDialog}
        onClose={() => setShowFloorPlanDialog(false)}
        maxWidth="sm"
        fullWidth
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
          Upload Venue Floor Plan
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'rgba(5, 70, 151, 0.8)' }}>
            Upload a floor plan image for {selectedVenue?.name}. This will help you position tables accurately.
          </Typography>
          
          <Box sx={{ 
            border: '2px dashed rgba(5, 70, 151, 0.3)', 
            borderRadius: 1, 
            p: 3, 
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(5, 70, 151, 0.05)'
          }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="floor-plan-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="floor-plan-upload">
              <Button
                component="span"
                startIcon={<UploadIcon />}
                sx={{ 
                  mb: 1,
                  backgroundColor: theme.palette.accent.rose,
                  color: theme.palette.primary.main,
                  '&:hover': { backgroundColor: '#FFD5CC' }
                }}
              >
                Select Image
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1, color: theme.palette.primary.main }}>
                {selectedFile.name}
              </Typography>
            )}
          </Box>
          
          {floorPlans.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, color: theme.palette.primary.main }}>
                Existing Floor Plans
              </Typography>
              <Box sx={{ maxHeight: '150px', overflowY: 'auto', mb: 2 }}>
                {floorPlans.map((plan) => (
                  <Box key={plan.id} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 1, 
                    mb: 1, 
                    border: '1px solid rgba(5, 70, 151, 0.1)',
                    borderRadius: 1
                  }}>
                    <ImageIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="body2" sx={{ flex: 1, color: theme.palette.primary.main }}>
                      {plan.name}
                    </Typography>
                    <IconButton size="small" sx={{ color: theme.palette.primary.main }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowFloorPlanDialog(false)}
            sx={{ color: theme.palette.primary.main }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleFloorPlanUpload}
            disabled={!selectedFile || uploading}
            variant="contained"
            sx={{ 
              backgroundColor: theme.palette.accent.rose,
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: '#FFD5CC',
              }
            }}
          >
            {uploading ? <CircularProgress size={24} sx={{ color: theme.palette.primary.main }} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VenueSelector;
