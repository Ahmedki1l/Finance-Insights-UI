/**
 * LocalStorage Service for Chat History Management
 * 
 * Provides abstraction layer over localStorage for managing
 * conversations and messages in the Finance Chatbot PoC.
 */

// Storage keys
const STORAGE_KEYS = {
  CONVERSATIONS: 'finance_chatbot_conversations',
  CURRENT_CONVERSATION: 'finance_chatbot_current_conversation_id',
  CONVERSATION_PREFIX: 'finance_chatbot_conversation_'
};

/**
 * Generate a UUID v4
 */
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Safe JSON parse with fallback
 */
function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

/**
 * Get all conversations metadata
 * @returns {Array} Array of conversation metadata objects
 */
export function getConversations() {
  const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
  return safeJsonParse(data, []);
}

/**
 * Get a specific conversation with its messages
 * @param {string} id - Conversation ID
 * @returns {Object|null} Conversation with messages or null
 */
export function getConversation(id) {
  const conversations = getConversations();
  const metadata = conversations.find(c => c.id === id);
  
  if (!metadata) return null;
  
  const messagesKey = STORAGE_KEYS.CONVERSATION_PREFIX + id;
  const messages = safeJsonParse(localStorage.getItem(messagesKey), []);
  
  return {
    ...metadata,
    messages
  };
}

/**
 * Create a new conversation
 * @param {string} title - Optional title (defaults to "New Chat")
 * @returns {Object} Created conversation metadata
 */
export function createConversation(title = 'New Chat') {
  const conversations = getConversations() || [];
  
  const newConversation = {
    id: generateId(),
    title: title.substring(0, 50), // Limit title length
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPinned: false,
    messageCount: 0
  };
  
  // Add to beginning of list (most recent first)
  conversations.unshift(newConversation);
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  
  // Initialize empty messages array
  localStorage.setItem(
    STORAGE_KEYS.CONVERSATION_PREFIX + newConversation.id, 
    JSON.stringify([])
  );
  
  return newConversation;
}

/**
 * Update conversation metadata
 * @param {string} id - Conversation ID
 * @param {Object} updates - Fields to update (title, isPinned)
 * @returns {Object|null} Updated conversation or null
 */
export function updateConversation(id, updates) {
  const conversations = getConversations() || [];
  const index = conversations.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  const updated = {
    ...conversations[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  conversations[index] = updated;
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  
  return updated;
}

/**
 * Delete a conversation and its messages
 * @param {string} id - Conversation ID
 * @returns {boolean} Success status
 */
export function deleteConversation(id) {
  const conversations = getConversations() || [];
  const filtered = conversations.filter(c => c.id !== id);
  
  if (filtered.length === conversations.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(filtered));
  localStorage.removeItem(STORAGE_KEYS.CONVERSATION_PREFIX + id);
  
  // Clear current if it was the deleted one
  if (getCurrentConversationId() === id) {
    setCurrentConversationId(null);
  }
  
  return true;
}

/**
 * Add a message to a conversation
 * @param {string} conversationId - Conversation ID
 * @param {Object} message - Message object
 * @returns {Object} Added message with ID
 */
export function addMessage(conversationId, message) {
  const messagesKey = STORAGE_KEYS.CONVERSATION_PREFIX + conversationId;
  const messages = safeJsonParse(localStorage.getItem(messagesKey), []);
  
  const newMessage = {
    ...message,
    id: message.id || generateId(),
    timestamp: message.timestamp || new Date().toISOString()
  };
  
  messages.push(newMessage);
  localStorage.setItem(messagesKey, JSON.stringify(messages));
  
  // Update conversation metadata
  const conversations = getConversations() || [];
  const convIndex = conversations.findIndex(c => c.id === conversationId);
  
  if (convIndex !== -1) {
    conversations[convIndex].messageCount = messages.length;
    conversations[convIndex].updatedAt = new Date().toISOString();
    
    // Auto-generate title from first user message if still "New Chat"
    if (conversations[convIndex].title === 'New Chat' && message.role === 'user' && message.content) {
      conversations[convIndex].title = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');
    }
    
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  }
  
  return newMessage;
}

/**
 * Update a message in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} messageId - Message ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated message or null
 */
export function updateMessage(conversationId, messageId, updates) {
  const messagesKey = STORAGE_KEYS.CONVERSATION_PREFIX + conversationId;
  const messages = safeJsonParse(localStorage.getItem(messagesKey), []);
  
  const index = messages.findIndex(m => m.id === messageId);
  if (index === -1) return null;
  
  messages[index] = { ...messages[index], ...updates };
  localStorage.setItem(messagesKey, JSON.stringify(messages));
  
  return messages[index];
}

/**
 * Get all messages for a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Array} Array of messages
 */
export function getMessages(conversationId) {
  const messagesKey = STORAGE_KEYS.CONVERSATION_PREFIX + conversationId;
  return safeJsonParse(localStorage.getItem(messagesKey), []);
}

/**
 * Get current active conversation ID
 * @returns {string|null} Current conversation ID or null
 */
export function getCurrentConversationId() {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION) || null;
}

/**
 * Set current active conversation ID
 * @param {string|null} id - Conversation ID or null
 */
export function setCurrentConversationId(id) {
  if (id) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION, id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION);
  }
}

/**
 * Clear all chat data from localStorage
 */
export function clearAllData() {
  const conversations = getConversations();
  
  // Remove all conversation messages
  conversations.forEach(c => {
    localStorage.removeItem(STORAGE_KEYS.CONVERSATION_PREFIX + c.id);
  });
  
  // Remove conversations list and current ID
  localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION);
}

/**
 * Get localStorage usage stats
 * @returns {Object} Storage stats
 */
export function getStorageStats() {
  let totalSize = 0;
  
  for (let key in localStorage) {
    if (key.startsWith('finance_chatbot_')) {
      totalSize += localStorage.getItem(key).length * 2; // UTF-16 = 2 bytes per char
    }
  }
  
  const conversations = getConversations();
  
  return {
    conversationCount: conversations.length,
    totalSizeBytes: totalSize,
    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    estimatedLimitMB: 5 // Conservative estimate
  };
}

/**
 * Group conversations by date for sidebar display
 * @param {Array} conversations - Array of conversation metadata
 * @returns {Object} Grouped conversations
 */
export function groupConversationsByDate(conversations) {
  // Handle null/undefined input
  if (!conversations || !Array.isArray(conversations)) {
    return {
      pinned: [],
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: []
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setDate(lastMonth.getDate() - 30);
  
  const groups = {
    pinned: [],
    today: [],
    yesterday: [],
    lastWeek: [],
    lastMonth: [],
    older: []
  };
  
  conversations.forEach(conv => {
    if (conv.isPinned) {
      groups.pinned.push(conv);
      return;
    }
    
    const date = new Date(conv.updatedAt);
    
    if (date >= today) {
      groups.today.push(conv);
    } else if (date >= yesterday) {
      groups.yesterday.push(conv);
    } else if (date >= lastWeek) {
      groups.lastWeek.push(conv);
    } else if (date >= lastMonth) {
      groups.lastMonth.push(conv);
    } else {
      groups.older.push(conv);
    }
  });
  
  return groups;
}
