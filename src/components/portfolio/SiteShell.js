import Navbar from './Navbar';
import Footer from './Footer';
import { MotionProvider } from './Reveal';

/** Sticky nav, main landmark and footer shared by every public page. */
export default function SiteShell({ base = '', children }) {
  return (
    <MotionProvider>
      <Navbar base={base} />
      <main id="main">{children}</main>
      <Footer base={base} />
    </MotionProvider>
  );
}
