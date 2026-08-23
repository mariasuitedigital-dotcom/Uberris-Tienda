export type ProductCategory = 'Panadería' | 'Lácteos' | 'Embutidos' | 'Miel y Dulces' | 'Papa Nativa';

export type OrderStatus = 'pendiente' | 'en_produccion' | 'despachado' | 'entregado' | 'cancelado';

export interface ProductRecipeItem {
  supplyId: string;
  amountPerPackage: number; // Amount of supply consumed per 1 package/unit sold
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Price in Soles (S/)
  unit: string; // e.g. "Paquete x 5 und", "250g", "Molde x 1 Kg", "Malla 5 Kg"
  unitsPerPackage: number; // e.g. 5 for pan chapla (so 21 pkgs = 105 units)
  category: ProductCategory;
  image: string;
  available: boolean;
  stockType?: 'con_stock' | 'a_producir'; // 'con_stock' = stock limitado / físico; 'a_producir' = bajo demanda / sin límite
  stock: number; // For 'con_stock', units available
  badge?: 'Más Vendido' | 'Artesanal' | 'Superfood' | 'Nativo' | 'Orgánico' | 'Especialidad';
  customGuarantee1?: string;
  customGuarantee2?: string;
  originLocation?: string;
  rawRecipe?: ProductRecipeItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitLabel: string;
  unitsPerPackage: number;
}

export interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  address?: string;
  destinationCity: string;
  deliveryDate?: string; // YYYY-MM-DD
  dispatchDay?: 'Martes' | 'Jueves' | 'Viernes';
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  createdAt: string;
  notes?: string;
  paymentMethod?: 'Yape' | 'BCP' | 'Plin';
  shippingType?: 'palomino' | 'rivera_cargo' | 'agencia_nacional' | 'agencia_molina' | 'agency' | 'store_pickup';
  shippingAgency?: string;
  shippingBranch?: string;
  shippingAddress?: string;
  shippingNotice?: string;
}

export interface ShippingAgency {
  id: string;
  name: string;
  type: 'palomino' | 'rivera_cargo' | 'agencia_nacional' | 'agencia_molina' | 'otra';
  description?: string;
  dispatchDaysSummary?: string;
  active: boolean;
  sortOrder?: number;
}

export interface ShippingDestination {
  id: string;
  agencyId: string;
  name: string;
  zone?: string;
  address: string;
  phone?: string;
  dispatchSchedule: string;
  arrivalNotice: string;
  dispatchDays?: 'Martes' | 'Jueves' | 'Viernes' | 'Martes, Jueves' | 'Martes y Viernes' | 'Viernes Únicamente';
  googleMapsUrl?: string;
  active: boolean;
  sortOrder?: number;
}

export interface ProductionBreakdownClient {
  orderId: string;
  clientName: string;
  destinationCity: string;
  packages: number;
  deliveryDate: string;
}

export interface ProductionConsolidatedItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  unitsPerPackage: number;
  totalPackages: number;
  totalUnits: number; // Formula: totalPackages * unitsPerPackage
  breakdown: ProductionBreakdownClient[];
  status: 'pendiente' | 'listo';
}

export type SupplyCategory = 'Harina & Granos' | 'Lácteos Base' | 'Grasas & Aceites' | 'Saborizantes & Semillas' | 'Empaques';

export interface RawSupply {
  id: string;
  name: string;
  category: SupplyCategory;
  stock: number;
  unit: 'Kg' | 'Litros' | 'Unidades' | 'Gramos';
  minimumThreshold: number;
  costPerUnit: number; // S/ per unit
}

export interface InventoryMovement {
  id: string;
  supplyId: string;
  supplyName: string;
  type: 'venta_automatica' | 'ingreso_compra' | 'ajuste_manual' | 'merma' | 'horneada';
  amount: number; // Negative for deduction, positive for addition
  unit: string;
  date: string;
  referenceOrder?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  active?: boolean;
}

export interface StoreSettings {
  id: string;
  businessName: string;
  tagline: string;
  footerBio?: string;
  footerShippingInfo?: string;
  phone: string;
  whatsappPhone: string;
  email: string;
  addressText: string;
  businessHours: string;
  tiktokUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  logoUrl?: string;
  heroBannerUrl?: string;
  yapeQrImage?: string;
  yapeNumber?: string;
  yapeName?: string;
  plinQrImage?: string;
  plinNumber?: string;
  plinName?: string;
  bankAccountBank?: string;
  bankAccountNumber?: string;
  bankAccountCci?: string;
  bankAccountName?: string;
  announcementBanner: string;
  // Visibility switches
  showTiktok?: boolean;
  showFacebook?: boolean;
  showInstagram?: boolean;
  showWhatsapp?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  showAddress?: boolean;
  showHours?: boolean;
  showShippingInfo?: boolean;
  showPaymentBadges?: boolean;
  // Quality Guarantees & Hero Badges
  guaranteeBadge1?: string;
  guaranteeBadge2?: string;
  originLocationText?: string;
  heroTag?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage1?: string;
  heroImage2?: string;
  heroImage3?: string;
  categoryImages?: Record<string, string>;
  categoryNames?: Record<string, string>;
  categoryDescriptions?: Record<string, string>;
  customCategories?: CategoryInfo[];
  updatedAt?: string;
}

export interface ProductionBatch {
  id: string;
  productId: string;
  productName: string;
  quantityPackages: number;
  totalUnits: number;
  status: 'planificado' | 'amasando' | 'en_horno' | 'terminado';
  scheduledDate: string;
  notes?: string;
  createdAt?: string;
}
