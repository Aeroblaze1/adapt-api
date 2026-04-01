import { useState } from "react"
import ProviderList from "../components/ProviderList"
import ApiKeyList from "../components/ApiKeyList"
import RiskGraph from "../components/RiskGraph"
import AlertsTable from "../components/AlertsTable"
import LiveFeed from "../components/LiveFeed"

export default function Dashboard() {
  const [providerId, setProviderId] = useState(null)
  const [apiKey, setApiKey] = useState(null)

  return (
    <div style={{ display: "flex", gap: 20 }}>
      <ProviderList onSelect={setProviderId} />
      <ApiKeyList providerId={providerId} onSelect={setApiKey} />

      <div>
        <RiskGraph apiKey={apiKey} />
        <AlertsTable providerId={providerId} />
      </div>

      <LiveFeed />
    </div>
  )
}