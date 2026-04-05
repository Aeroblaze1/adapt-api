import http from "k6/http"
import { check, sleep } from "k6"

const TARGET_URL = __ENV.TARGET_URL
const API_KEY = __ENV.API_KEY
const API_PATH = __ENV.API_PATH || "/api/test"

export const options = {
  stages: [
    { duration: "20s", target: 5 },
    { duration: "30s", target: 15 },
    { duration: "20s", target: 30 },
    { duration: "15s", target: 0 }
  ],
  thresholds: {
    http_req_failed: ["rate<0.2"]
  }
}

export default function () {
  if (!TARGET_URL || !API_KEY) {
    throw new Error("TARGET_URL and API_KEY are required")
  }

  const res = http.get(`${TARGET_URL}${API_PATH}`, {
    headers: {
      "x-api-key": API_KEY
    }
  })

  check(res, {
    "status is 200 or 429": (r) => r.status === 200 || r.status === 429,
    "risk header exists when gateway responds": (r) =>
      r.status === 200 || r.status === 429
        ? !!r.headers["X-Risk-Score"]
        : true
  })

  sleep(1)
}
