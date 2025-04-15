import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardActions, 
  Typography, 
  useTheme, 
  SxProps, 
  Theme 
} from '@mui/material';

interface CardWithThemeProps {
  title?: React.ReactNode;
  subheader?: React.ReactNode;
  content?: React.ReactNode;
  actions?: React.ReactNode;
  elevation?: number;
  sx?: SxProps<Theme>;
  headerSx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
  actionsSx?: SxProps<Theme>;
  variant?: 'outlined' | 'elevation';
  onClick?: () => void;
}

/**
 * A themed card component that applies the application's theme consistently
 */
const CardWithTheme: React.FC<CardWithThemeProps> = ({
  title,
  subheader,
  content,
  actions,
  elevation = 1,
  sx = {},
  headerSx = {},
  contentSx = {},
  actionsSx = {},
  variant = 'elevation',
  onClick
}) => {
  const theme = useTheme();
  
  // Apply theme styles
  const cardStyle: SxProps<Theme> = {
    borderRadius: 0, // Square corners as per brand guidelines
    border: variant === 'outlined' ? `1px solid ${theme.palette.primary.light}` : 'none',
    backgroundColor: theme.palette.background.paper,
    transition: 'all 0.2s ease-in-out',
    '&:hover': onClick ? {
      boxShadow: 6,
      transform: 'scale(1.02)',
    } : {},
    ...sx
  };

  const headerStyle: SxProps<Theme> = {
    backgroundColor: theme.palette.accent?.rose,
    color: theme.palette.primary.main,
    ...headerSx
  };

  const contentStyle: SxProps<Theme> = {
    ...contentSx
  };

  const actionsStyle: SxProps<Theme> = {
    backgroundColor: theme.palette.accent?.blanc,
    borderTop: `1px solid ${theme.palette.accent?.rose}`,
    ...actionsSx
  };

  return (
    <Card 
      elevation={variant === 'elevation' ? elevation : 0} 
      sx={cardStyle}
      onClick={onClick}
    >
      {title && (
        <CardHeader
          title={
            typeof title === 'string' ? (
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: "'Giaza', serif",
                  letterSpacing: '-0.05em',
                }}
              >
                {title}
              </Typography>
            ) : title
          }
          subheader={subheader}
          sx={headerStyle}
        />
      )}
      
      <CardContent sx={contentStyle}>
        {typeof content === 'string' ? (
          <Typography variant="body1" sx={{ fontFamily: "'Poppins', sans-serif" }}>
            {content}
          </Typography>
        ) : content}
      </CardContent>
      
      {actions && (
        <CardActions sx={actionsStyle}>
          {actions}
        </CardActions>
      )}
    </Card>
  );
};

export default CardWithTheme;
