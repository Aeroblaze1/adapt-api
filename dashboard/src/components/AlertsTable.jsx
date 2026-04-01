import { useEffect, useState } from "react"
import { fetchAlerts, fetchRiskHistory } from "../services/api"

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
    // If an API key is selected, derive alerts from its risk history
    // because the backend does not actively populate the alerts collection yet.
    if (apiKey) {
      fetchRiskHistory(apiKey).then(history => {
        const derivedAlerts = history.filter(h => h.riskScore > 0.4)
        setAlerts(derivedAlerts)
      })
    } else if (providerId) {
      // Fallback
      fetchAlerts(providerId).then(setAlerts)
    } else {
      setAlerts([])
    }
  }, [providerId, apiKey])

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
        {alerts.map(a => (
          <div
            key={a.timestamp}
            className={`alert-line ${sevClass(a.riskScore)}`}
          >
            <span className="al-ts">[{fmtTime(a.timestamp)}]</span>
            <span className="al-key">{a.apiKey}</span>
            <span className="al-arrow">→</span>
            <span className="al-type">
  {a.riskScore > 0.7 ? "BLOCK" : "THROTTLE"}
</span>
            <span className="al-risk">({(a.riskScore ?? 0).toFixed(2)})</span>
          </div>
        ))}
      </div>
    </div>
  )
}