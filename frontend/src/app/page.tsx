import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 overflow-hidden bg-brand-blue">
      {/* Dynamic Background Mesh / Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-brand-yellow/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Decorative Cards (Simulated with CSS) */}
      <div className="absolute top-1/4 left-10 w-48 h-64 bg-white/5 border border-white/10 rounded-xl transform -rotate-12 blur-[2px] opacity-60 animate-[pulse_4s_ease-in-out_infinite] pointer-events-none hidden lg:block" />
      <div className="absolute bottom-1/4 right-10 w-56 h-72 bg-brand-yellow/5 border border-brand-yellow/20 rounded-xl transform rotate-12 blur-[1px] opacity-80 animate-[bounce_6s_ease-in-out_infinite] pointer-events-none hidden lg:block" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl w-full text-center space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 rounded-full bg-black/30 border border-brand-yellow/30 text-brand-yellow text-[10px] md:text-xs font-black tracking-[0.2em] uppercase backdrop-blur-sm shadow-[0_0_15px_rgba(255,222,0,0.15)] text-center max-w-[90vw]">
          <span className="w-2 h-2 rounded-full bg-brand-yellow animate-ping flex-shrink-0" />
          <span className="truncate">Temporada 1 Oficial Activa</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tighter text-white leading-[0.9] uppercase italic break-words">
          Domina <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-yellow to-yellow-600 drop-shadow-[0_0_20px_rgba(255,222,0,0.4)]">
            El Juego
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-2xl text-white/80 font-medium max-w-3xl mx-auto leading-relaxed px-2">
          El mercado definitivo y la arena competitiva para verdaderos jugadores de TCG en Costa Rica. <br className="hidden md:block" />
          <span className="text-brand-yellow font-black tracking-widest uppercase mt-4 block text-xs sm:text-sm">
            &lt; Sealed is meant to be opened &gt;
          </span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
          <Link href="/tienda">
            <Button size="lg" className="w-full sm:w-auto shadow-[0_0_30px_rgba(255,222,0,0.3)]">
              Entrar al Mercado
            </Button>
          </Link>
          <Link href="/arena">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Inscribirse a Torneo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
