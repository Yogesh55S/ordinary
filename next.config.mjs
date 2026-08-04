/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */

  // Ensures the compiled job application email template ships with the serverless
  // function bundle for /api/send-job-emails (fs.readFileSync needs it at runtime).
  outputFileTracingIncludes: {
    '/api/send-job-emails': ['./job-application-email/dist/template.html'],
  },
};

export default nextConfig;
