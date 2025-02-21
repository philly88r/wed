import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Container,
  Chip,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface Guest {
  id: string;
  name: string;
}

interface TableGuest {
  id: string;
  name: string;
  table_id: string;
}

interface TableAssignment {
  id: string;
  guest_id: string;
  table_id: string;
  guest: Guest;
}

interface Table {
  id: string;
  name: string;
  seats: number;
  shape: string;
  color?: string;
  guests?: TableGuest[];
  position: {
    x: number;
    y: number;
  };
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

interface GuestListProps {
  guests: Guest[];
  onAddGuest: () => void;
}

function GuestList({ guests, onAddGuest }: GuestListProps) {
  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Guest List
      </Typography>
      <Button variant="contained" onClick={onAddGuest}>
        Add Guest
      </Button>
      <Box sx={{ mt: 2 }}>
        {guests.map((guest) => (
          <Typography key={guest.id} variant="body1" sx={{ mb: 1 }}>
            {guest.name}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

export default function SeatingChart() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableSeats, setNewTableSeats] = useState('8');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
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
      const { data: tablesData, error: tablesError } = await supabase
        .from('seating_tables')
        .select('*');

      if (tablesError) throw tablesError;

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('table_assignments')
        .select('*, guest:guests(*)');

      if (assignmentsError) throw assignmentsError;

      const guestsByTable = (assignmentsData as TableAssignment[]).reduce<Record<string, TableGuest[]>>((acc, assignment) => {
        const guest: TableGuest = {
          id: assignment.guest.id,
          name: assignment.guest.name,
          table_id: assignment.table_id
        };
        
        if (!acc[assignment.table_id]) {
          acc[assignment.table_id] = [];
        }
        acc[assignment.table_id].push(guest);
        return acc;
      }, {});

      const tablesWithGuests = tablesData.map(table => ({
        ...table,
        guests: guestsByTable[table.id] || [],
        position: table.position || { x: 0, y: 0 }
      }));

      setTables(tablesWithGuests);
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

      setGuests(data);
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
        .insert([{
          name: newTableName || 'New Table',
          seats: parseInt(newTableSeats) || 8,
          shape: 'circle',
          position: { x: 0, y: 0 }
        }])
        .select()
        .single();

      if (error) throw error;

      setTables([...tables, { ...data, guests: [] }]);
      setEditDialogOpen(false);
      setNewTableName('');
      setNewTableSeats('8');
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

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    try {
      const sourceTable = tables.find(t => t.id === result.source.droppableId);
      const destTable = tables.find(t => t.id === result.destination?.droppableId);
      
      if (!sourceTable || !destTable) return;

      const guest = sourceTable.guests?.find(g => g.id === result.draggableId);
      if (!guest) return;

      const { error } = await supabase
        .from('table_assignments')
        .update({ table_id: destTable.id })
        .eq('guest_id', guest.id);

      if (error) throw error;

      const newTables = tables.map(table => {
        if (table.id === sourceTable.id) {
          return {
            ...table,
            guests: table.guests?.filter(g => g.id !== guest.id)
          };
        }
        if (table.id === destTable.id) {
          return {
            ...table,
            guests: [...(table.guests || []), { ...guest, table_id: destTable.id }]
          };
        }
        return table;
      });

      setTables(newTables);
      setSnackbar({
        open: true,
        message: 'Guest moved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error moving guest:', error);
      setSnackbar({
        open: true,
        message: 'Failed to move guest',
        severity: 'error'
      });
    }
  };

  const handleAddGuest = async () => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .insert([{
          name: 'New Guest'
        }])
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

  return (
    <Container maxWidth={false} sx={{ p: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Wedding" />
          <Tab label="Chart" />
          <Tab label="List" />
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
        </>
      )}

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>{selectedTable ? 'Edit Table' : 'Add Table'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Table Name"
            fullWidth
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Number of Seats"
            type="number"
            fullWidth
            value={newTableSeats}
            onChange={(e) => setNewTableSeats(e.target.value)}
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
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
