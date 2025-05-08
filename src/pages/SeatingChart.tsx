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
  ListItemSecondaryAction,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { DragDropContext } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import GuestList from '../components/SeatingChart/GuestList';
import VenueSelector from '../components/SeatingChart/VenueSelector';
import { useNavigate } from 'react-router-dom';
import { Guest } from '../types/Guest';
import { getSupabase } from '../supabaseClient';
import { useTheme } from '@mui/material';

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

interface Venue {
  id: string;
  name: string;
  address: string;
  created_at: string;
  floor_plan_id?: string;
}

interface VenueRoom {
  id: string;
  venue_id: string;
  name: string;
  width: number;
  length: number;
  floor_plan_url?: string;
  room_type?: string;
}

interface Venue {
  id: string;
  name: string;
  address: string;
  created_at: string;
  floor_plan_id?: string;
}

interface VenueRoom {
  id: string;
  venue_id: string;
  name: string;
  width: number;
  length: number;
  floor_plan_url?: string;
}

interface TableFormData {
  name: string;
  template_id: string;
  seats: number;
}

export default function SeatingChart() {
  const navigate = useNavigate();
  const theme = useTheme();
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
  
  // Venue management state
  const [venues, setVenues] = useState<Venue[]>([]);
  const [venueRooms, setVenueRooms] = useState<VenueRoom[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<VenueRoom | null>(null);
  const [currentFloorPlanUrl, setCurrentFloorPlanUrl] = useState<string | null>(null); // Added state for floor plan URL
  
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
    severity: 'info',
  });

  // Placeholder for handleDropOnChart to resolve lint error
  const handleDropOnChart = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    // console.log('Dropped on chart area', event.dataTransfer.getData('text'));
    // Actual logic for handling dropped tables would go here.
    // This might involve getting data from event.dataTransfer (if using native HTML D&D)
    // or this handler might be replaced if using a library like react-beautiful-dnd for the chart area itself.
  };

  // Check authentication status when component mounts
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchVenues();
      fetchTableTemplates();
      fetchGuests();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && selectedRoom?.id) {
      fetchTables(selectedRoom.id);
    }
  }, [isLoggedIn, selectedRoom?.id]);

  useEffect(() => {
    if (selectedRoom && selectedRoom.floor_plan_url) {
      const supabase = getSupabase();
      const { data } = supabase.storage
        .from('venue-floor-plans') // Ensure this is your bucket name
        .getPublicUrl(selectedRoom.floor_plan_url);
      setCurrentFloorPlanUrl(data.publicUrl);
    } else {
      setCurrentFloorPlanUrl(null);
    }
  }, [selectedRoom]);

  const checkAuth = async () => {
    const supabase = getSupabase();
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      setIsLoggedIn(false);
      setLoginDialogOpen(true); // Show login if no session or error
    } else {
      setIsLoggedIn(true);
      // const user = session.user; // User object available if needed
    }
  };

  // Venue management functions
  const fetchVenues = async () => {
    try {
      const supabase = getSupabase();
      const { data: venuesData, error: venuesError } = await supabase
        .from('venues')
        .select('*');

      if (venuesError) throw venuesError;
      setVenues(venuesData || []);

      // If there's a selected venue, fetch its rooms
      if (venuesData && venuesData.length > 0) {
        if (!selectedVenue) {
          setSelectedVenue(venuesData[0]);
        }
        
        const { data: roomsData, error: roomsError } = await supabase
          .from('venue_rooms')
          .select('*')
          .eq('venue_id', selectedVenue?.id || venuesData[0].id);

        if (roomsError) throw roomsError;
        setVenueRooms(roomsData || []);
        
        // Set the first room as selected if there are rooms and none is selected
        if (roomsData && roomsData.length > 0 && !selectedRoom) {
          setSelectedRoom(roomsData[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load venues',
        severity: 'error'
      });
    }
  };

  const handleVenueChange = (venue: Venue) => {
    setSelectedVenue(venue);
    setSelectedRoom(null);
    
    // Fetch rooms for the selected venue
    const supabase = getSupabase();
    supabase
      .from('venue_rooms')
      .select('*')
      .eq('venue_id', venue.id)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching rooms:', error);
          return;
        }
        setVenueRooms(data || []);
        if (data && data.length > 0) {
          setSelectedRoom(data[0]);
        }
      });
  };

  const handleRoomChange = (room: VenueRoom) => {
    setSelectedRoom(room);
  };

  const handleAddVenue = async (name: string, address: string) => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('venues')
        .insert([{ name, address, created_by: userId }])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setVenues([...venues, data[0]]);
        setSelectedVenue(data[0]);
        setSnackbar({
          open: true,
          message: 'Venue added successfully',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error adding venue:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add venue',
        severity: 'error'
      });
    }
  };

  const handleAddRoom = async (name: string, width: number, length: number) => {
    try {
      if (!selectedVenue) {
        setSnackbar({
          open: true,
          message: 'Please select a venue first',
          severity: 'error'
        });
        return;
      }

      const userId = await getUserId();
      if (!userId) return;

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('venue_rooms')
        .insert([{ 
          venue_id: selectedVenue.id, 
          name, 
          width, 
          length, 
          created_by: userId 
        }])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setVenueRooms([...venueRooms, data[0]]);
        setSelectedRoom(data[0]);
        setSnackbar({
          open: true,
          message: 'Room added successfully',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error adding room:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add room',
        severity: 'error'
      });
    }
  };
  
  // Handle floor plan upload for venues
  const handleFloorPlanUpload = async (venueId: string, file: File) => {
    try {
      if (!file || !venueId) {
        setSnackbar({
          open: true,
          message: 'Please select a file and venue',
          severity: 'error'
        });
        return;
      }
      
      const userId = await getUserId();
      if (!userId) return;
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${venueId}-${Date.now()}.${fileExt}`;
      const filePath = `floor_plans/${fileName}`;
      
      // Upload the file to Supabase Storage
      const supabase = getSupabase();
      const { error: uploadError } = await supabase
        .storage
        .from('venue-floor-plans')
        .upload(filePath, file, { contentType: file.type });
        
      if (uploadError) {
      console.error("Upload error details:", uploadError);
      throw uploadError;
    }
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase
        .storage
        .from('venue-floor-plans')
        .getPublicUrl(filePath);
      
      // Create a new floor plan record in the database
      const { data: floorPlanData, error: floorPlanError } = await supabase
        .from('floor_plans')
        .insert({
          name: file.name,
          image_url: publicUrl,
          created_by: userId
        })
        .select();
        
      if (floorPlanError) throw floorPlanError;
      
      // Update the venue with the floor plan ID
      if (floorPlanData && floorPlanData.length > 0) {
        const { error: venueUpdateError } = await supabase
          .from('venues')
          .update({ floor_plan_id: floorPlanData[0].id })
          .eq('id', venueId);
          
        if (venueUpdateError) throw venueUpdateError;
        
        // Update the selected venue in state
        if (selectedVenue && selectedVenue.id === venueId) {
          setSelectedVenue({
            ...selectedVenue,
            floor_plan_id: floorPlanData[0].id
          });
        }
        
        setSnackbar({
          open: true,
          message: 'Floor plan uploaded successfully',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error uploading floor plan:', error);
      setSnackbar({
        open: true,
        message: 'Failed to upload floor plan',
        severity: 'error'
      });
    }
  };

  // Handle floor plan upload for venue rooms
  const handleRoomFloorPlanUpload = async (roomId: string, file: File) => {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: "File size exceeds 5MB limit",
        severity: "error"
      });
      return;
    }

    try {
      if (!file || !roomId) {
        setSnackbar({
          open: true,
          message: 'Please select a file and room',
          severity: 'error'
        });
        return;
      }
      
      const userId = await getUserId();
      if (!userId) return;
      
      // Create a unique file name with sanitized extension
      let fileExt = file.name.split('.').pop() || 'jpg';
      // Ensure extension is lowercase and only contains letters
      fileExt = fileExt.toLowerCase().replace(/[^a-z]/g, '');
      // Default to jpg if extension is invalid
      if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
        fileExt = 'jpg';
      }
      
      const fileName = `room-${roomId}-${Date.now()}.${fileExt}`;
      const filePath = `floor_plans/${fileName}`;
      
      console.log(`Uploading original file: ${file.name} with original type: ${file.type}`);
      
      // Determine the correct content type based on extension as a fallback
      let calculatedContentType = 'image/jpeg';
      if (fileExt === 'png') calculatedContentType = 'image/png';
      if (fileExt === 'gif') calculatedContentType = 'image/gif';
      
      const finalContentType = file.type || calculatedContentType;

      console.log(`[SeatingChart.tsx] About to upload.`);
      console.log(`[SeatingChart.tsx] File Name: ${file.name}`);
      console.log(`[SeatingChart.tsx] File Original Type (file.type): ${file.type}`);
      console.log(`[SeatingChart.tsx] Calculated Fallback Content Type: ${calculatedContentType}`);
      console.log(`[SeatingChart.tsx] Final ContentType for Supabase: ${finalContentType}`);
      console.log(`[SeatingChart.tsx] File Object being passed:`, file); // Log the whole file object
      
      // Upload the original File object. 
      // Supabase's upload function should respect the 'type' property of the File object.
      const supabase = getSupabase();
      const { error: uploadError } = await supabase
        .storage
        .from('venue-floor-plans')
        .upload(filePath, file, { 
          contentType: finalContentType, 
          upsert: true 
        });
        
      if (uploadError) {
        console.error('Upload error details:', JSON.stringify(uploadError, null, 2));
        throw uploadError;
      }
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase
        .storage
        .from('venue-floor-plans')
        .getPublicUrl(filePath);
      
      // Update the venue room with the floor plan URL directly
      const { error: roomUpdateError } = await supabase
        .from('venue_rooms')
        .update({ 
          floor_plan_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId);
        
      if (roomUpdateError) throw roomUpdateError;
      
      // Update the selected room in state
      if (selectedRoom && selectedRoom.id === roomId) {
        setSelectedRoom({
          ...selectedRoom,
          floor_plan_url: publicUrl
        });
      }
      
      // Refresh the venue rooms list
      if (selectedVenue) {
        const { data: updatedRooms } = await supabase
          .from('venue_rooms')
          .select('*')
          .eq('venue_id', selectedVenue.id);
          
        if (updatedRooms) {
          setVenueRooms(updatedRooms);
        }
      }
      
      setSnackbar({
        open: true,
        message: 'Room floor plan uploaded successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error uploading room floor plan:', error);
      setSnackbar({
        open: true,
        message: 'Failed to upload room floor plan',
        severity: 'error'
      });
    }
  };

  const handleLogin = async () => {
    try {
      const supabase = getSupabase();
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
    const supabase = getSupabase();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User not logged in or error fetching user:', userError);
      setSnackbar({ open: true, message: 'You need to be logged in to perform this action.', severity: 'error' });
      // Optionally, trigger login dialog or redirect
      // setLoginDialogOpen(true);
      return null;
    }
    return user.id;
  };

  const fetchTableTemplates = async () => {
    try {
      const supabase = getSupabase();
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
      const supabase = getSupabase();
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
      
      // Using the same supabase instance from above
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

  const fetchTables = async (roomId: string) => { // Add roomId parameter
    const userId = await getUserId();
    if (!userId) return;

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('seating_tables')
        .select('*')
        .eq('created_by', userId)
        .eq('room_id', roomId); // Filter by room_id

      if (error) {
        console.error('Error fetching tables:', error);
        setSnackbar({ open: true, message: `Error fetching tables: ${error.message}`, severity: 'error' });
        return;
      }
      
      const tablesWithChairs = await Promise.all(
        (data || []).map(async (table) => {
          const { data: chairData, error: chairError } = await supabase
            .from('table_chairs')
            .select('*')
            .eq('table_id', table.id)
            .eq('created_by', userId);
          
          if (chairError) {
            console.error(`Error fetching chairs for table ${table.id}:`, chairError);
            return { ...table, chairs: [] };
          }
          return { ...table, chairs: chairData || [] };
        })
      );

      setTables(tablesWithChairs);
      // After fetching tables, you might want to fetch all chairs for these tables if not done above
      // Or ensure chair data is complete within each table object
      // fetchChairs(tablesWithChairs.map(t => t.id)); // Example if fetchChairs accepts table IDs

    } catch (error: any) {
      console.error('Error in fetchTables:', error);
      setSnackbar({ open: true, message: `Error fetching tables: ${error.message}`, severity: 'error' });
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
      const supabase = getSupabase();
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
      // Using the same supabase instance from above
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
      const supabase = getSupabase();
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
      const supabaseClient = getSupabase();
      const { data: template, error: templateError } = await supabaseClient
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

      const { data: newTable, error: tableError } = await supabaseClient
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

      // First check if there are existing chairs for this table
      const { data: existingChairs } = await supabaseClient
        .from('table_chairs')
        .select('position')
        .eq('table_id', newTable.id);
      
      // Create a set of existing positions
      const existingPositions = new Set(existingChairs?.map(chair => chair.position) || []);
      
      // Filter out chairs with positions that already exist
      const uniqueChairPositions = chairPositions.filter(chair => !existingPositions.has(chair.position));
      
      // Only insert chairs if there are unique positions to add
      let newChairs = null;
      let chairsError = null;
      
      if (uniqueChairPositions.length > 0) {
        // Insert chairs into the database
        const result = await supabaseClient
          .from('table_chairs')
          .insert(uniqueChairPositions)
          .select();
          
        newChairs = result.data;
        chairsError = result.error;
      }

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
      const supabaseClient = getSupabase();
      const { data, error } = await supabaseClient
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
      
      const supabaseClient = getSupabase();
      const { error } = await supabaseClient
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
      const supabaseClient = getSupabase();
      const { error } = await supabaseClient
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
      const supabaseClient = getSupabase();
      const { error } = await supabaseClient
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
        <DialogTitle sx={{ color: '#054697' }}>
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
              <Typography variant="subtitle1" sx={{ mb: 2, color: '#054697' }}>Select Table Template</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {tableTemplates.map((template) => (
                  <Grid item xs={12} sm={6} key={template.id}>
                    <Paper 
                      elevation={selectedTemplate === template.id ? 3 : 1}
                      sx={{
                        p: 2, 
                        cursor: 'pointer',
                        border: selectedTemplate === template.id ? '2px solid #054697' : '1px solid #B8BDD7',
                        backgroundColor: selectedTemplate === template.id ? '#FFE8E4' : 'white',
                        '&:hover': { backgroundColor: '#FFE8E4' }
                      }}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Table Shape Icon */}
                        <Box sx={{ width: 60, height: 60, flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {template.shape === 'round' && (
                            <Box sx={{ width: 50, height: 50, borderRadius: '50%', border: '2px solid #054697' }} />
                          )}
                          {template.shape === 'rectangular' && (
                            <Box sx={{ width: 50, height: 25, border: '2px solid #054697' }} />
                          )}
                          {template.shape === 'square' && (
                            <Box sx={{ width: 40, height: 40, border: '2px solid #054697' }} />
                          )}
                          {template.shape === 'oval' && (
                            <Box sx={{ width: 50, height: 30, borderRadius: '50%', border: '2px solid #054697' }} />
                          )}
                        </Box>

                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#054697' }}>
                            {template.seats} seats, {template.shape}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
          
          {editMode === 'edit' && selectedTable && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: '#054697' }}>
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
                disabled={!selectedGuest}
                onClick={() => {
                  if (selectedGuest && selectedTable) {
                    handleAssignGuestToTable(selectedTable.id, selectedGuest);
                    setSelectedGuest('');
                  }
                }}
                sx={{ 
                  mb: 2,
                  bgcolor: '#FFE8E4', 
                  color: '#054697',
                  '&:hover': { bgcolor: '#FFD5CC' },
                  '&.Mui-disabled': { bgcolor: '#f5f5f5', color: 'rgba(0, 0, 0, 0.26)' }
                }}
              >
                Assign Guest
              </Button>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" sx={{ mb: 1, color: '#054697' }}>
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
          <Button 
            onClick={() => setEditDialogOpen(false)}
            sx={{ color: 'rgba(5, 70, 151, 0.8)' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveTable}
            sx={{ 
              bgcolor: '#FFE8E4', 
              color: '#054697',
              '&:hover': { bgcolor: '#FFD5CC' }
            }}
          >
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

        const supabase = getSupabase();
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
      const supabase = getSupabase();
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
          const supabaseClient = getSupabase();
          const { error } = await supabaseClient
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
          const supabaseClient = getSupabase();
          const { error } = await supabaseClient
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
          <Box
            ref={chartAreaRef}
            id="chart-area-box" // Added an ID for clarity and easier selection if needed
            sx={{
              position: 'relative',
              width: selectedRoom ? `${selectedRoom.width * 10}px` : '1000px',
              height: selectedRoom ? `${selectedRoom.length * 10}px` : '800px',
              border: `1px solid ${theme.palette.primary.main}`,
              overflow: 'auto',
              backgroundColor: currentFloorPlanUrl ? 'transparent' : theme.palette.background.paper,
              backgroundImage: currentFloorPlanUrl ? `url(${currentFloorPlanUrl})` : 'none',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: '4px', 
            }}
            onDrop={handleDropOnChart}
            onDragOver={(e) => e.preventDefault()} // Necessary for onDrop to work
          >
            {tables.map((table) => (
              renderTable(table)
            ))}
          </Box>
          
          {/* Venue selector sidebar */}
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
              <VenueSelector 
                venues={venues}
                venueRooms={venueRooms}
                selectedVenue={selectedVenue}
                selectedRoom={selectedRoom}
                onVenueChange={handleVenueChange}
                onRoomChange={handleRoomChange}
                onAddVenue={handleAddVenue}
                onAddRoom={handleAddRoom}
                onFloorPlanUpload={handleFloorPlanUpload}
                onRoomFloorPlanUpload={handleRoomFloorPlanUpload}
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
