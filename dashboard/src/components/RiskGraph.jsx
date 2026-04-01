import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"
import { fetchRiskHistory } from "../services/api"

export default function RiskGraph({ apiKey }) {
  const [data, setData] = useState([])

  useEffect(() => {
    if (!apiKey) return
    fetchRiskHistory(apiKey).then(raw => {
      // Reverse so oldest is on the left, newest on the right
      const sorted = [...raw].reverse().map((d, i) => ({
        ...d,
        id: i, // Ensures unique XAxis keys even for simultaneous hits
        riskScore: d.riskScore ?? 0,
        time: d.timestamp ? new Date(d.timestamp).toTimeString().slice(0, 8) : ""
      }))
      setData(sorted)
    })
  }, [apiKey])

const latest = data.length ? data[data.length - 1].riskScore : null

let trend = "→ stable"

if (data.length >= 2) {
  const last = data[data.length - 1].riskScore
  const prev = data[data.length - 2].riskScore

  if (last > prev) trend = "↑ increasing"
  else if (last < prev) trend = "↓ decreasing"
}

  return (
    <div className="t-panel" style={{ flex: "none", borderBottom: "1px solid var(--border)" }}>
      <div className="t-panel-header">
        <span className="t-panel-icon" style={{ color: "var(--yellow)" }}>▲</span>
        <h3>Risk Score</h3>
      </div>

      <div className="risk-summary">
        <div className="risk-stat">
          <span className="rs-label">risk</span>
          <span className="rs-value" style={{ color: latest > 0.7 ? "var(--red)" : "var(--green)" }}>
            {latest !== null ? latest.toFixed(4) : "no data"}
          </span>
        </div>
        <div className="risk-stat">
          <span className="rs-label">trend</span>
          <span className="rs-value rs-low" style={{ fontSize: 12 }}>
  {trend}
</span>
        </div>
        <div className="risk-stat">
          <span className="rs-label">samples</span>
          <span className="rs-value" style={{ fontSize: 12, color: "var(--text)" }}>{data.length}</span>
        </div>
      </div>

      {/* FIXED HEIGHT BUG: Explicit height wrapper to prevent flex-collapse */}
      <div style={{ width: "100%", height: 200, padding: "10px 0" }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
              <XAxis dataKey="id" hide />
              <YAxis domain={[0, 1]} tick={{ fill: "var(--text-dim)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip 
                labelFormatter={(l, p) => p.length ? p[0].payload.time : l}
                contentStyle={{ background: "#0f0f0f", border: "1px solid #1e1e1e", color: "#00ff88", fontSize: "11px" }}
              />
              <Line 
                type="monotone" 
                dataKey="riskScore" 
                stroke="#00ff88" 
                strokeWidth={2} 
                dot={false}
                isAnimationActive={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: "center", color: "var(--text-dim)", marginTop: 80, fontSize: 12 }}>
            {apiKey ? "Loading..." : "Select an API Key"}
          </div>
        )}
      </div>
    </div>
  )
}