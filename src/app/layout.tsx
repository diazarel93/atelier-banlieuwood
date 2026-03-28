import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Bebas_Neue, Courier_Prime, Caveat } from "next/font/google";
import { Providers } from "./providers";
import { Analytics } from "@/components/analytics";
import { ServiceWorkerRegister } from "@/components/sw-register";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-cinema",
  weight: "400",
  subsets: ["latin"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-handwritten",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#f97316",
  colorScheme: "light",
};

export const metadata: Metadata = {
  title: {
    default: "Banlieuwood — Le jeu collaboratif de creation cinematographique",
    template: "%s | Banlieuwood",
  },
  description:
    "Ecrivez un court-metrage ensemble. De 5 a 30 joueurs sur tablette ou ordinateur. En classe, en famille ou entre amis. Gratuit, sans compte pour les joueurs.",
  keywords: [
    "jeu educatif", "creation collaborative", "cinema", "court-metrage",
    "classe", "famille", "storytelling", "EdTech", "serious game",
    "ecriture collaborative", "pedagogie", "IA",
  ],
  authors: [{ name: "Banlieuwood" }],
  creator: "Banlieuwood",
  metadataBase: new URL("https://banlieuwood.fr"),
  openGraph: {
    title: "Banlieuwood — Ecrivez un court-metrage ensemble",
    description: "Le jeu ou 5 a 30 joueurs construisent une histoire de film ensemble, chacun sur sa tablette ou son ordinateur. Gratuit, sans inscription.",
    type: "website",
    siteName: "Banlieuwood",
    locale: "fr_FR",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Banlieuwood — Le jeu cinema collaboratif" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Banlieuwood — Le jeu cinema collaboratif",
    description: "5 a 30 joueurs ecrivent un court-metrage ensemble sur tablette ou ordinateur. EdTech cinema.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Banlieuwood",
              applicationCategory: "EducationalApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
              description: "Jeu collaboratif de creation cinematographique. 5 a 30 joueurs ecrivent un court-metrage ensemble.",
              educationalUse: ["classroom", "group activity"],
              audience: { "@type": "EducationalAudience", educationalRole: "student" },
              inLanguage: "fr",
            }),
          }}
        />
      </head>
      <body className={`${jakarta.variable} ${bebasNeue.variable} ${courierPrime.variable} ${caveat.variable} font-sans antialiased bg-bw-bg text-bw-text`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-bw-primary focus:text-white focus:text-sm focus:font-semibold">
          Aller au contenu principal
        </a>
        <Providers><main id="main-content">{children}</main></Providers>
        <Analytics />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
