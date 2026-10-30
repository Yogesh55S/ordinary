const { PostHog } = require('posthog-node');

let posthogClient = null;

function optionalPostHogEnvironment(name) {
  const value = process.env[name];
  if (value) return value;

  if (process.env.NODE_ENV === 'development') {
    throw new Error(`${name} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${name} is configured`);
  }

  return null;
}

function getPostHogServer() {
  if (posthogClient) return posthogClient;

  const projectToken = optionalPostHogEnvironment('NEXT_PUBLIC_POSTHOG_KEY');
  const host = optionalPostHogEnvironment('NEXT_PUBLIC_POSTHOG_HOST');
  if (!projectToken || !host) return null;

  posthogClient = new PostHog(projectToken, {
    host,
    flushAt: 1,
    flushInterval: 0,
    enableExceptionAutocapture: true,
  });

  return posthogClient;
}

async function shutdownPostHog() {
  if (!posthogClient) return;

  await posthogClient.shutdown();
  posthogClient = null;
}

module.exports = { getPostHogServer, shutdownPostHog };
