import { initializeFaro, getWebInstrumentations } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

// Initialize Grafana Faro for frontend observability
export function initFaro() {
  // Get collector URL from environment or use default
  const collectorUrl = process.env.REACT_APP_FARO_COLLECTOR_URL || 'http://localhost:12347/collect';
  
  const faro = initializeFaro({
    url: collectorUrl,
    app: {
      name: 'pov-sim-frontend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
    },
    
    instrumentations: [
      // Load default web instrumentations (console, errors, web vitals, etc.)
      ...getWebInstrumentations(),
      
      // Add tracing instrumentation for distributed traces
      new TracingInstrumentation({
        // Propagate trace context to these backend URLs
        propagateTraceHeaderCorsUrls: [
          /http:\/\/localhost:5001.*/,   // Flights API (local)
          /http:\/\/localhost:8080.*/,   // Airlines API (local)
          /http:\/\/flights:5001.*/,     // Flights API (Docker)
          /http:\/\/airlines:8080.*/,    // Airlines API (Docker)
        ],
      }),
    ],
  });

  console.log('🔭 Grafana Faro initialized - Frontend observability enabled');
  
  return faro;
}

