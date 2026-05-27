import React from "react";

// Server component para cargar configuración de membresía
async function getMembershipData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/config`, { cache: "no-store" });
    if (!res.ok) return { content: "<p>Próximamente información sobre nuestras membresías.</p>", banner: "/membership_pass.png" };
    const configs = await res.json();
    const content = configs.find((c: any) => c.key === "page_membership")?.value || "<p>Próximamente información sobre nuestras membresías.</p>";
    const banner = configs.find((c: any) => c.key === "page_membership_banner")?.value || "/membership_pass.png";
    return { content, banner };
  } catch (err) {
    return {
      content: "<p>Error cargando información de membresía.</p>",
      banner: "/membership_pass.png"
    };
  }
}

export default async function MembershipPage() {
  const { content, banner } = await getMembershipData();

  return (
    <div className="min-h-[70vh] bg-brand-blue pt-16 pb-24">
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-12 drop-shadow-[0_0_15px_rgba(255,222,0,0.2)]">
          Membresía <span className="text-brand-yellow">Card Club</span>
        </h1>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 text-white/80 prose prose-invert prose-brand max-w-none flex flex-col items-center">
          {banner && (
            <img 
              src={banner} 
              alt="Banner de Membresía Card Club" 
              className="w-full rounded-xl shadow-[0_0_30px_rgba(255,222,0,0.15)] border border-brand-yellow/20 mb-8 transform hover:scale-[1.01] transition-transform duration-300 max-h-[380px] object-cover"
            />
          )}
          <div 
            className="w-full"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
}
