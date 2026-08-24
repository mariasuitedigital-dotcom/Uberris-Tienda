import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Store, Check, Sparkles } from 'lucide-react';
import { ProductCategory, Product, CategoryInfo } from '../types';
import { cleanDirectImageUrl } from '../lib/supabase';
import { IncaPatternBanner } from './IncaPatternBanner';

interface HeaderCategoryBarProps {
  products: Product[];
  selectedCategory: ProductCategory | 'Todos';
  onCategorySelect: (category: ProductCategory | 'Todos') => void;
  isDarkMode: boolean;
  categoryImages?: Record<string, string>;
  categoryNames?: Record<string, string>;
  categoryDescriptions?: Record<string, string>;
  customCategories?: CategoryInfo[];
}

const DEFAULT_CATEGORIES: { id: ProductCategory; defaultName: string; defaultUrl: string }[] = [
  {
    id: 'Panadería',
    defaultName: 'Panadería Artesanal',
    defaultUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'Lácteos',
    defaultName: 'Quesería & Lácteos',
    defaultUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'Embutidos',
    defaultName: 'Embutidos & Carnes',
    defaultUrl: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'Miel y Dulces',
    defaultName: 'Miel & Dulces',
    defaultUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'Papa Nativa',
    defaultName: 'Papa Nativa',
    defaultUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400',
  },
];

export const HeaderCategoryBar: React.FC<HeaderCategoryBarProps> = ({
  products,
  selectedCategory,
  onCategorySelect,
  isDarkMode,
  categoryImages,
  categoryNames,
  customCategories,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.7;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Build items list
  const activeCustomList = (customCategories && customCategories.length > 0)
    ? customCategories.filter(c => c.active !== false)
    : null;

  const categoriesToRender = activeCustomList
    ? activeCustomList.map(c => ({
        id: c.id as ProductCategory,
        name: categoryNames?.[c.id] || c.name,
        imageUrl: cleanDirectImageUrl(categoryImages?.[c.id] || '') || c.imageUrl,
      }))
    : DEFAULT_CATEGORIES.map(c => ({
        id: c.id,
        name: categoryNames?.[c.id] || c.defaultName,
        imageUrl: cleanDirectImageUrl(categoryImages?.[c.id] || '') || c.defaultUrl,
      }));

  const totalProductsCount = products.length;

  return (
    <div className={`relative w-full border-b transition-colors ${
      isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-[#f4f7f4] border-emerald-100 shadow-2xs'
    }`}>
      {/* Background Inca Manto Pattern Strip */}
      <div className="absolute inset-0 z-0 opacity-25 overflow-hidden">
        <IncaPatternBanner height="100%" opacity={isDarkMode ? 0.35 : 0.25} />
        {/* Subtle overlay gradient to keep text readable */}
        <div className={`absolute inset-0 backdrop-blur-[1px] ${
          isDarkMode
            ? 'bg-gradient-to-r from-[#08100c]/90 via-[#08100c]/70 to-[#08100c]/90'
            : 'bg-gradient-to-r from-[#f4f7f4]/90 via-[#ffffff]/75 to-[#f4f7f4]/90'
        }`} />
      </div>

      {/* Decorative Top & Bottom Woven Inca Border Stripes */}
      <div className="relative z-10 w-full h-1 bg-gradient-to-r from-red-600 via-amber-400 to-emerald-600 opacity-90" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        
        {/* Navigation Arrows (Desktop) */}
        <button
          onClick={() => handleScroll('left')}
          className={`hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full items-center justify-center border shadow-md transition-all active:scale-95 ${
            isDarkMode 
              ? 'bg-[#0d1712] border-[#1c3326] text-white hover:bg-emerald-900/50' 
              : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50'
          }`}
          aria-label="Desplazar a la izquierda"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleScroll('right')}
          className={`hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full items-center justify-center border shadow-md transition-all active:scale-95 ${
            isDarkMode 
              ? 'bg-[#0d1712] border-[#1c3326] text-white hover:bg-emerald-900/50' 
              : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50'
          }`}
          aria-label="Desplazar a la derecha"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Scrollable Categories List */}
        <div
          ref={scrollRef}
          className="flex items-start justify-start sm:justify-center gap-3 sm:gap-6 overflow-x-auto scrollbar-none py-1 px-2 sm:px-6 select-none"
        >
          {/* 1. Item "TODOS" */}
          <div
            onClick={() => onCategorySelect('Todos')}
            className="flex flex-col items-center shrink-0 cursor-pointer group text-center"
            style={{ width: '80px' }}
          >
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-0.5 rounded-full transition-all shadow-md ${
                selectedCategory === 'Todos'
                  ? 'bg-gradient-to-tr from-amber-400 via-pink-500 via-purple-500 to-emerald-400 shadow-emerald-500/40 ring-2 ring-amber-400'
                  : 'bg-gradient-to-tr from-purple-600/40 via-amber-400/40 to-emerald-500/40 group-hover:from-purple-500 group-hover:to-amber-400'
              }`}
            >
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all ${
                selectedCategory === 'Todos'
                  ? 'bg-gradient-to-tr from-[#2d6e20] to-[#60b64d] text-white'
                  : isDarkMode
                  ? 'bg-[#0e1c14] text-slate-200 group-hover:text-white'
                  : 'bg-white text-slate-700 group-hover:text-emerald-700'
              }`}>
                <Store className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-xs" />
                {selectedCategory === 'Todos' && (
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 rounded-full p-0.5 shadow-md border border-slate-900">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </div>
            </motion.div>
            
            <span className={`text-[11px] sm:text-xs font-bold mt-1.5 leading-tight line-clamp-1 transition-colors ${
              selectedCategory === 'Todos'
                ? 'text-[#60b64d] font-extrabold'
                : isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-emerald-700'
            }`}>
              Todos
            </span>
            <span className="text-[10px] font-medium text-emerald-500 mt-0.5">
              {totalProductsCount} prods
            </span>
          </div>

          {/* 2. Category Items (Panadería, Lácteos, Embutidos, Miel, Papa Nativa, etc.) */}
          {categoriesToRender.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = products.filter((p) => p.category === cat.id).length;

            return (
              <div
                key={cat.id}
                onClick={() => onCategorySelect(cat.id)}
                className="flex flex-col items-center shrink-0 cursor-pointer group text-center"
                style={{ width: '84px' }}
              >
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-0.5 rounded-full transition-all shadow-md ${
                    isSelected
                      ? 'bg-gradient-to-tr from-purple-600 via-pink-500 via-amber-400 via-cyan-400 to-red-600 shadow-amber-500/30 ring-2 ring-amber-400'
                      : 'bg-gradient-to-tr from-purple-600/30 via-amber-400/30 to-emerald-500/30 group-hover:from-purple-500 group-hover:to-amber-400'
                  }`}
                >
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden">
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400';
                      }}
                    />

                    {/* Glass overlay */}
                    <div className={`absolute inset-0 transition-opacity ${
                      isSelected ? 'bg-black/10' : 'bg-black/25 group-hover:bg-black/10'
                    }`} />

                    {/* Active Badge */}
                    {isSelected && (
                      <span className="absolute top-1 right-1 bg-amber-400 text-slate-950 rounded-full p-0.5 shadow-md border border-slate-900">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* Category Label */}
                <span className={`text-[11px] sm:text-xs font-bold mt-1.5 leading-tight line-clamp-2 transition-colors ${
                  isSelected
                    ? 'text-amber-400 font-extrabold scale-105 drop-shadow-xs'
                    : isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-800 group-hover:text-emerald-700'
                }`}>
                  {cat.name}
                </span>

                {/* Count Badge */}
                <span className={`text-[10px] font-semibold mt-0.5 ${
                  isSelected ? 'text-amber-400 font-bold' : 'text-slate-400'
                }`}>
                  {count} {count === 1 ? 'opción' : 'opciones'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
