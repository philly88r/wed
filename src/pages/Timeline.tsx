// @ts-nocheck
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface TimelineTask {
  id: string;
  title: string;
  due_date: string;
  category: string;
  status: 'todo' | 'completed';
  cost?: number;
  link?: string;
  action_text?: string;
}

export default function Timeline() {
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    due_date: '',
    category: '',
    status: 'todo' as const,
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('timeline_tasks')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      return;
    }

    setTasks(data || []);
  };

  const handleAddTask = async () => {
    const { error } = await supabase
      .from('timeline_tasks')
      .insert([newTask]);

    if (error) {
      console.error('Error adding task:', error);
      return;
    }

    setOpenDialog(false);
    setNewTask({
      title: '',
      due_date: '',
      category: '',
      status: 'todo',
    });
    fetchTasks();
  };

  const handleToggleStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'todo' ? 'completed' : 'todo';
    const { error } = await supabase
      .from('timeline_tasks')
      .update({ status: newStatus })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
      return;
    }

    fetchTasks();
  };

  const getOverdueTasks = () => {
    const today = new Date();
    return tasks.filter(task => {
      const dueDate = new Date(task.due_date);
      return dueDate < today && task.status === 'todo';
    });
  };

  const groupTasksByDate = () => {
    const groups: { [key: string]: TimelineTask[] } = {};
    tasks.forEach(task => {
      const date = task.due_date.split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(task);
    });
    return groups;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Wedding Timeline
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Task
        </Button>
      </Box>

      {/* Overdue Tasks Section */}
      {getOverdueTasks().length > 0 && (
        <Paper sx={{ mb: 4, p: 2, bgcolor: '#fff5f5' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Overdue
          </Typography>
          <List>
            {getOverdueTasks().map(task => (
              <ListItem
                key={task.id}
                sx={{
                  bgcolor: 'white',
                  borderRadius: 1,
                  mb: 1,
                  '&:last-child': { mb: 0 },
                }}
              >
                <ListItemIcon>
                  <IconButton
                    onClick={() => handleToggleStatus(task.id, task.status)}
                    color="primary"
                  >
                    {task.status === 'completed' ? <CheckCircleIcon /> : <UncheckedIcon />}
                  </IconButton>
                </ListItemIcon>
                <ListItemText
                  primary={task.title}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={task.category}
                        size="small"
                        sx={{ bgcolor: '#f0f0f0' }}
                      />
                      {task.cost && (
                        <Chip
                          label={`$${task.cost}`}
                          size="small"
                          sx={{ bgcolor: '#e8f5e9' }}
                        />
                      )}
                    </Box>
                  }
                />
                {task.link && (
                  <ListItemSecondaryAction>
                    <Button
                      endIcon={<ChevronRightIcon />}
                      href={task.link}
                      target="_blank"
                      sx={{ textTransform: 'none' }}
                    >
                      {task.action_text || 'Open'}
                    </Button>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Timeline Section */}
      {Object.entries(groupTasksByDate()).map(([date, dateTasks]) => (
        <Paper key={date} sx={{ mb: 4, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {format(new Date(date), 'MMMM d')}
          </Typography>
          <List>
            {dateTasks.map(task => (
              <ListItem
                key={task.id}
                sx={{
                  bgcolor: '#f8f9fa',
                  borderRadius: 1,
                  mb: 1,
                  '&:last-child': { mb: 0 },
                }}
              >
                <ListItemIcon>
                  <IconButton
                    onClick={() => handleToggleStatus(task.id, task.status)}
                    color="primary"
                  >
                    {task.status === 'completed' ? <CheckCircleIcon /> : <UncheckedIcon />}
                  </IconButton>
                </ListItemIcon>
                <ListItemText
                  primary={task.title}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={task.category}
                        size="small"
                        sx={{ bgcolor: 'white' }}
                      />
                      {task.cost && (
                        <Chip
                          label={`$${task.cost}`}
                          size="small"
                          sx={{ bgcolor: '#e8f5e9' }}
                        />
                      )}
                    </Box>
                  }
                />
                {task.link && (
                  <ListItemSecondaryAction>
                    <Button
                      endIcon={<ChevronRightIcon />}
                      href={task.link}
                      target="_blank"
                      sx={{ textTransform: 'none' }}
                    >
                      {task.action_text || 'Open'}
                    </Button>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        </Paper>
      ))}

      {/* Add Task Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newTask.due_date}
            onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Category"
            fullWidth
            value={newTask.category}
            onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddTask} variant="contained">
            Add Task
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
