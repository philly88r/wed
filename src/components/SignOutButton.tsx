import { Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function SignOutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <Button
      variant="contained"
      onClick={handleLogout}
      startIcon={<LogoutIcon />}
      sx={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1300, // Higher than most elements to ensure visibility
        bgcolor: '#FFE8E4', // Using the exact Soft Pink color from brand guidelines
        color: '#054697', // Using the exact Primary Blue color from brand guidelines
        border: '2px solid #054697', // Adding a border for more visibility
        '&:hover': {
          bgcolor: '#FFD5CC', // Darker Soft Pink for hover state
        },
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 600, // Increased font weight for better visibility
        textTransform: 'uppercase',
        fontSize: '0.875rem',
        padding: '8px 16px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)', // Stronger shadow for more depth
        borderRadius: '4px'
      }}
    >
      Sign Out
    </Button>
  );
}
