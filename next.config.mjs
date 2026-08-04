/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */

  // Ensures the compiled job application email template ships with the serverless
  // function bundles that read it at runtime via fs.readFileSync.
  outputFileTracingIncludes: {
    '/api/send-job-emails': ['./job-application-email/dist/template.html'],
    '/api/job-email-template/default': ['./job-application-email/dist/template.html'],
  },
};

export default nextConfig;
