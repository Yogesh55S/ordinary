import path from 'path';

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

export default nextConfig;
