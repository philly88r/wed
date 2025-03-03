import React, { useState, useEffect } from 'react';
import { ExpandableChat } from './expandable-chat';
import { ChatBubble } from './chat-bubble';
import { ChatInput } from './chat-input';
import { ChatMessageList } from './chat-message-list';
import { Button } from './button';
import { MessageLoading } from './message-loading';
import WeddingTimeline, { TimelineItem } from './wedding-timeline';
import { weddingChecklistData } from '../../data/wedding-checklist';
import { Calendar, List, X } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export const WeddingChecklistChat: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Welcome to your wedding planning checklist! I\'m here to help you stay on track with your wedding planning. You can view your timeline, mark tasks as complete, and ask me any questions about your planning process.',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [checklist, setChecklist] = useState<TimelineItem[]>(weddingChecklistData);
  const [weddingDate, setWeddingDate] = useState<Date>(() => {
    // Default to 6 months from now
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    return date;
  });

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Process the message
    setTimeout(() => {
      handleAssistantResponse(content);
    }, 1000);
  };

  const handleAssistantResponse = (userMessage: string) => {
    const lowerCaseMessage = userMessage.toLowerCase();
    let response = '';

    // Check for specific commands or questions
    if (lowerCaseMessage.includes('show timeline') || lowerCaseMessage.includes('view checklist')) {
      setShowTimeline(true);
      response = 'Here\'s your wedding planning timeline. You can click on the status icons to update your progress!';
    } else if (lowerCaseMessage.includes('hide timeline') || lowerCaseMessage.includes('hide checklist')) {
      setShowTimeline(false);
      response = 'I\'ve hidden the timeline. Let me know if you need anything else!';
    } else if (lowerCaseMessage.includes('wedding date') && (lowerCaseMessage.includes('change') || lowerCaseMessage.includes('set'))) {
      response = 'To change your wedding date, please use the "Set Wedding Date" button at the top of the chat.';
    } else if (lowerCaseMessage.includes('how many tasks')) {
      const completed = checklist.filter(item => item.status === 'COMPLETED').length;
      const total = checklist.length;
      response = `You've completed ${completed} out of ${total} tasks (${Math.round((completed/total)*100)}%). Keep up the good work!`;
    } else if (lowerCaseMessage.includes('what should i do next')) {
      const nextTasks = checklist
        .filter(item => item.status === 'NOT STARTED')
        .slice(0, 3)
        .map(item => `• ${item.task}`);
      
      if (nextTasks.length > 0) {
        response = `Here are some tasks you could focus on next:\n${nextTasks.join('\n')}`;
      } else {
        response = 'Great job! You\'ve started all your tasks. Focus on completing the ones in progress.';
      }
    } else {
      // Default responses
      const defaultResponses = [
        'I\'m here to help with your wedding planning! You can ask me to show your timeline, suggest next tasks, or answer questions about wedding planning.',
        'Is there anything specific about your wedding planning you\'d like help with?',
        'Remember, you can view your checklist at any time by saying "show timeline".',
        'If you need help with a specific task, just let me know!',
      ];
      response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    const assistantMessage: Message = {
      id: Date.now().toString(),
      content: response,
      role: 'assistant',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleUpdateTaskStatus = (id: string, status: TimelineItem['status']) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status } : item
      )
    );

    // Add a message about the status update
    const task = checklist.find(item => item.id === id);
    if (task) {
      const statusMessages = {
        'NOT STARTED': `You've marked "${task.task}" as not started.`,
        'IN PROGRESS': `You've started working on "${task.task}". Good progress!`,
        'COMPLETED': `Congratulations! You've completed "${task.task}"! 🎉`,
      };

      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: statusMessages[status],
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    }
  };

  const handleSetWeddingDate = () => {
    const dateStr = prompt('Please enter your wedding date (YYYY-MM-DD):', 
      weddingDate.toISOString().split('T')[0]);
    
    if (dateStr) {
      const newDate = new Date(dateStr);
      if (!isNaN(newDate.getTime())) {
        setWeddingDate(newDate);
        
        const assistantMessage: Message = {
          id: Date.now().toString(),
          content: `I've updated your wedding date to ${newDate.toLocaleDateString()}. Your timeline has been adjusted accordingly.`,
          role: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
      }
    }
  };

  return (
    <ExpandableChat
      size="md"
      position="bottom-right"
      icon={<Calendar className="h-6 w-6" />}
      className="z-50"
    >
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowTimeline(!showTimeline)}
            className="flex items-center gap-1"
          >
            {showTimeline ? <X className="h-4 w-4" /> : <List className="h-4 w-4" />}
            {showTimeline ? 'Hide Checklist' : 'Show Checklist'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSetWeddingDate}
            className="flex items-center gap-1"
          >
            <Calendar className="h-4 w-4" />
            Set Wedding Date
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Wedding: {weddingDate.toLocaleDateString()}
        </div>
      </div>

      {showTimeline ? (
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          <WeddingTimeline 
            weddingDate={weddingDate}
            items={checklist}
            onUpdateStatus={handleUpdateTaskStatus}
          />
        </div>
      ) : (
        <ChatMessageList className="flex-1 p-4">
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.role === "user" ? "sent" : "received"}
            >
              {message.content}
            </ChatBubble>
          ))}
          {isLoading && <MessageLoading />}
        </ChatMessageList>
      )}

      <div className="p-4 border-t">
        <form onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);
          const message = formData.get('message') as string;
          handleSendMessage(message);
          form.reset();
        }}>
          <ChatInput
            name="message"
            placeholder="Ask about your wedding planning..."
            disabled={isLoading}
          />
        </form>
      </div>
    </ExpandableChat>
  );
};

export default WeddingChecklistChat;
