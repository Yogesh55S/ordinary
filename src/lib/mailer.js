import nodemailer from 'nodemailer';

let cachedTransporter = null;
let lastSmtpConfigKey = null;

export function getSmtpConfig() {
  const host = process.env.JOB_APPLICATION_SMTP_HOST || process.env.SMTP_HOST;
  const port = parseInt(process.env.JOB_APPLICATION_SMTP_PORT || process.env.SMTP_PORT, 10) || 587;
  const user = process.env.JOB_APPLICATION_SMTP_USER || process.env.SMTP_USER;
  const pass = process.env.JOB_APPLICATION_SMTP_PASS || process.env.SMTP_PASS;
  const secure = (process.env.JOB_APPLICATION_SMTP_SECURE ?? process.env.SMTP_SECURE) === 'true';

  if (!host || !user || !pass) return null;
  return {
    host,
    port,
    secure,
    auth: { user, pass },
    pool: true, // Reuse open connections to drastically cut SMTP connection latency
    maxConnections: 5,
    maxMessages: 100,
  };
}

export function getTransporter() {
  const config = getSmtpConfig();
  if (!config) return null;

  const configKey = `${config.host}:${config.port}:${config.auth.user}:${config.secure}`;
  if (cachedTransporter && lastSmtpConfigKey === configKey) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport(config);
  lastSmtpConfigKey = configKey;
  return cachedTransporter;
}
