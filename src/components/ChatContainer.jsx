import { useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import './ChatContainer.css'

function ChatContainer({ messages, onDrillDown }) {
  const containerRef = useRef(null)
  const bottomRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <div className="chat-container" ref={containerRef}>
      <div className="messages-wrapper">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} onDrillDown={onDrillDown} />
        ))}
        
        <div ref={bottomRef} className="scroll-anchor" />
      </div>
    </div>
  )
}

export default ChatContainer
