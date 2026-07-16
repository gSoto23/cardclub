"use client";

import React, { useState, useMemo } from "react";
import { ProductCard } from "@/components/ui/ProductCard";
import { FiSearch, FiRefreshCw } from "react-icons/fi";

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
  description?: string;
}

interface TiendaContentProps {
  products: Product[];
}

export const TiendaContent = ({ products }: TiendaContentProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSet, setSelectedSet] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryView = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  // Get unique filter values from the complete products list
  const games = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.game).filter(Boolean))).sort();
  }, [products]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(products.map((p) => p.category?.name).filter(Boolean))
    ).sort();
  }, [products]);

  const sets = useMemo(() => {
    return Array.from(
      new Set(products.map((p) => p.expansion_set).filter(Boolean))
    ).sort();
  }, [products]);

  // Determine if any filters are active
  const hasActiveFilters = searchTerm || selectedGame || selectedCategory || selectedSet;

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Text Search (Matches title, description, or set)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = product.name?.toLowerCase().includes(term);
        const matchesDesc = product.description?.toLowerCase().includes(term);
        const matchesSet = product.expansion_set?.toLowerCase().includes(term);
        if (!matchesName && !matchesDesc && !matchesSet) return false;
      }
      // 2. Game Type Filter
      if (selectedGame && product.game !== selectedGame) {
        return false;
      }
      // 3. Category Filter
      if (selectedCategory && product.category?.name !== selectedCategory) {
        return false;
      }
      // 4. Expansion Set Filter
      if (selectedSet && product.expansion_set !== selectedSet) {
        return false;
      }
      return true;
    });
  }, [products, searchTerm, selectedGame, selectedCategory, selectedSet]);

  // Group filtered products by category
  const groupedProducts = useMemo(() => {
    return filteredProducts.reduce((acc: Record<string, Product[]>, product) => {
      const categoryName = product.category?.name || "Otros";
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(product);
      return acc;
    }, {});
  }, [filteredProducts]);

  const activeCategories = useMemo(() => {
    return Object.keys(groupedProducts).sort();
  }, [groupedProducts]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedGame("");
    setSelectedCategory("");
    setSelectedSet("");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Filter panel */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-lg space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          
          {/* Search bar */}
          <div className="lg:col-span-4 relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-brand-yellow transition-colors text-lg" />
            <input
              type="text"
              placeholder="Buscar por nombre, set..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/20 border border-white/10 hover:border-white/20 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 text-white rounded-xl pl-11 pr-4 py-3 outline-none transition-all placeholder:text-white/30 text-sm font-medium"
            />
          </div>

          {/* Game filter */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-2.5">
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="w-full bg-black/20 border border-white/10 hover:border-white/20 focus:border-brand-yellow text-white rounded-xl px-4 py-3 outline-none transition-all text-sm font-semibold cursor-pointer appearance-none relative"
              style={{
                backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                backgroundPosition: "right 12px center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "20px",
                paddingRight: "40px"
              }}
            >
              <option value="" className="bg-brand-blue text-white">Todos los juegos</option>
              {games.map((g) => (
                <option key={g} value={g} className="bg-brand-blue text-white">
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-2.5">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-black/20 border border-white/10 hover:border-white/20 focus:border-brand-yellow text-white rounded-xl px-4 py-3 outline-none transition-all text-sm font-semibold cursor-pointer appearance-none relative"
              style={{
                backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                backgroundPosition: "right 12px center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "20px",
                paddingRight: "40px"
              }}
            >
              <option value="" className="bg-brand-blue text-white">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c} value={c} className="bg-brand-blue text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Set filter */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-2.5">
            <select
              value={selectedSet}
              onChange={(e) => setSelectedSet(e.target.value)}
              className="w-full bg-black/20 border border-white/10 hover:border-white/20 focus:border-brand-yellow text-white rounded-xl px-4 py-3 outline-none transition-all text-sm font-semibold cursor-pointer appearance-none relative"
              style={{
                backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                backgroundPosition: "right 12px center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "20px",
                paddingRight: "40px"
              }}
            >
              <option value="" className="bg-brand-blue text-white">Todos los sets</option>
              {sets.map((s) => (
                <option key={s} value={s} className="bg-brand-blue text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="lg:col-span-2 flex items-center justify-center gap-2 w-full bg-brand-yellow text-brand-blue hover:bg-yellow-300 font-bold px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer text-sm shadow-[0_0_15px_rgba(255,222,0,0.2)]"
            >
              <FiRefreshCw className="animate-spin-slow text-base" />
              Limpiar
            </button>
          )}

        </div>

        {/* Search indicator */}
        {hasActiveFilters && (
          <div className="text-xs text-white/50 font-bold uppercase tracking-wider flex items-center gap-2">
            <span>Resultados de búsqueda:</span>
            <span className="text-brand-yellow text-sm font-black">
              {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
            </span>
          </div>
        )}
      </div>

      {/* Product categories lists */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center space-y-4">
          <p className="text-brand-yellow font-black text-xl tracking-wide uppercase italic">
            No se encontraron productos
          </p>
          <p className="text-white/60 text-sm max-w-md">
            Intenta cambiar los filtros seleccionados o tu término de búsqueda para ver el inventario disponible.
          </p>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/10 font-bold px-5 py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          {activeCategories.map((category) => (
            <section key={category} className="flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-widest border-l-4 border-brand-yellow pl-4">
                  {category}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleCategoryView(category)}
                    className="flex items-center gap-1 text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest mr-1">
                      {expandedCategories[category] ? "Contraer" : "Ver Todos"}
                    </span>
                    {expandedCategories[category] ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {expandedCategories[category] ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-8">
                  {groupedProducts[category].map((product: any) => (
                    <div key={product.id} className="w-full">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                  {groupedProducts[category].map((product: any) => (
                    <div
                      key={product.id}
                      className="snap-start shrink-0 w-[280px] md:w-[320px]"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
