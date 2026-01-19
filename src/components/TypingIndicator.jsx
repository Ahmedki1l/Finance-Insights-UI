import './TypingIndicator.css'

function TypingIndicator() {
  return (
    <div className="message bot">
      <div className="message-avatar">
        <div className="avatar bot-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
      </div>
      
      <div className="message-content">
        <div className="message-role">Finance Assistant</div>
        <div className="typing-indicator">
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator
