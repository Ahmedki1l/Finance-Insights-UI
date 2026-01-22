import { useState } from 'react'
import ChartRenderer from './ChartRenderer'
import './MessageBubble.css'

function MessageBubble({ message, onDrillDown }) {
  const { role, content, answer, displayedAnswer, chart, table, evidence, isError, isStreaming, isThinking } = message
  const [showEvidence, setShowEvidence] = useState(false)

  // For user messages, use content; for bot messages, use displayedAnswer (animated) or answer
  const displayText = role === 'user' ? content : (displayedAnswer || answer || '')

  // Show cursor when streaming and text is still being animated
  const showCursor = isStreaming && displayedAnswer !== answer

  return (
    <div className={`message ${role} ${isError ? 'error' : ''}`}>
      <div className="message-avatar">
        {role === 'user' ? (
          <div className="avatar user-avatar">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        ) : (
          <div className="avatar bot-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="message-content">
        <div className="message-role">
          {role === 'user' ? 'You' : 'Finance Assistant'}
        </div>
        
        <div className="message-text">
          {/* Thinking indicator with status message */}
          {isThinking && (
            <div className="thinking-indicator">
              {message.statusMessage ? (
                <span className="status-text">{message.statusMessage}</span>
              ) : null}
              <span className="thinking-dot"></span>
              <span className="thinking-dot"></span>
              <span className="thinking-dot"></span>
            </div>
          )}
          
          {/* Message text (only show when not thinking) */}
          {!isThinking && displayText && (
            <p className="typing-text">
              {displayText}
              {showCursor && <span className="typing-cursor"></span>}
            </p>
          )}
        </div>

        {/* Chart Visualization */}
        {chart && !isStreaming && (
          <ChartRenderer 
            chartData={chart} 
            onDrillDown={onDrillDown}
          />
        )}

        {/* Structured Table */}
        {table && !isStreaming && (
          <div className="table-container">
            <div className="table-header-bar">
              <span className="table-title">{table.title}</span>
              <span className="table-count">{table.rows.length} rows</span>
            </div>
            <div className="table-scroll">
              <table className="styled-table">
                <thead className="table-header">
                  <tr>
                    {table.columns.map((col, idx) => (
                      <th key={idx} className="table-header-cell">
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="table-body">
                  {table.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="table-row">
                      {table.columns.map((col, colIdx) => (
                        <td key={colIdx} className="table-cell">
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Evidence Section */}
        {evidence && !isStreaming && (
          <div className="evidence-section">
            <button 
              className="evidence-toggle"
              onClick={() => setShowEvidence(!showEvidence)}
            >
              <svg 
                className={`evidence-arrow ${showEvidence ? 'open' : ''}`}
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
              </svg>
              Show SQL Query
            </button>
            {showEvidence && (
              <div className="evidence-content">
                <code>{evidence.sql}</code>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageBubble
