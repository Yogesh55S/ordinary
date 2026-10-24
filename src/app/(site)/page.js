import Navbar from '@/components/portfolio/Navbar';
import Hero from '@/components/portfolio/Hero';
import SkillsMarquee from '@/components/portfolio/SkillsMarquee';
import Pillars from '@/components/portfolio/Pillars';
import Services from '@/components/portfolio/Services';
import Work from '@/components/portfolio/Work';
import Process from '@/components/portfolio/Process';
import About from '@/components/portfolio/About';
import Pricing from '@/components/portfolio/Pricing';
import Faq from '@/components/portfolio/Faq';
import Contact from '@/components/portfolio/Contact';
import Footer from '@/components/portfolio/Footer';
import { MotionProvider } from '@/components/portfolio/Reveal';
import { site } from '@/data/portfolio';

export const dynamic = 'force-static';

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.name,
  jobTitle: 'Full-Stack Developer',
  description: site.description,
  email: `mailto:${site.email}`,
  sameAs: [site.linkedin],
  knowsAbout: ['MERN stack', 'React', 'Node.js', 'MongoDB', 'Express', 'Next.js'],
};

export default function PortfolioPage() {
  return (
    <MotionProvider>
      <a className="ol-skip" href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <SkillsMarquee />
        <Pillars />
        <Services />
        <Work />
        <Process />
        <About />
        <Pricing />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, '\\u003c') }}
      />
    </MotionProvider>
  );
}
