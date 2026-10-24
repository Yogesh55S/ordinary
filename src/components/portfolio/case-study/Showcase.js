import Icon from '../Icon';
import ProjectMedia from '../ProjectMedia';

/** Big browser-framed screenshot with the hand-written sticker. */
export default function Showcase({ project }) {
  return (
    <section aria-label="Project preview" className="ol-section ol-case-showcase">
      <div className="ol-container ol-in ol-in--later">
        <div aria-hidden="true" className="ol-case-showcase__shadow" />
        <div className="ol-browser">
          <div className="ol-browser__bar">
            <span aria-hidden="true" className="ol-browser__dots ol-browser__dots--outlined">
              <span />
              <span />
              <span />
            </span>
            <p className="ol-browser__url">
              <Icon name="lock" size={14} color="#1F8A4C" strokeWidth={2.4} />
              {project.domain}
            </p>
          </div>
          <div className="ol-case-showcase__screen ol-thumb">
            <ProjectMedia project={project} alt={`${project.name} showcase`} priority sizes="(min-width: 1280px) 1240px, 100vw" className="ol-zoom" />
          </div>
        </div>
        <p aria-hidden="true" className="ol-case-showcase__sticker">
          {project.sticker}
        </p>
      </div>
    </section>
  );
}
