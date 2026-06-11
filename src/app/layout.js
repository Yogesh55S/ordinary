import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import SplashLoader from "@/components/SplashLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ordinary - Freelance WhatsApp Scheduler",
  description: "Manage clients, create templates, schedule outreach, and link WhatsApp",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-slate-50 dark:bg-[#090d16] flex flex-col md:flex-row text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        <SplashLoader />
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}


