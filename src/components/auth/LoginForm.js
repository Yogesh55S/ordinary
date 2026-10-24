'use client';

import { useRef, useState } from 'react';
import Icon from '@/components/portfolio/Icon';
import { site } from '@/data/portfolio';

export default function LoginForm({ next = '/workspace' }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const passwordRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (pending) return;

    const form = new FormData(event.currentTarget);
    const loginId = String(form.get('loginId') || '').trim();
    const password = String(form.get('password') || '');
    if (!loginId || !password) {
      setError('Enter your login ID and password.');
      return;
    }

    setPending(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password, remember: form.get('remember') === 'on' }),
      });
      if (res.ok) {
        // Full navigation so the workspace boots fresh with the new session cookie.
        window.location.assign(next);
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Login failed. Please try again.');
      if (passwordRef.current) {
        passwordRef.current.value = '';
        passwordRef.current.focus();
      }
    } catch (_) {
      setError('Could not reach the server. Check your connection and try again.');
    }
    setPending(false);
  };

  return (
    <form className="ol-login__form" aria-label="Owner login" onSubmit={handleSubmit} noValidate>
      <div className="ol-field">
        <label htmlFor="l-id">Login ID or email</label>
        <input
          id="l-id"
          name="loginId"
          type="text"
          className="ol-login__input"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={site.email}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'l-error' : undefined}
        />
      </div>
      <div className="ol-field">
        <label htmlFor="l-pw">Password</label>
        <input
          ref={passwordRef}
          id="l-pw"
          name="password"
          type="password"
          className="ol-login__input"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'l-error' : undefined}
        />
      </div>
      <label htmlFor="l-rem" className="ol-login__remember">
        <input id="l-rem" name="remember" type="checkbox" />
        Keep me signed in on this device
      </label>

      {error && (
        <p id="l-error" className="ol-form__alert" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="ol-btn ol-btn--red ol-login__submit" disabled={pending}>
        {pending ? 'Checking…' : 'Enter workspace'}
        <Icon name="arrowRight" size={18} strokeWidth={2.2} />
      </button>
    </form>
  );
}
