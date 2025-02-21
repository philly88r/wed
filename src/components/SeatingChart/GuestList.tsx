import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Draggable } from 'react-beautiful-dnd';

interface Guest {
  id: string;
  name: string;
  table_id?: string;
}

interface GuestListProps {
  guests: Guest[];
  onAddGuest: (name: string) => void;
}

export default function GuestList({ guests, onAddGuest }: GuestListProps) {
  const [newGuestName, setNewGuestName] = useState('');
  const [filter, setFilter] = useState('');

  const handleAddGuest = () => {
    if (newGuestName.trim()) {
      onAddGuest(newGuestName.trim());
      setNewGuestName('');
    }
  };

  const filteredGuests = guests.filter(guest => 
    guest.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Guests
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search guests..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ mb: 1 }}
        />
        
        <Box sx={{ display: 'flex', gap: 1 }}>
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
            startIcon={<AddIcon />}
            onClick={handleAddGuest}
            disabled={!newGuestName.trim()}
          >
            Add
          </Button>
        </Box>
      </Box>

      <Divider />

      <List sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        '& .MuiListItem-root': {
          px: 1,
          py: 0.5,
        }
      }}>
        {filteredGuests.map((guest, index) => (
          <Draggable key={guest.id} draggableId={guest.id} index={index}>
            {(provided) => (
              <ListItem
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                sx={{
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemText 
                  primary={guest.name}
                  primaryTypographyProps={{
                    sx: { fontWeight: guest.table_id ? 'normal' : 'bold' }
                  }}
                />
              </ListItem>
            )}
          </Draggable>
        ))}
      </List>
    </Paper>
  );
}
