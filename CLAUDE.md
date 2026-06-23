# Claude Code Guidelines

## Development Commands
- Run development server: `npm run dev`
- Build production version: `npm run build`
- Start built production server: `npm run start`
- Run WhatsApp worker script: `npm run whatsapp-worker`

## Project Structure & Architecture
- **Next.js App**: `src/app/`
- **React Components**: `src/components/`
- **Database (Supabase)**: `src/lib/supabase.js`
- **Media utilities**: `src/lib/media.js`
- **WhatsApp Worker (Baileys)**: `src/scripts/whatsapp-worker.js`

## Coding Standards & Conventions
- Follow Next.js guidelines in [AGENTS.md](file:///c:/Users/DELL/OneDrive/Desktop/ordinary/AGENTS.md) (note that this Next.js version has breaking changes compared to older versions).
- Maintain asynchronous database operations with Supabase.
- Handle WhatsApp connection lifecycle states and reconnect logic safely using Baileys (`@whiskeysockets/baileys`).
- Do not run arbitrary cleanups unless requested. Preserve comments and documentation.
