import { notFound } from 'next/navigation';
import SiteShell from '@/components/portfolio/SiteShell';
import SkillsMarquee from '@/components/portfolio/SkillsMarquee';
import CaseHero from '@/components/portfolio/case-study/CaseHero';
import Showcase from '@/components/portfolio/case-study/Showcase';
import Overview from '@/components/portfolio/case-study/Overview';
import StackGrid from '@/components/portfolio/case-study/StackGrid';
import NextProject from '@/components/portfolio/case-study/NextProject';
import CaseCta from '@/components/portfolio/case-study/CaseCta';
import { getNextProject, getProject, projectHref, projects } from '@/data/portfolio';

// Every case study is built at deploy time; unknown slugs 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const title = `${project.name} — case study`;
  return {
    title,
    description: project.subtitle,
    alternates: { canonical: projectHref(project.slug) },
    openGraph: {
      type: 'article',
      url: projectHref(project.slug),
      title,
      description: project.subtitle,
      images: [{ url: project.image.src, width: project.image.width, height: project.image.height, alt: `${project.name} preview` }],
    },
    twitter: { card: 'summary_large_image', title, description: project.subtitle, images: [project.image.src] },
  };
}

export default async function CaseStudyPage({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <SiteShell base="/">
      <CaseHero project={project} />
      <Showcase project={project} />
      <SkillsMarquee items={project.stack} label="Tech stack" className="ol-marquee--case" />
      <Overview project={project} />
      <StackGrid project={project} />
      <NextProject project={getNextProject(project.slug)} />
      <CaseCta heading={project.cta} />
    </SiteShell>
  );
}
