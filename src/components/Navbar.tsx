import React from 'react';
import {
  MapPin,
  Search,
  ShoppingBag,
  Clock,
  Sparkles,
  ChevronDown,
  X,
  Flame,
} from 'lucide-react';
import { DeliveryAddress, Order } from '../types';

interface NavbarProps {
  currentAddress: DeliveryAddress | null;
  onOpenAddressModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
  orders: Order[];
  onOpenOrders: () => void;
  onOpenLiveOrder: (order: Order) => void;
  isVegOnly: boolean;
  onToggleVegOnly: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentAddress,
  onOpenAddressModal,
  searchQuery,
  onSearchChange,
  cartCount,
  cartSubtotal,
  onOpenCart,
  orders,
  onOpenOrders,
  onOpenLiveOrder,
  isVegOnly,
  onToggleVegOnly,
}) => {
  // Check if there is an active order in progress
  const activeOrder = orders.find(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-md shadow-orange-500/25">
                <Flame className="w-6 h-6 text-white fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 flex items-center gap-1">
                  Crave<span className="text-orange-500">Bite</span>
                </span>
                <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase -mt-1 hidden sm:inline">
                  MERN Food Delivery
                </span>
              </div>
            </div>

            {/* Address Selector */}
            <div className="hidden md:flex items-center pl-3 border-l border-gray-200">
              <button
                onClick={onOpenAddressModal}
                className="flex items-center gap-1.5 text-left py-1 px-2.5 rounded-lg hover:bg-gray-100/80 transition-colors group"
              >
                <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-105 transition-transform">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-800">
                    <span>{currentAddress?.label || 'Deliver to'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 transition-colors" />
                  </div>
                  <span className="text-[11px] text-gray-500 truncate max-w-[170px]">
                    {currentAddress ? `${currentAddress.addressLine1}, ${currentAddress.city}` : 'Select location'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search for restaurants, cuisines, pizzas, biryani..."
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-gray-100/80 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-orange-500 rounded-full focus:outline-hidden transition-all duration-200 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Veg toggle */}
            <button
              onClick={onToggleVegOnly}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isVegOnly
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isVegOnly ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-gray-300'
                }`}
              />
              <span>Pure Veg</span>
            </button>

            {/* Live Order Tracker Trigger if active */}
            {activeOrder ? (
              <button
                onClick={() => onOpenLiveOrder(activeOrder)}
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-xs font-bold shadow-md shadow-amber-500/20 transition-all animate-pulse"
                title="Track Active Order"
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Track Order</span>
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              </button>
            ) : (
              <button
                onClick={onOpenOrders}
                className="p-2 sm:px-3 sm:py-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-1.5 text-xs font-semibold transition-colors"
                title="Order History"
              >
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="hidden md:inline">Orders</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl shadow-md shadow-orange-500/25 transition-all duration-200 active:scale-95"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[10px] font-medium opacity-90">Cart</span>
                <span className="text-xs font-bold">
                  {cartSubtotal > 0 ? `$${cartSubtotal.toFixed(2)}` : 'Empty'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Address Bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-gray-100 text-xs">
          <button
            onClick={onOpenAddressModal}
            className="flex items-center gap-1.5 text-gray-700 truncate"
          >
            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="font-bold text-gray-900">{currentAddress?.label || 'Deliver to'}:</span>
            <span className="text-gray-500 truncate">
              {currentAddress ? `${currentAddress.addressLine1}` : 'Tap to set address'}
            </span>
          </button>
          <button
            onClick={onToggleVegOnly}
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              isVegOnly ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-gray-100 border-gray-200 text-gray-600'
            }`}
          >
            {isVegOnly ? '🥬 Veg Only' : 'All Foods'}
          </button>
        </div>
      </div>
    </header>
  );
};
