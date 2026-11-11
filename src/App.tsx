import React, { useState, useEffect, useCallback } from 'react';
import {
  Restaurant,
  MenuItem,
  PromoCode,
  DeliveryAddress,
  CartItem,
  Order,
} from './types';
import {
  fetchRestaurants,
  fetchCategories,
  fetchPromos,
  fetchAddresses,
  fetchOrders,
} from './services/api';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryBar } from './components/CategoryBar';
import { FiltersBar } from './components/FiltersBar';
import { RestaurantCard } from './components/RestaurantCard';
import { RestaurantDetailModal } from './components/RestaurantDetailModal';
import { DishCustomizerModal } from './components/DishCustomizerModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { LiveOrderTracker } from './components/LiveOrderTracker';
import { OrdersHistoryModal } from './components/OrdersHistoryModal';
import { AddressModal } from './components/AddressModal';
import { Utensils, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Data states
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; count: number; image: string }[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [currentAddress, setCurrentAddress] = useState<DeliveryAddress | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cravebite_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cravebite_favs');
      return saved ? JSON.parse(saved) : ['rest-1', 'rest-4'];
    } catch {
      return ['rest-1', 'rest-4'];
    }
  });

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isVegOnly, setIsVegOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [maxDeliveryTime, setMaxDeliveryTime] = useState<number | null>(null);
  const [hasOffersOnly, setHasOffersOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('relevance');

  // UI modal states
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [customizingDish, setCustomizingDish] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPromo, setCheckoutPromo] = useState<{ code: string; discount: number; freeDelivery: boolean } | undefined>();
  const [checkoutTip, setCheckoutTip] = useState<number>(2.00);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('cravebite_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Sync favorites
  useEffect(() => {
    try {
      localStorage.setItem('cravebite_favs', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  // Initial load
  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
    fetchPromos().then(setPromos).catch(console.error);
    fetchAddresses()
      .then((addrs) => {
        setAddresses(addrs);
        const def = addrs.find((a) => a.isDefault) || addrs[0] || null;
        setCurrentAddress(def);
      })
      .catch(console.error);
    fetchOrders().then(setOrders).catch(console.error);
  }, []);

  // Fetch restaurants on filter change
  const loadRestaurants = useCallback(async () => {
    setLoadingRestaurants(true);
    try {
      const data = await fetchRestaurants({
        search: searchQuery || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        isVegOnly,
        minRating: minRating || undefined,
        maxDeliveryTime: maxDeliveryTime || undefined,
        sortBy,
      });

      let filtered = data;
      if (hasOffersOnly) {
        filtered = filtered.filter((r) => r.offers && r.offers.length > 0);
      }
      setRestaurants(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRestaurants(false);
    }
  }, [searchQuery, selectedCategory, isVegOnly, minRating, maxDeliveryTime, hasOffersOnly, sortBy]);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  // Periodic polling for orders so active order updates in real time
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders().then(setOrders).catch(console.error);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Cart operations
  const handleAddToCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      // If current cart has items from another restaurant, warn and replace
      if (prev.length > 0 && prev[0].item.restaurantId !== newItem.item.restaurantId) {
        showToast('Cart updated with dishes from this new restaurant');
        return [newItem];
      }

      const existingIndex = prev.findIndex((i) => i.cartItemId === newItem.cartItemId);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += newItem.quantity;
        copy[existingIndex].itemTotal += newItem.itemTotal;
        return copy;
      } else {
        return [...prev, newItem];
      }
    });

    showToast(`Added "${newItem.item.name}" to cart`);
  };

  const handleUpdateCartQty = (cartItemId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const unitPrice = item.itemTotal / item.quantity;
            return {
              ...item,
              quantity: newQty,
              itemTotal: Number((unitPrice * newQty).toFixed(2)),
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
    showToast('Item removed from cart');
  };

  const handleClearCart = () => {
    setCartItems([]);
    showToast('Cart cleared');
  };

  const handleReorder = (items: CartItem[]) => {
    setCartItems(items);
    setIsCartOpen(true);
    showToast('Items added to cart from past order!');
  };

  const handleToggleFavorite = (restId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const exists = prev.includes(restId);
      if (exists) {
        showToast('Removed from favorites');
        return prev.filter((id) => id !== restId);
      } else {
        showToast('Saved to favorites');
        return [...prev, restId];
      }
    });
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setTrackingOrderId(newOrder.id);
    showToast(`Order #${newOrder.orderNumber} placed successfully!`);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.itemTotal, 0);

  const hasActiveFilters =
    isVegOnly || minRating !== null || maxDeliveryTime !== null || hasOffersOnly || sortBy !== 'relevance' || selectedCategory !== 'All';

  const resetAllFilters = () => {
    setIsVegOnly(false);
    setMinRating(null);
    setMaxDeliveryTime(null);
    setHasOffersOnly(false);
    setSortBy('relevance');
    setSelectedCategory('All');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-2 border border-gray-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        currentAddress={currentAddress}
        onOpenAddressModal={() => setIsAddressModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cartCount}
        cartSubtotal={cartSubtotal}
        onOpenCart={() => setIsCartOpen(true)}
        orders={orders}
        onOpenOrders={() => setIsOrdersModalOpen(true)}
        onOpenLiveOrder={(order) => setTrackingOrderId(order.id)}
        isVegOnly={isVegOnly}
        onToggleVegOnly={() => setIsVegOnly(!isVegOnly)}
      />

      {/* Hero Banner */}
      <HeroBanner
        promos={promos}
        onSelectPromo={(code) => {
          showToast(`Promo ${code} selected! Add items to cart to apply.`);
          setIsCartOpen(true);
        }}
        onExploreCategory={(cat) => {
          setSelectedCategory(cat);
        }}
      />

      {/* Categories Bar */}
      <CategoryBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Filters and Sorting */}
      <FiltersBar
        restaurantCount={restaurants.length}
        isVegOnly={isVegOnly}
        onToggleVegOnly={() => setIsVegOnly(!isVegOnly)}
        minRating={minRating}
        onSelectMinRating={setMinRating}
        maxDeliveryTime={maxDeliveryTime}
        onSelectMaxDeliveryTime={setMaxDeliveryTime}
        hasOffersOnly={hasOffersOnly}
        onToggleHasOffersOnly={() => setHasOffersOnly(!hasOffersOnly)}
        sortBy={sortBy}
        onSelectSortBy={setSortBy}
        onResetFilters={resetAllFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Main Restaurant Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {selectedCategory !== 'All' ? `${selectedCategory} Restaurants` : 'Top Restaurants in Your Area'}
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Hand-picked eateries offering fast delivery & delightful meals
            </p>
          </div>
        </div>

        {loadingRestaurants ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl h-72 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mx-auto mb-4">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-gray-900">No restaurants found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              We couldn't find any restaurants matching your current search or filter combination.
            </p>
            <button
              onClick={resetAllFilters}
              className="mt-5 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onClick={() => setSelectedRestaurantId(restaurant.id)}
                isFavorite={favorites.includes(restaurant.id)}
                onToggleFavorite={(e) => handleToggleFavorite(restaurant.id, e)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-gray-900 text-sm">CraveBite</span>
            <span>• Full-stack Food Delivery MERN Architecture</span>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <span>Express.js REST API</span>
            <span>•</span>
            <span>React + Tailwind CSS</span>
            <span>•</span>
            <span>Real-time GPS Tracking</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {selectedRestaurantId && (
        <RestaurantDetailModal
          restaurantId={selectedRestaurantId}
          onClose={() => setSelectedRestaurantId(null)}
          cartItems={cartItems}
          onOpenDishCustomizer={(item) => setCustomizingDish(item)}
          onUpdateCartItemQty={handleUpdateCartQty}
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={cartCount}
          cartSubtotal={cartSubtotal}
        />
      )}

      {customizingDish && (
        <DishCustomizerModal
          item={customizingDish}
          onClose={() => setCustomizingDish(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onOpenCheckout={(promo, tip) => {
          setCheckoutPromo(promo);
          if (tip !== undefined) setCheckoutTip(tip);
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        promos={promos}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        currentAddress={currentAddress}
        onOpenAddressModal={() => setIsAddressModalOpen(true)}
        promoDetails={checkoutPromo}
        tip={checkoutTip}
        onOrderSuccess={handleOrderSuccess}
      />

      {trackingOrderId && (
        <LiveOrderTracker
          orderId={trackingOrderId}
          onClose={() => setTrackingOrderId(null)}
          onOrderUpdated={(updated) => {
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? updated : o))
            );
          }}
        />
      )}

      <OrdersHistoryModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        orders={orders}
        onTrackOrder={(order) => {
          setTrackingOrderId(order.id);
        }}
        onReorder={handleReorder}
      />

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addresses={addresses}
        currentAddress={currentAddress}
        onSelectAddress={(addr) => {
          setCurrentAddress(addr);
          showToast(`Delivery location set to ${addr.label}`);
        }}
        onAddressAdded={(newAddr) => {
          setAddresses((prev) => [...prev, newAddr]);
          showToast('New address saved!');
        }}
      />
    </div>
  );
}
