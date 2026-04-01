import { useEffect, useState } from "react"
import { fetchProviders } from "../services/api"

export default function ProviderList({ onSelect, activeId }) {
  const [providers, setProviders] = useState([])

  useEffect(() => {
    fetchProviders().then(setProviders)
  }, [])

  return (
    <div className="t-panel">
      <div className="t-panel-header">
        <span className="t-panel-icon">◈</span>
        <h3>Providers</h3>
        <span className="t-panel-count">{providers.length}</span>
      </div>
      <div className="t-panel-body">
        {providers.length === 0 && (
          <div className="t-empty">no providers found</div>
        )}
        {providers.map(p => (
          <div
            key={p._id}
            className={`provider-item ${activeId === p._id ? "active" : ""}`}
            onClick={() => onSelect(p._id, p.name)}
          >
            <span className="p-arrow">›</span>
            <span className="p-name">{p.name}</span>
            <span className="p-rate">{p.plan?.baselinePerMinute}/m</span>
          </div>
        ))}
      </div>
    </div>
  )
}