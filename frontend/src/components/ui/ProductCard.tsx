"use client";

import React from "react";
import { Button } from "./Button";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

interface Product {
  id: number;
  name: string;
  price: number;
  game: string;
  expansion_set: string;
  condition: string;
  is_foil: boolean;
  image_url: string;
  category?: { name: string };
  stock?: number;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  const formatCRC = (amount: number) => {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(amount);
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div className={`group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full ${isOutOfStock ? 'opacity-50 grayscale' : 'hover:border-brand-yellow/50 hover:shadow-[0_0_20px_rgba(255,222,0,0.15)]'}`}>
      {/* Etiqueta Condición y Categoría */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        <div className="flex gap-2">
          <span className="bg-brand-blue/80 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded border border-white/20 uppercase tracking-wider">
            {product.condition}
          </span>
          {product.category && (
            <span className="bg-purple-600/80 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded border border-white/20 uppercase tracking-wider">
              {product.category.name}
            </span>
          )}
        </div>
        {product.is_foil && (
          <span className="self-start bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 text-brand-blue text-xs font-black px-2 py-1 rounded uppercase tracking-wider shadow-sm">
            Foil
          </span>
        )}
      </div>

      {isOutOfStock && (
        <div className="absolute top-3 right-3 z-20">
          <span className="bg-red-500/80 backdrop-blur-md text-white text-xs font-black px-2 py-1 rounded border border-red-500/50 uppercase tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            Agotado
          </span>
        </div>
      )}

      {/* Imagen */}
      <div className="relative w-full aspect-[3/4] bg-black/40 overflow-hidden flex items-center justify-center p-4">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-white/20 font-bold uppercase tracking-widest rotate-[-45deg] text-2xl">
            {product.game}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col flex-grow bg-gradient-to-t from-brand-blue to-transparent">
        <div className="text-brand-yellow text-[10px] font-black uppercase tracking-widest mb-1">
          {product.game} &bull; {product.expansion_set}
        </div>
        <h3 className="text-white font-bold text-lg leading-tight mb-4 flex-grow group-hover:text-brand-yellow transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-end justify-between mt-auto pt-4 border-t border-white/10">
          <div>
            <span className="text-white/60 text-xs uppercase tracking-widest block mb-0.5">Precio</span>
            <span className="text-2xl font-black text-brand-yellow">
              {formatCRC(product.price)}
            </span>
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            className="px-4"
            disabled={isOutOfStock}
            onClick={() => addToCart(product)}
          >
            {isOutOfStock ? 'Agotado' : 'Añadir'}
          </Button>
        </div>
      </div>
    </div>
  );
};
