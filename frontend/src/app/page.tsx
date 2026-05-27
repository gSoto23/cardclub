import { Button } from "@/components/ui/Button";
import Link from "next/link";

async function getActiveChampionship() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${apiUrl}/api/championships/active`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Error fetching active championship:", err);
    return null;
  }
}

export default async function Home() {
  const activeChamp = await getActiveChampionship();
  const seasonName = activeChamp ? activeChamp.name : "Temporada 1 Oficial Activa";

  return (
    <div className="relative min-h-[calc(100vh-72px)] md:min-h-[calc(100vh-88px)] flex flex-col items-center justify-center md:justify-start pt-6 md:pt-16 pb-6 px-6 overflow-hidden bg-brand-blue">
      {/* Dynamic Background Mesh / Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-brand-yellow/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Decorative Cards (Simulated with CSS) */}
      <div className="absolute top-1/4 left-10 w-48 h-64 bg-white/5 border border-white/10 rounded-xl transform -rotate-12 blur-[2px] opacity-60 animate-[pulse_4s_ease-in-out_infinite] pointer-events-none hidden lg:block" />
      <div className="absolute bottom-1/4 right-10 w-56 h-72 bg-brand-yellow/5 border border-brand-yellow/20 rounded-xl transform rotate-12 blur-[1px] opacity-80 animate-[bounce_6s_ease-in-out_infinite] pointer-events-none hidden lg:block" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl w-full text-center flex flex-col items-center justify-around flex-grow md:flex-grow-0 md:justify-start md:space-y-6 py-4 md:py-0 animate-in fade-in slide-in-from-bottom-10 duration-1000">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 md:gap-3 px-4 py-1.5 rounded-full bg-black/30 border border-brand-yellow/30 text-brand-yellow text-xs md:text-sm font-black tracking-[0.15em] uppercase backdrop-blur-sm shadow-[0_0_15px_rgba(255,222,0,0.15)] text-center max-w-[90vw]">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow animate-ping flex-shrink-0" />
          <span className="truncate">{seasonName}</span>
        </div>

        {/* Logo Hero Image */}
        <div className="flex justify-center items-center py-0.5">
          <img
            src="/hero-logo.png"
            alt="Card Club TCG"
            className="w-[300px] sm:w-[400px] md:w-[440px] h-auto object-contain drop-shadow-[0_0_35px_rgba(255,222,0,0.25)] animate-in fade-in zoom-in-95 duration-1000"
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 md:pt-4">
          <Link href="/tienda">
            <Button size="lg" className="w-full sm:w-auto shadow-[0_0_30px_rgba(255,222,0,0.3)]">
              Entrar a Tienda
            </Button>
          </Link>
          <Link href="/torneos">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Inscribirse a Torneo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
