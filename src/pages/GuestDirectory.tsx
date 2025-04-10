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
  Radio,
} from '@mui/material';
import { MessageSquare, Upload, Download, Trash2, Edit2, X, Link, Copy, Send } from 'lucide-react';
import { getSupabase } from '../supabaseClient';
import { createCustomLink } from '../utils/customLinksHelper';

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
  const [customLinkOpen, setCustomLinkOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [savedLinks, setSavedLinks] = useState<Array<{id: string, name: string, link: string}>>([]);
  const [selectedLink, setSelectedLink] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Load contacts and custom links
  useEffect(() => {
    loadContacts();
    loadCustomLinks();
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

  const handleSendCustomLink = () => {
    const phoneNumbers = contacts
      .filter(contact => contact.phone)
      .map(contact => contact.phone)
      .join(',');
    
    if (!phoneNumbers) {
      alert('No phone numbers found in your contacts.');
      return;
    }
    
    // Use selected link or generated link
    const linkToSend = selectedLink || generatedLink;
    
    if (!linkToSend) {
      alert('Please select or create a custom link first.');
      return;
    }
    
    // Create SMS link with message body containing the custom link
    const messageBody = encodeURIComponent(`Please fill out our guest information form: ${linkToSend}`);
    window.location.href = `sms:${phoneNumbers}?body=${messageBody}`;
  };

  const generateQuestionnaireLink = async () => {
    if (!customLinkInput.trim()) {
      setSnackbarMessage('Please enter a name for your questionnaire link');
      setSnackbarOpen(true);
      return;
    }

    try {
      // Format the link name (remove spaces, lowercase)
      const linkName = customLinkInput.toLowerCase().replace(/\s+/g, '');
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/${linkName}`;
      
      // Use the improved createCustomLink helper function
      const success = await createCustomLink(linkName, customLinkInput);
      
      if (success) {
        setGeneratedLink(link);
        setSelectedLink(link); // Auto-select the newly created link
        loadCustomLinks(); // Reload links to show the new one
        setSnackbarMessage('Custom link created successfully');
        setSnackbarOpen(true);
        setCustomLinkOpen(false); // Close the dialog
      } else {
        setSnackbarMessage('Error creating questionnaire link');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error creating custom link:', error);
      setSnackbarMessage('Error generating questionnaire link');
      setSnackbarOpen(true);
    }
  };

  // Load custom links from the database
  const loadCustomLinks = async () => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }
      
      const { data, error } = await supabase
        .from('custom_links')
        .select('id, name, link')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading custom links:', error);
        return;
      }

      if (data && data.length > 0) {
        setSavedLinks(data);
        // If no link is currently selected, select the most recent one
        if (!selectedLink && data.length > 0) {
          setSelectedLink(data[0].link);
        }
      }
    } catch (error) {
      console.error('Error loading custom links:', error);
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
            fontFamily: "'Giaza', serif",
            color: '#054697',
            letterSpacing: '-0.05em',
            mb: 2
          }}
        >
          Guest Directory
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#054697', 
            opacity: 0.8,
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          Manage your guest contact information and send group messages.
        </Typography>
      </Box>

      {/* Add Single Contact */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 0,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: '#054697',
          }
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontFamily: "'Giaza', serif",
            color: '#054697',
            letterSpacing: '-0.05em',
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
              whiteSpace: 'nowrap',
              backgroundColor: '#E8B4B4',
              color: '#054697',
              borderRadius: 0,
              '&:hover': {
                backgroundColor: '#E8B4B4CC',
              },
              textTransform: 'uppercase',
              fontFamily: 'Poppins, sans-serif',
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
            sx={{
              color: '#054697',
              borderColor: '#054697',
              borderRadius: 0,
              textTransform: 'uppercase',
              fontFamily: 'Poppins, sans-serif',
              '&:hover': {
                backgroundColor: 'rgba(5, 70, 151, 0.05)',
              },
            }}
          >
            Bulk Add Contacts
          </Button>
          <Button
            startIcon={<Download />}
            variant="outlined"
            onClick={downloadTemplate}
            sx={{
              color: '#054697',
              borderColor: '#054697',
              borderRadius: 0,
              textTransform: 'uppercase',
              fontFamily: 'Poppins, sans-serif',
              '&:hover': {
                backgroundColor: 'rgba(5, 70, 151, 0.05)',
              },
            }}
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
          borderRadius: 0,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: '#054697',
          }
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontFamily: "'Giaza', serif",
            color: '#054697',
            letterSpacing: '-0.05em',
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
          borderRadius: 0,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Box>
            <Typography variant="h6" sx={{ color: '#054697' }}>
              {contacts.filter(c => c.phone).length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#054697', opacity: 0.8, fontFamily: 'Poppins, sans-serif' }}>
              Contacts with phone numbers
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: '#054697' }}>
              {contacts.length - contacts.filter(c => c.phone).length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#054697', opacity: 0.8, fontFamily: 'Poppins, sans-serif' }}>
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
            bgcolor: '#E8B4B4',
            color: '#054697',
            '&:hover': {
              bgcolor: '#E8B4B4CC',
            },
            borderRadius: 0,
            textTransform: 'uppercase',
            fontFamily: 'Poppins, sans-serif',
          }}
          size="large"
        >
          Open Messaging App
        </Button>
        
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Link />}
            onClick={() => setCustomLinkOpen(true)}
            sx={{ 
              color: '#054697',
              borderColor: '#054697',
              borderRadius: 0,
              textTransform: 'uppercase',
              fontFamily: 'Poppins, sans-serif',
              '&:hover': {
                backgroundColor: 'rgba(5, 70, 151, 0.05)',
              },
            }}
            size="large"
          >
            Create Custom Link
          </Button>
          
          {/* Display saved custom links */}
          {savedLinks.length > 0 && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                border: '1px solid', 
                borderColor: 'divider',
                mt: 2
              }}
            >
              <Typography 
                variant="h6" 
                sx={{
                  fontFamily: "'Giaza', serif",
                  color: '#054697',
                  mb: 2
                }}
              >
                Your Custom Links
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {savedLinks.map((link) => (
                  <Box 
                    key={link.id} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      p: 1,
                      border: '1px solid',
                      borderColor: selectedLink === link.link ? '#054697' : 'divider',
                      backgroundColor: selectedLink === link.link ? 'rgba(5, 70, 151, 0.05)' : 'transparent',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(5, 70, 151, 0.05)'
                      }
                    }}
                    onClick={() => setSelectedLink(link.link)}
                  >
                    <Radio 
                      checked={selectedLink === link.link}
                      onChange={() => setSelectedLink(link.link)}
                      sx={{ 
                        color: '#054697',
                        '&.Mui-checked': {
                          color: '#054697',
                        },
                      }}
                    />
                    <Box sx={{ ml: 1, flexGrow: 1 }}>
                      <Typography 
                        sx={{ 
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 500,
                          color: '#054697'
                        }}
                      >
                        {link.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#054697', 
                          opacity: 0.7,
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '0.8rem'
                        }}
                      >
                        {link.link}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(link.link);
                      }}
                      sx={{ color: '#054697' }}
                    >
                      <Copy size={16} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
              
              {/* Button to send selected link via SMS */}
              <Button
                variant="contained"
                startIcon={<Send />}
                onClick={handleSendCustomLink}
                sx={{ 
                  mt: 2,
                  backgroundColor: '#FFE8E4', 
                  color: '#054697',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  '&:hover': {
                    backgroundColor: '#FFD5CC'
                  },
                  alignSelf: 'flex-start'
                }}
              >
                Send Link to Contacts
              </Button>
            </Paper>
          )}
        </Box>
      </Paper>

      {/* Contact List */}
      <Paper
        elevation={3}
        sx={{
          borderRadius: 0,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography 
            variant="h6"
            sx={{
              fontFamily: "'Giaza', serif",
              color: '#054697',
              letterSpacing: '-0.05em',
            }}
          >
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
                  bgcolor: 'rgba(5, 70, 151, 0.05)'
                }
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography 
                  variant="subtitle1"
                  sx={{
                    color: '#054697',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  {contact.full_name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {contact.phone && (
                    <Typography 
                      variant="body2"
                      sx={{
                        color: '#054697',
                        opacity: 0.8,
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    >
                      📱 {contact.phone}
                    </Typography>
                  )}
                  {contact.email && (
                    <Typography 
                      variant="body2"
                      sx={{
                        color: '#054697',
                        opacity: 0.8,
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    >
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
        PaperProps={{
          sx: {
            borderRadius: 0
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography 
              sx={{
                fontFamily: "'Giaza', serif",
                color: '#054697',
                letterSpacing: '-0.05em',
              }}
            >
              Bulk Add Contacts
            </Typography>
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
          <Button 
            onClick={() => setBulkAddOpen(false)}
            sx={{
              color: '#054697',
              textTransform: 'uppercase',
              fontFamily: 'Poppins, sans-serif',
              '&:hover': {
                backgroundColor: 'rgba(5, 70, 151, 0.05)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkAdd}
            variant="contained"
            disabled={loading || !bulkInput.trim()}
            sx={{
              bgcolor: '#E8B4B4',
              color: '#054697',
              borderRadius: 0,
              textTransform: 'uppercase',
              fontFamily: 'Poppins, sans-serif',
              '&:hover': {
                backgroundColor: '#E8B4B4CC',
              },
            }}
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
        PaperProps={{
          sx: {
            borderRadius: 0
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography 
              sx={{
                fontFamily: "'Giaza', serif",
                color: '#054697',
                letterSpacing: '-0.05em',
              }}
            >
              Edit Contact
            </Typography>
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
              label="Phone"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              fullWidth
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
              label="Email"
              type="email"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              fullWidth
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditingContact(null)}
            sx={{
              color: '#054697',
              textTransform: 'uppercase',
              fontFamily: 'Poppins, sans-serif',
              '&:hover': {
                backgroundColor: 'rgba(5, 70, 151, 0.05)',
              },
            }}
          >
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
            sx={{
              bgcolor: '#E8B4B4',
              color: '#054697',
              borderRadius: 0,
              textTransform: 'uppercase',
              fontFamily: 'Poppins, sans-serif',
              '&:hover': {
                backgroundColor: '#E8B4B4CC',
              },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Link Dialog */}
      <Dialog
        open={customLinkOpen}
        onClose={() => setCustomLinkOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography 
              sx={{
                fontFamily: "'Giaza', serif",
                color: '#054697',
                letterSpacing: '-0.05em',
              }}
            >
              Create Custom Guest Link
            </Typography>
            <IconButton onClick={() => setCustomLinkOpen(false)} size="small">
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Create a custom link to send to your guests. They can use this link to fill out their information for your wedding.
          </Alert>
          
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 1, 
                color: '#054697',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500
              }}
            >
              1. Name your questionnaire
            </Typography>
            <TextField
              fullWidth
              label="Questionnaire Name (e.g. Smith Wedding)"
              value={customLinkInput}
              onChange={(e) => setCustomLinkInput(e.target.value)}
              variant="outlined"
              helperText="This will be used to create your custom link"
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
                '& .MuiFormHelperText-root': {
                  color: '#054697',
                  opacity: 0.7,
                }
              }}
            />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 1, 
                color: '#054697',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500
              }}
            >
              2. Generate your link
            </Typography>
            <Button
              variant="contained"
              onClick={generateQuestionnaireLink}
              disabled={!customLinkInput.trim()}
              sx={{
                bgcolor: '#E8B4B4',
                color: '#054697',
                borderRadius: 0,
                textTransform: 'uppercase',
                fontFamily: 'Poppins, sans-serif',
                '&:hover': {
                  backgroundColor: '#E8B4B4CC',
                },
              }}
            >
              Generate Link
            </Button>
          </Box>
          
          {generatedLink && (
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  mb: 1, 
                  color: '#054697',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500
                }}
              >
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
                        sx={{
                          color: '#054697',
                        }}
                      >
                        <Copy size={18} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    color: '#054697',
                    opacity: 0.9,
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#054697',
                      opacity: 0.3,
                    },
                    '&:hover fieldset': {
                      borderColor: '#054697',
                      opacity: 0.5,
                    },
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCustomLinkOpen(false)}
            sx={{
              color: '#054697',
              textTransform: 'uppercase',
              fontFamily: 'Poppins, sans-serif',
              '&:hover': {
                backgroundColor: 'rgba(5, 70, 151, 0.05)',
              },
            }}
          >
            Close
          </Button>
          {generatedLink && (
            <Button
              onClick={handleSendCustomLink}
              variant="contained"
              startIcon={<Send />}
              sx={{ 
                bgcolor: '#E8B4B4',
                color: '#054697',
                borderRadius: 0,
                textTransform: 'uppercase',
                fontFamily: 'Poppins, sans-serif',
                '&:hover': {
                  backgroundColor: '#E8B4B4CC',
                },
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
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: '#054697',
            color: 'white',
            fontFamily: 'Poppins, sans-serif',
          }
        }}
      />
    </Container>
  );
}
