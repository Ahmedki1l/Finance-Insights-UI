import { useState } from 'react';
import { useConversation } from '../../contexts/ConversationContext';
import './Header.css';

function Header({ onToggleSidebar, isSidebarOpen }) {
  const { currentConversationId, conversations, updateConversation } = useConversation();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  
  const currentConversation = conversations?.find(c => c.id === currentConversationId) || null;
  const title = currentConversation?.title || 'Finance Chatbot';

  const handleTitleClick = () => {
    if (currentConversation) {
      setEditedTitle(title);
      setIsEditingTitle(true);
    }
  };

  const handleTitleSave = () => {
    if (editedTitle.trim() && currentConversationId) {
      updateConversation(currentConversationId, { title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleExport = () => {
    if (!currentConversation) return;
    
    const { messages } = currentConversation;
    const exportData = {
      title,
      exportedAt: new Date().toISOString(),
      messages: messages?.map(m => ({
        role: m.role,
        content: m.content || m.answer,
        timestamp: m.timestamp
      })) || []
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {!isSidebarOpen && (
          <button className="menu-btn" onClick={onToggleSidebar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        )}
        
        <div className="logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
      </div>

      <div className="header-center">
        {isEditingTitle ? (
          <input
            className="title-input"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSave();
              if (e.key === 'Escape') setIsEditingTitle(false);
            }}
            autoFocus
          />
        ) : (
          <h1 
            className={`header-title ${currentConversation ? 'editable' : ''}`}
            onClick={handleTitleClick}
            title={currentConversation ? 'Click to rename' : ''}
          >
            {title}
            {currentConversation && (
              <svg className="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            )}
          </h1>
        )}
      </div>

      <div className="header-right">
        {currentConversation && (
          <button className="header-btn" onClick={handleExport} title="Export conversation">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
