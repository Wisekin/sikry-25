# Performance Benchmarks

This directory contains scripts for running performance benchmarks against the application.

## Scenarios

- **discovery_benchmark.js:** Measures the performance of the website discovery service.
- **scraper_benchmark.js:** Measures the performance of the scraping service.

## Running Benchmarks

Use a tool like k6 or JMeter to run these benchmarks.

```bash
k6 run tests/benchmarks/discovery_benchmark.js
```