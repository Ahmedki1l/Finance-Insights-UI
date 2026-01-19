import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as storage from '../services/storageService';

const ConversationContext = createContext(null);

export function ConversationProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load conversations on mount
  useEffect(() => {
    const loadedConversations = storage.getConversations() || [];
    setConversations(loadedConversations);
    
    // Restore current conversation
    const currentId = storage.getCurrentConversationId();
    if (currentId && loadedConversations.find(c => c.id === currentId)) {
      setCurrentConversationId(currentId);
      const conv = storage.getConversation(currentId);
      if (conv && conv.messages) {
        setMessages(conv.messages);
      }
    }
    
    setIsLoading(false);
  }, []);

  // Create a new conversation
  const createConversation = useCallback((title = 'New Chat') => {
    const newConv = storage.createConversation(title);
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
    
    storage.addMessage(newConv.id, welcomeMessage);
    setMessages([welcomeMessage]);
    
    return newConv;
  }, []);

  // Switch to a different conversation
  const switchConversation = useCallback((id) => {
    if (id === currentConversationId) return;
    
    const conv = storage.getConversation(id);
    if (conv) {
      setCurrentConversationId(id);
      storage.setCurrentConversationId(id);
      setMessages(conv.messages);
    }
  }, [currentConversationId]);

  // Delete a conversation
  const deleteConversation = useCallback((id) => {
    storage.deleteConversation(id);
    setConversations(prev => (prev || []).filter(c => c.id !== id));
    
    // If deleted current, switch to first available or create new
    if (id === currentConversationId) {
      const remaining = conversations.filter(c => c.id !== id);
      if (remaining.length > 0) {
        switchConversation(remaining[0].id);
      } else {
        setCurrentConversationId(null);
        setMessages([]);
      }
    }
  }, [currentConversationId, conversations, switchConversation]);

  // Update conversation metadata
  const updateConversation = useCallback((id, updates) => {
    const updated = storage.updateConversation(id, updates);
    if (updated) {
      setConversations(prev => (prev || []).map(c => c.id === id ? updated : c));
    }
    return updated;
  }, []);

  // Add message to current conversation
  const addMessage = useCallback((message) => {
    if (!currentConversationId) {
      // Auto-create conversation on first message
      const newConv = createConversation('New Chat');
      storage.addMessage(newConv.id, message);
      setMessages(prev => [...(prev || []), message]);
      
      // Update conversations list with new title if user message
      if (message.role === 'user' && message.content) {
        setConversations(storage.getConversations() || []);
      }
    } else {
      storage.addMessage(currentConversationId, message);
      setMessages(prev => [...prev, message]);
      
      // Update conversations list (for message count and title)
      if (message.role === 'user' && message.content) {
        setConversations(storage.getConversations());
      }
    }
  }, [currentConversationId, createConversation]);

  // Update message in current conversation
  const updateMessage = useCallback((messageId, updates) => {
    if (currentConversationId) {
      storage.updateMessage(currentConversationId, messageId, updates);
    }
    setMessages(prev => (prev || []).map(m => m.id === messageId ? { ...m, ...updates } : m));
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
    createConversation,
    switchConversation,
    deleteConversation,
    updateConversation,
    addMessage,
    updateMessage,
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
