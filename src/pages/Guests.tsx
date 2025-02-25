// @ts-nocheck
import { useState, useEffect } from 'react';
import { Plus, Users, Mail, Phone, MapPin, Filter, Download, Upload, Search, Copy, Link } from 'lucide-react';
import { supabase } from '../lib/supabase';
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
  plus_one: boolean;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
  relationship: string;
  created_by: string;
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
  const [customLink, setCustomLink] = useState('');
  const [customLinkInput, setCustomLinkInput] = useState('');
  const [savedLinks, setSavedLinks] = useState<Array<{ name: string; link: string }>>([]);
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
    const { data, error } = await supabase
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

  const addGuest = async () => {
    if (!newGuest.full_name || !newGuest.address || !newGuest.city || 
        !newGuest.state || !newGuest.zip_code || !newGuest.country || !newGuest.email) {
      alert('Please fill in all required fields');
      return;
    }

    const { error } = await supabase
      .from('guests')
      .insert([{
        full_name: newGuest.full_name,
        address: newGuest.address,
        city: newGuest.city,
        state: newGuest.state,
        zip_code: newGuest.zip_code,
        country: newGuest.country,
        email: newGuest.email,
        plus_one: newGuest.plus_one,
        rsvp_status: newGuest.rsvp_status,
        relationship: newGuest.relationship
      }]);

    if (error) {
      console.error('Error adding guest:', error);
      alert('Error adding guest. Please try again.');
      return;
    }

    // Reset form
    setNewGuest({
      full_name: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
      email: '',
      plus_one: false,
      rsvp_status: 'pending',
      relationship: relationshipGroups[0]
    });

    // Refresh guest list
    fetchGuests();
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

  const assignTable = async (guestId: string, tableId: string | null, seatNumber?: number) => {
    const { error } = await supabase
      .from('guests')
      .update({
        table_assignment: tableId,
        seat_number: seatNumber
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
      .filter(g => g.table_assignment === tableId)
      .map(g => g.seat_number);

    return Array.from({ length: table.seats }, (_, i) => i + 1)
      .filter(seat => !assignedSeats.includes(seat));
  };

  const generateCustomLink = async () => {
    if (!customLinkInput) return;
    const linkName = customLinkInput.toLowerCase().replace(/\s+/g, '');
    const link = `https://wedding-p.netlify.app/${linkName}`;
    setCustomLink(link);
    
    // Save to database and local state
    const { data, error } = await supabase
      .from('custom_links')
      .insert([{ 
        name: linkName, 
        link,
        questionnaire_path: `/${linkName}`
      }])
      .select();
      
    if (!error && data) {
      setSavedLinks([...savedLinks, { name: linkName, link }]);
    }
    
    setCustomLinkInput('');
  };

  const loadSavedLinks = async () => {
    const { data } = await supabase
      .from('custom_links')
      .select('name, link');
    if (data) {
      setSavedLinks(data);
    }
  };

  useEffect(() => {
    loadSavedLinks();
  }, []);

  const [newGuest, setNewGuest] = useState<Partial<Guest>>({
    plus_one: false,
    rsvp_status: 'pending',
    relationship: relationshipGroups[0]
  });

  const filteredGuests = guests.filter(guest => {
    if (filter === 'all') return true;
    if (filter === 'assigned') return guest.table_assignment !== null;
    if (filter === 'unassigned') return guest.table_assignment === null;
    if (filter === 'confirmed') return guest.rsvp_status === 'confirmed';
    return guest.rsvp_status === filter;
  }).filter(guest => {
    const searchLower = search.toLowerCase();
    return (
      guest.full_name.toLowerCase().includes(searchLower) ||
      guest.email?.toLowerCase().includes(searchLower)
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
      </Box>

      <Grid container spacing={4}>
        {/* Custom Link Section */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 2,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              height: '100%'
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
              Create Your Custom Link
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="body1"
                sx={{ mb: 2, color: theme.palette.text.secondary }}
              >
                Enter a name for your wedding website (e.g. smithswedding)
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
                  Create Your Custom Link
                </Button>
              </Box>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontFamily: "'Playfair Display', serif",
                  color: theme.palette.text.primary,
                }}
              >
                Your Custom Links
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {savedLinks.map((savedLink, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      background: theme.palette.grey[50],
                      border: '1px solid',
                      borderColor: theme.palette.divider,
                      borderRadius: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={savedLink.link}
                      InputProps={{
                        readOnly: true,
                        sx: { borderRadius: 2 }
                      }}
                      size="small"
                    />
                    <IconButton
                      onClick={() => navigator.clipboard.writeText(savedLink.link)}
                      color="primary"
                      sx={{
                        '&:hover': {
                          background: theme.palette.primary.light,
                          color: theme.palette.common.white,
                        }
                      }}
                    >
                      <Copy />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Address Book Section */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 2,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              height: '100%'
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
              Address Book
            </Typography>
            
            <Typography
              variant="body1"
              sx={{ mb: 4, color: theme.palette.text.secondary }}
            >
              Manually add and manage your guest addresses
            </Typography>

            <Box sx={{ mb: 6 }}>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  color: theme.palette.text.primary,
                  mb: 3
                }}
              >
                Add Guest Manually
              </Typography>

              <Paper
                elevation={3}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 2,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
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
                  <TextField
                    label="Zip Code"
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
                  <TextField
                    label="Email Address"
                    type="email"
                    required
                    fullWidth
                    value={newGuest.email || ''}
                    onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                  />
                  <Button
                    onClick={addGuest}
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

          </Paper>
        </Grid>
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
            <option value="confirmed">RSVP Confirmed</option>
            <option value="pending">RSVP Pending</option>
            <option value="declined">RSVP Declined</option>
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
              <th className="p-4 text-left">Relationship</th>
              <th className="p-4 text-left">RSVP</th>
              <th className="p-4 text-left">Table Assignment</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests.map(guest => (
              <tr key={guest.id} className="border-t">
                <td className="p-4">
                  <div>{guest.full_name}</div>
                  {guest.plus_one && (
                    <div className="text-sm text-gray-500">+1 Guest</div>
                  )}
                </td>
                <td className="p-4">
                  {guest.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{guest.email}</span>
                    </div>
                  )}
                </td>
                <td className="p-4">{guest.relationship}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${guest.rsvp_status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      guest.rsvp_status === 'declined' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                    {guest.rsvp_status.charAt(0).toUpperCase() + guest.rsvp_status.slice(1)}
                  </span>
                </td>
                <td className="p-4">
                  {selectedLayoutId ? (
                    <select
                      value={guest.table_assignment || ''}
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
    </Container>
  );
}
