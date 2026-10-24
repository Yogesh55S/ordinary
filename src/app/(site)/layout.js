import { Caveat } from 'next/font/google';
import '@/styles/portfolio.css';

// Caveat is only for the hand-written accents on the public pages.
const caveat = Caveat({
  variable: '--font-caveat',
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
});

export default function SiteLayout({ children }) {
  return <div className={`${caveat.variable} ol-root`}>{children}</div>;
}
