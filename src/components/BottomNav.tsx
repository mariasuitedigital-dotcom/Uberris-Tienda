import React from 'react';
import { Home, UtensilsCrossed, ShieldCheck, ShoppingBag } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'inicio' | 'catalogo';
  setActiveTab: (tab: 'inicio' | 'catalogo') => void;
  cartCount: number;
  onCartOpen: () => void;
  isDarkMode: boolean;
  onOpenAdmin: () => void;
  pendingOrdersCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  onCartOpen,
  isDarkMode,
  onOpenAdmin,
  pendingOrdersCount = 0
}) => {
  return (
    <nav aria-label="Navegación móvil" className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 pointer-events-none">
      <div className={`max-w-md mx-auto pointer-events-auto rounded-full shadow-2xl border backdrop-blur-lg px-5 py-2 flex items-center justify-between ${
        isDarkMode
          ? 'bg-[#080f0c]/95 border-[#1c3326] text-slate-200'
          : 'bg-white/95 border-slate-200 text-slate-700 shadow-slate-200/50'
      }`}>
        {/* Inicio */}
        <button
          onClick={() => {
            setActiveTab('inicio');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
            activeTab === 'inicio' ? 'text-[#60b64d]' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Inicio</span>
        </button>

        {/* Catálogo / Menú */}
        <button
          onClick={() => {
            setActiveTab('catalogo');
            const el = document.getElementById('catalogo-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
            activeTab === 'catalogo' ? 'text-[#60b64d]' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span>Catálogo</span>
        </button>

        {/* Carrito */}
        <button
          onClick={onCartOpen}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-[#60b64d] relative transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-extrabold">
                {cartCount}
              </span>
            )}
          </div>
          <span>Carrito</span>
        </button>
      </div>
    </nav>
  );
};
