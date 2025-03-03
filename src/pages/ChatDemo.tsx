import React from 'react';
import { ExpandableChatDemo } from '../components/ui/code-demo';

const ChatDemo: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Expandable Chat Demo</h1>
      <p className="mb-8 text-lg">
        Click on the chat button in the bottom-right corner to open the chat interface.
      </p>
      <ExpandableChatDemo />
    </div>
  );
};

export default ChatDemo;
