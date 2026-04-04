import http from 'k6/http'

export default function () {
  http.get('http://localhost:4000/api/test', {
    headers: {
      'x-api-key': 'ak_001'
    }
  })
}