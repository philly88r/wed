import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { supabase } from '../lib/supabase';
import GuestList from '../components/SeatingChart/GuestList';

interface Table {
  id: string;
  name: string;
  seats: number;
  shape?: string;
  color?: string;
  position: {
    x: number;
    y: number;
  };
  guests?: Guest[];
}

interface Guest {
  id: string;
  name: string;
  table_id?: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

export default function SeatingChart() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [tabValue, setTabValue] = useState(1);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [guests, setGuests] = useState<Guest[]>([]);

  useEffect(() => {
    fetchTables();
    fetchGuests();
  }, []);

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('seating_tables')
        .select('*');

      if (error) throw error;

      setTables(data || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load tables',
        severity: 'error',
      });
    }
  };

  const fetchGuests = async () => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*');

      if (error) throw error;

      setGuests(data || []);
    } catch (error) {
      console.error('Error fetching guests:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load guests',
        severity: 'error',
      });
    }
  };

  const handleAddTable = async () => {
    try {
      const { data, error } = await supabase
        .from('seating_tables')
        .insert([
          {
            name: newTableName,
            seats: 8,
            position: { x: 100, y: 100 }
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setTables([...tables, data]);
      setEditDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Table added successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding table:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add table',
        severity: 'error'
      });
    }
  };

  const handleAddGuest = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;

      setGuests([...guests, data]);
      setSnackbar({
        open: true,
        message: 'Guest added successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding guest:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add guest',
        severity: 'error'
      });
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const destId = result.destination.droppableId;
    const guestId = result.draggableId;

    try {
      const { error } = await supabase
        .from('guests')
        .update({ table_id: destId })
        .eq('id', guestId);

      if (error) throw error;

      // Update local state
      const updatedGuests = guests.map(guest => 
        guest.id === guestId ? { ...guest, table_id: destId } : guest
      );
      setGuests(updatedGuests);

      setSnackbar({
        open: true,
        message: 'Guest assigned successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error assigning guest:', error);
      setSnackbar({
        open: true,
        message: 'Failed to assign guest',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth={false} sx={{ p: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Dashboard" value={0} />
          <Tab label="Seating Chart" value={1} />
        </Tabs>
      </Box>

      {tabValue === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5">Seating Chart</Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<PictureAsPdfIcon />}
                sx={{ mr: 2 }}
              >
                PDF
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedTable(null);
                  setNewTableName('');
                  setEditDialogOpen(true);
                }}
              >
                Add Table
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 200px)' }}>
            <Box sx={{ width: 300 }}>
              <GuestList
                guests={guests}
                onAddGuest={handleAddGuest}
              />
            </Box>

            <Paper 
              sx={{ 
                p: 4, 
                flexGrow: 1,
                backgroundColor: '#f5f5f5',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <DragDropContext onDragEnd={handleDragEnd}>
                <Box sx={{ position: 'relative', height: '100%' }}>
                  {tables.map((table) => (
                    <Droppable key={table.id} droppableId={table.id}>
                      {(provided) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          sx={{
                            position: 'absolute',
                            left: table.position.x,
                            top: table.position.y,
                          }}
                        >
                          <Paper
                            sx={{
                              width: 120,
                              height: 120,
                              borderRadius: '50%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'move',
                              backgroundColor: table.color || '#fff',
                              '&:hover': {
                                boxShadow: 3,
                              },
                            }}
                          >
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {table.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {table.seats} seats
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              {table.guests?.map((guest, index) => (
                                <Draggable
                                  key={guest.id}
                                  draggableId={guest.id}
                                  index={index}
                                >
                                  {(provided) => (
                                    <Chip
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      label={guest.name}
                                      size="small"
                                      sx={{ m: 0.5 }}
                                    />
                                  )}
                                </Draggable>
                              ))}
                            </Box>
                            {provided.placeholder}
                          </Paper>
                        </Box>
                      )}
                    </Droppable>
                  ))}
                </Box>
              </DragDropContext>
            </Paper>
          </Box>

          <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
            <DialogTitle>
              {selectedTable ? 'Edit Table' : 'Add New Table'}
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Table Name"
                fullWidth
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddTable} variant="contained">
                {selectedTable ? 'Save' : 'Add'}
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert severity={snackbar.severity}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </>
      )}
    </Container>
  );
}
