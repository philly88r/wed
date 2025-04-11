import React, { useState, useEffect } from 'react';
import { 
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
  Box,
  Typography,
  Grid,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

interface AddTableButtonProps {
  onTableAdded: (newTable: any) => void;
}

const AddTableButton: React.FC<AddTableButtonProps> = ({ onTableAdded }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tableName, setTableName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [tableTemplates, setTableTemplates] = useState<TableTemplate[]>([]);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch table templates when component mounts
  useEffect(() => {
    fetchTableTemplates();
  }, []);

  // Fetch table templates
  const fetchTableTemplates = async () => {
    try {
      console.log('Fetching table templates...');
      const { data, error } = await supabase
        .from('table_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching templates:', error);
        throw error;
      }

      console.log('Templates fetched:', data);
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

  // Get current user ID
  const getUserId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  };

  // Handle adding a new table
  const handleAddTable = async () => {
    try {
      console.log('Add table button clicked');
      
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

      // Create the table with proper scaling for the grid
      // Scale dimensions based on template shape
      let scaledWidth, scaledLength;
      
      // Scale dimensions based on number of seats and shape
      if (template.shape === 'round') {
        // Round tables should be sized proportionally to seat count
        const baseSize = 30 * Math.sqrt(template.seats); // Scale based on number of seats
        scaledWidth = baseSize;
        scaledLength = baseSize;
      } else if (template.shape === 'rectangular') {
        // Rectangular tables should be longer than they are wide
        scaledWidth = 80;
        scaledLength = 40 + (template.seats * 10); // Length grows with more seats
      } else if (template.shape === 'square') {
        // Square tables should be equal width and length
        const size = 40 + (template.seats * 5);
        scaledWidth = size;
        scaledLength = size;
      } else if (template.shape === 'oval') {
        // Oval tables should be longer than they are wide
        scaledWidth = 70;
        scaledLength = 40 + (template.seats * 8);
      } else {
        // Default scaling
        scaledWidth = template.width;
        scaledLength = template.length;
      }
      
      const tableData = {
        name: tableName,
        seats: template.seats,
        template_id: selectedTemplate,
        shape: template.shape,
        width: scaledWidth,
        length: scaledLength,
        position_x: 300, // Center in the grid
        position_y: 200, // Center in the grid
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

      // Create chairs for the new table with proper positioning based on shape
      let chairPositions;
      
      if (template.shape === 'round' || template.shape === 'oval') {
        // For round and oval tables, distribute chairs evenly around the perimeter
        chairPositions = Array.from({ length: template.seats }, (_, i) => ({
          table_id: newTable.id,
          position: i + 1,
          angle: (i * 360) / template.seats,
          created_by: userId
        }));
      } else if (template.shape === 'rectangular') {
        // For rectangular tables, place chairs on all four sides
        chairPositions = Array.from({ length: template.seats }, (_, i) => {
          let angle;
          const seatsPerSide = Math.ceil(template.seats / 4);
          
          if (i < seatsPerSide) { // Top side
            angle = 270;
          } else if (i < seatsPerSide * 2) { // Right side
            angle = 0;
          } else if (i < seatsPerSide * 3) { // Bottom side
            angle = 90;
          } else { // Left side
            angle = 180;
          }
          
          return {
            table_id: newTable.id,
            position: i + 1,
            angle: angle,
            created_by: userId
          };
        });
      } else if (template.shape === 'square') {
        // For square tables, place chairs evenly on all four sides
        chairPositions = Array.from({ length: template.seats }, (_, i) => {
          let angle;
          const seatsPerSide = Math.ceil(template.seats / 4);
          
          if (i < seatsPerSide) { // Top side
            angle = 270;
          } else if (i < seatsPerSide * 2) { // Right side
            angle = 0;
          } else if (i < seatsPerSide * 3) { // Bottom side
            angle = 90;
          } else { // Left side
            angle = 180;
          }
          
          return {
            table_id: newTable.id,
            position: i + 1,
            angle: angle,
            created_by: userId
          };
        });
      } else {
        // Default circular arrangement for any other shapes
        chairPositions = Array.from({ length: template.seats }, (_, i) => ({
          table_id: newTable.id,
          position: i + 1,
          angle: (i * 360) / template.seats,
          created_by: userId
        }));
      }
      
      console.log('Creating chairs:', chairPositions);
      const { data: newChairs, error: chairsError } = await supabase
        .from('table_chairs')
        .insert(chairPositions)
        .select();

      console.log('New chairs result:', newChairs, 'Error:', chairsError);
      if (chairsError) {
        console.error('Failed to create chairs:', chairsError);
        // Don't throw here, we already created the table
      }

      // Show success message
      setSnackbar({
        open: true,
        message: 'Table added successfully',
        severity: 'success'
      });

      // Call the callback to update the parent component
      onTableAdded(newTable);

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

  return (
    <>
      <Button 
        variant="contained" 
        onClick={() => setDialogOpen(true)}
        startIcon={<AddIcon />}
        sx={{ 
          bgcolor: '#FFE8E4', 
          color: '#054697',
          '&:hover': { bgcolor: '#FFD5CC' },
          fontWeight: 'medium',
          border: '1px solid #FFE8E4'
        }}
      >
        ADD TABLE
      </Button>

      {/* Add Table Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#054697' }}>Add New Table</DialogTitle>
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
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: '#054697' }}>
                        {template.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(5, 70, 151, 0.8)' }}>
                        {template.seats} seats, {template.shape}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDialogOpen(false)}
            sx={{ color: 'rgba(5, 70, 151, 0.8)' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddTable} 
            disabled={!selectedTemplate || !tableName}
            sx={{ 
              bgcolor: '#FFE8E4', 
              color: '#054697',
              '&:hover': { bgcolor: '#FFD5CC' },
              '&.Mui-disabled': { bgcolor: '#f5f5f5', color: 'rgba(0, 0, 0, 0.26)' }
            }}
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddTableButton;
