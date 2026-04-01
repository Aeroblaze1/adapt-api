import { useEffect, useState } from "react"
import { connectSocket } from "../services/socket"

export default function LiveFeed() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    // connectSocket((event) => {
    //   setEvents(prev => [event, ...prev.slice(0, 20)])
    // })
  }, [])

  return (
    <div>
      <h3>Live Feed</h3>
      {events.map((e, i) => (
        <div key={i}>
          {e.apiKey} → {e.decision.stage} ({e.analysis.riskScore})
        </div>
      ))}
    </div>
  )
}