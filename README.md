# ordinary - ordinary lancer

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Job Application Email Outreach

Setup checklist before `/job-applications` will work:

1. **Database**: run `supabase/migrations/0001_job_applications_core.sql` in the Supabase
   Dashboard → SQL Editor (no Supabase CLI is configured for this project, so this is manual).
2. **Env vars**: copy `.env.local.example` to `.env.local` and fill it in. `JOB_APPLICATION_SMTP_PASS`
   needs a Gmail [App Password](https://myaccount.google.com/apppasswords) generated for the
   `JOB_APPLICATION_SMTP_USER` mailbox — a normal Gmail password will not work for SMTP.
3. **Email template**: `npm run dev` / `npm run build` auto-regenerate
   `job-application-email/dist/template.html` via the `predev`/`prebuild` hooks, so this is no
   longer a manual step. To regenerate it on its own: `npm run export-job-application-template`.

### Running the send scheduler persistently

`/api/send-job-emails` sends one batch per call — the actual "every N minutes/hours" scheduling is
owned by `src/scripts/job-application-worker.js`, a long-lived process that must keep running
(Next.js API routes are serverless and can't hold a persistent timer). Use pm2 so it survives
terminal close and machine reboot:

```bash
npx pm2 start ecosystem.config.js   # start the worker under pm2
npx pm2 save                        # persist the process list
npx pm2 startup                     # prints an OS-specific command — run the one it prints (needs sudo)
```

Useful commands: `npx pm2 logs job-application-worker`, `npx pm2 restart job-application-worker`,
`npx pm2 stop job-application-worker`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
