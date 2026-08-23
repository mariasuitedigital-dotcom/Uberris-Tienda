import React from 'react';
import { X, ShoppingBag, Plus, Minus, ShieldCheck, MapPin, Sparkles, Flame } from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { cleanDirectImageUrl } from '../lib/supabase';

interface Props {
  product: Product | null;
  settings?: StoreSettings;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  isDarkMode: boolean;
}

export const ProductQuickViewModal: React.FC<Props> = ({
  product,
  settings,
  onClose,
  onAddToCart,
  isDarkMode,
}) => {
  const [quantity, setQuantity] = React.useState(1);
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setQuantity(1);
    setImgError(false);
  }, [product]);

  if (!product) return null;

  const isOutOfStock = product.available === false || (product.stockType === 'con_stock' && product.stock <= 0);
  const maxStock = product.stockType === 'con_stock' ? product.stock : 999;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Panadería': return '🍞';
      case 'Lácteos': return '🧀';
      case 'Embutidos': return '🥓';
      case 'Miel y Dulces': return '🍯';
      case 'Papa Nativa': return '🥔';
      default: return '🌾';
    }
  };

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border transition-colors ${
          isDarkMode
            ? 'bg-[#0d1712] border-[#1c3326] text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 p-1.5 sm:p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="flex flex-col md:grid md:grid-cols-2 overflow-y-auto no-scrollbar">
          {/* Product Image */}
          <div className="relative shrink-0 h-48 sm:h-64 md:h-full min-h-[160px] md:min-h-[260px] bg-gradient-to-br from-emerald-900/40 via-slate-800 to-amber-950/40 overflow-hidden flex items-center justify-center">
            {!imgError && product.image ? (
              <img
                src={cleanDirectImageUrl(product.image)}
                alt={product.name}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-stone-900 text-center">
                <span className="text-5xl mb-2 filter drop-shadow">
                  {getCategoryIcon(product.category)}
                </span>
                <span className="text-sm font-bold text-emerald-300">
                  {product.name}
                </span>
              </div>
            )}
            {product.badge && (
              <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full bg-[#60b64d] text-white shadow-md">
                {product.badge}
              </span>
            )}
            <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 p-1.5 sm:p-2.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs flex items-center gap-1.5 sm:gap-2 border border-white/10">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-[#60b64d] shrink-0" />
              <span className="line-clamp-1">{product.originLocation || settings?.originLocationText || 'Valle de Apurímac (Abancay - Andahuaylas)'}</span>
            </div>
          </div>

          {/* Details Content */}
          <div className="p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold text-[#60b64d] uppercase tracking-wider mb-1">
                <span>{product.category}</span>
                <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md bg-[#60b64d]/10 border border-[#60b64d]/30">
                  {product.unit}
                </span>
              </div>
              <h2 className="font-serif-craft text-xl sm:text-2xl font-bold leading-tight mb-1 sm:mb-2">
                {product.name}
              </h2>
              <p className={`text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {product.description}
              </p>

              {/* Guarantees & Features */}
              <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-[10px] sm:text-xs">
                {(product.customGuarantee1 || settings?.guaranteeBadge1 !== '') && (
                  <div className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-lg ${isDarkMode ? 'bg-[#08100c]' : 'bg-slate-50'}`}>
                    <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
                    <span>{product.customGuarantee1 || settings?.guaranteeBadge1 || 'Horno tradicional a leña de piedra andina'}</span>
                  </div>
                )}
                {(product.customGuarantee2 || settings?.guaranteeBadge2 !== '') && (
                  <div className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-lg ${isDarkMode ? 'bg-[#08100c]' : 'bg-slate-50'}`}>
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#60b64d] shrink-0" />
                    <span>{product.customGuarantee2 || settings?.guaranteeBadge2 || 'Insumos 100% ecológicos de pequeños productores'}</span>
                  </div>
                )}
                {product.unitsPerPackage > 1 && (
                  <div className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-lg ${isDarkMode ? 'bg-[#08100c]' : 'bg-slate-50'}`}>
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                    <span>
                      Rendimiento: <strong>{product.unitsPerPackage} unidades reales</strong> por paquete
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Price & Add to Cart Controls */}
            <div className="pt-3 sm:pt-4 border-t border-slate-200/20 mt-auto">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <span className="text-[10px] sm:text-xs text-slate-400 block">Precio Total</span>
                  <span className="font-serif-craft text-xl sm:text-2xl font-bold text-[#60b64d]">
                    S/ {(product.price * quantity).toFixed(2)}
                  </span>
                </div>

                {/* Quantity Controls */}
                {!isOutOfStock && (
                  <div className="flex items-center gap-1.5 sm:gap-2 border border-[#60b64d]/30 rounded-xl p-0.5 sm:p-1 bg-black/10">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1 sm:p-1.5 rounded-lg hover:bg-[#60b64d]/20 transition-colors text-[#60b64d]"
                      aria-label="Disminuir cantidad"
                    >
                      <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <span className="w-6 sm:w-8 text-center font-bold text-xs sm:text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                      className="p-1 sm:p-1.5 rounded-lg hover:bg-[#60b64d]/20 transition-colors text-[#60b64d]"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all text-xs sm:text-sm ${
                  isOutOfStock
                    ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#60b64d] to-[#50a040] hover:brightness-105 text-white shadow-lg shadow-[#60b64d]/25 cursor-pointer'
                }`}
              >
                {isOutOfStock ? (
                  <span>Producto Agotado</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Agregar al Pedido</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
