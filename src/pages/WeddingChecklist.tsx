import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Circle, CheckCircle, CircleDashed, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { weddingChecklistData } from '../data/wedding-checklist';
import { TimelineItem } from '../components/ui/wedding-timeline';

// Define the extended timeline item type with category
interface CategorizedTimelineItem extends TimelineItem {
  category: string;
}

// Add categories to checklist items
const categorizedChecklist: CategorizedTimelineItem[] = weddingChecklistData.map(item => {
  // Assign categories based on keywords in the task
  let category = 'Planning';
  if (item.task.toLowerCase().includes('venue') || item.task.toLowerCase().includes('location')) {
    category = 'Venue';
  } else if (item.task.toLowerCase().includes('photo') || item.task.toLowerCase().includes('video')) {
    category = 'Photography';
  } else if (item.task.toLowerCase().includes('cater') || item.task.toLowerCase().includes('food') || item.task.toLowerCase().includes('cake')) {
    category = 'Catering';
  } else if (item.task.toLowerCase().includes('music') || item.task.toLowerCase().includes('dj') || item.task.toLowerCase().includes('band')) {
    category = 'Music';
  } else if (item.task.toLowerCase().includes('gift') || item.task.toLowerCase().includes('registry')) {
    category = 'Gifts';
  } else if (item.task.toLowerCase().includes('ceremony') || item.task.toLowerCase().includes('officiant') || item.task.toLowerCase().includes('vows')) {
    category = 'Ceremony';
  }
  
  return {
    ...item,
    category
  };
});

export default function WeddingChecklist() {
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<CategorizedTimelineItem[]>(() => {
    // Try to load from localStorage first
    const savedChecklist = localStorage.getItem('enhanced-wedding-checklist');
    return savedChecklist ? JSON.parse(savedChecklist) : categorizedChecklist;
  });
  
  const [weddingDate, setWeddingDate] = useState<Date>(() => {
    // Default to 6 months from now
    const savedDate = localStorage.getItem('wedding-date');
    if (savedDate) {
      return new Date(savedDate);
    }
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    return date;
  });
  
  const [activeQuarter, setActiveQuarter] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [daysLeft, setDaysLeft] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [quarterDates, setQuarterDates] = useState<{start: Date; end: Date}[]>([]);

  // Calculate quarter dates based on wedding date
  useEffect(() => {
    const calculateQuarterDates = (date: Date) => {
      // Clone the date to avoid modifying the original
      const weddingDay = new Date(date);
      const today = new Date();
      
      // Calculate total days until the wedding
      const totalDays = Math.max(0, Math.ceil((weddingDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
      
      // If the wedding is in the past or today, return empty quarters
      if (totalDays === 0) {
        return [
          { start: today, end: today },
          { start: today, end: today },
          { start: today, end: today },
          { start: today, end: today }
        ];
      }
      
      // Calculate the number of days for each quarter (divide total days by 4)
      const daysPerQuarter = Math.ceil(totalDays / 4);
      
      // Calculate Q4 (last quarter before wedding)
      const q4End = new Date(weddingDay);
      const q4Start = new Date(weddingDay);
      q4Start.setDate(weddingDay.getDate() - daysPerQuarter);
      
      // Calculate Q3
      const q3End = new Date(q4Start);
      q3End.setDate(q3End.getDate() - 1);
      const q3Start = new Date(q3End);
      q3Start.setDate(q3End.getDate() - daysPerQuarter);
      
      // Calculate Q2
      const q2End = new Date(q3Start);
      q2End.setDate(q2End.getDate() - 1);
      const q2Start = new Date(q2End);
      q2Start.setDate(q2End.getDate() - daysPerQuarter);
      
      // Calculate Q1 (first quarter of planning)
      const q1End = new Date(q2Start);
      q1End.setDate(q1End.getDate() - 1);
      const q1Start = new Date(q1End);
      q1Start.setDate(q1End.getDate() - daysPerQuarter);
      
      // Ensure q1Start is not before today
      if (q1Start < today) {
        q1Start.setTime(today.getTime());
      }
      
      return [
        { start: q1Start, end: q1End },
        { start: q2Start, end: q2End },
        { start: q3Start, end: q3End },
        { start: q4Start, end: q4End }
      ];
    };
    
    const quarters = calculateQuarterDates(weddingDate);
    setQuarterDates(quarters);
  }, [weddingDate]);

  // Calculate progress and days left
  useEffect(() => {
    const completed = checklist.filter(item => item.status === 'COMPLETED').length;
    const total = checklist.length;
    setProgress(Math.round((completed / total) * 100));
    
    const today = new Date();
    const timeLeft = Math.max(0, Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    setDaysLeft(timeLeft);
  }, [checklist, weddingDate]);

  // Save checklist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('enhanced-wedding-checklist', JSON.stringify(checklist));
  }, [checklist]);

  // Save wedding date to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wedding-date', weddingDate.toISOString());
  }, [weddingDate]);

  // Trigger confetti when a task is completed
  useEffect(() => {
    if (showConfetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleUpdateTaskStatus = (id: string, status: TimelineItem['status']) => {
    const prevStatus = checklist.find(item => item.id === id)?.status;
    
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status } : item
      )
    );
    
    // Trigger confetti when marking as completed
    if (status === 'COMPLETED' && prevStatus !== 'COMPLETED') {
      setShowConfetti(true);
    }
  };

  const getStatusIcon = (status: TimelineItem['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'IN PROGRESS':
        return <CircleDashed className="h-5 w-5 text-amber-500" />;
      case 'NOT STARTED':
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusClass = (status: TimelineItem['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'border-green-200 bg-green-50 hover:bg-green-100';
      case 'IN PROGRESS':
        return 'border-amber-200 bg-amber-50 hover:bg-amber-100';
      case 'NOT STARTED':
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  // Toggle expanded state for a timeline item
  const toggleItemExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  // Handle resource link clicks
  const handleResourceClick = (link: string) => {
    if (link.startsWith('/')) {
      navigate(link);
    } else {
      window.open(link, '_blank');
    }
  };

  // Group items by quarter and deadline
  const groupedItems: Record<number, Record<string, CategorizedTimelineItem[]>> = checklist.reduce<Record<number, Record<string, CategorizedTimelineItem[]>>>((acc, item) => {
    if (!acc[item.quarter]) {
      acc[item.quarter] = {};
    }
    
    if (!acc[item.quarter][item.deadline]) {
      acc[item.quarter][item.deadline] = [];
    }
    
    // Only add if no category filter or matching category
    if (!activeCategory || item.category === activeCategory) {
      acc[item.quarter][item.deadline].push(item);
    }
    
    return acc;
  }, {});

  // Get all unique categories
  const categories = Array.from(new Set(categorizedChecklist.map(item => item.category)));

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

  const handleWeddingDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setWeddingDate(newDate);
    }
  };

  // Format date to readable string
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Resource type icons
  const resourceTypeIcons: Record<string, React.ReactNode> = {
    'tip': <span className="inline-block w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">i</span>,
    'tool': <span className="inline-block w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">T</span>,
    'internal': <span className="inline-block w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold">L</span>,
    'external': <span className="inline-block w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">E</span>
  };

  // Category icons
  const categoryIcons: Record<string, React.ReactNode> = {
    'Venue': <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">Venue</span>,
    'Photography': <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-800">Photo</span>,
    'Catering': <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-800">Food</span>,
    'Music': <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">Music</span>,
    'Gifts': <span className="text-xs font-medium px-2 py-1 rounded-full bg-rose-100 text-rose-800">Gifts</span>,
    'Ceremony': <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">Ceremony</span>,
    'Planning': <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">Planning</span>
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-rose-600 mb-2 font-serif">Your Wedding Checklist</h1>
        <p className="text-lg text-gray-600 mb-6">A comprehensive guide to planning your perfect day</p>
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 w-full md:w-auto min-w-[250px] flex flex-col items-center">
            <span className="text-gray-500 mb-1">Wedding Date</span>
            <div className="relative">
              <input 
                type="date" 
                value={weddingDate.toISOString().split('T')[0]}
                onChange={handleWeddingDateChange}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 w-full md:w-auto min-w-[250px] flex flex-col items-center">
            <span className="text-gray-500 mb-1">Days Left</span>
            <span className="text-3xl font-bold text-rose-600">{daysLeft}</span>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 w-full md:w-auto min-w-[250px] flex flex-col items-center">
            <span className="text-gray-500 mb-1">Progress</span>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className="bg-rose-600 h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-lg font-semibold">{progress}%</span>
          </div>
        </div>

        {/* Quarter Date Ranges */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Wedding Planning Timeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quarterDates.map((_, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${activeQuarter === index + 1 ? 'border-rose-500 bg-rose-50' : 'border-gray-200'}`}
                onClick={() => setActiveQuarter(index + 1)}
              >
                <h3 className="font-bold text-lg text-rose-600">
                  {index === 0 ? "First Quarter" : 
                   index === 1 ? "Second Quarter" : 
                   index === 2 ? "Third Quarter" : "Final Quarter"}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatDate(quarterDates[index].start)} - {formatDate(quarterDates[index].end)}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button 
            onClick={() => setActiveQuarter(0)} 
            className={`px-4 py-2 rounded-full ${activeQuarter === 0 ? 'bg-rose-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            All Quarters
          </button>
          {[1, 2, 3, 4].map(quarter => (
            <button 
              key={quarter}
              onClick={() => setActiveQuarter(quarter)} 
              className={`px-4 py-2 rounded-full ${activeQuarter === quarter ? 'bg-rose-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {quarter === 1 ? "First Quarter" : 
               quarter === 2 ? "Second Quarter" : 
               quarter === 3 ? "Third Quarter" : "Final Quarter"}
            </button>
          ))}
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(activeCategory === category ? null : category)}
              className={`px-4 py-2 rounded-full ${
                activeCategory === category 
                  ? 'bg-rose-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {activeQuarter === 0 ? 'All Quarters' : 
             activeQuarter === 1 ? "First Quarter" : 
             activeQuarter === 2 ? "Second Quarter" : 
             activeQuarter === 3 ? "Third Quarter" : "Final Quarter"}
          </h2>
          
          {Object.entries(activeQuarter === 0 
            ? Object.entries(groupedItems).reduce((all, [_, deadlines]) => {
                Object.entries(deadlines).forEach(([deadline, items]) => {
                  if (!all[deadline]) all[deadline] = [];
                  all[deadline].push(...items);
                });
                return all;
              }, {} as Record<string, CategorizedTimelineItem[]>)
            : (groupedItems[activeQuarter] || {})
          )
            .sort(([a], [b]) => getDeadlineOrder(a as TimelineItem['deadline']) - getDeadlineOrder(b as TimelineItem['deadline']))
            .map(([deadline, items]) => (
              <div key={deadline} className="mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">{deadline}</h3>
                
                <div className="space-y-4">
                  {items.map(item => {
                    const isExpanded = expandedItems.includes(item.id);
                    const hasResources = item.resources && item.resources.length > 0;
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                          isExpanded ? 'shadow-md' : ''
                        }`}
                      >
                        <div 
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                          onClick={() => hasResources && toggleItemExpanded(item.id)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextStatus = {
                                  'NOT STARTED': 'IN PROGRESS',
                                  'IN PROGRESS': 'COMPLETED',
                                  'COMPLETED': 'NOT STARTED'
                                }[item.status] as TimelineItem['status'];
                                handleUpdateTaskStatus(item.id, nextStatus);
                              }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center border ${getStatusClass(item.status)}`}
                              aria-label={`Mark task as ${
                                item.status === 'NOT STARTED' ? 'in progress' : 
                                item.status === 'IN PROGRESS' ? 'completed' : 'not started'
                              }`}
                            >
                              {getStatusIcon(item.status)}
                            </button>
                            
                            <div className="flex-1">
                              <div className={`font-medium ${item.status === 'COMPLETED' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{item.task}</div>
                              {item.note && (
                                <div className="text-sm text-gray-500 mt-1">{item.note}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {categoryIcons[item.category] && (
                              <span className="text-gray-500">{categoryIcons[item.category]}</span>
                            )}
                            
                            {hasResources && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleItemExpanded(item.id);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {isExpanded && item.resources && (
                          <div className="bg-gray-50 p-4 border-t">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Resources & Tips</h4>
                            
                            <div className="space-y-3">
                              {item.resources.map((resource, idx) => (
                                <div 
                                  key={idx} 
                                  className={`p-3 rounded-lg ${
                                    resource.type === 'tip' 
                                      ? 'bg-blue-50 border border-blue-100' 
                                      : resource.type === 'tool'
                                        ? 'bg-purple-50 border border-purple-100'
                                        : resource.type === 'internal'
                                          ? 'bg-rose-50 border border-rose-100'
                                          : 'bg-amber-50 border border-amber-100'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`${
                                      resource.type === 'tip' 
                                        ? 'text-blue-600' 
                                        : resource.type === 'tool'
                                          ? 'text-purple-600'
                                          : resource.type === 'internal'
                                            ? 'text-rose-600'
                                            : 'text-amber-600'
                                    }`}>
                                      {resourceTypeIcons[resource.type]}
                                    </span>
                                    <span className="font-medium">{resource.title}</span>
                                  </div>
                                  
                                  {resource.description && (
                                    <p className="text-sm text-gray-600 ml-6">{resource.description}</p>
                                  )}
                                  
                                  {resource.link && (
                                    <button
                                      onClick={() => resource.link && handleResourceClick(resource.link as string)}
                                      className={`mt-2 ml-6 text-sm flex items-center gap-1 ${
                                        resource.type === 'internal' 
                                          ? 'text-rose-600 hover:text-rose-700' 
                                          : 'text-amber-600 hover:text-amber-700'
                                      }`}
                                    >
                                      <span>Go to {resource.type === 'internal' ? 'page' : 'resource'}</span>
                                      <ArrowRight size={14} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
