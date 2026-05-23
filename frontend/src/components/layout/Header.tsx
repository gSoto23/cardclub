"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "../ui/Button";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const { cartItems, cartCount, cartTotal, removeFromCart, updateQuantity } = useCart();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setIsLoggedIn(true);
      try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        setUserRole(decodedPayload.role);
      } catch (e) {
        console.error("Error decoding token in Header", e);
      }
    }
  }, []);

  const formatCRC = (amount: number) => {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-brand-blue/90 backdrop-blur-md border-b border-white/10 transition-all">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6 flex items-center justify-between">
          {/* Logo Gamer/Creative */}
          <Link href="/" className="flex items-center group" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/logo.png" alt="Card Club" className="h-[60px] md:h-[88px] w-auto object-contain group-hover:scale-105 group-hover:drop-shadow-[0_0_15px_rgba(255,222,0,0.5)] transition-all flex-shrink-0" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 font-bold text-sm tracking-widest uppercase text-white/80">
            <Link href="/tienda" className="hover:text-brand-yellow hover:scale-105 transition-all">
              Shop Tienda
            </Link>
            <Link href="/subastas" className="flex items-center gap-2 text-brand-yellow hover:text-yellow-300 hover:scale-105 transition-all">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-yellow shadow-[0_0_8px_rgba(255,222,0,0.8)]"></span>
              </span>
              Subastas en Vivo
            </Link>
            <Link href="/torneos" className="hover:text-brand-yellow hover:scale-105 transition-all">
              Calendario de eventos
            </Link>
            <Link href="/ranking" className="hover:text-brand-yellow hover:scale-105 transition-all">
              Ranking
            </Link>
            <Link href="/membresia" className="hover:text-brand-yellow hover:scale-105 transition-all text-brand-yellow">
              Membresía
            </Link>
          </nav>

          {/* Actions (Desktop) & Hamburger (Mobile) */}
          <div className="flex items-center gap-3">
            
            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-white/80 hover:text-brand-yellow transition-colors mr-2 lg:mr-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full transform translate-x-1 -translate-y-1">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="hidden lg:flex items-center gap-3">
              {isLoggedIn ? (
                <Link href={userRole === "admin" ? "/admin/dashboard" : "/lounge"}>
                  <Button variant="primary" size="sm">
                    {userRole === "admin" ? "Admin Panel" : "Mi Perfil"}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button variant="ghost" size="sm">
                      Registrarse
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="primary" size="sm">
                      Jugar Ahora
                    </Button>
                  </Link>
                </>
              )}
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
                Shop Tienda
              </Link>
              <Link href="/subastas" className="text-brand-yellow hover:text-yellow-300 transition-colors flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-yellow shadow-[0_0_8px_rgba(255,222,0,0.8)]"></span>
                </span>
                Subastas en Vivo
              </Link>
              <Link href="/torneos" className="hover:text-brand-yellow transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Calendario de eventos
              </Link>
              <Link href="/ranking" className="hover:text-brand-yellow transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Ranking
              </Link>
              <Link href="/membresia" className="text-brand-yellow hover:text-yellow-300 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Membresía
              </Link>
            </nav>
            
            <div className="flex flex-col items-center gap-4 w-full px-8 mt-4">
              {isLoggedIn ? (
                <Link href={userRole === "admin" ? "/admin/dashboard" : "/lounge"} className="w-full">
                  <Button variant="primary" size="lg" className="w-full shadow-[0_0_20px_rgba(255,222,0,0.3)]" onClick={() => setIsMobileMenuOpen(false)}>
                    {userRole === "admin" ? "Admin Panel" : "Mi Perfil"}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register" className="w-full">
                    <Button variant="ghost" size="lg" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                      Registrarse
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full">
                    <Button variant="primary" size="lg" className="w-full shadow-[0_0_20px_rgba(255,222,0,0.3)]" onClick={() => setIsMobileMenuOpen(false)}>
                      Jugar Ahora
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Cart Slide-over MOVED OUTSIDE HEADER TO FIX POSITIONING */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-brand-blue border-l border-white/10 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-black italic uppercase text-white tracking-widest">
                Tu <span className="text-brand-yellow">Carrito</span>
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="text-white/60 hover:text-white p-2">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-brand-blue">
              {cartItems.length === 0 ? (
                <div className="text-center text-white/40 mt-20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 opacity-50"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                  <p>Tu carrito está vacío.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-black/20 p-3 rounded-xl border border-white/5 relative group">
                    <img src={item.image_url || 'https://via.placeholder.com/150'} alt={item.name} className="w-16 h-20 object-cover rounded bg-black/40" />
                    <div className="flex-1 flex flex-col">
                      <h4 className="text-white font-bold text-sm line-clamp-2 pr-6">{item.name}</h4>
                      <p className="text-brand-yellow font-mono text-sm mt-auto">{formatCRC(item.price)}</p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded bg-white/10 text-white hover:bg-white/20 flex items-center justify-center text-xs">-</button>
                        <span className="text-white text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded bg-white/10 text-white hover:bg-white/20 flex items-center justify-center text-xs">+</button>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="absolute top-2 right-2 text-white/20 hover:text-red-400 p-1 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-black/40">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-white/60 font-bold uppercase tracking-widest text-sm">Total</span>
                  <span className="text-brand-yellow font-black text-2xl">{formatCRC(cartTotal)}</span>
                </div>
                <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                  <Button variant="primary" className="w-full py-4 text-lg">
                    Proceder al Pago
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
