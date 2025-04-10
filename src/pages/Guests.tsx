// @ts-nocheck
import { useState, useEffect } from 'react';
import { Plus, Users, Mail, Phone, MapPin, Filter, Download, Upload, Search, Copy, Link } from 'lucide-react';
import { getSupabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ChairIcon from '@mui/icons-material/Chair';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  useTheme,
  Button,
  TextField,
  Zoom,
  IconButton,
  Alert,
  AlertTitle
} from '@mui/material';

interface Guest {
  id: string;
  full_name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  email: string;
  phone?: string;
  table_id?: string;
  created_at: string;
  updated_at: string;
}

interface Table {
  id: string;
  name: string;
  seats: number;
  layout_id: string;
}

const relationshipGroups = [
  'Family - Mine',
  'Family - Partner',
  'Friends - Mine',
  'Friends - Partner',
  'Colleagues - Mine',
  'Colleagues - Partner',
  'Other'
];

export default function Guests() {
  const theme = useTheme();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [customLinkInput, setCustomLinkInput] = useState('');
  const [customLink, setCustomLink] = useState('');
  const [savedLinks, setSavedLinks] = useState<Array<{ id: string; name: string; link: string }>>([]);
  const [existingLink, setExistingLink] = useState<{ id: string; name: string; link: string } | null>(null);
  const [lastName, setLastName] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGuests();
    fetchTables();
  }, [selectedLayoutId]);

  const fetchGuests = async () => {
    const supabaseClient = getSupabase();
    const { data, error } = await supabaseClient
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching guests:', error);
      return;
    }

    setGuests(data || []);
  };

  const fetchTables = async () => {
    if (!selectedLayoutId) return;

    const { data, error } = await supabase
      .from('table_instances')
      .select('id, name, template_id, layout_id')
      .eq('layout_id', selectedLayoutId);

    if (error) {
      console.error('Error fetching tables:', error);
      return;
    }

    // Get the table templates to get the number of seats
    const { data: templatesData } = await supabase
      .from('table_templates')
      .select('id, seats')
      .in('id', data.map(table => table.template_id));

    const tablesWithSeats = data.map(table => ({
      ...table,
      seats: templatesData?.find(t => t.id === table.template_id)?.seats || 0
    }));

    setTables(tablesWithSeats);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGuest) {
      const { error } = await supabase
        .from('guests')
        .update({
          full_name: newGuest.full_name,
          address: newGuest.address,
          city: newGuest.city,
          state: newGuest.state,
          zip_code: newGuest.zip_code,
          country: newGuest.country,
          email: newGuest.email,
        })
        .eq('id', editingGuest.id);

      if (error) {
        console.error('Error updating guest:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('guests')
        .insert([newGuest]);

      if (error) {
        console.error('Error adding guest:', error);
        return;
      }
    }

    await fetchGuests();
    setNewGuest({
      full_name: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
      email: ''
    });
    setEditingGuest(null);
    setShowForm(false);
  };

  const deleteGuest = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this guest?')) {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting guest:', error);
        return;
      }

      await fetchGuests();
    }
  };

  const assignTable = async (guestId: string, tableId: string | null) => {
    const { error } = await supabase
      .from('guests')
      .update({
        table_id: tableId,
      })
      .eq('id', guestId);

    if (error) {
      console.error('Error assigning table:', error);
      return;
    }

    await fetchGuests();
  };

  const getAvailableSeats = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return [];

    const assignedSeats = guests
      .filter(g => g.table_id === tableId)
      .map(g => g.seat_number);

    return Array.from({ length: table.seats }, (_, i) => i + 1)
      .filter(seat => !assignedSeats.includes(seat));
  };

  const loadSavedLinks = async () => {
    const supabaseClient = getSupabase();
    const { data, error } = await supabaseClient
      .from('custom_links')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error loading saved links:', error);
      return;
    }
    
    if (data && data.length > 0) {
      setSavedLinks(data);
      setExistingLink(data[0]);
      setCustomLink(data[0].link);
    }
  };

  useEffect(() => {
    loadSavedLinks();
  }, []);

  const generateCustomLink = async () => {
    if (!customLinkInput) return;
    const linkName = customLinkInput.toLowerCase().replace(/\s+/g, '');
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/${linkName}`;
    
    try {
      const supabaseClient = getSupabase();
      
      // Get the current user
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }
      
      // If there's an existing link, delete it first
      if (existingLink) {
        const { error: deleteError } = await supabaseClient
          .from('custom_links')
          .delete()
          .eq('id', existingLink.id);
          
        if (deleteError) {
          console.error('Error deleting existing link:', deleteError);
          return;
        }
      }
      
      // Create new link
      const { data, error } = await supabaseClient
        .from('custom_links')
        .insert([{ 
          name: linkName, 
          link: link,
          questionnaire_path: `/${linkName}`,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();
        
      if (error) {
        console.error('Error creating link:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setCustomLink(link);
        setExistingLink(data[0]);
        setSavedLinks([data[0]]);
        setCustomLinkInput('');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const [newGuest, setNewGuest] = useState<Partial<Guest>>({
    full_name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    email: ''
  });

  const filteredGuests = guests.filter(guest => {
    if (filter === 'all') return true;
    if (filter === 'assigned') return guest.table_id !== null;
    if (filter === 'unassigned') return guest.table_id === null;
    return guest.rsvp_status === filter;
  }).filter(guest => {
    const searchLower = search.toLowerCase();
    return (
      guest.full_name.toLowerCase().includes(searchLower) ||
      guest.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h2"
          sx={{
            fontFamily: "'Playfair Display', serif",
            color: theme.palette.primary.main,
            mb: 4
          }}
        >
          ALTARE
        </Typography>
        <Typography 
          variant="h4" 
          sx={{ 
            fontFamily: "'Playfair Display', serif",
            color: theme.palette.text.secondary,
            fontWeight: 300
          }}
        >
          Create your custom link and manage your guest list
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Custom Link Generator */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              height: '100%',
              borderRadius: 4,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid',
              borderColor: theme.palette.divider,
              position: 'relative',
              overflow: 'hidden',
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
                mb: 3,
                fontFamily: "'Playfair Display', serif",
                color: theme.palette.primary.main,
              }}
            >
              Create Your Custom Link
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="body1"
                sx={{ mb: 2, color: theme.palette.text.secondary }}
              >
                {existingLink 
                  ? "Your current custom link is shown below. Enter a new name to change it."
                  : "Enter a name for your wedding website (e.g. smithswedding)"}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your custom name"
                  value={customLinkInput}
                  onChange={(e) => setCustomLinkInput(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Typography
                        component="span"
                        sx={{
                          color: theme.palette.text.secondary,
                          mr: 1,
                          userSelect: 'none'
                        }}
                      >
                        https://wedding-p.netlify.app/
                      </Typography>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={generateCustomLink}
                  size="large"
                  sx={{
                    py: 2,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: theme.palette.primary.main,
                    '&:hover': {
                      background: theme.palette.primary.dark,
                    },
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {existingLink ? 'Update Custom Link' : 'Create Custom Link'}
                </Button>
              </Box>

              {existingLink && (
                <Paper
                  elevation={1}
                  sx={{
                    mt: 3,
                    p: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, color: theme.palette.text.secondary }}
                  >
                    Current Custom Link:
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography
                      sx={{
                        flex: 1,
                        fontFamily: 'monospace',
                        fontSize: '0.9rem'
                      }}
                    >
                      {existingLink.link}
                    </Typography>
                    <Button
                      startIcon={<Copy size={16} />}
                      onClick={() => {
                        navigator.clipboard.writeText(existingLink.link);
                      }}
                      size="small"
                    >
                      Copy
                    </Button>
                  </Box>
                </Paper>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Address Book */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              height: '100%',
              borderRadius: 4,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid',
              borderColor: theme.palette.divider,
              position: 'relative',
              overflow: 'hidden',
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
                mb: 3,
                fontFamily: "'Playfair Display', serif",
                color: theme.palette.primary.main,
              }}
            >
              Address Book
            </Typography>
            
            <Typography
              variant="body1"
              sx={{ mb: 4, color: theme.palette.text.secondary }}
            >
              Manually add and manage your guest addresses
            </Typography>

            <Button
              variant="contained"
              onClick={() => setShowForm(true)}
              startIcon={<Plus />}
              sx={{
                mb: 3,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Add New Guest
            </Button>

            {showForm && (
              <Box sx={{ mb: 6 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: "'Playfair Display', serif",
                    color: theme.palette.text.primary,
                    mb: 3,
                    textAlign: 'center'
                  }}
                >
                  Add Guest Manually
                </Typography>

                <Paper 
                  elevation={3}
                  sx={{
                    p: { xs: 3, md: 6 },
                    borderRadius: 4,
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                    position: 'relative',
                    overflow: 'hidden',
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
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      label="Full Name"
                      required
                      fullWidth
                      value={newGuest.full_name || ''}
                      onChange={(e) => setNewGuest({ ...newGuest, full_name: e.target.value })}
                    />
                    <TextField
                      label="Address"
                      required
                      fullWidth
                      value={newGuest.address || ''}
                      onChange={(e) => setNewGuest({ ...newGuest, address: e.target.value })}
                    />
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                      <TextField
                        label="City"
                        required
                        fullWidth
                        value={newGuest.city || ''}
                        onChange={(e) => setNewGuest({ ...newGuest, city: e.target.value })}
                      />
                      <TextField
                        label="State"
                        required
                        fullWidth
                        value={newGuest.state || ''}
                        onChange={(e) => setNewGuest({ ...newGuest, state: e.target.value })}
                      />
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                      <TextField
                        label="Zip or Postal Code"
                        required
                        fullWidth
                        value={newGuest.zip_code || ''}
                        onChange={(e) => setNewGuest({ ...newGuest, zip_code: e.target.value })}
                      />
                      <TextField
                        label="Country"
                        required
                        fullWidth
                        value={newGuest.country || ''}
                        onChange={(e) => setNewGuest({ ...newGuest, country: e.target.value })}
                      />
                    </Box>
                    <TextField
                      label="Email Address"
                      type="email"
                      required
                      fullWidth
                      value={newGuest.email || ''}
                      onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                    />
                    <Button
                      onClick={handleSubmit}
                      variant="contained"
                      size="large"
                      sx={{
                        mt: 2,
                        py: 2,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        borderRadius: 2
                      }}
                    >
                      Add Guest
                    </Button>
                  </Box>
                </Paper>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
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
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  color: theme.palette.text.primary,
                  mb: 2
                }}
              >
                Send Group Message
              </Typography>
              
              <Typography
                variant="body1"
                sx={{ mb: 3, color: theme.palette.text.secondary }}
              >
                Send a message to all your guests with phone numbers. This feature opens your phone's messaging app with all guest numbers pre-filled.
              </Typography>

              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    color: theme.palette.primary.main
                  }
                }}
              >
                <AlertTitle>Mobile Device Required</AlertTitle>
                This feature must be used from a mobile phone as it opens your device's messaging app.
              </Alert>

              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2,
                p: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Guest Summary:
                </Typography>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Box>
                    <Typography variant="h6">
                      {guests.filter(g => g.phone).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Guests with phone numbers
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6">
                      {guests.length - guests.filter(g => g.phone).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Guests without phone numbers
                    </Typography>
                  </Box>
                </Box>

                <Button
                  onClick={() => {
                    const phoneNumbers = guests
                      .filter(guest => guest.phone)
                      .map(guest => guest.phone)
                      .join(',');
                    
                    if (!phoneNumbers) {
                      alert('No guest phone numbers found. Add phone numbers to your guests first.');
                      return;
                    }
                    
                    // Create SMS link with all numbers
                    const smsLink = `sms:${phoneNumbers}`;
                    window.location.href = smsLink;
                  }}
                  variant="contained"
                  size="large"
                  startIcon={<MessageSquare />}
                  sx={{
                    mt: 2,
                    py: 2,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    borderRadius: 2,
                    background: theme.palette.primary.main,
                    '&:hover': {
                      background: theme.palette.primary.dark,
                    },
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  Open Messaging App
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Filters and Search */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="all">All Guests</option>
              <option value="assigned">Assigned to Table</option>
              <option value="unassigned">Not Assigned</option>
            </select>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search guests..."
              className="p-2 border rounded w-full"
            />
          </div>
        </div>

        {/* Guest List */}
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Contact</th>
                <th className="p-4 text-left">Address</th>
                <th className="p-4 text-left">Table Assignment</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map(guest => (
                <tr key={guest.id} className="border-t">
                  <td className="p-4">
                    <div>{guest.full_name}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{guest.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>{guest.address}</div>
                    <div>{guest.city}, {guest.state} {guest.zip_code}</div>
                    <div>{guest.country}</div>
                  </td>
                  <td className="p-4">
                    {selectedLayoutId ? (
                      <select
                        value={guest.table_id || ''}
                        onChange={async (e) => {
                          const tableId = e.target.value || null;
                          await assignTable(guest.id, tableId);
                        }}
                        className="p-2 border rounded"
                      >
                        <option value="">Not Assigned</option>
                        {tables.map(table => (
                          <option key={table.id} value={table.id}>
                            {table.name} ({getAvailableSeats(table.id).length} seats available)
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => navigate('/seating')}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        Create Seating Layout
                      </button>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingGuest(guest);
                          setNewGuest(guest);
                          setShowForm(true);
                        }}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteGuest(guest.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Grid>
    </Container>
  );
}
