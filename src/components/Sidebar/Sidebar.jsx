import { useState, useRef, useEffect } from 'react';
import { useConversation } from '../../contexts/ConversationContext';
import './Sidebar.css';

function Sidebar({ isOpen, onToggle }) {
  const { 
    groupedConversations, 
    currentConversationId, 
    createConversation, 
    switchConversation, 
    deleteConversation,
    updateConversation 
  } = useConversation();
  
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const editInputRef = useRef(null);

  // Focus edit input when editing
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleNewChat = () => {
    createConversation();
  };

  const handleRename = (conv) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = () => {
    if (editingId && editTitle.trim()) {
      updateConversation(editingId, { title: editTitle.trim() });
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handlePin = (conv) => {
    updateConversation(conv.id, { isPinned: !conv.isPinned });
  };

  const handleDelete = (conv) => {
    if (window.confirm('Delete this conversation?')) {
      deleteConversation(conv.id);
    }
  };

  // Filter conversations by search
  const filterConversations = (convs) => {
    if (!searchQuery.trim()) return convs;
    const query = searchQuery.toLowerCase();
    return convs.filter(c => c.title.toLowerCase().includes(query));
  };

  const renderConversationItem = (conv) => {
    const isActive = conv.id === currentConversationId;
    const isEditing = conv.id === editingId;

    return (
      <div 
        key={conv.id}
        className={`conversation-item ${isActive ? 'active' : ''}`}
        onClick={() => !isEditing && switchConversation(conv.id)}
      >
        <div className="conversation-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        
        {isEditing ? (
          <input
            ref={editInputRef}
            className="edit-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename();
              if (e.key === 'Escape') handleCancelRename();
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="conversation-title">{conv.title}</span>
        )}
        
        <div className="conversation-actions" onClick={(e) => e.stopPropagation()}>
          <button 
            className="action-btn" 
            onClick={() => handlePin(conv)}
            title={conv.isPinned ? 'Unpin' : 'Pin'}
          >
            <svg viewBox="0 0 24 24" fill={conv.isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M12 2L12 12M8 6L16 6M9 12L9 22L12 19L15 22L15 12" />
            </svg>
          </button>
          <button 
            className="action-btn" 
            onClick={() => handleRename(conv)}
            title="Rename"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button 
            className="action-btn delete" 
            onClick={() => handleDelete(conv)}
            title="Delete"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const renderGroup = (title, convs) => {
    const filtered = filterConversations(convs);
    if (filtered.length === 0) return null;
    
    return (
      <div className="conversation-group" key={title}>
        <div className="group-title">{title}</div>
        {filtered.map(renderConversationItem)}
      </div>
    );
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={onToggle}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        
        {isOpen && (
          <button className="new-chat-btn" onClick={handleNewChat}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>New Chat</span>
          </button>
        )}
      </div>
      
      {isOpen && (
        <>
          <div className="search-container">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="conversations-list">
            {renderGroup('Pinned', groupedConversations.pinned)}
            {renderGroup('Today', groupedConversations.today)}
            {renderGroup('Yesterday', groupedConversations.yesterday)}
            {renderGroup('Last 7 Days', groupedConversations.lastWeek)}
            {renderGroup('Last 30 Days', groupedConversations.lastMonth)}
            {renderGroup('Older', groupedConversations.older)}
            
            {Object.values(groupedConversations).every(g => g.length === 0) && (
              <div className="empty-state">
                <p>No conversations yet</p>
                <p className="hint">Click "New Chat" to start</p>
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

export default Sidebar;
