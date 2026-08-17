import React, { useState } from 'react';
import { X, Lock, ArrowRight, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isDarkMode: boolean;
}

export const AdminAuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, isDarkMode }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // A simple hardcoded password for now. E.g., 'uberris2026' or 'admin123'
    if (password === 'admin123') {
      setError(false);
      setPassword('');
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border transition-colors ${
          isDarkMode
            ? 'bg-[#0d1712] border-[#1c3326] text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full hover:bg-slate-500/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-[#60b64d]/10 flex items-center justify-center mb-4 text-[#60b64d]">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-serif-craft mb-2">Acceso Administrativo</h2>
          <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Por favor ingresa la clave de administrador para gestionar pedidos e inventario. (Clave: admin123)
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Ingresa la contraseña..."
                autoFocus
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors ${
                  error 
                    ? 'border-red-500 focus:border-red-500' 
                    : isDarkMode
                      ? 'bg-[#08100c] border-[#1c3326] text-white focus:border-[#60b64d]'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#60b64d]'
                }`}
              />
              {error && (
                <div className="flex items-center gap-1.5 mt-2 text-red-500 text-xs font-medium">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Contraseña incorrecta. Intenta de nuevo.</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#60b64d] to-[#50a040] hover:brightness-105 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#60b64d]/25 transition-all"
            >
              <span>Ingresar al Panel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
