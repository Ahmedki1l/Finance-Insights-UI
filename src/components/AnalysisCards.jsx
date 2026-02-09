import './AnalysisCards.css'

/**
 * Color mapping for severity/priority badges
 */
const SEVERITY_CONFIG = {
  high: { className: 'severity-high', label: 'HIGH RISK' },
  medium: { className: 'severity-medium', label: 'MEDIUM' },
  low: { className: 'severity-low', label: 'LOW' }
}

const PRIORITY_CONFIG = {
  high: { className: 'priority-high', label: 'HIGH PRIORITY' },
  medium: { className: 'priority-medium', label: 'MEDIUM' },
  low: { className: 'priority-low', label: 'LOW' }
}

const IMPORTANCE_CONFIG = {
  high: 'fact-high',
  medium: 'fact-medium',
  low: 'fact-low'
}

/**
 * Executive Snapshot — prominent summary banner
 */
function ExecutiveSnapshot({ text }) {
  if (!text) return null
  return (
    <div className="exec-snapshot">
      <div className="exec-snapshot-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <p className="exec-snapshot-text">{text}</p>
    </div>
  )
}

/**
 * Key Facts Grid — compact stat tiles
 */
function KeyFactsGrid({ facts }) {
  if (!facts || facts.length === 0) return null
  return (
    <div className="key-facts-grid">
      {facts.map((fact, idx) => (
        <div key={idx} className={`fact-tile ${IMPORTANCE_CONFIG[fact.importance] || 'fact-medium'}`}>
          <span className="fact-label">{fact.label}</span>
          <span className="fact-value">{fact.value}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Risk Cards — color-coded by severity
 */
function RiskCards({ risks }) {
  if (!risks || risks.length === 0) return null
  return (
    <div className="analysis-section">
      <h4 className="section-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        Risks
      </h4>
      <div className="cards-row">
        {risks.map((risk, idx) => {
          const config = SEVERITY_CONFIG[risk.severity] || SEVERITY_CONFIG.medium
          return (
            <div key={idx} className={`analysis-card ${config.className}`}>
              <div className="card-header">
                <span className={`card-badge ${config.className}`}>{config.label}</span>
              </div>
              <h5 className="card-title">{risk.title}</h5>
              <p className="card-text">{risk.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Recommendation Cards — color-coded by priority
 */
function RecommendationCards({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null
  return (
    <div className="analysis-section">
      <h4 className="section-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
        Recommendations
      </h4>
      <div className="cards-row">
        {recommendations.map((rec, idx) => {
          const config = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.medium
          return (
            <div key={idx} className={`analysis-card ${config.className}`}>
              <div className="card-header">
                <span className={`card-badge ${config.className}`}>{config.label}</span>
              </div>
              <h5 className="card-title">{rec.title}</h5>
              <p className="card-text">{rec.action}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Data Notes — info section for caveats
 */
function DataNotes({ notes }) {
  if (!notes || notes.length === 0) return null
  return (
    <div className="data-notes">
      <div className="data-notes-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>Data Notes</span>
      </div>
      <ul className="data-notes-list">
        {notes.map((note, idx) => (
          <li key={idx}>{note}</li>
        ))}
      </ul>
    </div>
  )
}

/**
 * AnalysisCards — main component rendering structured analysis JSON
 */
function AnalysisCards({ data }) {
  if (!data) return null

  return (
    <div className="analysis-cards-container">
      <ExecutiveSnapshot text={data.executive_snapshot} />
      <KeyFactsGrid facts={data.key_facts} />
      <RiskCards risks={data.risks} />
      <RecommendationCards recommendations={data.recommendations} />
      <DataNotes notes={data.data_notes} />
    </div>
  )
}

export default AnalysisCards
