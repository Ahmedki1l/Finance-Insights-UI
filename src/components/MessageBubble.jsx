import { useState } from 'react'
import ChartRenderer from './ChartRenderer'
import GroupedTable from './GroupedTable'
import './MessageBubble.css'

const ROWS_PER_PAGE = 10;

/**
 * PaginatedTable - Client-side pagination for flat table data
 */
function PaginatedTable({ table }) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalRows = table.rows.length;
  const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE);
  
  // Get current page rows
  const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
  const endIdx = startIdx + ROWS_PER_PAGE;
  const currentRows = table.rows.slice(startIdx, endIdx);
  
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="table-container">
      <div className="table-header-bar">
        <span className="table-title">{table.title}</span>
        <span className="table-count">{totalRows} rows</span>
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
            {currentRows.map((row, rowIdx) => (
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
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button 
            className="pagination-btn"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            title="First page"
          >
            ««
          </button>
          <button 
            className="pagination-btn"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹ Prev
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className="pagination-btn"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next ›
          </button>
          <button 
            className="pagination-btn"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            title="Last page"
          >
            »»
          </button>
          <div className="page-jump">
            <span>Go to</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              className="page-input"
              placeholder="#"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const page = parseInt(e.target.value, 10);
                  if (page >= 1 && page <= totalPages) {
                    goToPage(page);
                    e.target.value = '';
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message, onDrillDown }) {
  const { role, content, answer, displayedAnswer, chart, table, evidence, isError, isStreaming, isThinking } = message
  const [showEvidence, setShowEvidence] = useState(false)

  // For user messages, use content; for bot messages, use final answer directly (no streaming animation)
  const displayText = role === 'user' ? content : (answer || '')

  // Streaming cursor disabled
  const showCursor = false

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

        {/* Structured Table - supports both flat and grouped modes */}
        {table && (
          <>
            {table.isGrouped ? (
              <GroupedTable 
                groupedData={table.groupedData}
                columns={table.columns}
                summaryColumns={table.summaryColumns}
                title={table.title}
                groupKeyLabel={table.groupKeyLabel}
              />
            ) : table.rows && (
            <PaginatedTable table={table} />
            )}
          </>
        )}

        {/* Evidence Section - Removed */}
      </div>
    </div>
  )
}

export default MessageBubble
