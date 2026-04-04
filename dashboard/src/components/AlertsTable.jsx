import { useEffect, useState } from "react"
import { connectSocket } from "../services/socket"


function sevClass(risk) {
  if (risk > 0.7) return "sev-high"
  if (risk > 0.4) return "sev-medium"
  return "sev-low"
}

function fmtTime(ts) {
  if (!ts) return "--:--:--"
  const d = new Date(ts)
  return d.toTimeString().slice(0, 8)
}

export default function AlertsTable({ providerId, apiKey }) {
  const [alerts, setAlerts] = useState([])

useEffect(() => {

  const disconnect = connectSocket((event) => {

    const score = event.analysis?.riskScore ?? 0
    const action = event.decision?.action
    const providerMatch = !providerId || event.providerId === providerId
    const apiKeyMatch = !apiKey || event.apiKey === apiKey

    if (!providerMatch || !apiKeyMatch) return

const isAlert =
  action === "BLOCK" ||
  score > 0.75

    if (!isAlert) return

   const alert = {
  alertId: `${event.apiKey}_${event.timestamp}`,
  apiKey: event.apiKey,
  type: action || "ALERT",
  riskScore: score,
  timestamp: event.timestamp,
  reason: event.enforcement?.reason
}

   setAlerts(prev => {
  const last = prev[0]

  // avoid duplicate spam
  if (
    last &&
    last.apiKey === alert.apiKey &&
    last.type === alert.type &&
    Math.abs(last.riskScore - alert.riskScore) < 0.05
  ) {
    return prev
  }

  return [alert, ...prev.slice(0, 20)]
})
  })

  return () => {
    if (disconnect) disconnect()
  }
}, [providerId, apiKey])

const sortedAlerts = [...alerts].sort((a, b) => b.riskScore - a.riskScore)

  return (
    <div className="t-panel">
      <div className="t-panel-header">
        <span className="t-panel-icon" style={{ color: "var(--red)" }}>⚠</span>
        <h3>Alerts</h3>
        <span className="t-panel-count">{alerts.length}</span>
      </div>

      <div className="alerts-log">
        {!providerId && (
          <div className="t-empty">← select a provider to view alerts</div>
        )}
        {providerId && alerts.length === 0 && (
          <div className="t-empty">no alerts</div>
        )}
        {sortedAlerts.map(a => (
          <div
            key={a.timestamp}
            className={`alert-line ${sevClass(a.riskScore)}`}
          >
            <span className="al-ts">[{fmtTime(a.timestamp)}]</span>
            <span className="al-key">{a.apiKey}</span>
            <span className="al-arrow">→</span>
            <span className="al-type">
              {a.type}
            </span>
            <span className="al-risk">
              ({(a.riskScore ?? 0).toFixed(2)})
              {a.reason && (
  <span style={{ marginLeft: 6, color: "var(--yellow)" }}>
    ({a.reason})
  </span>
)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}