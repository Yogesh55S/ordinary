import Image from 'next/image';
import Link from 'next/link';
import Icon from './Icon';
import { externalProps, sectionHref } from './links';
import { footer, site } from '@/data/portfolio';

export default function Footer({ base = '' }) {
  return (
    <footer className="ol-section ol-footer ol-on-dark">
      <div className="ol-container ol-footer__inner">
        <div className="ol-footer__top">
          <div className="ol-footer__brand">
            <Image
              src={site.logo.onDark.src}
              width={site.logo.onDark.width}
              height={site.logo.onDark.height}
              alt={site.name}
              sizes="120px"
              loading="lazy"
            />
            <p className="ol-footer__blurb">{footer.blurb}</p>
          </div>
          <nav aria-label="Footer" className="ol-footer__cols">
            {footer.columns.map((column) => (
              <div key={column.title}>
                <p className="ol-footer__col-title">{column.title}</p>
                <ul className="ol-footer__col">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.section ? sectionHref(base, link.href) : link.href} {...externalProps(link.href)}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <p aria-hidden="true" className="ol-footer__giant">
          {site.tagline}
        </p>

        <div className="ol-footer__bottom">
          <p className="ol-footer__copy">{footer.copyright}</p>
          {/* The only way into the private workspace. */}
          <Link href="/lancer-login" prefetch={false} rel="nofollow" aria-label="Owner login" title="Owner login" className="ol-footer__lock">
            <Icon name="lock" size={16} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
