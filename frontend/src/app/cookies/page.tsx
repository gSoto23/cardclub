import React from "react";

// Server component para cargar configuración
async function getCookiesContent() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/config`, { cache: "no-store" });
    if (!res.ok) return null;
    const configs = await res.json();
    return configs.find((c: any) => c.key === "page_cookies")?.value || "<p>Contenido no disponible.</p>";
  } catch (err) {
    return "<p>Error cargando la política de cookies.</p>";
  }
}

export default async function CookiesPage() {
  const content = await getCookiesContent();

  return (
    <div className="min-h-[70vh] bg-brand-blue pt-16 pb-24">
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-12 drop-shadow-[0_0_15px_rgba(255,222,0,0.2)]">
          Política de <span className="text-brand-yellow">Cookies</span>
        </h1>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 text-white/80 prose prose-invert prose-brand max-w-none"
             dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}
