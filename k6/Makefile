.PHONY: run run-local help

# Default values
VUS ?= 5
DURATION ?= 60s
ERROR_RATE ?= 0.1
FRONTEND_URL ?= http://localhost:3000
FLIGHTS_URL ?= http://localhost:5001
AIRLINES_URL ?= http://localhost:8080

help:
	@echo "k6 Load Testing Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make run                Run load test via Docker"
	@echo "  make run-local          Run load test locally (requires k6 installed)"
	@echo ""
	@echo "Environment variables:"
	@echo "  VUS=10                  Number of virtual users (default: 5)"
	@echo "  DURATION=2m             Test duration (default: 60s)"
	@echo "  ERROR_RATE=0.2          Error injection rate (default: 0.1)"
	@echo "  FRONTEND_URL=http://... Frontend URL (default: http://localhost:3000)"
	@echo "  FLIGHTS_URL=http://...  Flights API URL (default: http://localhost:5001)"
	@echo "  AIRLINES_URL=http://... Airlines API URL (default: http://localhost:8080)"
	@echo ""
	@echo "Examples:"
	@echo "  make run VUS=10 DURATION=2m"
	@echo "  make run-local FRONTEND_URL=http://localhost:3000"

# Run load test via Docker (uses host network to access services)
run:
	docker run --rm --network=host \
		-e FRONTEND_BASE_URL=$(FRONTEND_URL) \
		-e FLIGHTS_API_URL=$(FLIGHTS_URL) \
		-e AIRLINES_API_URL=$(AIRLINES_URL) \
		-e VUS=$(VUS) \
		-e DURATION=$(DURATION) \
		-e ERROR_RATE=$(ERROR_RATE) \
		-v $(PWD)/scripts:/scripts \
		grafana/k6:latest run /scripts/load-test.js

# Run load test locally (requires k6 installed)
run-local:
	k6 run \
		-e FRONTEND_BASE_URL=$(FRONTEND_URL) \
		-e FLIGHTS_API_URL=$(FLIGHTS_URL) \
		-e AIRLINES_API_URL=$(AIRLINES_URL) \
		-e VUS=$(VUS) \
		-e DURATION=$(DURATION) \
		-e ERROR_RATE=$(ERROR_RATE) \
		scripts/load-test.js
