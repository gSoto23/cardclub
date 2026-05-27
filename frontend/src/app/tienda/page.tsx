import React from "react";
import { TiendaContent } from "./TiendaContent";

// Server Component data fetching
async function getProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?visibility=store`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function TiendaPage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      {/* Cabecera de la Tienda */}
      <div className="mb-12 border-b border-white/10 pb-8">
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
          <span className="text-brand-yellow">Tienda</span>
        </h1>
        <p className="text-white/60 text-lg">
          Encuentra las mejores singles y productos sellados de tus TCGs favoritos sin salir de casa.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
          <p className="text-brand-yellow font-black text-xl mb-2">No hay productos disponibles</p>
          <p className="text-white/60">El backend no está corriendo o la base de datos está vacía.</p>
        </div>
      ) : (
        <TiendaContent products={products} />
      )}
    </div>
  );
}
