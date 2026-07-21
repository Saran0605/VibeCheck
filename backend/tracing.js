const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

let otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';
// Ensure endpoint ends with /v1/traces if not present and using HTTP exporter
if (!otlpEndpoint.endsWith('/v1/traces')) {
  otlpEndpoint = `${otlpEndpoint.replace(/\/+$/, '')}/v1/traces`;
}

console.log(`[OTel] Initializing OpenTelemetry exporter to: ${otlpEndpoint}`);

const traceExporter = new OTLPTraceExporter({
  url: otlpEndpoint,
});

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: 'vibecheck-backend',
  }),
  traceExporter,
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('[OTel] SDK terminated'))
    .catch((error) => console.error('[OTel] Error terminating SDK', error))
    .finally(() => process.exit(0));
});

module.exports = sdk;
