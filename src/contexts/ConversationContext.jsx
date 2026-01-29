import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as storage from '../services/storageService';

const ConversationContext = createContext(null);

export function ConversationProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load conversations on mount (async)
  useEffect(() => {
    async function loadData() {
      try {
        const loadedConversations = await storage.getConversations() || [];
        setConversations(loadedConversations);
        
        // Restore current conversation
        const currentId = storage.getCurrentConversationId();
        if (currentId) {
          const hasConv = loadedConversations.find(c => c.id === currentId || c._id === currentId);
          if (hasConv) {
            setCurrentConversationId(currentId);
            const conv = await storage.getConversation(currentId);
            if (conv && conv.messages) {
              setMessages(conv.messages);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Create a new conversation (async)
  const createNewConversation = useCallback(async (title = 'New Chat') => {
    try {
      const newConv = await storage.createConversation(title);
      setConversations(prev => [newConv, ...(prev || [])]);
      setCurrentConversationId(newConv.id);
      storage.setCurrentConversationId(newConv.id);
      
      // Set welcome message for new conversation
      const welcomeMessage = {
        id: 'welcome',
        role: 'bot',
        answer: "Hello! I'm your intelligent financial assistant. I can help you query financial data and loans information. How can I help you today?",
        displayedAnswer: "Hello! I'm your intelligent financial assistant. I can help you query financial data and loans information. How can I help you today?",
        chart: null,
        table: null,
        evidence: null,
        isStreaming: false,
        isThinking: false,
        timestamp: new Date().toISOString()
      };
      
      await storage.addMessage(newConv.id, welcomeMessage);
      setMessages([welcomeMessage]);
      
      return newConv;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }
  }, []);

  // Switch to a different conversation (async)
  const switchConversation = useCallback(async (id) => {
    if (id === currentConversationId) return;
    
    try {
      const conv = await storage.getConversation(id);
      if (conv) {
        setCurrentConversationId(id);
        storage.setCurrentConversationId(id);
        setMessages(conv.messages || []);
      }
    } catch (error) {
      console.error('Failed to switch conversation:', error);
    }
  }, [currentConversationId]);

  // Delete a conversation (async)
  const deleteConversationHandler = useCallback(async (id) => {
    try {
      await storage.deleteConversation(id);
      setConversations(prev => (prev || []).filter(c => c.id !== id));
      
      // If deleted current, switch to first available or clear
      if (id === currentConversationId) {
        const remaining = conversations.filter(c => c.id !== id);
        if (remaining.length > 0) {
          await switchConversation(remaining[0].id);
        } else {
          setCurrentConversationId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  }, [currentConversationId, conversations, switchConversation]);

  // Update conversation metadata (async)
  const updateConversationHandler = useCallback(async (id, updates) => {
    try {
      const updated = await storage.updateConversation(id, updates);
      if (updated) {
        setConversations(prev => (prev || []).map(c => c.id === id ? { ...c, ...updated } : c));
      }
      return updated;
    } catch (error) {
      console.error('Failed to update conversation:', error);
      return null;
    }
  }, []);

  // Add message to current conversation (async)
  const addMessage = useCallback(async (message) => {
    let convId = currentConversationId;
    
    if (!convId) {
      // Auto-create conversation on first message
      const newConv = await createNewConversation('New Chat');
      if (!newConv) return;
      convId = newConv.id;
    }
    
    try {
      // Add to backend
      await storage.addMessage(convId, message);
      
      // Update local state
      setMessages(prev => [...(prev || []), message]);
      
      // Refresh conversations list (for message count and title updates)
      if (message.role === 'user' && message.content) {
        const updatedConversations = await storage.getConversations();
        setConversations(updatedConversations || []);
      }
    } catch (error) {
      console.error('Failed to add message:', error);
      // Still add to local state
      setMessages(prev => [...(prev || []), message]);
    }
  }, [currentConversationId, createNewConversation]);

  // Update message in current conversation (async)
  const updateMessageHandler = useCallback(async (messageId, updates) => {
    // Update local state immediately
    setMessages(prev => (prev || []).map(m => m.id === messageId ? { ...m, ...updates } : m));
    
    // Then persist to backend
    if (currentConversationId) {
      try {
        await storage.updateMessage(currentConversationId, messageId, updates);
      } catch (error) {
        console.error('Failed to update message:', error);
      }
    }
  }, [currentConversationId]);

  // Set all messages (for complete replacement)
  const setMessagesWithStorage = useCallback((newMessages) => {
    setMessages(newMessages);
    // Storage is updated via addMessage/updateMessage
  }, []);

  // Get grouped conversations for sidebar
  const groupedConversations = storage.groupConversationsByDate(conversations);

  const value = {
    conversations,
    groupedConversations,
    currentConversationId,
    messages,
    isLoading,
    createConversation: createNewConversation,
    switchConversation,
    deleteConversation: deleteConversationHandler,
    updateConversation: updateConversationHandler,
    addMessage,
    updateMessage: updateMessageHandler,
    setMessages: setMessagesWithStorage
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
}

export default ConversationContext;
