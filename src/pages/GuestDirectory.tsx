import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  InputAdornment,
} from '@mui/material';
import { MessageSquare, Upload, Download, Trash2, Edit2, X, Link, Copy, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '@mui/material/styles';

interface GuestContact {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export default function GuestDirectory() {
  const theme = useTheme();
  const [contacts, setContacts] = useState<GuestContact[]>([]);
  const [bulkAddOpen, setBulkAddOpen] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingContact, setEditingContact] = useState<GuestContact | null>(null);
  const [newContact, setNewContact] = useState<Partial<GuestContact>>({
    full_name: '',
    phone: '',
    email: ''
  });
  const [customLinkInput, setCustomLinkInput] = useState('');
  const [questionnaireLinkOpen, setQuestionnaireLinkOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Load contacts
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }
      
      const { data, error } = await supabase
        .from('guest_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading contacts:', error);
        return;
      }

      if (data) {
        setContacts(data);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.full_name) return;

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      const { data, error } = await supabase
        .from('guest_contacts')
        .insert([{ ...newContact, user_id: user.id }])
        .select();

      if (error) {
        console.error('Error adding contact:', error);
        return;
      }

      if (data) {
        setContacts([...contacts, data[0]]);
        setNewContact({
          full_name: '',
          phone: '',
          email: ''
        });
      }
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const handleBulkAdd = async () => {
    try {
      setLoading(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        setLoading(false);
        return;
      }
      
      const rows = bulkInput
        .split('\n')
        .map(row => row.trim())
        .filter(row => row)
        .map(row => {
          const [full_name, phone, email] = row.split(',').map(field => field.trim());
          return { full_name, phone, email, user_id: user.id };
        })
        .filter(row => row.full_name); // Only keep rows with names

      const { data, error } = await supabase
        .from('guest_contacts')
        .insert(rows)
        .select();

      if (error) throw error;

      if (data) {
        setContacts([...contacts, ...data]);
        setBulkAddOpen(false);
        setBulkInput('');
      }
    } catch (error) {
      console.error('Error bulk adding contacts:', error);
      alert('Error adding contacts. Please check your input format.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    const phoneNumbers = contacts
      .filter(contact => contact.phone)
      .map(contact => contact.phone)
      .join(',');
    
    if (!phoneNumbers) {
      alert('No phone numbers found in your contacts.');
      return;
    }
    
    window.location.href = `sms:${phoneNumbers}`;
  };

  const handleSendQuestionnaireLink = () => {
    const phoneNumbers = contacts
      .filter(contact => contact.phone)
      .map(contact => contact.phone)
      .join(',');
    
    if (!phoneNumbers) {
      alert('No phone numbers found in your contacts.');
      return;
    }
    
    if (!generatedLink) {
      alert('Please generate a questionnaire link first.');
      return;
    }
    
    // Create SMS link with message body containing the questionnaire link
    const messageBody = encodeURIComponent(`Please fill out our guest questionnaire: ${generatedLink}`);
    window.location.href = `sms:${phoneNumbers}?body=${messageBody}`;
  };

  const generateQuestionnaireLink = async () => {
    if (!customLinkInput.trim()) {
      setSnackbarMessage('Please enter a name for your questionnaire link');
      setSnackbarOpen(true);
      return;
    }

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      // Format the link name (remove spaces, lowercase)
      const linkName = customLinkInput.toLowerCase().replace(/\s+/g, '');
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/${linkName}`;
      
      // Check if link already exists
      const { data: existingLink } = await supabase
        .from('custom_links')
        .select('id')
        .eq('questionnaire_path', `/${linkName}`)
        .maybeSingle();
      
      if (existingLink) {
        // Update existing link
        const { error } = await supabase
          .from('custom_links')
          .update({ 
            name: customLinkInput,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingLink.id);
          
        if (error) {
          console.error('Error updating link:', error);
          setSnackbarMessage('Error updating questionnaire link');
          setSnackbarOpen(true);
          return;
        }
      } else {
        // Create new link
        const { error } = await supabase
          .from('custom_links')
          .insert([{ 
            name: customLinkInput,
            questionnaire_path: `/${linkName}`,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
          
        if (error) {
          console.error('Error creating link:', error);
          setSnackbarMessage('Error creating questionnaire link');
          setSnackbarOpen(true);
          return;
        }
      }
      
      setGeneratedLink(link);
      setSnackbarMessage('Questionnaire link generated successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error generating questionnaire link:', error);
      setSnackbarMessage('Error generating questionnaire link');
      setSnackbarOpen(true);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setSnackbarMessage('Link copied to clipboard');
        setSnackbarOpen(true);
      },
      (err) => {
        console.error('Could not copy text: ', err);
        setSnackbarMessage('Failed to copy link');
        setSnackbarOpen(true);
      }
    );
  };

  const downloadTemplate = () => {
    const template = 'Full Name,Phone,Email\nJohn Doe,1234567890,john@example.com';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest_contacts_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: "'Playfair Display', serif",
            color: theme.palette.text.primary,
            mb: 2
          }}
        >
          Guest Directory
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your guest contact information and send group messages.
        </Typography>
      </Box>

      {/* Add Single Contact */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: theme.palette.primary.main,
          }
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontFamily: "'Playfair Display', serif",
            color: theme.palette.text.primary,
            mb: 3
          }}
        >
          Add Contact
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Full Name"
            value={newContact.full_name}
            onChange={(e) => setNewContact({ ...newContact, full_name: e.target.value })}
            sx={{ flexGrow: 1 }}
          />
          <TextField
            label="Phone"
            value={newContact.phone}
            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            sx={{ flexGrow: 1 }}
          />
          <TextField
            label="Email"
            type="email"
            value={newContact.email}
            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleAddContact}
            disabled={!newContact.full_name}
            sx={{
              height: 56,
              px: 4,
              whiteSpace: 'nowrap'
            }}
          >
            Add Contact
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            startIcon={<Upload />}
            variant="outlined"
            onClick={() => setBulkAddOpen(true)}
          >
            Bulk Add Contacts
          </Button>
          <Button
            startIcon={<Download />}
            variant="outlined"
            onClick={downloadTemplate}
          >
            Download Template
          </Button>
        </Box>
      </Paper>

      {/* Messaging Section */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: theme.palette.primary.main,
          }
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontFamily: "'Playfair Display', serif",
            color: theme.palette.primary.main,
            mb: 3
          }}
        >
          Send Group Message
        </Typography>

        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
        >
          <AlertTitle>Mobile Device Required</AlertTitle>
          This feature must be used from a mobile phone as it opens your device's messaging app.
        </Alert>

        <Box sx={{ 
          display: 'flex', 
          gap: 3,
          p: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Box>
            <Typography variant="h6">
              {contacts.filter(c => c.phone).length}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.primary.main, opacity: 0.8 }}>
              Contacts with phone numbers
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6">
              {contacts.length - contacts.filter(c => c.phone).length}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.primary.main, opacity: 0.8 }}>
              Contacts without phone numbers
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<MessageSquare />}
          onClick={handleSendMessage}
          sx={{ 
            mt: 3,
            mr: 2,
            bgcolor: theme.palette.accent?.rose || '#FFE8E4',
            color: theme.palette.primary.main,
            '&:hover': {
              bgcolor: '#FFD5CC',
            }
          }}
          size="large"
        >
          Open Messaging App
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Link />}
          onClick={() => setQuestionnaireLinkOpen(true)}
          sx={{ 
            mt: 3,
            color: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
          }}
          size="large"
        >
          Generate Questionnaire Link
        </Button>
      </Paper>

      {/* Contact List */}
      <Paper
        elevation={3}
        sx={{
          borderRadius: 4,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6">
            Your Contacts ({contacts.length})
          </Typography>
        </Box>
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {contacts.map(contact => (
            <Box
              key={contact.id}
              sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1">
                  {contact.full_name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary' }}>
                  {contact.phone && (
                    <Typography variant="body2">
                      📱 {contact.phone}
                    </Typography>
                  )}
                  {contact.email && (
                    <Typography variant="body2">
                      ✉️ {contact.email}
                    </Typography>
                  )}
                </Box>
              </Box>
              <IconButton
                onClick={() => {
                  setEditingContact(contact);
                  setNewContact(contact);
                }}
                size="small"
              >
                <Edit2 size={18} />
              </IconButton>
              <IconButton
                onClick={async () => {
                  if (window.confirm('Delete this contact?')) {
                    const { error } = await supabase
                      .from('guest_contacts')
                      .delete()
                      .eq('id', contact.id);

                    if (!error) {
                      setContacts(contacts.filter(c => c.id !== contact.id));
                    }
                  }
                }}
                size="small"
                color="error"
              >
                <Trash2 size={18} />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Bulk Add Dialog */}
      <Dialog
        open={bulkAddOpen}
        onClose={() => setBulkAddOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Bulk Add Contacts
            <IconButton onClick={() => setBulkAddOpen(false)} size="small">
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Enter one contact per line in the format: Full Name, Phone, Email
          </Alert>
          <TextField
            multiline
            rows={10}
            fullWidth
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder="John Doe, 1234567890, john@example.com"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkAddOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleBulkAdd}
            variant="contained"
            disabled={loading || !bulkInput.trim()}
          >
            {loading ? 'Adding...' : 'Add Contacts'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog
        open={!!editingContact}
        onClose={() => setEditingContact(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Edit Contact
            <IconButton onClick={() => setEditingContact(null)} size="small">
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Full Name"
              value={newContact.full_name}
              onChange={(e) => setNewContact({ ...newContact, full_name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingContact(null)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!editingContact) return;
              
              try {
                // Get the current user
                const { data: { user } } = await supabase.auth.getUser();
                
                if (!user) {
                  console.error('No authenticated user found');
                  return;
                }
                
                // Make sure we're not changing the user_id
                const updateData = {
                  ...newContact,
                  user_id: editingContact.user_id // Maintain the original user_id
                };
                
                const { error } = await supabase
                  .from('guest_contacts')
                  .update(updateData)
                  .eq('id', editingContact.id)
                  .eq('user_id', user.id); // Additional security check

                if (error) {
                  console.error('Error updating contact:', error);
                  return;
                }
                
                setContacts(contacts.map(c => 
                  c.id === editingContact.id ? { ...c, ...updateData } : c
                ));
                setEditingContact(null);
              } catch (error) {
                console.error('Error updating contact:', error);
              }
            }}
            variant="contained"
            disabled={!newContact.full_name}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Questionnaire Link Dialog */}
      <Dialog
        open={questionnaireLinkOpen}
        onClose={() => setQuestionnaireLinkOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Generate Guest Questionnaire Link
            <IconButton onClick={() => setQuestionnaireLinkOpen(false)} size="small">
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Create a custom link to send to your guests. They can use this link to fill out their information for your wedding.
          </Alert>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, color: theme.palette.primary.main }}>
              1. Name your questionnaire
            </Typography>
            <TextField
              fullWidth
              label="Questionnaire Name (e.g. Smith Wedding)"
              value={customLinkInput}
              onChange={(e) => setCustomLinkInput(e.target.value)}
              variant="outlined"
              helperText="This will be used to create your custom link"
            />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, color: theme.palette.primary.main }}>
              2. Generate your link
            </Typography>
            <Button
              variant="contained"
              onClick={generateQuestionnaireLink}
              disabled={!customLinkInput.trim()}
              sx={{ 
                bgcolor: theme.palette.accent?.rose || '#FFE8E4',
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: '#FFD5CC',
                }
              }}
            >
              Generate Link
            </Button>
          </Box>
          
          {generatedLink && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, color: theme.palette.primary.main }}>
                3. Your questionnaire link
              </Typography>
              <TextField
                fullWidth
                value={generatedLink}
                variant="outlined"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => copyToClipboard(generatedLink)}
                        edge="end"
                      >
                        <Copy size={18} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setQuestionnaireLinkOpen(false)}
            sx={{ color: theme.palette.primary.main }}
          >
            Close
          </Button>
          {generatedLink && (
            <Button
              onClick={handleSendQuestionnaireLink}
              variant="contained"
              startIcon={<Send />}
              sx={{ 
                bgcolor: theme.palette.accent?.rose || '#FFE8E4',
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: '#FFD5CC',
                }
              }}
            >
              Send via SMS
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
}
