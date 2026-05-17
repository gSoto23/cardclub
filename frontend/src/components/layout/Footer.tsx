import Link from "next/link";
import React from "react";

async function getConfig() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/config`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

export const Footer = async () => {
  const configs = await getConfig();
  const getVal = (key: string) => configs.find((c: any) => c.key === key)?.value || "#";

  return (
    <footer className="bg-brand-blue border-t border-white/10 py-16 mt-auto relative overflow-hidden">
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
        {/* Brand Column */}
        <div className="md:col-span-5">
          <Link href="/" className="flex items-center mb-6 group inline-flex">
            <img src="/logofooter.png" alt="Card Club" className="h-28 md:h-36 w-auto object-contain" />
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
            <li><Link href="/torneos" className="hover:text-brand-yellow transition-colors hover:translate-x-1 inline-block transform">La Arena</Link></li>
            <li><Link href="/ranking" className="hover:text-brand-yellow transition-colors hover:translate-x-1 inline-block transform">Ranking Global</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-bold text-white mb-6 text-sm tracking-widest uppercase">Soporte</h4>
          <ul className="space-y-4 text-sm text-white/60 font-medium">
            <li><Link href="/faq" className="hover:text-brand-yellow transition-colors hover:translate-x-1 inline-block transform">FAQ</Link></li>
            <li><a href={getVal('social_discord')} target="_blank" rel="noopener noreferrer" className="hover:text-brand-yellow transition-colors hover:translate-x-1 inline-block transform">Discord</a></li>
            <li><Link href="/terminos" className="hover:text-brand-yellow transition-colors hover:translate-x-1 inline-block transform">Reglas Oficiales</Link></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="font-bold text-white mb-6 text-sm tracking-widest uppercase">Comunidad</h4>
          <div className="flex gap-3 flex-wrap">
            {/* Instagram */}
            <a href={getVal('social_ig')} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:bg-brand-yellow hover:text-brand-blue hover:border-brand-yellow transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(255,222,0,0.5)] transform">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            {/* Facebook */}
            <a href={getVal('social_fb')} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:bg-brand-yellow hover:text-brand-blue hover:border-brand-yellow transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(255,222,0,0.5)] transform">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            {/* TikTok */}
            <a href={getVal('social_tiktok')} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:bg-brand-yellow hover:text-brand-blue hover:border-brand-yellow transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(255,222,0,0.5)] transform">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.8-5.46-.4-2.51.76-5.18 2.9-6.49 1.45-.92 3.23-1.22 4.88-.95.02 1.38.01 2.77.01 4.15-.81-.22-1.69-.17-2.45.16-.86.37-1.5 1.11-1.78 2.01-.29.98-.12 2.11.45 2.93.57.81 1.52 1.25 2.5 1.24 1.4-.02 2.58-1.18 2.58-2.58V.02z"/></svg>
            </a>
            {/* WhatsApp */}
            <a href={getVal('social_whatsapp')} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:bg-brand-yellow hover:text-brand-blue hover:border-brand-yellow transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(255,222,0,0.5)] transform">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="container mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-white/40 font-medium uppercase tracking-wider relative z-10">
        <p>&copy; {new Date().getFullYear()} Card Club CR. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-xs text-white/40 font-bold tracking-widest uppercase mt-6 md:mt-0">
            <Link href="/privacidad" className="hover:text-brand-yellow transition-colors">Privacidad</Link>
            <Link href="/cookies" className="hover:text-brand-yellow transition-colors">Cookies</Link>
          </div>
      </div>
    </footer>
  );
};
