import React from 'react';
import { Search, ShoppingBag, Sun, Moon, LayoutDashboard, Store, Wheat, Sparkles } from 'lucide-react';
import { ProductCategory } from '../types';

interface Props {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: ProductCategory | 'Todos';
  onCategorySelect: (category: ProductCategory | 'Todos') => void;
  cartCount: number;
  onOpenCart: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currentView: 'catalog' | 'admin';
  onViewChange: (view: 'catalog' | 'admin') => void;
  pendingOrdersCount: number;
}

const CATEGORIES: (ProductCategory | 'Todos')[] = [
  'Todos',
  'Panadería',
  'Lácteos',
  'Embutidos',
  'Miel y Dulces',
  'Papa Nativa',
];

export const Header: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  cartCount,
  onOpenCart,
  isDarkMode,
  onToggleTheme,
  currentView,
  onViewChange,
  pendingOrdersCount,
}) => {
  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors border-b ${
      isDarkMode 
        ? 'bg-[#08100c]/90 border-[#1c3326] text-white' 
        : 'bg-[#f7f9f6]/95 border-emerald-100 text-slate-900 shadow-xs'
    }`}>
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-[#50a040] to-[#60b64d] text-white py-1 px-4 text-xs font-medium text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>🌱 Envíos a Abancay, Andahuaylas, Cusco, Lima y todo Apurímac directo de la hornada.</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Main Header Bar */}
        <div className="flex items-center justify-between gap-3">
          
          {/* Logo & Branding */}
          <div 
            onClick={() => onViewChange('catalog')} 
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="flex items-center justify-center px-3 py-1 border-[2.5px] border-[#39C139] rounded-xl bg-white shadow-sm group-hover:scale-105 transition-transform">
              <span className="font-sans text-[22px] font-black tracking-tighter text-[#39C139] flex items-baseline leading-none">
                Uberr
                <span className="relative inline-flex flex-col items-center justify-end" style={{ width: '0.28em' }}>
                  <svg className="w-[11px] h-[11px] text-[#ff0000] absolute -top-[1px] fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  <span className="text-[#39C139]">ı</span>
                </span>
                s
              </span>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar pan chapla, queso fresco, miel, papa nativa..."
              className={`w-full pl-10 pr-4 py-2 text-sm rounded-full border focus:outline-none transition-all ${
                isDarkMode
                  ? 'bg-[#0d1712] border-[#1c3326] text-slate-200 placeholder-slate-500 focus:border-[#60b64d]'
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#60b64d] shadow-2xs'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-[#60b64d]"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* View Switcher: Admin back to Catalog */}
            {currentView === 'admin' && (
              <button
                onClick={() => onViewChange('catalog')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border bg-[#60b64d] text-white border-[#60b64d] shadow-md shadow-[#60b64d]/20`}
              >
                <Store className="w-4 h-4" />
                <span>Ver Catálogo</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border transition-colors ${
                isDarkMode
                  ? 'bg-[#0d1712] border-[#1c3326] text-amber-300 hover:text-amber-200'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
              }`}
              title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Cart Button with floating badge */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center justify-center p-2.5 rounded-xl bg-gradient-to-r from-[#60b64d] to-[#50a040] text-white shadow-md shadow-[#60b64d]/25 hover:brightness-105 active:scale-95 transition-all"
              aria-label="Ver Carrito de Pedidos"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-2.5 md:hidden relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar productos artesanales..."
            className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border focus:outline-none ${
              isDarkMode
                ? 'bg-[#0d1712] border-[#1c3326] text-slate-200 placeholder-slate-500 focus:border-[#60b64d]'
                : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#60b64d]'
            }`}
          />
        </div>
      </div>
    </header>
  );
};
