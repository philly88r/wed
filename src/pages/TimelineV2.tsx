import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Tab,
  Tabs,
  Card,
  CardContent,
  InputAdornment,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  FilterList as FilterListIcon,
  Search as SearchIcon,
  CalendarMonth as CalendarMonthIcon,
  ViewList as ViewListIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Category as CategoryIcon,
  AttachMoney as AttachMoneyIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { format, isAfter, isBefore } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Define the enhanced timeline task interface
interface TimelineTask {
  id: string;
  title: string;
  due_date: string;
  category: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  cost?: number;
  link?: string;
  action_text?: string;
  created_at?: string;
  updated_at?: string;
}

// Predefined categories for wedding planning
const CATEGORIES = [
  'Venue',
  'Catering',
  'Photography',
  'Attire',
  'Flowers',
  'Music',
  'Invitations',
  'Transportation',
  'Accommodations',
  'Decor',
  'Beauty',
  'Gifts',
  'Legal',
  'Other'
];

export default function TimelineV2() {
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TimelineTask[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<TimelineTask | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [groupByMonth, setGroupByMonth] = useState(true);
  
  const [newTask, setNewTask] = useState({
    title: '',
    due_date: '',
    category: '',
    priority: 'medium',
    cost: '',
    link: '',
    action_text: '',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...tasks];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.action_text && task.action_text.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }
    
    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    // Priority filter
    if (priorityFilter) {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    // Tab filter (Upcoming, Past, All)
    if (currentTab === 0) { // Upcoming
      const today = new Date();
      filtered = filtered.filter(task => isAfter(new Date(task.due_date), today) || 
                                         task.due_date.split('T')[0] === today.toISOString().split('T')[0]);
    } else if (currentTab === 1) { // Past
      const today = new Date();
      filtered = filtered.filter(task => isBefore(new Date(task.due_date), today) && 
                                         task.due_date.split('T')[0] !== today.toISOString().split('T')[0]);
    }
    
    // Show/hide completed tasks
    if (!showCompletedTasks) {
      filtered = filtered.filter(task => task.status !== 'completed');
    }
    
    setFilteredTasks(filtered);
  }, [tasks, searchTerm, categoryFilter, statusFilter, priorityFilter, currentTab, showCompletedTasks]);

  const fetchTasks = async () => {
    // Try to fetch from timeline_tasks first (new schema)
    let { data, error } = await supabase
      .from('timeline_tasks')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching from timeline_tasks:', error);
      
      // Fall back to the original timeline table
      const result = await supabase
        .from('timeline')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (result.error) {
        console.error('Error fetching from timeline:', result.error);
        return;
      }
      
      // Map the data to include priority if it doesn't exist
      data = result.data?.map(task => ({
        ...task,
        priority: task.priority || 'medium',
        status: task.status === 'completed' ? 'completed' : 'todo'
      }));
    }

    setTasks(data || []);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setNewTask((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setNewTask((prev) => ({
        ...prev,
        due_date: date.toISOString().split('T')[0],
      }));
    }
  };

  const resetForm = () => {
    setNewTask({
      title: '',
      due_date: '',
      category: '',
      priority: 'medium',
      cost: '',
      link: '',
      action_text: '',
    });
    setEditingTask(null);
  };

  const handleAddOrUpdateTask = async () => {
    if (!newTask.title || !newTask.due_date || !newTask.category) {
      alert('Please fill in all required fields');
      return;
    }

    const taskData = {
      title: newTask.title,
      due_date: new Date(newTask.due_date).toISOString(),
      category: newTask.category,
      priority: newTask.priority,
      cost: newTask.cost ? parseFloat(newTask.cost) : null,
      link: newTask.link || null,
      action_text: newTask.action_text || null,
    };

    let error;

    // Try to use timeline_tasks first (new schema)
    if (editingTask) {
      // Update existing task
      const { error: updateError } = await supabase
        .from('timeline_tasks')
        .update(taskData)
        .eq('id', editingTask.id);
      
      if (updateError) {
        console.error('Error updating timeline_tasks:', updateError);
        
        // Fall back to the original timeline table
        const result = await supabase
          .from('timeline')
          .update(taskData)
          .eq('id', editingTask.id);
        
        error = result.error;
      }
    } else {
      // Add new task
      const { error: insertError } = await supabase
        .from('timeline_tasks')
        .insert([{ ...taskData, status: 'todo' }]);
      
      if (insertError) {
        console.error('Error inserting to timeline_tasks:', insertError);
        
        // Fall back to the original timeline table
        const result = await supabase
          .from('timeline')
          .insert([{ ...taskData, status: 'todo' }]);
        
        error = result.error;
      }
    }

    if (error) {
      console.error('Error saving task:', error);
      return;
    }

    setOpenDialog(false);
    resetForm();
    fetchTasks();
  };

  const handleEditTask = (task: TimelineTask) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      due_date: task.due_date.split('T')[0],
      category: task.category,
      priority: task.priority || 'medium',
      cost: task.cost ? task.cost.toString() : '',
      link: task.link || '',
      action_text: task.action_text || '',
    });
    setOpenDialog(true);
  };

  const handleUpdateStatus = async (task: TimelineTask, newStatus: TimelineTask['status']) => {
    // Try to update timeline_tasks first (new schema)
    let { error } = await supabase
      .from('timeline_tasks')
      .update({ status: newStatus })
      .eq('id', task.id);

    if (error) {
      console.error('Error updating timeline_tasks status:', error);
      
      // Fall back to the original timeline table
      // Note: The original table might only support 'todo' and 'completed'
      const mappedStatus = newStatus === 'in_progress' ? 'todo' : newStatus;
      
      const result = await supabase
        .from('timeline')
        .update({ status: mappedStatus })
        .eq('id', task.id);
      
      if (result.error) {
        console.error('Error updating timeline status:', result.error);
        return;
      }
    }

    fetchTasks();
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    // Try to delete from timeline_tasks first (new schema)
    let { error } = await supabase
      .from('timeline_tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting from timeline_tasks:', error);
      
      // Fall back to the original timeline table
      const result = await supabase
        .from('timeline')
        .delete()
        .eq('id', id);
      
      if (result.error) {
        console.error('Error deleting from timeline:', result.error);
        return;
      }
    }

    fetchTasks();
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const getNextStatus = (currentStatus: TimelineTask['status']): TimelineTask['status'] => {
    const statusCycle: Record<TimelineTask['status'], TimelineTask['status']> = {
      'todo': 'in_progress',
      'in_progress': 'completed',
      'completed': 'todo'
    };
    return statusCycle[currentStatus];
  };

  const getStatusIcon = (status: TimelineTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon />;
      case 'in_progress':
        return <AccessTimeIcon />;
      case 'todo':
        return <CalendarMonthIcon />;
    }
  };

  const getStatusColor = (status: TimelineTask['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'todo':
        return 'default';
    }
  };

  const getPriorityColor = (priority: TimelineTask['priority']) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  // Group tasks by month
  const groupedTasks = groupByMonth ? 
    filteredTasks.reduce<Record<string, TimelineTask[]>>((acc, task) => {
      const date = new Date(task.due_date);
      const monthYear = format(date, 'MMMM yyyy');
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      
      acc[monthYear].push(task);
      return acc;
    }, {}) : 
    { 'All Tasks': filteredTasks };

  // Sort the groups by date
  const sortedGroups = Object.entries(groupedTasks).sort((a, b) => {
    if (a[0] === 'All Tasks') return -1;
    if (b[0] === 'All Tasks') return 1;
    
    const dateA = new Date(a[1][0].due_date);
    const dateB = new Date(b[1][0].due_date);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1">
            Wedding Timeline
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              color="secondary"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button
              variant="outlined"
              startIcon={viewMode === 'list' ? <CalendarMonthIcon /> : <ViewListIcon />}
              onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
            >
              {viewMode === 'list' ? 'Calendar View' : 'List View'}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}
              color="primary"
            >
              Add Task
            </Button>
          </Box>
        </Box>

        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          sx={{ mb: 3 }}
          variant="fullWidth"
        >
          <Tab label="Upcoming" />
          <Tab label="Past" />
          <Tab label="All Tasks" />
        </Tabs>

        {showFilters && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={categoryFilter}
                      label="Category"
                      onChange={(e) => setCategoryFilter(e.target.value as string)}
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {CATEGORIES.map((category) => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value as string)}
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      <MenuItem value="todo">To Do</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={priorityFilter}
                      label="Priority"
                      onChange={(e) => setPriorityFilter(e.target.value as string)}
                    >
                      <MenuItem value="">All Priorities</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={groupByMonth} 
                          onChange={(e) => setGroupByMonth(e.target.checked)} 
                        />
                      }
                      label="Group by Month"
                    />
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={showCompletedTasks} 
                          onChange={(e) => setShowCompletedTasks(e.target.checked)} 
                        />
                      }
                      label="Show Completed Tasks"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {filteredTasks.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No tasks found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {searchTerm || categoryFilter || statusFilter || priorityFilter ? 
                'Try adjusting your filters' : 
                'Add your first task to get started'}
            </Typography>
          </Paper>
        ) : (
          viewMode === 'list' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {sortedGroups.map(([group, groupTasks]) => {
                // Sort tasks by due date
                const sortedTasks = [...groupTasks].sort(
                  (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
                );
                
                const today = new Date();
                const hasUpcoming = sortedTasks.some(task => 
                  isAfter(new Date(task.due_date), today) || 
                  format(new Date(task.due_date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
                );
                
                const hasPast = sortedTasks.some(task => 
                  isBefore(new Date(task.due_date), today) && 
                  format(new Date(task.due_date), 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd')
                );
                
                const hasIncomplete = sortedTasks.some(task => task.status !== 'completed');

                return (
                  <Card key={group} sx={{ border: '2px solid', borderColor: 'grey.200' }}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'grey.50', 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant="h6">{group}</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {hasUpcoming && hasIncomplete && (
                          <Chip 
                            label={`${sortedTasks.filter(task => 
                              (isAfter(new Date(task.due_date), today) || 
                              format(new Date(task.due_date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) &&
                              task.status !== 'completed'
                            ).length} Upcoming`} 
                            size="small" 
                            color="primary" 
                          />
                        )}
                        
                        {hasPast && hasIncomplete && (
                          <Chip 
                            label={`${sortedTasks.filter(task => 
                              isBefore(new Date(task.due_date), today) && 
                              format(new Date(task.due_date), 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd') &&
                              task.status !== 'completed'
                            ).length} Overdue`} 
                            size="small" 
                            color="error" 
                          />
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ p: 0 }}>
                      {sortedTasks.map((task) => {
                        const isOverdue = isBefore(new Date(task.due_date), today) && 
                                          task.status !== 'completed' &&
                                          format(new Date(task.due_date), 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd');
                        
                        return (
                          <Paper
                            key={task.id}
                            sx={{
                              p: 2,
                              m: 2,
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 2,
                              bgcolor: isOverdue ? 'error.50' : 'background.paper',
                              borderLeft: 4,
                              borderColor: `${getPriorityColor(task.priority)}.main`,
                            }}
                          >
                            <IconButton
                              onClick={() => handleUpdateStatus(task, getNextStatus(task.status))}
                              color={getStatusColor(task.status) as any}
                              sx={{ mt: 0.5 }}
                            >
                              {getStatusIcon(task.status)}
                            </IconButton>

                            <Box sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                  }}
                                >
                                  {task.title}
                                </Typography>
                                <Chip
                                  label={format(new Date(task.due_date), 'MMM d, yyyy')}
                                  size="small"
                                  color={
                                    isOverdue ? 'error' :
                                    task.status === 'completed' ? 'success' : 'primary'
                                  }
                                  variant="outlined"
                                />
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                <Chip 
                                  label={task.category} 
                                  size="small" 
                                  icon={<CategoryIcon />}
                                />
                                <Chip 
                                  label={task.priority} 
                                  size="small" 
                                  color={getPriorityColor(task.priority) as any}
                                />
                                {task.cost && (
                                  <Chip
                                    label={`$${task.cost.toLocaleString()}`}
                                    size="small"
                                    color="secondary"
                                    icon={<AttachMoneyIcon />}
                                  />
                                )}
                                {task.link && (
                                  <Chip
                                    label="Link"
                                    size="small"
                                    color="info"
                                    icon={<LinkIcon />}
                                    component="a"
                                    href={task.link.startsWith('http') ? task.link : `https://${task.link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    clickable
                                  />
                                )}
                              </Box>
                              {task.action_text && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  {task.action_text}
                                </Typography>
                              )}
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                onClick={() => handleEditTask(task)}
                                color="primary"
                                size="small"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeleteTask(task.id)}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Paper>
                        );
                      })}
                    </Box>
                  </Card>
                );
              })}
            </Box>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Calendar view coming soon!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                We're working on a calendar view for your timeline tasks.
              </Typography>
            </Paper>
          )
        )}

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Title"
                name="title"
                value={newTask.title}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <DatePicker
                label="Due Date"
                value={newTask.due_date ? new Date(newTask.due_date) : null}
                onChange={handleDateChange}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={newTask.category}
                  onChange={handleInputChange}
                  label="Category"
                >
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={newTask.priority}
                  onChange={handleInputChange}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Cost"
                name="cost"
                type="number"
                value={newTask.cost}
                onChange={handleInputChange}
                fullWidth
                InputProps={{ 
                  startAdornment: <InputAdornment position="start">$</InputAdornment> 
                }}
              />
              <TextField
                label="Link"
                name="link"
                value={newTask.link}
                onChange={handleInputChange}
                fullWidth
                placeholder="e.g., https://example.com"
              />
              <TextField
                label="Notes"
                name="action_text"
                value={newTask.action_text}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleAddOrUpdateTask} variant="contained" color="primary">
              {editingTask ? 'Update Task' : 'Add Task'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
}
