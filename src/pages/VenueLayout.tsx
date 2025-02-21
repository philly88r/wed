import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface VenueTable {
  id: string;
  name: string;
  shape: 'round' | 'rectangular' | 'square' | 'oval';
  seats: number;
  color?: string;
  position: { x: number; y: number; width: number; height: number };
}

export default function VenueLayout() {
  const [tables, setTables] = useState<VenueTable[]>([]);
  const [editingTable, setEditingTable] = useState<VenueTable | null>(null);
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
        .from('venue_tables')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching tables:', error);
        setError(error.message);
        return;
      }

      // Initialize with default tables if none exist
      const defaultTables = data?.length ? data : [
        { 
          id: '1', 
          name: 'Head Table', 
          shape: 'rectangular', 
          seats: 12, 
          color: '#e3f2fd',
          position: { x: 0, y: 0, width: 4, height: 1 }
        },
        { 
          id: '2', 
          name: 'Family Table', 
          shape: 'round', 
          seats: 10, 
          color: '#e8f5e9',
          position: { x: 0, y: 1, width: 2, height: 2 }
        },
        { 
          id: '3', 
          name: 'Friends Table', 
          shape: 'round', 
          seats: 8, 
          color: '#fff3e0',
          position: { x: 2, y: 1, width: 2, height: 2 }
        },
        { 
          id: '4', 
          name: 'Colleagues Table', 
          shape: 'square', 
          seats: 6, 
          color: '#f3e5f5',
          position: { x: 0, y: 3, width: 2, height: 2 }
        }
      ];

      setTables(defaultTables);
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const TableComponent = ({ table }: { table: VenueTable }) => {
    const getTableStyle = () => {
      let style: any = {
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        backgroundColor: table.color || '#fff',
        minHeight: '200px',
      };

      // Add specific styles based on table shape
      switch (table.shape) {
        case 'round':
          style = {
            ...style,
            borderRadius: '50%',
            aspectRatio: '1',
          };
          break;
        case 'rectangular':
          style = {
            ...style,
            width: '100%',
            height: '120px',
          };
          break;
        case 'square':
          style = {
            ...style,
            aspectRatio: '1',
          };
          break;
        default:
          break;
      }

      return style;
    };

    return (
      <Paper
        sx={getTableStyle()}
        elevation={3}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 1,
          height: table.shape === 'rectangular' ? '40px' : 'auto'
        }}>
          <Typography variant="h6" sx={{ fontSize: table.shape === 'rectangular' ? '1rem' : '1.25rem' }}>
            {table.name}
          </Typography>
          <IconButton size="small" onClick={(e) => {
            e.currentTarget.setAttribute('data-table-id', table.id);
            handleMenuOpen(e);
          }}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 1,
          height: table.shape === 'rectangular' ? '30px' : 'auto'
        }}>
          <TableRestaurantIcon sx={{ mr: 1 }} />
          <Typography variant="body2">{table.seats} seats</Typography>
        </Box>
      </Paper>
    );
  };

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
        <Typography>Loading venue layout...</Typography>
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
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Venue Layout</Typography>
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
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 3,
          backgroundColor: '#f5f5f5',
          p: 3,
          borderRadius: 2,
          minHeight: '600px',
          position: 'relative'
        }}>
          {tables.map(table => (
            <Box 
              key={table.id}
              sx={{
                gridColumn: `span ${table.position.width}`,
                gridRow: `span ${table.position.height}`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <TableComponent table={table} />
            </Box>
          ))}
        </Box>
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
  );
}
