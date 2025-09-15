'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Message, Attachment, Conversation,User } from '@/types';
// import { ChartNoAxesColumnDecreasing } from 'lucide-react';
// import { redirect } from 'next/navigation';

export function useChat(conversationId: string | null) {
  // Safe way to get user from localStorage
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      setUser(null);
    }
  }, []);

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef<Message[]>([]);

  // Keep messages ref in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

   const loadConversation = useCallback(async (id: string) => {
    if (id === currentConversationId) return;

    try {
      setError(null);
      
      if (!user?.id) {
        setError('User not found. Please refresh the page.');
        return;
      }

      const response = await fetch(`/api/conversations/${id}?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to load conversation');
      }

      const conversation = await response.json();
      setMessages(conversation.messages || []);
      setCurrentConversationId(id); // ✅ Update current conversation ID
      setInput('');
      
    } catch (error) {
      console.error('Error loading conversation:', error);
      setError('Failed to load conversation. Please try again.');
    }
  }, [currentConversationId, user?.id]);

  // ✅ Auto-load conversations when user becomes available
  const loadUserConversations = useCallback(async () => {
    if (!user?.id) {
      console.log('No user available for loading conversations');
      return [];
    }

    try {
      const response = await fetch(`/api/conversations?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to load conversations');
      }
      
      const data = await response.json();
      setConversations(data);
      
      // ✅ Auto-select first conversation if none is selected
      if (data.length > 0 && !currentConversationId) {
        setCurrentConversationId(data[0].id);
        // Load the first conversation automatically
        await loadConversation(data[0].id);
      }
      
      return data;
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations. Please try again.');
      return [];
    }
  }, [user?.id, currentConversationId, loadConversation]);

  // ✅ Auto-load conversations when user is available
  useEffect(() => {
    if (user?.id) {
      loadUserConversations();
    }
  }, [loadUserConversations, user?.id]); // Don't include loadUserConversations to avoid infinite loop


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const saveConversation = useCallback(async (conversationId: string, conversationMessages: Message[]) => {
    try {
      const title = conversationMessages.length > 0 
        ? conversationMessages[0].content.slice(0, 50) + (conversationMessages[0].content.length > 50 ? '...' : '')
        : 'New Conversation';

      await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: conversationId,
          userId: user?.id,
          title,
          messages: conversationMessages,
          updatedAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }, [user?.id]);

  const sendMessage = useCallback(async (content: string, attachments?: Attachment[]) => {
  if (!content.trim() && (!attachments || attachments.length === 0)) {
    return;
  }

  if (!user?.id) {
    setError('User not found. Please refresh the page.');
    return;
  }

  setError(null);
  setIsLoading(true);

  try {
    // If no conversation exists, create one
    let conversationToUse = currentConversationId;
    if (!conversationToUse) {
      conversationToUse = crypto.randomUUID();
      setCurrentConversationId(conversationToUse);
    }

    // ✅ Prepare enhanced content with attachments
    let enhancedContent = content.trim();
    if (attachments && attachments.length > 0) {
      const attachmentDescriptions = attachments.map(att => 
        att.type === 'image' 
          ? `[Image: ${att.name}](${att.url})`
          : `[File: ${att.name}](${att.url})`
      ).join('\n');
      enhancedContent = `${content}\n\n${attachmentDescriptions}`;
    }

    // ✅ Create user message with enhanced content
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: enhancedContent, // Store enhanced content with attachment info
      timestamp: new Date(),
      attachments: attachments || [],
      originalContent: content.trim(), // Store original content separately for UI if needed
    };

    // Add user message to state immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // ✅ Simple API payload - just use the content as is
    const apiMessages = updatedMessages.map(msg => ({
      role: msg.role,
      content: msg.content // Now this includes attachment descriptions
    }));

    console.log('API Messages being sent:', apiMessages);
    console.log('Enhanced content with attachments:', enhancedContent);

    // Direct API call to chat endpoint
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: apiMessages,
        conversationId: conversationToUse,
        userId: user.id,
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    // Get the response text
    const aiResponseText = await response.text();

    // Create AI message
    const aiMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: aiResponseText,
      timestamp: new Date(),
    };

    // Add AI response to messages
    const finalMessages = [...updatedMessages, aiMessage];
    setMessages(finalMessages);

    // Clear input
    setInput('');

    // Save conversation
    if (conversationToUse && user?.id) {
      await saveConversation(conversationToUse, finalMessages);
      await loadUserConversations();
    }

  } catch (error) {
    console.error('Error sending message:', error);
    setError(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
  } finally {
    setIsLoading(false);
  }
}, [user?.id, currentConversationId, messages, saveConversation, loadUserConversations]);

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!newContent.trim()) {
      return;
    }

    setError(null);

    try {
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) return;

      // Remove all messages after the edited message
      const newMessages = messages.slice(0, messageIndex);
      
      // Add the edited message
      const editedMessage: Message = {
        ...messages[messageIndex],
        content: newContent.trim(),
        timestamp: new Date(),
      };
      
      const updatedMessages = [...newMessages, editedMessage];
      setMessages(updatedMessages);

      // Send the edited message to get a new AI response
      await sendMessage(newContent.trim());

    } catch (error) {
      console.error('Error editing message:', error);
      setError('Failed to edit message. Please try again.');
    }
  }, [messages, sendMessage]);

  const createNewConversation = useCallback(async (): Promise<string> => {
    const newId = crypto.randomUUID();
    setCurrentConversationId(newId);
    setMessages([]);
    setInput('');
    setError(null);
    
    // ✅ Refresh conversations list after creating
    await loadUserConversations();
    
    return newId;
  }, [loadUserConversations]);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      if (!user?.id) {
        setError('User not found. Please refresh the page.');
        return;
      }

      const response = await fetch(`/api/conversations/${id}?userId=${user.id}`, {
        method: 'DELETE',
      });

      console.log("response after delete", response);

      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }

      // If we deleted the current conversation, create a new one
      console.log("currentConversationId", currentConversationId);
      console.log("id", id);
      if (id === currentConversationId) {
        await createNewConversation();
      } else {
        // ✅ Just refresh the conversations list
        await loadUserConversations();
      }
      console.log("Deleted conversation with ID:", id);
      console.log("Remaining conversations:", conversations);
      setConversations(conversations.filter(c => c.id !== id));

    } catch (error) {
      console.error('Error deleting conversation:', error);
      setError('Failed to delete conversation. Please try again.');
    }
  }, [user?.id, currentConversationId, conversations, createNewConversation, loadUserConversations]);

  const regenerateResponse = useCallback(async () => {
    if (messages.length === 0) return;

    try {
      setError(null);
      
      // Find the last user message
      let lastUserMessageIndex = -1;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          lastUserMessageIndex = i;
          break;
        }
      }

      if (lastUserMessageIndex === -1) return;

      // Remove all messages after the last user message
      const messagesToKeep = messages.slice(0, lastUserMessageIndex + 1);
      setMessages(messagesToKeep);

      // Re-send the last user message
      const lastUserMessage = messages[lastUserMessageIndex];
      await sendMessage(lastUserMessage.content);

    } catch (error) {
      console.error('Error regenerating response:', error);
      setError('Failed to regenerate response. Please try again.');
    }
  }, [messages, sendMessage]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    input,
    setInput,
    handleInputChange,
    isLoading,
    error,
    sendMessage,
    editMessage,
    createNewConversation,
    loadConversation,
    deleteConversation,
    regenerateResponse,
    clearError,
    currentConversationId, // ✅ Hook manages this state
    conversations, // ✅ Hook manages conversation list
    setConversations,
    loadUserConversations,
  };
}