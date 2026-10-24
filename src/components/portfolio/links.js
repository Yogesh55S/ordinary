/**
 * Link helpers shared by the portfolio pages.
 * `base` is '' on the home page (plain #anchors) and '/' everywhere else (/#anchors).
 */

export function sectionHref(base, href) {
  return href.startsWith('#') ? `${base}${href}` : href;
}

/** New tab + safe rel for off-site links; nothing for internal ones. */
export function externalProps(href) {
  return /^https?:\/\//.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}
