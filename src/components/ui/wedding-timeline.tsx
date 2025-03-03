import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Check, Clock, AlertTriangle } from 'lucide-react';

// Define the timeline data structure
export interface TimelineItem {
  id: string;
  quarter: number;
  deadline: 'First' | 'Second' | 'Third' | '30 Days Before WD' | '10 Days Before WD' | '1 Day Before WD' | 'WD' | '1 Day After WD';
  status: 'NOT STARTED' | 'IN PROGRESS' | 'COMPLETED';
  task: string;
  note?: string;
  condition?: string;
}

interface TimelineProps {
  weddingDate: Date;
  items: TimelineItem[];
  onUpdateStatus: (id: string, status: TimelineItem['status']) => void;
  className?: string;
}

const getStatusIcon = (status: TimelineItem['status']) => {
  switch (status) {
    case 'COMPLETED':
      return <Check className="h-5 w-5 text-green-500" />;
    case 'IN PROGRESS':
      return <Clock className="h-5 w-5 text-amber-500" />;
    case 'NOT STARTED':
      return <AlertTriangle className="h-5 w-5 text-gray-400" />;
  }
};

const getStatusClass = (status: TimelineItem['status']) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 border-green-300 text-green-800';
    case 'IN PROGRESS':
      return 'bg-amber-100 border-amber-300 text-amber-800';
    case 'NOT STARTED':
      return 'bg-gray-100 border-gray-300 text-gray-800';
  }
};

export const WeddingTimeline: React.FC<TimelineProps> = ({
  weddingDate,
  items,
  onUpdateStatus,
  className,
}) => {
  const [currentQuarter, setCurrentQuarter] = useState<number>(1);
  const [groupedItems, setGroupedItems] = useState<Record<number, TimelineItem[]>>({});

  // Calculate the current quarter based on today's date and wedding date
  useEffect(() => {
    const today = new Date();
    const totalDays = Math.max(1, Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const daysPerQuarter = Math.ceil(totalDays / 4);
    
    const daysPassed = Math.max(0, Math.ceil((today.getTime() - (today.getTime() - totalDays * 1000 * 60 * 60 * 24)) / (1000 * 60 * 60 * 24)));
    const calculatedQuarter = Math.min(4, Math.ceil(daysPassed / daysPerQuarter) || 1);
    
    setCurrentQuarter(calculatedQuarter);
  }, [weddingDate]);

  // Group items by quarter
  useEffect(() => {
    const grouped = items.reduce<Record<number, TimelineItem[]>>((acc, item) => {
      if (!acc[item.quarter]) {
        acc[item.quarter] = [];
      }
      acc[item.quarter].push(item);
      return acc;
    }, {});

    setGroupedItems(grouped);
  }, [items]);

  // Get deadline order for sorting
  const getDeadlineOrder = (deadline: TimelineItem['deadline']) => {
    const order: Record<TimelineItem['deadline'], number> = {
      'First': 1,
      'Second': 2,
      'Third': 3,
      '30 Days Before WD': 4,
      '10 Days Before WD': 5,
      '1 Day Before WD': 6,
      'WD': 7,
      '1 Day After WD': 8
    };
    return order[deadline] || 0;
  };

  const handleStatusChange = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const nextStatus: Record<TimelineItem['status'], TimelineItem['status']> = {
      'NOT STARTED': 'IN PROGRESS',
      'IN PROGRESS': 'COMPLETED',
      'COMPLETED': 'NOT STARTED'
    };

    onUpdateStatus(id, nextStatus[item.status]);
  };

  return (
    <div className={cn("space-y-8", className)}>
      {[1, 2, 3, 4].map((quarter) => {
        const quarterItems = groupedItems[quarter] || [];
        
        // Skip empty quarters
        if (quarterItems.length === 0) return null;
        
        // Sort items by deadline
        const sortedItems = [...quarterItems].sort(
          (a, b) => getDeadlineOrder(a.deadline) - getDeadlineOrder(b.deadline)
        );
        
        // Group by deadline
        const itemsByDeadline = sortedItems.reduce<Record<string, TimelineItem[]>>(
          (acc, item) => {
            if (!acc[item.deadline]) {
              acc[item.deadline] = [];
            }
            acc[item.deadline].push(item);
            return acc;
          }, 
          {}
        );

        return (
          <Card key={quarter} className={cn(
            "border-2",
            quarter === currentQuarter ? "border-primary" : "border-gray-200"
          )}>
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center justify-between">
                <span>Quarter {quarter}</span>
                {quarter === currentQuarter && (
                  <span className="text-sm font-normal px-3 py-1 bg-primary text-primary-foreground rounded-full">
                    Current
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {Object.entries(itemsByDeadline).map(([deadline, deadlineItems]) => (
                <div key={deadline} className="border-t border-gray-200">
                  <div className="p-4 bg-gray-50 font-medium">
                    {deadline} Deadline
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {deadlineItems.map((item) => (
                      <li 
                        key={item.id} 
                        className={cn(
                          "p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors",
                          item.condition ? "relative" : ""
                        )}
                      >
                        <button
                          onClick={() => handleStatusChange(item.id)}
                          className={cn(
                            "mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border",
                            getStatusClass(item.status)
                          )}
                          title="Click to change status"
                        >
                          {getStatusIcon(item.status)}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{item.task}</p>
                          {item.note && (
                            <p className="mt-1 text-sm text-gray-500">{item.note}</p>
                          )}
                          {item.condition && (
                            <p className="mt-1 text-xs text-gray-400 italic">
                              {item.condition}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default WeddingTimeline;
