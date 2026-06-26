# Claude Code Guidelines

## Development Commands
- **Run development server**: `npm run dev`
- **Build production version**: `npm run build`
- **Start built production server**: `npm run start`
- **Run WhatsApp worker script**: `npm run whatsapp-worker`

## Project Structure & Architecture
- **Next.js App**: `src/app/`
- **React Components**: `src/components/`
- **Database (Supabase)**: `src/lib/supabase.js`
- **Media utilities**: `src/lib/media.js`
- **WhatsApp Worker (Baileys)**: `src/scripts/whatsapp-worker.js`

## Coding Standards & Conventions
- **Production Quality**: Always write production-quality, clean, and robust code.
- **Clean Architecture**: Follow clean architecture principles and separation of concerns.
- **TypeScript Strict Mode**: Use strict mode in TypeScript and avoid using `any`.
- **Functionality Integrity**: Never break existing functionality; ensure backward compatibility.
- **Reusable & Modular Components**: Prefer reusable React components and keep the codebase highly modular.
- **Transparency**: Explain major architectural or logic changes before implementing them.
- **Optimization**: Generate highly optimized and performance-conscious code.
- **Code Style**: Adhere to ESLint and Prettier rules configured in the project.
- **Clean Folder Structure**: Keep the directory structure organized and logical.
- **File Safety**: Never remove files unless explicitly requested by the user.
- **Destructive Actions**: Always ask for confirmation before executing destructive actions.
- **Comments Integrity**: Preserve existing comments and docstrings unless replacing them with superior documentation.
- **Next.js Guidelines**: Follow Next.js guidelines in [AGENTS.md](file:///c:/Users/DELL/OneDrive/Desktop/ordinary/AGENTS.md) (noting version-specific conventions).
- **Asynchronous Database Ops**: Maintain robust asynchronous database operations with Supabase.
- **WhatsApp Lifecycle**: Handle WhatsApp connection lifecycle states and reconnect logic safely using Baileys (`@whiskeysockets/baileys`).
