import http from 'k6/http'

export let options = {
  vus: 10,           // virtual users
  duration: '5s',   // total time
}
// IMPORTANT: Keys must exist in seed.js
export default function () {
  http.get('http://localhost:4000/api/test', {
    headers: {
      'x-api-key': 'ak_002'
    }
  })
}