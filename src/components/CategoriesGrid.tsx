import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCategory, Product, CategoryInfo, StoreSettings } from '../types';
import { cleanDirectImageUrl } from '../lib/supabase';
import { getMergedCategories } from '../utils/categories';

interface CategoriesGridProps {
  products: Product[];
  onSelectCategory: (category: ProductCategory | 'Todos') => void;
  isDarkMode: boolean;
  categoryImages?: Record<string, string>;
  categoryNames?: Record<string, string>;
  categoryDescriptions?: Record<string, string>;
  customCategories?: CategoryInfo[];
  settings?: StoreSettings;
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  products,
  onSelectCategory,
  isDarkMode,
  categoryImages,
  categoryNames,
  categoryDescriptions,
  customCategories,
  settings
}) => {
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Synthesize store settings if not provided directly
  const effectiveSettings: StoreSettings = settings || {
    categoryNames: categoryNames || {},
    categoryImages: categoryImages || {},
    categoryDescriptions: categoryDescriptions || {},
    customCategories: customCategories || []
  };

  const activeCategoriesList = getMergedCategories(effectiveSettings, products);

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
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 sm:mt-10">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const isActive = idx === currentPage;
            return (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
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
      )}
    </div>
  );
};
