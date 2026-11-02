import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';

let loggerProvider = null;

function requiredPostHogEnvironment(name) {
  const value = process.env[name];
  if (value) return value;

  if (process.env.NODE_ENV === 'development') {
    throw new Error(`${name} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${name} is configured`);
  }

  return null;
}

export function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { getPostHogServer } = require('./src/lib/posthog-server.cjs');
  getPostHogServer();

  if (loggerProvider) return;

  const projectToken = requiredPostHogEnvironment('NEXT_PUBLIC_POSTHOG_KEY');
  const host = requiredPostHogEnvironment('NEXT_PUBLIC_POSTHOG_HOST');
  if (!projectToken || !host) return;

  loggerProvider = new LoggerProvider({
    resource: resourceFromAttributes({ 'service.name': 'ordinary-nextjs' }),
    processors: [
      new BatchLogRecordProcessor({
        exporter: new OTLPLogExporter({
          url: `${host.replace(/\/$/, '')}/i/v1/logs`,
          headers: {
            Authorization: `Bearer ${projectToken}`,
            'Content-Type': 'application/json',
          },
        }),
      }),
    ],
  });

  logs.setGlobalLoggerProvider(loggerProvider);
}

export const onRequestError = async (error, request) => {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { getPostHogServer } = require('./src/lib/posthog-server.cjs');
  const posthog = getPostHogServer();
  if (!posthog) return;

  let distinctId;
  const cookieHeader = request.headers.cookie;
  const cookieString = Array.isArray(cookieHeader) ? cookieHeader.join('; ') : cookieHeader;
  const projectToken = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (cookieString && projectToken) {
    const cookiePrefix = `ph_${projectToken}_posthog=`;
    const postHogCookie = cookieString
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(cookiePrefix));

    if (postHogCookie) {
      try {
        const postHogData = JSON.parse(decodeURIComponent(postHogCookie.slice(cookiePrefix.length)));
        if (typeof postHogData.distinct_id === 'string') {
          distinctId = postHogData.distinct_id;
        }
      } catch (cookieError) {
        console.error('Error parsing PostHog cookie:', cookieError);
      }
    }
  }

  await posthog.captureException(error, distinctId);
  await posthog.flush();
};

// Route handlers import these helpers through src/lib/posthogLogs.js, and Next.js bundles
// them separately from this instrumentation entry, so the module-level `loggerProvider`
// above is not shared with them. Go through the OpenTelemetry global registry instead,
// which `register()` populated via `logs.setGlobalLoggerProvider`. Before registration
// (or with PostHog unconfigured) the global is a no-op provider.
export function emitPostHogLog({ body, severityNumber, attributes }) {
  logs.getLogger('ordinary.posthog').emit({
    body,
    severityNumber,
    attributes,
  });
}

export { SeverityNumber };

export async function flushPostHogLogs() {
  const provider = logs.getLoggerProvider();
  if (typeof provider.forceFlush === 'function') {
    await provider.forceFlush();
  }
}
