import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 VUs over 30s (less load than discovery)
    { duration: '1m', target: 10 },   // Stay at 10 VUs for 1m
    { duration: '20s', target: 0 },   // Ramp down to 0 VUs over 20s
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // < 1% errors
    http_req_duration: ['p(95)<1500'], // 95th percentile response time < 1.5s for starting a scrape
  },
};

const SCRAPER_ID = 'test-scraper-id-123'; // Placeholder scraper ID
const API_BASE_URL = 'http://localhost:3000/api';

export default function () {
  // Option 1: Assuming an endpoint to execute a specific scraper
  // const res = http.post(`${API_BASE_URL}/scrapers/${SCRAPER_ID}/execute`);

  // Option 2: Assuming a generic execute endpoint that takes scraper_id in payload
  const payload = JSON.stringify({
    scraperId: SCRAPER_ID,
    // Other potential parameters, e.g., targetUrl, if not configured in scraper itself
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': 'Bearer your-auth-token', // If auth is needed
    },
  };
  const res = http.post(`${API_BASE_URL}/scrapers/execute`, payload, params);

  check(res, {
    'status is 200 or 202': (r) => r.status === 200 || r.status === 202, // Scraper execution might be async
  });

  sleep(1); // Wait for 1 second between iterations
}
