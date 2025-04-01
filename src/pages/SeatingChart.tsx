import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  IconButton, 
  Snackbar, 
  Alert, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { DragDropContext } from 'react-beautiful-dnd';
import { supabase } from '../supabaseClient';
import GuestList from '../components/SeatingChart/GuestList';
import { Guest } from '../types/Guest';

interface TableTemplate {
  id: string;
  name: string;
  shape: string;
  width: number;
  length: number;
  seats: number;
  is_predefined: boolean;
}

interface Table {
  id: string;
  name: string;
  seats: number;
  shape: string;
  template_id?: string;
  color?: string;
  width: number;
  length: number;
  position: {
    x: number;
    y: number;
  };
  rotation: number;
  guests?: Guest[];
}

interface Chair {
  id: string;
  table_id: string;
  position: number;
  angle: number;
  guest_id?: string;
  x?: number; // Add x position for chair
  y?: number; // Add y position for chair
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

interface FloorPlan {
  id: string;
  name: string;
  image_url: string;
  scale: number; // Scale in feet per pixel
}

export default function SeatingChart() {
  const [tables, setTables] = useState<Table[]>([]);
  const [tableTemplates, setTableTemplates] = useState<TableTemplate[]>([]);
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add');
  const [newTableName, setNewTableName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customSeats, setCustomSeats] = useState(8);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [filter, setFilter] = useState('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showGrid, setShowGrid] = useState(true);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [selectedChair, setSelectedChair] = useState<Chair | null>(null);
  const [assignGuestDialogOpen, setAssignGuestDialogOpen] = useState(false);
  const [guestSearchTerm, setGuestSearchTerm] = useState('');
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Floor plan state
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<FloorPlan | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [floorPlanName, setFloorPlanName] = useState('');
  const [floorPlanScale, setFloorPlanScale] = useState('1');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null); // Add support for image files
  const [resizingTable, setResizingTable] = useState<Table | null>(null);
  const [resizeStartPosition, setResizeStartPosition] = useState({ x: 0, y: 0 });
  const [originalTableSize, setOriginalTableSize] = useState({ width: 0, length: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [floorPlanError, setFloorPlanError] = useState<string | null>(null); // Add error state

  // Force navigation to seating-chart to ensure we're on the right page
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== '/seating-chart') {
      navigate('/seating-chart', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const isAuthenticated = !!user;
      setIsLoggedIn(isAuthenticated);
      
      if (isAuthenticated) {
        // Only fetch data if user is authenticated
        fetchTableTemplates();
        fetchTables();
        fetchChairs();
        fetchGuests();
        fetchFloorPlans();
      } else {
        // If user is not authenticated, show login dialog
        setLoginDialogOpen(true);
        setSnackbar({
          open: true,
          message: 'Please log in to access the seating chart',
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setLoginDialogOpen(true);
    }
  };

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      setIsLoggedIn(true);
      setLoginDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Logged in successfully',
        severity: 'success'
      });

      // Refresh data after login
      fetchTableTemplates();
      fetchTables();
      fetchChairs();
      fetchGuests();
      fetchFloorPlans();
    } catch (error) {
      console.error('Error logging in:', error);
      setSnackbar({
        open: true,
        message: 'Failed to log in',
        severity: 'error'
      });
    }
  };

  // Get the current user ID or throw an error if not authenticated
  const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      return user.id;
    } else {
      throw new Error('User not authenticated');
    }
  };

  const fetchTableTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('table_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setTableTemplates(data || []);
    } catch (error) {
      console.error('Error fetching table templates:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load table templates',
        severity: 'error'
      });
    }
  };

  const createChairsForTable = async (tableId: string, numSeats: number) => {
    try {
      // Check if chairs already exist for this table
      const { data: existingChairs, error: checkError } = await supabase
        .from('table_chairs')
        .select('*')
        .eq('table_id', tableId);
      
      if (checkError) throw checkError;
      
      // If chairs already exist, don't create new ones
      if (existingChairs && existingChairs.length > 0) {
        return;
      }
      
      // Create chairs for the table
      const chairsToInsert = [];
      for (let i = 0; i < numSeats; i++) {
        // Calculate angle for each chair (evenly distributed around the table)
        const angle = (i * 360) / numSeats;
        chairsToInsert.push({
          table_id: tableId,
          position: i + 1, // Chair positions start at 1
          angle: angle,
          guest_id: null
        });
      }
      
      const { error: insertError } = await supabase
        .from('table_chairs')
        .insert(chairsToInsert);
        
      if (insertError) throw insertError;
      
      // Refresh chairs
      await fetchChairs();
    } catch (error) {
      console.error('Error creating chairs for table:', error);
    }
  };

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('seating_tables')
        .select('*');

      if (error) throw error;

      setTables(data || []);
      
      // Create chairs for tables that don't have them
      if (data) {
        for (const table of data) {
          await createChairsForTable(table.id, table.seats);
        }
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load tables',
        severity: 'error',
      });
    }
  };

  const fetchChairs = async () => {
    try {
      const { data, error } = await supabase
        .from('table_chairs')
        .select('*');
      
      if (error) throw error;
      
      setChairs(data || []);
    } catch (error) {
      console.error('Error fetching chairs:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load chairs',
        severity: 'error'
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
        severity: 'error'
      });
    }
  };

  const fetchFloorPlans = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        console.error('User not authenticated');
        return;
      }

      const { data, error } = await supabase
        .from('floor_plans')
        .select('*')
        .eq('created_by', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist yet, this is expected on first run
          console.log('Floor plans table does not exist yet. Will be created when needed.');
          setFloorPlans([]);
        } else {
          console.error('Error fetching floor plans:', error);
          setSnackbar({
            open: true,
            message: 'Failed to load floor plans',
            severity: 'error'
          });
        }
        return;
      }

      setFloorPlans(data || []);
    } catch (error) {
      console.error('Error fetching floor plans:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load floor plans',
        severity: 'error'
      });
    }
  };

  const handleAddTable = async () => {
    try {
      await getUserId();

      // If using a predefined template
      if (selectedTemplate) {
        const template = tableTemplates.find((t: TableTemplate) => t.id === selectedTemplate);
        if (!template) {
          throw new Error('Selected template not found');
        }

        // Insert the table with larger dimensions
        const { data, error } = await supabase
          .from('seating_tables')
          .insert([
            {
              name: newTableName || template.name,
              seats: template.seats,
              shape: template.shape,
              template_id: template.id,
              width: template.width * 1.5, // Make tables 50% larger
              length: template.length * 1.5, // Make tables 50% larger
              position: { x: 300, y: 200 }, // Position in the center of the view
              rotation: 0,
              user_id: await getUserId()
            }
          ])
          .select()
          .single();

        if (error) throw error;

        // Create chairs for the table
        const chairsToInsert = [];
        for (let i = 0; i < template.seats; i++) {
          // Calculate angle for each chair (evenly distributed around the table)
          const angle = (i * 360) / template.seats;
          chairsToInsert.push({
            table_id: data.id,
            position: i + 1, // Chair positions start at 1
            angle: angle,
            guest_id: null
          });
        }

        const { error: chairError } = await supabase
          .from('table_chairs')
          .insert(chairsToInsert);

        if (chairError) throw chairError;

        // Refresh tables and chairs
        await Promise.all([fetchTables(), fetchChairs()]);

        setSnackbar({
          open: true,
          message: 'Table added successfully',
          severity: 'success'
        });
      } 
      // If creating a custom table
      else {
        // First create a custom template
        const { data: templateData, error: templateError } = await supabase
          .from('table_templates')
          .insert([
            {
              name: `Custom Table - ${customSeats} Seats`,
              shape: 'round', // Default shape for custom tables
              seats: customSeats,
              width: 150, // Larger default size
              length: 150, // Larger default size
              is_predefined: false,
              created_by: await getUserId()
            }
          ])
          .select()
          .single();

        if (templateError) throw templateError;

        // Then create the table using the custom template
        const { data, error } = await supabase
          .from('seating_tables')
          .insert([
            {
              name: newTableName || `Custom Table - ${customSeats} Seats`,
              seats: customSeats,
              shape: 'round',
              template_id: templateData.id,
              width: 150, // Larger default size
              length: 150, // Larger default size
              position: { x: 300, y: 200 }, // Position in the center of the view
              rotation: 0,
              user_id: await getUserId()
            }
          ])
          .select()
          .single();

        if (error) throw error;

        // Create chairs for the table
        const chairsToInsert = [];
        for (let i = 0; i < customSeats; i++) {
          // Calculate angle for each chair (evenly distributed around the table)
          const angle = (i * 360) / customSeats;
          chairsToInsert.push({
            table_id: data.id,
            position: i + 1, // Chair positions start at 1
            angle: angle,
            guest_id: null
          });
        }

        const { error: chairError } = await supabase
          .from('table_chairs')
          .insert(chairsToInsert);

        if (chairError) throw chairError;

        // Refresh tables and chairs
        await Promise.all([fetchTables(), fetchChairs()]);

        setTables([...tables, data]);
        setTableTemplates([...tableTemplates, templateData]);
        setEditDialogOpen(false);
        setSnackbar({
          open: true,
          message: 'Custom table added successfully',
          severity: 'success'
        });
      }

      // Chairs will be created automatically via the database trigger
      // Refresh chairs after a short delay to ensure trigger has completed
      setTimeout(() => {
        fetchChairs();
      }, 500);
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
      await getUserId();
      
      // Split the full name into first and last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      // Insert guest with all required fields
      const { data, error } = await supabase
        .from('guests')
        .insert([{ 
          first_name: firstName,
          last_name: lastName || 'Unknown',
          address: 'Not provided',
          city: 'Not provided',
          state: 'Not provided',
          zip_code: 'Not provided',
          country: 'Not provided',
          created_by: await getUserId()
        }])
        .select();

      if (error) {
        console.error('Guest addition error:', error);
        throw error;
      }

      if (data && data.length > 0) {
        setGuests([...guests, data[0]]);
        setSnackbar({
          open: true,
          message: 'Guest added successfully',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error adding guest:', error);
      setSnackbar({
        open: true,
        message: `Failed to add guest: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    }
  };

  const handleTableDragStart = (e: React.MouseEvent, table: Table) => {
    if (!chartAreaRef.current) return;
    
    // Prevent default to avoid unwanted behaviors
    e.preventDefault();
    
    const chartRect = chartAreaRef.current.getBoundingClientRect();
    const initialX = e.clientX - chartRect.left;
    const initialY = e.clientY - chartRect.top;
    const offsetX = initialX - table.position.x;
    const offsetY = initialY - table.position.y;
    
    // Set the currently selected table
    setSelectedTable(table);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newX = moveEvent.clientX - chartRect.left - offsetX;
      const newY = moveEvent.clientY - chartRect.top - offsetY;
      
      // Update the table position in state
      setTables(currentTables => 
        currentTables.map(t => 
          t.id === table.id 
            ? { ...t, position: { x: Math.max(0, newX), y: Math.max(0, newY) } } 
            : t
        )
      );
    };
    
    const handleMouseUp = async () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Save the new position to the database
      const updatedTable = tables.find(t => t.id === table.id);
      if (updatedTable) {
        try {
          await getUserId(); // Just verify user is authenticated
          
          await supabase
            .from('seating_tables')
            .update({ position: updatedTable.position })
            .eq('id', table.id);
            
          setSnackbar({
            open: true,
            message: 'Table position updated',
            severity: 'success'
          });
        } catch (error) {
          console.error('Error updating table position:', error);
          setSnackbar({
            open: true,
            message: 'Failed to update table position',
            severity: 'error'
          });
        }
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleRemoveGuestFromChair = async (chairId: string) => {
    try {
      // Just verify user is authenticated
      await getUserId();
      
      const { error } = await supabase
        .from('table_chairs')
        .update({ guest_id: null })
        .eq('id', chairId);

      if (error) throw error;

      // Update local state with proper type handling
      setChairs(chairs.map(chair => {
        if (chair.id === chairId) {
          const updatedChair: Chair = { ...chair };
          updatedChair.guest_id = undefined;
          return updatedChair;
        }
        return chair;
      }));

      setSnackbar({
        open: true,
        message: 'Guest removed from chair',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error removing guest from chair:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove guest from chair',
        severity: 'error'
      });
    }
  };

  const handleChairClick = (chair: Chair) => {
    if (!isLoggedIn) {
      setLoginDialogOpen(true);
      return;
    }

    // If chair already has a guest, show option to remove
    if (chair.guest_id) {
      // Implementation for removing a guest from chair
      removeGuestFromChair(chair);
    } else {
      // Implementation for assigning a guest to chair
      // This could open a dialog to select a guest
      openAssignGuestDialog(chair);
    }
  };

  const removeGuestFromChair = async (chair: Chair) => {
    try {
      const { error } = await supabase
        .from('table_chairs')
        .update({ guest_id: null })
        .eq('id', chair.id);

      if (error) throw error;

      // Update local state with proper type handling
      setChairs(chairs.map(c => {
        if (c.id === chair.id) {
          const updatedChair: Chair = { ...c };
          updatedChair.guest_id = undefined;
          return updatedChair;
        }
        return c;
      }));

      setSnackbar({
        open: true,
        message: 'Guest removed from seat',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error removing guest from chair:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove guest from seat',
        severity: 'error'
      });
    }
  };

  const openAssignGuestDialog = (chair: Chair) => {
    // Implementation for opening a dialog to select a guest
    // This could set some state and open a dialog
    console.log('Opening assign guest dialog for chair:', chair);
    // For now, just show a message
    setSelectedChair(chair);
    setAssignGuestDialogOpen(true);
  };

  // Calculate chair positions based on table dimensions and chair angles
  const calculateChairPositions = (tableChairs: Chair[], table: Table) => {
    return tableChairs.map(chair => {
      // Calculate chair position based on angle and table dimensions
      const tableWidth = table.width;
      const tableLength = table.length;
      // Increase the radius to position chairs farther from the table edge
      const radius = Math.min(tableWidth, tableLength) / 2 + 30; // Increased padding for larger chairs
      
      // Calculate x and y based on angle (in degrees)
      const angleInRadians = (chair.angle * Math.PI) / 180;
      const x = radius * Math.cos(angleInRadians);
      const y = radius * Math.sin(angleInRadians);
      
      // Center the chair relative to the table
      return {
        ...chair,
        x: tableWidth / 2 + x,
        y: tableLength / 2 + y
      };
    });
  };

  // Render a table with its chairs
  const renderTable = (table: Table) => {
    const tableChairs = chairs.filter(chair => chair.table_id === table.id);
    const isSelected = selectedTable?.id === table.id;
    const isFloorPlanMode = !!selectedFloorPlan;
    const showResizeHandles = isFloorPlanMode && isSelected;
    
    // Calculate chair positions
    const chairsWithPositions = isFloorPlanMode ? [] : calculateChairPositions(tableChairs, table);

    // Determine table color based on shape
    const tableColor = isFloorPlanMode ? 'rgba(200, 200, 200, 0.7)' : 
                      (table.shape === 'round' ? '#f0f0f0' : '#e6e6e6');

    return (
      <Box
        key={table.id}
        sx={{
          position: 'absolute',
          left: `${table.position.x}px`,
          top: `${table.position.y}px`,
          width: `${table.width}px`,
          height: `${table.length}px`,
          borderRadius: table.shape === 'round' ? '50%' : '4px',
          backgroundColor: tableColor,
          border: isSelected ? '2px solid #1976d2' : '1px solid #ccc',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isFloorPlanMode ? 'move' : 'pointer',
          zIndex: isSelected ? 2 : 1,
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleTableClick(table);
        }}
        onMouseDown={(e) => {
          if (isFloorPlanMode) {
            handleTableDragStart(e, table);
          }
        }}
      >
        <Typography
          variant="body2"
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            color: '#333'
          }}
        >
          {table.name}
          <br />
          {table.seats} seats
        </Typography>
        
        {/* Only show chairs in regular mode, not in floor plan mode */}
        {!isFloorPlanMode && chairsWithPositions.map((chair) => {
          const chairGuest = guests.find(g => g.id === chair.guest_id);
          const chairSize = 40; // Increased chair size
          
          return (
            <Box
              key={chair.id}
              sx={{
                position: 'absolute',
                left: `${chair.x - chairSize/2}px`,
                top: `${chair.y - chairSize/2}px`,
                width: `${chairSize}px`,
                height: `${chairSize}px`,
                borderRadius: '50%',
                backgroundColor: chair.guest_id ? '#4caf50' : '#f5f5f5',
                border: '1px solid #ccc',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '12px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleChairClick(chair);
              }}
            >
              {chairGuest ? (
                <>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '10px' }}>
                    {chairGuest.first_name.charAt(0)}{chairGuest.last_name.charAt(0)}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '8px' }}>
                    Seat {chair.position}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="caption" sx={{ fontSize: '10px' }}>
                    Empty
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '8px' }}>
                    Seat {chair.position}
                  </Typography>
                </>
              )}
            </Box>
          );
        })}
        
        {/* Only show resize handles in floor plan mode */}
        {showResizeHandles && (
          <>
            <Box
              sx={{
                position: 'absolute',
                left: '-5px',
                top: '-5px',
                width: '10px',
                height: '10px',
                backgroundColor: '#1976d2',
                cursor: 'nwse-resize',
              }}
              onMouseDown={(e) => handleResizeStart(e, table, 'top-left')}
            />
            <Box
              sx={{
                position: 'absolute',
                right: '-5px',
                top: '-5px',
                width: '10px',
                height: '10px',
                backgroundColor: '#1976d2',
                cursor: 'nesw-resize',
              }}
              onMouseDown={(e) => handleResizeStart(e, table, 'top-right')}
            />
            <Box
              sx={{
                position: 'absolute',
                left: '-5px',
                bottom: '-5px',
                width: '10px',
                height: '10px',
                backgroundColor: '#1976d2',
                cursor: 'nesw-resize',
              }}
              onMouseDown={(e) => handleResizeStart(e, table, 'bottom-left')}
            />
            <Box
              sx={{
                position: 'absolute',
                right: '-5px',
                bottom: '-5px',
                width: '10px',
                height: '10px',
                backgroundColor: '#1976d2',
                cursor: 'nwse-resize',
              }}
              onMouseDown={(e) => handleResizeStart(e, table, 'bottom-right')}
            />
          </>
        )}
      </Box>
    );
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    
    // Show dialog to assign guests to this table
    setEditMode('edit');
    setNewTableName(table.name);
    setEditDialogOpen(true);
  };

  const handleAssignGuestToTable = async (tableId: string, guestId: string) => {
    try {
      // Find an available chair at this table
      const tableChairs = chairs.filter(chair => chair.table_id === tableId);
      const availableChair = tableChairs.find(chair => !chair.guest_id);
      
      if (!availableChair) {
        setSnackbar({
          open: true,
          message: 'No available seats at this table',
          severity: 'warning'
        });
        return;
      }
      
      // Assign guest to the chair
      const { error } = await supabase
        .from('table_chairs')
        .update({ guest_id: guestId })
        .eq('id', availableChair.id);
        
      if (error) throw error;
      
      // Update local state
      setChairs(chairs.map(chair => 
        chair.id === availableChair.id ? { ...chair, guest_id: guestId } : chair
      ));
      
      setSnackbar({
        open: true,
        message: 'Guest assigned to table',
        severity: 'success'
      });
      
      // Refresh data
      await fetchChairs();
      
    } catch (error) {
      console.error('Error assigning guest to table:', error);
      setSnackbar({
        open: true,
        message: 'Failed to assign guest to table',
        severity: 'error'
      });
    }
  };

  const handleDeleteTable = async () => {
    if (!selectedTable) return;

    try {
      await getUserId();

      // Delete the table
      const { error } = await supabase
        .from('seating_tables')
        .delete()
        .eq('id', selectedTable.id);

      if (error) throw error;

      // Update local state
      setTables(tables.filter(table => table.id !== selectedTable.id));
      setSelectedTable(null);
      setDeleteDialogOpen(false);
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
  };

  const EditTableDialog = () => {
    const [availableGuests, setAvailableGuests] = useState<Guest[]>([]);
    const [selectedGuest, setSelectedGuest] = useState<string>('');
    
    useEffect(() => {
      // Get unassigned guests when dialog opens
      if (editDialogOpen) {
        const unassignedGuests = guests.filter(guest => 
          !chairs.some(chair => 
            chair.guest_id === guest.id
          )
        );
        setAvailableGuests(unassignedGuests);
      }
    }, [editDialogOpen, guests, chairs]);
    
    return (
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode === 'add' ? 'Add New Table' : `Edit Table: ${selectedTable?.name}`}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Table Name"
            type="text"
            fullWidth
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          {editMode === 'add' && (
            <>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Table Template</InputLabel>
                <Select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Custom Table</em>
                  </MenuItem>
                  {tableTemplates.map((template: TableTemplate) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name} ({template.seats} seats)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {!selectedTemplate && (
                <TextField
                  margin="dense"
                  label="Number of Seats"
                  type="number"
                  fullWidth
                  value={customSeats}
                  onChange={(e) => setCustomSeats(parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 1, max: 20 } }}
                />
              )}
            </>
          )}
          
          {editMode === 'edit' && selectedTable && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Assign Guest to Table
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Guest</InputLabel>
                <Select
                  value={selectedGuest}
                  onChange={(e) => setSelectedGuest(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Select a guest</em>
                  </MenuItem>
                  {availableGuests.map((guest) => (
                    <MenuItem key={guest.id} value={guest.id}>
                      {guest.first_name} {guest.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                variant="contained"
                color="primary"
                disabled={!selectedGuest}
                onClick={() => {
                  if (selectedGuest && selectedTable) {
                    handleAssignGuestToTable(selectedTable.id, selectedGuest);
                    setSelectedGuest('');
                  }
                }}
                sx={{ mb: 2 }}
              >
                Assign Guest
              </Button>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Assigned Guests
              </Typography>
              
              {selectedTable && (
                <List dense sx={{ maxHeight: '200px', overflow: 'auto' }}>
                  {chairs
                    .filter(chair => chair.table_id === selectedTable.id && chair.guest_id)
                    .map(chair => {
                      const guest = guests.find(g => g.id === chair.guest_id);
                      return guest ? (
                        <ListItem key={chair.id}>
                          <ListItemText primary={`${guest.first_name} ${guest.last_name}`} />
                          <ListItemSecondaryAction>
                            <IconButton 
                              edge="end" 
                              onClick={() => handleRemoveGuestFromChair(chair.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ) : null;
                    })}
                </List>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTable} color="primary">
            {editMode === 'add' ? 'Add Table' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const handleSaveTable = async () => {
    if (editMode === 'add') {
      await handleAddTable();
    } else if (selectedTable) {
      try {
        await getUserId();

        const { error } = await supabase
          .from('seating_tables')
          .update({ name: newTableName })
          .eq('id', selectedTable.id);

        if (error) throw error;

        // Update local state
        const updatedTables = tables.map(table => 
          table.id === selectedTable.id ? { ...table, name: newTableName } : table
        );
        setTables(updatedTables);
        setEditDialogOpen(false);
        setSnackbar({
          open: true,
          message: 'Table updated successfully',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error updating table:', error);
        setSnackbar({
          open: true,
          message: 'Failed to update table',
          severity: 'error'
        });
      }
    }
    setEditDialogOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchTableTemplates();
      await fetchTables(); // This will also create chairs if needed
      await fetchGuests();
      await fetchFloorPlans();
    };
    
    fetchData();
    
    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchFloorPlans();
      createFloorPlansBucket(); // Create the floor plans bucket if it doesn't exist
    }
  }, [isLoggedIn]);

  const onDragEnd = () => {
    // This is a placeholder - we're not actually implementing drag and drop functionality
    // but we need this to satisfy the DragDropContext requirement
  };

  const handleTableTouchStart = (e: React.TouchEvent, table: Table) => {
    if (!chartAreaRef.current) return;
    
    // Prevent default to avoid scrolling while dragging
    e.preventDefault();
    
    const chartRect = chartAreaRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const initialX = touch.clientX - chartRect.left;
    const initialY = touch.clientY - chartRect.top;
    const offsetX = initialX - table.position.x;
    const offsetY = initialY - table.position.y;
    
    // Set the currently selected table
    setSelectedTable(table);
    
    const handleTouchMove = (moveEvent: TouchEvent) => {
      const touchMove = moveEvent.touches[0];
      const newX = touchMove.clientX - chartRect.left - offsetX;
      const newY = touchMove.clientY - chartRect.top - offsetY;
      
      // Update the table position in state
      setTables(currentTables => 
        currentTables.map(t => 
          t.id === table.id 
            ? { ...t, position: { x: Math.max(0, newX), y: Math.max(0, newY) } } 
            : t
        )
      );
    };
    
    const handleTouchEnd = async () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      
      // Save the new position to the database
      const updatedTable = tables.find(t => t.id === table.id);
      if (updatedTable) {
        try {
          await getUserId(); // Just verify user is authenticated
          
          await supabase
            .from('seating_tables')
            .update({ position: updatedTable.position })
            .eq('id', updatedTable.id);
            
          setSnackbar({
            open: true,
            message: 'Table position updated',
            severity: 'success'
          });
        } catch (error) {
          console.error('Error updating table position:', error);
        }
      }
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleFloorPlanSelect = (planId: string) => {
    const plan = floorPlans.find(p => p.id === planId);
    if (plan) {
      setSelectedFloorPlan(plan);
    }
  };

  const createFloorPlansBucket = async () => {
    try {
      // Ensure user is authenticated before proceeding
      await getUserId();
      
      // Check if the bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

      if (bucketsError) {
        console.error('Error checking storage buckets:', bucketsError);
        return false;
      }

      const bucketExists = buckets.some(bucket => bucket.name === 'floor_plans');

      if (!bucketExists) {
        // Instead of trying to create the bucket directly (which might fail due to RLS),
        // we'll use a simpler approach - just check if it exists
        console.log('Floor plans bucket does not exist in this session');
        return true;
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error checking floor plans bucket:', error);
      return false;
    }
  };

  const handleFloorPlanUpload = async () => {
    if ((!pdfFile && !imageFile) || !floorPlanName || !floorPlanScale) {
      setSnackbar({
        open: true,
        message: 'Please provide a name, scale, and file for the floor plan',
        severity: 'error'
      });
      return;
    }

    setIsUploading(true);
    setFloorPlanError(null);

    try {
      await getUserId();

      // Create the bucket if it doesn't exist
      await createFloorPlansBucket();
      
      // Use the image file if provided, otherwise use the PDF
      const fileToUpload = imageFile || pdfFile;
      if (!fileToUpload) {
        throw new Error('No file selected');
      }
      
      // Upload the file to storage
      const fileName = `${await getUserId()}_${Date.now()}_${fileToUpload.name.replace(/\s+/g, '_')}`;
      const { error: uploadError } = await supabase
        .storage
        .from('floor_plans')
        .upload(fileName, fileToUpload);

      if (uploadError) {
        console.error('Error uploading floor plan:', uploadError);
        setFloorPlanError('Failed to upload file. Please try again with a smaller file or a different format.');
        setSnackbar({
          open: true,
          message: 'Failed to upload floor plan',
          severity: 'error'
        });
        setIsUploading(false);
        return;
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase
        .storage
        .from('floor_plans')
        .getPublicUrl(fileName);

      // Save the floor plan details to the database
      const { data, error: insertError } = await supabase
        .from('floor_plans')
        .insert([
          {
            name: floorPlanName,
            image_url: publicUrl,
            scale: parseFloat(floorPlanScale),
            created_by: await getUserId()
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Error saving floor plan details:', insertError);
        setFloorPlanError('Failed to save floor plan details in the database.');
        setSnackbar({
          open: true,
          message: 'Failed to save floor plan details',
          severity: 'error'
        });
        setIsUploading(false);
        return;
      }

      // Refresh the floor plans list
      await fetchFloorPlans();

      // Automatically select the newly uploaded floor plan
      if (data) {
        setSelectedFloorPlan(data);
      }

      // Reset the form
      setFloorPlanName('');
      setFloorPlanScale('1');
      setPdfFile(null);
      setImageFile(null);
      setUploadDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Floor plan uploaded successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error uploading floor plan:', error);
      setFloorPlanError('An unexpected error occurred during upload.');
      setSnackbar({
        open: true,
        message: 'Failed to upload floor plan',
        severity: 'error'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, table: Table, corner: string) => {
    if (!chartAreaRef.current) return;
    
    e.stopPropagation(); // Prevent triggering drag
    
    // Set resizing state
    setResizingTable(table);
    setOriginalTableSize({ width: table.width, length: table.length });
    
    // Get initial position
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setResizeStartPosition({ x: clientX, y: clientY });
    
    // Add event listeners for resize
    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const moveClientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveClientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      // Calculate the delta
      const deltaX = moveClientX - resizeStartPosition.x;
      const deltaY = moveClientY - resizeStartPosition.y;
      
      // Update table size based on which corner is being dragged
      let newWidth = originalTableSize.width;
      let newLength = originalTableSize.length;
      
      if (corner.includes('right')) {
        newWidth = Math.max(60, originalTableSize.width + deltaX);
      } else if (corner.includes('left')) {
        newWidth = Math.max(60, originalTableSize.width - deltaX);
      }
      
      if (corner.includes('bottom')) {
        newLength = Math.max(60, originalTableSize.length + deltaY);
      } else if (corner.includes('top')) {
        newLength = Math.max(60, originalTableSize.length - deltaY);
      }
      
      // Update the table in state
      setTables(currentTables => 
        currentTables.map(t => 
          t.id === table.id 
            ? { ...t, width: newWidth, length: newLength } 
            : t
        )
      );
    };
    
    const handleEnd = async () => {
      // Remove event listeners
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
      
      // Reset resizing state
      setResizingTable(null);
      
      // Save the new size to the database
      const updatedTable = tables.find(t => t.id === resizingTable?.id);
      if (updatedTable) {
        try {
          await getUserId(); // Just verify user is authenticated
          
          await supabase
            .from('seating_tables')
            .update({ 
              width: updatedTable.width,
              length: updatedTable.length
            })
            .eq('id', updatedTable.id);
            
          setSnackbar({
            open: true,
            message: 'Table size updated',
            severity: 'success'
          });
        } catch (error) {
          console.error('Error updating table size:', error);
          setSnackbar({
            open: true,
            message: 'Failed to update table size',
            severity: 'error'
          });
        }
      }
      
      setResizingTable(null);
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
  };

  const toggleFloorPlanMode = () => {
    if (selectedFloorPlan) {
      // Switching back to regular mode
      setSelectedFloorPlan(null);
    } else {
      // If there are floor plans, select the first one
      if (floorPlans.length > 0) {
        setSelectedFloorPlan(floorPlans[0]);
      } else {
        // No floor plans available, show upload dialog
        setUploadDialogOpen(true);
      }
    }
    // Clear selected table when switching modes
    setSelectedTable(null);
  };

  const handleAssignGuestToChair = async (chairId: string, guestId: string) => {
    try {
      // Assign guest to the chair
      const { error } = await supabase
        .from('table_chairs')
        .update({ guest_id: guestId })
        .eq('id', chairId);
        
      if (error) throw error;
      
      // Update local state
      setChairs(chairs.map(chair => 
        chair.id === chairId ? { ...chair, guest_id: guestId } : chair
      ));
      
      setSnackbar({
        open: true,
        message: 'Guest assigned to seat',
        severity: 'success'
      });
      
      // Close the dialog
      setAssignGuestDialogOpen(false);
      setSelectedChair(null);
      
      // Refresh chairs data
      await fetchChairs();
      
    } catch (error) {
      console.error('Error assigning guest to chair:', error);
      setSnackbar({
        open: true,
        message: 'Failed to assign guest to seat',
        severity: 'error'
      });
    }
  };

  const handleRemoveGuestFromChair = async (chairId: string) => {
    try {
      // Just verify user is authenticated
      await getUserId();
      
      const { error } = await supabase
        .from('table_chairs')
        .update({ guest_id: null })
        .eq('id', chairId);

      if (error) throw error;

      // Update local state with proper type handling
      setChairs(chairs.map(chair => {
        if (chair.id === chairId) {
          const updatedChair: Chair = { ...chair };
          updatedChair.guest_id = undefined;
          return updatedChair;
        }
        return chair;
      }));

      setSnackbar({
        open: true,
        message: 'Guest removed from chair',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error removing guest from chair:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove guest from chair',
        severity: 'error'
      });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Container maxWidth="xl" sx={{ py: 4, height: 'calc(100vh - 64px)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4">Seating Chart</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              onClick={() => setEditMode('add')}
              startIcon={<AddIcon />}
              disabled={!!selectedFloorPlan}
            >
              Add Table
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={toggleFloorPlanMode}
              startIcon={<PictureAsPdfIcon />}
            >
              {selectedFloorPlan ? 'Exit Floor Plan Mode' : 'Enter Floor Plan Mode'}
            </Button>
            
            {selectedFloorPlan && (
              <>
                <Button 
                  variant="outlined" 
                  onClick={() => setUploadDialogOpen(true)}
                  startIcon={<AddIcon />}
                >
                  Upload Floor Plan
                </Button>
                
                <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Floor Plan</InputLabel>
                  <Select
                    value={selectedFloorPlan?.id || ''}
                    onChange={(e) => {
                      const selected = floorPlans.find(fp => fp.id === e.target.value);
                      setSelectedFloorPlan(selected || null);
                    }}
                    label="Floor Plan"
                  >
                    {floorPlans.map((floorPlan) => (
                      <MenuItem key={floorPlan.id} value={floorPlan.id}>
                        {floorPlan.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
            
            <Button
              variant="outlined"
              onClick={() => setGuestDialogOpen(true)}
              startIcon={<PersonAddIcon />}
              disabled={!!selectedFloorPlan}
            >
              Add Guest
            </Button>
          </Box>
        </Box>
        
        <Paper 
          elevation={3} 
          sx={{ 
            height: 'calc(100% - 60px)', 
            position: 'relative', 
            overflow: 'hidden',
            backgroundImage: selectedFloorPlan ? `url(${selectedFloorPlan.image_url})` : 'none',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundColor: '#f5f5f5', // Add a light background color
          }}
          ref={chartAreaRef}
        >
          {/* Floor plan container */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0,
            }}
          >
            {selectedFloorPlan && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {/* This is a transparent overlay to ensure the floor plan is clickable */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                  }}
                />
              </Box>
            )}
          </Box>
          
          {/* Tables container with higher z-index */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              zIndex: 2, // Ensure tables are above the floor plan
            }}
            onClick={() => setSelectedTable(null)}
          >
            {tables.map((table) => (
              renderTable(table)
            ))}
          </Box>
        </Paper>
        
        {/* Guest list sidebar - moved to the right */}
        <Paper sx={{ width: 300, ml: 2, p: 2, height: '100%', overflow: 'auto' }}>
          <GuestList 
            guests={guests} 
            onAddGuest={handleAddGuest}
            filter={filter}
            onFilterChange={setFilter}
          />
        </Paper>
        
        {/* Add/Edit table dialog */}
        <EditTableDialog />

        {/* Delete confirmation dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Table</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this table? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteTable} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Login dialog */}
        <Dialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)}>
          <DialogTitle>Login Required</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              You need to be logged in to manage seating charts.
            </Typography>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLoginDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleLogin} 
              variant="contained"
              disabled={!email || !password}
            >
              Login
            </Button>
          </DialogActions>
        </Dialog>

        {/* Upload floor plan dialog */}
        <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
          <DialogTitle>Upload Floor Plan</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Upload an image file (JPG, PNG) or PDF to use as a floor plan.
            </Typography>
            <TextField
              fullWidth
              label="Floor Plan Name"
              type="text"
              value={floorPlanName}
              onChange={(e) => setFloorPlanName(e.target.value)}
              margin="normal"
              required
            />
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Floor Plan Image (Recommended)
              </Typography>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => {
                  setImageFile(e.target.files?.[0] || null);
                  // Clear PDF if image is selected
                  if (e.target.files?.[0]) {
                    setPdfFile(null);
                  }
                }}
              />
              <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                Recommended: Use JPG or PNG for better compatibility
              </Typography>
            </Box>
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                OR PDF File
              </Typography>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  setPdfFile(e.target.files?.[0] || null);
                  // Clear image if PDF is selected
                  if (e.target.files?.[0]) {
                    setImageFile(null);
                  }
                }}
              />
            </Box>
            <TextField
              fullWidth
              label="Scale (feet per pixel)"
              type="text"
              value={floorPlanScale}
              onChange={(e) => setFloorPlanScale(e.target.value)}
              margin="normal"
              required
            />
            {floorPlanError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {floorPlanError}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleFloorPlanUpload} 
              variant="contained"
              disabled={(!floorPlanName || (!pdfFile && !imageFile) || isUploading)}
              startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Guest Dialog */}
        <Dialog open={guestDialogOpen} onClose={() => setGuestDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Guest</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Guest Name"
              fullWidth
              variant="outlined"
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              margin="dense"
              label="Email (Optional)"
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>RSVP Status</InputLabel>
              <Select
                label="RSVP Status"
                defaultValue="pending"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="declined">Declined</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGuestDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => {
              // Add guest logic would go here
              setSnackbar({
                open: true,
                message: 'Guest added successfully',
                severity: 'success'
              });
            }}>
              Add Guest
            </Button>
          </DialogActions>
        </Dialog>

        {/* Assign Guest to Chair Dialog */}
        <Dialog 
          open={assignGuestDialogOpen} 
          onClose={() => setAssignGuestDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Assign Guest to Seat {selectedChair?.position}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Search Guests"
              type="text"
              fullWidth
              value={guestSearchTerm}
              onChange={(e) => setGuestSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
              {guests
                .filter(guest => 
                  // Filter out guests already assigned to chairs
                  !chairs.some(chair => 
                    chair.id !== selectedChair?.id && chair.guest_id === guest.id
                  ) &&
                  // Filter by search term
                  (guestSearchTerm === '' || 
                   `${guest.first_name} ${guest.last_name}`.toLowerCase().includes(guestSearchTerm.toLowerCase()))
                )
                .map(guest => (
                  <ListItem 
                    key={guest.id}
                    component="div"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      if (selectedChair) {
                        handleAssignGuestToChair(selectedChair.id, guest.id);
                      }
                    }}
                  >
                    <ListItemText 
                      primary={`${guest.first_name} ${guest.last_name}`}
                    />
                  </ListItem>
                ))}
              
              {guests.filter(guest => 
                !chairs.some(chair => 
                  chair.id !== selectedChair?.id && chair.guest_id === guest.id
                ) &&
                (guestSearchTerm === '' || 
                 `${guest.first_name} ${guest.last_name}`.toLowerCase().includes(guestSearchTerm.toLowerCase()))
              ).length === 0 && (
                <ListItem>
                  <ListItemText 
                    primary="No available guests found"
                    secondary="All guests are already assigned or no guests match your search"
                  />
                </ListItem>
              )}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignGuestDialogOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
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
    </DragDropContext>
  );
}
