'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';

/**
 * Ends the owner session. The cookie is httpOnly, so the server clears it;
 * a hard navigation afterwards drops any client state left from the workspace.
 */
export default function LogoutButton({ compact = false }) {
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    setPending(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {
      // Even if the request fails, leave the workspace; the proxy re-checks the cookie.
    }
    window.location.replace('/lancer-login');
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={pending}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-mist/50 dark:hover:bg-white/5 transition-colors disabled:opacity-60"
        aria-label="Log out"
        title="Log out"
      >
        <LogOut className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-mist/40 dark:hover:bg-white/5 rounded-xl transition-colors border border-mist dark:border-line disabled:opacity-60"
    >
      <LogOut className="h-4 w-4 text-brand" />
      <span>{pending ? 'Logging out…' : 'Log out'}</span>
    </button>
  );
}
