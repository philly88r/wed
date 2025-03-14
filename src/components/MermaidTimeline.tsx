import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Box, Typography, CircularProgress } from '@mui/material';

interface MermaidTimelineProps {
  chart: string;
  className?: string;
}

const MermaidTimeline = ({ chart, className = '' }: MermaidTimelineProps) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chart) {
      setLoading(false);
      return;
    }

    if (mermaidRef.current) {
      setLoading(true);
      setError(null);

      try {
        mermaid.initialize({
          startOnLoad: true,
          theme: 'default',
          securityLevel: 'loose',
          flowchart: {
            htmlLabels: true,
            curve: 'basis',
          },
          gantt: {
            titleTopMargin: 25,
            barHeight: 20,
            barGap: 4,
            topPadding: 50,
            leftPadding: 75,
            gridLineStartPadding: 35,
            fontSize: 12,
            numberSectionStyles: 4,
            axisFormat: '%H:%M',
          },
          themeCSS: '.node rect { font-family: "Inter", "Lato", sans-serif; } .taskText { font-family: "Inter", "Lato", sans-serif; }',
        });

        // Clear previous content
        mermaidRef.current.innerHTML = '';
        
        // Create a unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
        mermaidRef.current.id = id;
        
        // Render the diagram
        mermaid.render(id, chart).then(({ svg }) => {
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
            setLoading(false);
          }
        }).catch(err => {
          console.error('Error rendering Mermaid diagram:', err);
          setError(`Error rendering timeline: ${err.message || 'Unknown error'}`);
          setLoading(false);
        });
      } catch (error: any) {
        console.error('Error initializing Mermaid:', error);
        setError(`Error initializing timeline: ${error.message || 'Unknown error'}`);
        setLoading(false);
      }
    }
  }, [chart]);

  if (loading) {
    return (
      <Box className={`mermaid-timeline ${className}`} display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={`mermaid-timeline ${className}`} display="flex" justifyContent="center" alignItems="center" minHeight="200px" flexDirection="column">
        <Typography color="error" variant="body1" align="center" gutterBottom>
          {error}
        </Typography>
        <Typography variant="body2" align="center">
          Please check your timeline data and try again.
        </Typography>
      </Box>
    );
  }

  return <div ref={mermaidRef} className={`mermaid-timeline ${className}`} />;
};

export default MermaidTimeline;
