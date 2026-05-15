import React from "react";
import { ProductCard } from "@/components/ui/ProductCard";

// Server Component data fetching
async function getProducts() {
  try {
    // Evitar cache para ver los datos en tiempo real durante desarrollo
    const res = await fetch("http://127.0.0.1:8000/api/products", { cache: 'no-store' });
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
          Mercado <span className="text-brand-yellow">TCG</span>
        </h1>
        <p className="text-white/60 text-lg">
          Encuentra las mejores cartas sueltas y productos sellados.
        </p>
      </div>

      {/* Grid de Productos */}
      {products.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
          <p className="text-brand-yellow font-black text-xl mb-2">No hay productos disponibles</p>
          <p className="text-white/60">El backend no está corriendo o la base de datos está vacía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
