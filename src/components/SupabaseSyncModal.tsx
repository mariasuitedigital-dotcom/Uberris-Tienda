import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Shield,
  Zap,
  X,
  UploadCloud,
  Layers,
  KeyRound,
  Image as ImageIcon,
  Sparkles,
  Info,
  HelpCircle
} from 'lucide-react';
import {
  isSupabaseConnected,
  getSavedSupabaseConfig,
  saveSupabaseCredentialsLocal,
  SUPABASE_SQL_SETUP,
  dbSeedProducts,
  dbSeedOrders,
  dbSeedSupplies,
  dbFetchProducts,
  cleanDirectImageUrl
} from '../lib/supabase';
import { Product, Order, RawSupply } from '../types';
import { INITIAL_SUPPLIES } from '../data/initialData';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  products: Product[];
  orders: Order[];
  onRefreshData: () => Promise<void>;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  products,
  orders,
  onRefreshData,
  onShowToast,
}) => {
  const config = getSavedSupabaseConfig();
  const [urlInput, setUrlInput] = useState(config.url || '');
  const [keyInput, setKeyInput] = useState(config.key || '');
  const [copiedSql, setCopiedSql] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'sql' | 'postimages' | 'settings'>('status');
  
  // Postimages test URL preview
  const [testImageUrl, setTestImageUrl] = useState('');
  const [imageLoadError, setImageLoadError] = useState(false);

  if (!isOpen) return null;

  const connected = isSupabaseConnected();

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    onShowToast('Script SQL Copiado', 'Pégalo en el SQL Editor de tu panel de Supabase y dale a Run.', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);

    try {
      saveSupabaseCredentialsLocal(urlInput, keyInput);
      const testProds = await dbFetchProducts();

      if (testProds !== null) {
        onShowToast('¡Conectado a Supabase!', 'Tablas detectadas y sincronización activa.', 'success');
        await onRefreshData();
      } else {
        onShowToast(
          'Credenciales Guardadas',
          'Asegúrate de haber ejecutado el script SQL en Supabase para crear las 7 tablas.',
          'info'
        );
      }
    } catch (err: any) {
      onShowToast('Error de Conexión', err.message || 'No se pudo conectar a Supabase.', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSeedDatabase = async () => {
    if (!isSupabaseConnected()) {
      onShowToast('Configura Supabase Primero', 'Ingresa la URL y Anon Key en la pestaña Credenciales.', 'error');
      return;
    }

    setIsSeeding(true);
    try {
      const okProds = await dbSeedProducts(products);
      const okOrders = await dbSeedOrders(orders);
      const okSupplies = await dbSeedSupplies(INITIAL_SUPPLIES);

      if (okProds) {
        onShowToast(
          '¡Base de Datos Sincronizada!',
          `Se migraron ${products.length} productos, insumos y pedidos a Supabase con éxito.`,
          'success'
        );
        await onRefreshData();
      } else {
        onShowToast(
          'Error al migrar',
          'Verifica haber corrido el Script SQL en el SQL Editor de Supabase.',
          'error'
        );
      }
    } catch (err: any) {
      onShowToast('Error al migrar', err.message, 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div
        className={`w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif-craft text-base sm:text-lg font-bold">
                  Supabase Database & Sincronización en la Nube
                </h3>
                {connected ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> 🟢 Conectado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> 🟡 Modo Local (Sin Conectar)
                  </span>
                )}
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Control central de Productos, Pedidos, Insumos, Kardex, Imágenes y Branding.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="px-4 sm:px-5 pt-3 border-b border-slate-500/10 flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'status'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Estado & Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sql'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Script SQL (7 Tablas)</span>
          </button>

          <button
            onClick={() => setActiveTab('postimages')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'postimages'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>📸 Guía Postimages</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Credenciales API</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
          
          {/* TAB 1: STATUS & SYNC */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Connection Status Box */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  connected
                    ? isDarkMode
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : isDarkMode
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                {connected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {connected ? 'Conexión a Supabase Activa y Operativa' : 'Supabase no configurado (Modo Local)'}
                  </h4>
                  <p className="mt-1 leading-relaxed opacity-90">
                    {connected
                      ? 'Todos los pedidos de clientes, cambios de estado en cocina/horno, edición de productos y movimientos de stock se guardan y reflejan en tiempo real en la nube.'
                      : 'La tienda guarda los pedidos localmente. Para habilitar la base de datos centralizada y sincronización multidispositivo, copia el Script SQL en la pestaña "Script SQL" e ingresa tus credenciales.'}
                  </p>
                </div>
              </div>

              {/* Action: Seed Database */}
              <div
                className={`p-4 rounded-xl border ${
                  isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-[#60b64d]" />
                      <span>Sincronizar Catálogo Completo a Supabase</span>
                    </h4>
                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Sube los {products.length} productos del catálogo, los insumos de panadería y pedidos existentes a tus tablas de Supabase en 1 clic.
                    </p>
                  </div>

                  <button
                    onClick={handleSeedDatabase}
                    disabled={isSeeding}
                    className="px-4 py-2.5 rounded-xl bg-[#60b64d] hover:bg-[#50a040] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                    <span>{isSeeding ? 'Sincronizando Todo...' : 'Subir Catálogo a Supabase'}</span>
                  </button>
                </div>
              </div>

              {/* Resumen de Tablas en Supabase */}
              <div className={`p-4 rounded-xl border space-y-2.5 ${
                isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#60b64d] flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  <span>Estructura de las 7 Tablas en Supabase:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
                  <div className="p-2.5 rounded-lg border border-slate-500/10 bg-black/20">
                    <strong className="text-emerald-400 font-mono">1. products:</strong> Catálogo, precios, badges, stock físico vs a producir, enlaces a fotos.
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-500/10 bg-black/20">
                    <strong className="text-emerald-400 font-mono">2. orders:</strong> Pedidos de clientes, agencias de transporte, teléfonos, estados y total.
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-500/10 bg-black/20">
                    <strong className="text-emerald-400 font-mono">3. order_items:</strong> Desglose de cada paquete/producto por pedido y factor de empaque.
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-500/10 bg-black/20">
                    <strong className="text-emerald-400 font-mono">4. raw_supplies:</strong> Materia prima (harina, manteca, anís, leche, empaques, umbrales).
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-500/10 bg-black/20">
                    <strong className="text-emerald-400 font-mono">5. inventory_movements:</strong> Kardex de compras, mermas y salidas automáticas.
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-500/10 bg-black/20">
                    <strong className="text-emerald-400 font-mono">6. store_settings:</strong> Logo, banners, número WhatsApp de pedidos y QR Yape/Plin.
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-500/10 bg-black/20 col-span-1 sm:col-span-2">
                    <strong className="text-emerald-400 font-mono">7. production_batches:</strong> Lotes y hornadas programadas con cálculo de paquetes y unidades.
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SQL SCHEMA */}
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Copia y pega este script en el <strong>SQL Editor</strong> de Supabase y pulsa <strong>Run</strong>:
                </p>
                <button
                  onClick={handleCopySql}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL Completo'}</span>
                </button>
              </div>

              <div className="relative">
                <pre
                  className={`p-3.5 rounded-xl text-[11px] font-mono overflow-x-auto max-h-80 border leading-relaxed ${
                    isDarkMode ? 'bg-[#060c09] border-[#1c3326] text-emerald-300' : 'bg-slate-900 border-slate-800 text-emerald-400'
                  }`}
                >
                  {SUPABASE_SQL_SETUP}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: POSTIMAGES TUTORIAL & LIVE URL TESTER */}
          {activeTab === 'postimages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-emerald-400">
                      Cómo subir fotos ilimitadas y gratis con Postimages
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      Ideal para fotos de pan chapla, quesos, embutidos, QR de Yape y logos.
                    </p>
                  </div>
                </div>

                <a
                  href="https://postimages.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-all shadow-xs"
                >
                  <span>Abrir Postimages.org</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Step by Step */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'
              }`}>
                <h5 className="font-bold text-xs uppercase tracking-wider text-[#60b64d]">
                  Pasos simples (tarda 10 segundos):
                </h5>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                    <p>Entra a <strong>postimages.org</strong> y haz clic en <strong>"Elige las imágenes"</strong>.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                    <p>En "Expiración" deja seleccionado <strong>"Sin vencimiento" (No expiration)</strong>.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
                    <p className="text-amber-300 font-semibold">
                      IMPORTANTE: Copia el campo llamado <span className="underline decoration-emerald-400">"Enlace directo"</span> (Direct link), que empieza con <code className="bg-black/40 px-1 py-0.5 rounded text-emerald-300">https://i.postimg.cc/.../foto.jpg</code>.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">4</span>
                    <p>Pega ese enlace en la casilla de imagen del producto o en el probador aquí abajo.</p>
                  </div>
                </div>
              </div>

              {/* Live URL Tester */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'
              }`}>
                <h5 className="font-bold text-xs uppercase tracking-wider text-[#60b64d] flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  <span>Probador de Imagen en Tiempo Real</span>
                </h5>
                <p className="text-xs text-slate-400">
                  Pega cualquier enlace de Postimages para comprobar que cargue al instante:
                </p>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://i.postimg.cc/xxxx/mi-producto.jpg"
                    value={testImageUrl}
                    onChange={(e) => {
                      setTestImageUrl(e.target.value);
                      setImageLoadError(false);
                    }}
                    className={`flex-1 p-2.5 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-[#0a120e] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  {testImageUrl && (
                    <button
                      onClick={() => setTestImageUrl('')}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {testImageUrl && (
                  <div className="mt-3 p-3 rounded-xl border border-slate-500/20 bg-black/30 flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 shrink-0 flex items-center justify-center">
                      {!imageLoadError ? (
                        <img
                          src={cleanDirectImageUrl(testImageUrl)}
                          alt="Test preview"
                          className="w-full h-full object-cover"
                          onError={() => setImageLoadError(true)}
                        />
                      ) : (
                        <span className="text-[10px] text-red-400 text-center p-1 font-bold">Error de enlace</span>
                      )}
                    </div>
                    <div>
                      {!imageLoadError ? (
                        <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> ¡Enlace Directo Válido! La imagen se verá perfecta en tu tienda.
                        </p>
                      ) : (
                        <p className="text-xs text-red-400 font-semibold">
                          No se pudo cargar la imagen. Asegúrate de copiar el <strong>"Enlace directo"</strong> (que termina en .jpg, .png o contiene i.postimg.cc).
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400 font-mono truncate max-w-sm mt-1">
                        {cleanDirectImageUrl(testImageUrl)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: CREDENTIALS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div>
                <label className="font-bold block mb-1">
                  Supabase Project URL (https://xxxx.supabase.co)
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="font-bold block mb-1">
                  Supabase Anon Public Key (eyJhbGciOi...)
                </label>
                <textarea
                  rows={3}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isTesting}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                >
                  {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                  <span>{isTesting ? 'Probando Conexión...' : 'Guardar y Conectar'}</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-500/10 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {connected ? '🟢 Base de datos conectada en tiempo real' : '🟡 Modo Local (Sin sincronización en la nube)'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

