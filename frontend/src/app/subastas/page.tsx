import React from "react";
import { ActiveAuctionCard } from "@/components/ui/ActiveAuctionCard";

import { OfferAuctionButton } from "@/components/ui/OfferAuctionButton";

async function getActiveAuctions() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions/active`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getFinishedAuctions() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions/finished`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function SubastasPage() {
  const auctions = await getActiveAuctions();
  const finishedAuctions = await getFinishedAuctions();

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 min-h-[70vh]">
      {/* Cabecera de Subastas */}
      <div className="mb-12 border-b border-white/10 pb-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        <div>
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-black tracking-[0.2em] uppercase backdrop-blur-sm mb-6 shadow-[0_0_15px_rgba(255,222,0,0.15)]">
            <span className="w-2 h-2 rounded-full bg-brand-yellow animate-ping" />
            En Vivo y Programadas
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4 drop-shadow-[0_0_15px_rgba(255,222,0,0.2)]">
            Arena de <span className="text-brand-yellow">Subastas</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Puja en tiempo real por las cartas más raras y exclusivas. Las ofertas se actualizan al instante para todos los jugadores.
          </p>
        </div>
        
        <OfferAuctionButton />
      </div>

      {/* Slider de Subastas Activas */}
      {auctions.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] mb-16">
          <p className="text-white/60 font-medium">No hay subastas activas en este momento.</p>
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 mb-16">
          {auctions.map((auction: any) => (
            <div key={auction.id} className="snap-start shrink-0 w-[320px] md:w-[380px]">
              <ActiveAuctionCard initialAuction={auction} />
            </div>
          ))}
        </div>
      )}

      {/* Salón de la Fama / Productos Subastados */}
      {finishedAuctions.length > 0 && (
        <div className="mt-24 pt-12 border-t border-white/10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
              Historial de <span className="text-brand-yellow">Subastas</span>
            </h2>
            <div className="hidden md:flex items-center gap-1 text-white/40">
              <span className="text-xs font-bold uppercase tracking-widest mr-2">Desliza</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </div>
          
          <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {finishedAuctions.map((auction: any) => (
              <div key={auction.id} className="snap-start shrink-0 w-[260px] md:w-[300px] bg-white/5 border border-white/10 rounded-xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 flex flex-col opacity-70 hover:opacity-100">
                <div className="h-40 bg-black/40 overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                    <span className="border-2 border-red-500 text-red-500 font-black text-2xl uppercase tracking-widest px-4 py-1 -rotate-12 rounded">Vendido</span>
                  </div>
                  {auction.image_url ? (
                    <img src={auction.image_url} alt={auction.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">NO IMG</div>
                  )}
                </div>
                
                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="text-white font-bold text-lg leading-tight mb-2">{auction.product_name}</h3>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {auction.condition && <span className="bg-white/10 text-white text-[9px] px-1.5 py-0.5 rounded border border-white/20 uppercase">{auction.condition}</span>}
                    {auction.category_name && <span className="bg-purple-600/60 text-white text-[9px] px-1.5 py-0.5 rounded border border-white/20 uppercase">{auction.category_name}</span>}
                    {auction.is_foil && <span className="bg-yellow-500 text-black font-bold text-[9px] px-1.5 py-0.5 rounded uppercase">Foil</span>}
                  </div>
                  
                  <div className="mt-auto bg-black/40 p-3 rounded-lg border border-white/5">
                    <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Precio Final</p>
                    <p className="text-brand-yellow font-black text-xl">₡{new Intl.NumberFormat('es-CR').format(auction.final_price)}</p>
                    
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Ganador</p>
                      <p className="text-white text-xs font-mono truncate">{auction.winner}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
