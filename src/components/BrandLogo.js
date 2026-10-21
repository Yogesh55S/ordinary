import Image from 'next/image';

// Intrinsic size of /public/logo.png (wordmark lockup, transparent background).
const WORDMARK_RATIO = 310 / 560;

/**
 * Brand marks for ordinary.
 * - variant="wordmark": hand-lettered "ordinary · Lancer" lockup; swaps to the
 *   beige version in dark mode so the red ink never sits on a dark surface.
 * - variant="mark": the square "o" app icon.
 */
export default function BrandLogo({ variant = 'wordmark', width = 120, priority = false, className = '' }) {
  if (variant === 'mark') {
    return (
      <Image
        src="/icon.png"
        alt="ordinary"
        width={width}
        height={width}
        priority={priority}
        className={`rounded-[22%] object-contain ${className}`}
      />
    );
  }

  const height = Math.round(width * WORDMARK_RATIO);
  return (
    <span className={`relative inline-flex ${className}`} style={{ width, height }}>
      <Image
        src="/logo.png"
        alt="ordinary Lancer"
        width={width}
        height={height}
        priority={priority}
        className="object-contain dark:hidden"
      />
      <Image
        src="/logo-light.png"
        alt=""
        aria-hidden="true"
        width={width}
        height={height}
        priority={priority}
        className="hidden object-contain dark:block"
      />
    </span>
  );
}
