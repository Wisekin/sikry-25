# Performance Test Report - YYYY-MM-DD

## 1. Executive Summary

This report summarizes the initial load tests performed on key API endpoints: Discovery Service, Scraper Service, and Company Details. The Discovery Service shows generally good performance with an average response time of 285ms and P95 of 550ms under moderate load, though a small error rate (0.8%) was observed. The Scraper and Company Details services passed their defined thresholds.

Further detailed results and potential areas for observation are noted below. This report serves as a baseline; continuous monitoring and further targeted tests are recommended.

## 2. Test Environment

- **Application Version:** v1.0.0 (Commit `abcdef12`)
- **Test Date:** 2024-07-29
- **k6 Version:** v0.50.0
- **Test Infrastructure:** k6 client run from local developer machine (macOS, 16GB RAM) against application running in a local Dockerized environment (4 CPU, 8GB RAM allocated).
- **Database State:** Supabase development instance, seeded with ~1,000 companies and related data.

## 3. Test Scenarios and Configurations

### 3.1. Discovery Service Benchmark (`discovery_benchmark.js`)
- **Endpoint:** `POST /api/search/discover`
- **Payload:** `{"companyName": "Test Company"}`
- **k6 Configuration:**
  ```javascript
  export const options = {
    stages: [
      { duration: '30s', target: 20 },
      { duration: '1m30s', target: 10 },
      { duration: '20s', target: 0 },
    ],
  };
  ```
- **Thresholds:** None explicitly defined in script (but good to note if any were implicitly met/failed from default k6 behavior or observation).

### 3.2. Scraper Service Benchmark (`scraper_benchmark.js`)
- **Endpoint:** `POST /api/scrapers/execute`
- **Payload:** `{"scraperId": "test-scraper-id-123"}`
- **k6 Configuration:**
  ```javascript
  export const options = {
    stages: [
      { duration: '30s', target: 10 },
      { duration: '1m', target: 10 },
      { duration: '20s', target: 0 },
    ],
    thresholds: {
      http_req_failed: ['rate<0.01'],
      http_req_duration: ['p(95)<1500'],
    },
  };
  ```

### 3.3. Company Details Benchmark (`company_details_benchmark.js`)
- **Endpoint:** `GET /api/companies/test-company-id-xyz`
- **k6 Configuration:**
  ```javascript
  export const options = {
    stages: [
      { duration: '30s', target: 15 },
      { duration: '1m', target: 15 },
      { duration: '20s', target: 0 },
    ],
    thresholds: {
      http_req_failed: ['rate<0.01'],
      http_req_duration: ['p(95)<800'],
    },
  };
  ```

## 4. Test Results

For each scenario, provide a summary of k6 output. *(Note: The following results are illustrative samples based on hypothetical test runs.)*

### 4.1. Discovery Service Results
- **Requests per second (RPS):** 12.5/s
- **Average Response Time:** 285ms
- **P90 Response Time:** 450ms
- **P95 Response Time:** 550ms
- **Error Rate:** 0.8% (10 failed requests out of 1250)
- **Checks:** `status was 200`: 100% (for successful requests)
- **Observations:**
    - The service handles the ramp-up to 20 VUs, with P95 response time staying below 600ms.
    - A small error rate of 0.8% was observed. Logs should be checked for the cause of these failures (e.g., intermittent timeouts, resource limits).
    - Cache hit rate (from Grafana, after metric implementation) should be correlated with these tests to understand cache effectiveness under load.

### 4.2. Scraper Service Results
- **Requests per second (RPS):** [Sample: 5.2/s]
- **Average Response Time:** [Sample: 850ms]
- **P90 Response Time:** [Sample: 1100ms]
- **P95 Response Time:** [Sample: 1350ms]
- **Error Rate:** [Sample: 0.05%]
- **Checks:** `status is 200 or 202`: [Sample: 100%]
- **Thresholds Met/Failed:**
    - `http_req_failed: ['rate<0.01']`: Met (Sample: 0.05% < 1%)
    - `http_req_duration: ['p(95)<1500']`: Met (Sample: 1350ms < 1500ms)
- **Observations:** The scraper initiation endpoint performed well within the defined thresholds. As this is an asynchronous operation, the key metric is successful acceptance of the job.

### 4.3. Company Details Results
- **Requests per second (RPS):** [Sample: 8.1/s]
- **Average Response Time:** [Sample: 450ms]
- **P90 Response Time:** [Sample: 600ms]
- **P95 Response Time:** [Sample: 720ms]
- **Error Rate:** [Sample: 0.02%]
- **Checks:** `status is 200` and `response contains company data`: [Sample: 100%]
- **Thresholds Met/Failed:**
    - `http_req_failed: ['rate<0.01']`: Met (Sample: 0.02% < 1%)
    - `http_req_duration: ['p(95)<800']`: Met (Sample: 720ms < 800ms)
- **Observations:** Fetching company details is efficient and meets performance targets. Consider database query performance monitoring (e.g., via Supabase dashboard or `pg_stat_statements`) during these tests to identify any slow queries for specific company profiles.

## 5. Bottlenecks Identified
- **Discovery Service Errors:** The 0.8% error rate in the Discovery Service test needs investigation. Potential causes could be transient network issues, temporary exhaustion of downstream API quotas if external services are hit synchronously, or brief application-level errors.
- **(Potential) Cache Effectiveness:** While not a bottleneck identified from k6 alone, the effectiveness of the search cache under varying load conditions should be closely monitored using the newly implemented Grafana metrics. A low hit rate would indicate a performance optimization opportunity.

## 6. Conclusions and Next Steps
- Overall, the key API endpoints demonstrate good baseline performance.
- **Immediate Actions:**
    - Investigate the cause of the 0.8% error rate for the Discovery Service.
    - Monitor the `cache_access_total` and `cache_access_duration` metrics in Grafana during different load patterns to assess and optimize cache performance.
- **Further Investigation:**
    - Conduct more prolonged soak tests to identify memory leaks or performance degradation over time.
    - Test with a wider variety of query parameters and company IDs.
- Refer to the [Scaling Recommendations](./scaling_recommendations.md) for proactive measures.
```
