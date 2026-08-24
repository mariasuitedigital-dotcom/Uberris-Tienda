import React from 'react';
import { motion } from 'motion/react';
import { ProductCategory, Product, CategoryInfo } from '../types';
import { cleanDirectImageUrl } from '../lib/supabase';
import { IncaPatternBanner } from './IncaPatternBanner';

interface CategoriesGridProps {
  products: Product[];
  onSelectCategory: (category: ProductCategory | 'Todos') => void;
  isDarkMode: boolean;
  categoryImages?: Record<string, string>;
  categoryNames?: Record<string, string>;
  categoryDescriptions?: Record<string, string>;
  customCategories?: CategoryInfo[];
}

const DEFAULT_CATEGORY_DEFINITIONS: CategoryInfo[] = [
  {
    id: 'Panadería',
    name: 'Panadería Artesanal',
    description: 'Panes tradicionales horneados a la leña',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'Lácteos',
    name: 'Quesería & Lácteos',
    description: 'Quesos frescos, madurados y manjar blanco',
    imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'Embutidos',
    name: 'Embutidos & Carnes',
    description: 'Chorizos, cecina y jamones artesanales',
    imageUrl: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'Miel y Dulces',
    name: 'Miel & Dulces',
    description: 'Miel pura de abeja y mermeladas puras',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'Papa Nativa',
    name: 'Papa Nativa',
    description: 'Variedades nativas cultivadas en altura',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=800'
  }
];

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  products,
  onSelectCategory,
  isDarkMode,
  categoryImages,
  categoryNames,
  categoryDescriptions,
  customCategories
}) => {
  // Use custom categories list if configured and active, or fallback to default
  const activeCategoriesList = (customCategories && customCategories.length > 0)
    ? customCategories.filter(c => c.active !== false)
    : DEFAULT_CATEGORY_DEFINITIONS;

  return (
    <div className={`relative rounded-2xl overflow-hidden p-3.5 sm:p-5 border transition-all ${
      isDarkMode 
        ? 'bg-[#0b1611] border-[#1c3326]' 
        : 'bg-white border-emerald-100/80 shadow-md'
    }`}>
      {/* Header Section */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 rounded-full bg-emerald-500" />
          <h2 className={`text-sm sm:text-base font-serif-craft font-bold tracking-tight ${
            isDarkMode ? 'text-emerald-100' : 'text-slate-800'
          }`}>
            Explorar por Categorías
          </h2>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
          isDarkMode ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          {activeCategoriesList.length} categorías
        </span>
      </div>

      {/* Grid of Categories - Compact Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
        {activeCategoriesList.map((cat) => {
          const count = products.filter((p) => p.category === cat.id).length;
          const customName = categoryNames?.[cat.id] || cat.name;
          const customDesc = categoryDescriptions?.[cat.id] || cat.description;
          const customUrl = categoryImages?.[cat.id];
          const finalImgUrl = cleanDirectImageUrl(customUrl || '') || cat.imageUrl;

          return (
            <motion.div
              key={cat.id}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectCategory(cat.id as ProductCategory)}
              className="group relative h-28 sm:h-36 rounded-xl overflow-hidden cursor-pointer shadow-sm border border-black/5 transition-all duration-300 hover:shadow-md"
            >
              {/* Image background */}
              <img
                src={finalImgUrl}
                alt={customName}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = cat.imageUrl;
                }}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Gradient Overlay for high contrast legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity group-hover:opacity-95" />

              {/* Top Inca Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-400 via-cyan-400 to-emerald-500 opacity-90" />

              {/* Card Text details */}
              <div className="absolute inset-0 p-2.5 sm:p-3 flex flex-col justify-end text-white">
                <h3 className="font-serif-craft font-bold text-xs sm:text-sm leading-tight group-hover:text-emerald-300 transition-colors drop-shadow-sm line-clamp-1">
                  {customName}
                </h3>
                {customDesc && (
                  <p className="text-[10px] text-slate-300 font-normal line-clamp-1 mt-0.5 opacity-85">
                    {customDesc}
                  </p>
                )}
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-medium">
                    {count} {count === 1 ? 'opción' : 'opciones'}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

