'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from './Icon';
import ProjectMedia from './ProjectMedia';
import { Reveal } from './Reveal';
import { projectHref, projects, work } from '@/data/portfolio';

const pad = (n) => String(n).padStart(2, '0');

/**
 * Project list + sticky preview. Hover or keyboard focus on a row previews it
 * (desktop); every row is a real link to the case study, so touch users tap
 * straight through and see a thumbnail inline instead of the preview panel.
 */
export default function Work() {
  const [filter, setFilter] = useState('all');
  const [activeSlug, setActiveSlug] = useState(null);

  const shown = filter === 'all' ? projects : projects.filter((project) => project.kind === filter);
  const active = shown.find((project) => project.slug === activeSlug) ?? shown[0];
  const activeIndex = shown.indexOf(active);
  const countFor = (id) => (id === 'all' ? projects.length : projects.filter((project) => project.kind === id).length);

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
            <p className="ol-work__intro">{work.intro}</p>
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
                {tab.label} <span className="ol-tab__count">{countFor(tab.id)}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <p className="ol-sr-only" aria-live="polite">
          {`Showing ${shown.length} project${shown.length === 1 ? '' : 's'}`}
        </p>

        <div className="ol-showcase">
          <ol aria-label="Projects" className="ol-rows">
            {shown.map((project, index) => {
              const isActive = project === active;
              return (
                <li key={project.slug}>
                  <Link
                    href={projectHref(project.slug)}
                    className={`ol-row${isActive ? ' ol-row--active' : ''}`}
                    aria-current={isActive ? 'true' : undefined}
                    onMouseEnter={() => setActiveSlug(project.slug)}
                    onFocus={() => setActiveSlug(project.slug)}
                  >
                    <span className="ol-row__num">{pad(index + 1)}</span>
                    <ProjectMedia project={project} alt="" sizes="72px" className="ol-row__thumb" />
                    <span className="ol-row__body">
                      <span className="ol-row__name">{project.name}</span>
                      <span className="ol-row__cat">{project.category}</span>
                    </span>
                    <span aria-hidden="true" className="ol-row__arrow">
                      <Icon name="arrowUpRight" size={20} strokeWidth={2.6} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>

          {active && (
            <div className="ol-preview">
              {/* key remounts the panel so each new project pops in */}
              <div key={active.slug} className="ol-preview__panel">
                <div className="ol-preview__frame-wrap">
                  <div aria-hidden="true" className="ol-preview__shadow" />
                  <div className="ol-browser ol-browser--dark">
                    <div className="ol-browser__bar">
                      <span aria-hidden="true" className="ol-browser__dots">
                        <span />
                        <span />
                        <span />
                      </span>
                      <p className="ol-browser__url">{active.domain}</p>
                    </div>
                    <div className="ol-preview__screen">
                      <ProjectMedia project={active} sizes="(min-width: 1024px) 600px, 1px" />
                    </div>
                  </div>
                  <p className="ol-status-pill">
                    <span aria-hidden="true" className="ol-dot" />
                    {active.status}
                  </p>
                </div>
                <div className="ol-preview__info">
                  <p className="ol-preview__count">
                    PROJECT {pad(activeIndex + 1)} / {pad(shown.length)}
                  </p>
                  <p className="ol-preview__blurb">{active.blurb}</p>
                  <p className="ol-preview__stack">{active.stackLine}</p>
                  <div className="ol-preview__actions">
                    <Link className="ol-btn ol-btn--red ol-btn--md ol-btn--paper-border" href={projectHref(active.slug)}>
                      View case study <Icon name="arrowRight" size={16} strokeWidth={2.6} />
                    </Link>
                    {active.live && (
                      <a className="ol-btn-ghost" href={active.live} target="_blank" rel="noopener noreferrer">
                        Visit live <Icon name="arrowUpRight" size={14} strokeWidth={2.6} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

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
