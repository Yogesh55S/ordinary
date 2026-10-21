'use client';

import BrandLogo from './BrandLogo';

export default function LogoLoader({
  fullScreen = false,
  size = 'md',
  text = 'Loading...'
}) {
  const sizeClasses = {
    sm: { container: 'h-14 w-14', logo: 40, ring: 'border-2' },
    md: { container: 'h-20 w-20', logo: 56, ring: 'border-[3px]' },
    lg: { container: 'h-28 w-28', logo: 80, ring: 'border-4' },
  }[size] || { container: 'h-20 w-20', logo: 56, ring: 'border-[3px]' };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-5" role="status" aria-live="polite">
      {/* Animated Logo Container */}
      <div className={`relative flex items-center justify-center ${sizeClasses.container}`}>
        {/* Spinning brand ring */}
        <div
          className={`absolute -inset-2 rounded-[30%] border-brand/15 border-t-brand animate-spin ${sizeClasses.ring}`}
          style={{ animationDuration: '0.9s' }}
        ></div>

        {/* The brand mark */}
        <BrandLogo variant="mark" width={sizeClasses.logo} priority className="shadow-lg shadow-brand/20" />
      </div>

      {/* Loading Text */}
      {text && (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold tracking-wide text-slate-600 dark:text-slate-300">
            {text}
          </span>
          <span className="flex gap-1" aria-hidden="true">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </span>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/85 dark:bg-ink-950/85 backdrop-blur-md transition-all duration-300">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center py-12">
      {loaderContent}
    </div>
  );
}
