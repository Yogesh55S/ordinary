'use client';

import { useState, useEffect } from 'react';
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
  Moon
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Safely verify theme state on client mount
    const storedTheme = localStorage.theme;
    const isDark = storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setTheme(isDark ? 'dark' : 'light');
  }, []);

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
    { name: 'Templates', href: '/templates', icon: FileText },
    { name: 'Schedules', href: '/schedules', icon: Calendar },
    { name: 'WhatsApp Link', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-[#0e1320] px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 md:hidden transition-colors duration-200">
        <div className="flex items-center space-x-2">
          <Image
            src="/icon.png"
            alt="ordinary Logo"
            width={32}
            height={32}
            className="rounded-lg object-contain shadow-sm"
          />
          <span className="font-bold text-lg text-slate-800 dark:text-slate-200 tracking-tight">ordinary</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-1.5 focus:outline-none"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button 
            onClick={() => setIsOpen(true)}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-1.5 focus:outline-none"
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
            className="fixed inset-0 bg-slate-900/40 dark:bg-slate-955/60 backdrop-blur-xs transition-opacity duration-300"
          ></div>

          {/* Drawer content */}
          <div className="relative flex flex-col w-72 max-w-xs bg-white dark:bg-[#0e1320] h-full shadow-2xl transition-transform duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Image
                  src="/icon.png"
                  alt="ordinary Logo"
                  width={32}
                  height={32}
                  className="rounded-lg object-contain shadow-sm"
                />
                <span className="font-bold text-lg text-slate-800 dark:text-slate-200 tracking-tight">ordinary</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-505 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-205 rounded-lg p-1.5 focus:outline-none"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {links.map((link) => {
                const IconComponent = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-semibold' 
                        : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <IconComponent className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all border border-slate-200 dark:border-slate-800"
              >
                <span className="flex items-center space-x-2">
                  {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-400" />}
                  <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Toggle</span>
              </button>

              <div className="flex items-center space-x-2 px-3 py-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Active Session</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#0e1320] border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 transition-colors duration-200">
        <div className="flex items-center space-x-2.5 px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <Image
            src="/icon.png"
            alt="ordinary Logo"
            width={36}
            height={36}
            className="rounded-xl object-contain shadow-sm"
          />
          <span className="font-bold text-xl text-slate-800 dark:text-slate-200 tracking-tight">ordinary</span>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const IconComponent = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold shadow-xs' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <IconComponent className={`h-5 w-5 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-800"
          >
            <span className="flex items-center space-x-2">
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-400" />}
              <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Toggle</span>
          </button>

          <div className="flex items-center space-x-2.5 px-4 py-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Active Session</span>
          </div>
        </div>
      </aside>
    </>
  );
}
