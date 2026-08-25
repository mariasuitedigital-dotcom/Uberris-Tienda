import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Flame, Wheat, ArrowRight } from 'lucide-react';
import { StoreSettings, ProductCategory, Product } from '../types';
import { cleanDirectImageUrl } from './AdminPanel';
import { IncaPatternBanner } from './IncaPatternBanner';

interface FloatingBreadHeroProps {
  isDarkMode: boolean;
  settings?: StoreSettings;
  products?: Product[];
  onSelectCategory?: (category: ProductCategory | 'Todos') => void;
  onExploreClick?: () => void;
}

export const FloatingBreadHero: React.FC<FloatingBreadHeroProps> = ({
  isDarkMode,
  settings,
  products = [],
  onSelectCategory,
}) => {
  // Determine title
  const rawTitle = settings?.heroTitle || '';
  const displayTitle = (rawTitle && !rawTitle.includes('Categorías'))
    ? rawTitle
    : 'Abundancia Selecta';

  // Categories helper mapping
  const categoryData: {
    id: ProductCategory;
    defaultName: string;
    defaultDesc: string;
    defaultImage: string;
    icon: string;
    colorBorder: string;
    colorTag: string;
  }[] = [
    {
      id: 'Panadería',
      defaultName: 'Panadería Artesanal',
      defaultDesc: 'Pan Chapla & Leña',
      defaultImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
      icon: '🍞',
      colorBorder: 'border-[#60b64d]',
      colorTag: 'bg-[#60b64d]',
    },
    {
      id: 'Lácteos',
      defaultName: 'Quesería & Lácteos',
      defaultDesc: 'Queso Paria & Manjar',
      defaultImage: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=600',
      icon: '🧀',
      colorBorder: 'border-amber-400',
      colorTag: 'bg-amber-500',
    },
    {
      id: 'Embutidos',
      defaultName: 'Embutidos & Carnes',
      defaultDesc: 'Chorizo & Cecina',
      defaultImage: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&q=80&w=600',
      icon: '🥩',
      colorBorder: 'border-rose-400',
      colorTag: 'bg-rose-500',
    },
    {
      id: 'Miel y Dulces',
      defaultName: 'Miel & Dulces',
      defaultDesc: '100% Pura de Abeja',
      defaultImage: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600',
      icon: '🍯',
      colorBorder: 'border-amber-500',
      colorTag: 'bg-amber-600',
    },
    {
      id: 'Papa Nativa',
      defaultName: 'Papa Nativa',
      defaultDesc: 'Cosecha de Altura',
      defaultImage: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=600',
      icon: '🥔',
      colorBorder: 'border-emerald-500',
      colorTag: 'bg-emerald-600',
    },
  ];

  const getCategoryInfo = (catId: ProductCategory, index: number) => {
    const base = categoryData.find((c) => c.id === catId) || categoryData[index % categoryData.length];
    const name = settings?.categoryNames?.[catId] || base.defaultName;
    const desc = settings?.categoryDescriptions?.[catId] || base.defaultDesc;
    const customImg = settings?.categoryImages?.[catId];

    let img = cleanDirectImageUrl(customImg || '');
    if (!img) {
      if (index === 0) img = cleanDirectImageUrl(settings?.heroImage1 || '') || base.defaultImage;
      else if (index === 1) img = cleanDirectImageUrl(settings?.heroImage2 || '') || base.defaultImage;
      else if (index === 2) img = cleanDirectImageUrl(settings?.heroImage3 || '') || base.defaultImage;
      else img = base.defaultImage;
    }

    const count = products.filter((p) => p.category === catId).length;

    return { ...base, name, desc, img, count };
  };

  const cat1 = getCategoryInfo('Panadería', 0);
  const cat2 = getCategoryInfo('Lácteos', 1);
  const cat3 = getCategoryInfo('Embutidos', 2);
  const cat4 = getCategoryInfo('Miel y Dulces', 3);
  const cat5 = getCategoryInfo('Papa Nativa', 4);

  return (
    <div className={`relative rounded-3xl overflow-hidden border transition-all duration-500 shadow-xl ${
      isDarkMode 
        ? 'bg-gradient-to-br from-[#06120c] via-[#0b1d14] to-[#08150e] border-amber-500/30 text-white shadow-emerald-950/40' 
        : 'bg-gradient-to-br from-[#ffffff] via-[#f7fbf4] to-[#edf4e6] border-emerald-200 text-slate-900 shadow-lg'
    }`}>
      
      {/* Background Subtle Inca Pattern Watermark - Medium Transparency (Tapiz Textil) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
        <IncaPatternBanner height="100%" opacity={isDarkMode ? 0.35 : 0.22} />
        <div className={`absolute inset-0 ${
          isDarkMode
            ? 'bg-gradient-to-r from-[#07140e]/85 via-[#0d2319]/50 to-[#07140e]/80'
            : 'bg-gradient-to-r from-white/85 via-white/50 to-[#f3f8ee]/80'
        }`} />
      </div>

      {/* Decorative Top Woven Inca Tapestry Border */}
      <div className="relative z-10 w-full h-4 sm:h-5 overflow-hidden border-b-2 border-amber-500/80 shadow-xs flex items-center">
        <IncaPatternBanner height="100%" opacity={1} />
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-black/25' : 'bg-white/10'} pointer-events-none`} />
      </div>

      {/* Ambient Lighting Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute -right-20 -top-20 w-96 h-96 rounded-full blur-[120px] opacity-25 ${isDarkMode ? 'bg-[#60b64d]/30' : 'bg-emerald-300/40'}`} />
        <div className={`absolute -left-40 -bottom-40 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20 ${isDarkMode ? 'bg-amber-500/20' : 'bg-amber-300/30'}`} />
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 px-6 py-9 sm:px-8 sm:py-12 md:p-14 items-center">
        
        {/* Left Column: Typographic & Branding Content */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-left max-w-2xl relative z-10">
          
          {/* Tag/Badge of origin */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[10px] sm:text-xs font-bold tracking-wider uppercase shadow-xs backdrop-blur-xs ${
              isDarkMode 
                ? 'border-amber-400/50 bg-amber-400/10 text-amber-300' 
                : 'border-emerald-700/30 bg-emerald-100 text-emerald-900'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 animate-pulse ${isDarkMode ? 'text-amber-400' : 'text-emerald-700'}`} />
            <span>{settings?.heroTag || 'APURÍMAC EN TU MESA'}</span>
          </motion.div>

          {/* Headline displaying "Abundancia Selecta" in a single green color */}
          <div className="space-y-2 sm:space-y-3">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className={`font-serif-craft text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] !font-serif ${
                isDarkMode ? 'text-[#60b64d] drop-shadow-md' : 'text-[#15803d]'
              }`}
            >
              {displayTitle}
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`text-sm sm:text-lg leading-relaxed font-medium ${
              isDarkMode ? 'text-slate-200 opacity-95' : 'text-slate-700'
            }`}
          >
            {settings?.heroSubtitle || 'productos naturales y bebidas con el sabor auténtico de los andes.'}
          </motion.p>
        </div>

        {/* Right Column: Clean Category Circles Showcase (Matching Reference Design) */}
        <div className="lg:col-span-6 w-full relative z-10 my-2 lg:my-0">
          
          {/* Subtle Golden/Green Glow behind */}
          <div className="absolute inset-0 bg-radial from-[#60b64d]/15 to-transparent blur-2xl pointer-events-none" />

          {/* Grid of Circular Categories with text BELOW circles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-3 sm:gap-x-4 items-start justify-items-center relative z-10 max-w-xl mx-auto">
            {[cat1, cat2, cat3, cat4, cat5].map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectCategory?.(cat.id)}
                className="group flex flex-col items-center cursor-pointer select-none text-center"
              >
                {/* Circle Container with Pastel Light-Blue Background (#dceefb) */}
                <div className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-[#dceefb] p-1.5 sm:p-2 border-2 shadow-md transition-all duration-300 flex items-center justify-center overflow-hidden ${
                  isDarkMode 
                    ? 'border-amber-400/80 group-hover:border-amber-300' 
                    : 'border-emerald-600/70 group-hover:border-emerald-500 shadow-emerald-900/10'
                }`}>
                  <img
                    src={cat.img}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500 shadow-xs"
                  />
                </div>

                {/* Category Label BELOW the circle */}
                <span className={`mt-2 text-xs sm:text-sm font-extrabold transition-colors max-w-[120px] leading-tight ${
                  isDarkMode ? 'text-amber-200 group-hover:text-amber-300' : 'text-slate-900 group-hover:text-[#15803d]'
                }`}>
                  {cat.name}
                </span>
                
                {/* Short Subtitle */}
                <span className={`text-[10px] sm:text-xs line-clamp-1 max-w-[110px] mt-0.5 font-medium ${
                  isDarkMode ? 'text-slate-300/80' : 'text-slate-600'
                }`}>
                  {cat.desc}
                </span>
              </motion.div>
            ))}
          </div>

        </div>

      </div>

      {/* Decorative Bottom Woven Inca Tapestry Border */}
      <div className="relative z-10 w-full h-5 sm:h-6 overflow-hidden border-t-2 border-amber-500 shadow-md flex items-center">
        <IncaPatternBanner height="100%" opacity={1} />
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-black/20' : 'bg-white/10'} pointer-events-none`} />
      </div>
    </div>
  );
};
