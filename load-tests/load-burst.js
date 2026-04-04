import http from 'k6/http'

//run with debug flags - k6 run --summary-trend-stats="avg,min,max,p(95)" load-burst.js
export let options = {
  scenarios: {
    burst_test: {
      executor: 'constant-arrival-rate',
      rate: 150,        // 100 requests per second
      timeUnit: '1s',
      duration: '10s',
      preAllocatedVUs: 20,
      maxVUs: 50,
    },
  },
}

export default function () {
  http.get('http://localhost:4000/api/test', {
    headers: {
      'x-api-key': 'ak_001'
    }
  })
}