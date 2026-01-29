/**
 * Storage Service - Backend API Storage
 * 
 * Provides abstraction layer for managing conversations and messages
 * via backend API (JSON file storage, MongoDB-ready).
 * 
 * All functions are async and use fetch to call backend endpoints.
 */

const API_BASE = 'http://localhost:8000';

/**
 * Generate a UUID v4 (for temporary IDs before server assigns one)
 */
function generateTempId() {
  return 'temp-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================================================================
// Conversation Operations
// ============================================================================

/**
 * Get all conversations metadata
 * @returns {Promise<Array>} Array of conversation metadata objects
 */
export async function getConversations() {
  try {
    const response = await fetch(`${API_BASE}/api/conversations`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('getConversations error:', error);
    return [];
  }
}

/**
 * Get a specific conversation with its messages
 * @param {string} id - Conversation ID
 * @returns {Promise<Object|null>} Conversation with messages or null
 */
export async function getConversation(id) {
  try {
    const response = await fetch(`${API_BASE}/api/conversations/${id}`);
    if (!response.ok) return null;
    const data = await response.json();
    // Map _id to id for frontend compatibility
    if (data._id) {
      data.id = data._id;
    }
    if (data.messages) {
      data.messages = data.messages.map(m => ({ ...m, id: m._id || m.id }));
    }
    return data;
  } catch (error) {
    console.error('getConversation error:', error);
    return null;
  }
}

/**
 * Create a new conversation
 * @param {string} title - Optional title (defaults to "New Chat")
 * @returns {Promise<Object>} Created conversation metadata
 */
export async function createConversation(title = 'New Chat') {
  try {
    const response = await fetch(`${API_BASE}/api/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.substring(0, 50) })
    });
    if (!response.ok) throw new Error('Failed to create conversation');
    const data = await response.json();
    return { ...data, id: data._id || data.id };
  } catch (error) {
    console.error('createConversation error:', error);
    // Fallback to local-only conversation
    return {
      id: generateTempId(),
      title: title.substring(0, 50),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      messageCount: 0
    };
  }
}

/**
 * Update conversation metadata
 * @param {string} id - Conversation ID
 * @param {Object} updates - Fields to update (title, isPinned)
 * @returns {Promise<Object|null>} Updated conversation or null
 */
export async function updateConversation(id, updates) {
  try {
    const response = await fetch(`${API_BASE}/api/conversations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) return null;
    const data = await response.json();
    return { ...data, id: data._id || data.id };
  } catch (error) {
    console.error('updateConversation error:', error);
    return null;
  }
}

/**
 * Delete a conversation and its messages
 * @param {string} id - Conversation ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteConversation(id) {
  try {
    const response = await fetch(`${API_BASE}/api/conversations/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  } catch (error) {
    console.error('deleteConversation error:', error);
    return false;
  }
}

// ============================================================================
// Message Operations
// ============================================================================

/**
 * Add a message to a conversation
 * @param {string} conversationId - Conversation ID
 * @param {Object} message - Message object (full data - no truncation)
 * @returns {Promise<Object>} Added message with ID
 */
export async function addMessage(conversationId, message) {
  try {
    const response = await fetch(`${API_BASE}/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    if (!response.ok) throw new Error('Failed to add message');
    const data = await response.json();
    return { ...data, id: data._id || data.id };
  } catch (error) {
    console.error('addMessage error:', error);
    // Return message with temp ID on error
    return {
      ...message,
      id: message.id || generateTempId(),
      timestamp: message.timestamp || new Date().toISOString()
    };
  }
}

/**
 * Update a message in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} messageId - Message ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated message or null
 */
export async function updateMessage(conversationId, messageId, updates) {
  try {
    const response = await fetch(`${API_BASE}/api/conversations/${conversationId}/messages/${messageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) return null;
    const data = await response.json();
    return { ...data, id: data._id || data.id };
  } catch (error) {
    console.error('updateMessage error:', error);
    return null;
  }
}

/**
 * Get all messages for a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Array>} Array of messages
 */
export async function getMessages(conversationId) {
  try {
    const response = await fetch(`${API_BASE}/api/conversations/${conversationId}/messages`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.map(m => ({ ...m, id: m._id || m.id }));
  } catch (error) {
    console.error('getMessages error:', error);
    return [];
  }
}

// ============================================================================
// Current Conversation (localStorage for session only)
// ============================================================================

/**
 * Get current active conversation ID (session-only, uses localStorage)
 * @returns {string|null} Current conversation ID or null
 */
export function getCurrentConversationId() {
  return localStorage.getItem('finance_chatbot_current_conversation_id') || null;
}

/**
 * Set current active conversation ID (session-only, uses localStorage)
 * @param {string|null} id - Conversation ID or null
 */
export function setCurrentConversationId(id) {
  if (id) {
    localStorage.setItem('finance_chatbot_current_conversation_id', id);
  } else {
    localStorage.removeItem('finance_chatbot_current_conversation_id');
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clear all chat data (for debugging)
 * Note: This only affects client-side state, not server storage
 */
export function clearAllData() {
  localStorage.removeItem('finance_chatbot_current_conversation_id');
  console.log('Cleared client-side state. Server data preserved.');
}

/**
 * Get storage stats (placeholder for API-based stats)
 * @returns {Object} Storage stats
 */
export function getStorageStats() {
  return {
    conversationCount: 0,
    totalSizeBytes: 0,
    totalSizeMB: '0.00',
    estimatedLimitMB: 'unlimited (server storage)'
  };
}

/**
 * Group conversations by date for sidebar display
 * @param {Array} conversations - Array of conversation metadata
 * @returns {Object} Grouped conversations
 */
export function groupConversationsByDate(conversations) {
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
    // Map _id to id for frontend compatibility
    const mappedConv = { ...conv, id: conv._id || conv.id };
    
    if (mappedConv.isPinned) {
      groups.pinned.push(mappedConv);
      return;
    }
    
    const date = new Date(mappedConv.updatedAt);
    
    if (date >= today) {
      groups.today.push(mappedConv);
    } else if (date >= yesterday) {
      groups.yesterday.push(mappedConv);
    } else if (date >= lastWeek) {
      groups.lastWeek.push(mappedConv);
    } else if (date >= lastMonth) {
      groups.lastMonth.push(mappedConv);
    } else {
      groups.older.push(mappedConv);
    }
  });
  
  return groups;
}
