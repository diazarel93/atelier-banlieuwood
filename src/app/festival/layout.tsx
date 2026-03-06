import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Le Festival | Banlieuwood",
  description: "Galerie des meilleures creations, votes et palmares",
};

export default function FestivalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.classList.add('light');document.documentElement.classList.remove('dark');`,
        }}
      />
      {children}
    </div>
  );
}
