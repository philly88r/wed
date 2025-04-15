import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Box, Typography, CircularProgress, Button, Alert } from '@mui/material';

interface MermaidTimelineProps {
  chart: string;
  className?: string;
}

const MermaidTimeline = ({ chart, className = '' }: MermaidTimelineProps) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Reset states when chart changes
    setLoading(true);
    setError(null);
    
    if (!chart || chart.trim() === '') {
      console.log('Empty chart data, skipping render');
      setError('No timeline data available');
      setLoading(false);
      return;
    }

    // Initialize mermaid with each render to ensure fresh state
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      gantt: {
        axisFormat: '%H:%M',
        fontSize: 14,
      },
      logLevel: 'error',
    });

    const renderMermaid = async () => {
      if (!mermaidRef.current) return;
      
      try {
        // Clear previous content
        mermaidRef.current.innerHTML = '';
        
        // Create a unique ID for this diagram
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        mermaidRef.current.id = id;
        
        console.log('Rendering Mermaid diagram with ID:', id);
        console.log('Chart content:', chart);
        
        // Add a timeout to prevent infinite loading
        const renderPromise = new Promise<{svg: string}>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Rendering timed out after 5 seconds'));
          }, 5000);
          
          mermaid.render(id, chart)
            .then((result) => {
              clearTimeout(timeoutId);
              resolve(result);
            })
            .catch((err) => {
              clearTimeout(timeoutId);
              reject(err);
            });
        });
        
        const result = await renderPromise;
        
        if (mermaidRef.current) {
          console.log('Mermaid render successful');
          mermaidRef.current.innerHTML = result.svg;
          setLoading(false);
        }
      } catch (renderError: any) {
        console.error('Error during Mermaid render:', renderError);
        
        // Try a fallback approach with simpler syntax
        try {
          console.log('Attempting fallback render with simplified syntax');
          
          // Create a simplified gantt chart
          const simplifiedChart = `gantt
  title Wedding Timeline
  dateFormat HH:mm
  axisFormat %H:%M
  
  section Timeline
  Wedding Day :00:00, 24h`;
          
          const fallbackId = `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
          
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = '';
            mermaidRef.current.id = fallbackId;
            
            const fallbackResult = await mermaid.render(fallbackId, simplifiedChart);
            
            if (mermaidRef.current) {
              mermaidRef.current.innerHTML = fallbackResult.svg;
              setError('Could not render detailed timeline. Showing simplified version instead.');
              setLoading(false);
            }
          }
        } catch (fallbackError) {
          console.error('Fallback render also failed:', fallbackError);
          setError('Could not render timeline. Please check your data and try again.');
          setLoading(false);
        }
      }
    };

    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      renderMermaid();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [chart, retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  return (
    <Box className={className} sx={{ width: '100%', position: 'relative', minHeight: '200px' }}>
      {loading && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 1 
        }}>
          <CircularProgress size={40} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Rendering timeline...
          </Typography>
        </Box>
      )}
      
      {error && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      <div 
        ref={mermaidRef} 
        style={{ 
          width: '100%', 
          overflowX: 'auto',
          opacity: loading ? 0.3 : 1,
          transition: 'opacity 0.3s ease'
        }}
      />
    </Box>
  );
};

export default MermaidTimeline;
