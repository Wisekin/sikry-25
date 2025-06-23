# Scaling Recommendations

Based on performance testing conducted on [Date YYYY-MM-DD] (see [Performance Test Report](./performance_report.md)), the following scaling recommendations are provided. These also incorporate general best practices from `docs/performance_tuning.md`.

## 1. Application-Level Scaling

### 1.1. API Services (Next.js Server)
- **Horizontal Scaling:**
    - Consider deploying multiple instances of the Next.js application server behind a load balancer.
    - Monitor CPU and memory usage on these instances (using Grafana dashboards) to determine optimal scaling thresholds.
    - If using serverless platforms (like Vercel), this is often handled automatically, but concurrency limits and region distribution should be reviewed.
- **Vertical Scaling:**
    - For stateful parts or if horizontal scaling is complex, consider increasing resources (CPU/RAM) for the application server instances. Less preferred for stateless APIs.

### 1.2. Scraper Service Workers
- **Background Workers:** If scrapers run as background jobs (e.g., using BullMQ, Celery, or Supabase Edge Functions with longer timeouts if applicable):
    - Scale the number of worker processes/instances based on job queue length and processing time.
    - Monitor `scraper_jobs_processed` and `scraper_execution_duration` from Grafana.
- **Resource Allocation:** Ensure scraper workers have sufficient CPU, memory, and network bandwidth, especially if they perform intensive tasks like browser automation.

## 2. Database Scaling (Supabase/PostgreSQL)

- **Connection Pooling:**
    - Ensure efficient connection pooling is used (e.g., Supabase comes with PgBouncer). Verify configurations if self-managing PostgreSQL.
    - The `MetricsCollector` writes directly to Supabase; ensure this doesn't become a bottleneck under very high metric ingestion rates. Consider batching if needed, though current implementation is per-metric.
- **Read Replicas:**
    - For read-heavy workloads (e.g., fetching company details, populating dashboards), consider using read replicas to offload read traffic from the primary database instance.
    - API endpoints that are read-only are good candidates to point to read replicas.
- **Instance Sizing:**
    - Monitor database CPU, memory, IOPS, and active connections. Scale the Supabase instance size (compute add-on) if it becomes a bottleneck.
- **Query Optimization:**
    - Continuously analyze slow queries (e.g., using `pg_stat_statements` or Supabase's query performance tools).
    - Ensure proper indexing for all queried columns, especially in `WHERE` clauses, `JOIN` conditions, and `ORDER BY` clauses. The `schema.sql` already has many indexes, but review based on actual query patterns from load tests.
    - The `metrics` table itself might grow large. Consider partitioning or archiving older metrics if query performance degrades.

## 3. Caching Layer (Redis)

- **Instance Sizing:** Monitor Redis CPU, memory usage, and cache hit rate (once implemented). Scale the Redis instance if it's a bottleneck.
- **Cache Strategy Review:**
    - **TTL (Time-To-Live):** Ensure appropriate TTLs are set for different types of cached data to balance freshness and performance.
    - **Eviction Policy:** Understand and configure the eviction policy (e.g., `allkeys-lru`, `volatile-lru`) based on data access patterns.
    - **Cache Hit Rate:** Implement and monitor cache hit rate (as discussed in Step 1). A low hit rate might indicate that the cache is not being used effectively or TTLs are too short.
- **Specific Caches:**
    - **Search Cache:** The `README.md` mentions Redis for search caching. Analyze its effectiveness.
    - **Company Data Cache:** Consider caching frequently accessed company details.
    - **Session Cache:** If applicable.

## 4. External API Dependencies

- **Rate Limits:** Be mindful of rate limits for external APIs (OpenAI, Google, etc.). Implement retry mechanisms with exponential backoff and circuit breakers.
- **Timeouts:** Configure appropriate timeouts for requests to external APIs to prevent long-held connections from impacting your application's performance.
- **Caching External API Responses:** Cache responses from external APIs where appropriate to reduce costs and improve latency, respecting their terms of service.

## 5. Asynchronous Operations

- **Background Jobs:** For long-running tasks (e.g., complex data enrichment, report generation, bulk emails), offload them to background job queues (as suggested for scrapers).
- **Webhooks:** If using webhooks for notifications, ensure they are handled asynchronously and don't block critical paths.

## 6. Monitoring and Alerting
- **Continuous Monitoring:** Use the Grafana dashboards (from Step 1) to continuously monitor key performance indicators (KPIs).
- **Alert Tuning:** Adjust alert thresholds based on observed performance and desired service levels.
- **Log Analysis:** Regularly review application and system logs for errors or performance-related warnings.

## Specific Recommendations from [Performance Test Report](./performance_report.md)
- *(This section would be filled in with specific findings after actual tests)*
- Example: "The Company Details endpoint showed increased latency beyond 10 VUs, suggesting a potential N+1 query or missing index on the `discovered_companies` table when joining related data. Investigate queries hitting this table."
- Example: "Discovery service RPS plateaued at X. Consider horizontal scaling of API instances."
```
