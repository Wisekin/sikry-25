# Grafana Alert Configuration

This document describes the alerts to be configured in Grafana, based on the metrics stored in the Supabase `metrics` table.

## Assumed Grafana Setup
- Grafana is deployed and accessible.
- A PostgreSQL data source named "Supabase PostgreSQL" (or similar) is configured in Grafana, pointing to the application's Supabase database.

## Alert Definitions

### 1. Critical: Discovery Service High Error Rate
- **Condition:** The percentage of API requests to discovery endpoints (e.g., containing '/api/search' or '/api/discovery') that result in a 5xx error is greater than 5% for 5 minutes.
- **Grafana Query (conceptual):**
  ```sql
  SELECT metric_timestamp AS time,
    (SUM(CASE WHEN tags->>'status' LIKE '5%' THEN metric_value ELSE 0 END) * 100.0 / SUM(metric_value)) AS value
  FROM metrics
  WHERE metric_name = 'api_requests_total'
    AND (tags->>'endpoint' LIKE '%/api/search%' OR tags->>'endpoint' LIKE '%/api/discovery%')
    AND $__timeFilter(metric_timestamp)
  GROUP BY time
  ORDER BY time ASC;
  ```
- **Alert Logic:** `WHEN last() OF query > 5 FOR 5m`
- **Notification:** Page a developer.

### 2. Critical: Scraper Service High Error Rate
- **Condition:** The percentage of scraper executions that result in a 'failed' status is greater than 10% for 10 minutes.
- **Grafana Query (conceptual):**
  ```sql
  SELECT metric_timestamp AS time,
    (SUM(CASE WHEN tags->>'status' = 'failed' THEN metric_value ELSE 0 END) * 100.0 / SUM(metric_value)) AS value
  FROM metrics
  WHERE metric_name = 'scraper_executions_total'
    AND $__timeFilter(metric_timestamp)
  GROUP BY time
  ORDER BY time ASC;
  ```
- **Alert Logic:** `WHEN last() OF query > 10 FOR 10m`
- **Notification:** Page a developer.

### 3. Critical: High API Latency
- **Condition:** The 95th percentile latency for all API requests (`api_request_duration`) is greater than 5000ms (5 seconds) for 5 minutes.
- **Grafana Query (conceptual - P95 calculation needs refinement for SQL/Grafana):**
  ```sql
  SELECT metric_timestamp AS time,
    AVG(metric_value) as value -- Placeholder for actual P95 calculation
  FROM metrics
  WHERE metric_name = 'api_request_duration'
    AND $__timeFilter(metric_timestamp)
  GROUP BY time
  ORDER BY time ASC;
  ```
- **Alert Logic:** `WHEN last() OF query > 5000 FOR 5m`
- **Notification:** Page a developer.
- **Note:** Accurate P95 alerting directly from PostgreSQL in Grafana might require using Grafana's built-in percentile functions on the query results if available for SQL datasources, or more advanced SQL. The query above uses AVG as a stand-in and should be replaced with a proper P95 mechanism.

### 4. Warning: Low Search Cache Hit Rate
- **Condition:** The search results cache hit rate (`cache_type` = 'search_results') is less than 80% for 1 hour.
- **Grafana Query:**
  ```sql
  SELECT metric_timestamp AS time,
    (SUM(CASE WHEN tags->>'status' = 'hit' THEN metric_value ELSE 0 END) * 100.0 / SUM(metric_value)) AS value
  FROM metrics
  WHERE metric_name = 'cache_access_total' AND tags->>'cache_type' = 'search_results'
    AND $__timeFilter(metric_timestamp)
  GROUP BY time
  ORDER BY time ASC;
  ```
- **Alert Logic:** `WHEN last() OF query < 80 FOR 1h`
- **Notification:** Send a notification to Slack.

### 5. Warning: High CPU Usage
- **Condition:** The average system CPU usage (`system_cpu_usage`) is greater than 90% for 15 minutes.
- **Grafana Query (conceptual):**
  ```sql
  SELECT metric_timestamp AS time,
    AVG(metric_value) AS value
  FROM metrics
  WHERE metric_name = 'system_cpu_usage'
    AND $__timeFilter(metric_timestamp)
  GROUP BY time
  ORDER BY time ASC;
  ```
- **Alert Logic:** `WHEN last() OF query > 90 FOR 15m`
- **Notification:** Send a notification to Slack.

## Implementation Notes for Grafana
- The SQL queries provided are conceptual and may need adjustments based on the specific SQL capabilities and syntax supported by Grafana's PostgreSQL data source (e.g., handling of time series grouping, percentile calculations).
- `$__timeFilter(metric_timestamp)` should be used in actual Grafana queries to respect the dashboard's time range.
- For percentile calculations like P95 latency, it's often better to query raw duration values and use Grafana's transformation capabilities (e.g., "Add field from calculation" with mode "Percentile") or ensure the database can efficiently calculate percentiles over time windows (e.g. using `percentile_cont` or `approx_percentile` if available and appropriate).
- Alert conditions should be carefully tested to ensure they trigger correctly and avoid excessive noise.
```
