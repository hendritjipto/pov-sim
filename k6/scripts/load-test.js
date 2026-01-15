import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const requestCount = new Counter('requests');

// Configuration from environment variables
const FRONTEND_BASE_URL = __ENV.FRONTEND_BASE_URL || 'http://frontend:3000';
const FLIGHTS_API_URL = __ENV.FLIGHTS_API_URL || 'http://flights:5001';
const AIRLINES_API_URL = __ENV.AIRLINES_API_URL || 'http://airlines:8080';
const ERROR_RATE = parseFloat(__ENV.ERROR_RATE || '0.1');

// Duration: '0' means run for 24 hours (container will restart for continuous)
const DURATION = __ENV.DURATION === '0' ? '24h' : (__ENV.DURATION || '60s');

// Interval between test iterations (default 30 seconds)
const INTERVAL = parseInt(__ENV.INTERVAL || '30');

// Test configuration: 1 VU, runs continuously
export const options = {
  scenarios: {
    user_journey: {
      executor: 'constant-vus',
      vus: 1,
      duration: DURATION,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    errors: ['rate<0.5'],
  },
};

// Data
const AIRLINES = ['AA', 'UA', 'DL'];
const PASSENGERS = ['John Doe', 'Jane Doe'];
const FLIGHT_NUMS = ['101', '202', '303', '404', '505', '606'];

// Helpers
function shouldInjectError() {
  return Math.random() < ERROR_RATE;
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function () {
  console.log(`[${new Date().toISOString()}] Starting test iteration...`);

  // 1. Frontend - Home page
  let res = http.get(`${FRONTEND_BASE_URL}/`);
  check(res, { 'GET / returns 200': (r) => r.status === 200 });
  requestCount.add(1);

  // 2. Frontend - Flights page
  res = http.get(`${FRONTEND_BASE_URL}/flights`);
  check(res, { 'GET /flights returns 200': (r) => r.status === 200 });
  requestCount.add(1);

  // 3. Flights API - Get flights
  const airline = randomElement(AIRLINES);
  let flightsUrl = `${FLIGHTS_API_URL}/flights/${airline}`;
  if (shouldInjectError()) {
    flightsUrl += '?raise=500';
  }
  res = http.get(flightsUrl);
  let success = check(res, { 'GET /flights/{airline} returns 200': (r) => r.status === 200 });
  errorRate.add(!success);
  requestCount.add(1);

  // 4. Flights API - Book flight
  const passenger = randomElement(PASSENGERS);
  const flightNum = randomElement(FLIGHT_NUMS);
  let bookUrl = `${FLIGHTS_API_URL}/flight?passenger_name=${encodeURIComponent(passenger)}&flight_num=${flightNum}`;
  if (shouldInjectError()) {
    bookUrl += '&raise=500';
  }
  res = http.post(bookUrl);
  success = check(res, { 'POST /flight returns 200': (r) => r.status === 200 });
  errorRate.add(!success);
  requestCount.add(1);

  // 5. Frontend - Airlines page
  res = http.get(`${FRONTEND_BASE_URL}/airlines`);
  check(res, { 'GET /airlines page returns 200': (r) => r.status === 200 });
  requestCount.add(1);

  // 6. Airlines API - Get airlines
  let airlinesUrl = `${AIRLINES_API_URL}/airlines`;
  if (shouldInjectError()) {
    airlinesUrl += '?raise=true';
  }
  res = http.get(airlinesUrl);
  success = check(res, { 'GET /airlines API returns 200': (r) => r.status === 200 });
  errorRate.add(!success);
  requestCount.add(1);

  console.log(`[${new Date().toISOString()}] Iteration complete. Waiting ${INTERVAL}s...`);
  
  // Wait 30 seconds before next iteration
  sleep(INTERVAL);
}

export function setup() {
  console.log('='.repeat(60));
  console.log('🚀 k6 Load Test - Running every 30 seconds');
  console.log('='.repeat(60));
  console.log('');
  console.log('Endpoints tested:');
  console.log(`  1. GET  ${FRONTEND_BASE_URL}/`);
  console.log(`  2. GET  ${FRONTEND_BASE_URL}/flights`);
  console.log(`  3. GET  ${FLIGHTS_API_URL}/flights/{airline}`);
  console.log(`  4. POST ${FLIGHTS_API_URL}/flight`);
  console.log(`  5. GET  ${FRONTEND_BASE_URL}/airlines`);
  console.log(`  6. GET  ${AIRLINES_API_URL}/airlines`);
  console.log('');
  console.log(`VUs:       1`);
  console.log(`Interval:  ${INTERVAL}s`);
  console.log(`Duration:  ${DURATION}`);
  console.log(`Error Rate: ${ERROR_RATE * 100}%`);
  console.log('='.repeat(60));
}
