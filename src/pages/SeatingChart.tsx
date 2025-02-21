import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DropResult } from 'react-beautiful-dnd';

interface TableGuest {
  id: string;
  name: string;
  table_id: string;
}

interface Table {
  id: string;
  name: string;
  shape: 'round' | 'rectangular' | 'square' | 'oval';
  seats: number;
  guests: TableGuest[];
  color?: string;
  notes?: string;
}

export default function SeatingChart() {
  const [tables, setTables] = useState<Table[]>([]);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [availableGuests, setAvailableGuests] = useState<TableGuest[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  useEffect(() => {
    fetchTables();
    fetchAvailableGuests();
  }, []);

  const fetchTables = async () => {
    const { data, error } = await supabase
      .from('table_templates')
      .select('*')
      .order('created_at');

    if (error) {
      showSnackbar('Error loading tables', 'error');
      return;
    }

    const defaultTables = data.length === 0 ? [
      { id: '1', name: 'Table 1', shape: 'round', seats: 8, guests: [], color: '#e3f2fd' },
      { id: '2', name: 'Table 2', shape: 'round', seats: 8, guests: [], color: '#e8f5e9' },
      { id: '3', name: 'Table 3', shape: 'round', seats: 8, guests: [], color: '#fff3e0' },
      { id: '4', name: 'Table 4', shape: 'round', seats: 8, guests: [], color: '#f3e5f5' },
    ] : data;

    setTables(defaultTables);
  };

  const fetchAvailableGuests = async () => {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .is('table_id', null);

    if (error) {
      showSnackbar('Error loading guests', 'error');
      return;
    }

    setAvailableGuests(data || []);
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceTable = tables.find(t => t.id === source.droppableId);
    const destTable = tables.find(t => t.id === destination.droppableId);

    if (!sourceTable || !destTable) return;

    const [movedGuest] = sourceTable.guests.splice(source.index, 1);
    destTable.guests.splice(destination.index, 0, movedGuest);

    // Update in database
    const { error } = await supabase
      .from('table_assignments')
      .update({ table_id: destTable.id })
      .eq('guest_id', movedGuest.id);

    if (error) {
      showSnackbar('Error updating guest assignment', 'error');
      return;
    }

    setTables([...tables]);
    showSnackbar('Guest moved successfully', 'success');
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTable(null);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const TableComponent: React.FC<{ table: Table }> = ({ table }) => {
    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
      setSelectedTable(table);
    };

    return (
      <Droppable droppableId={table.id}>
        {(provided: DroppableProvided) => (
          <Paper 
            elevation={3}
            sx={{
              p: 2,
              height: '250px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              backgroundColor: table.color || '#fff',
            }}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TableRestaurantIcon sx={{ mr: 1 }} />
                <Typography variant="h6">{table.name}</Typography>
              </Box>
              <IconButton size="small" onClick={handleMenuClick}>
                <MoreVertIcon />
              </IconButton>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              {table.guests.map((guest, index) => (
                <Draggable key={guest.id} draggableId={guest.id} index={index}>
                  {(provided: DraggableProvided) => (
                    <Chip
                      label={guest.name}
                      sx={{ m: 0.5 }}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>

            {table.notes && (
              <Tooltip title={table.notes}>
                <Typography variant="caption" sx={{ mt: 1, fontStyle: 'italic' }}>
                  {table.notes.substring(0, 30)}...
                </Typography>
              </Tooltip>
            )}
            
            <Typography variant="caption" sx={{ mt: 1 }}>
              {table.guests.length} / {table.seats} seats filled
            </Typography>
          </Paper>
        )}
      </Droppable>
    );
  };

  const TableMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => {
        setEditingTable(selectedTable);
        setIsEditDialogOpen(true);
        handleMenuClose();
      }}>
        <EditIcon sx={{ mr: 1 }} fontSize="small" />
        Edit Table
      </MenuItem>
      <MenuItem onClick={() => {
        // Handle adding guests
        handleMenuClose();
      }}>
        <PersonAddIcon sx={{ mr: 1 }} fontSize="small" />
        Add Guests
      </MenuItem>
      <MenuItem onClick={() => {
        // Handle table deletion
        handleMenuClose();
      }} sx={{ color: 'error.main' }}>
        <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
        Delete Table
      </MenuItem>
    </Menu>
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4">Seating Chart</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingTable(null);
              setIsEditDialogOpen(true);
            }}
          >
            Add Table
          </Button>
        </Box>

        <Grid container spacing={3}>
          {tables.map(table => (
            <Grid item xs={12} sm={6} md={3} key={table.id}>
              <TableComponent table={table} />
            </Grid>
          ))}
        </Grid>

        <TableMenu />
        
        <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
          <DialogTitle>{editingTable ? 'Edit Table' : 'Add New Table'}</DialogTitle>
          <DialogContent>
            {/* Add form fields for table editing */}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => {
              // Handle save
              setIsEditDialogOpen(false);
            }}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </DragDropContext>
  );
}
