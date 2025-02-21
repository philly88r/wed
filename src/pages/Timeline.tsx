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
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
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
    cost: '',
    link: '',
    action_text: '',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('timeline')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      return;
    }

    setTasks(data || []);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTask = async () => {
    const { error } = await supabase.from('timeline').insert([
      {
        title: newTask.title,
        due_date: newTask.due_date,
        category: newTask.category,
        cost: newTask.cost ? parseFloat(newTask.cost) : null,
        link: newTask.link || null,
        action_text: newTask.action_text || null,
        status: 'todo',
      },
    ]);

    if (error) {
      console.error('Error adding task:', error);
      return;
    }

    setOpenDialog(false);
    setNewTask({
      title: '',
      due_date: '',
      category: '',
      cost: '',
      link: '',
      action_text: '',
    });
    fetchTasks();
  };

  const handleToggleStatus = async (task: TimelineTask) => {
    const { error } = await supabase
      .from('timeline')
      .update({ status: task.status === 'todo' ? 'completed' : 'todo' })
      .eq('id', task.id);

    if (error) {
      console.error('Error updating task:', error);
      return;
    }

    fetchTasks();
  };

  const handleDeleteTask = async (id: string) => {
    const { error } = await supabase.from('timeline').delete().eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      return;
    }

    fetchTasks();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Timeline
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Task
        </Button>
      </Box>

      <Grid container spacing={3}>
        {tasks.map((task) => (
          <Grid item xs={12} key={task.id}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                bgcolor: task.status === 'completed' ? 'action.hover' : 'background.paper',
              }}
            >
              <IconButton
                onClick={() => handleToggleStatus(task)}
                color={task.status === 'completed' ? 'primary' : 'default'}
              >
                {task.status === 'completed' ? <EditIcon /> : <AddIcon />}
              </IconButton>

              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                  }}
                >
                  {task.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip
                    label={format(new Date(task.due_date), 'MMM d, yyyy')}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip label={task.category} size="small" />
                  {task.cost && (
                    <Chip
                      label={`$${task.cost.toLocaleString()}`}
                      size="small"
                      color="secondary"
                    />
                  )}
                </Box>
              </Box>

              <IconButton
                onClick={() => handleDeleteTask(task.id)}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Task</DialogTitle>
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
            <TextField
              label="Due Date"
              name="due_date"
              type="date"
              value={newTask.due_date}
              onChange={handleInputChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Category"
              name="category"
              value={newTask.category}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              label="Cost"
              name="cost"
              type="number"
              value={newTask.cost}
              onChange={handleInputChange}
              fullWidth
              InputProps={{ startAdornment: '$' }}
            />
            <TextField
              label="Link"
              name="link"
              value={newTask.link}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Action Text"
              name="action_text"
              value={newTask.action_text}
              onChange={handleInputChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddTask} variant="contained" color="primary">
            Add Task
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
