'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import Icon from './Icon';
import { Reveal } from './Reveal';
import { work } from '@/data/portfolio';

function ProjectCard({ project }) {
  const { links } = project;
  return (
    <article className="ol-project ol-lift ol-fill">
      <div className="ol-project__thumb">
        <div className="ol-project__zoom">
          {project.image ? (
            <Image src={project.image} alt={`Screenshot of ${project.name}`} fill sizes="(min-width: 1024px) 600px, 100vw" />
          ) : (
            <>
              <Icon name="image" size={44} color="#8A847E" strokeWidth={1.5} />
              <p className="ol-project__placeholder">{work.screenshotPlaceholder}</p>
            </>
          )}
        </div>
        <p className="ol-project__cat">{project.category}</p>
      </div>
      <div className="ol-project__body">
        <h3 className="ol-project__name">{project.name}</h3>
        <p className="ol-project__desc">{project.description}</p>
        <p className="ol-project__stack">{project.stack}</p>
        <div className="ol-project__links">
          <a href={links.caseStudy}>
            View case study <Icon name="arrowUpRight" size={14} strokeWidth={2.4} />
          </a>
          <a href={links.live} target={links.live.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
            Live site
          </a>
          <a href={links.github} target={links.github.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </article>
  );
}

export default function Work() {
  const [filter, setFilter] = useState('all');
  const reduce = useReducedMotion();
  const projects = filter === 'all' ? work.projects : work.projects.filter((project) => project.kind === filter);

  return (
    <section id="work" className="ol-section ol-work ol-on-dark" aria-labelledby="ol-work-title">
      <p aria-hidden="true" className="ol-work__ghost">
        WORK
      </p>
      <div className="ol-container ol-work__inner">
        <Reveal className="ol-head-row">
          <div className="ol-head">
            <p className="ol-eyebrow">{work.eyebrow}</p>
            <h2 id="ol-work-title" className="ol-h2">
              {work.heading}
            </h2>
          </div>
          <div role="group" aria-label="Filter projects" className="ol-tabs">
            {work.filters.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className="ol-tab"
                aria-pressed={tab.id === filter}
                onClick={() => setFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Reveal>

        <p className="ol-sr-only" aria-live="polite">
          {`Showing ${projects.length} project${projects.length === 1 ? '' : 's'}`}
        </p>

        <m.div layout={!reduce} className="ol-projects">
          <AnimatePresence mode="popLayout" initial={false}>
            {projects.map((project, index) => (
              <m.div
                key={`${project.category}-${work.projects.indexOf(project)}`}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1], delay: reduce ? 0 : (index % 2) * 0.08 }}
              >
                <ProjectCard project={project} />
              </m.div>
            ))}
          </AnimatePresence>
        </m.div>

        <Reveal className="ol-next">
          <p className="ol-next__text">{work.nextCta.text}</p>
          <a className="ol-btn ol-btn--red ol-btn--md ol-btn--paper-border" href={work.nextCta.href}>
            {work.nextCta.label}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
