import { useEffect, useState } from "react"
import { fetchProviders } from "../services/api"

export default function ProviderList({ onSelect }) {
  const [providers, setProviders] = useState([])

  useEffect(() => {
    fetchProviders().then(setProviders)
  }, [])

  return (
    <div>
      <h3>Providers</h3>
      {providers.map(p => (
        <div key={p._id} onClick={() => onSelect(p._id)}>
          {p.name} ({p.plan?.baselinePerMinute}/min)
        </div>
      ))}
    </div>
  )
}