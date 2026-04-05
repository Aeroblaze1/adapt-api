import http from "k6/http"
import { check } from "k6"

const TARGET_URL = __ENV.TARGET_URL
const API_KEY = __ENV.API_KEY
const API_PATH = __ENV.API_PATH || "/api/test"

export const options = {
  vus: 1,
  iterations: 1
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
    "status is 200 or 429": (r) => r.status === 200 || r.status === 429
  })
}
