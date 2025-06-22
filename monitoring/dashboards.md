# Monitoring Dashboards

This file describes the monitoring dashboards that should be created in a tool like Grafana or Datadog.

## Discovery Service Dashboard

- **Request Rate:** Number of discovery requests per minute.
- **Error Rate:** Percentage of discovery requests that result in an error.
- **Latency:** 95th percentile latency for discovery requests.
- **Cache Hit Rate:** Percentage of requests served from cache.

## Scraper Service Dashboard

- **Jobs Processed:** Number of scraping jobs processed per hour.
- **Success Rate:** Percentage of scraping jobs that complete successfully.
- **Data Quality:** Average data quality score for scraped data.
- **Resource Usage:** CPU and memory usage of scraper workers.