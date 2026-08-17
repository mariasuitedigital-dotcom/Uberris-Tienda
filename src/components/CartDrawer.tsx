import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Send, MapPin, Calendar, User, Phone, Home, FileText, ShoppingBag, Sparkles, CreditCard, Copy, CheckCircle2, Truck, Building2, Store, Clock, Info, Navigation } from 'lucide-react';
import { CartItem, Order } from '../types';
import { PALOMINO_BRANCHES, RIVERA_CARGO_BRANCHES, OTHER_SHIPPING_AGENCIES, PalominoBranch, RiveraCargoBranch } from '../data/shippingDestinations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onSubmitOrder: (order: Order) => void;
  isDarkMode: boolean;
}

export const CartDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSubmitOrder,
  isDarkMode,
}) => {
  // Form fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  // Shipping State
  const [shippingType, setShippingType] = useState<'palomino' | 'rivera_cargo' | 'agency' | 'store_pickup'>('palomino');
  const [selectedPalominoId, setSelectedPalominoId] = useState<string>('arriola');
  const [selectedRiveraId, setSelectedRiveraId] = useState<string>('rc_luna_pizarro');
  const [selectedOtherAgency, setSelectedOtherAgency] = useState<string>(OTHER_SHIPPING_AGENCIES[0]);
  const [customAgencyBranch, setCustomAgencyBranch] = useState<string>('');
  
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'yape' | 'bcp' | ''>('');
  const [copiedField, setCopiedField] = useState<string>('');
  const [formError, setFormError] = useState('');

  const currentPalominoBranch: PalominoBranch | undefined = PALOMINO_BRANCHES.find(
    (b) => b.id === selectedPalominoId
  ) || PALOMINO_BRANCHES[0];

  const currentRiveraBranch: RiveraCargoBranch | undefined = RIVERA_CARGO_BRANCHES.find(
    (b) => b.id === selectedRiveraId
  ) || RIVERA_CARGO_BRANCHES[0];

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  if (!isOpen) return null;

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalPackages = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSendWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!clientName.trim() || !clientPhone.trim()) {
      setFormError('Por favor completa tu nombre y teléfono de contacto.');
      return;
    }

    if (shippingType === 'agency' && !customAgencyBranch.trim()) {
      setFormError('Por favor ingresa la ciudad o sede de la agencia donde recibirás tu pedido.');
      return;
    }

    if (!paymentMethod) {
      setFormError('Por favor selecciona tu método de pago (Yape o BCP).');
      return;
    }

    setFormError('');

    // Determine final shipping description & destination
    let finalDestinationCity = '';
    let finalAgency = '';
    let finalBranch = '';
    let finalShippingAddress = '';
    let finalShippingNotice = '';

    if (shippingType === 'palomino') {
      finalDestinationCity = currentPalominoBranch.region.includes('Lima') ? 'Lima' : currentPalominoBranch.name;
      finalAgency = 'Expreso Palomino';
      finalBranch = currentPalominoBranch.name;
      finalShippingAddress = currentPalominoBranch.address;
      finalShippingNotice = `Horario: ${currentPalominoBranch.hours} | ${currentPalominoBranch.arrivalNotice} | Flete a pagar en destino (Mín. S/ 20)`;
    } else if (shippingType === 'rivera_cargo') {
      finalDestinationCity = 'Lima / Callao';
      finalAgency = 'Rivera Cargo';
      finalBranch = currentRiveraBranch.name;
      finalShippingAddress = currentRiveraBranch.address;
      finalShippingNotice = `${currentRiveraBranch.dispatchSchedule} | ${currentRiveraBranch.arrivalNotice}${currentRiveraBranch.phone ? ` | Tel: ${currentRiveraBranch.phone}` : ''} | Flete a pagar en destino`;
    } else if (shippingType === 'agency') {
      finalDestinationCity = customAgencyBranch.trim();
      finalAgency = selectedOtherAgency;
      finalBranch = customAgencyBranch.trim();
      finalShippingAddress = `Agencia ${selectedOtherAgency} - ${customAgencyBranch.trim()}`;
      finalShippingNotice = 'Flete/Costo de envío a pagar en destino por el cliente';
    } else {
      finalDestinationCity = 'Abancay';
      finalAgency = 'Recojo en Local';
      finalBranch = 'Panadería Artesanal Uberris (Abancay)';
      finalShippingAddress = 'Local Principal Abancay';
      finalShippingNotice = 'Recojo directo en tienda - Sin costo de envío';
    }

    // Create Order object for state persistence & inventory auto-deduction
    const newOrderId = `UBR-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 16);

    const newOrder: Order = {
      id: newOrderId,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      destinationCity: finalDestinationCity,
      status: 'pendiente',
      total: totalAmount,
      createdAt: formattedDate,
      notes: notes.trim() || undefined,
      paymentMethod: paymentMethod === 'yape' ? 'Yape' : 'BCP',
      shippingType,
      shippingAgency: finalAgency,
      shippingBranch: finalBranch,
      shippingAddress: finalShippingAddress,
      shippingNotice: finalShippingNotice,
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        unitLabel: item.product.unit,
        unitsPerPackage: item.product.unitsPerPackage,
      })),
    };

    // Save to App state
    onSubmitOrder(newOrder);

    // Build formatted WhatsApp message
    let itemsListText = '';
    cart.forEach((item, index) => {
      const realUnits = item.quantity * item.product.unitsPerPackage;
      const unitsDetail = item.product.unitsPerPackage > 1 ? ` (${realUnits} und. reales)` : '';
      itemsListText += `${index + 1}. *${item.product.name}*\n   📦 ${item.quantity} ${item.product.unit}${unitsDetail} - S/ ${(item.product.price * item.quantity).toFixed(2)}\n`;
    });

    const paymentInfo = paymentMethod === 'yape' ? 'Yape (932 220 326)' : 'Transferencia BCP Soles';

    let shippingBlockText = '';
    if (shippingType === 'palomino') {
      shippingBlockText = 
`🚚 *ENVÍO POR EXPRESO PALOMINO:*
🏢 *Sede/Agencia:* ${currentPalominoBranch.name}
📍 *Dirección:* ${currentPalominoBranch.address}
⏰ *Atención:* ${currentPalominoBranch.hours}
🕒 *Llegada Estimada:* ${currentPalominoBranch.arrivalNotice}
⚠️ *Flete:* Pago en destino por el cliente (Mín. S/ 20.00)`;
    } else if (shippingType === 'rivera_cargo') {
      shippingBlockText = 
`🚚 *ENVÍO POR RIVERA CARGO:*
🏢 *Sede / Agencia:* ${currentRiveraBranch.name}
📍 *Dirección:* ${currentRiveraBranch.address}
${currentRiveraBranch.phone ? `📞 *Teléfono Counter:* ${currentRiveraBranch.phone}\n` : ''}⏰ *Salida:* ${currentRiveraBranch.dispatchSchedule}
⚡ *Llegada Estimada:* ${currentRiveraBranch.arrivalNotice}
⚠️ *Flete:* Pago contra entrega en destino por el cliente`;
    } else if (shippingType === 'agency') {
      shippingBlockText = 
`🚚 *ENVÍO POR AGENCIA:*
🏢 *Empresa:* ${selectedOtherAgency}
📍 *Destino / Sede:* ${customAgencyBranch.trim()}
⚠️ *Flete:* Pago contra entrega en destino por el cliente`;
    } else {
      shippingBlockText = 
`🏪 *ENTREGA:* Recojo directo en Local Uberris (Abancay)`;
    }

    const waText = 
`🌟 *NUEVO PEDIDO DE PRODUCTOS ARTESANALES - UBERRIS* 🌟
-----------------------------------------
📋 *Código de Pedido:* #${newOrderId}
👤 *Cliente:* ${clientName.trim()}
📱 *Teléfono:* ${clientPhone.trim()}
-----------------------------------------
${shippingBlockText}
${notes.trim() ? `-----------------------------------------\n📝 *Notas:* ${notes.trim()}\n` : ''}-----------------------------------------
🥖 *DETALLE DE SU HORNADA:*
${itemsListText}-----------------------------------------
💰 *TOTAL PRODUCTOS:* S/ ${totalAmount.toFixed(2)}
💳 *Método de Pago:* ${paymentInfo}
📌 *Estado:* En breve enviaré mi comprobante/voucher de pago para procesar la hornada. ¡Muchas gracias!`;

    const encodedText = encodeURIComponent(waText);
    const waNumber = '51983451220'; // Standard Uberris business line
    const waUrl = `https://wa.me/${waNumber}?text=${encodedText}`;

    // Open WhatsApp
    window.open(waUrl, '_blank');

    // Clear cart & close drawer
    onClearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen max-w-md border-l flex flex-col shadow-2xl transition-all ${
            isDarkMode
              ? 'bg-[#08100c] border-[#1c3326] text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200/15 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#60b64d]/15 text-[#60b64d] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif-craft text-xl font-bold leading-tight">
                  Tu Carrito de Hornada
                </h2>
                <p className="text-xs text-slate-400">
                  {cart.length === 0
                    ? 'No has seleccionado productos'
                    : `${totalPackages} paquete(s) seleccionado(s)`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          {cart.length === 0 ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#60b64d]/10 text-[#60b64d] flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-serif-craft text-xl font-bold mb-1">Tu carrito está vacío</h3>
              <p className="text-xs text-slate-400 max-w-xs mb-6">
                Explora nuestro catálogo de pan chapla, quesos de valle, miel pura y productos andinos.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#60b64d] text-white text-xs font-semibold hover:bg-[#50a040] transition-colors shadow-md"
              >
                Volver al Catálogo
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
              {/* Cart Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  <span>Productos ({cart.length})</span>
                  <button
                    onClick={onClearCart}
                    className="text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Vaciar</span>
                  </button>
                </div>

                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                      isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold line-clamp-1">{item.product.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        S/ {item.product.price.toFixed(2)} • {item.product.unit}
                      </p>
                      {item.product.unitsPerPackage > 1 && (
                        <p className="text-[10px] text-emerald-400 font-medium">
                          Total: {item.quantity * item.product.unitsPerPackage} und. horneadas
                        </p>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-slate-500/30 rounded-lg overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="px-2 py-1 hover:bg-[#60b64d]/20 text-[#60b64d]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="px-2 py-1 hover:bg-[#60b64d]/20 text-[#60b64d]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulario de Despacho */}
              <form onSubmit={handleSendWhatsAppOrder} className="space-y-4 pt-4 border-t border-slate-200/15">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#60b64d]">
                  <Sparkles className="w-4 h-4" />
                  <span>Datos de Envío y WhatsApp</span>
                </div>

                {formError && (
                  <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs">
                    {formError}
                  </div>
                )}

                {/* Client Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 flex items-center gap-1 mb-1">
                    <User className="w-3.5 h-3.5 text-[#60b64d]" />
                    Nombre Completo del Cliente
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej. Sra. María Fernández"
                    className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none ${
                      isDarkMode
                        ? 'bg-[#0d1712] border-[#1c3326] text-white focus:border-[#60b64d]'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-[#60b64d]'
                    }`}
                  />
                </div>

                {/* Client Phone */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 flex items-center gap-1 mb-1">
                    <Phone className="w-3.5 h-3.5 text-[#60b64d]" />
                    Teléfono / WhatsApp de Contacto
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ej. 983 123 456"
                    className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none ${
                      isDarkMode
                        ? 'bg-[#0d1712] border-[#1c3326] text-white focus:border-[#60b64d]'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-[#60b64d]'
                    }`}
                  />
                </div>

                {/* Modalidad de Envío */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#60b64d]" />
                    Agencia / Método de Envío
                  </label>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShippingType('palomino')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1 text-xs font-bold transition-all ${
                        shippingType === 'palomino'
                          ? 'border-[#60b64d] bg-[#60b64d]/15 text-[#60b64d] shadow-sm ring-1 ring-[#60b64d]'
                          : isDarkMode
                          ? 'border-[#1c3326] bg-[#0d1712] text-slate-300 hover:border-[#60b64d]/40'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-[#60b64d]/40'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      <span className="leading-tight text-[11px]">Expreso Palomino</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShippingType('rivera_cargo')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1 text-xs font-bold transition-all ${
                        shippingType === 'rivera_cargo'
                          ? 'border-[#60b64d] bg-[#60b64d]/15 text-[#60b64d] shadow-sm ring-1 ring-[#60b64d]'
                          : isDarkMode
                          ? 'border-[#1c3326] bg-[#0d1712] text-slate-300 hover:border-[#60b64d]/40'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-[#60b64d]/40'
                      }`}
                    >
                      <Navigation className="w-4 h-4" />
                      <span className="leading-tight text-[11px]">Rivera Cargo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShippingType('agency')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1 text-xs font-bold transition-all ${
                        shippingType === 'agency'
                          ? 'border-[#60b64d] bg-[#60b64d]/15 text-[#60b64d] shadow-sm ring-1 ring-[#60b64d]'
                          : isDarkMode
                          ? 'border-[#1c3326] bg-[#0d1712] text-slate-300 hover:border-[#60b64d]/40'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-[#60b64d]/40'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span className="leading-tight text-[11px]">Otra Agencia</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShippingType('store_pickup')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1 text-xs font-bold transition-all ${
                        shippingType === 'store_pickup'
                          ? 'border-[#60b64d] bg-[#60b64d]/15 text-[#60b64d] shadow-sm ring-1 ring-[#60b64d]'
                          : isDarkMode
                          ? 'border-[#1c3326] bg-[#0d1712] text-slate-300 hover:border-[#60b64d]/40'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-[#60b64d]/40'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span className="leading-tight text-[11px]">Local Abancay</span>
                    </button>
                  </div>

                  {/* Palomino Branches Dropdown & Details */}
                  {shippingType === 'palomino' && (
                    <div className={`p-3 rounded-xl border space-y-2.5 animate-in fade-in duration-150 ${
                      isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-emerald-50/50 border-emerald-200'
                    }`}>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Selecciona la Sede de Palomino de llegada:
                        </label>
                        <select
                          value={selectedPalominoId}
                          onChange={(e) => setSelectedPalominoId(e.target.value)}
                          className={`w-full p-2 text-xs rounded-lg border font-medium focus:outline-none ${
                            isDarkMode
                              ? 'bg-[#08100c] border-[#1c3326] text-white focus:border-[#60b64d]'
                              : 'bg-white border-slate-200 text-slate-900 focus:border-[#60b64d]'
                          }`}
                        >
                          <optgroup label="📍 Lima">
                            {PALOMINO_BRANCHES.filter(b => b.region === 'Lima').map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </optgroup>
                          <optgroup label="📍 Ica y Nazca">
                            {PALOMINO_BRANCHES.filter(b => b.region === 'Ica y Nazca').map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </optgroup>
                          <optgroup label="📍 Provincias y Sur">
                            {PALOMINO_BRANCHES.filter(b => b.region === 'Provincias y Sur').map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </optgroup>
                        </select>
                      </div>

                      {/* Branch Info Card */}
                      {currentPalominoBranch && (
                        <div className="p-2.5 rounded-lg bg-black/20 border border-emerald-500/20 text-xs space-y-1.5">
                          <div className="flex items-start gap-1.5 text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-[#60b64d] shrink-0 mt-0.5" />
                            <span className="font-semibold text-[11px] text-white">
                              {currentPalominoBranch.address}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <Clock className="w-3 h-3 text-[#60b64d] shrink-0" />
                            <span>Atención: {currentPalominoBranch.hours}</span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-700/30 text-[11px]">
                            <span className="text-emerald-400 font-bold">
                              ⚡ {currentPalominoBranch.arrivalNotice}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              (Envío: 4:00 PM)
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Freight Policy Note */}
                      <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10.5px] text-amber-300">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                        <span>
                          <strong>Flete en destino:</strong> El costo de envío (mínimo S/ 20.00) se cancela directamente al recoger el paquete en la agencia Palomino.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Rivera Cargo Dropdown & Details */}
                  {shippingType === 'rivera_cargo' && (
                    <div className={`p-3 rounded-xl border space-y-2.5 animate-in fade-in duration-150 ${
                      isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-emerald-50/50 border-emerald-200'
                    }`}>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Selecciona la Sede de Rivera Cargo de llegada:
                        </label>
                        <select
                          value={selectedRiveraId}
                          onChange={(e) => setSelectedRiveraId(e.target.value)}
                          className={`w-full p-2 text-xs rounded-lg border font-medium focus:outline-none ${
                            isDarkMode
                              ? 'bg-[#08100c] border-[#1c3326] text-white focus:border-[#60b64d]'
                              : 'bg-white border-slate-200 text-slate-900 focus:border-[#60b64d]'
                          }`}
                        >
                          <optgroup label="📍 Lima Centro, Norte y Sur (Diario)">
                            {RIVERA_CARGO_BRANCHES.filter(b => b.zone === 'Lima Centro / Norte / Sur').map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </optgroup>
                          <optgroup label="📍 Callao y Ventanilla (Diario)">
                            {RIVERA_CARGO_BRANCHES.filter(b => b.zone === 'Callao y Ventanilla').map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </optgroup>
                          <optgroup label="🚚 Rutas Especiales (Salidas Martes y Viernes)">
                            {RIVERA_CARGO_BRANCHES.filter(b => b.zone === 'Rutas Especiales (Mar/Vie)').map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </optgroup>
                        </select>
                      </div>

                      {/* Branch Info Card */}
                      {currentRiveraBranch && (
                        <div className="p-2.5 rounded-lg bg-black/20 border border-emerald-500/20 text-xs space-y-1.5">
                          <div className="flex items-start gap-1.5 text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-[#60b64d] shrink-0 mt-0.5" />
                            <span className="font-semibold text-[11px] text-white">
                              {currentRiveraBranch.address}
                            </span>
                          </div>

                          {currentRiveraBranch.phone && (
                            <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                              <Phone className="w-3 h-3 text-[#60b64d] shrink-0" />
                              <span>
                                Counter: <a href={`tel:${currentRiveraBranch.phone.replace(/\s/g, '')}`} className="text-emerald-400 font-bold underline ml-1">{currentRiveraBranch.phone}</a>
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <Clock className="w-3 h-3 text-[#60b64d] shrink-0" />
                            <span>{currentRiveraBranch.dispatchSchedule}</span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-700/30 text-[11px]">
                            <span className="text-emerald-400 font-bold">
                              ⚡ {currentRiveraBranch.arrivalNotice}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Freight Policy Note */}
                      <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10.5px] text-amber-300">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                        <span>
                          <strong>Flete en destino:</strong> El costo de envío se cancela directamente al recoger el paquete en la agencia Rivera Cargo.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Other Agency Selector & Inputs */}
                  {shippingType === 'agency' && (
                    <div className={`p-3 rounded-xl border space-y-2.5 animate-in fade-in duration-150 ${
                      isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Empresa de Encomiendas:
                        </label>
                        <select
                          value={selectedOtherAgency}
                          onChange={(e) => setSelectedOtherAgency(e.target.value)}
                          className={`w-full p-2 text-xs rounded-lg border font-medium focus:outline-none ${
                            isDarkMode
                              ? 'bg-[#08100c] border-[#1c3326] text-white focus:border-[#60b64d]'
                              : 'bg-white border-slate-200 text-slate-900 focus:border-[#60b64d]'
                          }`}
                        >
                          {OTHER_SHIPPING_AGENCIES.map((ag) => (
                            <option key={ag} value={ag}>{ag}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Ciudad / Sede o Dirección de Llegada:
                        </label>
                        <input
                          type="text"
                          required
                          value={customAgencyBranch}
                          onChange={(e) => setCustomAgencyBranch(e.target.value)}
                          placeholder="Ej. Shalom Los Olivos, Lima o Marvisur Cusco..."
                          className={`w-full p-2 text-xs rounded-lg border focus:outline-none ${
                            isDarkMode
                              ? 'bg-[#08100c] border-[#1c3326] text-white focus:border-[#60b64d]'
                              : 'bg-white border-slate-200 text-slate-900 focus:border-[#60b64d]'
                          }`}
                        />
                      </div>

                      <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10.5px] text-amber-300">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                        <span>
                          <strong>Pago contra entrega:</strong> El costo del flete de la encomienda es asumido y cancelado por el cliente al recoger en la agencia.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Store Pickup */}
                  {shippingType === 'store_pickup' && (
                    <div className={`p-3 rounded-xl border space-y-1.5 animate-in fade-in duration-150 ${
                      isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                        <Store className="w-4 h-4" />
                        <span>Recojo directo en Horno & Tienda Uberris</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        📍 Abancay, Apurímac. Te notificaremos por WhatsApp en cuanto tu hornada esté lista para retiro. Sin costo de flete.
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 flex items-center gap-1 mb-2">
                    <CreditCard className="w-3.5 h-3.5 text-[#60b64d]" />
                    Método de Pago
                  </label>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('yape')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                        paymentMethod === 'yape'
                          ? 'border-[#742284] bg-[#742284]/15 text-[#a855f7] shadow-sm ring-1 ring-[#742284]'
                          : isDarkMode
                          ? 'border-[#1c3326] bg-[#0d1712] text-slate-300 hover:border-[#742284]/50'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-[#742284]/50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#742284]" />
                        <span className="font-extrabold text-sm">Yape</span>
                      </div>
                      <span className="text-[10px] opacity-75 font-normal">932 220 326</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bcp')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                        paymentMethod === 'bcp'
                          ? 'border-[#ff7800] bg-[#ff7800]/15 text-[#ff9800] shadow-sm ring-1 ring-[#ff7800]'
                          : isDarkMode
                          ? 'border-[#1c3326] bg-[#0d1712] text-slate-300 hover:border-[#ff7800]/50'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-[#ff7800]/50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#002a8f]" />
                        <span className="font-extrabold text-sm">Transferencia BCP</span>
                      </div>
                      <span className="text-[10px] opacity-75 font-normal">Cta & CCI Soles</span>
                    </button>
                  </div>

                  {/* Payment Details & Copy Info */}
                  {paymentMethod === 'yape' && (
                    <div className={`p-3 rounded-xl border animate-in fade-in duration-150 ${
                      isDarkMode ? 'bg-[#742284]/10 border-[#742284]/30' : 'bg-purple-50 border-purple-200'
                    }`}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-purple-400">Número de Yape:</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">
                          Titular: Uberris
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/20 border border-purple-500/20">
                        <span className="font-mono text-sm font-bold tracking-wider text-purple-200">
                          932 220 326
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy('932220326', 'yape')}
                          className="px-2.5 py-1 rounded-md bg-[#742284] hover:bg-[#8e2ba1] text-white text-xs font-semibold flex items-center gap-1 transition-all"
                        >
                          {copiedField === 'yape' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                              <span>¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'bcp' && (
                    <div className={`p-3 rounded-xl border space-y-2 animate-in fade-in duration-150 ${
                      isDarkMode ? 'bg-[#002a8f]/10 border-[#002a8f]/30' : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-blue-400">Banco de Crédito del Perú (BCP):</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">
                          Soles
                        </span>
                      </div>

                      {/* Cuenta BCP */}
                      <div className="p-2 rounded-lg bg-black/20 border border-blue-500/20">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>N° de Cuenta Soles:</span>
                          <button
                            type="button"
                            onClick={() => handleCopy('30500617175095', 'bcp_cta')}
                            className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-all"
                          >
                            {copiedField === 'bcp_cta' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                                <span>Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </div>
                        <span className="font-mono text-xs font-bold tracking-wider text-blue-200 block">
                          30500617175095
                        </span>
                      </div>

                      {/* CCI */}
                      <div className="p-2 rounded-lg bg-black/20 border border-blue-500/20">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>N° Cuenta Interbancaria (CCI):</span>
                          <button
                            type="button"
                            onClick={() => handleCopy('00230510061717509519', 'bcp_cci')}
                            className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-all"
                          >
                            {copiedField === 'bcp_cci' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                                <span>Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </div>
                        <span className="font-mono text-[11px] font-bold tracking-wider text-blue-200 block break-all">
                          00230510061717509519
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 flex items-center gap-1 mb-1">
                    <FileText className="w-3.5 h-3.5 text-[#60b64d]" />
                    Notas Adicionales (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej. Pan bien calentito, enviar por agencia antes de mediodía..."
                    className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none ${
                      isDarkMode
                        ? 'bg-[#0d1712] border-[#1c3326] text-white focus:border-[#60b64d]'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-[#60b64d]'
                    }`}
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3 text-sm">
                    <span className="font-semibold text-slate-400">Total a Pagar:</span>
                    <span className="font-serif-craft text-2xl font-bold text-[#60b64d]">
                      S/ {totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#60b64d] to-[#50a040] hover:brightness-105 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#60b64d]/25 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar Pedido por WhatsApp</span>
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    ⚡ Se abrirá WhatsApp con el formato de tu pedido, sede de agencia y datos para el envío.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

