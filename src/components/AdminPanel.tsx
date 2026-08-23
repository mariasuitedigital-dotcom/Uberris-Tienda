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
  CheckCircle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Upload,
  Info
} from 'lucide-react';
import {
  isSupabaseConnected,
  dbUpsertStoreSettings,
  SUPABASE_SQL_FOOTER_MIGRATION,
  SUPABASE_SQL_AGENCIES_MIGRATION,
  SUPABASE_SQL_CATEGORIES_MIGRATION,
  uploadImageToSupabaseStorage,
  dataURLToBlob,
  cleanDirectImageUrl
} from '../lib/supabase';
import {
  Product,
  Order,
  OrderStatus,
  RawSupply,
  InventoryMovement,
  ProductionConsolidatedItem,
  ProductionBreakdownClient,
  StoreSettings,
  ShippingAgency,
  ShippingDestination,
  CategoryInfo
} from '../types';
import {
  getStoredAgencies,
  getStoredPalominoBranches,
  getStoredRiveraBranches,
  getStoredNacionalBranches,
  getStoredMolinaBranches,
  PalominoBranch,
  RiveraCargoBranch,
  NacionalBranch,
  MolinaBranch
} from '../data/shippingDestinations';

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

export { cleanDirectImageUrl };

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
  // Main Tab Navigation: 1. Producción & Horno, 2. Pedidos, 3. Inventario, 4. Redes & Footer, 5. Agencias
  const [activeMainTab, setActiveMainTab] = useState<'produccion' | 'pedidos' | 'inventario' | 'redes' | 'agencias'>('produccion');
  const [copiedAgenciesSql, setCopiedAgenciesSql] = useState(false);

  // Local settings state for the form
  const [editingSettings, setEditingSettings] = useState<StoreSettings>(() => {
    return (
      settings || {
        id: 'main_store',
        businessName: 'Uberris del Valle',
        tagline: 'Panadería & Delicias de Apurímac',
        footerBio: 'Llevamos el sabor inconfundible del Pan Chapla tradicional, panes andinos y productos del valle apurimeño directo a tu mesa familiar.',
        footerShippingInfo: 'Despachamos por agencias de transporte confiables (Palomino, Shalom, Mariscal Cáceres, Molina) con empaque sellado para conservar la frescura.',
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
        yapeNumber: '983746281',
        yapeName: 'Uberris del Valle',
        plinQrImage: '',
        plinNumber: '983746281',
        plinName: 'Uberris del Valle',
        bankAccountBank: 'BCP',
        bankAccountNumber: '191-12345678-0-12',
        bankAccountCci: '00219100123456780123',
        bankAccountName: 'Uberris del Valle EIRL',
        announcementBanner: '🌱 Hornadas frescas diarias con trigo andino de Apurímac. Envíos directos a Abancay, Andahuaylas, Cusco y Lima.',
        showTiktok: true,
        showFacebook: true,
        showInstagram: true,
        showWhatsapp: true,
        showPhone: true,
        showEmail: true,
        showAddress: true,
        showHours: true,
        showShippingInfo: true,
        showPaymentBadges: true,
      }
    );
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [copiedMigrationSql, setCopiedMigrationSql] = useState(false);
  const [copiedCategoriesSql, setCopiedCategoriesSql] = useState(false);

  const handleCopyMigrationSql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_FOOTER_MIGRATION);
    setCopiedMigrationSql(true);
    onShowToast('Script de Migración Copiado', 'Pégalo en el SQL Editor de Supabase y dale a "RUN".', 'success');
    setTimeout(() => setCopiedMigrationSql(false), 3000);
  };

  const handleCopyCategoriesSql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_CATEGORIES_MIGRATION);
    setCopiedCategoriesSql(true);
    onShowToast('Query de Categorías Copiado', 'Pégalo en el SQL Editor de Supabase y dale a "RUN" para crear o actualizar la tabla de categorías.', 'success');
    setTimeout(() => setCopiedCategoriesSql(false), 3000);
  };

  const handleCopyAgenciesSql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_AGENCIES_MIGRATION);
    setCopiedAgenciesSql(true);
    onShowToast('Query de Tablas de Agencias Copiado', 'Pégalo en el SQL Editor de Supabase y dale a "RUN" para crear shipping_agencies y shipping_destinations.', 'success');
    setTimeout(() => setCopiedAgenciesSql(false), 3000);
  };

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

  // --- AGENCIES & DESTINATIONS MANAGEMENT STATE ---
  const [agenciesList, setAgenciesList] = useState<ShippingAgency[]>(getStoredAgencies);
  const [palominoBranches, setPalominoBranches] = useState<PalominoBranch[]>(getStoredPalominoBranches);
  const [riveraBranches, setRiveraBranches] = useState<RiveraCargoBranch[]>(getStoredRiveraBranches);
  const [nacionalBranches, setNacionalBranches] = useState<NacionalBranch[]>(getStoredNacionalBranches);
  const [molinaBranches, setMolinaBranches] = useState<MolinaBranch[]>(getStoredMolinaBranches);

  // Agency Edit Modal State
  const [agencyModalData, setAgencyModalData] = useState<Partial<ShippingAgency> | null>(null);
  const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false);

  // Branch Edit Modal State
  const [branchModalData, setBranchModalData] = useState<{
    agencyType: string;
    branch: any;
    isNew: boolean;
  } | null>(null);

  // Handler to toggle agency active status
  const handleToggleAgencyActive = (agencyId: string) => {
    const updated = agenciesList.map(a => a.id === agencyId ? { ...a, active: !a.active } : a);
    setAgenciesList(updated);
    localStorage.setItem('uberris_agencies', JSON.stringify(updated));
    onShowToast('Estado de Agencia Actualizado', 'Los cambios se han guardado correctamente.', 'success');
  };

  // Handler to save Agency changes (edit or add)
  const handleSaveAgencyModal = (agency: Partial<ShippingAgency>) => {
    if (!agency.name?.trim()) {
      onShowToast('Error', 'El nombre de la agencia es obligatorio.', 'error');
      return;
    }

    let updated: ShippingAgency[];
    if (agency.id && agenciesList.some(a => a.id === agency.id)) {
      updated = agenciesList.map(a => a.id === agency.id ? (agency as ShippingAgency) : a);
    } else {
      const newAgency: ShippingAgency = {
        id: agency.id || `ag_${Date.now()}`,
        name: agency.name || 'Nueva Agencia',
        type: (agency.type as any) || 'otra',
        description: agency.description || '',
        dispatchDaysSummary: agency.dispatchDaysSummary || 'Martes y Viernes',
        active: agency.active ?? true,
        sortOrder: agenciesList.length + 1,
      };
      updated = [...agenciesList, newAgency];
    }

    setAgenciesList(updated);
    localStorage.setItem('uberris_agencies', JSON.stringify(updated));
    setIsAgencyModalOpen(false);
    setAgencyModalData(null);
    onShowToast('Agencia Guardada', 'La agencia de transporte ha sido actualizada.', 'success');
  };

  // Handler to delete an agency
  const handleDeleteAgency = (agencyId: string) => {
    const updated = agenciesList.filter(a => a.id !== agencyId);
    setAgenciesList(updated);
    localStorage.setItem('uberris_agencies', JSON.stringify(updated));
    onShowToast('Agencia Eliminada', 'La agencia fue removida del sistema.', 'info');
  };

  // Handler to save Branch (Add or Edit)
  const handleSaveBranchModal = () => {
    if (!branchModalData) return;
    const { agencyType, branch, isNew } = branchModalData;

    if (!branch.name?.trim()) {
      onShowToast('Error', 'El nombre de la sede/destino es obligatorio.', 'error');
      return;
    }

    const branchId = branch.id || `br_${Date.now()}`;
    const cleanBranch = { ...branch, id: branchId };

    if (agencyType === 'palomino') {
      let updated = isNew ? [...palominoBranches, cleanBranch] : palominoBranches.map(b => b.id === branchId ? cleanBranch : b);
      setPalominoBranches(updated);
      localStorage.setItem('uberris_palomino_branches', JSON.stringify(updated));
    } else if (agencyType === 'rivera_cargo') {
      let updated = isNew ? [...riveraBranches, cleanBranch] : riveraBranches.map(b => b.id === branchId ? cleanBranch : b);
      setRiveraBranches(updated);
      localStorage.setItem('uberris_rivera_branches', JSON.stringify(updated));
    } else if (agencyType === 'agencia_nacional') {
      let updated = isNew ? [...nacionalBranches, cleanBranch] : nacionalBranches.map(b => b.id === branchId ? cleanBranch : b);
      setNacionalBranches(updated);
      localStorage.setItem('uberris_nacional_branches', JSON.stringify(updated));
    } else if (agencyType === 'agencia_molina') {
      let updated = isNew ? [...molinaBranches, cleanBranch] : molinaBranches.map(b => b.id === branchId ? cleanBranch : b);
      setMolinaBranches(updated);
      localStorage.setItem('uberris_molina_branches', JSON.stringify(updated));
    }

    setBranchModalData(null);
    onShowToast('Sede Guardada', 'Los datos de la sede han sido actualizados con éxito.', 'success');
  };

  // Handler to delete a branch
  const handleDeleteBranch = (agencyType: string, branchId: string) => {
    if (agencyType === 'palomino') {
      const updated = palominoBranches.filter(b => b.id !== branchId);
      setPalominoBranches(updated);
      localStorage.setItem('uberris_palomino_branches', JSON.stringify(updated));
    } else if (agencyType === 'rivera_cargo') {
      const updated = riveraBranches.filter(b => b.id !== branchId);
      setRiveraBranches(updated);
      localStorage.setItem('uberris_rivera_branches', JSON.stringify(updated));
    } else if (agencyType === 'agencia_nacional') {
      const updated = nacionalBranches.filter(b => b.id !== branchId);
      setNacionalBranches(updated);
      localStorage.setItem('uberris_nacional_branches', JSON.stringify(updated));
    } else if (agencyType === 'agencia_molina') {
      const updated = molinaBranches.filter(b => b.id !== branchId);
      setMolinaBranches(updated);
      localStorage.setItem('uberris_molina_branches', JSON.stringify(updated));
    }
    onShowToast('Sede Eliminada', 'La sede ha sido removida del listado.', 'info');
  };

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

  const compressImageFile = (file: File, maxDim: number, quality: number, callback: (compressedUrl: string) => void) => {
    if (!file.type.startsWith('image/')) {
      onShowToast('Formato no válido', 'Por favor selecciona un archivo de imagen (JPG, PNG, WEBP).', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          callback(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const processAndUploadImage = (
    file: File,
    maxDim: number,
    quality: number,
    prefix: string,
    onComplete: (url: string) => void
  ) => {
    compressImageFile(file, maxDim, quality, async (compressedDataUrl) => {
      if (isSupabaseConnected()) {
        onShowToast('Subiendo a Supabase Storage...', 'Subiendo imagen a tu bucket "productos-uberris"...', 'info');
        const blob = dataURLToBlob(compressedDataUrl);
        const res = await uploadImageToSupabaseStorage(blob, prefix, 'productos-uberris');
        if (res.success && res.url) {
          onComplete(res.url);
          onShowToast('☁️ ¡Subido a Supabase Storage!', 'Imagen alojada con éxito en el bucket "productos-uberris".', 'success');
          return;
        } else {
          console.warn('Fallback local por error en Supabase Storage:', res.error);
          onShowToast(
            'Imagen cargada localmente',
            `Se optimizó y guardó de forma local. Nota de Supabase Storage: ${res.error || 'Asegúrate de que el bucket sea público'}`,
            'info'
          );
        }
      }
      onComplete(compressedDataUrl);
      if (!isSupabaseConnected()) {
        onShowToast('Imagen Cargada', 'Se cargó y optimizó la imagen localmente.', 'success');
      }
    });
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAndUploadImage(file, 800, 0.90, 'logo', (finalUrl) => {
      setEditingSettings((prev) => ({ ...prev, logoUrl: finalUrl }));
    });
  };

  const handleHeroImage1FileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAndUploadImage(file, 1000, 0.88, 'hero1', (finalUrl) => {
      setEditingSettings((prev) => ({ ...prev, heroImage1: finalUrl }));
    });
  };

  const handleHeroImage2FileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAndUploadImage(file, 900, 0.88, 'hero2', (finalUrl) => {
      setEditingSettings((prev) => ({ ...prev, heroImage2: finalUrl }));
    });
  };

  const handleHeroImage3FileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAndUploadImage(file, 900, 0.88, 'hero3', (finalUrl) => {
      setEditingSettings((prev) => ({ ...prev, heroImage3: finalUrl }));
    });
  };

  const handleCategoryImageFileUpload = (catId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAndUploadImage(file, 900, 0.88, `cat_${catId}`, (finalUrl) => {
      setEditingSettings((prev) => ({
        ...prev,
        categoryImages: {
          ...(prev.categoryImages || {}),
          [catId]: finalUrl
        }
      }));
    });
  };

  const handleProductImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Formato no válido', 'Por favor selecciona un archivo de imagen (JPG, PNG, WEBP).', 'error');
      return;
    }

    const prodPrefix = editingProduct?.name ? editingProduct.name.substring(0, 15) : 'producto';
    processAndUploadImage(file, 1200, 0.88, prodPrefix, (finalUrl) => {
      setEditingProduct((prev) => (prev ? { ...prev, image: finalUrl } : null));
    });
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
        const result = await dbUpsertStoreSettings(editingSettings);
        if (result.success) {
          if (result.needsMigration) {
            onShowToast(
              '¡Guardado y Activo en la Tienda!',
              'Los cambios ya están aplicados. Ejecuta el script SQL en Supabase para sincronizar todas las columnas nuevas en la nube.',
              'success'
            );
          } else {
            onShowToast(
              '¡Configuración Guardada en Supabase!',
              'Los datos de redes sociales, textos y pie de página se sincronizaron en la nube.',
              'success'
            );
          }
        } else {
          onShowToast(
            '¡Guardado en la Tienda!',
            'Tus cambios ya están activos. Para sincronizarlos también en la nube, corre el script SQL en Supabase.',
            'info'
          );
        }
      } else {
        onShowToast(
          'Configuración Guardada',
          'Los cambios de redes sociales y pie de página ya están activos en la tienda.',
          'success'
        );
      }
    } catch (err: any) {
      console.error('Error saving store settings:', err);
      onShowToast('Guardado Local', 'Se guardaron los cambios en tu navegador.', 'info');
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
    if (!editingProduct) return;

    const trimmedName = (editingProduct.name || '').trim();
    if (!trimmedName) {
      onShowToast('Nombre Requerido', 'Por favor ingresa un nombre para el producto.', 'error');
      return;
    }

    const determinedStockType: 'con_stock' | 'a_producir' =
      editingProduct.stockType ||
      ((editingProduct.stock && Number(editingProduct.stock) > 0) ? 'con_stock' : 'a_producir');

    const finalStock =
      determinedStockType === 'con_stock'
        ? Math.max(0, Number(editingProduct.stock) || 0)
        : (Number(editingProduct.stock) || 0);

    // Auto-clean and resolve direct URL
    const cleanedImg = cleanDirectImageUrl(editingProduct.image || '');
    const productToSave: Product = {
      ...editingProduct,
      id: editingProduct.id || `PROD-${Date.now()}`,
      name: trimmedName,
      description: editingProduct.description || '',
      price: Math.max(0, Number(editingProduct.price) || 0),
      unit: editingProduct.unit || 'Paquete',
      unitsPerPackage: Math.max(1, Number(editingProduct.unitsPerPackage) || 1),
      category: editingProduct.category || 'Panadería',
      image: cleanedImg || editingProduct.image || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
      available: editingProduct.available !== false,
      stockType: determinedStockType,
      stock: finalStock,
      badge: (editingProduct.badge as any) || 'Artesanal',
      rawRecipe: editingProduct.rawRecipe || [],
    };

    onSaveProduct(productToSave);
    setIsProductModalOpen(false);
    onShowToast('¡Producto Guardado!', `"${productToSave.name}" se actualizó correctamente en el catálogo.`, 'success');
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
              <button
                onClick={openNewProductModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#60b64d] hover:bg-[#50a040] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                title="Crear un nuevo producto en el catálogo"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="inline">Nuevo Producto</span>
              </button>

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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all shadow-xs active:scale-95"
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

            {/* Tab 3: Crear & Editar Productos (Inventario) */}
            <button
              onClick={() => setActiveMainTab('inventario')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
                activeMainTab === 'inventario'
                  ? 'bg-[#60b64d] text-white border-[#60b64d] shadow-sm'
                  : isDarkMode
                  ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20 hover:text-white hover:bg-emerald-900/40'
                  : 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>3. CREAR Y EDITAR PRODUCTOS ({products.length})</span>
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

            {/* Tab 4: Modificar Textos, Banners & Garantías */}
            <button
              onClick={() => setActiveMainTab('redes')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
                activeMainTab === 'redes'
                  ? 'bg-[#60b64d] text-white border-[#60b64d] shadow-sm'
                  : isDarkMode
                  ? 'text-amber-300 border-amber-500/30 bg-amber-950/20 hover:text-white hover:bg-amber-900/40'
                  : 'text-amber-800 border-amber-200 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>4. MODIFICAR TEXTOS, BANNERS & GARANTÍAS</span>
            </button>

            {/* Tab 5: Agencias y Destinos de Envío */}
            <button
              onClick={() => setActiveMainTab('agencias')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
                activeMainTab === 'agencias'
                  ? 'bg-[#60b64d] text-white border-[#60b64d] shadow-sm'
                  : isDarkMode
                  ? 'text-sky-300 border-sky-500/30 bg-sky-950/20 hover:text-white hover:bg-sky-900/40'
                  : 'text-sky-800 border-sky-200 bg-sky-50 hover:bg-sky-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>5. AGENCIAS Y DESTINOS</span>
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
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800';
                              }}
                              className="w-16 h-16 rounded-xl object-cover border border-slate-500/20 bg-slate-800"
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
                      Configuración de Tienda, Garantías & Pie de Página
                    </h2>
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Administra las garantías de calidad, textos del banner principal, teléfono de contacto, enlaces sociales (TikTok, FB, IG), dirección y horarios.
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

              {/* Section 1: Textos del Pie de Página y Marca */}
              <div className={`p-4 sm:p-6 rounded-2xl border ${
                isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-500/15">
                  <Store className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="font-serif-craft text-base sm:text-lg font-bold">
                      1. Identidad de Marca & Textos del Pie de Página
                    </h3>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Personaliza los textos informativos que aparecen en la tienda y en el pie de página.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Logo de la Empresa (Cabecera & Footer) */}
                  <div className={`p-4 rounded-xl border md:col-span-2 space-y-3 ${
                    isDarkMode ? 'bg-[#08100c]/80 border-[#1c3326]' : 'bg-slate-50/90 border-slate-200'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-emerald-500" />
                        <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                          Logo Oficial de la Tienda (Cabecera & Pie de Página)
                        </label>
                      </div>
                      <span className="text-[11px] text-emerald-500 font-semibold">
                        Se muestra en la barra superior y en el pie de página
                      </span>
                    </div>

                    {/* Logo Preview and Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                      {/* Live visual preview box */}
                      <div className={`p-3 rounded-xl border flex items-center justify-center min-w-[140px] h-[58px] ${
                        isDarkMode ? 'bg-[#0f1d16] border-emerald-500/30' : 'bg-white border-slate-300 shadow-xs'
                      }`}>
                        {editingSettings.logoUrl ? (
                          <img
                            src={editingSettings.logoUrl}
                            alt="Logo Vista Previa"
                            className="max-h-10 max-w-[150px] object-contain rounded-lg"
                          />
                        ) : (
                          <div className="flex items-center justify-center px-3 py-1 border-[2px] border-[#39C139] rounded-lg bg-white shadow-2xs">
                            <span className="font-sans text-[18px] font-black tracking-tighter text-[#39C139] flex items-baseline leading-none">
                              Uberr
                              <span className="relative inline-flex flex-col items-center justify-end" style={{ width: '0.28em' }}>
                                <svg className="w-[9px] h-[9px] text-[#ff0000] absolute -top-[1px] fill-current" viewBox="0 0 24 24">
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                                <span className="text-[#39C139]">ı</span>
                              </span>
                              s
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 w-full space-y-2">
                        {/* URL input and helpers */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Pega la URL de la imagen del logo (https://...)"
                            value={editingSettings.logoUrl || ''}
                            onChange={(e) => setEditingSettings({ ...editingSettings, logoUrl: e.target.value })}
                            className={`flex-1 p-2 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                              isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />

                          {/* Upload from file button */}
                          <label className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-xs active:scale-95">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Subir Archivo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoFileUpload}
                              className="hidden"
                            />
                          </label>

                          {/* Postimages Link */}
                          <a
                            href="https://postimages.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 rounded-xl border text-xs flex items-center gap-1 font-bold shrink-0 transition-colors ${
                              isDarkMode
                                ? 'bg-[#0f1d16] border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/50'
                                : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                            }`}
                            title="Subir a Postimages.org"
                          >
                            <span>Postimages</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        {/* Status / Reset text */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                            {editingSettings.logoUrl
                              ? '✓ Usando logo de imagen personalizada'
                              : '✓ Usando logo oficial vectorial de Uberrıs'}
                          </span>
                          {editingSettings.logoUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSettings({ ...editingSettings, logoUrl: undefined });
                                onShowToast('Logo Restablecido', 'Se volvió al logo oficial de Uberrıs.', 'info');
                              }}
                              className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                            >
                              Restablecer al logo original Uberrıs
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Name */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Nombre de la Empresa / Marca
                    </label>
                    <input
                      type="text"
                      placeholder="Uberris del Valle"
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
                      placeholder="Panadería & Delicias de Apurímac"
                      value={editingSettings.tagline || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, tagline: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Footer Bio / Presentation Text ("Llevamos el sabor inconfundible...") */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className={`text-xs font-bold flex items-center justify-between ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span>Texto de Presentación / Bio del Pie de Página ("Llevamos...")</span>
                      <span className="text-[11px] font-normal text-emerald-500">Columna 1 del Pie de Página</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Llevamos el sabor inconfundible del Pan Chapla tradicional, panes andinos y productos del valle apurimeño directo a tu mesa familiar."
                      value={editingSettings.footerBio || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, footerBio: e.target.value })}
                      className={`w-full p-3 rounded-xl border text-xs leading-relaxed focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                    <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Este párrafo aparece justo debajo del logo en el pie de página de la tienda.
                    </p>
                  </div>

                  {/* Footer Shipping Info */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className={`text-xs font-bold flex items-center justify-between ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span>Texto Informativo de Envíos & Agencias de Transporte</span>
                      <span className="text-[11px] font-normal text-emerald-500">Columna Envíos del Pie de Página</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Despachamos por agencias de transporte confiables (Palomino, Shalom, Mariscal Cáceres, Molina) con empaque sellado para conservar la frescura."
                      value={editingSettings.footerShippingInfo || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, footerShippingInfo: e.target.value })}
                      className={`w-full p-3 rounded-xl border text-xs leading-relaxed focus:outline-none focus:border-[#60b64d] ${
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
                      placeholder="🌱 Hornadas frescas diarias con trigo andino de Apurímac. Envíos directos a Abancay, Andahuaylas, Cusco y Lima."
                      value={editingSettings.announcementBanner || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, announcementBanner: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Redes Sociales & Interruptores de Publicación */}
              <div className={`p-4 sm:p-6 rounded-2xl border ${
                isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-500/15">
                  <Globe className="w-5 h-5 text-[#60b64d]" />
                  <div>
                    <h3 className="font-serif-craft text-base sm:text-lg font-bold">
                      2. Redes Sociales & Control de Publicación (Checks / Visibilidad)
                    </h3>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Ingresa el enlace y activa o desactiva con el check las redes que deseas publicar en el pie de página.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* TikTok */}
                  <div className={`p-4 rounded-xl border space-y-2.5 ${
                    isDarkMode ? 'bg-[#08100c]/60 border-[#1c3326]' : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-bold text-xs">
                        <span className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center text-[10px] font-black">TT</span>
                        TikTok
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editingSettings.showTiktok !== false}
                          onChange={(e) => setEditingSettings({ ...editingSettings, showTiktok: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#60b64d]"
                        />
                        <span className={`text-[11px] font-semibold ${
                          editingSettings.showTiktok !== false ? 'text-emerald-500' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')
                        }`}>
                          {editingSettings.showTiktok !== false ? 'Publicar' : 'Oculto'}
                        </span>
                      </label>
                    </div>
                    <input
                      type="url"
                      placeholder="https://www.tiktok.com/@uberrisdelvalle"
                      value={editingSettings.tiktokUrl || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, tiktokUrl: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                    {editingSettings.tiktokUrl && (
                      <a
                        href={editingSettings.tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-500 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> Probar enlace TikTok
                      </a>
                    )}
                  </div>

                  {/* Facebook */}
                  <div className={`p-4 rounded-xl border space-y-2.5 ${
                    isDarkMode ? 'bg-[#08100c]/60 border-[#1c3326]' : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-bold text-xs">
                        <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">FB</span>
                        Facebook
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editingSettings.showFacebook !== false}
                          onChange={(e) => setEditingSettings({ ...editingSettings, showFacebook: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#60b64d]"
                        />
                        <span className={`text-[11px] font-semibold ${
                          editingSettings.showFacebook !== false ? 'text-emerald-500' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')
                        }`}>
                          {editingSettings.showFacebook !== false ? 'Publicar' : 'Oculto'}
                        </span>
                      </label>
                    </div>
                    <input
                      type="url"
                      placeholder="https://www.facebook.com/uberrisdelvalle"
                      value={editingSettings.facebookUrl || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, facebookUrl: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                    {editingSettings.facebookUrl && (
                      <a
                        href={editingSettings.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-500 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> Probar enlace Facebook
                      </a>
                    )}
                  </div>

                  {/* Instagram */}
                  <div className={`p-4 rounded-xl border space-y-2.5 ${
                    isDarkMode ? 'bg-[#08100c]/60 border-[#1c3326]' : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-bold text-xs">
                        <span className="w-6 h-6 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-black">IG</span>
                        Instagram
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editingSettings.showInstagram !== false}
                          onChange={(e) => setEditingSettings({ ...editingSettings, showInstagram: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#60b64d]"
                        />
                        <span className={`text-[11px] font-semibold ${
                          editingSettings.showInstagram !== false ? 'text-emerald-500' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')
                        }`}>
                          {editingSettings.showInstagram !== false ? 'Publicar' : 'Oculto'}
                        </span>
                      </label>
                    </div>
                    <input
                      type="url"
                      placeholder="https://www.instagram.com/uberrisdelvalle"
                      value={editingSettings.instagramUrl || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, instagramUrl: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                    {editingSettings.instagramUrl && (
                      <a
                        href={editingSettings.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-500 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> Probar enlace Instagram
                      </a>
                    )}
                  </div>

                  {/* WhatsApp */}
                  <div className={`p-4 rounded-xl border space-y-2.5 ${
                    isDarkMode ? 'bg-[#08100c]/60 border-[#1c3326]' : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-bold text-xs">
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        WhatsApp de Pedidos
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editingSettings.showWhatsapp !== false}
                          onChange={(e) => setEditingSettings({ ...editingSettings, showWhatsapp: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#60b64d]"
                        />
                        <span className={`text-[11px] font-semibold ${
                          editingSettings.showWhatsapp !== false ? 'text-emerald-500' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')
                        }`}>
                          {editingSettings.showWhatsapp !== false ? 'Publicar' : 'Oculto'}
                        </span>
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="51983746281"
                      value={editingSettings.whatsappPhone || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, whatsappPhone: e.target.value.replace(/[^0-9]/g, '') })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                    {editingSettings.whatsappPhone && (
                      <a
                        href={`https://wa.me/${editingSettings.whatsappPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-500 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> Probar WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Datos de Contacto & Visibilidad */}
              <div className={`p-4 sm:p-6 rounded-2xl border ${
                isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-500/15">
                  <Phone className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h3 className="font-serif-craft text-base sm:text-lg font-bold">
                      3. Datos de Contacto, Ubicación & Visibilidad
                    </h3>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Configura cada dato de contacto y usa el check para decidir si se publica o se mantiene privado/oculto.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className={`p-4 rounded-xl border space-y-2.5 ${
                    isDarkMode ? 'bg-[#08100c]/60 border-[#1c3326]' : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-xs">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        Teléfono para Llamadas
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editingSettings.showPhone !== false}
                          onChange={(e) => setEditingSettings({ ...editingSettings, showPhone: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#60b64d]"
                        />
                        <span className={`text-[11px] font-semibold ${
                          editingSettings.showPhone !== false ? 'text-emerald-500' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')
                        }`}>
                          {editingSettings.showPhone !== false ? 'Publicar' : 'Oculto'}
                        </span>
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="+51 983 746 281"
                      value={editingSettings.phone || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, phone: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Email */}
                  <div className={`p-4 rounded-xl border space-y-2.5 ${
                    isDarkMode ? 'bg-[#08100c]/60 border-[#1c3326]' : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-xs">
                        <Mail className="w-3.5 h-3.5 text-emerald-400" />
                        Correo Electrónico
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editingSettings.showEmail !== false}
                          onChange={(e) => setEditingSettings({ ...editingSettings, showEmail: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#60b64d]"
                        />
                        <span className={`text-[11px] font-semibold ${
                          editingSettings.showEmail !== false ? 'text-emerald-500' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')
                        }`}>
                          {editingSettings.showEmail !== false ? 'Publicar' : 'Oculto'}
                        </span>
                      </label>
                    </div>
                    <input
                      type="email"
                      placeholder="pedidos@uberrisdelvalle.com"
                      value={editingSettings.email || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, email: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Address */}
                  <div className={`p-4 rounded-xl border space-y-2.5 ${
                    isDarkMode ? 'bg-[#08100c]/60 border-[#1c3326]' : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-xs">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        Dirección de la Panadería
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editingSettings.showAddress !== false}
                          onChange={(e) => setEditingSettings({ ...editingSettings, showAddress: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#60b64d]"
                        />
                        <span className={`text-[11px] font-semibold ${
                          editingSettings.showAddress !== false ? 'text-emerald-500' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')
                        }`}>
                          {editingSettings.showAddress !== false ? 'Publicar' : 'Oculto'}
                        </span>
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="Av. Arenas 450, Abancay - Apurímac, Perú"
                      value={editingSettings.addressText || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, addressText: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Business Hours */}
                  <div className={`p-4 rounded-xl border space-y-2.5 ${
                    isDarkMode ? 'bg-[#08100c]/60 border-[#1c3326]' : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-xs">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        Horario de Hornadas & Atención
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editingSettings.showHours !== false}
                          onChange={(e) => setEditingSettings({ ...editingSettings, showHours: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#60b64d]"
                        />
                        <span className={`text-[11px] font-semibold ${
                          editingSettings.showHours !== false ? 'text-emerald-500' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')
                        }`}>
                          {editingSettings.showHours !== false ? 'Publicar' : 'Oculto'}
                        </span>
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="Lunes a Sábado: 6:00 AM - 8:00 PM | Domingos: 6:00 AM - 1:30 PM"
                      value={editingSettings.businessHours || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, businessHours: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Other footer toggles */}
                  <div className="space-y-3 md:col-span-2 pt-2">
                    <h4 className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Elementos Adicionales en el Pie de Página
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none ${
                        isDarkMode ? 'bg-[#08100c]/40 border-[#1c3326]' : 'bg-slate-50/60 border-slate-200'
                      }`}>
                        <input
                          type="checkbox"
                          checked={editingSettings.showShippingInfo !== false}
                          onChange={(e) => setEditingSettings({ ...editingSettings, showShippingInfo: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#60b64d]"
                        />
                        <div>
                          <span className="text-xs font-bold block">Mostrar Texto Informativo de Envíos</span>
                          <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Párrafo de agencias (Palomino, Shalom, Molina)
                          </span>
                        </div>
                      </label>

                      <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none ${
                        isDarkMode ? 'bg-[#08100c]/40 border-[#1c3326]' : 'bg-slate-50/60 border-slate-200'
                      }`}>
                        <input
                          type="checkbox"
                          checked={editingSettings.showPaymentBadges !== false}
                          onChange={(e) => setEditingSettings({ ...editingSettings, showPaymentBadges: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#60b64d]"
                        />
                        <div>
                          <span className="text-xs font-bold block">Mostrar Badges de Métodos de Pago</span>
                          <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Insignias de Yape, Plin, Efectivo y Transferencia
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Cuentas y Métodos de Pago */}
              <div className={`p-4 sm:p-6 rounded-2xl border ${
                isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-500/15">
                  <CheckCircle className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="font-serif-craft text-base sm:text-lg font-bold">
                      4. Cuentas y Métodos de Pago (Para Clientes)
                    </h3>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Estos datos se muestran a tus clientes en el checkout o cuando seleccionan pagar por Yape, Plin o Transferencia.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Yape */}
                  <div className={`p-4 rounded-xl border space-y-3 ${
                    isDarkMode ? 'bg-[#08100c]/60 border-[#1c3326]' : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      <span>📱</span> Yape
                    </h4>
                    <div className="space-y-1">
                      <label className={`text-[11px] font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Número de Yape</label>
                      <input
                        type="text"
                        placeholder="983 746 281"
                        value={editingSettings.yapeNumber || ''}
                        onChange={(e) => setEditingSettings({ ...editingSettings, yapeNumber: e.target.value })}
                        className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                          isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={`text-[11px] font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Titular Yape</label>
                      <input
                        type="text"
                        placeholder="Uberris del Valle"
                        value={editingSettings.yapeName || ''}
                        onChange={(e) => setEditingSettings({ ...editingSettings, yapeName: e.target.value })}
                        className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                          isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Plin */}
                  <div className={`p-4 rounded-xl border space-y-3 ${
                    isDarkMode ? 'bg-[#08100c]/60 border-[#1c3326]' : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>
                      <span>📲</span> Plin
                    </h4>
                    <div className="space-y-1">
                      <label className={`text-[11px] font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Número de Plin</label>
                      <input
                        type="text"
                        placeholder="983 746 281"
                        value={editingSettings.plinNumber || ''}
                        onChange={(e) => setEditingSettings({ ...editingSettings, plinNumber: e.target.value })}
                        className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                          isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={`text-[11px] font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Titular Plin</label>
                      <input
                        type="text"
                        placeholder="Uberris del Valle"
                        value={editingSettings.plinName || ''}
                        onChange={(e) => setEditingSettings({ ...editingSettings, plinName: e.target.value })}
                        className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                          isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Bank Account */}
                  <div className={`p-4 rounded-xl border space-y-3 md:col-span-2 ${
                    isDarkMode ? 'bg-[#08100c]/60 border-[#1c3326]' : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      <span>🏦</span> Cuenta Bancaria (Transferencias / Depósitos)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className={`text-[11px] font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Banco (Ej. BCP, BBVA, Interbank, Banco de la Nación)</label>
                        <input
                          type="text"
                          placeholder="BCP"
                          value={editingSettings.bankAccountBank || ''}
                          onChange={(e) => setEditingSettings({ ...editingSettings, bankAccountBank: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                            isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={`text-[11px] font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Titular de la Cuenta</label>
                        <input
                          type="text"
                          placeholder="Uberris del Valle EIRL"
                          value={editingSettings.bankAccountName || ''}
                          onChange={(e) => setEditingSettings({ ...editingSettings, bankAccountName: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                            isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={`text-[11px] font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Número de Cuenta</label>
                        <input
                          type="text"
                          placeholder="191-12345678-0-12"
                          value={editingSettings.bankAccountNumber || ''}
                          onChange={(e) => setEditingSettings({ ...editingSettings, bankAccountNumber: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                            isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={`text-[11px] font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Código de Cuenta Interbancario (CCI)</label>
                        <input
                          type="text"
                          placeholder="00219100123456780123"
                          value={editingSettings.bankAccountCci || ''}
                          onChange={(e) => setEditingSettings({ ...editingSettings, bankAccountCci: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                            isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Garantías de Calidad, Sello de Origen & Banner Principal */}
              <div className={`p-4 sm:p-6 rounded-2xl border ${
                isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-500/15">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="font-serif-craft text-base sm:text-lg font-bold">
                      5. Garantías de Calidad, Sello de Origen & Banner Principal
                    </h3>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Modifica los sellos distintivos que aparecen en la vista rápida de productos y los textos del banner principal de portada.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Guarantee Badge 1 */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      🔥 Garantía / Sello 1 (Vista Rápida de Productos)
                    </label>
                    <input
                      type="text"
                      placeholder="Horno tradicional a leña de piedra andina"
                      value={editingSettings.guaranteeBadge1 || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, guaranteeBadge1: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Guarantee Badge 2 */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      🛡️ Garantía / Sello 2 (Vista Rápida de Productos)
                    </label>
                    <input
                      type="text"
                      placeholder="Insumos 100% ecológicos de pequeños productores"
                      value={editingSettings.guaranteeBadge2 || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, guaranteeBadge2: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Origin Location Text */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className={`text-xs font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      📍 Ubicación de Origen (Etiqueta sobre la foto del producto)
                    </label>
                    <input
                      type="text"
                      placeholder="Valle de Apurímac (Abancay - Andahuaylas)"
                      value={editingSettings.originLocationText || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, originLocationText: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Hero Tag */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      🏷️ Etiqueta del Banner Principal
                    </label>
                    <input
                      type="text"
                      placeholder="Apurímac en tu Mesa"
                      value={editingSettings.heroTag || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, heroTag: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Hero Title */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      ✨ Título Principal del Banner
                    </label>
                    <input
                      type="text"
                      placeholder="Sabores de Origen"
                      value={editingSettings.heroTitle || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, heroTitle: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Hero Subtitle */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className={`text-xs font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      📝 Subtítulo del Banner Principal
                    </label>
                    <input
                      type="text"
                      placeholder="productos naturales y bebidas con el sabor auténtico de los andes."
                      value={editingSettings.heroSubtitle || ''}
                      onChange={(e) => setEditingSettings({ ...editingSettings, heroSubtitle: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                        isDarkMode ? 'bg-[#08100c] border-[#1c3326] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Hero Images Management Section (The 3 Circular Images) */}
                  <div className="md:col-span-2 pt-4 border-t border-dashed border-emerald-500/20 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h4 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                          📸 Imágenes Circulares Flotantes del Banner (Hero)
                        </h4>
                        <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          Sube desde tu dispositivo o pega enlaces de las 3 imágenes circulares del banner principal.
                        </p>
                      </div>

                      {isSupabaseConnected() && (
                        <button
                          type="button"
                          onClick={handleCopyMigrationSql}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-all border cursor-pointer active:scale-95 ${
                            copiedMigrationSql
                              ? 'bg-emerald-500 text-white border-emerald-500'
                              : isDarkMode
                              ? 'bg-[#15231c] hover:bg-[#1c3326] text-emerald-300 border-emerald-500/40'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs'
                          }`}
                        >
                          {copiedMigrationSql ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-emerald-500" />}
                          <span>{copiedMigrationSql ? '¡SQL Copiado!' : 'Copiar Script SQL Supabase'}</span>
                        </button>
                      )}
                    </div>

                    {/* Notice box */}
                    <div className={`p-3 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2.5 ${
                      isDarkMode ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-200' : 'bg-amber-50/80 border-amber-200 text-slate-800'
                    }`}>
                      <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <strong>¿Cómo se guardan las imágenes?</strong> Tus cambios se guardan <u>de inmediato en tu tienda local</u>. Si usas Supabase y la nube no las guarda todavía, es porque tu tabla <code className="px-1 py-0.5 rounded bg-black/10 font-mono text-[10px]">store_settings</code> en Supabase necesita las 3 columnas de las imágenes. Haz clic arriba en <strong>"Copiar Script SQL Supabase"</strong> y pégalo en el <strong>SQL Editor</strong> de Supabase.
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Image 1: Central Circle */}
                      <div className={`p-3.5 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-500">1. Círculo Central (Grande)</span>
                          <span className="text-[10px] text-slate-400">Ej: Panes / Trigo</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 shrink-0 bg-black/20">
                            <img
                              src={cleanDirectImageUrl(editingSettings.heroImage1 || '') || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800'}
                              alt="Círculo Central"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <input
                              type="text"
                              placeholder="URL de la imagen (https://...)"
                              value={editingSettings.heroImage1 || ''}
                              onChange={(e) => setEditingSettings({ ...editingSettings, heroImage1: e.target.value })}
                              className={`w-full p-2 rounded-xl border text-[11px] focus:outline-none focus:border-[#60b64d] ${
                                isDarkMode ? 'bg-[#0a120e] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                            <div className="flex items-center gap-1.5">
                              <label className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs">
                                <Upload className="w-3 h-3" />
                                <span>Subir</span>
                                <input type="file" accept="image/*" onChange={handleHeroImage1FileUpload} className="hidden" />
                              </label>
                              {editingSettings.heroImage1 && (
                                <button
                                  type="button"
                                  onClick={() => setEditingSettings({ ...editingSettings, heroImage1: undefined })}
                                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer ml-auto"
                                >
                                  Restablecer
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Image 2: Top Left Circle */}
                      <div className={`p-3.5 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-500">2. Círculo Superior (Izq)</span>
                          <span className="text-[10px] text-slate-400">Ej: Queso Paria</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-500 shrink-0 bg-black/20">
                            <img
                              src={cleanDirectImageUrl(editingSettings.heroImage2 || '') || 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=600'}
                              alt="Círculo Superior"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <input
                              type="text"
                              placeholder="URL de la imagen (https://...)"
                              value={editingSettings.heroImage2 || ''}
                              onChange={(e) => setEditingSettings({ ...editingSettings, heroImage2: e.target.value })}
                              className={`w-full p-2 rounded-xl border text-[11px] focus:outline-none focus:border-[#60b64d] ${
                                isDarkMode ? 'bg-[#0a120e] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                            <div className="flex items-center gap-1.5">
                              <label className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs">
                                <Upload className="w-3 h-3" />
                                <span>Subir</span>
                                <input type="file" accept="image/*" onChange={handleHeroImage2FileUpload} className="hidden" />
                              </label>
                              {editingSettings.heroImage2 && (
                                <button
                                  type="button"
                                  onClick={() => setEditingSettings({ ...editingSettings, heroImage2: undefined })}
                                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer ml-auto"
                                >
                                  Restablecer
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Image 3: Bottom Right Circle */}
                      <div className={`p-3.5 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400">3. Círculo Inferior (Der)</span>
                          <span className="text-[10px] text-slate-400">Ej: Miel / Fruta</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-400 shrink-0 bg-black/20">
                            <img
                              src={cleanDirectImageUrl(editingSettings.heroImage3 || '') || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600'}
                              alt="Círculo Inferior"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <input
                              type="text"
                              placeholder="URL de la imagen (https://...)"
                              value={editingSettings.heroImage3 || ''}
                              onChange={(e) => setEditingSettings({ ...editingSettings, heroImage3: e.target.value })}
                              className={`w-full p-2 rounded-xl border text-[11px] focus:outline-none focus:border-[#60b64d] ${
                                isDarkMode ? 'bg-[#0a120e] border-[#1c3326] text-white' : 'bg-white border-slate-[#300] text-slate-900'
                              }`}
                            />
                            <div className="flex items-center gap-1.5">
                              <label className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs">
                                <Upload className="w-3 h-3" />
                                <span>Subir</span>
                                <input type="file" accept="image/*" onChange={handleHeroImage3FileUpload} className="hidden" />
                              </label>
                              {editingSettings.heroImage3 && (
                                <button
                                  type="button"
                                  onClick={() => setEditingSettings({ ...editingSettings, heroImage3: undefined })}
                                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer ml-auto"
                                >
                                  Restablecer
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category Card Management Section (Names, Descriptions, Photos) */}
                  <div className="md:col-span-2 pt-5 border-t border-dashed border-emerald-500/20 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                          <span>🏷️ Gestión de Categorías (Nombres, Descripciones y Fotos)</span>
                        </h4>
                        <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          Personaliza los títulos, breves descripciones y fotos de cada tarjeta de categoría en el catálogo.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyCategoriesSql}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all border cursor-pointer active:scale-95 ${
                          copiedCategoriesSql
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : isDarkMode
                            ? 'bg-[#15231c] hover:bg-[#1c3326] text-emerald-300 border-emerald-500/30'
                            : 'bg-white hover:bg-emerald-100 text-emerald-700 border-emerald-300 shadow-xs'
                        }`}
                      >
                        {copiedCategoriesSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCategoriesSql ? '¡SQL Copiado!' : 'Copiar Query Categorías Supabase'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { id: 'Panadería', defaultName: 'Panadería Artesanal', defaultDesc: 'Panes tradicionales horneados a la leña', defaultUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800' },
                        { id: 'Lácteos', defaultName: 'Quesería & Lácteos', defaultDesc: 'Quesos frescos, madurados y manjar blanco', defaultUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=800' },
                        { id: 'Embutidos', defaultName: 'Embutidos & Carnes', defaultDesc: 'Chorizos, cecina y jamones artesanales', defaultUrl: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&q=80&w=800' },
                        { id: 'Miel y Dulces', defaultName: 'Miel & Dulces', defaultDesc: 'Miel pura de abeja y mermeladas puras', defaultUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800' },
                        { id: 'Papa Nativa', defaultName: 'Papa Nativa', defaultDesc: 'Variedades nativas cultivadas en altura', defaultUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=800' },
                      ].map((catItem) => {
                        const currentName = editingSettings.categoryNames?.[catItem.id] ?? catItem.defaultName;
                        const currentDesc = editingSettings.categoryDescriptions?.[catItem.id] ?? catItem.defaultDesc;
                        const currentUrl = editingSettings.categoryImages?.[catItem.id] || '';
                        const displayUrl = cleanDirectImageUrl(currentUrl) || catItem.defaultUrl;

                        return (
                          <div
                            key={catItem.id}
                            className={`p-3.5 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-200'}`}
                          >
                            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                              <span className="text-xs font-bold text-emerald-500">ID: {catItem.id}</span>
                              <span className="text-[10px] text-slate-400">Categoría</span>
                            </div>

                            {/* Name Input */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Nombre de la Categoría
                              </label>
                              <input
                                type="text"
                                value={currentName}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditingSettings((prev) => ({
                                    ...prev,
                                    categoryNames: {
                                      ...(prev.categoryNames || {}),
                                      [catItem.id]: val
                                    }
                                  }));
                                }}
                                className={`w-full p-2 rounded-xl border text-xs font-semibold focus:outline-none focus:border-[#60b64d] ${
                                  isDarkMode ? 'bg-[#0a120e] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                              />
                            </div>

                            {/* Description Input */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Descripción Corta
                              </label>
                              <input
                                type="text"
                                value={currentDesc}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditingSettings((prev) => ({
                                    ...prev,
                                    categoryDescriptions: {
                                      ...(prev.categoryDescriptions || {}),
                                      [catItem.id]: val
                                    }
                                  }));
                                }}
                                className={`w-full p-2 rounded-xl border text-[11px] focus:outline-none focus:border-[#60b64d] ${
                                  isDarkMode ? 'bg-[#0a120e] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                              />
                            </div>

                            {/* Image & URL Input */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Imagen de la Tarjeta
                              </label>
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-14 rounded-xl overflow-hidden border border-emerald-500/40 shrink-0 bg-black/20 relative shadow-2xs">
                                  <img
                                    src={displayUrl}
                                    alt={currentName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = catItem.defaultUrl;
                                    }}
                                  />
                                </div>

                                <div className="flex-1 space-y-1.5">
                                  <input
                                    type="text"
                                    placeholder="URL de imagen (https://...)"
                                    value={currentUrl}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setEditingSettings((prev) => ({
                                        ...prev,
                                        categoryImages: {
                                          ...(prev.categoryImages || {}),
                                          [catItem.id]: val
                                        }
                                      }));
                                    }}
                                    className={`w-full p-2 rounded-xl border text-[11px] focus:outline-none focus:border-[#60b64d] ${
                                      isDarkMode ? 'bg-[#0a120e] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                                    }`}
                                  />
                                  <div className="flex items-center gap-1.5">
                                    <label className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs">
                                      <Upload className="w-3 h-3" />
                                      <span>Subir Foto</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleCategoryImageFileUpload(catItem.id, e)}
                                        className="hidden"
                                      />
                                    </label>
                                    {(currentUrl || editingSettings.categoryNames?.[catItem.id] || editingSettings.categoryDescriptions?.[catItem.id]) && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingSettings((prev) => {
                                            const updatedImgs = { ...(prev.categoryImages || {}) };
                                            delete updatedImgs[catItem.id];
                                            const updatedNames = { ...(prev.categoryNames || {}) };
                                            delete updatedNames[catItem.id];
                                            const updatedDescs = { ...(prev.categoryDescriptions || {}) };
                                            delete updatedDescs[catItem.id];
                                            return {
                                              ...prev,
                                              categoryImages: updatedImgs,
                                              categoryNames: updatedNames,
                                              categoryDescriptions: updatedDescs
                                            };
                                          });
                                        }}
                                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer ml-auto"
                                      >
                                        Restablecer
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Supabase SQL Migration Info Helper Box */}
              {isSupabaseConnected() && (
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isDarkMode ? 'bg-[#0d1712] border-emerald-500/20' : 'bg-emerald-50/70 border-emerald-200'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <Database className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">Base de Datos Supabase Conectada</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-500">
                          Sincronización Activa
                        </span>
                      </div>
                      <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Si creaste tu tabla antes, puedes actualizar sus columnas en Supabase copiando el script SQL rápido y ejecutándolo en tu SQL Editor.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyMigrationSql}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all border cursor-pointer active:scale-95 ${
                      copiedMigrationSql
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : isDarkMode
                        ? 'bg-[#15231c] hover:bg-[#1c3326] text-emerald-300 border-emerald-500/30'
                        : 'bg-white hover:bg-emerald-100 text-emerald-700 border-emerald-300 shadow-xs'
                    }`}
                  >
                    {copiedMigrationSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMigrationSql ? '¡Copiado!' : 'Copiar Script SQL Rápido'}</span>
                  </button>
                </div>
              )}

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

        {/* ======================================================== */}
        {/* TAB 5: AGENCIAS Y DESTINOS DE ENVÍO                      */}
        {/* ======================================================== */}
        {activeMainTab === 'agencias' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Top Toolbar */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div>
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#60b64d]" />
                  <h2 className="text-base font-extrabold tracking-tight">
                    Agencias de Transporte y Sedes de Destino
                  </h2>
                </div>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Modifica las agencias activas, edita nombres, cambia horarios de salida y administra las sedes de entrega disponibles.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setAgencyModalData({ name: '', description: '', dispatchDaysSummary: 'Martes y Viernes', active: true, type: 'otra' });
                    setIsAgencyModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#60b64d] hover:bg-[#50a040] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Agencia</span>
                </button>
              </div>
            </div>

            {/* Grid of Agencies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {agenciesList.map((agency) => {
                // Determine branch list for this agency type
                let branchList: any[] = [];
                if (agency.type === 'palomino') branchList = palominoBranches;
                else if (agency.type === 'rivera_cargo') branchList = riveraBranches;
                else if (agency.type === 'agencia_nacional') branchList = nacionalBranches;
                else if (agency.type === 'agencia_molina') branchList = molinaBranches;

                return (
                  <div key={agency.id} className={`p-4 sm:p-5 rounded-2xl border space-y-4 transition-all ${
                    isDarkMode ? 'bg-[#0a120e] border-[#1c3326]' : 'bg-white border-slate-200 shadow-2xs'
                  }`}>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-500/10">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#60b64d]">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm">{agency.name}</h3>
                          <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {agency.dispatchDaysSummary || 'Despachos desde Abancay'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleAgencyActive(agency.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                            agency.active
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-slate-500/20 text-slate-400 border-slate-500/30 hover:bg-slate-500/30'
                          }`}
                        >
                          {agency.active ? 'Activa' : 'Inactiva'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAgencyModalData(agency);
                            setIsAgencyModalOpen(true);
                          }}
                          className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                            isDarkMode ? 'bg-[#15231c] hover:bg-[#1c3326] text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          }`}
                          title="Editar información de la agencia"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteAgency(agency.id)}
                          className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer transition-all"
                          title="Eliminar agencia"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Agency Description */}
                    {agency.description && (
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {agency.description}
                      </p>
                    )}

                    {/* Branches Header */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#60b64d]" />
                        Sedes / Destinos configurados ({branchList.length}):
                      </span>

                      {agency.type !== 'otra' && (
                        <button
                          type="button"
                          onClick={() => setBranchModalData({
                            agencyType: agency.type,
                            branch: { name: '', address: '', dispatchSchedule: '5:00 PM', arrivalNotice: 'Llega al día siguiente' },
                            isNew: true
                          })}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Agregar Sede</span>
                        </button>
                      )}
                    </div>

                    {/* Branches List */}
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {branchList.length === 0 ? (
                        <p className={`text-xs italic p-3 rounded-xl border text-center ${
                          isDarkMode ? 'bg-[#0d1712] border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}>
                          No hay sedes creadas para esta agencia. Haz clic en "Agregar Sede".
                        </p>
                      ) : (
                        branchList.map((branch) => (
                          <div key={branch.id} className={`p-2.5 rounded-xl border text-xs space-y-1.5 ${
                            isDarkMode ? 'bg-[#0d1712] border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 overflow-hidden">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#60b64d] shrink-0" />
                                <span className="font-bold truncate">{branch.name}</span>
                                {(branch.region || branch.zone) && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-500/20 text-slate-400">
                                    {branch.region || branch.zone}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {branch.googleMapsUrl && (
                                  <a
                                    href={branch.googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                                    title="Ver en Google Maps"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setBranchModalData({ agencyType: agency.type, branch, isNew: false })}
                                  className={`p-1 rounded cursor-pointer ${
                                    isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200 text-slate-700'
                                  }`}
                                  title="Editar esta sede"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteBranch(agency.type, branch.id)}
                                  className="p-1 rounded hover:bg-red-500/20 text-red-400 cursor-pointer"
                                  title="Eliminar esta sede"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {branch.address && (
                              <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                📍 {branch.address}
                              </p>
                            )}

                            {(branch.dispatchSchedule || branch.arrivalNotice) && (
                              <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                🕒 {branch.dispatchSchedule || ''} {branch.arrivalNotice ? `| 📦 ${branch.arrivalNotice}` : ''}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

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

              {/* Image URL & File Upload & Postimages Helper */}
              <div className={`p-3.5 rounded-2xl border space-y-3 ${
                isDarkMode ? 'bg-[#08100c] border-[#1c3326]' : 'bg-slate-50 border-slate-300'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <label className={`font-bold text-xs block ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    Foto / Imagen del Producto
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold text-white bg-[#60b64d] hover:bg-[#50a040] px-2.5 py-1 rounded-lg transition-colors shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir a Supabase / PC</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProductImageFileUpload}
                        className="hidden"
                      />
                    </label>
                    <a
                      href="https://postimages.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-lg transition-colors border border-emerald-500/20"
                      title="Subir a Postimages.org y copiar enlace directo"
                    >
                      <span>Postimages</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Pega un enlace directo o sube un archivo (ej: https://...supabase.co/storage/... o https://i.postimg.cc/...)"
                    value={editingProduct.image || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingProduct({ ...editingProduct, image: val });
                    }}
                    onBlur={(e) => {
                      const val = e.target.value;
                      const cleaned = cleanDirectImageUrl(val);
                      if (cleaned !== val) {
                        setEditingProduct({ ...editingProduct, image: cleaned });
                      }
                    }}
                    className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#60b64d] ${
                      isDarkMode ? 'bg-[#0a120e] border-[#1c3326] text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  {editingProduct.image?.includes('supabase.co/storage') && (
                    <p className="text-[11px] mt-1 text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 shrink-0" /> Imagen alojada en tu Bucket de Supabase Storage.
                    </p>
                  )}
                  {editingProduct.image?.includes('postimg.cc') && !editingProduct.image?.includes('i.postimg.cc') && (
                    <p className="text-[11px] mt-1 text-amber-400 font-medium">
                      ⚠️ Atención: Has pegado un enlace de página de Postimages. En Postimages copia el campo <strong className="underline">"Enlace Directo"</strong> que empieza con <code>https://i.postimg.cc/...</code>
                    </p>
                  )}
                </div>

                {/* Live Preview of Product Image */}
                {editingProduct.image ? (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/30 border border-slate-500/20">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center relative">
                      <img
                        src={editingProduct.image}
                        alt="Vista previa"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="text-xs overflow-hidden flex-1">
                      <span className="font-bold text-emerald-400 block mb-0.5">✓ Vista previa en vivo</span>
                      <span className="text-slate-400 truncate block max-w-xs text-[11px]">
                        {editingProduct.image.startsWith('data:image') ? 'Archivo cargado desde tu dispositivo' : editingProduct.image}
                      </span>
                    </div>
                  </div>
                ) : null}
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

      {/* Modal Editar / Crear Agencia */}
      {isAgencyModalOpen && agencyModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`w-full max-w-md p-6 rounded-2xl border text-left animate-in zoom-in-95 duration-150 ${
            isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-500/10 mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#60b64d]" />
                <h3 className="font-extrabold text-base">
                  {agencyModalData.id ? 'Editar Agencia' : 'Nueva Agencia de Transporte'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAgencyModalOpen(false)}
                className={`p-1.5 rounded-lg border ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveAgencyModal(agencyModalData);
            }} className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">Nombre de la Agencia *</label>
                <input
                  type="text"
                  required
                  value={agencyModalData.name || ''}
                  onChange={(e) => setAgencyModalData({ ...agencyModalData, name: e.target.value })}
                  placeholder="Ej: Agencia Shalom, Expreso Palomino, etc."
                  className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none ${
                    isDarkMode ? 'bg-[#15231c] border-[#1c3326] text-white focus:border-[#60b64d]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#60b64d]'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Descripción / Cobertura</label>
                <textarea
                  rows={2}
                  value={agencyModalData.description || ''}
                  onChange={(e) => setAgencyModalData({ ...agencyModalData, description: e.target.value })}
                  placeholder="Ej: Envíos directos a Lima, Cusco y Arequipa..."
                  className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none ${
                    isDarkMode ? 'bg-[#15231c] border-[#1c3326] text-white focus:border-[#60b64d]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#60b64d]'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Resumen Días / Horario de Despacho</label>
                <input
                  type="text"
                  value={agencyModalData.dispatchDaysSummary || ''}
                  onChange={(e) => setAgencyModalData({ ...agencyModalData, dispatchDaysSummary: e.target.value })}
                  placeholder="Ej: Martes y Viernes (4:00 PM)"
                  className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none ${
                    isDarkMode ? 'bg-[#15231c] border-[#1c3326] text-white focus:border-[#60b64d]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#60b64d]'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold">Estado de la Agencia:</span>
                <button
                  type="button"
                  onClick={() => setAgencyModalData({ ...agencyModalData, active: !agencyModalData.active })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    agencyModalData.active ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {agencyModalData.active ? '✓ ACTIVA' : 'INACTIVA'}
                </button>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-500/10">
                <button
                  type="button"
                  onClick={() => setIsAgencyModalOpen(false)}
                  className={`flex-1 py-2.5 rounded-xl border font-bold text-xs ${
                    isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#60b64d] hover:bg-[#50a040] text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                >
                  Guardar Agencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar / Crear Sede de Destino */}
      {branchModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`w-full max-w-md p-6 rounded-2xl border text-left animate-in zoom-in-95 duration-150 ${
            isDarkMode ? 'bg-[#0d1712] border-[#1c3326] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-500/10 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#60b64d]" />
                <h3 className="font-extrabold text-base">
                  {branchModalData.isNew ? 'Agregar Nueva Sede / Destino' : 'Editar Sede / Destino'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBranchModalData(null)}
                className={`p-1.5 rounded-lg border ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveBranchModal();
            }} className="space-y-3.5">

              <div>
                <label className="text-xs font-bold block mb-1">Nombre de la Sede / Ciudad *</label>
                <input
                  type="text"
                  required
                  value={branchModalData.branch.name || ''}
                  onChange={(e) => setBranchModalData({
                    ...branchModalData,
                    branch: { ...branchModalData.branch, name: e.target.value }
                  })}
                  placeholder="Ej: Pichanaki, Luna Pizarro, Juliaca, Arequipa..."
                  className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none ${
                    isDarkMode ? 'bg-[#15231c] border-[#1c3326] text-white focus:border-[#60b64d]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#60b64d]'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Zona / Región</label>
                <input
                  type="text"
                  value={branchModalData.branch.zone || branchModalData.branch.region || ''}
                  onChange={(e) => setBranchModalData({
                    ...branchModalData,
                    branch: { ...branchModalData.branch, zone: e.target.value, region: e.target.value }
                  })}
                  placeholder="Ej: Selva Central, Lima Centro, Sur del Perú, Ica y Nazca..."
                  className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none ${
                    isDarkMode ? 'bg-[#15231c] border-[#1c3326] text-white focus:border-[#60b64d]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#60b64d]'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Dirección de la Sede</label>
                <input
                  type="text"
                  value={branchModalData.branch.address || ''}
                  onChange={(e) => setBranchModalData({
                    ...branchModalData,
                    branch: { ...branchModalData.branch, address: e.target.value }
                  })}
                  placeholder="Ej: Av. Luna Pizarro 424, La Victoria, Lima"
                  className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none ${
                    isDarkMode ? 'bg-[#15231c] border-[#1c3326] text-white focus:border-[#60b64d]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#60b64d]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold block mb-1">Horario de Despacho</label>
                  <input
                    type="text"
                    value={branchModalData.branch.dispatchSchedule || branchModalData.branch.dispatchTime || ''}
                    onChange={(e) => setBranchModalData({
                      ...branchModalData,
                      branch: { ...branchModalData.branch, dispatchSchedule: e.target.value, dispatchTime: e.target.value }
                    })}
                    placeholder="Ej: Viernes 1:00 PM"
                    className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none ${
                      isDarkMode ? 'bg-[#15231c] border-[#1c3326] text-white focus:border-[#60b64d]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#60b64d]'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Aviso / Recojo Estimado</label>
                  <input
                    type="text"
                    value={branchModalData.branch.arrivalNotice || ''}
                    onChange={(e) => setBranchModalData({
                      ...branchModalData,
                      branch: { ...branchModalData.branch, arrivalNotice: e.target.value }
                    })}
                    placeholder="Ej: Recoge Sábado 4:00 PM"
                    className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none ${
                      isDarkMode ? 'bg-[#15231c] border-[#1c3326] text-white focus:border-[#60b64d]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#60b64d]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Enlace de Google Maps (opcional)</label>
                <input
                  type="url"
                  value={branchModalData.branch.googleMapsUrl || ''}
                  onChange={(e) => setBranchModalData({
                    ...branchModalData,
                    branch: { ...branchModalData.branch, googleMapsUrl: e.target.value }
                  })}
                  placeholder="https://maps.google.com/?q=..."
                  className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none ${
                    isDarkMode ? 'bg-[#15231c] border-[#1c3326] text-white focus:border-[#60b64d]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#60b64d]'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-500/10">
                <button
                  type="button"
                  onClick={() => setBranchModalData(null)}
                  className={`flex-1 py-2.5 rounded-xl border font-bold text-xs ${
                    isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#60b64d] hover:bg-[#50a040] text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                >
                  Guardar Sede
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      <div className="fixed bottom-5 right-5 z-40 no-print flex items-center gap-2">
        <button
          onClick={openNewProductModal}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#60b64d] hover:bg-[#50a040] text-white text-sm font-extrabold shadow-2xl active:scale-95 transition-all border border-white/20 cursor-pointer animate-bounce"
          title="Crear un nuevo producto en el catálogo"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>+ CREAR NUEVO PRODUCTO</span>
        </button>
      </div>

    </div>
  );
};

