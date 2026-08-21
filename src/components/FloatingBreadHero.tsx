import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Flame, ShieldCheck, Truck, HeartHandshake, Wheat } from 'lucide-react';
import { StoreSettings } from '../types';
import { cleanDirectImageUrl } from './AdminPanel';

interface FloatingBreadHeroProps {
  isDarkMode: boolean;
  settings?: StoreSettings;
  onExploreClick?: () => void;
}

export const FloatingBreadHero: React.FC<FloatingBreadHeroProps> = ({ isDarkMode, settings, onExploreClick }) => {
  return (
    <div className={`relative rounded-3xl overflow-hidden border transition-all duration-500 shadow-2xl ${
      isDarkMode 
        ? 'bg-gradient-to-br from-[#08100c] via-[#0b1611] to-[#0f2219] border-[#1c3326]/60 text-white' 
        : 'bg-gradient-to-br from-[#fcfdfa] via-[#f3f7f0] to-[#eaf2e3] border-emerald-100 text-slate-800'
    }`}>
      
      {/* Absolute Atmospheric Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Soft Radial Ambient Glow */}
        <div className={`absolute -right-20 -top-20 w-96 h-96 rounded-full blur-[120px] opacity-30 transition-colors duration-500 ${
          isDarkMode ? 'bg-[#60b64d]/20' : 'bg-[#60b64d]/30'
        }`} />
        <div className={`absolute -left-40 -bottom-40 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20 transition-colors duration-500 ${
          isDarkMode ? 'bg-emerald-950/40' : 'bg-emerald-200/40'
        }`} />
        
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#60b64d_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 px-5 py-8 sm:px-6 sm:py-10 md:p-16 items-center">
        
        {/* Left Column: Typographic & Branding Content */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left max-w-2xl">
          
          {/* Tag/Badge of origin */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border text-[10px] sm:text-xs font-semibold tracking-wide uppercase shadow-xs transition-colors"
            style={{
              backgroundColor: isDarkMode ? 'rgba(96, 182, 77, 0.12)' : 'rgba(96, 182, 77, 0.08)',
              borderColor: isDarkMode ? 'rgba(96, 182, 77, 0.3)' : 'rgba(96, 182, 77, 0.2)',
              color: '#60b64d'
            }}
          >
            <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse text-[#60b64d]" />
            <span>{settings?.heroTag || 'Apurímac en tu Mesa'}</span>
          </motion.div>

          {/* Majestic Main Headline */}
          <div className="space-y-2 sm:space-y-3">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif-craft text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05] !font-serif"
            >
              {settings?.heroTitle ? (
                settings.heroTitle
              ) : (
                <>
                  Sabores de <span className="text-[#60b64d] bg-gradient-to-r from-[#60b64d] to-[#4c9d3a] bg-clip-text text-transparent">Origen</span>
                </>
              )}
            </motion.h1>
          </div>

          {/* User's Exact Requested Description */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`text-sm sm:text-lg leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
          >
            {settings?.heroSubtitle || 'productos naturales y bebidas con el sabor auténtico de los andes.'}
          </motion.p>
        </div>

        {/* Right Column: Interactive Floating Composition (Visible & optimized for mobile and desktop) */}
        <div className="flex lg:col-span-5 h-[280px] sm:h-[360px] md:h-[420px] w-full relative items-center justify-center z-10 mt-2 sm:mt-0">
          
          {/* Subtle Golden/Green Aura Circle behind everything */}
          <div className="absolute w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-radial from-[#60b64d]/25 to-transparent blur-3xl pointer-events-none" />

          {/* 1. Primary Layer - Pan Chapla Artesanal (Grand Masterpiece Bread) */}
          <motion.div
            animate={{
              y: [-10, 10],
              rotate: [-1, 2]
            }}
            transition={{
              y: {
                duration: 4.2,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              },
              rotate: {
                duration: 6,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              }
            }}
            whileHover={{ scale: 1.05, zIndex: 30 }}
            className="absolute z-20 w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full cursor-grab active:cursor-grabbing shadow-2xl overflow-hidden border-2 border-[#60b64d]/50 group"
          >
            <img
              src={cleanDirectImageUrl(settings?.heroImage1 || '') || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800'}
              alt="Producto Principal - Banner"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {/* Elegant text caption overlay on hover / tap */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-2 sm:p-3 text-white">
              <Wheat className="w-5 h-5 sm:w-6 sm:h-6 text-[#60b64d] mb-1" />
              <p className="font-serif-craft font-bold text-xs sm:text-sm">Pan Chapla</p>
              <p className="text-[9px] sm:text-[10px] text-slate-300">Con masa madre y anís</p>
            </div>
          </motion.div>

          {/* 2. Secondary Layer - Queso Paria Maduro (Firme y Cremoso) */}
          <motion.div
            animate={{
              y: [8, -8],
              rotate: [3, -2]
            }}
            transition={{
              y: {
                duration: 3.6,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              },
              rotate: {
                duration: 5.2,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              }
            }}
            whileHover={{ scale: 1.05, zIndex: 30 }}
            className="absolute -left-1 sm:-left-4 md:-left-6 top-6 sm:top-10 z-10 w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full cursor-grab active:cursor-grabbing shadow-xl overflow-hidden border-2 border-amber-500/40 group"
          >
            <img
              src={cleanDirectImageUrl(settings?.heroImage2 || '') || 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=600'}
              alt="Producto Superior - Banner"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {/* Elegant overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-1.5 sm:p-2 text-white">
              <p className="font-serif-craft font-bold text-[11px] sm:text-xs">Queso Paria</p>
              <p className="text-[8px] sm:text-[9px] text-slate-300">100% Leche Andina</p>
            </div>
          </motion.div>

          {/* 3. Tertiary Layer - Miel Silvestre de Abeja */}
          <motion.div
            animate={{
              y: [-6, 6],
              x: [-3, 3],
              rotate: [-4, 4]
            }}
            transition={{
              y: {
                duration: 4.8,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              },
              x: {
                duration: 3.9,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              },
              rotate: {
                duration: 6.5,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              }
            }}
            whileHover={{ scale: 1.05, zIndex: 30 }}
            className="absolute -right-1 sm:-right-3 md:-right-6 bottom-6 sm:bottom-10 md:bottom-12 z-10 w-22 h-22 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full cursor-grab active:cursor-grabbing shadow-xl overflow-hidden border-2 border-emerald-500/40 group"
          >
            <img
              src={cleanDirectImageUrl(settings?.heroImage3 || '') || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600'}
              alt="Producto Inferior - Banner"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-1.5 sm:p-2 text-white">
              <p className="font-serif-craft font-bold text-[11px] sm:text-xs">Miel Pura</p>
              <p className="text-[8px] sm:text-[9px] text-slate-300">Valle Abancay</p>
            </div>
          </motion.div>

          {/* 4. Tiny Floating Ingredients (Dusting & Sparkles Effect) */}
          
          {/* Anise Seeds / Sparkles */}
          <motion.div
            animate={{
              y: [-10, 10],
              x: [6, -6],
              rotate: [0, 360]
            }}
            transition={{ duration: 7, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            className="absolute top-4 right-6 sm:top-8 sm:right-12 z-0 text-amber-400 opacity-75"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </motion.div>

          {/* Golden Wheat Floating Element */}
          <motion.div
            animate={{
              y: [8, -8],
              x: [-6, 6],
              rotate: [-15, 15]
            }}
            transition={{ duration: 5.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            className="absolute bottom-4 left-4 sm:bottom-8 sm:left-12 z-0 text-[#60b64d] opacity-60"
          >
            <Wheat className="w-5 h-5 sm:w-7 sm:h-7" />
          </motion.div>

          {/* Golden dust / sparkles */}
          <motion.div
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.8, 0.3],
              y: [0, -8, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-2 sm:left-4 w-2 h-2 rounded-full bg-amber-400 z-0"
          />
          <motion.div
            animate={{
              scale: [1.2, 0.7, 1.2],
              opacity: [0.4, 0.9, 0.4],
              y: [0, 6, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-1/3 right-2 sm:right-4 w-2.5 h-2.5 rounded-full bg-[#60b64d] z-0"
          />
          <motion.div
            animate={{
              scale: [0.6, 1.1, 0.6],
              opacity: [0.2, 0.7, 0.2],
              x: [0, 4, 0]
            }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute top-1/4 right-1/4 w-1.5 h-1.5 rounded-full bg-white z-0"
          />

        </div>

      </div>

    </div>
  );
};
