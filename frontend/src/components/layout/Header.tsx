"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Button } from "../ui/Button";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-brand-blue/90 backdrop-blur-md border-b border-white/10 transition-all">
      <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        {/* Logo Gamer/Creative */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 group" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-brand-yellow flex items-center justify-center text-brand-blue font-black text-lg md:text-xl transform -skew-x-12 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(255,222,0,0.5)] transition-all flex-shrink-0">
            <span className="skew-x-12">CC</span>
          </div>
          <span className="font-black text-xl md:text-2xl tracking-tighter text-white uppercase italic whitespace-nowrap">
            Card <span className="text-brand-yellow">Club</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 font-bold text-sm tracking-widest uppercase text-white/80">
          <Link href="/tienda" className="hover:text-brand-yellow hover:scale-105 transition-all">
            Mercado
          </Link>
          <Link href="/subastas" className="flex items-center gap-2 text-brand-yellow hover:text-yellow-300 hover:scale-105 transition-all">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-yellow shadow-[0_0_8px_rgba(255,222,0,0.8)]"></span>
            </span>
            Subastas en Vivo
          </Link>
          <Link href="/arena" className="hover:text-brand-yellow hover:scale-105 transition-all">
            La Arena
          </Link>
          <Link href="/ranking" className="hover:text-brand-yellow hover:scale-105 transition-all">
            Ranking
          </Link>
        </nav>

        {/* Actions (Desktop) & Hamburger (Mobile) */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Registrarse
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="primary" size="sm">
                Jugar Ahora
              </Button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 text-brand-yellow hover:scale-105 transition-transform ml-2 focus:outline-none z-50"
          >
            <span className={`w-6 h-0.5 bg-current rounded-full transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-current rounded-full transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-current rounded-full transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full h-[calc(100vh-4rem)] bg-brand-blue/95 backdrop-blur-xl border-t border-white/10 flex flex-col items-center justify-center gap-8 lg:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col items-center gap-8 font-black text-xl tracking-widest uppercase text-white">
            <Link href="/tienda" className="hover:text-brand-yellow transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Mercado
            </Link>
            <Link href="/subastas" className="text-brand-yellow hover:text-yellow-300 transition-colors flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-yellow shadow-[0_0_8px_rgba(255,222,0,0.8)]"></span>
              </span>
              Subastas en Vivo
            </Link>
            <Link href="/arena" className="hover:text-brand-yellow transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              La Arena
            </Link>
            <Link href="/ranking" className="hover:text-brand-yellow transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Ranking
            </Link>
          </nav>
          
          <div className="flex flex-col items-center gap-4 w-full px-8 mt-4">
            <Link href="/login" className="w-full">
              <Button variant="ghost" size="lg" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                Registrarse
              </Button>
            </Link>
            <Link href="/login" className="w-full">
              <Button variant="primary" size="lg" className="w-full shadow-[0_0_20px_rgba(255,222,0,0.3)]" onClick={() => setIsMobileMenuOpen(false)}>
                Jugar Ahora
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
