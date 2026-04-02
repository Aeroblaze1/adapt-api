import { useEffect, useState } from "react"
import { connectSocket } from "../services/socket"

// Event shape from gateway events.js:
// { apiKey, providerId, timestamp, analysis: { riskScore, anomalyType },
//   decision: { stage, action }, metrics: { ... } }

function riskClass(score) {
  if (score > 0.7) return "risk-high"
  if (score > 0.4) return "risk-medium"
  return "risk-low"
}

function fmtTime(ts) {
  const d = ts ? new Date(ts) : new Date()
  return d.toTimeString().slice(0, 8)
}


export default function LiveFeed({ providerId, apiKey }) {
  const [events, setEvents] = useState([])

  const filteredEvents = events.filter(e => {
  if (apiKey) return e.apiKey === apiKey
  if (providerId) return e.providerId === providerId
  return true
})

  useEffect(() => {
    connectSocket((event) => {
      setEvents(prev => [event, ...prev.slice(0, 50)])
    })
  }, [])

  return (
    <div className="t-panel">
      <div className="t-panel-header">
        <span className="t-panel-icon" style={{ color: "var(--green)" }}>◉</span>
        <h3>Event Stream</h3>
        <span className="t-panel-count" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span className="t-status-dot" />
          live
        </span>
      </div>

      <div className="live-feed-body">
        {filteredEvents.length === 0 && (
          <div className="feed-idle">
            <span className="feed-idle-dot" />
            awaiting events…
          </div>
        )}
        {filteredEvents.map((e, i) => {
          const score = e.analysis?.riskScore 


          return (
            <div key={i} className={`feed-event ${riskClass(score)}`}>
              <span className="fe-ts">[{fmtTime(e.timestamp)}]</span>
              <span className="fe-key">{e.apiKey}</span>
              <span className="fe-arrow">→</span>
              <span className="fe-stage">{e.decision?.stage}</span>
              <span className="fe-risk">{score.toFixed(2)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}