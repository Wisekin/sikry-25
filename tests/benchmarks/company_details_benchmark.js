import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 15 }, // Ramp up to 15 VUs
    { duration: '1m', target: 15 },   // Stay at 15 VUs
    { duration: '20s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // < 1% errors
    http_req_duration: ['p(95)<800'],  // 95th percentile response time < 800ms
  },
};

const COMPANY_ID = 'test-company-id-xyz'; // Placeholder company ID
const API_BASE_URL = 'http://localhost:3000/api';

export default function () {
  const params = {
    headers: {
      // 'Authorization': 'Bearer your-auth-token', // If auth is needed
    },
  };
  const res = http.get(`${API_BASE_URL}/companies/${COMPANY_ID}`, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response contains company data': (r) => r.body && r.json('name') !== undefined, // Basic check for response body
  });

  sleep(1);
}
