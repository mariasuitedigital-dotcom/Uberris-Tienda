import React from 'react';
import { motion } from 'motion/react';
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
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {activeCategoriesList.map((cat) => {
        const count = products.filter((p) => p.category === cat.id).length;
        const customName = categoryNames?.[cat.id] || cat.name;
        const customDesc = categoryDescriptions?.[cat.id] || cat.description;
        const customUrl = categoryImages?.[cat.id];
        const finalImgUrl = cleanDirectImageUrl(customUrl || '') || cat.imageUrl;

        return (
          <motion.div
            key={cat.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCategory(cat.id as ProductCategory)}
            className="group relative h-40 sm:h-52 rounded-3xl overflow-hidden cursor-pointer shadow-md border border-black/5"
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity group-hover:opacity-90" />

            {/* Text details */}
            <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end text-white">
              <h3 className="font-serif-craft font-bold text-base sm:text-lg leading-tight group-hover:text-[#60b64d] transition-colors">
                {customName}
              </h3>
              {customDesc && (
                <p className="text-[11px] text-slate-300 font-normal line-clamp-1 mt-0.5 opacity-90">
                  {customDesc}
                </p>
              )}
              <p className="text-xs text-emerald-400 font-medium mt-1">
                {count} {count === 1 ? 'opción' : 'opciones'}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
