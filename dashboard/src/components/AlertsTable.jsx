import { useEffect, useState } from "react"
import { fetchAlerts } from "../services/api"

export default function AlertsTable({ providerId }) {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    if (!providerId) return
    fetchAlerts(providerId).then(setAlerts)
  }, [providerId])

  return (
    <div>
      <h3>Alerts</h3>
      <table>
        <thead>
          <tr>
            <th>API Key</th>
            <th>Type</th>
            <th>Risk</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map(a => (
            <tr key={a.alertId}>
              <td>{a.apiKey}</td>
              <td>{a.type}</td>
              <td>{a.riskScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}