"use client";

import React, { useState } from "react";
import { OfferAuctionModal } from "./OfferAuctionModal";
import { useRouter } from "next/navigation";

export function OfferAuctionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleOpen = () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login?redirect=/subastas");
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      <button 
        onClick={handleOpen}
        className="mt-6 md:mt-0 px-6 py-3 bg-brand-yellow text-slate-900 font-black tracking-widest uppercase rounded-full hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,222,0,0.3)]"
      >
        Ofrecer mi Carta
      </button>

      <OfferAuctionModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
