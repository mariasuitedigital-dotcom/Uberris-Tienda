import React from 'react';
import { motion } from 'motion/react';
import { Plus, Flame, Sparkles, Heart } from 'lucide-react';
import { Product } from '../types';

interface HorizontalProductCardProps {
  product: Product;
  badgeType?: 'popular' | 'promo';
  onAddToCart: (product: Product, quantity: number) => void;
  onQuickView: (product: Product) => void;
  isDarkMode: boolean;
}

export const HorizontalProductCard: React.FC<HorizontalProductCardProps> = ({
  product,
  badgeType,
  onAddToCart,
  onQuickView,
  isDarkMode
}) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => onQuickView(product)}
      className={`min-w-[185px] w-[185px] sm:min-w-[230px] sm:w-[230px] shrink-0 rounded-3xl overflow-hidden border flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-xs hover:shadow-xl ${
        isDarkMode
          ? 'bg-[#0d1611]/60 border-[#1c3326]/70 hover:border-[#60b64d]/40'
          : 'bg-white border-slate-100 hover:border-emerald-100'
      }`}
    >
      {/* Top Image area */}
      <div className="relative h-36 sm:h-44 overflow-hidden bg-slate-900">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />

        {/* Badge: MÁS PEDIDO or PROMO */}
        {badgeType === 'popular' && (
          <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-0.5 shadow-md">
            <Flame className="w-2.5 h-2.5 fill-slate-950" />
            MÁS PEDIDO
          </span>
        )}

        {badgeType === 'promo' && (
          <span className="absolute top-2 left-2 bg-[#60b64d] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-0.5 shadow-md">
            <Sparkles className="w-2.5 h-2.5" />
            PROMO
          </span>
        )}

        {/* Subtle quick action button on top-right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          title="Ver detalles"
        >
          <Heart className="w-3 h-3" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-1 hover:text-[#60b64d] transition-colors">
            {product.name}
          </h3>
          <p className={`hidden sm:block text-xs line-clamp-2 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {product.description}
          </p>
        </div>

        {/* Price & Add button row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-500/10">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-[#60b64d]">
                S/ {product.price.toFixed(2)}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium line-clamp-1 max-w-[120px]">{product.unit}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, 1);
            }}
            className="w-8 h-8 shrink-0 rounded-full bg-[#60b64d]/15 hover:bg-[#60b64d] text-[#60b64d] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90"
            title="Agregar al pedido"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
