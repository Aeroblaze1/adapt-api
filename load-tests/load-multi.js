import http from 'k6/http'

export let options = {
  vus: 10,
  duration: '20s'
}
// IMPORTANT: Keys must exist in seed.js
export default function () {
  const keys = ['ak_001', 'ak_002', 'ak_101']
  const key = keys[Math.floor(Math.random() * keys.length)]

  http.get('http://localhost:4000/api/test', {
    headers: {
      'x-api-key': key
    }
  })
}
