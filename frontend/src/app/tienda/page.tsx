import React from "react";
import { ProductCard } from "@/components/ui/ProductCard";

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

  // Group products by category
  const groupedProducts = products.reduce((acc: any, product: any) => {
    const categoryName = product.category?.name || "Otros";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {});

  // Sort categories to show specific ones first if we want, or just alphabetize
  const categories = Object.keys(groupedProducts).sort();

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

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
          <p className="text-brand-yellow font-black text-xl mb-2">No hay productos disponibles</p>
          <p className="text-white/60">El backend no está corriendo o la base de datos está vacía.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {categories.map((category) => (
            <section key={category} className="flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-widest border-l-4 border-brand-yellow pl-4">
                  {category}
                </h2>
                <div className="flex gap-2">
                  {/* Flechas decorativas para indicar scroll */}
                  <div className="hidden md:flex items-center gap-1 text-white/40">
                    <span className="text-xs font-bold uppercase tracking-widest mr-2">Desliza</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </div>
              </div>

              {/* Contenedor Horizontal con Snap */}
              <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {groupedProducts[category].map((product: any) => (
                  <div key={product.id} className="snap-start shrink-0 w-[280px] md:w-[320px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
