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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';

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
    width: number;
    height: number;
  };
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchTables();
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

      // Convert assignments to TableGuest format and group by table
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

      // Combine tables with their guests
      const tablesWithGuests = tablesData.map(table => ({
        ...table,
        guests: guestsByTable[table.id] || []
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

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    try {
      const sourceTable = tables.find(t => t.id === result.source.droppableId);
      const destTable = tables.find(t => t.id === result.destination?.droppableId);
      
      if (!sourceTable || !destTable) return;

      const guest = sourceTable.guests?.find(g => g.id === result.draggableId);
      if (!guest) return;

      // Update the assignment in the database
      const { error } = await supabase
        .from('table_assignments')
        .update({ table_id: destTable.id })
        .eq('guest_id', guest.id);

      if (error) throw error;

      // Update local state
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

  const handleAssignmentDelete = async (guest: TableGuest) => {
    try {
      const { error } = await supabase
        .from('table_assignments')
        .delete()
        .eq('guest_id', guest.id);

      if (error) throw error;

      // Update local state
      const newTables = tables.map(table => ({
        ...table,
        guests: table.guests?.filter(g => g.id !== guest.id)
      }));

      setTables(newTables);
      setSnackbar({
        open: true,
        message: 'Guest removed from table',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error removing guest:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove guest',
        severity: 'error'
      });
    }
  };

  const handleTableClick = (event: React.MouseEvent<HTMLElement>, table: Table) => {
    setSelectedTable(table);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    if (selectedTable) {
      setNewTableName(selectedTable.name);
      setEditDialogOpen(true);
    }
    handleClose();
  };

  const handleDeleteClick = async () => {
    if (!selectedTable) return;

    try {
      const { error } = await supabase
        .from('seating_tables')
        .delete()
        .eq('id', selectedTable.id);

      if (error) throw error;

      setTables(tables.filter(t => t.id !== selectedTable.id));
      setSnackbar({
        open: true,
        message: 'Table deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting table:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete table',
        severity: 'error'
      });
    }
    handleClose();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Seating Chart</Typography>
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

        <DragDropContext onDragEnd={handleDragEnd}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
            {tables.map((table) => (
              <Paper
                key={table.id}
                sx={{
                  p: 2,
                  minHeight: 200,
                  backgroundColor: table.color || '#fff',
                  position: 'relative',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">{table.name}</Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleTableClick(e, table)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {table.seats} seats
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {table.guests?.map((guest) => (
                    <Chip
                      key={guest.id}
                      label={guest.name}
                      onDelete={() => handleAssignmentDelete(guest)}
                      size="small"
                    />
                  ))}
                </Box>
              </Paper>
            ))}
          </Box>
        </DragDropContext>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleEditClick}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDeleteClick}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <DialogTitle>
            {selectedTable ? 'Edit Table' : 'Add Table'}
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
            <Button onClick={async () => {
              try {
                if (selectedTable) {
                  // Update existing table
                  const { error } = await supabase
                    .from('seating_tables')
                    .update({ name: newTableName })
                    .eq('id', selectedTable.id);

                  if (error) throw error;

                  setTables(tables.map(t => 
                    t.id === selectedTable.id 
                      ? { ...t, name: newTableName }
                      : t
                  ));
                } else {
                  // Create new table
                  const { data, error } = await supabase
                    .from('seating_tables')
                    .insert([{
                      name: newTableName,
                      seats: 8,
                      shape: 'rectangle',
                      position: { x: 0, y: 0, width: 200, height: 100 }
                    }])
                    .select();

                  if (error) throw error;
                  if (data) {
                    setTables([...tables, data[0]]);
                  }
                }

                setSnackbar({
                  open: true,
                  message: `Table ${selectedTable ? 'updated' : 'created'} successfully`,
                  severity: 'success'
                });
                setEditDialogOpen(false);
              } catch (error) {
                console.error('Error saving table:', error);
                setSnackbar({
                  open: true,
                  message: `Failed to ${selectedTable ? 'update' : 'create'} table`,
                  severity: 'error'
                });
              }
            }} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}
