'use client';

import { useState, useEffect } from 'react';
import LogoLoader from './LogoLoader';

export default function SplashLoader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out at 4.5 seconds to complete transition exactly at 5.0 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4500);

    // Completely remove the loader from the DOM at 5 seconds
    const unmountTimer = setTimeout(() => {
      setVisible(false);
    }, 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] transition-opacity duration-500 ease-in-out ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <LogoLoader fullScreen={true} text="Initializing ordinary CRM..." size="lg" />
    </div>
  );
}
