import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Guest } from '../../types/Guest';

interface GuestListProps {
  guests: Guest[];
  onAddGuest: (name: string) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
}

export default function GuestList({ guests, onAddGuest, filter, onFilterChange }: GuestListProps) {
  const [newGuestName, setNewGuestName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [addGuestDialogOpen, setAddGuestDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleAddGuest = () => {
    if (newGuestName.trim()) {
      onAddGuest(newGuestName.trim());
      setNewGuestName('');
      setAddGuestDialogOpen(false);
    }
  };

  const filteredGuests = guests.filter(guest => 
    `${guest.first_name} ${guest.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // No need for onDragEnd here as it's handled in the parent component

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Guests
        </Typography>
        
        {/* Desktop guest addition form */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Add a guest..."
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddGuest();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddGuest}
              disabled={!newGuestName.trim()}
            >
              Add guest
            </Button>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Tabs 
            value={filter} 
            onChange={(_, value) => onFilterChange(value)}
            sx={{ flexGrow: 1 }}
          >
            <Tab label="All" value="all" />
            <Tab label="Pending" value="pending" />
          </Tabs>
          <IconButton onClick={() => setShowSearch(!showSearch)}>
            <SearchIcon />
          </IconButton>
        </Box>

        {showSearch && (
          <TextField
            fullWidth
            size="small"
            placeholder="Search guests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />
        )}
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Droppable droppableId="guests-list">
            {(provided) => (
              <List 
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{ 
                  width: '100%', 
                  bgcolor: 'background.paper',
                  '& .MuiListItem-root': {
                    px: 1,
                    py: 0.5,
                  }
                }}
              >
                {filteredGuests.length === 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'text.secondary'
                  }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      No guests found
                    </Typography>
                    <Typography variant="body2">
                      Add guests to your Guest List then
                    </Typography>
                    <Typography variant="body2">
                      click and drag each to a table.
                    </Typography>
                  </Box>
                ) : (
                  filteredGuests.map((guest, index) => (
                    <Draggable key={guest.id} draggableId={guest.id} index={index}>
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            mb: 0.5,
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          <ListItemText 
                            primary={`${guest.first_name} ${guest.last_name}`}
                            primaryTypographyProps={{
                              sx: { 
                                fontWeight: guest.table_id ? 'normal' : 'bold',
                                color: guest.table_id ? 'text.primary' : 'primary.main'
                              }
                            }}
                            secondary={guest.table_id ? 'Assigned' : 'Unassigned'}
                          />
                        </ListItem>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
      </Box>

      {/* Mobile floating action button for adding guests */}
      {isMobile && (
        <Fab 
          color="primary" 
          aria-label="add guest"
          onClick={() => setAddGuestDialogOpen(true)}
          sx={{ 
            position: 'absolute', 
            bottom: 16, 
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Add Guest Dialog for Mobile */}
      <Dialog 
        open={addGuestDialogOpen} 
        onClose={() => setAddGuestDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Add New Guest</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Guest Name"
            fullWidth
            value={newGuestName}
            onChange={(e) => setNewGuestName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddGuest();
              }
            }}
            placeholder="First Last"
            helperText="Enter the guest's full name"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddGuestDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddGuest} 
            variant="contained"
            disabled={!newGuestName.trim()}
          >
            Add Guest
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
