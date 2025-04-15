import React from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  useTheme, 
  Paper,
  SxProps,
  Theme
} from '@mui/material';
import CardWithTheme from './CardWithTheme';

interface DashboardCardProps {
  title: string;
  content?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
  width?: 12 | 6 | 4 | 3; // Grid width (12 = full width, 6 = half, etc.)
  height?: number | string;
  sx?: SxProps<Theme>;
}

interface DashboardWithThemeProps {
  title?: string;
  subtitle?: string;
  cards: DashboardCardProps[];
  spacing?: number;
  containerSx?: SxProps<Theme>;
}

/**
 * A themed dashboard component that applies the application's theme consistently
 */
const DashboardWithTheme: React.FC<DashboardWithThemeProps> = ({
  title,
  subtitle,
  cards,
  spacing = 3,
  containerSx = {}
}) => {
  const theme = useTheme();
  
  return (
    <Container maxWidth="xl" sx={{ py: 4, ...containerSx }}>
      {title && (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            component="h1"
            sx={{ 
              fontFamily: "'Giaza', serif",
              color: theme.palette.primary.main,
              letterSpacing: '-0.05em',
              mb: subtitle ? 1 : 3
            }}
          >
            {title}
          </Typography>
          
          {subtitle && (
            <Typography 
              variant="subtitle1"
              sx={{ 
                fontFamily: "'Poppins', sans-serif",
                color: theme.palette.text.secondary,
                mb: 3
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      
      <Grid container spacing={spacing}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={card.width || 6} md={card.width || 4} key={index}>
            <CardWithTheme
              title={card.title}
              content={card.content}
              actions={card.actions}
              onClick={card.onClick}
              sx={{ 
                height: card.height || '100%',
                ...card.sx
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default DashboardWithTheme;
