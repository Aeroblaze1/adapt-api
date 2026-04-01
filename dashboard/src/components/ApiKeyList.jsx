import { useEffect, useState } from "react"
import { fetchApiKeys } from "../services/api"

export default function ApiKeyList({ providerId, onSelect }) {
  const [keys, setKeys] = useState([])

  useEffect(() => {
    if (!providerId) return
    fetchApiKeys(providerId).then(setKeys)
  }, [providerId])

  return (
    <div>
      <h3>API Keys</h3>
      {keys.map(k => (
        <div key={k._id} onClick={() => onSelect(k._id)}>
          {k._id} | baseline: {k.expectedBaseline}
        </div>
      ))}
    </div>
  )
}