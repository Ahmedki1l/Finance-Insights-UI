import { useState, useRef, useEffect } from 'react'
import './ChatInput.css'

function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [value])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value.trim() && !disabled) {
      onSend(value)
      setValue('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="chat-input-wrapper">
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <div className="input-container">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            disabled={disabled}
            rows={1}
          />
          <button
            type="submit"
            className={`send-button ${value.trim() && !disabled ? 'active' : ''}`}
            disabled={!value.trim() || disabled}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <p className="input-hint">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  )
}

export default ChatInput
