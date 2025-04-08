import React, { useState, useEffect } from 'react';
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
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Snackbar,
  Alert,
  Paper,
  Grid
} from '@mui/material';
import { createClient } from '@supabase/supabase-js';

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
  width: number;
  length: number;
  position_x: number;
  position_y: number;
  rotation: number;
  created_by: string;
}

interface Chair {
  id: string;
  table_id: string;
  position: number;
  angle: number;
  guest_id?: string;
  created_by: string;
}

interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  created_by: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

export default function SeatingChartFixed() {
  // State for tables and templates
  const [tables, setTables] = useState<Table[]>([]);
  const [tableTemplates, setTableTemplates] = useState<TableTemplate[]>([]);
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tableName, setTableName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Load table templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('table_templates')
          .select('*')
          .order('name');
        
        if (error) throw error;
        if (data) setTableTemplates(data);
      } catch (error) {
        console.error('Error fetching table templates:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load table templates',
          severity: 'error'
        });
      }
    };

    const fetchTables = async () => {
      try {
        const { data, error } = await supabase
          .from('seating_tables')
          .select('*')
          .order('name');
        
        if (error) throw error;
        if (data) setTables(data);
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    };

    const fetchChairs = async () => {
      try {
        const { data, error } = await supabase
          .from('table_chairs')
          .select('*');
        
        if (error) throw error;
        if (data) setChairs(data);
      } catch (error) {
        console.error('Error fetching chairs:', error);
      }
    };

    const fetchGuests = async () => {
      try {
        const { data, error } = await supabase
          .from('guests')
          .select('*')
          .order('last_name');
        
        if (error) throw error;
        if (data) setGuests(data);
      } catch (error) {
        console.error('Error fetching guests:', error);
      }
    };

    fetchTemplates();
    fetchTables();
    fetchChairs();
    fetchGuests();
  }, []);

  // Get current user ID
  const getUserId = async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id;
  };

  // Handle adding a new table
  const handleAddTable = async () => {
    try {
      if (!tableName) {
        setSnackbar({
          open: true,
          message: 'Please enter a table name',
          severity: 'error'
        });
        return;
      }

      if (!selectedTemplate) {
        setSnackbar({
          open: true,
          message: 'Please select a table template',
          severity: 'error'
        });
        return;
      }

      const userId = await getUserId();
      if (!userId) {
        setSnackbar({
          open: true,
          message: 'Please log in to add tables',
          severity: 'error'
        });
        return;
      }

      console.log('Adding table with template ID:', selectedTemplate);
      
      // Get the template
      const { data: template, error: templateError } = await supabase
        .from('table_templates')
        .select('*')
        .eq('id', selectedTemplate)
        .single();

      console.log('Template data:', template, 'Error:', templateError);
      if (templateError || !template) {
        console.error('Template not found:', templateError);
        throw new Error('Template not found');
      }

      // Create the table
      const tableData = {
        name: tableName,
        seats: template.seats,
        template_id: selectedTemplate,
        shape: template.shape,
        width: template.width,
        length: template.length,
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
      const { data: newChairs, error: chairsError } = await supabase
        .from('table_chairs')
        .insert(chairPositions)
        .select();

      console.log('New chairs result:', newChairs, 'Error:', chairsError);
      if (chairsError) {
        console.error('Failed to create chairs:', chairsError);
        // Don't throw here, we already created the table
      } else if (newChairs) {
        // Add the new chairs to state
        setChairs([...chairs, ...newChairs]);
      }

      // Show success message
      setSnackbar({
        open: true,
        message: 'Table added successfully',
        severity: 'success'
      });

      // Reset form and close dialog
      setTableName('');
      setSelectedTemplate('');
      setDialogOpen(false);

    } catch (error) {
      console.error('Error adding table:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to add table',
        severity: 'error'
      });
    }
  };

  // Render a table component
  const renderTable = (table: Table) => {
    const tableChairs = chairs.filter(chair => chair.table_id === table.id);
    
    return (
      <Paper 
        key={table.id} 
        sx={{ 
          p: 2, 
          width: '100%',
          textAlign: 'center',
          backgroundColor: '#f5f5f5',
          mb: 2
        }}
      >
        <Typography variant="h6">{table.name}</Typography>
        <Typography variant="body2">Seats: {table.seats}</Typography>
        <Typography variant="body2">Shape: {table.shape}</Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Assigned Guests:</Typography>
          {tableChairs.map(chair => {
            const guest = guests.find(g => g.id === chair.guest_id);
            return (
              <Typography key={chair.id} variant="body2">
                Seat {chair.position}: {guest ? `${guest.first_name} ${guest.last_name}` : 'Empty'}
              </Typography>
            );
          })}
        </Box>
      </Paper>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Seating Chart
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Create and manage your wedding seating arrangements
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setDialogOpen(true)}
          sx={{ mb: 2 }}
        >
          Add Table
        </Button>
      </Box>

      {/* Display existing tables */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom>
            Your Tables
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tables.length > 0 ? (
              tables.map(table => renderTable(table))
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography>No tables yet. Click "Add Table" to create your first table.</Typography>
              </Paper>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            Guest List
          </Typography>
          <Paper sx={{ p: 2 }}>
            {guests.length > 0 ? (
              guests.map(guest => (
                <Typography key={guest.id} variant="body1">
                  {guest.first_name} {guest.last_name}
                </Typography>
              ))
            ) : (
              <Typography>No guests added yet.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Add Table Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Table</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Table Name"
            type="text"
            fullWidth
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            sx={{ mb: 2 }}
          />
          
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
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Select a template to create a new table
            </Typography>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddTable} 
            variant="contained" 
            color="primary"
            disabled={!tableName || !selectedTemplate}
          >
            Add Table
          </Button>
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
