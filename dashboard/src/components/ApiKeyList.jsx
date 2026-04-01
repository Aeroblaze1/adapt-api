import { useEffect, useState } from "react"
import { fetchApiKeys } from "../services/api"

export default function ApiKeyList({ providerId, onSelect, activeKey }) {
  const [keys, setKeys] = useState([])

  useEffect(() => {
    if (!providerId) return
    fetchApiKeys(providerId).then(setKeys)
  }, [providerId])

  return (
    <div className="t-panel">
      <div className="t-panel-header">
        <span className="t-panel-icon">⬡</span>
        <h3>API Keys</h3>
        <span className="t-panel-count">{keys.length}</span>
      </div>
      <div className="t-panel-body">
        {!providerId && (
          <div className="t-empty">← select a provider</div>
        )}
        {providerId && keys.length === 0 && (
          <div className="t-empty">no keys found</div>
        )}
        {keys.map(k => (
          <div
            key={k._id}
            className={`apikey-item ${activeKey === k._id ? "active" : ""}`}
            onClick={() => onSelect(k._id)}
          >
            <span className="k-arrow">›</span>
            <span className="k-id">{k._id}</span>
            <span className="k-baseline">[{k.expectedBaseline}]</span>
          </div>
        ))}
      </div>
    </div>
  )
}