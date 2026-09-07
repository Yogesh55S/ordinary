import { Montserrat } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import SplashLoader from "@/components/SplashLoader";

const montserrat = Montserrat({
  variable: "--font-montserrat",
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
      className={`${montserrat.variable} h-full antialiased`}
      suppressHydrationWarning
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
      <body className="min-h-full flex flex-col md:flex-row font-sans bg-[#F7FAFC] text-black dark:bg-[#070B12] dark:text-white transition-colors duration-200">
        <SplashLoader />
        <Sidebar />
        <main className="flex-1 flex min-w-0 flex-col min-h-screen overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}


