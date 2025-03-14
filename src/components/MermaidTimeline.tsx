import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidTimelineProps {
  chart: string;
  className?: string;
}

const MermaidTimeline = ({ chart, className = '' }: MermaidTimelineProps) => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mermaidRef.current) {
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
      });

      try {
        // Clear previous content
        mermaidRef.current.innerHTML = '';
        
        // Create a unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
        mermaidRef.current.id = id;
        
        // Render the diagram
        mermaid.render(id, chart).then(({ svg }) => {
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
        });
      } catch (error) {
        console.error('Error rendering Mermaid diagram:', error);
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = `<div class="error">Error rendering timeline: ${error}</div>`;
        }
      }
    }
  }, [chart]);

  return (
    <div className={`mermaid-timeline ${className}`}>
      <div ref={mermaidRef} className="mermaid-container" />
    </div>
  );
};

export default MermaidTimeline;
