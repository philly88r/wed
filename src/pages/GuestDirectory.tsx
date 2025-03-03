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
} from '@mui/material';
import { MessageSquare, Upload, Download, Trash2, Edit2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '@mui/material/styles';

interface GuestContact {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
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

  // Load contacts
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const { data, error } = await supabase
      .from('guest_contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading contacts:', error);
      return;
    }

    if (data) {
      setContacts(data);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.full_name) return;

    const { data, error } = await supabase
      .from('guest_contacts')
      .insert([newContact])
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
  };

  const handleBulkAdd = async () => {
    try {
      setLoading(true);
      const rows = bulkInput
        .split('\n')
        .map(row => row.trim())
        .filter(row => row)
        .map(row => {
          const [full_name, phone, email] = row.split(',').map(field => field.trim());
          return { full_name, phone, email };
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
            color: theme.palette.text.primary,
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
            <Typography variant="body2" color="text.secondary">
              Contacts with phone numbers
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6">
              {contacts.length - contacts.filter(c => c.phone).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contacts without phone numbers
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<MessageSquare />}
          onClick={handleSendMessage}
          sx={{ mt: 3 }}
          size="large"
        >
          Open Messaging App
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
              
              const { error } = await supabase
                .from('guest_contacts')
                .update(newContact)
                .eq('id', editingContact.id);

              if (!error) {
                setContacts(contacts.map(c => 
                  c.id === editingContact.id ? { ...c, ...newContact } : c
                ));
                setEditingContact(null);
              }
            }}
            variant="contained"
            disabled={!newContact.full_name}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
