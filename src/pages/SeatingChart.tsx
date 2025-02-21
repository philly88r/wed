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
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';

interface TableGuest {
  id: string;
  name: string;
  table_id: string;
}

interface TableAssignment {
  id: string;
  guest_id: string;
  table_id: string;
  guests: {
    id: string;
    name: string;
  };
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
      const { data, error } = await supabase
        .from('seating_tables')
        .select('*, table_assignments(*, guests(*))');

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

  const handleDragEnd = async (result: DropResult) => {
    // ... rest of the code remains the same
  };

  const handleAssignmentDelete = async (assignment: TableAssignment) => {
    try {
      const { error } = await supabase
        .from('table_assignments')
        .delete()
        .eq('id', assignment.id);

      if (error) throw error;

      await fetchTables();
      setSnackbar({
        open: true,
        message: 'Guest removed from table',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove guest',
        severity: 'error',
      });
    }
  };

  const handleTableClick = (event: React.MouseEvent<HTMLElement>, table: Table) => {
    setSelectedTable(table);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedTable(null);
  };

  const handleEditClick = () => {
    if (selectedTable) {
      setNewTableName(selectedTable.name);
      setEditDialogOpen(true);
    }
    handleClose();
  };

  const handleDeleteClick = async () => {
    if (selectedTable) {
      try {
        const { error } = await supabase
          .from('seating_tables')
          .delete()
          .eq('id', selectedTable.id);

        if (error) throw error;

        await fetchTables();
        setSnackbar({
          open: true,
          message: 'Table deleted successfully',
          severity: 'success',
        });
      } catch (error) {
        console.error('Error deleting table:', error);
        setSnackbar({
          open: true,
          message: 'Failed to delete table',
          severity: 'error',
        });
      }
    }
    handleClose();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Seating Chart
        </Typography>
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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {tables.map((table) => (
            <Paper
              key={table.id}
              sx={{
                p: 2,
                width: 280,
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
          <Button onClick={() => {
            // Handle save
            setEditDialogOpen(false);
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
    </Container>
  );
}
