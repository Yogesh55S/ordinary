import { Montserrat } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import SplashLoader from "@/components/SplashLoader";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "ordinary · Lancer",
    template: "%s · ordinary",
  },
  description: "Manage clients, create templates, schedule outreach, and link WhatsApp",
  applicationName: "ordinary",
  appleWebApp: {
    capable: true,
    title: "ordinary",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F0EFED" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0C0A" },
  ],
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
      <body className="min-h-full flex flex-col md:flex-row font-sans bg-canvas text-slate-900 dark:bg-ink-950 dark:text-slate-100 transition-colors duration-200">
        <SplashLoader />
        <Sidebar />
        <main className="flex-1 flex min-w-0 flex-col min-h-[100dvh] overflow-x-hidden pb-safe-nav">
          {children}
        </main>
      </body>
    </html>
  );
}
