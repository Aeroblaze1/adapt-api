import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts"
import { useEffect, useState } from "react"
import { fetchRiskHistory } from "../services/api"

export default function RiskGraph({ apiKey }) {
  const [data, setData] = useState([])

  useEffect(() => {
    if (!apiKey) return
    fetchRiskHistory(apiKey).then(setData)
  }, [apiKey])

  return (
    <div>
      <h3>Risk Score</h3>
      <LineChart width={500} height={300} data={data}>
        <XAxis dataKey="timestamp" />
        <YAxis domain={[0,1]} />
        <Tooltip />
        <Line type="monotone" dataKey="riskScore" />
      </LineChart>
    </div>
  )
}