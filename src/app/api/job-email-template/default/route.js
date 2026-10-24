import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/server';
import fs from 'fs';
import path from 'path';

const TEMPLATE_PATH = path.join(process.cwd(), 'job-application-email', 'dist', 'template.html');

// Serves the currently-shipped compiled template as a read-only starting point / reset
// target for the /workspace/job-applications/template editor. This file lives outside the browser
// bundle, so the editor can't read it directly and needs this tiny server route.
export async function GET(request) {
  const denied = await requireApiAuth(request);
  if (denied) return denied;

  if (!fs.existsSync(TEMPLATE_PATH)) {
    return NextResponse.json(
      { error: `Compiled email template not found at ${TEMPLATE_PATH}. Run "npm run export-job-application-template" first.` },
      { status: 404 }
    );
  }

  const html = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  return NextResponse.json({ html });
}
