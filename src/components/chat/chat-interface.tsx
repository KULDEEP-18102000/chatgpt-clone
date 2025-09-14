'use client';

import { useState } from 'react';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { Sidebar } from './sidebar';
import { useChat } from '@/hooks/use-chat';

export function ChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ✅ Let the hook manage everything - don't duplicate states
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    editMessage,
    deleteConversation,
    createNewConversation,
    loadConversation,
    conversations,
    loadUserConversations,
    setConversations,
    currentConversationId, // ✅ Use hook's conversation ID, not separate state
  } = useChat(null); // Start with no conversation selected

  // ✅ Simple handlers that just call hook functions
  const handleNewConversation = async () => {
    await createNewConversation();
    // Hook automatically handles conversation list updates
  };

  const handleSelectConversation = (conversationId: string) => {
    loadConversation(conversationId);
    // Hook automatically updates currentConversationId
  };

  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId} // ✅ Use hook's state
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        deleteConversation={deleteConversation}
        loadUserConversations={loadUserConversations}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
            
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="flex-1 overflow-hidden">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            onEditMessage={editMessage}
          />
        </div>
                
        <div className="border-t border-gray-700 bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <ChatInput
              onSendMessage={sendMessage}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* ✅ Optional: Show error messages */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
}