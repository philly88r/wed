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
import { DragDropContext, DropResult } from 'react-beautiful-dnd';

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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching tables:', error);
        setError(error.message);
        return;
      }

      // Initialize with default tables if none exist
      const defaultTables = data?.length ? data : [
        { id: '1', name: 'Table 1', shape: 'round', seats: 8, guests: [], color: '#e3f2fd' },
        { id: '2', name: 'Table 2', shape: 'round', seats: 8, guests: [], color: '#e8f5e9' },
        { id: '3', name: 'Table 3', shape: 'round', seats: 8, guests: [], color: '#fff3e0' },
        { id: '4', name: 'Table 4', shape: 'round', seats: 8, guests: [], color: '#f3e5f5' },
      ];

      // Ensure each table has a guests array
      const tablesWithGuests = defaultTables.map(table => ({
        ...table,
        guests: table.guests || []
      }));

      setTables(tablesWithGuests);
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (_result: DropResult) => {
    // Handle drag and drop logic here
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const TableComponent = ({ table }: { table: Table }) => (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{table.name}</Typography>
        <IconButton size="small" onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <TableRestaurantIcon sx={{ mr: 1 }} />
        <Typography variant="body2">{table.seats} seats</Typography>
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        {table.guests?.map((guest) => (
          <Chip
            key={guest.id}
            label={guest.name}
            size="small"
            sx={{ m: 0.5 }}
          />
        ))}
      </Box>

      <Box sx={{ mt: 2 }}>
        <Button
          startIcon={<PersonAddIcon />}
          size="small"
          fullWidth
          variant="outlined"
        >
          Assign Guests
        </Button>
      </Box>
    </Paper>
  );

  const TableMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => {
        const selectedTableId = anchorEl?.getAttribute('data-table-id');
        const selectedTable = tables.find(t => t.id === selectedTableId);
        setEditingTable(selectedTable || null);
        setIsEditDialogOpen(true);
        handleMenuClose();
      }}>
        <EditIcon sx={{ mr: 1 }} fontSize="small" />
        Edit Table
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading tables...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      </Container>
    );
  }

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

        {tables.length === 0 ? (
          <Typography>No tables created yet. Click "Add Table" to get started.</Typography>
        ) : (
          <Grid container spacing={3}>
            {tables.map(table => (
              <Grid item xs={12} sm={6} md={3} key={table.id}>
                <TableComponent table={table} />
              </Grid>
            ))}
          </Grid>
        )}

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
