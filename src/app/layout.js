import { Montserrat } from "next/font/google";
import "./globals.css";
import { site } from "@/data/portfolio";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Defaults describe the public portfolio; the workspace layout overrides them (and adds noindex).
export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: site.title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F4F2EE",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* The light/dark preference only applies inside the private workspace. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var inWorkspace = location.pathname === '/workspace' || location.pathname.indexOf('/workspace/') === 0;
                if (inWorkspace && (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches))) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
              // Site loader (IntroLoader): every full load of the portfolio home (incl. refresh),
              // motion allowed. Covers the page and holds the hero intro until it finishes.
              try {
                if (location.pathname === '/' &&
                    !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                  document.documentElement.setAttribute('data-ol-intro', 'wait');
                  // Fallback if the app's JS never loads: never leave the page covered.
                  window.__olIntroTimer = setTimeout(function () {
                    document.documentElement.removeAttribute('data-ol-intro');
                  }, 6000);
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
