import React from 'react';
import { motion } from 'motion/react';
import { ProductCategory, Product } from '../types';
import { cleanDirectImageUrl } from '../lib/supabase';

interface CategoriesGridProps {
  products: Product[];
  onSelectCategory: (category: ProductCategory | 'Todos') => void;
  isDarkMode: boolean;
  categoryImages?: Record<string, string>;
}

interface CategoryInfo {
  id: ProductCategory;
  name: string;
  imageUrl: string;
}

const CATEGORY_DEFINITIONS: CategoryInfo[] = [
  {
    id: 'Panadería',
    name: 'Panadería Artesanal',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'Lácteos',
    name: 'Quesería & Lácteos',
    imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'Embutidos',
    name: 'Embutidos & Carnes',
    imageUrl: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'Miel y Dulces',
    name: 'Miel & Dulces',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'Papa Nativa',
    name: 'Papa Nativa',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=800'
  }
];

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  products,
  onSelectCategory,
  isDarkMode,
  categoryImages
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {CATEGORY_DEFINITIONS.map((cat) => {
        const count = products.filter((p) => p.category === cat.id).length;
        const customUrl = categoryImages?.[cat.id];
        const finalImgUrl = cleanDirectImageUrl(customUrl || '') || cat.imageUrl;

        return (
          <motion.div
            key={cat.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCategory(cat.id)}
            className="group relative h-40 sm:h-52 rounded-3xl overflow-hidden cursor-pointer shadow-md border border-black/5"
          >
            {/* Image background */}
            <img
              src={finalImgUrl}
              alt={cat.name}
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
                {cat.name}
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-1">
                {count} {count === 1 ? 'opción' : 'opciones'}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
