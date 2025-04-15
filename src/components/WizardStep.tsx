import React from 'react';
import { Box, Paper, Typography, Button, Stack } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

interface WizardStepProps {
  title: string;
  description?: string;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  children: React.ReactNode;
  isNextDisabled?: boolean;
}

const WizardStep: React.FC<WizardStepProps> = ({
  title,
  description,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  children,
  isNextDisabled = false,
}) => {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        mb: 4, 
        borderRadius: 2,
        maxWidth: '100%',
        mx: 'auto',
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <Typography variant="body2" color="text.secondary">
          Step {currentStep} of {totalSteps}
        </Typography>
      </Box>
      
      <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 'bold' }}>
        {title}
      </Typography>
      
      {description && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {description}
        </Typography>
      )}
      
      <Box sx={{ my: 3 }}>
        {children}
      </Box>
      
      <Stack 
        direction="row" 
        spacing={2} 
        justifyContent="space-between" 
        sx={{ mt: 4 }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={onBack}
          disabled={currentStep === 1}
        >
          Back
        </Button>
        
        <Button
          variant="contained"
          endIcon={<ArrowForward />}
          onClick={onNext}
          disabled={isNextDisabled}
          color="primary"
        >
          {currentStep === totalSteps ? 'Finish' : 'Next'}
        </Button>
      </Stack>
    </Paper>
  );
};

export default WizardStep;
