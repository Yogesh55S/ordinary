import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Icon from '@/components/portfolio/Icon';
import LoginForm from '@/components/auth/LoginForm';
import { getSession } from '@/lib/auth/server';
import { login, site } from '@/data/portfolio';

export const metadata = {
  title: 'Owner login',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  alternates: { canonical: null },
};

// Only same-site workspace paths are allowed as a post-login destination.
function safeNext(value) {
  if (typeof value !== 'string') return '/workspace';
  if (!value.startsWith('/workspace') || value.startsWith('//') || value.includes('\\')) return '/workspace';
  return value;
}

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const next = safeNext(params?.next);

  if (await getSession()) redirect(next);

  return (
    <div className="ol-login">
      <aside className="ol-login__panel ol-on-red">
        <svg aria-hidden="true" className="ol-login__panel-blob" width="420" height="300" viewBox="0 0 420 300">
          <path d="M60 300 C 120 180, 260 120, 420 140 L 420 300 Z" fill="var(--ol-ink)" />
          <path d="M0 260 C 120 150, 280 90, 420 110" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
        <Link href="/" aria-label="Back to portfolio" className="ol-login__logo">
          <Image
            src={site.logo.onDark.src}
            width={site.logo.onDark.width}
            height={site.logo.onDark.height}
            alt={site.name}
            priority
            sizes="120px"
          />
        </Link>
        <div className="ol-login__hello">
          <p className="ol-login__heading">
            {login.panelHeading[0]}
            <br />
            {login.panelHeading[1]}
          </p>
          <svg aria-hidden="true" className="ol-login__brush" width="260" height="16" viewBox="0 0 260 16">
            <path d="M4 12 C 70 4, 160 2, 256 7" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
          </svg>
          <p className="ol-login__panel-text">{login.panelText}</p>
        </div>
        <p className="ol-login__tagline">{site.tagline}</p>
      </aside>

      <main className="ol-login__main">
        <div className="ol-login__box">
          <Link href="/" className="ol-login__back">
            <Icon name="arrowLeft" size={18} />
            Back to portfolio
          </Link>
          <div className="ol-login__head">
            <div className="ol-login__lock">
              <Icon name="lock" size={24} color="#FFFFFF" />
            </div>
            <h1 className="ol-login__title">{login.title}</h1>
            <p className="ol-login__sub">{login.subtitle}</p>
          </div>
          <LoginForm next={next} />
          <p className="ol-login__note">{login.note}</p>
        </div>
      </main>
    </div>
  );
}
