import path from 'path';
import { withPostHogConfig } from '@posthog/nextjs-config';

// Workspace pages used to live at the site root; keep old bookmarks working.
const LEGACY_WORKSPACE_ROUTES = [
  'clients',
  'prospect',
  'templates',
  'schedules',
  'history',
  'job-applications',
  'delivery',
  'settings',
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve('.'),
  },

  poweredByHeader: false,

  // PostHog runs in the browser, but these vars aren't NEXT_PUBLIC_-prefixed, so Next.js
  // wouldn't expose them on its own. Inline them at build time for client + server code.
  // (The project key is a public, write-only ingestion key — safe to ship to browsers.
  // Never add POSTHOG_API_KEY here: that one is a secret.)
  env: {
    POSTHOG_KEYs: process.env.POSTHOG_KEYs ?? '',
    POSTHOG_HOST: process.env.POSTHOG_HOST ?? '',
    POSTHOG_UI_HOST: process.env.POSTHOG_UI_HOST ?? '',
  },

  // PostHog's API paths rely on trailing slashes; don't let Next redirect them away.
  skipTrailingSlashRedirect: true,

  // Ensures the compiled job application email template ships with the serverless
  // function bundles that read it at runtime via fs.readFileSync.
  outputFileTracingIncludes: {
    '/api/send-job-emails': ['./job-application-email/dist/template.html'],
    '/api/job-email-template/default': ['./job-application-email/dist/template.html'],
    '/opengraph-image': ['./public/brand/logo-red.png'],
  },

  async redirects() {
    return LEGACY_WORKSPACE_ROUTES.flatMap((route) => [
      { source: `/${route}`, destination: `/workspace/${route}`, permanent: false },
      { source: `/${route}/:path*`, destination: `/workspace/${route}/:path*`, permanent: false },
    ]);
  },

  // First-party proxy for PostHog so ad blockers don't drop portfolio visits.
  async rewrites() {
    const ingestHost = process.env.POSTHOG_HOST?.replace(/\/+$/, '');

    if (!ingestHost) {
      return [];
    }

    const assetsHost = ingestHost.replace('.i.posthog.com', '-assets.i.posthog.com');
    return [
      { source: '/ingest/static/:path*', destination: `${assetsHost}/static/:path*` },
      { source: '/ingest/array/:path*', destination: `${assetsHost}/array/:path*` },
      { source: '/ingest/:path*', destination: `${ingestHost}/:path*` },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
      {
        source: '/brand/:file*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
    ];
  },
};

export default withPostHogConfig(nextConfig, {
  personalApiKey: process.env.POSTHOG_API_KEY ?? '',
  projectId: process.env.POSTHOG_PROJECT_ID ?? '',
  sourcemaps: {
    enabled: Boolean(process.env.POSTHOG_API_KEY && process.env.POSTHOG_PROJECT_ID),
    deleteAfterUpload: true,
  },
});
