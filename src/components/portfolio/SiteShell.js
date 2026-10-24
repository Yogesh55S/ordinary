import Navbar from './Navbar';
import Footer from './Footer';
import { MotionProvider } from './Reveal';

/** Skip link, sticky nav, main landmark and footer shared by every public page. */
export default function SiteShell({ base = '', children }) {
  return (
    <MotionProvider>
      <a className="ol-skip" href="#main">
        Skip to content
      </a>
      <Navbar base={base} />
      <main id="main">{children}</main>
      <Footer base={base} />
    </MotionProvider>
  );
}
