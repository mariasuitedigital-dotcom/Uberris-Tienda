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
  const displayTitle = rawTitle
    ? rawTitle.replace(/Abundancia/gi, 'Categorías')
    : 'Categorías Selectas';

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
    <div className={`relative rounded-3xl overflow-hidden border transition-all duration-500 shadow-2xl ${
      isDarkMode 
        ? 'bg-gradient-to-br from-[#06120c] via-[#0b1d14] to-[#08150e] border-amber-500/30 text-white shadow-emerald-950/40' 
        : 'bg-gradient-to-br from-[#091811] via-[#0d2319] to-[#07130e] border-amber-500/40 text-white shadow-xl'
    }`}>
      
      {/* Background Subtle Inca Pattern Watermark */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
        <IncaPatternBanner height="100%" opacity={0.15} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07140e]/95 via-[#0d2319]/80 to-[#07140e]/90" />
      </div>

      {/* Decorative Top Woven Inca Tapestry Border */}
      <div className="relative z-10 w-full h-4 sm:h-5 overflow-hidden border-b-2 border-amber-400/80 shadow-md flex items-center">
        <IncaPatternBanner height="100%" opacity={1} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/25 pointer-events-none" />
      </div>

      {/* Ambient Lighting Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full blur-[120px] opacity-25 bg-[#60b64d]/30" />
        <div className="absolute -left-40 -bottom-40 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20 bg-amber-500/20" />
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
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[10px] sm:text-xs font-bold tracking-wider uppercase shadow-md border-amber-400/50 bg-amber-400/10 text-amber-300 backdrop-blur-xs"
          >
            <Flame className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>{settings?.heroTag || 'APURÍMAC EN TU MESA'}</span>
          </motion.div>

          {/* Headline displaying "Categorías Selectas" */}
          <div className="space-y-2 sm:space-y-3">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif-craft text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] !font-serif text-white drop-shadow-md"
            >
              {displayTitle.includes('Categorías') ? (
                <>
                  Categorías <span className="text-amber-300 bg-gradient-to-r from-amber-300 via-amber-400 to-[#60b64d] bg-clip-text text-transparent">Selectas</span>
                </>
              ) : (
                displayTitle
              )}
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-sm sm:text-lg leading-relaxed font-medium text-slate-200 opacity-95"
          >
            {settings?.heroSubtitle || 'productos naturales y bebidas con el sabor auténtico de los andes.'}
          </motion.p>
        </div>

        {/* Right Column: Interactive Floating Category Circles Composition */}
        <div className="flex lg:col-span-6 h-[320px] sm:h-[390px] md:h-[440px] w-full relative items-center justify-center z-10 mt-2 sm:mt-0">
          
          {/* Subtle Golden/Green Aura Circle behind everything */}
          <div className="absolute w-56 sm:w-72 h-56 sm:h-72 rounded-full bg-radial from-[#60b64d]/25 to-transparent blur-3xl pointer-events-none" />

          {/* 1. Primary Central Category Circle: Panadería Artesanal */}
          <motion.div
            animate={{
              y: [-10, 10],
              rotate: [-1, 2]
            }}
            transition={{
              y: { duration: 4.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
              rotate: { duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }
            }}
            whileHover={{ scale: 1.08, zIndex: 40 }}
            onClick={() => onSelectCategory?.(cat1.id)}
            className="absolute z-20 w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full cursor-pointer shadow-2xl overflow-hidden border-4 border-[#60b64d] group transition-all"
          >
            <img
              src={cat1.img}
              alt={cat1.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {/* Dark glass gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-3 sm:p-4 text-white text-center">
              <span className="text-base sm:text-xl mb-0.5">{cat1.icon}</span>
              <p className="font-serif-craft font-extrabold text-xs sm:text-base leading-tight text-amber-300 drop-shadow-md">
                {cat1.name}
              </p>
              <p className="text-[9px] sm:text-[11px] text-slate-200 opacity-90 line-clamp-1 mt-0.5">
                {cat1.desc}
              </p>
              <span className="mt-1 inline-flex items-center justify-center gap-1 text-[9px] font-bold text-[#60b64d] bg-black/60 px-2 py-0.5 rounded-full mx-auto backdrop-blur-xs">
                <span>Explorar</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </div>
          </motion.div>

          {/* 2. Secondary Category Circle (Top-Left): Quesería & Lácteos */}
          <motion.div
            animate={{
              y: [8, -8],
              rotate: [3, -2]
            }}
            transition={{
              y: { duration: 3.6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
              rotate: { duration: 5.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }
            }}
            whileHover={{ scale: 1.1, zIndex: 40 }}
            onClick={() => onSelectCategory?.(cat2.id)}
            className="absolute -left-1 sm:-left-3 md:-left-4 top-4 sm:top-8 z-10 w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full cursor-pointer shadow-xl overflow-hidden border-3 border-amber-400 group transition-all"
          >
            <img
              src={cat2.img}
              alt={cat2.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-2 sm:p-3 text-white text-center">
              <span className="text-sm sm:text-base">{cat2.icon}</span>
              <p className="font-serif-craft font-bold text-[11px] sm:text-xs text-amber-200 leading-tight">
                {cat2.name}
              </p>
              <p className="text-[8px] sm:text-[10px] text-slate-200 opacity-80 line-clamp-1">
                {cat2.desc}
              </p>
            </div>
          </motion.div>

          {/* 3. Tertiary Category Circle (Bottom-Right): Embutidos & Carnes */}
          <motion.div
            animate={{
              y: [-6, 6],
              x: [-3, 3],
              rotate: [-4, 4]
            }}
            transition={{
              y: { duration: 4.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
              x: { duration: 3.9, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
              rotate: { duration: 6.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }
            }}
            whileHover={{ scale: 1.1, zIndex: 40 }}
            onClick={() => onSelectCategory?.(cat3.id)}
            className="absolute -right-1 sm:-right-2 md:-right-4 bottom-4 sm:bottom-8 z-10 w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full cursor-pointer shadow-xl overflow-hidden border-3 border-rose-400 group transition-all"
          >
            <img
              src={cat3.img}
              alt={cat3.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-2 sm:p-3 text-white text-center">
              <span className="text-sm sm:text-base">{cat3.icon}</span>
              <p className="font-serif-craft font-bold text-[11px] sm:text-xs text-rose-200 leading-tight">
                {cat3.name}
              </p>
              <p className="text-[8px] sm:text-[10px] text-slate-200 opacity-80 line-clamp-1">
                {cat3.desc}
              </p>
            </div>
          </motion.div>

          {/* 4. Fourth Category Circle (Top-Right): Miel & Dulces */}
          <motion.div
            animate={{
              y: [-7, 7],
              x: [3, -3],
              rotate: [-2, 3]
            }}
            transition={{
              y: { duration: 5.1, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
              x: { duration: 4.3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
              rotate: { duration: 5.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }
            }}
            whileHover={{ scale: 1.1, zIndex: 40 }}
            onClick={() => onSelectCategory?.(cat4.id)}
            className="absolute -right-2 sm:right-1 md:right-2 top-2 sm:top-4 z-15 w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full cursor-pointer shadow-xl overflow-hidden border-3 border-amber-500 group transition-all"
          >
            <img
              src={cat4.img}
              alt={cat4.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-1.5 sm:p-2.5 text-white text-center">
              <span className="text-xs sm:text-base">{cat4.icon}</span>
              <p className="font-serif-craft font-bold text-[10px] sm:text-xs text-amber-300 leading-tight">
                {cat4.name}
              </p>
              <p className="text-[7px] sm:text-[9px] text-slate-200 opacity-80 line-clamp-1">
                {cat4.desc}
              </p>
            </div>
          </motion.div>

          {/* 5. Fifth Category Circle (Bottom-Left): Papa Nativa */}
          <motion.div
            animate={{
              y: [6, -6],
              x: [-4, 4],
              rotate: [2, -3]
            }}
            transition={{
              y: { duration: 4.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
              x: { duration: 3.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
              rotate: { duration: 6.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }
            }}
            whileHover={{ scale: 1.1, zIndex: 40 }}
            onClick={() => onSelectCategory?.(cat5.id)}
            className="absolute -left-2 sm:left-1 md:left-2 bottom-2 sm:bottom-4 z-15 w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full cursor-pointer shadow-xl overflow-hidden border-3 border-emerald-500 group transition-all"
          >
            <img
              src={cat5.img}
              alt={cat5.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-1.5 sm:p-2.5 text-white text-center">
              <span className="text-xs sm:text-base">{cat5.icon}</span>
              <p className="font-serif-craft font-bold text-[10px] sm:text-xs text-emerald-300 leading-tight">
                {cat5.name}
              </p>
              <p className="text-[7px] sm:text-[9px] text-slate-200 opacity-80 line-clamp-1">
                {cat5.desc}
              </p>
            </div>
          </motion.div>

          {/* Sparkles / Wheat Decorative Accents */}
          <motion.div
            animate={{
              y: [-10, 10],
              x: [6, -6],
              rotate: [0, 360]
            }}
            transition={{ duration: 7, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            className="absolute top-2 left-1/2 z-0 text-amber-400 opacity-75"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </motion.div>

          <motion.div
            animate={{
              y: [8, -8],
              x: [-6, 6],
              rotate: [-15, 15]
            }}
            transition={{ duration: 5.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            className="absolute bottom-1 right-1/3 z-0 text-[#60b64d] opacity-60"
          >
            <Wheat className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.div>

        </div>

      </div>

      {/* Decorative Bottom Woven Inca Tapestry Border */}
      <div className="relative z-10 w-full h-5 sm:h-6 overflow-hidden border-t-2 border-amber-400 shadow-md flex items-center">
        <IncaPatternBanner height="100%" opacity={1} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />
      </div>

    </div>
  );
};
