import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Box, Typography, CircularProgress, Button } from '@mui/material';

interface MermaidTimelineProps {
  chart: string;
  className?: string;
}

const MermaidTimeline = ({ chart, className = '' }: MermaidTimelineProps) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Rendering Mermaid timeline');
    
    if (!chart || chart.trim() === '') {
      console.log('Empty chart data, skipping render');
      setError('No timeline data available');
      setLoading(false);
      return;
    }

    const renderMermaid = async () => {
      if (!mermaidRef.current) return;
      
      try {
        setLoading(true);
        setError(null);

        console.log('Initializing Mermaid...');
        
        // Initialize with simpler configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          gantt: {
            axisFormat: '%H:%M',
            fontSize: 12,
          },
        });

        // Clear previous content
        mermaidRef.current.innerHTML = '';
        
        // Create a unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
        mermaidRef.current.id = id;
        
        console.log('Rendering Mermaid diagram with ID:', id);
        
        try {
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
            
            const fallbackId = `fallback-${Math.random().toString(36).substring(2, 11)}`;
            mermaidRef.current.id = fallbackId;
            
            const fallbackResult = await mermaid.render(fallbackId, simplifiedChart);
            
            if (mermaidRef.current) {
              mermaidRef.current.innerHTML = fallbackResult.svg;
              setError('Could not render your timeline, showing a simplified version instead. Please check your data.');
              setLoading(false);
            }
          } catch (fallbackError: any) {
            console.error('Fallback render also failed:', fallbackError);
            setError(`Could not render timeline: ${renderError.message || 'Unknown error'}`);
            setLoading(false);
          }
        }
      } catch (error: any) {
        console.error('Error in Mermaid initialization:', error);
        setError(`Error initializing timeline: ${error.message || 'Unknown error'}`);
        setLoading(false);
      }
    };

    renderMermaid();
    
    // Cleanup function
    return () => {
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = '';
      }
    };
  }, [chart]);

  const retryRender = () => {
    if (mermaidRef.current) {
      mermaidRef.current.innerHTML = '';
      setLoading(true);
      setError(null);
      
      // Force re-render by triggering the useEffect
      setTimeout(() => {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = '';
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
          });
          
          const id = `retry-${Math.random().toString(36).substring(2, 11)}`;
          mermaidRef.current.id = id;
          
          mermaid.render(id, chart)
            .then(({ svg }) => {
              if (mermaidRef.current) {
                mermaidRef.current.innerHTML = svg;
                setLoading(false);
              }
            })
            .catch(err => {
              console.error('Retry render failed:', err);
              setError(`Retry failed: ${err.message || 'Unknown error'}`);
              setLoading(false);
            });
        }
      }, 100);
    }
  };

  if (loading) {
    return (
      <Box className={`mermaid-timeline ${className}`} display="flex" justifyContent="center" alignItems="center" minHeight="200px" flexDirection="column">
        <CircularProgress />
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Rendering timeline...
        </Typography>
        <Button 
          variant="text" 
          color="primary" 
          size="small" 
          onClick={() => setLoading(false)}
          sx={{ mt: 2 }}
        >
          Cancel
        </Button>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={`mermaid-timeline ${className}`} display="flex" justifyContent="center" alignItems="center" minHeight="200px" flexDirection="column" p={2}>
        <Typography color="error" variant="body1" align="center" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="small" 
          onClick={retryRender}
          sx={{ mt: 2, mb: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return <div ref={mermaidRef} className={`mermaid-timeline ${className}`} />;
};

export default MermaidTimeline;
