import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCategory, Product, CategoryInfo } from '../types';
import { cleanDirectImageUrl } from '../lib/supabase';

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
    id: 'Embutidos',
    name: 'Carnes, Aves y Embutidos',
    description: 'Chorizos, cecina y cortes artesanales',
    imageUrl: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'Papa Nativa',
    name: 'Frutas y Verduras',
    description: 'Variedades nativas y cosechas frescas',
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'Miel y Dulces',
    name: 'Abarrotes & Miel',
    description: 'Miel pura, aceites y mermeladas',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'Congelados',
    name: 'Congelados',
    description: 'Cortes seleccionados y mariscos',
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'Desayunos',
    name: 'Desayunos',
    description: 'Cereales, granos y quinua',
    imageUrl: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'Lácteos',
    name: 'Lácteos y Huevos',
    description: 'Quesos frescos, mantequilla y huevos',
    imageUrl: 'https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'Quesos',
    name: 'Quesos y Fiambres',
    description: 'Quesos madurados y fiambres',
    imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'Panadería',
    name: 'Panadería y Pastelería',
    description: 'Panes artesanales y horneados',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400'
  }
];

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  products,
  onSelectCategory,
  isDarkMode,
  categoryImages,
  categoryNames,
  customCategories
}) => {
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Build active categories list
  const activeCategoriesList = (customCategories && customCategories.length > 0)
    ? customCategories.filter(c => c.active !== false)
    : DEFAULT_CATEGORY_DEFINITIONS;

  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.max(1, Math.ceil(activeCategoriesList.length / ITEMS_PER_PAGE));
  
  // Get slice for current page
  const visibleCategories = activeCategoriesList.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const handleCategoryClick = (catId: string) => {
    // Map category ID to existing ProductCategory values if needed
    let targetCategory: ProductCategory | 'Todos' = catId as ProductCategory;
    if (catId === 'Quesos') targetCategory = 'Lácteos';
    if (catId === 'Desayunos') targetCategory = 'Panadería';
    if (catId === 'Congelados') targetCategory = 'Embutidos';

    // If products exist directly with this category name, preserve it
    const directMatch = products.some(p => p.category === catId);
    if (directMatch) {
      targetCategory = catId as ProductCategory;
    }

    onSelectCategory(targetCategory);
  };

  return (
    <div className={`relative rounded-3xl p-6 sm:p-10 border transition-all duration-300 shadow-sm ${
      isDarkMode 
        ? 'bg-[#0d1b14] border-emerald-950/80 text-white' 
        : 'bg-white border-slate-100 text-slate-900'
    }`}>
      {/* Centered Heading */}
      <div className="text-center mb-7 sm:mb-9">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#15803d] dark:text-[#4ade80] tracking-tight">
          Categorías
        </h2>
      </div>

      {/* Grid of Circular Category Icons (4 columns per row) */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentPage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-y-7 gap-x-4 sm:gap-x-8 sm:gap-y-9 max-w-5xl mx-auto"
        >
          {visibleCategories.map((cat) => {
            const customName = categoryNames?.[cat.id] || cat.name;
            const customUrl = categoryImages?.[cat.id];
            const finalImgUrl = cleanDirectImageUrl(customUrl || '') || cat.imageUrl;

            return (
              <motion.div
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryClick(cat.id)}
                className="group flex flex-col items-center cursor-pointer select-none"
              >
                {/* Circle Container with Pastel Sky Blue Background */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-[#dceefb] dark:bg-[#1a384c] flex items-center justify-center p-2 overflow-hidden shadow-xs border-2 border-transparent group-hover:border-[#15803d]/40 transition-all duration-300">
                  <img
                    src={finalImgUrl}
                    alt={customName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = cat.imageUrl;
                    }}
                    className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500 shadow-2xs"
                  />
                </div>

                {/* Category Label */}
                <span className="mt-2.5 text-center text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug max-w-[110px] sm:max-w-[130px] line-clamp-2 group-hover:text-[#15803d] dark:group-hover:text-emerald-400 transition-colors">
                  {customName}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Pagination Pills at Bottom */}
      <div className="flex items-center justify-center gap-2 mt-8 sm:mt-10">
        {Array.from({ length: Math.max(2, totalPages) }).map((_, idx) => {
          const isActive = idx === currentPage;
          return (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx < totalPages ? idx : 0)}
              aria-label={`Página ${idx + 1}`}
              className={`h-2.5 transition-all duration-300 rounded-full ${
                isActive 
                  ? 'w-8 bg-slate-600 dark:bg-emerald-400' 
                  : 'w-3.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 cursor-pointer'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
