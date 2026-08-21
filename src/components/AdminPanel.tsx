import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
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
  AlertCircle,
  Search,
  Filter,
  Layers,
  Boxes,
  Sparkles,
  Edit2,
  Trash2,
  Phone,
  MessageSquare,
  Building2,
  Store,
  Navigation,
  MapPin,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  SlidersHorizontal,
  X,
  ExternalLink,
  FileSpreadsheet,
  Download,
  Database,
  Globe,
  Share2,
  Mail,
  Settings,
  Save,
  CheckCircle
} from 'lucide-react';
import { isSupabaseConnected, dbUpsertStoreSettings } from '../lib/supabase';
import {
  Product,
  Order,
  OrderStatus,
  RawSupply,
  InventoryMovement,
  ProductionConsolidatedItem,
  ProductionBreakdownClient,
  StoreSettings
} from '../types';

interface Props {
  products: Product[];
  orders: Order[];
  supplies?: RawSupply[];
  movements?: InventoryMovement[];
  settings?: StoreSettings;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onAddSupplyStock?: (supplyId: string, addedAmount: number) => void;
  onSaveSettings?: (settings: StoreSettings) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  onOpenSupabaseModal?: () => void;
  isDarkMode: boolean;
}

export const AdminPanel: React.FC<Props> = ({
  products,
  orders,
  supplies = [],
  movements = [],
  settings,
  onUpdateOrderStatus,
  onDeleteOrder,
  onSaveProduct,
  onDeleteProduct,
  onAddSupplyStock,
  onSaveSettings,
  onShowToast,
  onOpenSupabaseModal,
  isDarkMode,
}) => {
  // Main Tab Navigation: 1. Producción & Horno, 2. Pedidos, 3. Inventario, 4. Redes & Footer
  const [activeMainTab, setActiveMainTab] = useState<'produccion' | 'pedidos' | 'inventario' | 'redes'>('produccion');

  // Local settings state for the form
  const [editingSettings, setEditingSettings] = useState<StoreSettings>(() => {
    return (
      settings || {
        id: 'main_store',
        businessName: 'Uberris del Valle',
        tagline: 'Panadería Tradicional & Sabores de Apurímac',
        phone: '+51 983 746 281',
        whatsappPhone: '51983746281',
        email: 'pedidos@uberrisdelvalle.com',
        addressText: 'Av. Arenas 450, Abancay - Apurímac, Perú',
        businessHours: 'Lunes a Sábado: 6:00 AM - 8:00 PM | Domingos: 6:00 AM - 1:30 PM',
        tiktokUrl: 'https://www.tiktok.com/@uberrisdelvalle',
        facebookUrl: 'https://www.facebook.com/uberrisdelvalle',
        instagramUrl: 'https://www.instagram.com/uberrisdelvalle',
        logoUrl: '',
        heroBannerUrl: '',
        yapeQrImage: '',
        plinQrImage: '',
        announcementBanner: '🌱 Hornadas frescas diarias con trigo andino de Apurímac. Envíos directos a Abancay, Andahuaylas, Cusco y Lima.',
      }
    );
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  React.useEffect(() => {
    if (settings) {
      setEditingSettings(settings);
    }
  }, [settings]);

  // Filters for orders
  const [filterCity, setFilterCity] = useState<string>('Todas');
  const [filterStatus, setFilterStatus] = useState<string>('activos');
  const [filterAgency, setFilterAgency] = useState<string>('Todas');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [filterDateMode, setFilterDateMode] = useState<'todas' | 'hoy' | 'rango'>('todas');
  const [filterDateStart, setFilterDateStart] = useState<string>('');
  const [filterDateEnd, setFilterDateEnd] = useState<string>('');

  // Filters for Product Inventory
  const [productFilterType, setProductFilterType] = useState<'todos' | 'con_stock' | 'a_producir' | 'agotados'>('todos');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('Todas');
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  const [deleteConfirmProductId, setDeleteConfirmProductId] = useState<string | null>(null);

  // Expanded client breakdown for baking items
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Completed Production Items State (Local checkoff for bakers)
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  // Product editing modal state
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Production View Sub-tab Mode (Resumen de Hornada vs Hoja de Despacho vs Combinado)
  const [productionViewMode, setProductionViewMode] = useState<'resumen' | 'despacho' | 'combinado'>('resumen');

  // Mobile filters drawer / collapse
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // --- FILTERED ORDERS ---
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (filterStatus === 'activos') {
        if (o.status === 'cancelado' || o.status === 'entregado') return false;
      } else if (filterStatus !== 'todos') {
        if (o.status !== filterStatus) return false;
      }

      // City filter
      if (filterCity !== 'Todas' && o.destinationCity !== filterCity) return false;

      // Agency filter
      if (filterAgency !== 'Todas') {
        if (filterAgency === 'Palomino' && !o.shippingAgency?.includes('Palomino')) return false;
        if (filterAgency === 'Rivera' && !o.shippingAgency?.includes('Rivera')) return false;
        if (filterAgency === 'Local' && !o.shippingAgency?.includes('Local') && o.shippingType !== 'store_pickup') return false;
      }

      // Search query
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase();
        const matchesClient = o.clientName.toLowerCase().includes(q);
        const matchesId = o.id.toLowerCase().includes(q);
        const matchesDest = o.destinationCity.toLowerCase().includes(q);
        const matchesAgency = (o.shippingAgency || '').toLowerCase().includes(q);
        const matchesPhone = o.clientPhone.includes(q);
        if (!matchesClient && !matchesId && !matchesDest && !matchesAgency && !matchesPhone) return false;
      }

      // Date filter
      if (filterDateMode === 'hoy') {
        const todayStr = new Date().toISOString().split('T')[0];
        const orderDateStr = o.createdAt ? o.createdAt.split('T')[0] : '';
        if (orderDateStr !== todayStr) return false;
      } else if (filterDateMode === 'rango') {
        const orderDateStr = o.createdAt ? o.createdAt.split('T')[0] : '';
        if (filterDateStart && orderDateStr < filterDateStart) return false;
        if (filterDateEnd && orderDateStr > filterDateEnd) return false;
      }

      return true;
    });
  }, [orders, filterStatus, filterCity, filterAgency, orderSearchQuery, filterDateMode, filterDateStart, filterDateEnd]);

  // --- CONSOLIDATED TOTALS TO PRODUCE (TOTAL A PRODUCIR) ---
  const consolidatedItems: ProductionConsolidatedItem[] = useMemo(() => {
    const map: Record<string, ProductionConsolidatedItem> = {};

    // Use active filtered orders for oven baking totals
    const bakingOrders = orders.filter((o) => {
      if (o.status === 'cancelado' || o.status === 'entregado') return false;
      if (filterCity !== 'Todas' && o.destinationCity !== filterCity) return false;
      if (filterDateMode === 'hoy') {
        const todayStr = new Date().toISOString().split('T')[0];
        const orderDateStr = o.createdAt ? o.createdAt.split('T')[0] : '';
        if (orderDateStr !== todayStr) return false;
      } else if (filterDateMode === 'rango') {
        const orderDateStr = o.createdAt ? o.createdAt.split('T')[0] : '';
        if (filterDateStart && orderDateStr < filterDateStart) return false;
        if (filterDateEnd && orderDateStr > filterDateEnd) return false;
      }
      return true;
    });

    bakingOrders.forEach((order) => {
      order.items.forEach((item) => {
        const matchedProduct = products.find((p) => p.id === item.productId);
        const category = matchedProduct ? matchedProduct.category : 'Panadería';
        const unitsPerPkg = item.unitsPerPackage || (matchedProduct ? matchedProduct.unitsPerPackage : 1);

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

    // Sort: Bakery items first, then highest units
    return Object.values(map).sort((a, b) => {
      if (a.category === 'Panadería' && b.category !== 'Panadería') return -1;
      if (b.category === 'Panadería' && a.category !== 'Panadería') return 1;
      return b.totalUnits - a.totalUnits;
    });
  }, [orders, products, filterCity, filterDateMode, filterDateStart, filterDateEnd]);

  // Production KPIs
  const totalVarieties = consolidatedItems.length;
  const totalUnitsToBake = consolidatedItems.reduce((acc, curr) => acc + curr.totalUnits, 0);
  const totalPackages = consolidatedItems.reduce((acc, curr) => acc + curr.totalPackages, 0);
  const completedVarieties = consolidatedItems.filter((item) => completedItems[item.productId]).length;
  const completionPercentage = totalVarieties > 0 ? Math.round((completedVarieties / totalVarieties) * 100) : 0;

  // Active orders counts for pills
  const activeOrdersCount = orders.filter(o => o.status === 'pendiente' || o.status === 'en_produccion').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pendiente').length;
  const inProductionOrdersCount = orders.filter(o => o.status === 'en_produccion').length;
  const dispatchedOrdersCount = orders.filter(o => o.status === 'despachado').length;

  // --- PRODUCT INVENTORY METRICS & FILTERS ---
  const productsWithStock = useMemo(() => products.filter(p => p.stockType === 'con_stock'), [products]);
  const productsOnDemand = useMemo(() => products.filter(p => p.stockType === 'a_producir' || !p.stockType), [products]);
  const outOfStockOrLowCount = useMemo(() => {
    return products.filter(p => p.available === false || (p.stockType === 'con_stock' && (p.stock || 0) <= 5)).length;
  }, [products]);

  const filteredAdminProducts = useMemo(() => {
    return products.filter((p) => {
      // Type filter
      if (productFilterType === 'con_stock' && p.stockType !== 'con_stock') return false;
      if (productFilterType === 'a_producir' && p.stockType === 'con_stock') return false;
      if (productFilterType === 'agotados') {
        const isOutOrLow = p.available === false || (p.stockType === 'con_stock' && (p.stock || 0) <= 5);
        if (!isOutOrLow) return false;
      }

      // Category filter
      if (productCategoryFilter !== 'Todas' && p.category !== productCategoryFilter) return false;

      // Search query
      if (productSearchQuery.trim()) {
        const q = productSearchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = (p.description || '').toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [products, productFilterType, productCategoryFilter, productSearchQuery]);

  const handleQuickStockChange = (product: Product, delta: number) => {
    const currentStock = product.stock || 0;
    const newStock = Math.max(0, currentStock + delta);
    onSaveProduct({ ...product, stock: newStock });
    onShowToast('Stock Actualizado', `${product.name}: ${newStock} unidades`, 'success');
  };

  const handleSetStockDirect = (product: Product, newStock: number) => {
    const stockVal = Math.max(0, isNaN(newStock) ? 0 : newStock);
    onSaveProduct({ ...product, stock: stockVal });
  };

  const handleToggleAvailability = (product: Product) => {
    const updated = { ...product, available: !product.available };
    onSaveProduct(updated);
    onShowToast(
      updated.available ? 'Producto Activado' : 'Producto Pausado',
      `${product.name} ${updated.available ? 'ahora es visible para clientes' : 'está oculto / pausado en la tienda'}`,
      'info'
    );
  };

  const handleToggleStockType = (product: Product) => {
    const newType = product.stockType === 'con_stock' ? 'a_producir' : 'con_stock';
    const updated: Product = {
      ...product,
      stockType: newType,
      stock: newType === 'con_stock' ? (product.stock && product.stock > 0 ? product.stock : 20) : 0,
    };
    onSaveProduct(updated);
    onShowToast(
      'Tipo de Inventario Modificado',
      `${product.name} ahora es "${newType === 'con_stock' ? 'Con Stock Físico' : 'A Producir (Bajo Demanda)'}"`,
      'info'
    );
  };

  const handleConfirmDeleteProduct = (productId: string) => {
    onDeleteProduct?.(productId);
    setDeleteConfirmProductId(null);
  };

  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      if (onSaveSettings) {
        onSaveSettings(editingSettings);
      }
      if (isSupabaseConnected()) {
        const success = await dbUpsertStoreSettings(editingSettings);
        if (!success) {
          throw new Error('No se pudo guardar la configuración en Supabase');
        }
        onShowToast(
          'Configuración Guardada en Supabase',
          'Los datos de redes sociales y pie de página se sincronizaron en la nube.',
          'success'
        );
      } else {
        onShowToast(
          'Configuración Guardada Localmente',
          'Conecta Supabase para sincronizar con todos los dispositivos en vivo.',
          'info'
        );
      }
    } catch (err: any) {
      console.error('Error saving store settings:', err);
      onShowToast('Error al Guardar', err.message || 'No se pudo guardar la configuración.', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const toggleCompleteProduction = (productId: string) => {
    setCompletedItems((prev) => {
      const next = { ...prev, [productId]: !prev[productId] };
      onShowToast(
        next[productId] ? '¡Marcado como Horneado!' : 'Revertido a pendiente',
        next[productId] ? 'Listo para empaque y despacho.' : undefined,
        'success'
      );
      return next;
    });
  };

  const toggleExpandItem = (productId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleCopyHojaHorno = () => {
    let text = `🥖 *HOJA DE HORNO UBERRIS - RESUMEN DE PRODUCCIÓN* 🥖\n`;
    text += `📅 *Fecha:* ${new Date().toLocaleDateString('es-PE')} ${new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}\n`;
    text += `🔥 *TOTAL A PRODUCIR:* ${totalUnitsToBake} UNIDADES (${totalPackages} paquetes en ${totalVarieties} productos)\n`;
    text += `📋 *PEDIDOS ACTIVOS:* ${filteredOrders.length} pedidos\n`;
    text += `-----------------------------------------\n`;
    text += `🍞 *TOTALES POR PRODUCTO:*\n`;

    consolidatedItems.forEach((item, idx) => {
      text += `${idx + 1}. *${item.productName.toUpperCase()}*\n`;
      text += `   👉 *${item.totalPackages} paquetes* × ${item.unitsPerPackage} und = *${item.totalUnits} UNIDADES*\n`;
    });

    text += `-----------------------------------------\n`;
    text += `📦 *DETALLE DE PEDIDOS:*\n`;

    filteredOrders.forEach((order, idx) => {
      const itemsSummary = order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ');
      const agencyInfo = order.shippingAgency ? ` (${order.shippingAgency}${order.shippingBranch ? ` - ${order.shippingBranch}` : ''})` : '';
      text += `${idx + 1}. *#${order.id}* - *${order.clientName}* [${order.destinationCity}${agencyInfo}]\n`;
      text += `   🛍️ ${itemsSummary}\n`;
      text += `   💰 Total: S/ ${order.total.toFixed(2)} | Pago: ${order.paymentMethod || 'Yape/BCP'} | Estado: ${order.status.toUpperCase()}\n`;
    });

    text += `-----------------------------------------\n`;
    text += `🥖 *Panadería Artesanal Uberris — Valle de Apurímac*`;

    navigator.clipboard.writeText(text);
    onShowToast('Copiado al Portapapeles', 'Hoja de horno lista para enviar por WhatsApp al equipo.', 'success');
  };

  const handlePrintHojaHorno = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    try {
      if (filteredOrders.length === 0 && orders.length === 0) {
        onShowToast('Sin Datos', 'No hay pedidos disponibles para exportar a Excel.', 'info');
        return;
      }

      const ordersToExport = filteredOrders.length > 0 ? filteredOrders : orders;

      // 1. Hoja "Pedidos": Listado detallado de pedidos
      const ordersData = ordersToExport.map((order) => {
        const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.productName}`).join('; ');
        const totalItemsCount = order.items.reduce((acc, i) => acc + i.quantity, 0);
        const dateFormatted = order.createdAt
          ? new Date(order.createdAt).toLocaleString('es-PE')
          : new Date().toLocaleString('es-PE');

        return {
          'N° Pedido': order.id,
          'Fecha / Hora': dateFormatted,
          'Cliente': order.clientName,
          'Teléfono': order.clientPhone,
          'Email': order.clientEmail || '-',
          'Ciudad Destino': order.destinationCity,
          'Tipo de Envío': order.shippingType === 'store_pickup' ? 'Recojo en Tienda Abancay' : 'Envío por Agencia / Domicilio',
          'Agencia de Envío': order.shippingAgency || 'Local',
          'Sede Agencia / Sucursal': order.shippingBranch || '-',
          'Dirección': order.shippingAddress || '-',
          'Productos Solicitados': itemsSummary,
          'Total Paquetes': totalItemsCount,
          'Subtotal (S/)': Number((order.subtotal || (order.total - (order.shippingCost || 0))).toFixed(2)),
          'Costo Envío (S/)': Number((order.shippingCost || 0).toFixed(2)),
          'Total General (S/)': Number(order.total.toFixed(2)),
          'Método de Pago': order.paymentMethod || 'Yape / BCP',
          'Estado': order.status.toUpperCase().replace('_', ' '),
          'Notas / Indicaciones': order.notes || '-'
        };
      });

      // 2. Hoja "Detalle de Productos": Desglose por producto para tablas dinámicas
      const itemsData: any[] = [];
      ordersToExport.forEach((order) => {
        order.items.forEach((item) => {
          const prod = products.find((p) => p.id === item.productId);
          const unitsPerPkg = prod?.unitsPerPackage || (item.unitLabel.includes('5') ? 5 : item.unitLabel.includes('10') ? 10 : 1);
          const dateFormatted = order.createdAt
            ? new Date(order.createdAt).toLocaleDateString('es-PE')
            : new Date().toLocaleDateString('es-PE');

          itemsData.push({
            'N° Pedido': order.id,
            'Fecha': dateFormatted,
            'Cliente': order.clientName,
            'Ciudad Destino': order.destinationCity,
            'Agencia': order.shippingAgency || 'Local',
            'Categoría': prod?.category || 'Panadería',
            'Producto': item.productName,
            'Paquetes Comprados': item.quantity,
            'Unidades x Paquete': unitsPerPkg,
            'Total Unidades Reales': item.quantity * unitsPerPkg,
            'Precio Unitario (S/)': Number(item.price.toFixed(2)),
            'Subtotal (S/)': Number((item.price * item.quantity).toFixed(2)),
            'Estado Pedido': order.status.toUpperCase().replace('_', ' ')
          });
        });
      });

      // 3. Hoja "Consolidado Hornada": Agrupación de masa para panadería
      const productionData = consolidatedItems.map((item) => ({
        'Producto': item.productName,
        'Categoría': item.category,
        'Paquetes Requeridos': item.totalPackages,
        'Unidades x Paquete': item.unitsPerPackage,
        'Total Unidades a Producir': item.totalUnits,
        'Cantidad de Pedidos': item.breakdown.length,
        'Estado de Hornada': completedItems[item.productId] ? 'LISTO / HORNEADO' : 'PENDIENTE EN HORNO'
      }));

      // 4. Hoja "Inventario de Productos": Estado de stock y productos bajo demanda
      const productsData = products.map((prod) => ({
        'ID': prod.id,
        'Producto': prod.name,
        'Categoría': prod.category,
        'Tipo de Control': prod.stockType === 'con_stock' ? 'CON STOCK FÍSICO' : 'A PRODUCIR (BAJO DEMANDA)',
        'Stock Actual (und)': prod.stockType === 'con_stock' ? (prod.stock || 0) : 'Bajo Demanda',
        'Unidad': prod.unit,
        'Factor (und/paquete)': prod.unitsPerPackage,
        'Precio (S/)': Number(prod.price.toFixed(2)),
        'Estado en Tienda': prod.available !== false ? 'ACTIVO' : 'PAUSADO',
        'Estado Stock': prod.available === false
          ? 'PAUSADO'
          : prod.stockType === 'con_stock'
          ? (prod.stock || 0) === 0
            ? 'AGOTADO'
            : (prod.stock || 0) <= 5
            ? 'STOCK BAJO'
            : 'DISPONIBLE'
          : 'DISPONIBLE (BAJO PEDIDO)'
      }));

      // Crear Libro de Trabajo Excel
      const workbook = XLSX.utils.book_new();

      const wsOrders = XLSX.utils.json_to_sheet(ordersData);
      const wsItems = XLSX.utils.json_to_sheet(itemsData);
      const wsProd = XLSX.utils.json_to_sheet(productionData);
      const wsProducts = XLSX.utils.json_to_sheet(productsData);

      // Anchos de columnas
      wsOrders['!cols'] = [
        { wch: 12 }, { wch: 20 }, { wch: 22 }, { wch: 14 }, { wch: 20 },
        { wch: 16 }, { wch: 26 }, { wch: 18 }, { wch: 20 }, { wch: 26 },
        { wch: 38 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 },
        { wch: 16 }, { wch: 16 }, { wch: 28 }
      ];

      wsItems['!cols'] = [
        { wch: 12 }, { wch: 14 }, { wch: 22 }, { wch: 16 }, { wch: 18 },
        { wch: 16 }, { wch: 32 }, { wch: 18 }, { wch: 18 }, { wch: 22 },
        { wch: 18 }, { wch: 18 }, { wch: 16 }
      ];

      wsProd['!cols'] = [
        { wch: 32 }, { wch: 16 }, { wch: 20 }, { wch: 18 }, { wch: 24 },
        { wch: 18 }, { wch: 22 }
      ];

      wsProducts['!cols'] = [
        { wch: 12 }, { wch: 28 }, { wch: 16 }, { wch: 28 }, { wch: 18 },
        { wch: 20 }, { wch: 20 }, { wch: 14 }, { wch: 16 }, { wch: 24 }
      ];

      XLSX.utils.book_append_sheet(workbook, wsOrders, 'Pedidos');
      XLSX.utils.book_append_sheet(workbook, wsItems, 'Detalle de Productos');
      XLSX.utils.book_append_sheet(workbook, wsProd, 'Consolidado Hornada');
      XLSX.utils.book_append_sheet(workbook, wsProducts, 'Inventario de Productos');

      const dateStr = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toTimeString().slice(0, 5).replace(':', '-');
      const fileName = `Uberris_Pedidos_${dateStr}_${timeStr}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);

      onShowToast('Excel Descargado', `Archivo "${fileName}" generado con éxito con ${ordersToExport.length} pedidos.`, 'success');
    } catch (err) {
      console.error('Error al exportar a Excel:', err);
      onShowToast('Error', 'No se pudo generar el archivo Excel.', 'error');
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pendiente':
        return {
          label: 'Pendiente',
          color: isDarkMode
            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            : 'bg-amber-50 text-amber-800 border-amber-300'
        };
      case 'en_produccion':
        return {
          label: 'En Horno',
          color: isDarkMode
            ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
            : 'bg-blue-50 text-blue-800 border-blue-300'
        };
      case 'despachado':
        return {
          label: 'Despachado',
          color: isDarkMode
            ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
            : 'bg-purple-50 text-purple-800 border-purple-300'
        };
      case 'entregado':
        return {
          label: 'Entregado',
          color: isDarkMode
            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            : 'bg-emerald-50 text-emerald-800 border-emerald-300'
        };
      case 'cancelado':
        return {
          label: 'Cancelado',
          color: isDarkMode
            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            : 'bg-rose-50 text-rose-800 border-rose-300'
        };
    }
  };

  const getAgencyBadge = (order: Order) => {
    if (order.shippingAgency?.includes('Palomino')) {
      return {
        label: 'Palomino',
        icon: Truck,
        color: isDarkMode
          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
          : 'bg-emerald-50 border-emerald-300 text-emerald-800'
      };
    }
    if (order.shippingAgency?.includes('Rivera Cargo')) {
      return {
        label: 'Rivera Cargo',
        icon: Navigation,
        color: isDarkMode
          ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
          : 'bg-blue-50 border-blue-300 text-blue-800'
      };
    }
    if (order.shippingType === 'store_pickup' || order.shippingAgency?.includes('Local')) {
      return {
        label: 'Local Abancay',
        icon: Store,
        color: isDarkMode
          ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
          : 'bg-amber-50 border-amber-300 text-amber-800'
      };
    }
    return {
      label: order.shippingAgency || 'Otra Agencia',
      icon: Building2,
      color: isDarkMode
        ? 'bg-slate-500/15 border-slate-500/30 text-slate-300'
        : 'bg-slate-100 border-slate-300 text-slate-700'
    };
  };

  // Quick next stage for orders
  const advanceOrderStatus = (orderId: string, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus = currentStatus;
    if (currentStatus === 'pendiente') nextStatus = 'en_produccion';
    else if (currentStatus === 'en_produccion') nextStatus = 'despachado';
    else if (currentStatus === 'despachado') nextStatus = 'entregado';
    
    if (nextStatus !== currentStatus) {
      onUpdateOrderStatus(orderId, nextStatus);
      onShowToast('Estado Actualizado', `Pedido #${orderId} actualizado a ${nextStatus.replace('_', ' ').toUpperCase()}`, 'success');
    }
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
    onShowToast('Producto Guardado', `"${editingProduct.name}" guardado correctamente.`, 'success');
  };

  return (
    <div className={`min-h-screen pb-16 transition-colors ${
      isDarkMode ? 'bg-[#08100c] text-slate-100' : 'bg-[#f4f7f4] text-slate-900'
    }`}>
      
      {/* Top Mobile-First Sticky Navigation Bar */}
      <div className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors ${
        isDarkMode ? 'bg-[#08100c]/95 border-[#1c3326]' : 'bg-white/95 border-slate-200 shadow-2xs'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
          
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            
            {/* Title & Live Status */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#60b64d]/15 text-[#60b64d] flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-serif-craft text-base sm:text-lg font-bold truncate">
                    Hoja de Horno & Admin
                  </h1>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#60b64d]/15 text-[#60b64d]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#60b64d] mr-1 animate-pulse" />
                    En Vivo
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                  Consolidado de masa a hornear y lista de despacho
                </p>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-1.5 shrink-0 no-print">
              {onOpenSupabaseModal && (
                <button
                  onClick={onOpenSupabaseModal}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${
                    isSupabaseConnected()
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50'
                      : isDarkMode
                      ? 'bg-[#08100c] border-[#1c3326] text-amber-400 hover:text-amber-300'
                      : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                  }`}
                  title={isSupabaseConnected() ? 'Base de datos Supabase conectada' : 'Configurar Base de Datos Supabase'}
                >
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden xs:inline">Supabase</span>
                  <span className={`w-2 h-2 rounded-full ${isSupabaseConnected() ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                </button>
              )}

              <button
                onClick={handleDownloadExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                title="Descargar pedidos e informe consolidado en formato Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Excel</span>
              </button>

              <button
                onClick={handleCopyHojaHorno}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#60b64d] hover:bg-[#50a040] text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                title="Copiar resumen para WhatsApp"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">WhatsApp</span>
              </button>

              <button
                onClick={handlePrintHojaHorno}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-1"
                title="Imprimir Hoja de Producción"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Imprimir</span>
              </button>
            </div>
          </div>

          {/* Segmented Horizontal Navigation Tabs */}
          <div className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-1 scrollbar-none no-print border-t pt-2 border-slate-500/10">
            
            {/* Tab 1: Producción & Hoja de Horno */}
            <button
              onClick={() => setActiveMainTab('produccion')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeMainTab === 'produccion'
                  ? 'bg-[#60b64d] text-white shadow-sm'
                  : isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>1. Producción & Horno</span>
              {totalUnitsToBake > 0 && (
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                  activeMainTab === 'produccion' ? 'bg-black/20 text-white' : 'bg-amber-400/20 text-amber-400'
                }`}>
                  {totalUnitsToBake} und
                </span>
              )}
            </button>

            {/* Tab 2: Lista de Pedidos */}
            <button
              onClick={() => setActiveMainTab('pedidos')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeMainTab === 'pedidos'
                  ? 'bg-[#60b64d] text-white shadow-sm'
                  : isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>2. Gestión de Pedidos</span>
              {filteredOrders.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                  activeMainTab === 'pedidos' ? 'bg-black/20 text-white' : 'bg-blue-400/20 text-blue-400'
                }`}>
                  {filteredOrders.length}
                </span>
              )}
            </button>

            {/* Tab 3: Inventario & Catálogo de Productos */}
            <button
              onClick={() => setActiveMainTab('inventario')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeMainTab === 'inventario'
                  ? 'bg-[#60b64d] text-white shadow-sm'
                  : isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>3. Inventario & Catálogo ({products.length})</span>
              {outOfStockOrLowCount > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center gap-0.5 animate-pulse shadow-xs"
                  title={`${outOfStockOrLowCount} producto(s) con stock bajo o pausados`}
                >
                  <AlertCircle className="w-2.5 h-2.5" />
                  {outOfStockOrLowCount}
                </span>
              )}
            </button>

            {/* Tab 4: Redes Sociales & Pie de Página */}
            <button
              onClick={() => setActiveMainTab('redes')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeMainTab === 'redes'
                  ? 'bg-[#60b64d] text-white shadow-sm'
                  : isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>4. Redes Sociales & Pie de Página</span>
            </button>

          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4">

        {/* ======================================================== */}
        {/* TAB 1: PRODUCCIÓN & HOJA DE HORNO (UNIFICADO)           */}
        {/* ======================================================== */}
        {activeMainTab === 'produccion' && (
          <div className="space-y-6" id="printable-hoja-horno">
            
            {/* Header Document Banner & Filters */}
            <div className={`p-4 sm:p-5 rounded-2xl border ${
              isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                      <Flame className="w-4 h-4" />
                    </div>
                    <h2 className="font-serif-craft text-xl font-bold">
                      Hoja de Producción & Horno
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {filterDateMode === 'hoy'
                      ? `Mostrando pedidos de HOY (${new Date().toLocaleDateString('es-PE')})`
                      : filterDateMode === 'rango' && (filterDateStart || filterDateEnd)
                      ? `Rango: ${filterDateStart || 'Inicio'} hasta ${filterDateEnd || 'Fin'}`
                      : 'Historial completo de pedidos'} • <strong className="text-[#60b64d]">{filteredOrders.length}</strong> pedidos ({totalUnitsToBake} unidades a hornear).
                  </p>
                </div>

                {/* Quick Actions (Excel, WhatsApp, Print) */}
                <div className="flex items-center gap-2 no-print flex-wrap">
                  <button
                    onClick={handleDownloadExcel}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                    title="Exportar hoja completa y pedidos a Excel (.xlsx)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Exportar Excel</span>
                  </button>
                  <button
                    onClick={handleCopyHojaHorno}
                    className="px-3.5 py-2 rounded-xl bg-[#60b64d] hover:bg-[#50a040] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                    title="Copiar resumen para WhatsApp"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar WhatsApp</span>
                  </button>
                  <button
                    onClick={handlePrintHojaHorno}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                    title="Imprimir Hoja de Producción & Despacho"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>

              {/* Filtros de Fecha & Destino */}
              <div className="mt-4 pt-3.5 border-t border-slate-500/10 space-y-3 no-print">
                {/* Date Filter Row */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-bold flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-[#60b64d]" /> Filtrar por Fecha:
                  </span>

                  <div className="flex items-center gap-1 bg-black/10 dark:bg-black/30 p-1 rounded-xl border border-slate-500/20 text-xs">
                    <button
                      onClick={() => setFilterDateMode('todas')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        filterDateMode === 'todas'
                          ? 'bg-[#60b64d] text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Todas las fechas
                    </button>
                    <button
                      onClick={() => setFilterDateMode('hoy')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        filterDateMode === 'hoy'
                          ? 'bg-[#60b64d] text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Pedidos de Hoy
                    </button>
                    <button
                      onClick={() => setFilterDateMode('rango')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        filterDateMode === 'rango'
                          ? 'bg-[#60b64d] text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Rango personalizado
                    </button>
                  </div>

                  {filterDateMode === 'rango' && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <input
                        type="date"
                        value={filterDateStart}
                        onChange={(e) => setFilterDateStart(e.target.value)}
                        className={`px-2.5 py-1 rounded-xl border text-xs ${
                          isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder="Desde"
                      />
                      <span className="text-slate-400 text-xs font-bold">a</span>
                      <input
                        type="date"
                        value={filterDateEnd}
                        onChange={(e) => setFilterDateEnd(e.target.value)}
                        className={`px-2.5 py-1 rounded-xl border text-xs ${
                          isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder="Hasta"
                      />
                      {(filterDateStart || filterDateEnd) && (
                        <button
                          onClick={() => {
                            setFilterDateStart('');
                            setFilterDateEnd('');
                          }}
                          className="text-[11px] text-rose-400 underline hover:text-rose-300 px-1"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Destination Filter Row */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                  <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#60b64d]" /> Destino:
                  </span>
                  {['Todas', 'Lima', 'Abancay', 'Andahuaylas', 'Cusco', 'Ica'].map((city) => (
                    <button
                      key={city}
                      onClick={() => setFilterCity(city)}
                      className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                        filterCity === city
                          ? 'bg-[#60b64d] text-white shadow-xs'
                          : isDarkMode
                          ? 'bg-[#0d1712] text-slate-400 hover:text-white border border-[#1c3326]'
                          : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar (Clean 2-4 column responsive cards) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 no-print">
              
              {/* Card: Total Unidades Reales */}
              <div className={`p-3.5 rounded-2xl border transition-all ${
                isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <div className={`flex items-center justify-between text-[11px] ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <span className="font-semibold">Total a Hornear</span>
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="font-serif-craft text-2xl sm:text-3xl font-extrabold text-[#60b64d] mt-0.5">
                  {totalUnitsToBake} <span className={`text-xs font-sans font-normal ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>unds</span>
                </div>
                <p className={`text-[10px] mt-0.5 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {totalPackages} paquetes en total
                </p>
              </div>

              {/* Card: Variedades de Recetas */}
              <div className={`p-3.5 rounded-2xl border transition-all ${
                isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <div className={`flex items-center justify-between text-[11px] ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <span className="font-semibold">Variedades</span>
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className={`font-serif-craft text-2xl sm:text-3xl font-extrabold mt-0.5 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {totalVarieties} <span className={`text-xs font-sans font-normal ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>recetas</span>
                </div>
                <p className={`text-[10px] mt-0.5 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  En {filteredOrders.length} pedidos filtrados
                </p>
              </div>

              {/* Card: Avance Hornada */}
              <div className={`p-3.5 rounded-2xl border col-span-2 md:col-span-2 transition-all ${
                isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <div className={`flex items-center justify-between text-[11px] mb-1 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <span className="font-semibold">Avance de Hornada</span>
                  <span className="text-xs font-bold text-[#60b64d]">{completedVarieties}/{totalVarieties} horneados ({completionPercentage}%)</span>
                </div>
                <div className={`w-full rounded-full h-2 overflow-hidden my-1.5 ${
                  isDarkMode ? 'bg-slate-800' : 'bg-slate-200'
                }`}>
                  <div
                    className="bg-gradient-to-r from-amber-500 to-[#60b64d] h-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <p className={`text-[10.5px] ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Toca el botón <strong className={isDarkMode ? 'text-slate-300' : 'text-slate-800'}>"✓ Listo"</strong> en cada producto cuando salga del horno.
                </p>
              </div>

            </div>

            {/* SUB-VIEW SWITCHER: RESUMEN DE HORNADA vs HOJA DE DESPACHO vs TODO EN UNO */}
            <div className={`p-2 rounded-2xl border flex items-center justify-between gap-2 no-print ${
              isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex items-center gap-1.5 flex-1 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setProductionViewMode('resumen')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    productionViewMode === 'resumen'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : isDarkMode
                      ? 'bg-[#08100c] text-slate-300 hover:text-white border border-[#1c3326]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                  <span>1. Resumen de Hornada ({consolidatedItems.length})</span>
                </button>

                <button
                  onClick={() => setProductionViewMode('despacho')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    productionViewMode === 'despacho'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : isDarkMode
                      ? 'bg-[#08100c] text-slate-300 hover:text-white border border-[#1c3326]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-blue-300" />
                  <span>2. Hoja de Despacho ({filteredOrders.length})</span>
                </button>

                <button
                  onClick={() => setProductionViewMode('combinado')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    productionViewMode === 'combinado'
                      ? 'bg-[#60b64d] text-white shadow-2xs'
                      : isDarkMode
                      ? 'bg-[#08100c] text-slate-300 hover:text-white border border-[#1c3326]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Vista Todo en Uno</span>
                </button>
              </div>

              <span className="text-[11px] font-semibold text-slate-400 hidden sm:block whitespace-nowrap pr-2">
                {completedVarieties} de {totalVarieties} listos
              </span>
            </div>

            {/* SECCIÓN A: TABLA RESUMEN CONSOLIDADO DE PRODUCCIÓN */}
            {(productionViewMode === 'resumen' || productionViewMode === 'combinado') && (
              <div className={`p-4 sm:p-5 rounded-2xl border ${
                isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-serif-craft text-base sm:text-lg font-bold flex items-center gap-2 text-amber-500">
                      <Flame className="w-4 h-4" />
                      <span>Resumen de Producción & Hornada</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Unidades exactas consolidadas para hornear según los pedidos seleccionados.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#60b64d] bg-[#60b64d]/10 px-2.5 py-1 rounded-lg">
                    {totalUnitsToBake} unidades totales ({totalPackages} paq)
                  </span>
                </div>

                {consolidatedItems.length === 0 ? (
                  <div className="py-8 text-center">
                    <Flame className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold">No hay producción pendiente</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      No hay pedidos activos en la fecha o destino seleccionado.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-500/20 text-slate-400 uppercase font-bold text-[11px]">
                          <th className="py-2.5 px-3 w-10 text-center no-print">Estado</th>
                          <th className="py-2.5 px-3">Producto</th>
                          <th className="py-2.5 px-3">Categoría</th>
                          <th className="py-2.5 px-3 text-center">Paquetes</th>
                          <th className="py-2.5 px-3 text-right">Total a Hornear / Producir</th>
                          <th className="py-2.5 px-3 text-center w-28 no-print">Clientes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-500/10">
                        {consolidatedItems.map((item) => {
                          const isDone = !!completedItems[item.productId];
                          const isExpanded = !!expandedItems[item.productId];
                          const isBakery = item.category === 'Panadería';

                          return (
                            <React.Fragment key={item.productId}>
                              <tr
                                className={`transition-colors ${
                                  isDone
                                    ? isDarkMode
                                      ? 'bg-emerald-950/20 opacity-75'
                                      : 'bg-emerald-50/60 opacity-75'
                                    : isDarkMode
                                    ? 'hover:bg-slate-800/40'
                                    : 'hover:bg-slate-50/80'
                                }`}
                              >
                                {/* Checkbox button */}
                                <td className="py-2.5 px-3 text-center no-print">
                                  <button
                                    onClick={() => toggleCompleteProduction(item.productId)}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                      isDone
                                        ? 'bg-[#60b64d] text-white shadow-xs'
                                        : isDarkMode
                                        ? 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-300'
                                    }`}
                                    title={isDone ? 'Marcar como pendiente' : 'Marcar como horneado/listo'}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </td>

                                {/* Product Name */}
                                <td className="py-2.5 px-3">
                                  <span className={`font-serif-craft text-sm font-bold block ${
                                    isDone
                                      ? 'line-through text-slate-400'
                                      : isDarkMode
                                      ? 'text-slate-100'
                                      : 'text-slate-900'
                                  }`}>
                                    {item.productName}
                                  </span>
                                  {isBakery && (
                                    <span className="text-[10px] text-slate-400 font-mono block">
                                      {item.unitsPerPackage} unidades por paquete
                                    </span>
                                  )}
                                </td>

                                {/* Category */}
                                <td className="py-2.5 px-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    isBakery
                                      ? 'bg-amber-500/15 text-amber-400'
                                      : 'bg-[#60b64d]/15 text-[#60b64d]'
                                  }`}>
                                    {item.category}
                                  </span>
                                </td>

                                {/* Packages */}
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`font-bold ${
                                    isDarkMode ? 'text-slate-200' : 'text-slate-800'
                                  }`}>
                                    {item.totalPackages} paq
                                  </span>
                                </td>

                                {/* Total Units to Produce */}
                                <td className="py-2.5 px-3 text-right">
                                  <div className="inline-flex items-baseline gap-1">
                                    <span className={`font-serif-craft text-base sm:text-lg font-extrabold ${
                                      isDone
                                        ? 'text-emerald-500'
                                        : isBakery
                                        ? 'text-amber-500'
                                        : 'text-[#60b64d]'
                                    }`}>
                                      {item.totalUnits}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                      {isBakery ? 'und a hornear' : 'und'}
                                    </span>
                                  </div>
                                  {isBakery && (
                                    <span className="text-[10px] text-slate-400 block">
                                      ({item.totalPackages} × {item.unitsPerPackage} und)
                                    </span>
                                  )}
                                </td>

                                {/* Breakdown accordion trigger */}
                                <td className="py-2.5 px-3 text-center no-print">
                                  <button
                                    onClick={() => toggleExpandItem(item.productId)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 mx-auto transition-colors ${
                                      isDarkMode
                                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                  >
                                    <span>{item.breakdown.length} ped.</span>
                                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                  </button>
                                </td>
                              </tr>

                              {/* Expanded Breakdown Rows */}
                              {isExpanded && (
                                <tr className={isDarkMode ? 'bg-[#08100c]/60' : 'bg-slate-50/70'}>
                                  <td colSpan={6} className="py-2.5 px-4 sm:px-6">
                                    <div className="space-y-1.5 border-l-2 border-[#60b64d] pl-3 py-1">
                                      <span className="text-[10.5px] uppercase font-bold text-slate-400 block tracking-wider">
                                        Desglose por cliente:
                                      </span>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                        {item.breakdown.map((b, idx) => (
                                          <div
                                            key={idx}
                                            className={`p-2 rounded-lg text-xs flex items-center justify-between border ${
                                              isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
                                            }`}
                                          >
                                            <div>
                                              <span className={`font-semibold block ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                                                {b.clientName}
                                              </span>
                                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                <MapPin className="w-2.5 h-2.5 text-[#60b64d]" /> {b.destinationCity}
                                              </span>
                                            </div>
                                            <span className="font-bold text-[#60b64d] bg-[#60b64d]/10 px-2 py-0.5 rounded text-[11px]">
                                              {b.packages} paq ({b.packages * item.unitsPerPackage} und)
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}

                        {/* Total Footer Row */}
                        <tr className="font-bold border-t-2 border-[#60b64d] bg-[#60b64d]/5">
                          <td className="py-3 px-3 no-print"></td>
                          <td className="py-3 px-3 uppercase text-[#60b64d] font-serif-craft text-sm">TOTAL GENERAL</td>
                          <td className="py-3 px-3"></td>
                          <td className={`py-3 px-3 text-center text-sm ${
                            isDarkMode ? 'text-slate-100' : 'text-slate-900'
                          }`}>
                            {totalPackages} paq
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="font-serif-craft text-lg sm:text-xl font-extrabold text-[#60b64d]">
                              {totalUnitsToBake}
                            </span>
                            <span className="text-xs text-[#60b64d] ml-1 uppercase font-sans font-bold">UNIDADES TOTALES</span>
                          </td>
                          <td className="py-3 px-3 no-print"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SECCIÓN B: HOJA COMPLETA DE DESPACHO & PEDIDOS */}
            {(productionViewMode === 'despacho' || productionViewMode === 'combinado') && (
              <div className={`p-4 sm:p-5 rounded-2xl border ${
                isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-serif-craft text-base sm:text-lg font-bold flex items-center gap-2 text-blue-500">
                      <FileText className="w-4 h-4" />
                      <span>Hoja Consolidada de Despacho & Empaque</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Detalle de pedidos para empaque, rotulado y asignación a agencias ({filteredOrders.length} pedidos).
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {filteredOrders.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No hay pedidos para mostrar con los filtros seleccionados.</p>
                  ) : (
                    filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[#60b64d]">#{order.id}</span>
                            <span className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{order.clientName}</span>
                            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>({order.destinationCity})</span>
                            {order.shippingAgency && (
                              <span className={`${isDarkMode ? 'text-blue-300' : 'text-blue-700'} font-medium`}>🚚 {order.shippingAgency}</span>
                            )}
                            <span className="text-[11px] text-slate-400 font-mono">
                              📅 {order.createdAt ? new Date(order.createdAt).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Hoy'}
                            </span>
                          </div>
                          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mt-1`}>
                            🛍️ {order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-[#60b64d] text-sm">S/ {order.total.toFixed(2)}</span>
                          <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} block text-[10px]`}>{order.status.toUpperCase()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: LISTA DE PEDIDOS (FAST, TOUCH-FRIENDLY & ACTIONS) */}
        {/* ======================================================== */}
        {activeMainTab === 'pedidos' && (
          <div className="space-y-4">
            
            {/* Search & Status Quick Chips Filter Bar */}
            <div className={`p-3.5 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Buscar por cliente, #pedido, teléfono, ciudad o agencia..."
                  className={`w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border focus:outline-none transition-all ${
                    isDarkMode
                      ? 'bg-[#08100c] border-[#1c3326] text-white focus:border-[#60b64d]'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#60b64d]'
                  }`}
                />
                {orderSearchQuery && (
                  <button
                    onClick={() => setOrderSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Horizontal Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-[#60b64d]" /> Estado:
                </span>
                
                {[
                  { id: 'activos', label: `🔥 Activos (${activeOrdersCount})` },
                  { id: 'todos', label: `Todos (${orders.length})` },
                  { id: 'pendiente', label: `⏳ Pendientes (${pendingOrdersCount})` },
                  { id: 'en_produccion', label: `🔥 En Horno (${inProductionOrdersCount})` },
                  { id: 'despachado', label: `🚚 Despachados (${dispatchedOrdersCount})` },
                  { id: 'entregado', label: `✅ Entregados` },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setFilterStatus(st.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                      filterStatus === st.id
                        ? 'bg-[#60b64d] text-white shadow-xs'
                        : isDarkMode
                        ? 'bg-[#08100c] text-slate-400 hover:text-white border border-[#1c3326]'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Courier Agency Quick Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                  <Truck className="w-3 h-3 text-[#60b64d]" /> Agencia:
                </span>
                {['Todas', 'Palomino', 'Rivera', 'Local'].map((ag) => (
                  <button
                    key={ag}
                    onClick={() => setFilterAgency(ag)}
                    className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap text-xs transition-all ${
                      filterAgency === ag
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isDarkMode
                        ? 'bg-[#08100c] text-slate-400 hover:text-white border border-[#1c3326]'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {ag === 'Palomino' ? '🚍 Palomino' : ag === 'Rivera' ? '📦 Rivera Cargo' : ag === 'Local' ? '🏪 Local' : 'Todas'}
                  </button>
                ))}

                {(filterStatus !== 'activos' || filterAgency !== 'Todas' || orderSearchQuery) && (
                  <button
                    onClick={() => {
                      setFilterStatus('activos');
                      setFilterAgency('Todas');
                      setOrderSearchQuery('');
                    }}
                    className="text-amber-400 hover:underline font-semibold ml-2 text-xs whitespace-nowrap"
                  >
                    Limpiar Filtros
                  </button>
                )}
              </div>

              {/* Action Toolbar with Excel Export & Order Count */}
              <div className="pt-2 border-t border-slate-500/10 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-slate-400">
                  Mostrando <strong className="text-[#60b64d]">{filteredOrders.length}</strong> de <strong>{orders.length}</strong> pedidos registrados
                </div>

                <button
                  onClick={handleDownloadExcel}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ml-auto"
                  title="Descargar pedidos filtrados a una hoja de cálculo Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Descargar Excel (.xlsx)</span>
                </button>
              </div>

            </div>

            {/* Orders Cards List (Mobile-Optimized) */}
            {filteredOrders.length === 0 ? (
              <div className={`p-8 text-center rounded-2xl border ${
                isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200'
              }`}>
                <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h3 className="font-serif-craft text-lg font-bold">No hay pedidos encontrados</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Prueba cambiando los filtros de búsqueda o seleccionando "Todos".
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusBadge(order.status);
                  const agencyBadge = getAgencyBadge(order);
                  const AgencyIcon = agencyBadge.icon;

                  return (
                    <div
                      key={order.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isDarkMode ? 'bg-[#0d1712] border-[#1c3326] hover:border-[#60b64d]/30' : 'bg-white border-slate-200 hover:border-[#60b64d]/30 shadow-2xs'
                      }`}
                    >
                      {/* Top Header: ID, Status, Agency, Time */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-500/10">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-xs text-[#60b64d]">#{order.id}</span>
                          
                          {/* Status Badge */}
                          <span className={`px-2 py-0.5 text-[10.5px] font-bold rounded-full border ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>

                          {/* Agency Badge */}
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border flex items-center gap-1 ${agencyBadge.color}`}>
                            <AgencyIcon className="w-3 h-3" />
                            <span>{agencyBadge.label}</span>
                          </span>

                          {/* Payment method */}
                          {order.paymentMethod && (
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md border ${
                              order.paymentMethod === 'Yape'
                                ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                                : 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                            }`}>
                              💳 {order.paymentMethod}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400">
                          {order.createdAt}
                        </span>
                      </div>

                      {/* Middle: Client Name, Phone, Destination */}
                      <div className="py-2.5 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={`font-serif-craft text-base sm:text-lg font-bold ${
                            isDarkMode ? 'text-slate-100' : 'text-slate-900'
                          }`}>
                            {order.clientName}
                          </h3>
                          <span className="font-serif-craft text-base sm:text-lg font-bold text-[#60b64d]">
                            S/ {order.total.toFixed(2)}
                          </span>
                        </div>

                        <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${
                          isDarkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#60b64d]" />
                            <a href={`tel:${order.clientPhone}`} className={`hover:underline font-medium ${
                              isDarkMode ? 'text-slate-200' : 'text-slate-800'
                            }`}>
                              {order.clientPhone}
                            </a>
                          </span>

                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#60b64d]" />
                            <strong className={isDarkMode ? 'text-slate-200' : 'text-slate-900'}>{order.destinationCity}</strong>
                            {order.shippingBranch && (
                              <span className="text-[#60b64d] font-semibold">
                                • Sede: {order.shippingBranch}
                              </span>
                            )}
                          </span>
                        </div>

                        {order.shippingAddress && order.shippingAddress !== order.shippingBranch && (
                          <p className={`text-[11px] ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            📍 Dirección: {order.shippingAddress}
                          </p>
                        )}

                        {order.notes && (
                          <p className={`text-xs italic p-2 rounded-lg border ${
                            isDarkMode
                              ? 'text-amber-300/90 bg-amber-500/10 border-amber-500/20'
                              : 'text-amber-950 bg-amber-50 border-amber-200'
                          }`}>
                            📝 "{order.notes}"
                          </p>
                        )}
                      </div>

                      {/* Items List Chips */}
                      <div className="py-2 flex flex-wrap items-center gap-1.5">
                        {order.items.map((item, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-1 rounded-lg border text-xs font-semibold ${
                              isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          >
                            {item.productName} × <strong className="text-[#60b64d]">{item.quantity}</strong> ({item.unitLabel})
                          </span>
                        ))}
                      </div>

                      {/* Bottom Action Row: Status Transition & WhatsApp Button */}
                      <div className="pt-2.5 border-t border-slate-500/10 flex flex-wrap items-center justify-between gap-2 no-print">
                        
                        {/* Status dropdown & advance button */}
                        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                          <select
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none flex-1 max-w-xs ${
                              isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white focus:border-[#60b64d]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#60b64d]'
                            }`}
                          >
                            <option value="pendiente">⏳ Pendiente</option>
                            <option value="en_produccion">🔥 En Horno</option>
                            <option value="despachado">🚚 Despachado</option>
                            <option value="entregado">✅ Entregado</option>
                            <option value="cancelado">❌ Cancelado</option>
                          </select>

                          {order.status !== 'entregado' && order.status !== 'cancelado' && (
                            <button
                              onClick={() => advanceOrderStatus(order.id, order.status)}
                              className="px-2.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold transition-colors whitespace-nowrap"
                              title="Avanzar al siguiente estado"
                            >
                              Siguiente →
                            </button>
                          )}
                        </div>

                        {/* WhatsApp & Delete Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              const statusMsg = 
                                order.status === 'en_produccion' ? '¡tu pedido ha entrado al horno para la hornada artesanal!' :
                                order.status === 'despachado' ? `¡tu pedido ya fue despachado por ${order.shippingAgency || 'agencia'} (${order.shippingBranch || order.destinationCity})!` :
                                order.status === 'entregado' ? '¡tu pedido fue entregado con éxito! ¡Buen provecho!' :
                                `tu pedido #${order.id} se encuentra registrado y en proceso.`;
                              
                              const text = encodeURIComponent(`Hola ${order.clientName}, de Panadería Artesanal Uberris te informamos que ${statusMsg} ¡Muchas gracias por tu preferencia!`);
                              window.open(`https://wa.me/${order.clientPhone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 font-bold text-xs transition-colors"
                            title="Notificar por WhatsApp al cliente"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            onClick={() => onDeleteOrder(order.id)}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                            title="Eliminar pedido"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: INVENTARIO & CATÁLOGO DE PRODUCTOS (UNIFICADO)    */}
        {/* ======================================================== */}
        {activeMainTab === 'inventario' && (
          <div className="space-y-4">
            
            {/* Header & Main Stats Bar */}
            <div className={`p-4 rounded-2xl border ${
              isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#60b64d]/15 text-[#60b64d] flex items-center justify-center shrink-0">
                      <Boxes className="w-4 h-4" />
                    </div>
                    <h2 className="font-serif-craft text-lg sm:text-xl font-bold">
                      Inventario & Catálogo de Productos
                    </h2>
                  </div>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Administra el stock físico de productos envasados/lácteos y configura especialidades de panadería producidas bajo demanda.
                  </p>
                </div>

                <button
                  onClick={openNewProductModal}
                  className="px-4 py-2.5 rounded-xl bg-[#60b64d] hover:bg-[#50a040] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Producto</span>
                </button>
              </div>

              {/* KPI Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3 border-t border-slate-500/10">
                
                {/* Total Products */}
                <div className={`p-3 rounded-xl border ${
                  isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Total Catálogo
                  </span>
                  <span className="font-serif-craft text-xl font-bold text-[#60b64d]">
                    {products.length} <span className="text-xs font-sans font-normal opacity-75">variedades</span>
                  </span>
                </div>

                {/* Con Stock Físico */}
                <div className={`p-3 rounded-xl border ${
                  isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    📦 Con Stock Físico
                  </span>
                  <span className="font-serif-craft text-xl font-bold text-emerald-500">
                    {productsWithStock.length} <span className="text-xs font-sans font-normal opacity-75">ítems ({productsWithStock.reduce((acc, p) => acc + (p.stock || 0), 0)} und)</span>
                  </span>
                </div>

                {/* A Producir / Bajo Demanda */}
                <div className={`p-3 rounded-xl border ${
                  isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                    🔥 Bajo Demanda (Horno)
                  </span>
                  <span className="font-serif-craft text-xl font-bold text-blue-500">
                    {productsOnDemand.length} <span className="text-xs font-sans font-normal opacity-75">especialidades</span>
                  </span>
                </div>

                {/* Agotados o Stock Bajo */}
                <div className={`p-3 rounded-xl border ${
                  outOfStockOrLowCount > 0
                    ? isDarkMode
                      ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                    : isDarkMode
                    ? 'bg-[#08100c] border-[#1c3326]'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={`text-[10px] uppercase font-bold block ${
                    outOfStockOrLowCount > 0 ? 'text-rose-500 font-extrabold' : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    ⚠️ Stock Bajo / Pausados
                  </span>
                  <span className={`font-serif-craft text-xl font-bold ${
                    outOfStockOrLowCount > 0 ? 'text-rose-500' : isDarkMode ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    {outOfStockOrLowCount} <span className="text-xs font-sans font-normal opacity-75">requieren atención</span>
                  </span>
                </div>

              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className={`p-3 sm:p-4 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, categoría o ingrediente..."
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl border focus:outline-none focus:border-[#60b64d] ${
                      isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                  {productSearchQuery && (
                    <button
                      onClick={() => setProductSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className={`px-3 py-2 text-xs rounded-xl border font-bold focus:outline-none focus:border-[#60b64d] shrink-0 ${
                    isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="Todas">📁 Todas las Categorías</option>
                  <option value="Panadería">🍞 Panadería</option>
                  <option value="Lácteos">🧀 Lácteos</option>
                  <option value="Embutidos">🥓 Embutidos</option>
                  <option value="Miel y Dulces">🍯 Miel y Dulces</option>
                  <option value="Papa Nativa">🥔 Papa Nativa</option>
                </select>

              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-500/10">
                <button
                  onClick={() => setProductFilterType('todos')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    productFilterType === 'todos'
                      ? 'bg-[#60b64d] text-white shadow-2xs'
                      : isDarkMode
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Todos ({products.length})
                </button>

                <button
                  onClick={() => setProductFilterType('con_stock')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    productFilterType === 'con_stock'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : isDarkMode
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Con Stock Físico ({productsWithStock.length})</span>
                </button>

                <button
                  onClick={() => setProductFilterType('a_producir')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    productFilterType === 'a_producir'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : isDarkMode
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Bajo Demanda / Horno ({productsOnDemand.length})</span>
                </button>

                <button
                  onClick={() => setProductFilterType('agotados')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    productFilterType === 'agotados'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : isDarkMode
                      ? 'bg-slate-800 text-rose-300 hover:bg-slate-700'
                      : 'bg-slate-100 text-rose-700 hover:bg-slate-200'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Stock Bajo / Agotados ({outOfStockOrLowCount})</span>
                </button>
              </div>
            </div>

            {/* Products List / Grid */}
            {filteredAdminProducts.length === 0 ? (
              <div className={`p-10 rounded-2xl border text-center ${
                isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200'
              }`}>
                <Boxes className="w-12 h-12 mx-auto text-slate-400 mb-2 opacity-50" />
                <h3 className="font-serif-craft text-base font-bold">No se encontraron productos</h3>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Prueba cambiando los filtros o el término de búsqueda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredAdminProducts.map((p) => {
                  const isConStock = p.stockType === 'con_stock';
                  const currentStock = p.stock || 0;
                  const isOutOfStock = isConStock && currentStock === 0;
                  const isLowStock = isConStock && currentStock > 0 && currentStock <= 5;
                  const isPaused = p.available === false;

                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                        isPaused
                          ? isDarkMode
                            ? 'bg-[#0a120e]/60 border-slate-800 opacity-70'
                            : 'bg-slate-100/80 border-slate-300 opacity-75'
                          : isOutOfStock
                          ? isDarkMode
                            ? 'bg-rose-950/20 border-rose-500/50 shadow-2xs'
                            : 'bg-rose-50/70 border-rose-300 shadow-2xs'
                          : isLowStock
                          ? isDarkMode
                            ? 'bg-amber-950/15 border-amber-500/40'
                            : 'bg-amber-50/80 border-amber-300'
                          : isDarkMode
                          ? 'bg-[#0d1712] border-[#1c3326]'
                          : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      {/* Top Info */}
                      <div>
                        <div className="flex items-start gap-3 mb-2.5">
                          <div className="relative shrink-0">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-16 h-16 rounded-xl object-cover border border-slate-500/20"
                            />
                            {p.badge && (
                              <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.2 rounded-md bg-[#60b64d] text-white text-[9px] font-bold shadow-xs">
                                {p.badge}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] uppercase font-bold text-[#60b64d]">
                                {p.category}
                              </span>

                              {/* Store Visibility status */}
                              <button
                                onClick={() => handleToggleAvailability(p)}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                                  !isPaused
                                    ? 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25'
                                    : 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30'
                                }`}
                                title={!isPaused ? 'Click para pausar en la tienda' : 'Click para activar en la tienda'}
                              >
                                {!isPaused ? '✓ Activo' : '⏸ Pausado'}
                              </button>
                            </div>

                            <h3 className={`font-serif-craft text-sm sm:text-base font-bold truncate leading-tight ${
                              isDarkMode ? 'text-slate-100' : 'text-slate-900'
                            }`}>
                              {p.name}
                            </h3>

                            <div className="flex items-center gap-2 mt-0.5 text-xs font-bold text-[#60b64d]">
                              <span>S/ {p.price.toFixed(2)}</span>
                              <span className={`text-[10px] font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                • {p.unit} ({p.unitsPerPackage} und/paq)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Control Box: Con Stock vs Bajo Demanda */}
                        <div className={`p-3 rounded-xl border mb-3 ${
                          isConStock
                            ? isOutOfStock
                              ? isDarkMode ? 'bg-rose-950/30 border-rose-500/40' : 'bg-rose-100/60 border-rose-300'
                              : isLowStock
                              ? isDarkMode ? 'bg-amber-950/25 border-amber-500/40' : 'bg-amber-100/60 border-amber-300'
                              : isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'
                            : isDarkMode ? 'bg-blue-950/15 border-blue-500/30' : 'bg-blue-50/70 border-blue-200'
                        }`}>
                          
                          {/* Type Header */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${
                              isConStock
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {isConStock ? <Package className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
                              <span>{isConStock ? 'Stock Físico' : 'A Producir (Horno)'}</span>
                            </span>

                            {/* Switch type button */}
                            <button
                              onClick={() => handleToggleStockType(p)}
                              className={`text-[10px] font-semibold underline hover:opacity-100 transition-opacity ${
                                isDarkMode ? 'text-slate-400' : 'text-slate-600'
                              }`}
                              title={isConStock ? 'Cambiar a modo producción bajo demanda' : 'Cambiar a modo control con stock físico'}
                            >
                              {isConStock ? 'Pasar a Bajo Demanda' : 'Activar Stock'}
                            </button>
                          </div>

                          {/* Stock Controls for Physical Stock */}
                          {isConStock ? (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-[11px] font-semibold ${
                                  isOutOfStock
                                    ? 'text-rose-500 font-bold'
                                    : isLowStock
                                    ? 'text-amber-500 font-bold'
                                    : isDarkMode ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                  {isOutOfStock ? '🔴 AGOTADO' : isLowStock ? '🟡 STOCK BAJO' : '🟢 EN STOCK'}:
                                </span>

                                <div className="flex items-center gap-1">
                                  <span className={`font-serif-craft text-lg font-extrabold ${
                                    isOutOfStock
                                      ? 'text-rose-500'
                                      : isLowStock
                                      ? 'text-amber-500'
                                      : 'text-[#60b64d]'
                                  }`}>
                                    {currentStock}
                                  </span>
                                  <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    unidades
                                  </span>
                                </div>
                              </div>

                              {/* Stepper Buttons */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleQuickStockChange(p, -5)}
                                  disabled={currentStock <= 0}
                                  className="px-2 py-1 rounded-lg border border-slate-500/20 text-[10px] font-bold hover:bg-rose-500/20 hover:text-rose-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                  title="Restar 5 unidades"
                                >
                                  -5
                                </button>
                                <button
                                  onClick={() => handleQuickStockChange(p, -1)}
                                  disabled={currentStock <= 0}
                                  className="px-2 py-1 rounded-lg border border-slate-500/20 text-[10px] font-bold hover:bg-rose-500/20 hover:text-rose-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                  title="Restar 1 unidad"
                                >
                                  -1
                                </button>
                                
                                {/* Direct numeric input */}
                                <input
                                  type="number"
                                  min="0"
                                  value={currentStock}
                                  onChange={(e) => handleSetStockDirect(p, parseInt(e.target.value) || 0)}
                                  className={`w-14 text-center py-1 text-xs font-bold rounded-lg border focus:outline-none focus:border-[#60b64d] ${
                                    isDarkMode ? 'bg-[#0a120e] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                                  }`}
                                  title="Editar stock directamente"
                                />

                                <button
                                  onClick={() => handleQuickStockChange(p, 1)}
                                  className="px-2 py-1 rounded-lg border border-slate-500/20 text-[10px] font-bold hover:bg-[#60b64d]/20 hover:text-[#60b64d] transition-colors"
                                  title="Sumar 1 unidad"
                                >
                                  +1
                                </button>
                                <button
                                  onClick={() => handleQuickStockChange(p, 5)}
                                  className="px-2 py-1 rounded-lg border border-slate-500/20 text-[10px] font-bold hover:bg-[#60b64d]/20 hover:text-[#60b64d] transition-colors"
                                  title="Sumar 5 unidades"
                                >
                                  +5
                                </button>
                                <button
                                  onClick={() => handleQuickStockChange(p, 10)}
                                  className="px-2 py-1 rounded-lg border border-slate-500/20 text-[10px] font-bold hover:bg-[#60b64d]/20 hover:text-[#60b64d] transition-colors"
                                  title="Sumar 10 unidades"
                                >
                                  +10
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className={`text-[11px] leading-snug ${isDarkMode ? 'text-blue-200/80' : 'text-blue-900/80'}`}>
                                Sin límite de stock previo. El cliente puede ordenar libremente y el total se consolida en la <strong>Hoja de Horno</strong> para hornear/fabricar a pedido.
                              </p>
                            </div>
                          )}

                        </div>
                      </div>

                      {/* Bottom Card Actions */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-500/10">
                        <span className={`text-[10px] font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          ID: {p.id}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsProductModalOpen(true);
                            }}
                            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors ${
                              isDarkMode
                                ? 'border-slate-700 bg-slate-800/80 text-slate-200 hover:text-white hover:bg-slate-700'
                                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 shadow-2xs'
                            }`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>

                          <button
                            onClick={() => setDeleteConfirmProductId(p.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Eliminar producto del catálogo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: REDES SOCIALES & CONFIGURACIÓN PIE DE PÁGINA     */}
        {/* ======================================================== */}
        {activeMainTab === 'redes' && (
          <div className="space-y-6">
            
            {/* Header description */}
            <div className={`p-4 sm:p-5 rounded-2xl border ${
              isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <h2 className="font-serif-craft text-lg sm:text-xl font-bold">
                      Redes Sociales & Pie de Página
                    </h2>
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Administra el número telefónico de la empresa, enlaces de TikTok, Facebook, Instagram, dirección y horarios.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                    isSupabaseConnected()
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isSupabaseConnected() ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    {isSupabaseConnected() ? 'Sincronización en la Nube Activa' : 'Modo Local (Supabase no conectado)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveStoreSettings} className="space-y-6">
              
              {/* Section 1: Redes Sociales */}
              <div className={`p-4 sm:p-6 rounded-2xl border ${
                isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-500/15">
                  <Globe className="w-5 h-5 text-[#60b64d]" />
                  <h3 className="font-serif-craft text-base sm:text-lg font-bold">
                    1. Enlaces a Redes Sociales Oficiales
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* TikTok */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold flex items-center justify-between ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center text-[11px] font-black">TT</span>
                        TikTok URL
                      </span>
                      {editingSettings.tiktokUrl && (
                        <a
                          href={editingSettings.tiktokUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
                        >
                          Probar <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.tiktok.com/@uberrisdelvalle"
                      value={editingSettings.tiktokUrl || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, tiktokUrl: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      Ej: https://www.tiktok.com/@tu_cuenta
                    </p>
                  </div>

                  {/* Facebook */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold flex items-center justify-between ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[11px] font-black">FB</span>
                        Facebook URL
                      </span>
                      {editingSettings.facebookUrl && (
                        <a
                          href={editingSettings.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
                        >
                          Probar <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.facebook.com/uberrisdelvalle"
                      value={editingSettings.facebookUrl || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, facebookUrl: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      Ej: https://www.facebook.com/tu_pagina
                    </p>
                  </div>

                  {/* Instagram */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold flex items-center justify-between ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center text-[11px] font-black">IG</span>
                        Instagram URL
                      </span>
                      {editingSettings.instagramUrl && (
                        <a
                          href={editingSettings.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
                        >
                          Probar <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.instagram.com/uberrisdelvalle"
                      value={editingSettings.instagramUrl || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, instagramUrl: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      Ej: https://www.instagram.com/tu_perfil
                    </p>
                  </div>

                </div>
              </div>

              {/* Section 2: Datos de Contacto y Panadería */}
              <div className={`p-4 sm:p-6 rounded-2xl border ${
                isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-500/15">
                  <Phone className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-serif-craft text-base sm:text-lg font-bold">
                    2. Teléfono & Contacto de la Empresa
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      Teléfono de la Empresa (Llamadas / Atención)
                    </label>
                    <input
                      type="text"
                      placeholder="+51 983 746 281"
                      value={editingSettings.phone || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, phone: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      Se muestra en el pie de página con acceso directo para llamada.
                    </p>
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold flex items-center justify-between ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        WhatsApp de Pedidos (Sólo dígitos)
                      </span>
                      {editingSettings.whatsappPhone && (
                        <a
                          href={`https://wa.me/${editingSettings.whatsappPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
                        >
                          Abrir WhatsApp <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="51983746281"
                      value={editingSettings.whatsappPhone || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, whatsappPhone: e.target.value.replace(/[^0-9]/g, '') })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      Código de país + número (ej. 51983746281 para Perú).
                    </p>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <Mail className="w-3.5 h-3.5 text-emerald-400" />
                      Correo Electrónico Oficial
                    </label>
                    <input
                      type="email"
                      placeholder="pedidos@uberrisdelvalle.com"
                      value={editingSettings.email || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, email: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      Dirección Física de la Panadería
                    </label>
                    <input
                      type="text"
                      placeholder="Av. Arenas 450, Abancay - Apurímac, Perú"
                      value={editingSettings.addressText || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, addressText: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Business Hours */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      Horario de Atención y Despacho de Hornadas
                    </label>
                    <input
                      type="text"
                      placeholder="Lunes a Sábado: 6:00 AM - 8:00 PM | Domingos: 6:00 AM - 1:30 PM"
                      value={editingSettings.businessHours || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, businessHours: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                </div>
              </div>

              {/* Section 3: Branding & Textos */}
              <div className={`p-4 sm:p-6 rounded-2xl border ${
                isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-500/15">
                  <Store className="w-5 h-5 text-amber-400" />
                  <h3 className="font-serif-craft text-base sm:text-lg font-bold">
                    3. Nombre del Negocio & Anuncios
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Business Name */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Nombre de la Empresa
                    </label>
                    <input
                      type="text"
                      value={editingSettings.businessName || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, businessName: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Tagline */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Slogan / Subtítulo
                    </label>
                    <input
                      type="text"
                      value={editingSettings.tagline || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, tagline: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Announcement Banner */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className={`text-xs font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Cinta de Anuncio Superior en la Tienda
                    </label>
                    <input
                      type="text"
                      placeholder="🌱 Envíos a Abancay, Andahuaylas, Cusco, Lima y todo Apurímac directo de la hornada."
                      value={editingSettings.announcementBanner || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, announcementBanner: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                </div>
              </div>

              {/* Submit / Save Button Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#60b64d]/10 border border-[#60b64d]/30">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#60b64d]" />
                  <div>
                    <span className="text-xs font-bold block">¿Listo para aplicar los cambios?</span>
                    <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Se actualizará el pie de página de inmediato y se sincronizará con la base de datos Supabase.
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#60b64d] hover:bg-[#50a040] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSettings ? 'Guardando...' : 'Guardar y Sincronizar Cambios'}</span>
                </button>
              </div>

            </form>

          </div>
        )}

      </main>

      {/* Modal Confirmar Eliminación de Producto */}
      {deleteConfirmProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`w-full max-w-sm p-6 rounded-2xl border text-center ${
            isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif-craft text-lg font-bold mb-1">¿Eliminar Producto?</h3>
            <p className={`text-xs mb-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Esta acción eliminará el producto del catálogo y de la vista de clientes.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeleteConfirmProductId(null)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold ${
                  isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleConfirmDeleteProduct(deleteConfirmProductId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Producto */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`w-full max-w-lg p-6 rounded-2xl border max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-craft text-xl sm:text-2xl font-bold">
                {editingProduct.id && products.some(p => p.id === editingProduct.id) ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="space-y-4 text-xs">
              
              {/* Product Name */}
              <div>
                <label className={`font-bold block mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Pan Chapla Tradicional de Ayacucho"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#60b64d] ${
                    isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Inventory Type Selector Box */}
              <div className={`p-3.5 rounded-xl border ${
                isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-300'
              }`}>
                <label className={`font-bold block mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  Tipo de Control de Inventario
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  
                  {/* Option 1: A Producir / Bajo Demanda */}
                  <div
                    onClick={() => setEditingProduct({ ...editingProduct, stockType: 'a_producir', stock: 0 })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      editingProduct.stockType === 'a_producir' || !editingProduct.stockType
                        ? isDarkMode
                          ? 'border-blue-500 bg-blue-950/30 text-white'
                          : 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-500/20'
                        : isDarkMode
                        ? 'border-slate-800 hover:border-slate-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1 text-blue-500">
                      <Flame className="w-4 h-4" />
                      <span>Bajo Demanda / Horno</span>
                    </div>
                    <p className={`text-[10.5px] leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Para panadería recién horneada. Los clientes compran sin tope y el total se produce por pedidos.
                    </p>
                  </div>

                  {/* Option 2: Con Stock Físico */}
                  <div
                    onClick={() => setEditingProduct({
                      ...editingProduct,
                      stockType: 'con_stock',
                      stock: editingProduct.stock && editingProduct.stock > 0 ? editingProduct.stock : 20
                    })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      editingProduct.stockType === 'con_stock'
                        ? isDarkMode
                          ? 'border-emerald-500 bg-emerald-950/30 text-white'
                          : 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                        : isDarkMode
                        ? 'border-slate-800 hover:border-slate-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1 text-emerald-500">
                      <Package className="w-4 h-4" />
                      <span>Con Stock Físico</span>
                    </div>
                    <p className={`text-[10.5px] leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Para quesos, miel, mantequilla, etc. Se descuenta en cada compra y muestra "Agotado" al llegar a 0.
                    </p>
                  </div>

                </div>

                {/* If Con Stock is selected: Show Stock Input */}
                {editingProduct.stockType === 'con_stock' && (
                  <div className="mt-3 pt-3 border-t border-slate-500/15 flex items-center justify-between gap-3">
                    <div>
                      <label className={`font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Cantidad en Stock Inicial (Unidades)
                      </label>
                      <p className={`text-[10.5px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Unidades físicas reales disponibles para la venta.
                      </p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      required
                      value={editingProduct.stock || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                      className={`w-24 p-2 text-center text-sm font-bold rounded-xl border focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#0a120e] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Price and Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold block mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Precio de Venta (S/) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#60b64d] ${
                      isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`font-bold block mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Categoría *
                  </label>
                  <select
                    value={editingProduct.category || 'Panadería'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#60b64d] ${
                      isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Panadería">🍞 Panadería</option>
                    <option value="Lácteos">🧀 Lácteos</option>
                    <option value="Embutidos">🥓 Embutidos</option>
                    <option value="Miel y Dulces">🍯 Miel y Dulces</option>
                    <option value="Papa Nativa">🥔 Papa Nativa</option>
                  </select>
                </div>
              </div>

              {/* Unit label and Units per Package (Factor) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold block mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Etiqueta de Unidad
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Paquete x 5 und"
                    value={editingProduct.unit || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#60b64d] ${
                      isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`font-bold block mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Factor (Unidades x Paquete)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingProduct.unitsPerPackage || 1}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unitsPerPackage: parseInt(e.target.value) || 1 })}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#60b64d] ${
                      isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Badge & Visibility */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold block mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Insignia / Badge
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Artesanal, Más Vendido"
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#60b64d] ${
                      isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`font-bold block mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Visibilidad en Tienda
                  </label>
                  <select
                    value={editingProduct.available !== false ? 'true' : 'false'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, available: e.target.value === 'true' })}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#60b64d] ${
                      isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="true">✓ Visible / Activo para clientes</option>
                    <option value="false">⏸ Pausado / Oculto en tienda</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={`font-bold block mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Descripción
                </label>
                <textarea
                  rows={2}
                  placeholder="Elaborado artesanalmente con ingredientes de la cordillera..."
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-[#60b64d] ${
                    isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Image URL & Postimages Helper */}
              <div className={`p-3 rounded-xl border ${
                isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-300'
              }`}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className={`font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    URL de Imagen del Producto
                  </label>
                  <a
                    href="https://postimages.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-md transition-colors"
                  >
                    <span>📸 Subir a Postimages</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <input
                  type="text"
                  placeholder="https://i.postimg.cc/xxxx/mi-producto.jpg"
                  value={editingProduct.image || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                    isDarkMode ? 'bg-[#0a120e] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />

                <p className={`text-[10.5px] mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  💡 <strong>Tip Postimages:</strong> Al subir tu foto a postimages.org, copia el <span className="text-emerald-500 font-semibold">"Enlace directo"</span> (ej: <code>https://i.postimg.cc/.../foto.jpg</code>).
                </p>

                {/* Live Preview of Product Image */}
                {editingProduct.image && (
                  <div className="mt-2.5 flex items-center gap-3 p-2 rounded-lg bg-black/20 border border-slate-500/10">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center">
                      <img
                        src={editingProduct.image}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="text-[11px] overflow-hidden">
                      <span className="font-bold text-emerald-400 block">✓ Vista previa de imagen</span>
                      <span className="text-slate-400 truncate block max-w-xs">{editingProduct.image}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-500/10">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className={`flex-1 py-3 rounded-xl border font-bold ${
                    isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#60b64d] hover:bg-[#50a040] text-white font-bold shadow-xs active:scale-95 transition-all"
                >
                  Guardar Producto
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

