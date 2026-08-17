import React, { useState, useMemo } from 'react';
import {
  Flame,
  PackageCheck,
  Package,
  Plus,
  Printer,
  Copy,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Boxes,
  Sparkles,
  ChevronRight,
  Edit2,
  Trash2,
  Phone,
  MessageSquare
} from 'lucide-react';
import {
  Product,
  Order,
  OrderStatus,
  RawSupply,
  InventoryMovement,
  ProductionConsolidatedItem,
  ProductionBreakdownClient
} from '../types';

interface Props {
  products: Product[];
  orders: Order[];
  supplies: RawSupply[];
  movements: InventoryMovement[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onSaveProduct: (product: Product) => void;
  onAddSupplyStock: (supplyId: string, addedAmount: number) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  isDarkMode: boolean;
}

export const AdminPanel: React.FC<Props> = ({
  products,
  orders,
  supplies,
  movements,
  onUpdateOrderStatus,
  onDeleteOrder,
  onSaveProduct,
  onAddSupplyStock,
  onShowToast,
  isDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'hoja_horno' | 'pedidos' | 'productos' | 'inventario'>('hoja_horno');

  // Filters for Hoja de Horno
  const [filterCity, setFilterCity] = useState<string>('Todas');
  const [filterCategory, setFilterCategory] = useState<string>('Todas');

  // Completed Production Items State (Local checkoff for bakers)
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  // Product editing modal state
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Stock addition modal
  const [stockSupplyId, setStockSupplyId] = useState<string | null>(null);
  const [stockAmountInput, setStockAmountInput] = useState<number>(10);

  // --- CONSOLIDATED PRODUCTION (HOJA DE HORNO) CALCULATION ---
  const consolidatedItems: ProductionConsolidatedItem[] = useMemo(() => {
    // Filter active orders that are in production or pending
    const activeOrders = orders.filter((o) => {
      if (o.status === 'cancelado' || o.status === 'entregado') return false;
      
      if (filterCity !== 'Todas' && o.destinationCity !== filterCity) return false;
      return true;
    });

    const map: Record<string, ProductionConsolidatedItem> = {};

    activeOrders.forEach((order) => {
      order.items.forEach((item) => {
        // Find matching product in catalog to ensure category & unitsPerPackage
        const matchedProduct = products.find((p) => p.id === item.productId);
        const category = matchedProduct ? matchedProduct.category : 'Panadería';
        const unitsPerPkg = item.unitsPerPackage || (matchedProduct ? matchedProduct.unitsPerPackage : 1);

        if (filterCategory !== 'Todas' && category !== filterCategory) {
          return;
        }

        if (!map[item.productId]) {
          map[item.productId] = {
            productId: item.productId,
            productName: item.productName,
            category: category,
            unitsPerPackage: unitsPerPkg,
            totalPackages: 0,
            totalUnits: 0,
            breakdown: [],
            status: 'pendiente',
          };
        }

        map[item.productId].totalPackages += item.quantity;
        map[item.productId].totalUnits += item.quantity * unitsPerPkg;

        const clientBreakdown: ProductionBreakdownClient = {
          orderId: order.id,
          clientName: order.clientName,
          destinationCity: order.destinationCity,
          packages: item.quantity,
          deliveryDate: order.deliveryDate,
        };
        map[item.productId].breakdown.push(clientBreakdown);
      });
    });

    return Object.values(map);
  }, [orders, products, filterCity, filterCategory]);

  // Production KPIs
  const totalVarieties = consolidatedItems.length;
  const totalUnitsToBake = consolidatedItems.reduce((acc, curr) => acc + curr.totalUnits, 0);
  const completedVarieties = consolidatedItems.filter((item) => completedItems[item.productId]).length;
  const completionPercentage = totalVarieties > 0 ? Math.round((completedVarieties / totalVarieties) * 100) : 0;

  const toggleCompleteProduction = (productId: string) => {
    setCompletedItems((prev) => {
      const next = { ...prev, [productId]: !prev[productId] };
      onShowToast(
        next[productId] ? '¡Hornada Marcada Lista!' : 'Item revertido a pendiente',
        next[productId] ? 'Producto listo para empaque y despacho' : undefined,
        'success'
      );
      return next;
    });
  };

  const handleCopyHojaHorno = () => {
    let text = `🥖 *HOJA DE HORNO UBERRIS - CONSOLIDADO DE PRODUCCIÓN* 🥖\n`;
    text += `📅 Fecha Reporte: ${new Date().toLocaleDateString('es-PE')}\n`;
    text += `📊 Total Unidades a Producir: ${totalUnitsToBake} unds en ${totalVarieties} variedades\n\n`;

    consolidatedItems.forEach((item, idx) => {
      text += `${idx + 1}. *${item.productName.toUpperCase()}*\n`;
      text += `   🔥 TOTAL: *${item.totalPackages} paquetes* = *${item.totalUnits} UNIDADES REALES* (${item.unitsPerPackage} und/pkg)\n`;
      text += `   👥 Desglose por Pedidos:\n`;
      item.breakdown.forEach((b) => {
        text += `      • ${b.clientName} (${b.destinationCity}): ${b.packages} pkg ()\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    onShowToast('Copiado al Portapapeles', 'Resumen listo para enviar por WhatsApp al equipo de panadería.', 'success');
  };

  const handlePrintHojaHorno = () => {
    window.print();
  };

  // Product Modal Handlers
  const openNewProductModal = () => {
    setEditingProduct({
      id: `PROD-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      description: '',
      price: 10.0,
      unit: 'Paquete x 5 und',
      unitsPerPackage: 5,
      category: 'Panadería',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
      available: true,
      stock: 50,
      badge: 'Artesanal',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;
    onSaveProduct(editingProduct as Product);
    setIsProductModalOpen(false);
    onShowToast('Producto Guardado', `Catalogado "${editingProduct.name}" actualizado con éxito.`, 'success');
  };

  return (
    <div className={`min-h-screen py-6 px-4 sm:px-6 lg:px-8 transition-colors ${
      isDarkMode ? 'bg-[#08100c] text-slate-100' : 'bg-[#f7f9f6] text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Admin Navigation Header */}
        <div className={`p-4 sm:p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#60b64d]">
              <Flame className="w-4 h-4" />
              <span>Centro de Control de Hornada y Producción</span>
            </div>
            <h1 className="font-serif-craft text-2xl sm:text-3xl font-bold leading-tight">
              Panel Administrativo Uberris
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Consolidación automática de masa, despacho de encomiendas e inventario de insumos andinos.
            </p>
          </div>

          {/* Tab Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-black/20 p-1.5 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('hoja_horno')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'hoja_horno'
                  ? 'bg-[#60b64d] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Hoja de Horno</span>
              {totalVarieties > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold">
                  {totalVarieties}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('pedidos')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'pedidos'
                  ? 'bg-[#60b64d] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Pedidos ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('inventario')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'inventario'
                  ? 'bg-[#60b64d] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Insumos & Stock</span>
            </button>

            <button
              onClick={() => setActiveTab('productos')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'productos'
                  ? 'bg-[#60b64d] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Productos</span>
            </button>
          </div>
        </div>

        {/* ================= TAB 1: HOJA DE HORNO / CONSOLIDADO ================= */}
        {activeTab === 'hoja_horno' && (
          <div className="space-y-6" id="printable-hoja-horno">
            
            {/* KPI Cards Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Variedades a Hornear</span>
                  <Flame className="w-4 h-4 text-amber-500" />
                </div>
                <div className="font-serif-craft text-3xl font-bold text-[#60b64d]">
                  {totalVarieties} <span className="text-xs font-sans text-slate-400 font-normal">recetas</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Consolidadas de pedidos activos</p>
              </div>

              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Total Unidades Reales</span>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="font-serif-craft text-3xl font-bold text-[#60b64d]">
                  {totalUnitsToBake} <span className="text-xs font-sans text-slate-400 font-normal">unidades</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Cálculo de masa x multiplicador</p>
              </div>

              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Avance de Hornada</span>
                  <PackageCheck className="w-4 h-4 text-[#60b64d]" />
                </div>
                <div className="font-serif-craft text-3xl font-bold text-[#60b64d]">
                  {completionPercentage}%
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-[#60b64d] h-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200'}`}>
                <span className="text-xs text-slate-400">Acciones de Impresión & WhatsApp</span>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={handleCopyHojaHorno}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#60b64d]/15 text-[#60b64d] hover:bg-[#60b64d] hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copiar</span>
                  </button>
                  <button
                    onClick={handlePrintHojaHorno}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filters Bar */}
            <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 no-print ${
              isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="font-bold text-slate-400 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-[#60b64d]" />
                  Filtrar Producción:
                </span>

                {/* City Filter */}
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg border focus:outline-none ${
                    isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <option value="Todas">Todas las ciudades</option>
                  <option value="Abancay">Abancay</option>
                  <option value="Andahuaylas">Andahuaylas</option>
                  <option value="Cusco">Cusco</option>
                  <option value="Lima">Lima</option>
                  <option value="Tamburco">Tamburco</option>
                  <option value="Chalhuanca">Chalhuanca</option>
                </select>

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg border focus:outline-none ${
                    isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <option value="Todas">Todas las categorías</option>
                  <option value="Panadería">Panadería</option>
                  <option value="Lácteos">Lácteos</option>
                  <option value="Embutidos">Embutidos</option>
                  <option value="Miel y Dulces">Miel y Dulces</option>
                  <option value="Papa Nativa">Papa Nativa</option>
                </select>

                {(filterCity !== 'Todas' || filterCategory !== 'Todas') && (
                  <button
                    onClick={() => {
                      
                      setFilterCity('Todas');
                      setFilterCategory('Todas');
                    }}
                    className="text-amber-400 hover:underline font-semibold"
                  >
                    Restablecer
                  </button>
                )}
              </div>
            </div>

            {/* Consolidated Production List / Cards */}
            {consolidatedItems.length === 0 ? (
              <div className={`p-12 text-center rounded-2xl border ${isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200'}`}>
                <Flame className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="font-serif-craft text-xl font-bold">No hay producción pendiente</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Todos los pedidos actuales están completados o no coinciden con los filtros seleccionados.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {consolidatedItems.map((item) => {
                  const isDone = !!completedItems[item.productId];

                  return (
                    <div
                      key={item.productId}
                      className={`p-5 rounded-2xl border transition-all ${
                        isDone
                          ? isDarkMode
                            ? 'bg-[#0d1712]/50 border-emerald-900/40 opacity-75'
                            : 'bg-emerald-50/50 border-emerald-200 opacity-75'
                          : isDarkMode
                          ? 'bg-[#0d1712] border-[#1c3326] shadow-md'
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        {/* Title & Formula Breakdown */}
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleCompleteProduction(item.productId)}
                            className={`p-2 rounded-xl border mt-1 transition-all ${
                              isDone
                                ? 'bg-[#60b64d] text-white border-[#60b64d]'
                                : isDarkMode
                                ? 'bg-[#08100c] border-[#1c3326] text-slate-500 hover:text-[#60b64d]'
                                : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-[#60b64d]'
                            }`}
                            title="Marcar como producido / horneado"
                          >
                            <CheckCircle2 className="w-6 h-6" />
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[#60b64d]/15 text-[#60b64d]">
                                {item.category}
                              </span>
                              <span className="text-xs text-slate-400">
                                {item.breakdown.length} pedido(s) vinculados
                              </span>
                            </div>

                            <h3 className={`font-serif-craft text-2xl font-bold mt-1 ${isDone ? 'line-through text-slate-500' : ''}`}>
                              {item.productName}
                            </h3>

                            {/* Multiplier Formula Badge */}
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                              <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold flex items-center gap-1.5">
                                <Flame className="w-3.5 h-3.5 text-amber-500" />
                                <span>
                                  Fórmula: {item.totalPackages} paquetes × {item.unitsPerPackage} und ={' '}
                                  <strong className="text-amber-400 text-sm font-serif-craft">
                                    {item.totalUnits} UNIDADES A HORNEAR
                                  </strong>
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Complete Button */}
                        <div className="flex items-center gap-2 shrink-0 no-print">
                          <button
                            onClick={() => toggleCompleteProduction(item.productId)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                              isDone
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                : 'bg-[#60b64d] hover:bg-[#50a040] text-white shadow-md shadow-[#60b64d]/20'
                            }`}
                          >
                            {isDone ? '✓ Listo en Horno' : 'Marcar Producido'}
                          </button>
                        </div>
                      </div>

                      {/* Client Orders Breakdown Table */}
                      <div className="mt-4 pt-4 border-t border-slate-200/10">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Distribución por Clientes & Destinos:
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {item.breakdown.map((b, i) => (
                            <div
                              key={i}
                              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                                isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div>
                                <span className="font-semibold block">{b.clientName}</span>
                                <span className="text-[11px] text-slate-400">
                                  {b.destinationCity}
                                </span>
                              </div>
                              <span className="font-bold px-2 py-1 rounded-md bg-[#60b64d]/20 text-[#60b64d]">
                                {b.packages} pkg ({b.packages * item.unitsPerPackage} unds)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: GESTIÓN DE PEDIDOS ================= */}
        {activeTab === 'pedidos' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200'
            }`}>
              <h2 className="font-serif-craft text-xl font-bold">Historial de Pedidos ({orders.length})</h2>
              <div className="text-xs text-slate-400">
                Cambia el estado del pedido a medida que avanza la hornada y despacho.
              </div>
            </div>

            {orders.length === 0 ? (
              <div className={`p-12 text-center rounded-2xl border ${isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200'}`}>
                <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="font-serif-craft text-xl font-bold">No hay pedidos registrados</h3>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const getStatusBadge = (status: OrderStatus) => {
                    switch (status) {
                      case 'pendiente':
                        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                      case 'en_produccion':
                        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                      case 'despachado':
                        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
                      case 'entregado':
                        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                      case 'cancelado':
                        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                    }
                  };

                  return (
                    <div
                      key={order.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-[#60b64d]">#{order.id}</span>
                            <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${getStatusBadge(order.status)}`}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </span>
                            {order.paymentMethod && (
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                                order.paymentMethod === 'Yape'
                                  ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                                  : 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                              }`}>
                                💳 {order.paymentMethod}
                              </span>
                            )}
                            {order.shippingAgency && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md border bg-emerald-500/15 border-emerald-500/30 text-emerald-300">
                                🚚 {order.shippingAgency}
                              </span>
                            )}
                            <span className="text-xs text-slate-400">Registrado: {order.createdAt}</span>
                          </div>

                          <h3 className="font-serif-craft text-xl font-bold">{order.clientName}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            📍 {order.destinationCity} • 📱 {order.clientPhone}
                            {order.shippingBranch && (
                              <span className="text-[#60b64d] font-semibold ml-2">
                                (Sede: {order.shippingBranch})
                              </span>
                            )}
                          </p>
                          {order.shippingAddress && (
                            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <span>🏢 Dirección entrega/agencia:</span>
                              <span className="text-slate-300 font-medium">{order.shippingAddress}</span>
                            </p>
                          )}
                          {order.notes && (
                            <p className="text-xs text-amber-300/80 mt-1 italic">
                              "{order.notes}"
                            </p>
                          )}
                        </div>

                        {/* Status Pipeline Buttons */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <select
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none ${
                              isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_produccion">En Producción</option>
                            <option value="despachado">Despachado</option>
                            <option value="entregado">Entregado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>

                          <button
                            onClick={() => {
                              const text = encodeURIComponent(`Hola ${order.clientName}, de Uberris te notificamos que tu pedido #${order.id} está con estado: *${order.status.toUpperCase()}*. ¡Gracias por preferir nuestros sabores artesanales!`);
                              window.open(`https://wa.me/${order.clientPhone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
                            }}
                            className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                            title="Notificar por WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteOrder(order.id)}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                            title="Eliminar pedido"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="mt-4 pt-3 border-t border-slate-200/10">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            {order.items.map((item, idx) => (
                              <span
                                key={idx}
                                className={`px-2.5 py-1 rounded-lg border font-medium ${
                                  isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-100 border-slate-200'
                                }`}
                              >
                                {item.productName} × <strong>{item.quantity}</strong> ({item.unitLabel})
                              </span>
                            ))}
                          </div>

                          <div className="font-serif-craft text-lg font-bold text-[#60b64d]">
                            Total: S/ {order.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: INVENTARIO DE INSUMOS ================= */}
        {activeTab === 'inventario' && (
          <div className="space-y-6">
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200'
            }`}>
              <div>
                <h2 className="font-serif-craft text-xl font-bold">Módulo de Inventario e Insumos Base</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Descuento automático de materia prima (harina, leche, manteca, sal) tras cada venta confirmada.
                </p>
              </div>
            </div>

            {/* Insumos Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supplies.map((sup) => {
                const isLowStock = sup.stock <= sup.minimumThreshold;

                return (
                  <div
                    key={sup.id}
                    className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                      isLowStock
                        ? 'border-amber-500/50 bg-amber-950/10'
                        : isDarkMode
                        ? 'bg-[#0d1712] border-[#1c3326]'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[#60b64d]/15 text-[#60b64d]">
                          {sup.category}
                        </span>
                        {isLowStock && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Stock Bajo
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif-craft text-lg font-bold leading-snug mb-1">{sup.name}</h3>
                      <p className="text-xs text-slate-400">
                        Umbral Mínimo: {sup.minimumThreshold} {sup.unit}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Stock Actual</span>
                        <span className={`font-serif-craft text-2xl font-bold ${isLowStock ? 'text-amber-400' : 'text-[#60b64d]'}`}>
                          {sup.stock} <span className="text-xs font-sans text-slate-400 font-normal">{sup.unit}</span>
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setStockSupplyId(sup.id);
                          setStockAmountInput(20);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#60b64d]/15 hover:bg-[#60b64d] text-[#60b64d] hover:text-white font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Reabastecer</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inventory Movement Log Table */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200'}`}>
              <h3 className="font-serif-craft text-lg font-bold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#60b64d]" />
                <span>Registro de Movimientos de Insumos</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b text-slate-400 uppercase tracking-wider ${isDarkMode ? 'border-[#1c3326]' : 'border-slate-200'}`}>
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Insumo</th>
                      <th className="py-2.5 px-3">Tipo</th>
                      <th className="py-2.5 px-3">Cantidad</th>
                      <th className="py-2.5 px-3">Referencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/10">
                    {movements.slice(0, 10).map((mov) => (
                      <tr key={mov.id}>
                        <td className="py-2.5 px-3 text-slate-400">{mov.date}</td>
                        <td className="py-2.5 px-3 font-semibold">{mov.supplyName}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              mov.type === 'venta_automatica'
                                ? 'bg-rose-500/15 text-rose-300'
                                : 'bg-emerald-500/15 text-emerald-300'
                            }`}
                          >
                            {mov.type === 'venta_automatica' ? 'DESCUENTO VENTA' : 'INGRESO COMPRA'}
                          </span>
                        </td>
                        <td className={`py-2.5 px-3 font-bold ${mov.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {mov.amount > 0 ? `+${mov.amount}` : mov.amount} {mov.unit}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{mov.referenceOrder || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: GESTIÓN DE PRODUCTOS ================= */}
        {activeTab === 'productos' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200'
            }`}>
              <div>
                <h2 className="font-serif-craft text-xl font-bold">Catálogo de Productos ({products.length})</h2>
                <p className="text-xs text-slate-400">Edita precios, unidades por paquete o crea nuevas especialidades del valle.</p>
              </div>

              <button
                onClick={openNewProductModal}
                className="px-4 py-2.5 rounded-xl bg-[#60b64d] text-white font-bold text-xs flex items-center gap-2 hover:bg-[#50a040] transition-colors shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Producto</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border flex items-center gap-3 ${
                    isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200'
                  }`}
                >
                  <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-[#60b64d]">{p.category}</span>
                    <h3 className="font-serif-craft text-base font-bold line-clamp-1">{p.name}</h3>
                    <p className="text-xs font-bold text-[#60b64d]">
                      S/ {p.price.toFixed(2)} • {p.unit}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Factor: {p.unitsPerPackage} und/pkg
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setIsProductModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Reabastecer Stock Insumo */}
        {stockSupplyId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className={`w-full max-w-sm p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white text-slate-900'}`}>
              <h3 className="font-serif-craft text-xl font-bold mb-2">Ingresar Stock de Insumo</h3>
              <p className="text-xs text-slate-400 mb-4">Ingresa la cantidad comprada para actualizar el inventario.</p>
              
              <input
                type="number"
                min="1"
                value={stockAmountInput}
                onChange={(e) => setStockAmountInput(Number(e.target.value))}
                className={`w-full p-3 text-sm rounded-xl border mb-4 focus:outline-none ${
                  isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'
                }`}
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStockSupplyId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-600 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onAddSupplyStock(stockSupplyId, stockAmountInput);
                    setStockSupplyId(null);
                    onShowToast('Stock Actualizado', 'Ingreso registrado en inventario.', 'success');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#60b64d] text-white font-bold text-xs"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Crear / Editar Producto */}
        {isProductModalOpen && editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className={`w-full max-w-lg p-6 rounded-2xl border max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white text-slate-900'
            }`}>
              <h3 className="font-serif-craft text-2xl font-bold mb-4">
                {editingProduct.id ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>

              <form onSubmit={handleSaveProductForm} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Nombre del Producto</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Descripción Artesanal</label>
                  <textarea
                    rows={2}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-400 block mb-1">Precio (S/)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={editingProduct.price || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                      className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-400 block mb-1">Unidades por Paquete (Factor)</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.unitsPerPackage || 1}
                      onChange={(e) => setEditingProduct({ ...editingProduct, unitsPerPackage: parseInt(e.target.value) })}
                      className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-400 block mb-1">Etiqueta Unidad</label>
                    <input
                      type="text"
                      value={editingProduct.unit || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                      placeholder="Ej. Paquete x 5 und"
                      className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-400 block mb-1">Categoría</label>
                    <select
                      value={editingProduct.category || 'Panadería'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                      className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <option value="Panadería">Panadería</option>
                      <option value="Lácteos">Lácteos</option>
                      <option value="Embutidos">Embutidos</option>
                      <option value="Miel y Dulces">Miel y Dulces</option>
                      <option value="Papa Nativa">Papa Nativa</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-400 block mb-1">URL de Imagen</label>
                  <input
                    type="text"
                    value={editingProduct.image || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div className="flex items-center gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-600 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-[#60b64d] text-white font-bold"
                  >
                    Guardar Producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
