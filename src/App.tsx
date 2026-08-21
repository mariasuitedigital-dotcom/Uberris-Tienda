import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { FloatingBreadHero } from './components/FloatingBreadHero';
import { HorizontalProductCard } from './components/HorizontalProductCard';
import { CategoriesGrid } from './components/CategoriesGrid';
import { SectionHeader } from './components/SectionHeader';
import { BottomNav } from './components/BottomNav';
import { AdminAuthModal } from './components/AdminAuthModal';
import { SupabaseSyncModal } from './components/SupabaseSyncModal';
import {
  dbFetchProducts,
  dbFetchOrders,
  dbFetchStoreSettings,
  dbUpsertStoreSettings,
  dbCreateOrder,
  dbUpdateOrderStatus,
  dbDeleteOrder,
  dbUpsertProduct,
  dbDeleteProduct,
  subscribeToSupabaseOrders,
  subscribeToSupabaseProducts,
  isSupabaseConnected
} from './lib/supabase';
import {
  Product,
  CartItem,
  Order,
  OrderStatus,
  RawSupply,
  InventoryMovement,
  ProductCategory,
  StoreSettings
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_SUPPLIES,
  INITIAL_MOVEMENTS,
  DEFAULT_STORE_SETTINGS
} from './data/initialData';
import {
  Wheat,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Flame,
  ArrowRight,
  PhoneCall,
  MapPin,
  Sparkles,
  ShoppingBag,
  LayoutDashboard
} from 'lucide-react';

export default function App() {
  // 1. Theme State with LocalStorage persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('uberris_theme');
    return saved ? saved === 'dark' : true; // default to dark theme #08100c
  });

  useEffect(() => {
    localStorage.setItem('uberris_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // 2. View Mode State ('catalog' | 'admin')
  const [currentView, setCurrentView] = useState<'catalog' | 'admin'>('catalog');
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // 3. Catalog & Search State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('uberris_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  useEffect(() => {
    localStorage.setItem('uberris_products', JSON.stringify(products));
  }, [products]);

  // Store Settings State (Company Phone, Social Media TikTok/Facebook/Instagram, Business Hours, Address)
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('uberris_settings');
    return saved ? JSON.parse(saved) : DEFAULT_STORE_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('uberris_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  // Load from Supabase on mount and listen to realtime updates
  const fetchSupabaseData = async () => {
    if (!isSupabaseConnected()) return;
    try {
      const [dbProds, dbOrds, dbSettings] = await Promise.all([
        dbFetchProducts(),
        dbFetchOrders(),
        dbFetchStoreSettings()
      ]);
      if (dbProds && dbProds.length > 0) {
        setProducts(dbProds);
      }
      if (dbOrds && dbOrds.length > 0) {
        setOrders(dbOrds);
      }
      if (dbSettings) {
        setStoreSettings(dbSettings);
      }
    } catch (err) {
      console.warn('Supabase fetch notice:', err);
    }
  };

  useEffect(() => {
    fetchSupabaseData();

    if (isSupabaseConnected()) {
      const unsubOrders = subscribeToSupabaseOrders(() => {
        dbFetchOrders().then((ords) => {
          if (ords) setOrders(ords);
        });
      });
      const unsubProducts = subscribeToSupabaseProducts(() => {
        dbFetchProducts().then((prods) => {
          if (prods) setProducts(prods);
        });
      });

      return () => {
        unsubOrders();
        unsubProducts();
      };
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Todos'>('Todos');

  // 4. Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('uberris_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('uberris_cart', JSON.stringify(cart));
  }, [cart]);

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // 5. Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('uberris_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem('uberris_orders', JSON.stringify(orders));
  }, [orders]);

  // 6. Raw Supplies Inventory & Movements State
  const [supplies, setSupplies] = useState<RawSupply[]>(() => {
    const saved = localStorage.getItem('uberris_supplies');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIES;
  });

  useEffect(() => {
    localStorage.setItem('uberris_supplies', JSON.stringify(supplies));
  }, [supplies]);

  const [movements, setMovements] = useState<InventoryMovement[]>(() => {
    const saved = localStorage.getItem('uberris_movements');
    return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
  });

  useEffect(() => {
    localStorage.setItem('uberris_movements', JSON.stringify(movements));
  }, [movements]);

  // Derived state for new sections
  const popularProducts = useMemo(() => {
    return products.filter((p) => p.badge === 'Más Vendido').slice(0, 5);
  }, [products]);

  const promoProducts = useMemo(() => {
    return products.slice(0, 5); // Fallback: since we don't have isPromo, we'll just pick some products or you could filter by a specific criteria
  }, [products]);

  const handleScrollToCatalog = () => {
    // Scroll smoothly to the catalog section
    const el = document.getElementById('catalogo-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // 7. Quick View Modal Product
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // 8. Notification Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- CART ACTIONS ---
  const handleAddToCart = (product: Product, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    showToast(
      '¡Añadido al Carrito!',
      `${quantity} × ${product.name} listo para armar tu pedido.`,
      'success'
    );
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Producto removido del pedido', undefined, 'info');
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // --- SUBMIT ORDER & UPDATE PRODUCT INVENTORY ---
  const handleSubmitOrder = async (newOrder: Order) => {
    // 1. Save new order in local state
    setOrders((prev) => [newOrder, ...prev]);

    // 2. Persist to Supabase if connected
    if (isSupabaseConnected()) {
      dbCreateOrder(newOrder).catch((err) =>
        console.warn('Could not sync order to Supabase:', err)
      );
    }

    // 3. Automatically deduct finished product stock for products with physical stock (con_stock)
    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        const orderItem = newOrder.items.find((item) => item.productId === p.id);
        if (orderItem && p.stockType === 'con_stock') {
          const newStock = Math.max(0, (p.stock || 0) - orderItem.quantity);
          return {
            ...p,
            stock: newStock,
          };
        }
        return p;
      });
    });

    showToast(
      '¡Pedido Confirmado!',
      `Pedido #${newOrder.id} registrado para la Hoja de Horno.`,
      'success'
    );
  };

  // --- ADMIN ORDER & CATALOG ACTIONS ---
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );

    if (isSupabaseConnected()) {
      dbUpdateOrderStatus(orderId, status).catch((err) =>
        console.warn('Could not update order status in Supabase:', err)
      );
    }

    showToast('Estado Actualizado', `El pedido #${orderId} pasó a ${status.toUpperCase()}.`, 'info');
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));

    if (isSupabaseConnected()) {
      dbDeleteOrder(orderId).catch((err) =>
        console.warn('Could not delete order in Supabase:', err)
      );
    }

    showToast('Pedido Eliminado', undefined, 'info');
  };

  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === updatedProduct.id);
      if (exists) {
        return prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      }
      return [updatedProduct, ...prev];
    });

    if (isSupabaseConnected()) {
      dbUpsertProduct(updatedProduct).catch((err) =>
        console.warn('Could not save product to Supabase:', err)
      );
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    if (isSupabaseConnected()) {
      dbDeleteProduct(productId).catch((err) =>
        console.warn('Could not delete product from Supabase:', err)
      );
    }

    showToast('Producto Eliminado', 'El producto ha sido retirado del inventario.', 'info');
  };

  const handleAddSupplyStock = (supplyId: string, addedAmount: number) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setSupplies((prev) =>
      prev.map((s) => {
        if (s.id === supplyId) {
          const newStock = Number((s.stock + addedAmount).toFixed(2));
          
          setMovements((prevMov) => [
            {
              id: `MOV-${Math.floor(1000 + Math.random() * 9000)}`,
              supplyId: s.id,
              supplyName: s.name,
              type: 'ingreso_compra',
              amount: addedAmount,
              unit: s.unit,
              date: nowStr,
            },
            ...prevMov,
          ]);

          return { ...s, stock: newStock };
        }
        return s;
      })
    );
  };

  // Handle Store Settings Save (Social Media, Phone, Hours, Address)
  const handleSaveStoreSettings = async (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
    localStorage.setItem('uberris_settings', JSON.stringify(newSettings));
    if (isSupabaseConnected()) {
      try {
        await dbUpsertStoreSettings(newSettings);
      } catch (err) {
        console.error('Error saving settings to Supabase:', err);
      }
    }
  };

  // Filtered Products for Catalog
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'Todos' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pendiente' || o.status === 'en_produccion').length;

  return (
    <div className={`min-h-screen transition-colors ${
      isDarkMode ? 'bg-[#08100c] text-slate-100' : 'bg-[#f7f9f6] text-slate-900'
    }`}>
      {/* Header Bar */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        currentView={currentView}
        onViewChange={setCurrentView}
        pendingOrdersCount={pendingOrdersCount}
        onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
        announcementBanner={storeSettings.announcementBanner}
      />

      {/* Main Content Area */}
      {currentView === 'catalog' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 mb-20">
          
          {/* Hero Banner with Apurímac Artisan Atmosphere */}
          <FloatingBreadHero isDarkMode={isDarkMode} />

          {/* SECTION: LO MÁS PEDIDO */}
          {popularProducts.length > 0 && (
            <section className="space-y-4">
              <SectionHeader
                title="Lo más pedido"
                onViewAll={handleScrollToCatalog}
              />
              <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
                {popularProducts.map((prod) => (
                  <HorizontalProductCard
                    key={`popular-${prod.id}`}
                    product={prod}
                    badgeType="popular"
                    onAddToCart={handleAddToCart}
                    onQuickView={setQuickViewProduct}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            </section>
          )}

          {/* SECTION: PROMOCIONES */}
          {promoProducts.length > 0 && (
            <section className="space-y-4">
              <SectionHeader
                title="Promociones"
                onViewAll={handleScrollToCatalog}
              />
              <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
                {promoProducts.map((prod) => (
                  <HorizontalProductCard
                    key={`promo-${prod.id}`}
                    product={prod}
                    badgeType="promo"
                    onAddToCart={handleAddToCart}
                    onQuickView={setQuickViewProduct}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            </section>
          )}

          {/* SECTION: CATEGORÍAS */}
          <section className="space-y-4">
            <SectionHeader title="Categorías" />
            <CategoriesGrid
              products={products}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                handleScrollToCatalog();
              }}
              isDarkMode={isDarkMode}
            />
          </section>

          {/* Catalog Header & Count */}
          <div id="catalogo-section" className="flex items-center justify-between pt-8 border-t border-slate-500/20">
            <div>
              <h2 className="font-serif-craft text-2xl font-bold">
                {selectedCategory === 'Todos' ? 'Nuestros Sabores Artesanales' : `Especialidades de ${selectedCategory}`}
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Mostrando {filteredProducts.length} productos listos para despacho
              </p>
            </div>

            {searchQuery && (
              <span className="text-xs font-semibold text-[#60b64d]">
                Filtrando por: "{searchQuery}"
              </span>
            )}
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border ${isDarkMode ? 'bg-[#0d1712] border-[#1c3326]' : 'bg-white border-slate-200'}`}>
              <Wheat className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="font-serif-craft text-xl font-bold">No encontramos productos</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Prueba buscando otro término o seleccionando la categoría "Todos".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Todos');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-[#60b64d] text-white text-xs font-semibold"
              >
                Limpiar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onQuickView={setQuickViewProduct}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          )}
        </main>
      ) : (
        /* Admin View Mode */
        <AdminPanel
          products={products}
          orders={orders}
          supplies={supplies}
          movements={movements}
          settings={storeSettings}
          onSaveSettings={handleSaveStoreSettings}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
          onAddSupplyStock={handleAddSupplyStock}
          onShowToast={showToast}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Supabase Cloud Database Sync & Migration Modal */}
      <SupabaseSyncModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        isDarkMode={isDarkMode}
        products={products}
        orders={orders}
        onRefreshData={fetchSupabaseData}
        onShowToast={showToast}
      />

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        isDarkMode={isDarkMode}
      />

      {/* Cart Side Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onSubmitOrder={handleSubmitOrder}
        isDarkMode={isDarkMode}
      />

      {/* Toast Notifications */}
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />

      {/* Mobile Bottom Navigation */}
      {currentView === 'catalog' && (
        <BottomNav
          activeTab={selectedCategory === 'Todos' && !searchQuery ? 'inicio' : 'catalogo'}
          setActiveTab={(tab) => {
            if (tab === 'inicio') {
              setSelectedCategory('Todos');
              setSearchQuery('');
            }
          }}
          cartCount={totalCartCount}
          onCartOpen={() => setIsCartOpen(true)}
          isDarkMode={isDarkMode}
          onOpenAdmin={() => setIsAdminAuthOpen(true)}
          pendingOrdersCount={pendingOrdersCount}
        />
      )}

      {/* Admin Auth Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={() => {
          setIsAdminAuthOpen(false);
          setCurrentView('admin');
        }}
        isDarkMode={isDarkMode}
      />

      {/* Rich Footer with Phone, TikTok, Facebook, Instagram, Address & Hours */}
      <Footer
        settings={storeSettings}
        isDarkMode={isDarkMode}
        onOpenAdmin={() => {
          if (currentView === 'catalog') {
            setIsAdminAuthOpen(true);
          } else {
            setCurrentView('catalog');
          }
        }}
      />
    </div>
  );
}
