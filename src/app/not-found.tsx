import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#0a0a16] text-[#f0f0f8] px-6">
      <div className="text-center">
        <div className="text-[100px] mb-6">🎬</div>
        <h1 className="text-[clamp(80px,15vw,120px)] font-black text-[#64748b] leading-none mb-3">404</h1>
        <h2 className="text-[22px] font-bold mb-4">Scene coupee au montage</h2>
        <p className="text-[14px] text-[#94a3b8] max-w-[400px] mx-auto mb-8">
          Cette page n&apos;existe pas — comme une scene qui n&apos;a pas survecu au montage final.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl text-[14px] font-bold text-white bg-gradient-to-r from-bw-violet to-[#f472b6] shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_8px_32px_rgba(139,92,246,0.5)] transition-all"
          >
            Retour a l&apos;accueil
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-xl text-[14px] font-bold text-[#f0f0f8] bg-[#181838] border border-[#252550] hover:border-bw-violet transition-all"
          >
            Contacter le support
          </Link>
        </div>
      </div>
    </div>
  );
}
