import React from 'react';
import { Plus, Minus, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface Props {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onQuickView: (product: Product) => void;
  isDarkMode: boolean;
}

export const ProductCard: React.FC<Props> = ({
  product,
  onAddToCart,
  onQuickView,
  isDarkMode,
}) => {
  const [quantity, setQuantity] = React.useState(1);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, quantity);
    setQuantity(1); // reset to 1 after adding
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
        isDarkMode
          ? 'bg-[#0d1712] border-[#1c3326] text-slate-100 hover:border-[#60b64d]/60 hover:shadow-lg hover:shadow-[#60b64d]/10'
          : 'bg-white border-slate-200 text-slate-900 shadow-xs hover:border-[#60b64d] hover:shadow-md'
      }`}
    >
      {/* Product Image & Badges */}
      <div className="relative h-36 sm:h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Badge tag */}
        {product.badge && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-black tracking-widest uppercase rounded-full bg-[#60b64d] text-white shadow-md">
            {product.badge}
          </span>
        )}

        {/* Category tag */}
        <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-semibold rounded-md bg-black/60 backdrop-blur-xs text-emerald-300 border border-white/10 hidden sm:block">
          {product.category}
        </span>

        {/* Quick View Button on Image */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute bottom-2 right-2 p-1.5 rounded-xl bg-white/90 text-slate-900 hover:bg-white hover:scale-105 transition-all shadow-md opacity-90 group-hover:opacity-100"
          title="Vista Rápida"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-700" />
        </button>

        {/* Units per package callout if > 1 */}
        {product.unitsPerPackage > 1 && (
          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-amber-500/90 backdrop-blur-xs text-slate-950 font-bold text-[9px] flex items-center gap-1 shadow-xs">
            <Sparkles className="w-2.5 h-2.5" />
            <span className="hidden sm:inline">{product.unitsPerPackage} und. / paquete</span>
            <span className="sm:hidden">{product.unitsPerPackage}u</span>
          </div>
        )}
      </div>

      {/* Body Information */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-1 sm:gap-2 mb-0.5 sm:mb-1">
            <h3 className="font-serif-craft text-sm sm:text-lg font-bold leading-tight group-hover:text-[#60b64d] transition-colors line-clamp-2 sm:line-clamp-1">
              {product.name}
            </h3>
          </div>

          <p className={`hidden sm:block text-xs line-clamp-2 mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {product.description}
          </p>
        </div>

        {/* Footer: Price & Controls */}
        <div className="pt-2 mt-2 sm:mt-0 border-t border-slate-200/15">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className={`text-[9px] sm:text-[10px] uppercase font-medium block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {product.unit}
              </span>
              <span className="font-serif-craft text-base sm:text-xl font-bold text-[#60b64d]">
                S/ {product.price.toFixed(2)}
              </span>
            </div>

            {/* Quantity Selector */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className={`flex items-center gap-1 sm:gap-1.5 p-0.5 sm:p-1 rounded-xl border ${
                isDarkMode ? 'border-[#1c3326] bg-[#08100c]' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#60b64d] hover:bg-[#60b64d]/10 transition-colors"
                aria-label="Restar una unidad"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-4 sm:w-6 text-center text-xs font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#60b64d] hover:bg-[#60b64d]/10 transition-colors"
                aria-label="Sumar una unidad"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl bg-[#60b64d] hover:bg-[#50a040] text-white font-semibold text-[10px] sm:text-xs flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm shadow-[#60b64d]/20 active:scale-[0.98] transition-all"
          >
            <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
