import React from 'react';
import { Box, Paper, Typography, Button, TextField, useTheme, SxProps, Theme } from '@mui/material';

// Reusable style objects following brand guidelines
export const brandStyles = {
  // Container styles
  container: {
    py: 4,
  },
  
  // Paper styles
  paper: {
    p: 3,
    mb: 4,
    borderRadius: 0,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
  },
  
  // Typography styles
  heading1: {
    fontFamily: "'Giaza', serif",
    letterSpacing: '-0.05em',
    mb: 2,
  },
  
  heading2: {
    fontFamily: "'Giaza', serif",
    letterSpacing: '-0.05em',
    mb: 1.5,
  },
  
  // Button styles
  primaryButton: (theme: Theme): SxProps => ({
    backgroundColor: theme.palette.accent.rose,
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.accent.roseDark,
    },
    borderRadius: 0,
    textTransform: 'uppercase',
    padding: '12px 24px',
  }),
  
  secondaryButton: (theme: Theme): SxProps => ({
    color: theme.palette.primary.main,
    borderRadius: 0,
    textTransform: 'uppercase',
    padding: '12px 24px',
    '&:hover': {
      backgroundColor: theme.palette.accent.rose,
    },
  }),
  
  // Form control styles
  textField: (theme: Theme): SxProps => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: 0,
      '& fieldset': {
        borderColor: theme.palette.primary.light,
      },
      '&:hover fieldset': {
        borderColor: theme.palette.primary.main,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
      },
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.text.primary,
    },
  }),
  
  // Dialog styles
  dialog: {
    borderRadius: 0,
  },
};

// Branded Paper component
export const BrandPaper: React.FC<{
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}> = ({ children, sx = {} }) => {
  const theme = useTheme();
  
  return (
    <Paper
      sx={{
        ...brandStyles.paper,
        backgroundColor: theme.palette.background.paper,
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
};

// Branded Heading component
export const BrandHeading: React.FC<{
  children: React.ReactNode;
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  sx?: SxProps<Theme>;
}> = ({ children, variant, sx = {} }) => {
  const theme = useTheme();
  
  const headingStyle = variant === 'h1' || variant === 'h2' || variant === 'h3' 
    ? brandStyles.heading1 
    : brandStyles.heading2;
  
  return (
    <Typography
      variant={variant}
      sx={{
        ...headingStyle,
        color: theme.palette.primary.main,
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
};

// Branded Button component
export const BrandButton: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  disabled?: boolean;
  startIcon?: React.ReactNode;
  sx?: SxProps<Theme>;
}> = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled = false,
  startIcon,
  sx = {} 
}) => {
  const theme = useTheme();
  
  const buttonStyle = variant === 'primary' 
    ? brandStyles.primaryButton(theme)
    : brandStyles.secondaryButton(theme);
  
  return (
    <Button
      variant={variant === 'primary' ? 'contained' : 'outlined'}
      onClick={onClick}
      disabled={disabled}
      startIcon={startIcon}
      sx={{
        ...buttonStyle,
        ...sx,
      }}
    >
      {children}
    </Button>
  );
};

// Branded TextField component
export const BrandTextField: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
  type?: string;
  sx?: SxProps<Theme>;
}> = ({ 
  label, 
  value, 
  onChange, 
  fullWidth = true, 
  error = false,
  helperText = '',
  type = 'text',
  sx = {} 
}) => {
  const theme = useTheme();
  
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      fullWidth={fullWidth}
      error={error}
      helperText={helperText}
      type={type}
      sx={{
        ...brandStyles.textField(theme),
        ...sx,
      }}
    />
  );
};

// Main ThemeWrapper component
const ThemeWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <Box sx={{ backgroundColor: (theme) => theme.palette.background.default }}>
      {children}
    </Box>
  );
};

export default ThemeWrapper;
