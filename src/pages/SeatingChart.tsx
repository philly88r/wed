import React, { useState, useEffect, useRef } from 'react';
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
  ListItemSecondaryAction
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { DragDropContext } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import { createClient } from '@supabase/supabase-js';
import GuestList from '../components/SeatingChart/GuestList';
import { useNavigate } from 'react-router-dom';
import { Guest } from '../types/Guest';

// Create a Supabase client with the correct credentials
const supabaseUrl = 'https://yemkduykvfdjmldxfphq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbWtkdXlrdmZkam1sZHhmcGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NDY4NzQsImV4cCI6MjA1NTEyMjg3NH0.JoIg1NFwFPE8ucc7D4Du2qe8SEX3OvSKqJf_ecf-euk';
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

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
  template_id: string;
  color?: string;
  width: number;
  length: number;
  position_x: number;
  position_y: number;
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

interface TableFormData {
  name: string;
  template_id: string;
  seats: number;
}

export default function SeatingChart() {
  const navigate = useNavigate();
  const chartAreaRef = useRef<HTMLDivElement>(null);

  // Table management state
  const [tables, setTables] = useState<Table[]>([]);
  const [tableTemplates, setTableTemplates] = useState<TableTemplate[]>([]);
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  
  // Guest management state
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedChair, setSelectedChair] = useState<Chair | null>(null);
  const [guestSearchTerm, setGuestSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignGuestDialogOpen, setAssignGuestDialogOpen] = useState(false);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  
  // Form states
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add');
  const [newTableName, setNewTableName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI states
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });
  
  // Remove unused drag state variables
  // const [isDragging, setIsDragging] = useState(false);
  // const [dragStart, setDragStart] = useState<{
  //   x: number;
  //   y: number;
  //   tableX: number;
  //   tableY: number;
  // } | null>(null);

  // Force navigation to seating-chart to ensure we're on the right page
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== '/seating-chart') {
      navigate('/seating-chart', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    // Check authentication status when component mounts
    const checkAuth = async () => {
      try {
        // First try to get session which is more reliable and doesn't throw errors if no session exists
        const { data: sessionData } = await supabase.auth.getSession();
        const isAuthenticated = !!sessionData?.session?.user;
        
        setIsLoggedIn(isAuthenticated);
        
        if (!isAuthenticated) {
          // Only show login dialog if not authenticated
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
    
    checkAuth();
  }, []);
  
  // Separate useEffect for data fetching that depends on authentication state
  useEffect(() => {
    if (isLoggedIn) {
      // Only fetch data if user is authenticated
      fetchTableTemplates();
      fetchTables();
      fetchChairs();
      fetchGuests();
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    try {
      const { data: userData, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error.message);
        setSnackbar({
          open: true,
          message: `Login failed: ${error.message}`,
          severity: 'error'
        });
        return;
      }

      // Update login state - this will trigger the useEffect that fetches data
      setIsLoggedIn(true);
      setLoginDialogOpen(false);
      
      setSnackbar({
        open: true,
        message: 'Login successful!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Unexpected login error:', error);
      setSnackbar({
        open: true,
        message: 'An unexpected error occurred during login',
        severity: 'error'
      });
    }
  };

  // Get the current user ID or handle authentication gracefully
  const getUserId = async () => {
    // If we already know the user is not logged in, don't make API calls
    if (!isLoggedIn) {
      return null;
    }
    
    try {
      // Check if we already have a session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData?.session) {
        // We have a valid session
        return sessionData.session.user.id;
      }
      
      // If no session, update login state and return null
      setIsLoggedIn(false);
      setLoginDialogOpen(true);
      return null;
    } catch (error) {
      console.error('Unexpected error in getUserId:', error);
      setIsLoggedIn(false);
      setLoginDialogOpen(true);
      return null;
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

  const createChairsForTable = async (tableId: string, numSeats: number, userId: string) => {
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
          guest_id: null,
          created_by: userId
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
      // Get the current user ID
      const userId = await getUserId();
      
      // If no userId, we can't fetch tables
      if (!userId) {
        console.log('Cannot fetch tables: No authenticated user');
        return;
      }
      
      // Query tables for the current user
      const { data: tableData, error } = await supabase
        .from('seating_tables')
        .select('*')
        .eq('created_by', userId);
      
      if (error) {
        console.error('Database error fetching tables:', error);
        throw error;
      }
      
      if (tableData) {
        // Ensure all tables have position_x and position_y properties
        const formattedTables = tableData.map((table: any) => ({
          ...table,
          // If the table has position.x and position.y, map them to position_x and position_y
          position_x: table.position_x || (table.position ? table.position.x : 300),
          position_y: table.position_y || (table.position ? table.position.y : 200)
        }));
        
        setTables(formattedTables);
        
        // Create chairs for tables that don't have them
        for (const table of formattedTables) {
          await createChairsForTable(table.id, table.seats, userId);
        }
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch tables',
        severity: 'error'
      });
    }
  };

  const fetchChairs = async () => {
    try {
      // Get the current user ID
      const userId = await getUserId();
      
      // If no userId, we can't fetch chairs
      if (!userId) {
        console.log('Cannot fetch chairs: No authenticated user');
        return;
      }
      
      // First get all tables for this user
      const { data: userTables, error: tablesError } = await supabase
        .from('seating_tables')
        .select('id')
        .eq('created_by', userId);
      
      if (tablesError) {
        console.error('Error fetching tables for chairs:', tablesError);
        throw tablesError;
      }
      
      if (!userTables || userTables.length === 0) {
        // No tables found, so no chairs to fetch
        setChairs([]);
        return;
      }
      
      // Get all table IDs
      const tableIds = userTables.map(table => table.id);
      
      // Fetch chairs for these tables
      const { data, error } = await supabase
        .from('table_chairs')
        .select('*')
        .in('table_id', tableIds);
      
      if (error) {
        console.error('Error fetching chairs:', error);
        throw error;
      }
      
      setChairs(data || []);
    } catch (error) {
      console.error('Error fetching chairs:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch chairs',
        severity: 'error'
      });
    }
  };

  const fetchGuests = async () => {
    try {
      // Get the current user ID
      const userId = await getUserId();
      
      // If no userId, we can't fetch guests
      if (!userId) {
        console.log('Cannot fetch guests: No authenticated user');
        return;
      }
      
      // Query guests for the current user
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('created_by', userId);
      
      if (error) {
        console.error('Database error fetching guests:', error);
        throw error;
      }

      setGuests(data || []);
    } catch (error) {
      console.error('Error fetching guests:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch guests',
        severity: 'error'
      });
    }
  };





  const handleAddTable = async (data: TableFormData) => {
    try {
      console.log('Adding table with data:', data);
      
      const userId = await getUserId();
      if (!userId) {
        console.error('No user ID found');
        setSnackbar({
          open: true,
          message: 'Please log in to add tables',
          severity: 'error'
        });
        return;
      }
      console.log('User ID:', userId);

      if (!data.template_id) {
        console.error('No template ID provided');
        setSnackbar({
          open: true,
          message: 'Please select a table template',
          severity: 'error'
        });
        return;
      }

      // Get the template
      console.log('Fetching template with ID:', data.template_id);
      const { data: template, error: templateError } = await supabase
        .from('table_templates')
        .select('*')
        .eq('id', data.template_id)
        .single();

      console.log('Template data:', template, 'Error:', templateError);
      if (templateError || !template) {
        console.error('Template not found:', templateError);
        throw new Error('Template not found');
      }

      // Calculate grid-based dimensions
      const gridSize = 20; // Base grid size in pixels
      const width = Math.round(template.width / gridSize) * gridSize;
      const length = Math.round(template.length / gridSize) * gridSize;
      console.log('Calculated dimensions:', { width, length });

      // Create the table
      const tableData = {
        name: data.name,
        seats: template.seats,
        template_id: data.template_id,
        shape: template.shape,
        width: width,
        length: length,
        position_x: 300,
        position_y: 200,
        rotation: 0,
        created_by: userId
      };
      console.log('Creating table with data:', tableData);

      const { data: newTable, error: tableError } = await supabase
        .from('seating_tables')
        .insert([tableData])
        .select()
        .single();

      console.log('New table result:', newTable, 'Error:', tableError);
      if (tableError || !newTable) {
        console.error('Failed to create table:', tableError);
        throw new Error(tableError?.message || 'Failed to create table');
      }

      // Add the new table to state
      setTables([...tables, newTable]);

      // Create chairs for the new table
      const chairPositions = Array.from({ length: template.seats }, (_, i) => ({
        table_id: newTable.id,
        position: i + 1,
        angle: (i * 360) / template.seats,
        created_by: userId
      }));
      console.log('Creating chairs:', chairPositions);

      // Insert chairs into the database
      const { data: newChairs, error: chairsError } = await supabase
        .from('table_chairs')
        .insert(chairPositions)
        .select();

      console.log('New chairs result:', newChairs, 'Error:', chairsError);
      if (chairsError) {
        console.error('Failed to create chairs:', chairsError);
        // Don't throw here, we already created the table successfully
        setSnackbar({
          open: true,
          message: 'Table created but failed to create all chairs',
          severity: 'warning'
        });
      } else if (newChairs) {
        // Add the new chairs to state
        setChairs([...chairs, ...newChairs]);
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Table added successfully',
          severity: 'success'
        });
      }

      // Reset form
      setNewTableName('');
      setSelectedTemplate('');
      setEditDialogOpen(false);
      console.log('Table creation completed successfully');

    } catch (error) {
      console.error('Error adding table:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to add table',
        severity: 'error'
      });
    }
  };

  const handleAddGuest = async (name: string) => {
    try {
      const userId = await getUserId();
      
      // If no userId, we can't add guests
      if (!userId) {
        console.log('Cannot add guest: No authenticated user');
        setSnackbar({
          open: true,
          message: 'Please log in to add guests',
          severity: 'error'
        });
        return;
      }
      
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
          created_by: userId
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

  const handleChairClick = (chair: Chair) => {
    if (!isLoggedIn) {
      setLoginDialogOpen(true);
      return;
    }


    
    setSelectedChair(chair);
    
    // If chair already has a guest, show option to remove
    if (chair.guest_id) {
      // Implementation for removing a guest from chair
      handleRemoveGuestFromChair(chair.id);
    } else {
      // Implementation for assigning a guest to chair
      setAssignGuestDialogOpen(true);
    }
  };

  const handleRemoveGuestFromChair = async (chairId: string) => {
    try {
      // Verify user is authenticated
      const userId = await getUserId();
      
      // If no userId, we can't modify chairs
      if (!userId) {
        console.log('Cannot remove guest from chair: No authenticated user');
        setSnackbar({
          open: true,
          message: 'Please log in to modify seating assignments',
          severity: 'error'
        });
        return;
      }
      
      const { error } = await supabase
        .from('table_chairs')
        .update({ guest_id: null })
        .eq('id', chairId);

      if (error) throw error;

      // Update local state with proper type handling
      setChairs(chairs.map(chair => 
        chair.id === chairId ? { ...chair, guest_id: undefined } : chair
      ));

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
      const userId = await getUserId();
      
      // If no userId, we can't delete tables
      if (!userId) {
        console.log('Cannot delete table: No authenticated user');
        setSnackbar({
          open: true,
          message: 'Please log in to delete tables',
          severity: 'error'
        });
        return;
      }

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
                <InputLabel>Select Table Template</InputLabel>
                <Select
                  value={selectedTemplate}
                  label="Select Table Template"
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  {tableTemplates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name} ({template.seats} seats, {template.shape})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Button removed to avoid duplication with the one in DialogActions */}
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
      // Get the template to get the number of seats
      const template = tableTemplates.find(t => t.id === selectedTemplate);
      if (!template) {
        setSnackbar({
          open: true,
          message: 'Please select a table template',
          severity: 'error'
        });
        return;
      }
      await handleAddTable({ name: newTableName, template_id: selectedTemplate, seats: template.seats });
    } else if (selectedTable) {
      try {
        const userId = await getUserId();
        
        // If no userId, we can't update tables
        if (!userId) {
          console.log('Cannot update table: No authenticated user');
          setSnackbar({
            open: true,
            message: 'Please log in to update tables',
            severity: 'error'
          });
          return;
        }

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

  // Data fetching is now handled by the useEffect that depends on isLoggedIn

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Handle guest assignment to chair
    if ((source.droppableId === 'guests' || source.droppableId === 'guests-list') && destination.droppableId.startsWith('chair-')) {
      const chairId = destination.droppableId.replace('chair-', '');
      const guestId = draggableId;
      handleAssignGuestToChair(chairId, guestId);
    }
  };

  const handleAssignGuestToChair = async (chairId: string, guestId: string) => {
    try {
      // Verify user is authenticated
      const userId = await getUserId();
      
      // If no userId, we can't assign guests
      if (!userId) {
        console.log('Cannot assign guest to chair: No authenticated user');
        setSnackbar({
          open: true,
          message: 'Please log in to assign guests',
          severity: 'error'
        });
        return;
      }
      
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

  const handleAssignGuestToChairDialog = async (chairId: string, guestId: string) => {
    await handleAssignGuestToChair(chairId, guestId);
    setAssignGuestDialogOpen(false);
  };





  const handleTableDragStart = (e: React.MouseEvent, table: Table) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!chartAreaRef.current) return;
    
    // Set the currently selected table
    setSelectedTable(table);
    
    // Get the initial mouse position
    const chartRect = chartAreaRef.current.getBoundingClientRect();
    const startX = e.clientX - chartRect.left;
    const startY = e.clientY - chartRect.top;
    
    // Calculate the offset from the mouse to the table's top-left corner
    const offsetX = startX - table.position_x;
    const offsetY = startY - table.position_y;
    
    // Define the move handler
    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      
      // Calculate the new position
      const newX = moveEvent.clientX - chartRect.left - offsetX;
      const newY = moveEvent.clientY - chartRect.top - offsetY;
      
      // Update the table position in state
      setTables(prevTables => 
        prevTables.map(t => 
          t.id === table.id 
            ? { ...t, position_x: Math.max(0, newX), position_y: Math.max(0, newY) } 
            : t
        )
      );
    };
    
    // Define the mouse up handler
    const handleMouseUp = async () => {
      // Remove event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Get the updated table from state
      const updatedTable = tables.find(t => t.id === table.id);
      
      if (updatedTable) {
        try {
          console.log('Updating table position:', updatedTable.id, updatedTable.position_x, updatedTable.position_y);
          
          // Update the table position in the database
          const { error } = await supabase
            .from('seating_tables')
            .update({ 
              position_x: updatedTable.position_x, 
              position_y: updatedTable.position_y 
            })
            .eq('id', updatedTable.id);
          
          if (error) {
            console.error('Database error:', error);
            throw error;
          }
          
          console.log('Table position updated successfully');
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
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeStart = (e: React.MouseEvent, table: Table, corner: string) => {
    if (!chartAreaRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Get the chart area dimensions
    const chartRect = chartAreaRef.current.getBoundingClientRect();
    const initialX = e.clientX - chartRect.left;
    const initialY = e.clientY - chartRect.top;
    
    // Store the original table size
    const originalWidth = table.width;
    const originalLength = table.length;
    
    // Define the mouse move handler
    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      
      const currentX = moveEvent.clientX - chartRect.left;
      const currentY = moveEvent.clientY - chartRect.top;
      
      const deltaX = currentX - initialX;
      const deltaY = currentY - initialY;
      
      let newWidth = originalWidth;
      let newLength = originalLength;
      
      // Adjust width and length based on which corner is being dragged
      if (corner === 'top-left') {
        newWidth = Math.max(60, originalWidth - deltaX);
        newLength = Math.max(60, originalLength - deltaY);
      } else if (corner === 'top-right') {
        newWidth = Math.max(60, originalWidth + deltaX);
        newLength = Math.max(60, originalLength - deltaY);
      } else if (corner === 'bottom-left') {
        newWidth = Math.max(60, originalWidth - deltaX);
        newLength = Math.max(60, originalLength + deltaY);
      } else if (corner === 'bottom-right') {
        newWidth = Math.max(60, originalWidth + deltaX);
        newLength = Math.max(60, originalLength + deltaY);
      }
      
      // Update the table dimensions in state
      setTables(prevTables => 
        prevTables.map(t => 
          t.id === table.id 
            ? { ...t, width: newWidth, length: newLength } 
            : t
        )
      );
    };
    
    // Define the mouse up handler
    const handleMouseUp = async () => {
      // Remove event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Get the updated table from state
      const updatedTable = tables.find(t => t.id === table.id);
      
      if (updatedTable) {
        try {
          console.log('Updating table size:', updatedTable.id, updatedTable.width, updatedTable.length);
          
          // Update the table dimensions in the database
          const { error } = await supabase
            .from('seating_tables')
            .update({ 
              width: updatedTable.width, 
              length: updatedTable.length 
            })
            .eq('id', updatedTable.id);
          
          if (error) {
            console.error('Database error:', error);
            throw error;
          }
          
          console.log('Table size updated successfully');
        } catch (error) {
          console.error('Error updating table size:', error);
          setSnackbar({
            open: true,
            message: 'Failed to update table size',
            severity: 'error'
          });
        }
      }
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const renderTable = (table: Table) => {
    const tableChairs = chairs.filter(chair => chair.table_id === table.id);
    const isSelected = selectedTable?.id === table.id;
    const chairsWithPositions = calculateChairPositions(tableChairs, table);
    const showResizeHandles = isSelected;
    
    return (
      <Box
        key={table.id}
        sx={{
          position: 'absolute',
          left: `${table.position_x}px`,
          top: `${table.position_y}px`,
          width: `${table.width}px`,
          height: `${table.length}px`,
          border: isSelected ? '2px solid blue' : '1px solid black',
          borderRadius: table.shape === 'round' ? '50%' : 
                      table.shape === 'oval' ? '50px' : 
                      table.shape === 'rectangular' ? '0' : 
                      table.shape === 'square' ? '0' : '0',
          transform: `rotate(${table.rotation}deg)`,
          backgroundColor: table.shape === 'round' ? 'rgba(173, 216, 230, 0.7)' : 
          table.shape === 'rectangular' ? 'rgba(144, 238, 144, 0.7)' : 
          table.shape === 'square' ? 'rgba(255, 182, 193, 0.7)' : 
          table.shape === 'oval' ? 'rgba(255, 222, 173, 0.7)' : 
          'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'move',
          zIndex: isSelected ? 3 : 2,
          userSelect: 'none', // Prevent text selection during drag
          touchAction: 'none', // Prevent touch actions during drag
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTable(table);
          setEditMode('edit');
        }}
        onMouseDown={(e) => handleTableDragStart(e, table)}
      >
        <Typography variant="body2" sx={{ userSelect: 'none' }}>
          {table.name} ({tableChairs.length})
        </Typography>
        
        {/* Render chairs */}
        {chairsWithPositions.map((chairWithPos) => (
          <Box
            key={chairWithPos.id}
            sx={{
              position: 'absolute',
              left: `${chairWithPos.x}px`,
              top: `${chairWithPos.y}px`,
              width: '20px',
              height: '20px',
              backgroundColor: chairWithPos.guest_id ? 'green' : 'gray',
              borderRadius: '50%',
              cursor: 'pointer',
              border: selectedChair?.id === chairWithPos.id ? '2px solid blue' : 'none',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              fontSize: '10px',
              userSelect: 'none',
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleChairClick(chairWithPos);
            }}
          >
            {chairWithPos.position}
          </Box>
        ))}
        
        {/* Resize handles */}
        {showResizeHandles && (
          <>
            <Box
              sx={{
                position: 'absolute',
                left: '-5px',
                top: '-5px',
                width: '10px',
                height: '10px',
                backgroundColor: 'blue',
                cursor: 'nwse-resize',
                zIndex: 4,
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
                backgroundColor: 'blue',
                cursor: 'nesw-resize',
                zIndex: 4,
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
                backgroundColor: 'blue',
                cursor: 'nesw-resize',
                zIndex: 4,
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
                backgroundColor: 'blue',
                cursor: 'nwse-resize',
                zIndex: 4,
              }}
              onMouseDown={(e) => handleResizeStart(e, table, 'bottom-right')}
            />
          </>
        )}
      </Box>
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Container maxWidth={false} sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header with improved styling */}
        <Box 
          sx={{ 
            mb: 4, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            position: 'relative',
            pb: 2,
            borderBottom: '1px solid rgba(5, 70, 151, 0.1)',
          }}
        >
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontFamily: "'Giaza', serif", 
                color: '#054697',
                letterSpacing: '-0.05em',
                mb: 1
              }}
            >
              Seating Chart
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#054697', 
                opacity: 0.8,
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 300
              }}
            >
              Arrange tables and assign guests to create your perfect seating plan
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
              sx={{
                borderColor: '#E8B4B4',
                color: '#054697',
                textTransform: 'uppercase',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                borderRadius: 0,
                px: 3,
                py: 1,
                '&:hover': {
                  borderColor: '#E8B4B4',
                  backgroundColor: 'rgba(232, 180, 180, 0.1)',
                },
              }}
            >
              Back to Dashboard
            </Button>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditMode('add');
                setNewTableName('');
                setSelectedTemplate('');
                setEditDialogOpen(true);
              }}
              sx={{
                backgroundColor: '#E8B4B4',
                color: '#054697',
                textTransform: 'uppercase',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                borderRadius: 0,
                px: 3,
                py: 1,
                '&:hover': {
                  backgroundColor: 'rgba(232, 180, 180, 0.8)',
                },
              }}
            >
              Add Table
            </Button>
          </Box>
          
          {/* Accent line at the top */}
          <Box 
            sx={{ 
              position: 'absolute', 
              top: -8, 
              left: 0, 
              width: '100%', 
              height: '2px', 
              background: 'linear-gradient(to right, #054697, #E8B4B4)' 
            }} 
          />
        </Box>
        
        <Box sx={{ display: 'flex', height: 'calc(100% - 60px)', gap: 3 }}>
          {/* Chart area with improved styling */}
          <Paper 
            ref={chartAreaRef}
            sx={{ 
              flex: 3, 
              p: 3, 
              position: 'relative', 
              overflow: 'auto',
              borderRadius: 0,
              border: '1px solid rgba(5, 70, 151, 0.1)',
              boxShadow: '0 4px 20px rgba(5, 70, 151, 0.05)',
              backgroundColor: '#FBFBF7',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                backgroundColor: '#054697',
              }
            }}
          >
            {/* Tables container with higher z-index */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                zIndex: 2,
                transform: 'none',
                transformOrigin: 'center',
                transition: 'transform 0.3s ease',
              }}
              onClick={() => {
                setSelectedTable(null);
              }}
            >
              {tables.map((table) => (
                renderTable(table)
              ))}
            </Box>
          </Paper>
          
          {/* Guest list sidebar */}
          <Paper 
            sx={{ 
              flex: 1, 
              ml: 2, 
              p: 2, 
              height: '100%', 
              overflow: 'auto',
              borderRadius: 0,
              border: '1px solid rgba(5, 70, 151, 0.1)',
              boxShadow: '0 4px 20px rgba(5, 70, 151, 0.05)',
              backgroundColor: '#FBFBF7',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                backgroundColor: '#054697',
              }
            }}
          >
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  fontFamily: "'Giaza', serif",
                  color: '#054697',
                  letterSpacing: '-0.05em',
                }}
              >
                Guest List
              </Typography>
              <GuestList 
                guests={guests} 
                onAddGuest={handleAddGuest}
                filter={filter}
                onFilterChange={setFilter}
              />
          </Paper>
        </Box>
        
        {/* Add/Edit table dialog */}
        <EditTableDialog />

        {/* Delete confirmation dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 0,
              p: 1,
              boxShadow: '0 4px 20px rgba(5, 70, 151, 0.1)',
              border: '1px solid rgba(5, 70, 151, 0.1)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                backgroundColor: '#054697',
              }
            }
          }}
        >
          <DialogTitle sx={{ color: '#054697', fontFamily: "'Giaza', serif", letterSpacing: '-0.05em' }}>Delete Table</DialogTitle>
          <DialogContent>
            <Typography sx={{ color: '#054697', opacity: 0.8, fontFamily: 'Poppins, sans-serif', fontWeight: 300 }}>
              Are you sure you want to delete this table? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialogOpen(false)}
              sx={{
                color: '#054697',
                textTransform: 'uppercase',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                '&:hover': {
                  backgroundColor: 'rgba(5, 70, 151, 0.05)',
                },
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteTable} 
              sx={{
                backgroundColor: '#E8B4B4',
                color: '#054697',
                textTransform: 'uppercase',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: 'rgba(232, 180, 180, 0.8)',
                },
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Login dialog */}
        <Dialog 
          open={loginDialogOpen} 
          onClose={() => setLoginDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 0,
              p: 1,
              boxShadow: '0 4px 20px rgba(5, 70, 151, 0.1)',
              border: '1px solid rgba(5, 70, 151, 0.1)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                backgroundColor: '#054697',
              }
            }
          }}
        >
          <DialogTitle sx={{ color: '#054697', fontFamily: "'Giaza', serif", letterSpacing: '-0.05em' }}>Login Required</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            <Typography variant="body2" sx={{ mb: 2, color: '#054697', opacity: 0.8, fontFamily: 'Poppins, sans-serif', fontWeight: 300 }}>
              You need to be logged in to manage seating charts.
            </Typography>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              sx={{
                '& .MuiInputLabel-root': {
                  color: '#054697',
                  opacity: 0.8,
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#054697',
                    opacity: 0.3,
                  },
                  '&:hover fieldset': {
                    borderColor: '#054697',
                    opacity: 0.5,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#054697',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              sx={{
                '& .MuiInputLabel-root': {
                  color: '#054697',
                  opacity: 0.8,
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#054697',
                    opacity: 0.3,
                  },
                  '&:hover fieldset': {
                    borderColor: '#054697',
                    opacity: 0.5,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#054697',
                  },
                },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setLoginDialogOpen(false)}
              sx={{
                color: '#054697',
                '&:hover': {
                  backgroundColor: 'rgba(5, 70, 151, 0.05)',
                },
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleLogin} 
              disabled={!email || !password}
              sx={{
                backgroundColor: '#E8B4B4',
                color: '#054697',
                '&:hover': {
                  backgroundColor: 'rgba(232, 180, 180, 0.8)',
                },
                '&.Mui-disabled': {
                  color: '#054697',
                  opacity: 0.5,
                },
              }}
            >
              Login
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Guest Dialog */}
        <Dialog 
          open={guestDialogOpen} 
          onClose={() => setGuestDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 0,
              p: 1,
              boxShadow: '0 4px 20px rgba(5, 70, 151, 0.1)',
              border: '1px solid rgba(5, 70, 151, 0.1)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                backgroundColor: '#054697',
              }
            }
          }}
        >
          <DialogTitle sx={{ color: '#054697', fontFamily: "'Giaza', serif", letterSpacing: '-0.05em' }}>Add Guest</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Guest Name"
              fullWidth
              variant="outlined"
              sx={{ 
                mb: 2, 
                mt: 1,
                '& .MuiInputLabel-root': {
                  color: '#054697',
                  opacity: 0.8,
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#054697',
                    opacity: 0.3,
                  },
                  '&:hover fieldset': {
                    borderColor: '#054697',
                    opacity: 0.5,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#054697',
                  },
                },
              }}
            />
            <TextField
              margin="dense"
              label="Email (Optional)"
              fullWidth
              variant="outlined"
              sx={{ 
                mb: 2,
                '& .MuiInputLabel-root': {
                  color: '#054697',
                  opacity: 0.8,
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#054697',
                    opacity: 0.3,
                  },
                  '&:hover fieldset': {
                    borderColor: '#054697',
                    opacity: 0.5,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#054697',
                  },
                },
              }}
            />
            <FormControl 
              fullWidth 
              sx={{ 
                mb: 2,
                '& .MuiInputLabel-root': {
                  color: '#054697',
                  opacity: 0.8,
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#054697',
                    opacity: 0.3,
                  },
                  '&:hover fieldset': {
                    borderColor: '#054697',
                    opacity: 0.5,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#054697',
                  },
                },
              }}
            >
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
            <Button 
              onClick={() => setGuestDialogOpen(false)}
              sx={{
                color: '#054697',
                '&:hover': {
                  backgroundColor: 'rgba(5, 70, 151, 0.05)',
                },
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // Add guest logic would go here
                setSnackbar({
                  open: true,
                  message: 'Guest added successfully',
                  severity: 'success'
                });
              }}
              sx={{
                backgroundColor: '#E8B4B4',
                color: '#054697',
                '&:hover': {
                  backgroundColor: 'rgba(232, 180, 180, 0.8)',
                },
              }}
            >
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
          PaperProps={{
            sx: {
              borderRadius: 0,
              p: 1,
              boxShadow: '0 4px 20px rgba(5, 70, 151, 0.1)',
              border: '1px solid rgba(5, 70, 151, 0.1)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                backgroundColor: '#054697',
              }
            }
          }}
        >
          <DialogTitle sx={{ color: '#054697', fontFamily: "'Giaza', serif", letterSpacing: '-0.05em' }}>
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
                        handleAssignGuestToChairDialog(selectedChair.id, guest.id);
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
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity} 
            sx={{ 
              width: '100%', 
              borderRadius: 0,
              backgroundColor: snackbar.severity === 'success' ? 'rgba(232, 180, 180, 0.9)' : undefined,
              color: snackbar.severity === 'success' ? '#054697' : undefined,
              '& .MuiAlert-icon': {
                color: snackbar.severity === 'success' ? '#054697' : undefined,
              }
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </DragDropContext>
  );
}
