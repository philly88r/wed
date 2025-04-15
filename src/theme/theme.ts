import { createTheme, ThemeOptions } from '@mui/material/styles';

// Define brand colors from guidelines
const colors = {
  primary: {
    main: '#054697', // Bolden
    light: '#3669AB',
    dark: '#043167',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FF471F', // Firecracker
    light: '#FF6F52',
    dark: '#B23115',
    contrastText: '#FFFFFF',
  },
  accent: {
    blanc: '#FBFBF7',
    rose: '#FFE8E4', // Soft pink for interactive elements
    roseDark: '#FFD5CC', // Darker soft pink for hover states
    nude: '#B8BDD7',
    pia: '#F2D4C2',
    blush: '#E8B4B4',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
  },
  background: {
    default: '#FBFBF7',
    paper: '#FFFFFF',
  },
};

// Define typography settings
const typography = {
  fontFamily: "'Poppins', sans-serif",
  h1: {
    fontFamily: "'Giaza', serif",
    fontSize: '72px',
    letterSpacing: '-0.05em',
  },
  h2: {
    fontFamily: "'Giaza', serif",
    fontSize: '48px',
    letterSpacing: '-0.05em',
  },
  h3: {
    fontFamily: "'Giaza', serif",
    fontSize: '36px',
    letterSpacing: '-0.05em',
  },
  h4: {
    fontFamily: "'Giaza', serif",
    fontSize: '24px',
    letterSpacing: '-0.05em',
  },
  h5: {
    fontFamily: "'Giaza', serif",
    fontSize: '20px',
    letterSpacing: '-0.05em',
  },
  h6: {
    fontFamily: "'Giaza', serif",
    fontSize: '18px',
    letterSpacing: '-0.05em',
  },
  subtitle1: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '18px',
    fontWeight: 400,
  },
  subtitle2: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '16px',
    fontWeight: 400,
    textTransform: 'uppercase' as const,
  },
  body1: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '18px',
    fontWeight: 300,
  },
  body2: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '16px',
    fontWeight: 300,
  },
  button: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '18px',
    fontWeight: 400,
    textTransform: 'uppercase' as const,
  },
};

// Create and export the theme
const theme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    text: colors.text,
    background: colors.background,
  },
  typography,
  shape: {
    borderRadius: 0, // Square corners as per brand guidelines
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'uppercase' as const,
          padding: '12px 24px',
        },
        contained: {
          backgroundColor: colors.accent.rose,
          color: colors.primary.main,
          '&:hover': {
            backgroundColor: colors.accent.roseDark,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
        filled: {
          backgroundColor: colors.accent.rose,
          color: colors.primary.main,
          '& .MuiChip-icon': {
            color: colors.primary.main,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: colors.accent.rose,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: colors.accent.rose,
          },
        },
      },
    },
  },
} as ThemeOptions);

export default theme;

// Add type declarations for custom accent colors
declare module '@mui/material/styles' {
  interface Palette {
    accent: {
      blanc: string;
      rose: string;
      roseDark: string;
      nude: string;
      pia: string;
      blush: string;
    };
  }
  interface PaletteOptions {
    accent?: {
      blanc?: string;
      rose?: string;
      roseDark?: string;
      nude?: string;
      pia?: string;
      blush?: string;
    };
  }
}
