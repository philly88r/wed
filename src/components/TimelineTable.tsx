import { useState, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  TextField,
  IconButton,
  Typography,
  Box,
  Chip,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Tooltip,
  Alert
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Delete as DeleteIcon, 
  Cancel as CancelIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';
import { TimelineEvent } from '../utils/timelineCreatorUtils';

interface TimelineTableProps {
  events: TimelineEvent[];
  onUpdateEvent: (index: number, updatedEvent: TimelineEvent) => void;
  onDeleteEvent: (index: number) => void;
}

// Category color mapping
const categoryColors: Record<string, string> = {
  'Ceremony': '#4CAF50',  // Green
  'Reception': '#2196F3',  // Blue
  'Photos': '#9C27B0',    // Purple
  'Preparation': '#FF9800', // Orange
  'Transportation': '#795548', // Brown
  'Vendor': '#607D8B',    // Blue Grey
  'Custom': '#F44336',    // Red
  'Meal': '#FFEB3B',      // Yellow
  'Entertainment': '#00BCD4', // Cyan
  'Family': '#E91E63',    // Pink
  'Tradition': '#673AB7'  // Deep Purple
};

// Get color for category, with fallback
const getCategoryColor = (category: string): string => {
  return categoryColors[category] || '#9E9E9E'; // Grey as default
};

const TimelineTable = ({ events, onUpdateEvent, onDeleteEvent }: TimelineTableProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedEvent, setEditedEvent] = useState<TimelineEvent | null>(null);
  
  // New state for sorting and filtering
  const [sortField, setSortField] = useState<keyof TimelineEvent>('time');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Get unique categories from events
  const uniqueCategories = useMemo(() => {
    const categories = events.map(event => event.category);
    return [...new Set(categories)].filter(Boolean).sort();
  }, [events]);

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setEditedEvent({ ...events[index] });
  };

  const handleSaveClick = () => {
    if (editingIndex !== null && editedEvent) {
      onUpdateEvent(editingIndex, editedEvent);
      setEditingIndex(null);
      setEditedEvent(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditedEvent(null);
  };

  const handleInputChange = (field: keyof TimelineEvent, value: string) => {
    if (editedEvent) {
      setEditedEvent({
        ...editedEvent,
        [field]: value
      });
    }
  };

  const handleDeleteClick = (index: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      onDeleteEvent(index);
    }
  };

  const handleSort = (field: keyof TimelineEvent) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleFilterCategory = (category: string) => {
    if (filterCategory === category) {
      setFilterCategory(''); // Clear filter if already selected
    } else {
      setFilterCategory(category); // Set new filter
    }
  };

  const clearFilters = () => {
    setFilterCategory('');
    setSearchTerm('');
  };

  // Apply sorting and filtering to events
  const filteredAndSortedEvents = useMemo(() => {
    // First apply search filter
    let filtered = events;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.event.toLowerCase().includes(search) || 
        event.notes.toLowerCase().includes(search) ||
        event.category.toLowerCase().includes(search) ||
        event.time.toLowerCase().includes(search)
      );
    }
    
    // Then apply category filter
    if (filterCategory) {
      filtered = filtered.filter(event => event.category === filterCategory);
    }
    
    // Then sort
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'time') {
        // Special handling for time sorting
        const timeA = a.time;
        const timeB = b.time;
        comparison = timeA.localeCompare(timeB);
      } else {
        // Default string comparison for other fields
        const valueA = String(a[sortField]).toLowerCase();
        const valueB = String(b[sortField]).toLowerCase();
        comparison = valueA.localeCompare(valueB);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [events, sortField, sortDirection, filterCategory, searchTerm]);

  // Render sort indicator
  const renderSortIndicator = (field: keyof TimelineEvent) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5, fontSize: '0.8rem' }} /> 
      : <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5, fontSize: '0.8rem' }} />;
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Wedding Day Timeline
      </Typography>
      
      {/* Search and filter controls */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flexGrow: 1, minWidth: '200px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: '150px' }}>
          <InputLabel id="category-filter-label">Filter Category</InputLabel>
          <Select
            labelId="category-filter-label"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            label="Filter Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            {uniqueCategories.map(category => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {(filterCategory || searchTerm) && (
          <Button 
            variant="outlined" 
            size="small" 
            onClick={clearFilters}
            startIcon={<CancelIcon />}
          >
            Clear Filters
          </Button>
        )}
      </Box>
      
      {filteredAndSortedEvents.length === 0 && (
        <Alert 
          severity="info" 
          icon={<EventNoteIcon />}
          sx={{ mb: 2 }}
        >
          {events.length === 0 
            ? "No events have been added to your timeline yet. Complete the timeline questionnaire to generate events."
            : "No events match your current filters. Try adjusting your search criteria."}
        </Alert>
      )}
      
      {filteredAndSortedEvents.length > 0 && (
        <TableContainer component={Paper} sx={{ maxHeight: 600, boxShadow: 3, borderRadius: 2 }}>
          <Table stickyHeader aria-label="wedding timeline table">
            <TableHead>
              <TableRow sx={{ 
                '& th': { 
                  backgroundColor: '#f5f5f5', 
                  fontWeight: 'bold',
                  borderBottom: '2px solid #e0e0e0'
                } 
              }}>
                <TableCell 
                  sx={{ width: '15%', cursor: 'pointer' }}
                  onClick={() => handleSort('time')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Time
                    {renderSortIndicator('time')}
                  </Box>
                </TableCell>
                <TableCell 
                  sx={{ width: '20%', cursor: 'pointer' }}
                  onClick={() => handleSort('event')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Event
                    {renderSortIndicator('event')}
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '35%' }}>Notes</TableCell>
                <TableCell 
                  sx={{ width: '15%', cursor: 'pointer' }}
                  onClick={() => handleSort('category')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Category
                    {renderSortIndicator('category')}
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '15%' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedEvents.map((event, index) => {
                const originalIndex = events.findIndex(e => 
                  e.time === event.time && 
                  e.event === event.event && 
                  e.category === event.category
                );
                
                return (
                  <TableRow 
                    key={`${event.time}-${event.event}-${index}`}
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
                      borderLeft: `4px solid ${getCategoryColor(event.category)}`
                    }}
                  >
                    <TableCell>
                      {editingIndex === originalIndex ? (
                        <TextField
                          fullWidth
                          variant="standard"
                          value={editedEvent?.time || ''}
                          onChange={(e) => handleInputChange('time', e.target.value)}
                          size="small"
                          placeholder="e.g. 3:30 PM"
                        />
                      ) : (
                        <Typography sx={{ fontWeight: 'medium' }}>
                          {event.time}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingIndex === originalIndex ? (
                        <TextField
                          fullWidth
                          variant="standard"
                          value={editedEvent?.event || ''}
                          onChange={(e) => handleInputChange('event', e.target.value)}
                          size="small"
                        />
                      ) : (
                        <Typography>{event.event}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingIndex === originalIndex ? (
                        <TextField
                          fullWidth
                          variant="standard"
                          value={editedEvent?.notes || ''}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          size="small"
                          multiline
                          placeholder="Add details about this event"
                        />
                      ) : (
                        <Typography 
                          variant="body2" 
                          color={event.notes ? 'textPrimary' : 'textSecondary'}
                          sx={{ fontStyle: event.notes ? 'normal' : 'italic' }}
                        >
                          {event.notes || 'No notes'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingIndex === originalIndex ? (
                        <TextField
                          select
                          fullWidth
                          variant="standard"
                          value={editedEvent?.category || ''}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          size="small"
                        >
                          {uniqueCategories.map(category => (
                            <MenuItem key={category} value={category}>
                              {category}
                            </MenuItem>
                          ))}
                          <MenuItem value="Custom">Custom</MenuItem>
                        </TextField>
                      ) : (
                        <Chip 
                          label={event.category} 
                          size="small"
                          sx={{ 
                            backgroundColor: getCategoryColor(event.category),
                            color: '#fff',
                            fontWeight: 'medium'
                          }}
                          onClick={() => toggleFilterCategory(event.category)}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {editingIndex === originalIndex ? (
                        <Box>
                          <Tooltip title="Save changes">
                            <IconButton 
                              onClick={handleSaveClick} 
                              size="small" 
                              color="primary"
                              sx={{ mr: 0.5 }}
                            >
                              <SaveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton 
                              onClick={handleCancelEdit} 
                              size="small" 
                              color="error"
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Box>
                          <Tooltip title="Edit event">
                            <IconButton 
                              onClick={() => handleEditClick(originalIndex)} 
                              size="small" 
                              color="primary"
                              sx={{ mr: 0.5 }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete event">
                            <IconButton 
                              onClick={() => handleDeleteClick(originalIndex)} 
                              size="small" 
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default TimelineTable;
