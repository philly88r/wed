import React from 'react';
import { format, isAfter, isBefore } from 'date-fns';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Tooltip,
  Badge,
  Typography,
} from '@mui/material';
import {
  Check,
  AccessTime as ClockIcon,
  Warning as AlertTriangleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { cn } from '../../lib/utils';

export interface EnhancedTimelineTask {
  id: string;
  title: string;
  due_date: string;
  category: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  cost?: number;
  link?: string;
  action_text?: string;
  created_at: string;
  updated_at: string;
}

interface EnhancedTimelineProps {
  tasks: EnhancedTimelineTask[];
  onUpdateStatus: (id: string, status: EnhancedTimelineTask['status']) => void;
  onEditTask: (task: EnhancedTimelineTask) => void;
  onDeleteTask: (id: string) => void;
  className?: string;
  groupByMonth?: boolean;
}

const getStatusIcon = (status: EnhancedTimelineTask['status']) => {
  switch (status) {
    case 'completed':
      return <Check className="h-5 w-5 text-green-500" />;
    case 'in_progress':
      return <ClockIcon className="h-5 w-5 text-amber-500" />;
    case 'todo':
      return <AlertTriangleIcon className="h-5 w-5 text-gray-400" />;
  }
};

const getStatusClass = (status: EnhancedTimelineTask['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 border-green-300 text-green-800';
    case 'in_progress':
      return 'bg-amber-100 border-amber-300 text-amber-800';
    case 'todo':
      return 'bg-gray-100 border-gray-300 text-gray-800';
  }
};

const getPriorityClass = (priority: EnhancedTimelineTask['priority']) => {
  switch (priority) {
    case 'high':
      return 'border-red-500';
    case 'medium':
      return 'border-amber-500';
    case 'low':
      return 'border-green-500';
  }
};

export const EnhancedTimeline: React.FC<EnhancedTimelineProps> = ({
  tasks,
  onUpdateStatus,
  onEditTask,
  onDeleteTask,
  className,
  groupByMonth = true,
}) => {
  const handleStatusChange = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const nextStatus: Record<EnhancedTimelineTask['status'], EnhancedTimelineTask['status']> = {
      'todo': 'in_progress',
      'in_progress': 'completed',
      'completed': 'todo'
    };

    onUpdateStatus(id, nextStatus[task.status]);
  };

  // Group tasks by month if groupByMonth is true
  const groupedTasks = React.useMemo(() => {
    if (!groupByMonth) {
      return { 'All Tasks': tasks };
    }

    return tasks.reduce<Record<string, EnhancedTimelineTask[]>>((acc, task) => {
      const date = new Date(task.due_date);
      const monthYear = format(date, 'MMMM yyyy');
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      
      acc[monthYear].push(task);
      return acc;
    }, {});
  }, [tasks, groupByMonth]);

  // Sort the groups by date
  const sortedGroups = React.useMemo(() => {
    return Object.entries(groupedTasks).sort((a, b) => {
      if (a[0] === 'All Tasks') return -1;
      if (b[0] === 'All Tasks') return 1;
      
      const dateA = new Date(a[1][0].due_date);
      const dateB = new Date(b[1][0].due_date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [groupedTasks]);

  return (
    <div className={cn("space-y-8", className)}>
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
          <Card key={group} className="border-2 border-gray-200">
            <CardHeader 
              className="bg-gray-50"
              title={
                <div className="flex items-center justify-between">
                  <Typography variant="h6">{group}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {hasUpcoming && (
                      <Badge 
                        badgeContent={sortedTasks.filter(task => 
                          (isAfter(new Date(task.due_date), today) || 
                          format(new Date(task.due_date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) &&
                          task.status !== 'completed'
                        ).length} 
                        color="primary"
                        showZero={false}
                      >
                        <Chip label="Upcoming" size="small" color="primary" variant="filled" />
                      </Badge>
                    )}
                    
                    {hasPast && hasIncomplete && (
                      <Badge 
                        badgeContent={sortedTasks.filter(task => 
                          isBefore(new Date(task.due_date), today) && 
                          format(new Date(task.due_date), 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd') &&
                          task.status !== 'completed'
                        ).length} 
                        color="error"
                        showZero={false}
                      >
                        <Chip label="Overdue" size="small" color="error" variant="filled" />
                      </Badge>
                    )}
                  </Box>
                </div>
              }
            />
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-100">
                {sortedTasks.map((task) => {
                  const isOverdue = isBefore(new Date(task.due_date), today) && 
                                    task.status !== 'completed' &&
                                    format(new Date(task.due_date), 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd');
                  
                  return (
                    <li 
                      key={task.id} 
                      className={cn(
                        "p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors",
                        isOverdue ? "bg-red-50" : ""
                      )}
                    >
                      <button
                        onClick={() => handleStatusChange(task.id)}
                        className={cn(
                          "mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border",
                          getStatusClass(task.status)
                        )}
                        title="Click to change status"
                      >
                        {getStatusIcon(task.status)}
                      </button>
                      <div className={cn(
                        "flex-1 min-w-0 border-l-4 pl-3",
                        getPriorityClass(task.priority)
                      )}>
                        <div className="flex justify-between">
                          <p className={cn(
                            "font-medium text-gray-900",
                            task.status === 'completed' ? "line-through" : ""
                          )}>
                            {task.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(task.due_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Chip 
                            label={task.category} 
                            size="small" 
                            variant="outlined"
                          />
                          {task.cost && (
                            <Chip
                              icon={<AttachMoneyIcon />}
                              label={task.cost.toLocaleString()}
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                          )}
                          {task.link && (
                            <Chip
                              icon={<LinkIcon />}
                              label="Link"
                              size="small"
                              color="info"
                              variant="outlined"
                              onClick={() => {
                                const url = task.link?.startsWith('http') ? task.link : `https://${task.link}`;
                                window.open(url, '_blank', 'noopener,noreferrer');
                              }}
                            />
                          )}
                        </div>
                        
                        {task.action_text && (
                          <p className="mt-1 text-sm text-gray-500">{task.action_text}</p>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => onEditTask(task)}
                            size="small"
                            className="text-blue-500"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => onDeleteTask(task.id)}
                            size="small"
                            className="text-red-500"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EnhancedTimeline;
