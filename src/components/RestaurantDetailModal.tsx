import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Phone,
  Search,
  Tag,
  Plus,
  Minus,
  Sparkles,
  ShoppingBag,
  Info,
} from 'lucide-react';
import { Restaurant, MenuItem, CartItem } from '../types';
import { fetchRestaurantDetails } from '../services/api';

interface RestaurantDetailModalProps {
  restaurantId: string;
  onClose: () => void;
  cartItems: CartItem[];
  onOpenDishCustomizer: (item: MenuItem) => void;
  onUpdateCartItemQty: (cartItemId: string, delta: number) => void;
  onOpenCart: () => void;
  cartCount: number;
  cartSubtotal: number;
}

export const RestaurantDetailModal: React.FC<RestaurantDetailModalProps> = ({
  restaurantId,
  onClose,
  cartItems,
  onOpenDishCustomizer,
  onUpdateCartItemQty,
  onOpenCart,
  cartCount,
  cartSubtotal,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    restaurant: Restaurant;
    menu: MenuItem[];
    categories: string[];
  } | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [menuSearch, setMenuSearch] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchRestaurantDetails(restaurantId)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [restaurantId]);

  if (loading || !data) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm font-bold text-gray-600">Loading menu & delicious dishes...</p>
      </div>
    );
  }

  const { restaurant, menu, categories } = data;

  // Filter items
  const filteredMenu = menu.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }
    if (vegOnly && item.dietary !== 'veg' && item.dietary !== 'vegan') {
      return false;
    }
    if (menuSearch.trim()) {
      const q = menuSearch.toLowerCase().trim();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Group items by category
  const menuByCategory: Record<string, MenuItem[]> = {};
  filteredMenu.forEach((item) => {
    if (!menuByCategory[item.category]) {
      menuByCategory[item.category] = [];
    }
    menuByCategory[item.category].push(item);
  });

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col overflow-y-auto animate-in fade-in duration-200">
      {/* Top Floating Navigation */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-orange-600 transition-colors p-2 rounded-xl hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Restaurants</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-gray-900 truncate max-w-[200px] sm:max-w-md">
              {restaurant.name}
            </span>
          </div>

          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-orange-600 text-[11px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 space-y-6">
        {/* Restaurant Header Card */}
        <div className="bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-md">
          {/* Banner */}
          <div className="relative h-48 sm:h-64 w-full bg-gray-100">
            <img
              src={restaurant.bannerImage}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-white text-[11px] font-extrabold uppercase">
                  {restaurant.cuisine[0]}
                </span>
                {restaurant.isPureVeg && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold">
                    Pure Veg
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">{restaurant.name}</h1>
              <p className="text-xs sm:text-sm text-gray-200 mt-0.5 line-clamp-1">{restaurant.tagline}</p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-emerald-600 font-extrabold text-base">
                <Star className="w-4 h-4 fill-emerald-600" />
                <span>{restaurant.rating.toFixed(1)}</span>
              </div>
              <span className="text-[11px] text-gray-400 font-medium">{restaurant.ratingCount}+ Ratings</span>
            </div>

            <div className="flex flex-col items-center pt-2 sm:pt-0">
              <div className="flex items-center gap-1 text-gray-800 font-extrabold text-base">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>{restaurant.deliveryTimeMinutes} mins</span>
              </div>
              <span className="text-[11px] text-gray-400 font-medium">Delivery Time</span>
            </div>

            <div className="flex flex-col items-center pt-2 sm:pt-0">
              <div className="flex items-center gap-1 text-gray-800 font-extrabold text-base">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{restaurant.distanceKm} km</span>
              </div>
              <span className="text-[11px] text-gray-400 font-medium">{restaurant.address}</span>
            </div>

            <div className="flex flex-col items-center pt-2 sm:pt-0">
              <div className="text-gray-800 font-extrabold text-base">
                ${restaurant.priceForTwo}
              </div>
              <span className="text-[11px] text-gray-400 font-medium">Cost for two</span>
            </div>
          </div>

          {/* Offers ticker */}
          {restaurant.offers.length > 0 && (
            <div className="px-4 sm:px-6 py-3 bg-amber-50/70 border-t border-amber-100 flex items-center gap-2 overflow-x-auto text-xs text-amber-900 font-bold">
              <Tag className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Special Offers:</span>
              <div className="flex items-center gap-2">
                {restaurant.offers.map((offer, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg bg-white border border-amber-200 text-amber-800 font-semibold text-[11px] whitespace-nowrap shadow-2xs"
                  >
                    {offer}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Menu Navigation & Search */}
        <div className="sticky top-16 z-20 bg-white rounded-2xl p-3 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none no-scrollbar">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'All'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Items ({menu.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search in Menu & Veg Switch */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Search in menu..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-orange-500"
              />
            </div>

            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 shrink-0 ${
                vegOnly
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${vegOnly ? 'bg-white' : 'bg-emerald-500'}`} />
              <span>Veg Only</span>
            </button>
          </div>
        </div>

        {/* Menu Items List */}
        {Object.keys(menuByCategory).length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
            <Info className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">No dishes match your filter</h3>
            <p className="text-xs text-gray-500 mt-1">Try clearing the search or veg filter.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(menuByCategory).map(([categoryName, items]) => (
              <div key={categoryName} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-gray-900">{categoryName}</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    {items.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => {
                    // Check if this item is in cart
                    const itemsInCartForDish = cartItems.filter((c) => c.item.id === item.id);
                    const totalQty = itemsInCartForDish.reduce((sum, c) => sum + c.quantity, 0);

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs hover:shadow-md transition-shadow flex items-start justify-between gap-4"
                      >
                        {/* Left Details */}
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2">
                            {/* Veg / Non-veg dot */}
                            <span
                              className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center shrink-0 ${
                                item.dietary === 'veg' || item.dietary === 'vegan'
                                  ? 'border-emerald-600'
                                  : 'border-red-600'
                              }`}
                              title={item.dietary.toUpperCase()}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  item.dietary === 'veg' || item.dietary === 'vegan'
                                    ? 'bg-emerald-600'
                                    : 'bg-red-600'
                                }`}
                              />
                            </span>

                            {item.isBestseller && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-extrabold text-[10px] tracking-wider uppercase border border-amber-200">
                                Bestseller
                              </span>
                            )}
                          </div>

                          <h4 className="font-extrabold text-sm text-gray-900 leading-snug">
                            {item.name}
                          </h4>

                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-extrabold text-gray-900">
                              ${item.price.toFixed(2)}
                            </span>
                            {item.originalPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                ${item.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>

                          {item.customizationGroups && item.customizationGroups.length > 0 && (
                            <span className="inline-block text-[10px] font-bold text-orange-600">
                              ✨ Customisable
                            </span>
                          )}
                        </div>

                        {/* Right Dish Image & Add Button */}
                        <div className="relative shrink-0 flex flex-col items-center">
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 shadow-xs">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>

                          {/* Add / Counter Button */}
                          <div className="absolute -bottom-2 w-20 sm:w-24">
                            {totalQty > 0 ? (
                              <div className="flex items-center justify-between bg-white border border-orange-500 rounded-xl px-1.5 py-1 shadow-md">
                                <button
                                  onClick={() => {
                                    if (itemsInCartForDish.length === 1) {
                                      onUpdateCartItemQty(itemsInCartForDish[0].cartItemId, -1);
                                    } else {
                                      onOpenCart();
                                    }
                                  }}
                                  className="text-orange-600 hover:text-orange-700 font-bold p-0.5"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-black text-orange-600">
                                  {totalQty}
                                </span>
                                <button
                                  onClick={() => {
                                    if (item.customizationGroups && item.customizationGroups.length > 0) {
                                      onOpenDishCustomizer(item);
                                    } else if (itemsInCartForDish.length === 1) {
                                      onUpdateCartItemQty(itemsInCartForDish[0].cartItemId, 1);
                                    } else {
                                      onOpenDishCustomizer(item);
                                    }
                                  }}
                                  className="text-orange-600 hover:text-orange-700 font-bold p-0.5"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => onOpenDishCustomizer(item)}
                                className="w-full py-1.5 bg-white hover:bg-orange-50 text-orange-600 border border-orange-500 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1 transition-all active:scale-95"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>ADD</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar if items present */}
      {cartCount > 0 && (
        <div className="sticky bottom-4 z-40 max-w-2xl mx-auto w-full px-4">
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-4 text-white shadow-xl shadow-orange-600/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-orange-100">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} added
                </div>
                <div className="text-sm font-black">
                  ${cartSubtotal.toFixed(2)}
                </div>
              </div>
            </div>

            <button
              onClick={onOpenCart}
              className="px-5 py-2.5 rounded-xl bg-white text-orange-600 font-black text-xs hover:bg-orange-50 transition-colors shadow-sm"
            >
              View Cart & Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
