import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Stack,
  Button,
  Collapse,
  Avatar,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Send as SendIcon,
  Reply as ReplyIcon,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface Comment {
  id: string;
  section: string;
  content: string;
  created_by: string;
  created_at: string;
  resolved: boolean;
  parent_id: string | null;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface CommentSystemProps {
  section: string;
  title?: string;
}

export default function CommentSystem({ section, title }: CommentSystemProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
    // Subscribe to realtime updates
    const subscription = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `section=eq.${section}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [section]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:users(
            full_name,
            avatar_url
          )
        `)
        .eq('section', section)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
    }
  };

  const handleSubmit = async (parentId: string | null = null) => {
    if (!user) {
      setError('You must be logged in to comment');
      return;
    }

    const commentContent = newComment.trim();
    if (!commentContent) return;

    try {
      const { error } = await supabase.from('comments').insert({
        section,
        content: commentContent,
        created_by: user.id,
        parent_id: parentId,
      });

      if (error) throw error;

      setNewComment('');
      setReplyTo(null);
      await fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    }
  };

  const handleResolve = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
        })
        .eq('id', commentId);

      if (error) throw error;
      await fetchComments();
    } catch (error) {
      console.error('Error resolving comment:', error);
      setError('Failed to resolve comment');
    }
  };

  const renderComment = (comment: Comment) => {
    const isReply = comment.parent_id !== null;

    return (
      <Box
        key={comment.id}
        sx={{
          ml: isReply ? 4 : 0,
          mb: 2,
        }}
      >
        <Paper
          sx={{
            p: 2,
            backgroundColor: comment.resolved ? 'action.hover' : 'background.paper',
          }}
          variant="outlined"
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Avatar
              src={comment.profiles?.avatar_url}
              alt={comment.profiles?.full_name || 'User'}
            >
              {comment.profiles?.full_name?.[0] || 'U'}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography variant="subtitle2">
                  {comment.profiles?.full_name || 'Unknown User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(comment.created_at).toLocaleDateString()}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {comment.content}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                mt={1}
                alignItems="center"
                justifyContent="flex-end"
              >
                {!comment.resolved && !isReply && (
                  <Tooltip title="Reply">
                    <IconButton
                      size="small"
                      onClick={() => setReplyTo(comment.id)}
                    >
                      <ReplyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {!comment.resolved && (
                  <Tooltip title="Mark as resolved">
                    <IconButton
                      size="small"
                      onClick={() => handleResolve(comment.id)}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Box>
          </Stack>
        </Paper>
        {replyTo === comment.id && (
          <Box sx={{ ml: 4, mt: 2 }}>
            <TextField
              fullWidth
              size="small"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a reply..."
              multiline
              rows={2}
              InputProps={{
                endAdornment: (
                  <IconButton
                    size="small"
                    onClick={() => handleSubmit(comment.id)}
                    disabled={!newComment.trim()}
                  >
                    <SendIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        onClick={() => setExpanded(!expanded)}
        sx={{ cursor: 'pointer', mb: 2 }}
      >
        <Typography variant="h6">{title || 'Comments'}</Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Stack>

      <Collapse in={expanded}>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            multiline
            rows={3}
          />
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="small"
              endIcon={<SendIcon />}
              onClick={() => handleSubmit(null)}
              disabled={!newComment.trim()}
            >
              Comment
            </Button>
          </Box>
        </Box>

        <Box>
          {comments
            .filter((comment) => !comment.parent_id)
            .map((comment) => (
              <Box key={comment.id}>
                {renderComment(comment)}
                {comments
                  .filter((reply) => reply.parent_id === comment.id)
                  .map((reply) => renderComment(reply))}
              </Box>
            ))}
        </Box>
      </Collapse>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
