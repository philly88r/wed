import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  TextField,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { TimelineEvent } from '../utils/timelineCreatorUtils';

interface TimelineTableProps {
  events: TimelineEvent[];
  onUpdateEvent: (index: number, updatedEvent: TimelineEvent) => void;
  onDeleteEvent: (index: number) => void;
}

const TimelineTable = ({ events, onUpdateEvent, onDeleteEvent }: TimelineTableProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedEvent, setEditedEvent] = useState<TimelineEvent | null>(null);

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setEditedEvent({ ...events[index] });
  };

  const handleSaveClick = () => {
    if (editingIndex !== null && editedEvent) {
      onUpdateEvent(editingIndex, editedEvent);
      setEditingIndex(null);
      setEditedEvent(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditedEvent(null);
  };

  const handleInputChange = (field: keyof TimelineEvent, value: string) => {
    if (editedEvent) {
      setEditedEvent({
        ...editedEvent,
        [field]: value
      });
    }
  };

  const handleDeleteClick = (index: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      onDeleteEvent(index);
    }
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Wedding Day Timeline
      </Typography>
      
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="wedding timeline table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Event</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '45%' }}>Notes</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event, index) => (
              <TableRow 
                key={index}
                sx={{ 
                  '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' }
                }}
              >
                <TableCell>
                  {editingIndex === index ? (
                    <TextField
                      fullWidth
                      variant="standard"
                      value={editedEvent?.time || ''}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      size="small"
                    />
                  ) : (
                    event.time
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <TextField
                      fullWidth
                      variant="standard"
                      value={editedEvent?.event || ''}
                      onChange={(e) => handleInputChange('event', e.target.value)}
                      size="small"
                    />
                  ) : (
                    event.event
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <TextField
                      fullWidth
                      variant="standard"
                      value={editedEvent?.notes || ''}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      size="small"
                      multiline
                    />
                  ) : (
                    event.notes
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <TextField
                      fullWidth
                      variant="standard"
                      value={editedEvent?.category || ''}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      size="small"
                    />
                  ) : (
                    event.category
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <Box>
                      <IconButton 
                        onClick={handleSaveClick} 
                        size="small" 
                        color="primary"
                        title="Save changes"
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton 
                        onClick={handleCancelEdit} 
                        size="small" 
                        color="error"
                        title="Cancel"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box>
                      <IconButton 
                        onClick={() => handleEditClick(index)} 
                        size="small" 
                        color="primary"
                        title="Edit event"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteClick(index)} 
                        size="small" 
                        color="error"
                        title="Delete event"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TimelineTable;
