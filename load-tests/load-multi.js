import http from 'k6/http'

export let options = {
  vus: 10,
  duration: '20s'
}

export default function () {
  const key = Math.random() > 0.5 ? 'ak_001' : 'ak_101'

  http.get('http://localhost:4000/api/test', {
    headers: {
      'x-api-key': key
    }
  })
}