import Link from "next/link";
import React from "react";

export const Footer = () => {
  return (
    <footer className="bg-brand-blue border-t border-white/10 py-16 mt-auto relative overflow-hidden">
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
        {/* Brand Column */}
        <div className="md:col-span-5">
          <Link href="/" className="flex items-center gap-3 mb-6 group inline-flex">
            <div className="w-10 h-10 rounded-lg bg-brand-yellow flex items-center justify-center text-brand-blue font-black text-xl transform -skew-x-12">
              <span className="skew-x-12">CC</span>
            </div>
            <span className="font-black text-2xl tracking-tighter text-white uppercase italic">
              Card <span className="text-brand-yellow">Club</span>
            </span>
          </Link>
          <p className="text-white/70 text-sm leading-relaxed max-w-sm font-medium">
            <span className="text-brand-yellow">Sealed is meant to be opened.</span> El ecosistema definitivo para coleccionistas y verdaderos jugadores de TCG en Costa Rica.
          </p>
        </div>
        
        {/* Links Columns */}
        <div className="md:col-span-2">
          <h4 className="font-bold text-white mb-6 text-sm tracking-widest uppercase">Plataforma</h4>
          <ul className="space-y-4 text-sm text-white/60 font-medium">
            <li><Link href="/tienda" className="hover:text-brand-yellow transition-colors hover:translate-x-1 inline-block transform">Mercado</Link></li>
            <li><Link href="/subastas" className="hover:text-brand-yellow transition-colors hover:translate-x-1 inline-block transform">Subastas en Vivo</Link></li>
            <li><Link href="/arena" className="hover:text-brand-yellow transition-colors hover:translate-x-1 inline-block transform">La Arena</Link></li>
            <li><Link href="/ranking" className="hover:text-brand-yellow transition-colors hover:translate-x-1 inline-block transform">Ranking Global</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-bold text-white mb-6 text-sm tracking-widest uppercase">Soporte</h4>
          <ul className="space-y-4 text-sm text-white/60 font-medium">
            <li><Link href="/faq" className="hover:text-brand-yellow transition-colors hover:translate-x-1 inline-block transform">FAQ</Link></li>
            <li><Link href="/contacto" className="hover:text-brand-yellow transition-colors hover:translate-x-1 inline-block transform">Discord</Link></li>
            <li><Link href="/terminos" className="hover:text-brand-yellow transition-colors hover:translate-x-1 inline-block transform">Reglas Oficiales</Link></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="font-bold text-white mb-6 text-sm tracking-widest uppercase">Comunidad</h4>
          <div className="flex gap-4">
            <a href="#" className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:bg-brand-yellow hover:text-brand-blue hover:border-brand-yellow transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(255,222,0,0.5)] transform">
              <span className="font-black italic">IG</span>
            </a>
            <a href="#" className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:bg-brand-yellow hover:text-brand-blue hover:border-brand-yellow transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(255,222,0,0.5)] transform">
              <span className="font-black italic">FB</span>
            </a>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="container mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-white/40 font-medium uppercase tracking-wider relative z-10">
        <p>&copy; {new Date().getFullYear()} Card Club CR. Todos los derechos reservados.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link href="/privacidad" className="hover:text-brand-yellow">Privacidad</Link>
          <Link href="/cookies" className="hover:text-brand-yellow">Cookies</Link>
        </div>
      </div>
    </footer>
  );
};
