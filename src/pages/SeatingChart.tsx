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
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
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
        .from('seating_tables')
        .select(`
          *,
          table_assignments (
            guest_id,
            guests (
              id,
              name
            )
          )
        `)
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
          guests: [], 
          color: '#e3f2fd',
          position: { x: 0, y: 0, width: 4, height: 1 }
        },
        { 
          id: '2', 
          name: 'Family Table', 
          shape: 'round', 
          seats: 10, 
          guests: [], 
          color: '#e8f5e9',
          position: { x: 0, y: 1, width: 2, height: 2 }
        },
        { 
          id: '3', 
          name: 'Friends Table', 
          shape: 'round', 
          seats: 8, 
          guests: [], 
          color: '#fff3e0',
          position: { x: 2, y: 1, width: 2, height: 2 }
        },
        { 
          id: '4', 
          name: 'Colleagues Table', 
          shape: 'square', 
          seats: 6, 
          guests: [], 
          color: '#f3e5f5',
          position: { x: 0, y: 3, width: 2, height: 2 }
        }
      ];

      // Transform the data to include guests from assignments
      const tablesWithGuests = defaultTables.map(table => {
        const guests = table.table_assignments?.map(assignment => ({
          id: assignment.guests.id,
          name: assignment.guests.name,
        })) || [];

        return {
          ...table,
          guests,
          table_assignments: undefined // Remove the raw assignments data
        };
      });

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

  const TableComponent = ({ table }: { table: Table }) => {
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

        <Box sx={{ 
          flexGrow: 1,
          overflowY: 'auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          p: 1
        }}>
          {table.guests?.map((guest) => (
            <Chip
              key={guest.id}
              label={guest.name}
              size="small"
              sx={{ m: 0.5 }}
            />
          ))}
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
    </DragDropContext>
  );
}
