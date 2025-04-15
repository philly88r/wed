import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function ChatMessageList({ children, className, ...props }: ChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [children]);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-y-auto', className)}
      {...props}
    >
      {children}
    </div>
  );
}
