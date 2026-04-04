import http from 'k6/http'

// IMPORTANT: Keys must exist in seed.js
export default function () {
  http.get('http://localhost:4000/api/test', {
    headers: {
      'x-api-key': 'ak_001'
    }
  })
}