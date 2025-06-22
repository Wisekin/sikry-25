# Alerting System

This file describes the alerting rules that should be configured in a tool like PagerDuty or Opsgenie.

## Critical Alerts (Page a developer)

- **Discovery Service Error Rate > 5% for 5 minutes:** The discovery service is failing for a significant number of users.
- **Scraper Service Error Rate > 10% for 10 minutes:** The scraper service is failing for a significant number of users.
- **API Latency > 5s for 5 minutes:** The API is unacceptably slow.

## Warning Alerts (Send a notification to Slack)

- **Cache Hit Rate < 80% for 1 hour:** The cache is not being utilized effectively.
- **High CPU Usage > 90% for 15 minutes:** A service is under high load and may need scaling.