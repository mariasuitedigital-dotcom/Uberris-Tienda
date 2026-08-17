import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Flame, ShieldCheck, Truck, HeartHandshake, Wheat } from 'lucide-react';

interface FloatingBreadHeroProps {
  isDarkMode: boolean;
  onExploreClick?: () => void;
}

export const FloatingBreadHero: React.FC<FloatingBreadHeroProps> = ({ isDarkMode, onExploreClick }) => {
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
            <span>Apurímac en tu Mesa</span>
          </motion.div>

          {/* Majestic Main Headline */}
          <div className="space-y-2 sm:space-y-3">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif-craft text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05] !font-serif"
            >
              Sabores de <span className="text-[#60b64d] bg-gradient-to-r from-[#60b64d] to-[#4c9d3a] bg-clip-text text-transparent">Origen</span>
            </motion.h1>
          </div>

          {/* User's Exact Requested Description */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`text-sm sm:text-lg leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
          >
            productos naturales y bebidas con el sabor auténtico de los andes.
          </motion.p>
        </div>

        {/* Right Column: Stunning Interactive Floating Composition (Hidden on very small screens, compact on mobile) */}
        <div className="hidden sm:flex lg:col-span-5 h-[200px] sm:h-[400px] relative items-center justify-center z-10">
          
          {/* Subtle Golden/Green Aura Circle behind everything */}
          <div className="absolute w-64 h-64 rounded-full bg-radial from-[#60b64d]/20 to-transparent blur-3xl pointer-events-none" />

          {/* 1. Primary Layer - Pan Chapla Artesanal (Grand Masterpiece Bread) */}
          <motion.div
            animate={{
              y: [-12, 12],
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
            className="absolute z-20 w-52 h-52 sm:w-60 sm:h-60 rounded-full cursor-grab active:cursor-grabbing shadow-2xl overflow-hidden border-2 border-[#60b64d]/40 group"
          >
            <img
              src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800"
              alt="Pan Chapla Artesanal Tradicional"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {/* Elegant text caption overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-3 text-white">
              <Wheat className="w-6 h-6 text-[#60b64d] mb-1.5" />
              <p className="font-serif-craft font-bold text-sm">Pan Chapla</p>
              <p className="text-[10px] text-slate-300">Con masa madre y anís serrano</p>
            </div>
          </motion.div>

          {/* 2. Secondary Layer - Queso Paria Maduro (Firme y Cremoso) */}
          <motion.div
            animate={{
              y: [10, -10],
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
            className="absolute -left-4 sm:-left-8 top-12 z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full cursor-grab active:cursor-grabbing shadow-xl overflow-hidden border-2 border-amber-500/30 group"
          >
            <img
              src="https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=600"
              alt="Queso Paria Artesanal Maduro"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {/* Elegant overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-2 text-white">
              <p className="font-serif-craft font-bold text-xs">Queso Paria</p>
              <p className="text-[9px] text-slate-300">100% Leche de Ordeño</p>
            </div>
          </motion.div>

          {/* 3. Tertiary Layer - Miel Silvestre de Abeja */}
          <motion.div
            animate={{
              y: [-6, 6],
              x: [-4, 4],
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
            className="absolute -right-2 sm:-right-6 bottom-14 z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full cursor-grab active:cursor-grabbing shadow-xl overflow-hidden border-2 border-emerald-500/30 group"
          >
            <img
              src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600"
              alt="Miel Pura de Monte Andino"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-2 text-white">
              <p className="font-serif-craft font-bold text-xs">Miel Silvestre</p>
              <p className="text-[9px] text-slate-300">Floración Andina</p>
            </div>
          </motion.div>

          {/* 4. Tiny Floating Ingredients (The "Dusting & Crumbs" Effect from the Burger Reference) */}
          
          {/* Anise Seeds (Semillas de Anís) - Sparkle/Leaf representing andean seeds */}
          <motion.div
            animate={{
              y: [-15, 15],
              x: [10, -10],
              rotate: [0, 360]
            }}
            transition={{ duration: 7, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            className="absolute top-8 right-16 z-0 text-amber-500 opacity-60"
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
          </motion.div>

          {/* Golden Wheat Floating Element */}
          <motion.div
            animate={{
              y: [12, -12],
              x: [-10, 10],
              rotate: [-15, 15]
            }}
            transition={{ duration: 5.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            className="absolute bottom-8 left-16 z-0 text-[#60b64d] opacity-50"
          >
            <Wheat className="w-7 h-7" />
          </motion.div>

          {/* Golden dust / flour sparkles */}
          <motion.div
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.7, 0.3],
              y: [0, -10, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-4 w-2 h-2 rounded-full bg-amber-400 z-0"
          />
          <motion.div
            animate={{
              scale: [1.2, 0.7, 1.2],
              opacity: [0.4, 0.8, 0.4],
              y: [0, 8, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-1/3 right-4 w-3 h-3 rounded-full bg-[#60b64d] z-0"
          />
          <motion.div
            animate={{
              scale: [0.6, 1.1, 0.6],
              opacity: [0.2, 0.6, 0.2],
              x: [0, 6, 0]
            }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute top-1/4 right-1/4 w-1.5 h-1.5 rounded-full bg-white z-0"
          />

        </div>

      </div>

    </div>
  );
};
