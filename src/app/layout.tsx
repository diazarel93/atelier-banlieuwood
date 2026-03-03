import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Bebas_Neue, Courier_Prime } from "next/font/google";
import { Providers } from "./providers";
import { Analytics } from "@/components/analytics";
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

export const viewport: Viewport = {
  themeColor: "#08090E",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: {
    default: "Banlieuwood — Le jeu collaboratif de creation cinematographique",
    template: "%s | Banlieuwood",
  },
  description:
    "Ecrivez un court-metrage ensemble. De 5 a 30 joueurs sur telephone. En classe, en famille ou entre amis. Gratuit, sans compte pour les joueurs.",
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
    description: "Le jeu ou 5 a 30 joueurs construisent une histoire de film ensemble, chacun sur son telephone. Gratuit, sans inscription.",
    type: "website",
    siteName: "Banlieuwood",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Banlieuwood — Le jeu cinema collaboratif",
    description: "5 a 30 joueurs ecrivent un court-metrage ensemble sur telephone. EdTech cinema.",
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
    <html lang="fr" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${jakarta.variable} ${bebasNeue.variable} ${courierPrime.variable} font-sans antialiased bg-bw-bg text-bw-text`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
