# Ordinary Lancer

One Next.js project with two faces:

- **`/` — public portfolio.** The site clients see: services, work, process, pricing, FAQ and a working contact form.
- **`/workspace` — private workspace.** The owner's tools for finding clients, WhatsApp/email outreach, job applications and delivery estimates. It sits behind a login that only the owner can use.

There is no public sign-up. The only way to reach the login page (`/lancer-login`) is the small lock icon in the portfolio footer.

---

## Tech stack

| Area | Tools |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS 4, custom CSS (`src/styles/portfolio.css`), Montserrat + Caveat fonts |
| Animation | Framer Motion (turned off when the visitor has `prefers-reduced-motion` set) |
| Database & storage | Supabase (Postgres + the `outreach-media` storage bucket) |
| Auth | bcrypt password hash, JWT (`jose`) in an httpOnly cookie |
| Email | Nodemailer over SMTP, React Email for the job-application template |
| WhatsApp | Baileys (`@whiskeysockets/baileys`) |
| Maps | Google Places API (Prospect Finder), LocationIQ + Leaflet (Delivery Estimator) |
| Background processes | Node scripts, managed with pm2 |

---

## Features

### Public portfolio (`/`)
- Sticky navbar, animated hero, skills marquee, services bento, work grid with filter tabs, process steps, about, pricing, an accessible FAQ accordion, contact section and footer.
- **All copy lives in one file:** `src/data/portfolio.js`. Edit text, projects, pricing and FAQ there without touching any component.
- **Contact form** sends mail through `/api/contact`. Spam protection:
  - a hidden honeypot field
  - a minimum fill time
  - a limit of 3 messages per IP every 10 minutes
  - server-side validation
- **SEO:** metadata, Open Graph image, `sitemap.xml` and `robots.txt`.

### Private workspace (`/workspace`)
| Page | What it does |
|---|---|
| Dashboard | Overview of outreach activity, the upcoming queue and logs |
| Clients | Client CRM, with CSV/JSON import |
| Prospect Finder | Search Google Maps for local businesses and turn them into clients |
| Templates | WhatsApp and email message templates with tags |
| Schedules | Queue and schedule outreach broadcasts |
| History | Log of sent and failed outreach |
| Job Applications | Send applications to HR contacts, with a rate-limited automatic loop and an email template library |
| Delivery Estimator | Road distance, drive time and delivery cost on an interactive map |
| WhatsApp Link | Connect the WhatsApp gateway (QR code) and configure SMTP |

Old URLs such as `/clients` redirect to `/workspace/clients`.

---

## Security

Hiding the login button is not the security. The server checks every request:

- **Proxy check:** `src/proxy.js` runs before every request. Logged-out visitors are redirected to the login page from workspace pages, and get a `401` from private API routes.
- **Second check:** each page layout and API route verifies the session again on its own.
- **Password:** stored only as a bcrypt hash in an environment variable, never in code.
- **Session cookie:** httpOnly, secure and signed. It lasts 12 hours, or 30 days with "keep me signed in".
- **Login lockout:** 5 failed attempts lock the login for 15 minutes.
- **Database access:** the browser never talks to Supabase directly. All queries go through the login-protected `/api/db` bridge, which uses the service-role key on the server.
- **Search engines:** the login and workspace pages send `noindex`, and `robots.txt` blocks them.

Public API routes: `/api/contact`, `/api/auth/login` and `/api/auth/logout`. The worker reaches `/api/send-job-emails` with the `x-worker-secret` header.

---

## Project structure

```
src/
  app/
    (site)/              public portfolio (/) and the login page (/lancer-login)
    workspace/           private workspace pages (auth-protected layout)
    api/
      auth/              login / logout
      contact/           portfolio contact form
      db/                authenticated Supabase bridge (+ storage)
      places/            Google Places search
      delivery-estimate/ route distance & cost
      send-job-emails/   batch sender (called by the worker)
      send-single-application/
      job-email-template/
    robots.js, sitemap.js, opengraph-image.js, manifest.js
  components/
    portfolio/           portfolio sections
    auth/                login form
    clients/ prospect/ templates/ schedules/ dashboard/
    job-applications/ delivery/ settings/
  data/portfolio.js      ALL portfolio content
  lib/
    auth/                session + server-side auth helpers
    db/                  /api/db bridge client and schema
    supabase.js          browser data client (goes through the bridge)
    supabaseServer.js    service-role client (server only)
    mailer.js, media.js, rateLimit.js, contactValidation.js
  proxy.js               request gate for /workspace and /api
  scripts/
    whatsapp-worker.js        WhatsApp gateway + schedule sender
    job-application-worker.js job-application sending loop
    hash-password.js          generates login secrets
  styles/portfolio.css
job-application-email/   React Email project for the job-application template
supabase/migrations/     SQL migrations (run in order)
public/brand/            logos and avatar
```

---

## Getting started

### Requirements
- Node.js 20.9 or newer
- A Supabase project
- SMTP credentials (for example a Gmail app password)
- Optional: Google Places and LocationIQ API keys

### 1. Install
```bash
npm install
```

### 2. Environment variables
Copy the example file and fill it in:
```bash
cp .env.local.example .env.local
```
Every variable is explained in `.env.local.example`. The most important ones:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site (canonical URLs, sitemap, OG image) |
| `CONTACT_TO_EMAIL` | Inbox that receives contact-form messages |
| `OWNER_LOGIN_ID` | Login ID for the workspace |
| `OWNER_PASSWORD_HASH_B64` | bcrypt hash of the owner password (base64) |
| `AUTH_SECRET` | Signs the session cookie. Changing it logs everyone out |
| `WORKER_SECRET` | Lets the job-application worker call `/api/send-job-emails` |
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase connection (the service key stays on the server) |
| `SMTP_*`, `SENDER_*` | Outreach and contact-form email |
| `JOB_APPLICATION_*` | Job-application sender, links and app base URL |
| `GOOGLE_PLACES_API_KEY`, `LOCATIONIQ_API_KEY` | Prospect Finder and Delivery Estimator |

### 3. Set the owner login
```bash
npm run hash-password -- "your-strong-password"
```
This prints `OWNER_PASSWORD_HASH_B64`, `AUTH_SECRET` and `WORKER_SECRET`. Paste them into `.env.local` together with `OWNER_LOGIN_ID`. The password itself is never stored.

### 4. Database
Run the SQL files in `supabase/migrations/` in order, in the Supabase SQL editor.

> ⚠️ **`0004_lock_down_anon_access.sql`** removes all anon-key access. On a live site, run it only **after** this version is deployed. Older builds still read through the anon key and will break if you run it first.

### 5. Run locally
```bash
npm run dev                     # http://localhost:3000
npm run whatsapp-worker         # WhatsApp gateway (scan the QR in Workspace → WhatsApp Link)
npm run job-application-worker  # job-application sending loop
```

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server (exports the email template first if it is missing) |
| `npm run build` | Export the job-application email template, then build for production |
| `npm run start` | Serve the production build |
| `npm run whatsapp-worker` | Run the Baileys WhatsApp gateway and schedule sender |
| `npm run job-application-worker` | Run the rate-limited job-application loop |
| `npm run hash-password -- "<pw>"` | Generate the owner password hash and secrets |
| `npm run export-job-application-template` | Rebuild `job-application-email/dist/template.html` |

---

## Deployment

The web app and the two workers are deployed separately.

**Web app (Vercel or any Node host)**
1. Add every variable from `.env.local` to the host's environment settings.
2. Deploy, which runs `npm run build`.
3. After the deploy is live, run migration `0004` (see above).

**Workers (an always-on machine or VPS)**
- The WhatsApp and job-application workers are long-running processes. They cannot run on serverless hosts such as Vercel.
- Run them with pm2 on a VPS or an always-on PC. `ecosystem.config.js` already defines the job-application worker:
  ```bash
  npx pm2 start ecosystem.config.js
  ```
- The workers read `.env.local` on that machine.
- Set `JOB_APPLICATION_APP_BASE_URL` to the deployed site URL, and use the same `WORKER_SECRET` as the web app.

**Notes**
- **Rate limits:** the login and contact-form limits are kept in server memory. They are strongest on one long-running server. On serverless, each instance keeps its own counter.
- **nginx:** behind nginx, set `proxy_set_header X-Real-IP $remote_addr;` so that the rate limits see the real client IP.

---

## Test checklist

- [ ] In an incognito window, `/` shows the portfolio.
- [ ] `/workspace` and `/workspace/clients` redirect to `/lancer-login`.
- [ ] `curl -X POST https://<domain>/api/db` returns `401`.
- [ ] Logging in opens `/workspace`, and all workspace pages load.
- [ ] After logging out, `/workspace` redirects to the login page again.
- [ ] 6 wrong passwords in a row show the lockout message.
- [ ] Submitting the contact form delivers an email to `CONTACT_TO_EMAIL`.

---

## Contact

- Email: ordinarylancer@gmail.com
- LinkedIn: https://www.linkedin.com/in/ordinary-lancer-a35722414
