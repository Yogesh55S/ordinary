'use client';

import NextError from 'next/error';
import { useEffect } from 'react';
import posthog from 'posthog-js';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    if (process.env.POSTHOG_KEYs && process.env.POSTHOG_HOST) {
      posthog.captureException(error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body>
        <NextError statusCode={0} />
        <button type="button" onClick={reset}>
          Try again
        </button>
      </body>
    </html>
  );
}
