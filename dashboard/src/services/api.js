const BASE_URL =
  import.meta.env.VITE_CONTROL_API_URL || "http://localhost:4500"

export async function fetchProviders() {
  const res = await fetch(`${BASE_URL}/providers`)
  return res.json()
}

export async function fetchApiKeys(providerId) {
  const res = await fetch(`${BASE_URL}/api-keys?providerId=${providerId}`)
  return res.json()
}

export async function fetchRiskHistory(apiKey) {
  const res = await fetch(`${BASE_URL}/risk-history?apiKey=${apiKey}`)
  return res.json()
}

export async function fetchAlerts(providerId) {
  const res = await fetch(`${BASE_URL}/alerts?providerId=${providerId}`)
  return res.json()
}
