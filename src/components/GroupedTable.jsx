import { useState } from 'react';
import './GroupedTable.css';

/**
 * GroupedTable Component
 * Renders data grouped by a key column with collapsible sections
 * 
 * Props:
 *   - groupedData: { groupKey: string, summary: object, rows: array }[]
 *   - columns: string[] - columns to display in detail rows
 *   - summaryColumns: string[] - columns to display in summary row
 *   - title: string - table title
 */
function GroupedTable({ groupedData, columns, summaryColumns, title, groupKeyLabel }) {
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Defensive check - return null if no data
  if (!groupedData || groupedData.length === 0) {
    return <div className="grouped-table-container"><p>No groups to display</p></div>;
  }

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedGroups(new Set(groupedData.map(g => g.groupKey)));
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  // Format numeric values
  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return value || 'N/A';
  };

  return (
    <div className="grouped-table-container">
      <div className="grouped-table-header">
        <span className="grouped-table-title">{title || 'Results'}</span>
        <div className="grouped-table-controls">
          <button className="expand-btn" onClick={expandAll}>Expand All</button>
          <button className="collapse-btn" onClick={collapseAll}>Collapse All</button>
          <span className="group-count">{groupedData.length} groups</span>
        </div>
      </div>

      <div className="grouped-table-scroll">
        {groupedData.map((group, groupIdx) => {
          const isExpanded = expandedGroups.has(group.groupKey);
          
          return (
            <div key={groupIdx} className={`table-group ${isExpanded ? 'expanded' : ''}`}>
              {/* Group Header - Clickable to expand/collapse */}
              <div 
                className="group-header" 
                onClick={() => toggleGroup(group.groupKey)}
              >
                <div className="group-expander">
                  <svg 
                    className={`expander-icon ${isExpanded ? 'open' : ''}`}
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                  </svg>
                </div>
                <div className="group-key">
                  <span className="group-key-label">{groupKeyLabel || 'Company'}:</span>
                  <span className="group-key-value">{group.groupKey}</span>
                </div>
                {/* Summary values in header */}
                <div className="group-summary">
                  {summaryColumns && summaryColumns.map((col, idx) => (
                    <span key={idx} className="summary-item">
                      <span className="summary-label">{col.replace(/_/g, ' ')}:</span>
                      <span className="summary-value">{formatValue(group.summary[col])}</span>
                    </span>
                  ))}
                </div>
                <span className="row-count">{group.rows.length} facilities</span>
              </div>

              {/* Expanded Detail Table */}
              {isExpanded && (
                <div className="group-details">
                  <table className="detail-table">
                    <thead>
                      <tr>
                        {columns.map((col, idx) => (
                          <th key={idx}>{col.replace(/_/g, ' ')}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {group.rows.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {columns.map((col, colIdx) => (
                            <td key={colIdx}>{formatValue(row[col])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GroupedTable;
