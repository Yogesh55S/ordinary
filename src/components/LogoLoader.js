'use client';

import Image from 'next/image';

export default function LogoLoader({ 
  fullScreen = false, 
  size = 'md', 
  text = 'Loading...' 
}) {
  const sizeClasses = {
    sm: { container: 'h-16 w-16', logo: 32, ring: 'border-2' },
    md: { container: 'h-24 w-24', logo: 48, ring: 'border-3' },
    lg: { container: 'h-32 w-32', logo: 64, ring: 'border-4' },
  }[size] || { container: 'h-24 w-24', logo: 48, ring: 'border-3' };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Animated Logo Container */}
      <div className="relative flex items-center justify-center">
        {/* Animated outer spinning rings */}
        <div 
          className={`absolute inset-0 rounded-full border-t-indigo-600 border-r-transparent border-b-slate-200 dark:border-b-slate-800 border-l-transparent animate-spin ${sizeClasses.ring}`}
          style={{ animationDuration: '0.8s' }}
        ></div>
        <div 
          className={`absolute -inset-2 rounded-full border-t-transparent border-r-indigo-400 border-b-transparent border-l-transparent animate-spin ${sizeClasses.ring}`}
          style={{ animationDuration: '1.2s', animationDirection: 'reverse' }}
        ></div>
        
        {/* Subtle pulsing background glow */}
        <div className={`absolute inset-1 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-md animate-pulse`}></div>

        {/* The Logo Image */}
        <div className={`relative flex items-center justify-center bg-white dark:bg-[#0e1320] rounded-full p-3 shadow-md animate-pulse border border-slate-100 dark:border-slate-800 ${sizeClasses.container}`}>
          <Image
            src="/logo.png"
            alt="ordinary Logo"
            width={sizeClasses.logo}
            height={sizeClasses.logo}
            priority
            className="object-contain hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Loading Text */}
      {text && (
        <div className="flex items-center space-x-1.5">
          <span className="text-sm font-semibold tracking-wide text-slate-600 dark:text-slate-350">
            {text}
          </span>
          <span className="flex space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </span>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 dark:bg-[#090d16]/80 backdrop-blur-md transition-all duration-300">
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
