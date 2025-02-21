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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Draggable } from 'react-beautiful-dnd';

interface Guest {
  id: string;
  name: string;
  table_id?: string;
  status?: 'pending' | 'confirmed' | 'declined';
}

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

  const handleAddGuest = () => {
    if (newGuestName.trim()) {
      onAddGuest(newGuestName.trim());
      setNewGuestName('');
    }
  };

  const filteredGuests = guests.filter(guest => 
    guest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Guests
        </Typography>
        
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

      <List sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        '& .MuiListItem-root': {
          px: 1,
          py: 0.5,
        }
      }}>
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
                    primary={guest.name}
                    primaryTypographyProps={{
                      sx: { 
                        fontWeight: guest.table_id ? 'normal' : 'bold',
                        color: guest.status === 'pending' ? 'text.secondary' : 'text.primary'
                      }
                    }}
                  />
                </ListItem>
              )}
            </Draggable>
          ))
        )}
      </List>
    </Box>
  );
}
