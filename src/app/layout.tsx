// src/app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import {
  Space_Grotesk,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  Syne,
  Inter,
  Space_Mono,
  IBM_Plex_Mono,
  Newsreader,
} from "next/font/google";
import "@/globals.css";

const GA_ID = "G-HWM0ZNJJVF";

// Default theme (Avant-Garde) trio — the only fonts on the critical path.
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

// Non-default theme fonts — self-hosted but not preloaded; fetched when the
// visitor picks that theme.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://sopa.team"),
  title: "SOPA AGENCY",
  description: "A creative + engineering studio that breaks the barrier between the old internet and the new one — brands, culture, AI agents, and onchain, built to actually ship.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} ${syne.variable} ${inter.variable} ${spaceMono.variable} ${ibmPlexMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <head>
        {/* Pre-paint theme restore: apply the saved font theme before first paint so
            returning visitors don't flash the default fonts / background (no CLS). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('sopa-font-theme');if(t&&['next-gen','cyber','avant-garde'].indexOf(t)>-1)document.documentElement.dataset.fontTheme=t;}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {/* Google tag (gtag.js) — server-rendered so Google's tag check finds it in HTML */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
