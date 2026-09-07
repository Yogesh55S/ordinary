'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Settings,
  Menu,
  X,
  MessageSquare,
  Sun,
  Moon,
  History,
  MapPin,
  Briefcase
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const closeButtonRef = useRef(null);

  useEffect(() => {
    // Safely verify theme state on client mount
    const storedTheme = localStorage.theme;
    const isDark = storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.theme = nextTheme;
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const links = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Prospect Finder', href: '/prospect', icon: MapPin },
    { name: 'Templates', href: '/templates', icon: FileText },
    { name: 'Schedules', href: '/schedules', icon: Calendar },
    { name: 'Job Applications', href: '/job-applications', icon: Briefcase },
    { name: 'History', href: '/history', icon: History },
    { name: 'WhatsApp Link', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-black px-4 py-3.5 border-b border-[#CBDDE9] dark:border-[#2A72A1]/30 md:hidden transition-colors duration-200">
        <div className="flex items-center space-x-2">
          <Image
            src="/icon.png"
            alt="ordinary Logo"
            width={32}
            height={32}
            className="rounded-lg object-contain shadow-sm border border-[#CBDDE9]/50"
          />
          <span className="font-bold text-lg text-black dark:text-white tracking-tight">ordinary</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="text-[#2A72A1] dark:text-[#CBDDE9] hover:bg-[#CBDDE9]/25 rounded-lg p-1.5 focus:outline-none transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-[#CBDDE9]" /> : <Moon className="h-5 w-5 text-[#2A72A1]" />}
          </button>
          <button 
            onClick={() => setIsOpen(true)}
            className="text-black dark:text-white hover:bg-[#CBDDE9]/25 rounded-lg p-1.5 focus:outline-none transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          ></div>

          {/* Drawer content */}
          <div className="relative flex flex-col w-72 max-w-xs bg-white dark:bg-black h-full shadow-2xl transition-transform duration-300 ease-in-out border-r border-[#CBDDE9] dark:border-[#2A72A1]/30">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#CBDDE9] dark:border-[#2A72A1]/30">
              <div className="flex items-center space-x-2">
                <Image
                  src="/icon.png"
                  alt="ordinary Logo"
                  width={32}
                  height={32}
                  className="rounded-lg object-contain shadow-sm border border-[#CBDDE9]/50"
                />
                <span className="font-bold text-lg text-black dark:text-white tracking-tight">ordinary</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                ref={closeButtonRef}
                className="text-black dark:text-white hover:bg-[#CBDDE9]/25 rounded-lg p-1.5 focus:outline-none transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {links.map((link) => {
                const IconComponent = link.icon;
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-[#2A72A1] text-white font-bold shadow-sm' 
                        : 'text-black dark:text-[#CBDDE9] hover:bg-[#CBDDE9]/25 hover:text-[#2A72A1]'
                    }`}
                  >
                    <IconComponent className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-[#2A72A1]'}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-[#CBDDE9] dark:border-[#2A72A1]/30 space-y-3">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-black dark:text-white hover:bg-[#CBDDE9]/25 rounded-xl transition-all border border-[#CBDDE9] dark:border-[#2A72A1]/40"
              >
                <span className="flex items-center space-x-2">
                  {theme === 'dark' ? <Sun className="h-4 w-4 text-[#CBDDE9]" /> : <Moon className="h-4 w-4 text-[#2A72A1]" />}
                  <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-[#2A72A1] dark:text-[#CBDDE9]">Toggle</span>
              </button>

              <div className="flex items-center space-x-2 px-3 py-2.5 bg-[#CBDDE9]/30 dark:bg-black border border-[#CBDDE9] dark:border-[#2A72A1]/40 rounded-xl">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2A72A1] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2A72A1]"></span>
                </span>
                <span className="text-xs font-bold text-[#2A72A1] dark:text-[#CBDDE9] uppercase tracking-wider">Active Session</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-black border-r border-[#CBDDE9] dark:border-[#2A72A1]/30 h-screen sticky top-0 transition-colors duration-200">
        <div className="flex items-center space-x-2.5 px-6 py-5 border-b border-[#CBDDE9] dark:border-[#2A72A1]/30">
          <Image
            src="/icon.png"
            alt="ordinary Logo"
            width={36}
            height={36}
            className="rounded-xl object-contain shadow-sm border border-[#CBDDE9]/50"
          />
          <span className="font-bold text-xl text-black dark:text-white tracking-tight">ordinary</span>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const IconComponent = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-[#2A72A1] text-white font-bold shadow-sm' 
                    : 'text-black dark:text-[#CBDDE9] hover:bg-[#CBDDE9]/25 hover:text-[#2A72A1]'
                }`}
              >
                <IconComponent className={`h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-[#2A72A1]'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#CBDDE9] dark:border-[#2A72A1]/30 space-y-3">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-black dark:text-white hover:bg-[#CBDDE9]/25 rounded-xl transition-all border border-[#CBDDE9] dark:border-[#2A72A1]/40"
          >
            <span className="flex items-center space-x-2">
              {theme === 'dark' ? <Sun className="h-4 w-4 text-[#CBDDE9]" /> : <Moon className="h-4 w-4 text-[#2A72A1]" />}
              <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-[#2A72A1] dark:text-[#CBDDE9]">Toggle</span>
          </button>

          <div className="flex items-center space-x-2.5 px-4 py-3 bg-[#CBDDE9]/30 dark:bg-black border border-[#CBDDE9] dark:border-[#2A72A1]/40 rounded-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2A72A1] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2A72A1]"></span>
            </span>
            <span className="text-xs font-bold text-[#2A72A1] dark:text-[#CBDDE9] uppercase tracking-wider">Active Session</span>
          </div>
        </div>
      </aside>
    </>
  );
}
