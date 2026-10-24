import Link from 'next/link';
import Icon from '../Icon';
import ProjectMedia from '../ProjectMedia';
import { Reveal } from '../Reveal';
import { projectHref } from '@/data/portfolio';

export default function NextProject({ project }) {
  return (
    <section className="ol-section ol-case-next" aria-labelledby="ol-case-next-title">
      <Reveal className="ol-container ol-case-next__inner">
        <p className="ol-eyebrow">keep exploring</p>
        <Link href={projectHref(project.slug)} className="ol-next-card ol-lift ol-thumb">
          <div className="ol-next-card__copy">
            <span className="ol-next-card__label">NEXT PROJECT · {project.nextLabel}</span>
            <div className="ol-next-card__body">
              <span id="ol-case-next-title" className="ol-next-card__name">
                {project.name}
              </span>
              <span className="ol-next-card__blurb">{project.shortBlurb}</span>
            </div>
            <span className="ol-next-card__cta">
              View next project <Icon name="arrowRight" size={18} strokeWidth={2.4} />
            </span>
          </div>
          <div className="ol-next-card__media">
            <ProjectMedia project={project} alt="" sizes="(min-width: 960px) 600px, 100vw" className="ol-zoom" />
          </div>
        </Link>
      </Reveal>
    </section>
  );
}
