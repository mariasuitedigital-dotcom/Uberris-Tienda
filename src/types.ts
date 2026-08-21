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
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  createdAt: string;
  notes?: string;
  paymentMethod?: 'Yape' | 'BCP';
  shippingType?: 'palomino' | 'rivera_cargo' | 'agency' | 'store_pickup';
  shippingAgency?: string;
  shippingBranch?: string;
  shippingAddress?: string;
  shippingNotice?: string;
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
  type: 'venta_automatica' | 'ingreso_compra' | 'ajuste_manual';
  amount: number; // Negative for deduction, positive for addition
  unit: string;
  date: string;
  referenceOrder?: string;
}
