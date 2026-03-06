import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Le Studio | Banlieuwood",
  description: "Ton espace personnel de creation cinematographique",
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Light mode script — sets class before paint to avoid flash */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.classList.add('light');document.documentElement.classList.remove('dark');`,
        }}
      />
      {children}
    </div>
  );
}
