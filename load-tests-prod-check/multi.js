import http from "k6/http"
import { check, sleep } from "k6"

const TARGET_URL = __ENV.TARGET_URL
const API_PATH = __ENV.API_PATH || "/api/test"
const API_KEYS = (__ENV.API_KEYS || "")
  .split(",")
  .map((key) => key.trim())
  .filter(Boolean)

export const options = {
  vus: 10,
  duration: "20s",
  thresholds: {
    http_req_failed: ["rate<0.2"]
  }
}

export default function () {
  if (!TARGET_URL || API_KEYS.length === 0) {
    throw new Error("TARGET_URL and API_KEYS are required")
  }

  const key = API_KEYS[Math.floor(Math.random() * API_KEYS.length)]

  const res = http.get(`${TARGET_URL}${API_PATH}`, {
    headers: {
      "x-api-key": key
    }
  })

  check(res, {
    "status is 200 or 429": (r) => r.status === 200 || r.status === 429
  })

  sleep(1)
}
