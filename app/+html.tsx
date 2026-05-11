import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

const DOMAIN = "https://getmoneygarden.com";
const OG_IMAGE = `${DOMAIN}/og-image.png`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Security meta tags */}
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://budgetgarden-backend-latest.onrender.com; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com;"
        />

        {/* Canonical */}
        <link rel="canonical" href={DOMAIN} />

        {/* Performance — preconnect for Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Primary SEO */}
        <title>Money Garden - Track, Earn, Grow</title>
        <meta
          name="description"
          content="Money Garden is the gamified budget management app that turns saving into a game. Track expenses, earn gold coins, grow your virtual garden, and build better financial habits — all in one place."
        />
        <meta
          name="keywords"
          content="gamification, budget management, finance management, personal finance, budget tracker, money tracker, savings app, gamified finance, financial goals, expense tracker, budget app, money management, earn coins, virtual garden, spending tracker"
        />
        <meta name="author" content="Money Garden" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={DOMAIN} />
        <meta property="og:title" content="Money Garden - Track, Earn, Grow" />
        <meta
          property="og:description"
          content="Turn saving into a game. Track your budget, earn gold coins, and grow a virtual garden — the fun way to build better financial habits."
        />
        <meta property="og:site_name" content="Money Garden" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Money Garden app — budget tracking with gamification" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Money Garden - Track, Earn, Grow" />
        <meta
          name="twitter:description"
          content="Turn saving into a game. Track your budget, earn gold coins, and grow a virtual garden — the fun way to build better financial habits."
        />
        <meta name="twitter:image" content={OG_IMAGE} />
        <meta name="twitter:image:alt" content="Money Garden app — budget tracking with gamification" />

        {/* Theme / PWA */}
        <meta name="theme-color" content="#346739" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Money Garden" />

        {/* Structured Data — WebApplication */}
        <script
          type="application/ld+json"
          // Static object — never interpolate user input here
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Money Garden",
              url: DOMAIN,
              description:
                "Gamified budget management app. Track expenses, earn gold coins, and grow your virtual garden while building better financial habits.",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web, iOS, Android",
              image: OG_IMAGE,
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "Budget tracking",
                "Expense management",
                "Gamification with gold coins",
                "Virtual garden",
                "Financial analytics",
                "Savings goals",
              ],
            }),
          }}
        />

        {/* Structured Data — Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Money Garden",
              url: DOMAIN,
              logo: `${DOMAIN}/favicon.ico`,
              contactPoint: {
                "@type": "ContactPoint",
                email: "help@getmoneygarden.com",
                contactType: "customer support",
              },
            }),
          }}
        />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
