import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Courier_Prime } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/sonner";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Banlieuwood — Copilote Scenario IA",
  description: "Systeme de copilote d'ecriture de scenario avec agents IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${courierPrime.variable} antialiased`}
      >
        <Providers>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto relative">
              {children}
              {/* Ambient glow - dark mode only */}
              <div className="fixed inset-0 pointer-events-none z-0 hidden dark:block">
                <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-primary/3 blur-[150px]" />
                <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] rounded-full bg-accent/3 blur-[120px]" />
              </div>
            </main>
          </div>
          <Toaster richColors position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
