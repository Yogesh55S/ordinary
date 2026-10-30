import SiteShell from '@/components/portfolio/SiteShell';
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
import IntroLoader from '@/components/portfolio/IntroLoader';
import { marqueeLines, site } from '@/data/portfolio';

export const dynamic = 'force-static';

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.name,
  jobTitle: 'Full-Stack Developer',
  description: site.description,
  email: `mailto:${site.email}`,
  sameAs: [site.linkedin],
  knowsAbout: ['Next.js', 'React', 'React Native', 'Node.js', 'Supabase', 'MongoDB', 'AWS Lambda', 'Python', 'Razorpay', 'Shopify'],
};

export default function PortfolioPage() {
  return (
    <SiteShell>
      <IntroLoader />
      <Hero />
      <SkillsMarquee items={marqueeLines} label="What I stand for" />
      <Pillars />
      <Services />
      <Work />
      <Process />
      <About />
      <Pricing />
      <Faq />
      <Contact />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, '\\u003c') }}
      />
    </SiteShell>
  );
}
