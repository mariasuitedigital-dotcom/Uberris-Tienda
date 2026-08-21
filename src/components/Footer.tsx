import React from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Mail,
  Wheat,
  ShieldCheck,
  Truck,
  Heart,
  ExternalLink
} from 'lucide-react';
import { StoreSettings } from '../types';

interface FooterProps {
  settings: StoreSettings;
  isDarkMode: boolean;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  isDarkMode,
  onOpenAdmin,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="main-footer"
      className={`border-t transition-colors ${
        isDarkMode
          ? 'bg-[#09110d] border-[#1c3326] text-slate-300'
          : 'bg-[#faf8f5] border-[#e8dfd5] text-slate-700'
      } pb-24 md:pb-12 pt-12 px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Top Badges / Guarantees */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pb-10 border-b border-slate-500/15">
          <div
            className={`p-3 sm:p-4 rounded-2xl border flex items-center gap-3 ${
              isDarkMode ? 'bg-[#0e1a14] border-[#1c3326]' : 'bg-white border-[#ece3d9] shadow-xs'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm">Trigo 100% Andino</h4>
              <p className="text-[11px] text-slate-400">Harina de los valles de Apurímac</p>
            </div>
          </div>

          <div
            className={`p-3 sm:p-4 rounded-2xl border flex items-center gap-3 ${
              isDarkMode ? 'bg-[#0e1a14] border-[#1c3326]' : 'bg-white border-[#ece3d9] shadow-xs'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm">Envíos Directos</h4>
              <p className="text-[11px] text-slate-400">Abancay, Cusco, Lima y provincias</p>
            </div>
          </div>

          <div
            className={`p-3 sm:p-4 rounded-2xl border flex items-center gap-3 ${
              isDarkMode ? 'bg-[#0e1a14] border-[#1c3326]' : 'bg-white border-[#ece3d9] shadow-xs'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm">Horneado Diario</h4>
              <p className="text-[11px] text-slate-400">Garantía de frescura y aroma</p>
            </div>
          </div>

          <div
            className={`p-3 sm:p-4 rounded-2xl border flex items-center gap-3 ${
              isDarkMode ? 'bg-[#0e1a14] border-[#1c3326]' : 'bg-white border-[#ece3d9] shadow-xs'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm">Calidad Tradicional</h4>
              <p className="text-[11px] text-slate-400">Receta artesanal de antaño</p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-10">
          {/* Column 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#60b64d] text-white flex items-center justify-center shadow-md font-serif font-black text-lg">
                U
              </div>
              <div>
                <h3 className="font-serif-craft font-black text-lg tracking-tight">
                  {settings.businessName || 'Uberris del Valle'}
                </h3>
                <p className="text-[11px] text-emerald-500 font-bold uppercase tracking-wider">
                  Panadería & Delicias de Apurímac
                </p>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Llevamos el sabor inconfundible del Pan Chapla tradicional, panes andinos y productos del valle apurimeño directo a tu mesa familiar.
            </p>

            {/* Social Icons with Direct SVG Links */}
            <div className="pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Síguenos en Redes Sociales:
              </p>
              <div className="flex items-center gap-2.5">
                {/* TikTok */}
                <a
                  href={settings.tiktokUrl || 'https://tiktok.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok Uberris del Valle"
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                    isDarkMode
                      ? 'bg-[#12221a] border-[#1c3326] text-white hover:bg-black hover:border-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-900 hover:text-white shadow-xs'
                  }`}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.35 22a6.33 6.33 0 0 0 6.33-6.32V8.76a8.28 8.28 0 0 0 4.91 1.6V6.91a5 5 0 0 1-1-.22z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href={settings.facebookUrl || 'https://facebook.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook Uberris del Valle"
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                    isDarkMode
                      ? 'bg-[#12221a] border-[#1c3326] text-white hover:bg-[#1877f2] hover:border-[#1877f2]'
                      : 'bg-white border-slate-300 text-[#1877f2] hover:bg-[#1877f2] hover:text-white shadow-xs'
                  }`}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href={settings.instagramUrl || 'https://instagram.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Uberris del Valle"
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                    isDarkMode
                      ? 'bg-[#12221a] border-[#1c3326] text-white hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600'
                      : 'bg-white border-slate-300 text-[#e1306c] hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white shadow-xs'
                  }`}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* WhatsApp Direct */}
                <a
                  href={`https://wa.me/${settings.whatsappPhone}?text=${encodeURIComponent(
                    '¡Hola Uberris del Valle! Quisiera hacer una consulta sobre sus productos y envíos.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp Uberris del Valle"
                  className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center hover:bg-[#20bd5a] transition-all shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Atención al Cliente & Contacto */}
          <div className="space-y-3">
            <h4 className="font-serif-craft font-bold text-sm tracking-tight border-b border-slate-500/20 pb-2">
              Contacto Directo
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href={`tel:${(settings.phone || '').replace(/\s+/g, '')}`}
                  className="flex items-center gap-2.5 hover:text-emerald-500 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Teléfono / Pedidos</span>
                    <strong className="text-xs font-semibold">{settings.phone || '+51 983 746 281'}</strong>
                  </div>
                </a>
              </li>

              <li>
                <a
                  href={`https://wa.me/${settings.whatsappPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-[#25D366] transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0 group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">WhatsApp Oficial</span>
                    <strong className="text-xs font-semibold">+{settings.whatsappPhone || '51 983 746 281'}</strong>
                  </div>
                </a>
              </li>

              <li>
                <a
                  href={`mailto:${settings.email || 'pedidos@uberrisdelvalle.com'}`}
                  className="flex items-center gap-2.5 hover:text-amber-500 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Correo Electrónico</span>
                    <span className="text-xs font-semibold truncate block max-w-[180px]">
                      {settings.email || 'pedidos@uberrisdelvalle.com'}
                    </span>
                  </div>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Ubicación y Horarios */}
          <div className="space-y-3">
            <h4 className="font-serif-craft font-bold text-sm tracking-tight border-b border-slate-500/20 pb-2">
              Ubicación & Horarios
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Panadería Principal</span>
                  <p className="leading-snug">{settings.addressText || 'Av. Arenas 450, Abancay - Apurímac, Perú'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Horario de Hornada</span>
                  <p className="leading-snug text-[11.5px]">
                    {settings.businessHours || 'Lunes a Sábado: 6:00 AM - 8:00 PM | Domingos: 6:00 AM - 1:30 PM'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Envíos y Métodos de Pago */}
          <div className="space-y-3">
            <h4 className="font-serif-craft font-bold text-sm tracking-tight border-b border-slate-500/20 pb-2">
              Envíos & Pagos
            </h4>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Despachamos por agencias de transporte confiables (Palomino, Shalom, Mariscal Cáceres, Molina) con empaque sellado para conservar la frescura.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-purple-600/15 border border-purple-500/30 text-purple-400 font-bold text-[10px]">
                Yape
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-cyan-600/15 border border-cyan-500/30 text-cyan-400 font-bold text-[10px]">
                Plin
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                Efectivo
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-400 font-bold text-[10px]">
                Transferencia
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Admin Shortcut */}
        <div className="pt-8 border-t border-slate-500/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>© {currentYear} {settings.businessName || 'Uberris del Valle'}.</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              Hecho con <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> en Apurímac, Perú
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Admin shortcut hidden from public ui */}
          </div>
        </div>
      </div>
    </footer>
  );
};
