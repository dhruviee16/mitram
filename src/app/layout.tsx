import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SkipLink } from "@/components/layout/skip-link";
import { TopOfferStrip } from "@/components/layout/top-offer-strip";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mitram-travel.vercel.app";
const TAGLINE =
  "Mitram makes senior travel easier with verified companions, thoughtful support and live family updates — so your parents can travel with confidence.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mitram — Relive. Connect. Celebrate Life.",
    template: "%s · Mitram",
  },
  description: TAGLINE,
  keywords: [
    "senior travel",
    "senior citizen tour packages",
    "parents travel",
    "elderly travel companion",
    "yatra booking",
    "India senior tours",
  ],
  authors: [{ name: "Mitram" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Mitram",
    title: "Mitram — Relive. Connect. Celebrate Life.",
    description: TAGLINE,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Mitram — Relive. Connect. Celebrate Life.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mitram — Relive. Connect. Celebrate Life.",
    description: TAGLINE,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-body">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <SessionProvider>
            <QueryProvider>
              <SkipLink />
              <TopOfferStrip />
              <SiteNav />
              <main id="main-content" className="flex-1">
                {children}
              </main>
              <SiteFooter />
              <Toaster />
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
