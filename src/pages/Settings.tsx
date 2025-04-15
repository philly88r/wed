import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  Button,
} from '@mui/material';

export default function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
              />
            }
            label="Email Notifications"
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Appearance
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
            }
            label="Dark Mode"
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Editor
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
              />
            }
            label="Auto Save"
          />
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary">
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
