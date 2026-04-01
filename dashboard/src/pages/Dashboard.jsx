import { useState } from "react"
import ProviderList from "../components/ProviderList"
import ApiKeyList from "../components/ApiKeyList"
import RiskGraph from "../components/RiskGraph"
import AlertsTable from "../components/AlertsTable"
import LiveFeed from "../components/LiveFeed"
import CommandBar from "../components/CommandBar"

export default function Dashboard() {
  const [providerId, setProviderId]   = useState(null)
  const [providerName, setProviderName] = useState(null)
  const [apiKey, setApiKey]           = useState(null)

  function selectProvider(id, name) {
    setProviderId(id)
    setProviderName(name)
    setApiKey(null)   // reset key when provider changes
  }

  return (
    <div className="terminal-container">

      {/* ── Top Bar ─────────────────────────────────── */}
      <div className="terminal-topbar">
        <div className="t-dots">
          <span className="t-dot-red" />
          <span className="t-dot-yellow" />
          <span className="t-dot-green" />
        </div>
        <span className="t-title">adapt-api // control console</span>
        <div className="t-status">
          <span className="t-status-dot" />
          connected
        </div>
      </div>

      {/* ── Status Bar ──────────────────────────────── */}
      <div className="terminal-statusbar">
        <div className="t-stat">
          <span className="t-label">provider:</span>
          <span className={`t-value ${!providerName ? "none" : ""}`}>
            {providerName ?? "none"}
          </span>
        </div>
        <div className="t-stat">
          <span className="t-label">apiKey:</span>
          <span className={`t-value ${!apiKey ? "none" : ""}`}>
            {apiKey ?? "none"}
          </span>
        </div>
        <div className="t-stat" style={{ marginLeft: "auto" }}>
          <span className="t-label">time:</span>
          <span className="t-value">{new Date().toTimeString().slice(0, 8)}</span>
        </div>
      </div>

      {/* ── Main Body ───────────────────────────────── */}
      <div className="terminal-body">

        {/* Left: providers + api keys stacked */}
        <div className="terminal-sidebar">
          <ProviderList
            onSelect={selectProvider}
            activeId={providerId}
          />
          <div style={{ borderTop: "1px solid var(--border)", flex: 1, display: "flex", flexDirection: "column" }}>
            <ApiKeyList
              providerId={providerId}
              onSelect={setApiKey}
              activeKey={apiKey}
            />
          </div>
        </div>

        {/* Center: risk graph + alerts */}
        <div className="terminal-center">
          <RiskGraph apiKey={apiKey} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <AlertsTable providerId={providerId} apiKey={apiKey} />
          </div>
        </div>

        {/* Right: live feed */}
        <div className="terminal-right">
          <LiveFeed />
        </div>

      </div>

      {/* ── Command Bar ─────────────────────────────── */}
      <CommandBar />

    </div>
  )
}