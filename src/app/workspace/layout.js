import Sidebar from "@/components/Sidebar";
import SplashLoader from "@/components/SplashLoader";
import { requireSession } from "@/lib/auth/server";

export const metadata = {
  title: {
    default: "ordinary · Lancer",
    template: "%s · ordinary",
  },
  description: "Manage clients, create templates, schedule outreach, and link WhatsApp",
  applicationName: "ordinary",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  appleWebApp: {
    capable: true,
    title: "ordinary",
    statusBarStyle: "default",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F0EFED" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0C0A" },
  ],
};

// Server-side gate: every workspace request is checked here (in addition to the proxy).
export default async function WorkspaceLayout({ children }) {
  await requireSession();

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row font-sans bg-canvas text-slate-900 dark:bg-ink-950 dark:text-slate-100 transition-colors duration-200">
      <SplashLoader />
      <Sidebar />
      <main className="flex-1 flex min-w-0 flex-col min-h-[100dvh] overflow-x-hidden pb-safe-nav">
        {children}
      </main>
    </div>
  );
}
