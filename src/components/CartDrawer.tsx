import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  Check,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';
import { CartItem, PromoCode } from '../types';
import { validatePromoCode } from '../services/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOpenCheckout: (promoDetails?: { code: string; discount: number; freeDelivery: boolean }, tip?: number) => void;
  promos: PromoCode[];
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOpenCheckout,
  promos,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
    freeDelivery: boolean;
    message: string;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const [selectedTip, setSelectedTip] = useState<number>(2.00);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);

  // Delivery fee logic: Free if subtotal >= 30 or freeDelivery promo
  const standardDeliveryFee = 2.99;
  const isFreeDelivery = subtotal >= 30 || (appliedPromo && appliedPromo.freeDelivery);
  const deliveryFee = isFreeDelivery ? 0 : standardDeliveryFee;

  const platformFee = items.length > 0 ? 1.49 : 0;
  const tax = items.length > 0 ? Number((subtotal * 0.0825).toFixed(2)) : 0;
  const discount = appliedPromo ? appliedPromo.discount : 0;
  const total = Math.max(0, subtotal + deliveryFee + platformFee + tax + selectedTip - discount);

  const handleApplyPromo = async (codeToApply?: string) => {
    const code = codeToApply || promoInput;
    if (!code.trim()) return;

    setPromoLoading(true);
    setPromoError(null);

    try {
      const res = await validatePromoCode(code, subtotal);
      if (res.valid) {
        setAppliedPromo({
          code: code.toUpperCase(),
          discount: res.discount,
          freeDelivery: res.freeDelivery,
          message: res.message,
        });
        setPromoInput('');
      } else {
        setPromoError(res.message);
        setAppliedPromo(null);
      }
    } catch (err: any) {
      setPromoError(err.message || 'Error validating promo code');
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

  const handleProceed = () => {
    onOpenCheckout(
      appliedPromo
        ? {
            code: appliedPromo.code,
            discount: appliedPromo.discount,
            freeDelivery: appliedPromo.freeDelivery,
          }
        : undefined,
      selectedTip
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Your Cart</h3>
              <p className="text-[11px] text-gray-400 font-medium">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs font-semibold text-gray-400 hover:text-red-600 transition-colors px-2 py-1"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mb-4">
              <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h4 className="text-base font-bold text-gray-900">Your cart is empty</h4>
            <p className="text-xs text-gray-500 max-w-xs mt-1 mb-6">
              Looks like you haven't added anything to your cart yet. Explore delicious dishes from top restaurants!
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            {/* Free Delivery Goal Tracker */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-100/80">
              <div className="flex items-center justify-between text-xs font-bold text-orange-950 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  {isFreeDelivery ? '🎉 You have unlocked Free Delivery!' : `Add $${(30 - subtotal).toFixed(2)} more for Free Delivery`}
                </span>
                <span className="text-[11px] font-extrabold text-orange-600">
                  {isFreeDelivery ? 'FREE' : `$${subtotal.toFixed(2)} / $30`}
                </span>
              </div>
              <div className="w-full h-2 bg-orange-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (subtotal / 30) * 100)}%` }}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Order Items
              </h4>

              {items.map((cartItem) => (
                <div
                  key={cartItem.cartItemId}
                  className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-start justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-xs border flex items-center justify-center shrink-0 ${
                          cartItem.item.dietary === 'veg' || cartItem.item.dietary === 'vegan'
                            ? 'border-emerald-600'
                            : 'border-red-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cartItem.item.dietary === 'veg' || cartItem.item.dietary === 'vegan'
                              ? 'bg-emerald-600'
                              : 'bg-red-600'
                          }`}
                        />
                      </span>
                      <h5 className="font-bold text-xs text-gray-900 leading-snug">
                        {cartItem.item.name}
                      </h5>
                    </div>

                    {/* Customizations tags */}
                    {cartItem.selectedCustomizations.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {cartItem.selectedCustomizations.map((c) => (
                          <span
                            key={c.optionId}
                            className="text-[10px] bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded-md"
                          >
                            {c.name} {c.price > 0 && `(+$${c.price.toFixed(2)})`}
                          </span>
                        ))}
                      </div>
                    )}

                    {cartItem.specialInstructions && (
                      <p className="text-[10px] italic text-gray-500 mt-1">
                        Note: {cartItem.specialInstructions}
                      </p>
                    )}

                    <div className="text-xs font-extrabold text-gray-900 mt-1.5">
                      ${cartItem.itemTotal.toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1 shadow-2xs">
                    <button
                      onClick={() => onUpdateQty(cartItem.cartItemId, -1)}
                      className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
                    >
                      {cartItem.quantity === 1 ? (
                        <Trash2 className="w-3 h-3 text-red-500" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                    </button>
                    <span className="w-5 text-center text-xs font-black text-gray-800">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQty(cartItem.cartItemId, 1)}
                      className="w-6 h-6 rounded-lg bg-orange-50 hover:bg-orange-100 flex items-center justify-center text-orange-600 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Input & Badges */}
            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-orange-500" />
                <span>Offers & Coupons</span>
              </h4>

              {appliedPromo ? (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-emerald-800">
                        {appliedPromo.code} applied!
                      </span>
                      <p className="text-[11px] text-emerald-600">
                        Saved ${appliedPromo.discount.toFixed(2)} on this order
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="text-xs font-bold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="Enter promo code"
                      className="flex-1 px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-gray-200 focus:outline-hidden focus:border-orange-500"
                    />
                    <button
                      onClick={() => handleApplyPromo()}
                      disabled={promoLoading || !promoInput.trim()}
                      className="px-4 py-2 bg-gray-900 hover:bg-black disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      {promoLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </div>

                  {promoError && (
                    <p className="text-xs text-red-600 font-semibold">{promoError}</p>
                  )}

                  {/* Quick-apply chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {promos.map((p) => (
                      <button
                        key={p.code}
                        onClick={() => handleApplyPromo(p.code)}
                        className="px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-[10px] font-bold border border-orange-200 transition-colors"
                      >
                        {p.code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Tip */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-orange-500" />
                  Tip your delivery partner
                </span>
                <span className="text-[11px] text-gray-400">100% goes to driver</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0, 2, 3, 5].map((tipVal) => (
                  <button
                    key={tipVal}
                    onClick={() => setSelectedTip(tipVal)}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedTip === tipVal
                        ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tipVal === 0 ? 'Not now' : `$${tipVal}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Bill Details */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
              <h4 className="font-bold text-gray-900 text-xs mb-2">Bill Summary</h4>

              <div className="flex justify-between text-gray-600">
                <span>Item Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Delivery Partner Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `$${deliveryFee.toFixed(2)}`}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Platform Fee</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Taxes & Charges (8.25%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              {selectedTip > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Driver Tip</span>
                  <span>${selectedTip.toFixed(2)}</span>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold pt-1 border-t border-gray-200">
                  <span>Promo Discount ({appliedPromo?.code})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-900 font-black text-sm pt-2 border-t border-gray-200">
                <span>To Pay</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Checkout Button */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-white">
            <button
              onClick={handleProceed}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-xl shadow-orange-500/25 flex items-center justify-between transition-all active:scale-[0.99]"
            >
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] text-orange-100 uppercase font-semibold">Total Amount</span>
                <span className="text-base font-black">${total.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold">
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
