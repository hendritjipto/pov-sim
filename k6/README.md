# k6 Load Testing

Load testing for POV-SIM that simulates user journeys through the frontend.

## User Journey Simulated

```
1. Load Home Page (/)
2. Navigate to Flights Page (/flights)
3. Get Flights (API call to flights service)
4. Book a Flight (API call to flights service)
5. Navigate to Airlines Page (/airlines)
6. Get Airlines (API call to airlines service)
```

## Quick Start

### Run with Docker Compose

```bash
# Start all services first
docker compose up -d

# Run load test
docker compose run --rm k6

# Custom VUs and duration
docker compose run --rm -e VUS=10 -e DURATION=2m k6
```

### Run with Make

```bash
cd k6

# Run load test (Docker)
make run

# Run with custom settings
make run VUS=10 DURATION=2m ERROR_RATE=0.2

# Run locally (requires k6 installed)
make run-local
```

### Run with k6 Directly

```bash
# Install k6: https://k6.io/docs/getting-started/installation/

k6 run \
  -e FRONTEND_BASE_URL=http://localhost:3000 \
  -e FLIGHTS_API_URL=http://localhost:5001 \
  -e AIRLINES_API_URL=http://localhost:8080 \
  -e VUS=5 \
  -e DURATION=60s \
  scripts/load-test.js
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `FRONTEND_BASE_URL` | `http://frontend:3000` | Frontend URL |
| `FLIGHTS_API_URL` | `http://flights:5001` | Flights service URL |
| `AIRLINES_API_URL` | `http://airlines:8080` | Airlines service URL |
| `VUS` | `5` | Number of virtual users |
| `DURATION` | `60s` | Test duration |
| `ERROR_RATE` | `0.1` | Error injection rate (0.0 - 1.0) |

## Metrics

The test tracks:

- `errors` - Error rate across all requests
- `page_loads` - Number of frontend pages loaded
- `api_calls` - Number of API calls made
- `response_time` - Response time trend
