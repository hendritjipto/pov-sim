# k6 Load Testing Container
FROM grafana/k6:latest

WORKDIR /scripts

COPY scripts/ /scripts/

# Environment variables
ENV FRONTEND_BASE_URL=http://frontend:3000
ENV FLIGHTS_API_URL=http://flights:5001
ENV AIRLINES_API_URL=http://airlines:8080
ENV VUS=5
ENV DURATION=60s
ENV ERROR_RATE=0.1

CMD ["run", "/scripts/load-test.js"]
