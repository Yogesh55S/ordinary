import { projectHref, projects } from '@/data/portfolio';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

// Only the public portfolio and its case studies are listed; the workspace and login are private.
export default function sitemap() {
  const lastModified = new Date();
  return [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...projects.map((project) => ({
      url: `${siteUrl}${projectHref(project.slug)}`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.7,
    })),
  ];
}
