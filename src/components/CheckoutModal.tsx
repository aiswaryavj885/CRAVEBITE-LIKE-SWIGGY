import React, { useState } from 'react';
import {
  X,
  MapPin,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { DeliveryAddress, CartItem, Order } from '../types';
import { createOrder } from '../services/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currentAddress: DeliveryAddress | null;
  onOpenAddressModal: () => void;
  promoDetails?: { code: string; discount: number; freeDelivery: boolean };
  tip?: number;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currentAddress,
  onOpenAddressModal,
  promoDetails,
  tip = 2.00,
  onOrderSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'apple_pay' | 'upi'>('card');
  const [deliverySpeed, setDeliverySpeed] = useState<'standard' | 'priority'>('standard');
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('883');

  if (!isOpen || items.length === 0 || !currentAddress) return null;

  const restaurantId = items[0].item.restaurantId;
  const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);

  const baseDeliveryFee = subtotal >= 30 || promoDetails?.freeDelivery ? 0 : 2.99;
  const priorityExtraFee = deliverySpeed === 'priority' ? 1.99 : 0;
  const deliveryFee = baseDeliveryFee + priorityExtraFee;

  const platformFee = 1.49;
  const tax = Number((subtotal * 0.0825).toFixed(2));
  const discount = promoDetails?.discount || 0;
  const total = Math.max(0, subtotal + deliveryFee + platformFee + tax + tip - discount);

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const order = await createOrder({
        restaurantId,
        items,
        deliveryAddress: currentAddress,
        paymentMethod,
        promoCode: promoDetails?.code,
        tip,
        deliveryInstructions: instructions.trim() || undefined,
      });

      setIsSubmitting(false);
      onOrderSuccess(order);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to place order. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col my-8">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div>
            <h3 className="font-extrabold text-lg text-gray-900">Checkout</h3>
            <p className="text-xs text-gray-500 font-medium">Review delivery details and payment</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200/80 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
              {error}
            </div>
          )}

          {/* Section 1: Delivery Address */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                1. Delivery Address
              </span>
              <button
                onClick={onOpenAddressModal}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
              >
                Change Address
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-gray-900">
                    {currentAddress.label}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-200/70 text-orange-800">
                    Selected
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                  {currentAddress.addressLine1}
                  {currentAddress.addressLine2 && `, ${currentAddress.addressLine2}`}
                  {currentAddress.landmark && ` (Near ${currentAddress.landmark})`}
                </p>
                <span className="text-[11px] text-gray-500 font-medium">{currentAddress.city}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Speed */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">
              2. Delivery Speed
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setDeliverySpeed('standard')}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  deliverySpeed === 'standard'
                    ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">Standard</span>
                  <span className="text-xs font-extrabold text-emerald-600">
                    {baseDeliveryFee === 0 ? 'FREE' : `$${baseDeliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-500" />
                  25–35 mins
                </p>
              </div>

              <div
                onClick={() => setDeliverySpeed('priority')}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  deliverySpeed === 'priority'
                    ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">Priority Express</span>
                  <span className="text-xs font-extrabold text-orange-600">+$1.99</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-500" />
                  15–20 mins (Direct to you)
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Note */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700">
              Drop-off Instructions for Rider
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Leave by apartment door, ring bell twice, call upon arrival"
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-hidden focus:border-orange-500 bg-gray-50/50"
            />
          </div>

          {/* Section 3: Payment Method */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">
              3. Payment Method
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-orange-50 border-orange-500 text-orange-600 ring-1 ring-orange-500'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs font-bold">Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('apple_pay')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'apple_pay'
                    ? 'bg-orange-50 border-orange-500 text-orange-600 ring-1 ring-orange-500'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-xs font-bold">Apple Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'upi'
                    ? 'bg-orange-50 border-orange-500 text-orange-600 ring-1 ring-orange-500'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-xs font-bold">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'cod'
                    ? 'bg-orange-50 border-orange-500 text-orange-600 ring-1 ring-orange-500'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-xs font-bold">Cash on Delivery</span>
              </button>
            </div>

            {/* Simulated Card input if card selected */}
            {paymentMethod === 'card' && (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Card Information</span>
                  <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>256-bit Secure Encryption</span>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Card Number"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:border-orange-500"
                  />
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="CVV"
                    maxLength={4}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Final Total Callout */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-900 font-bold">Total Payable</span>
              <p className="text-[11px] text-amber-700">Includes all taxes, delivery and driver tip</p>
            </div>
            <span className="text-xl font-black text-gray-900">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-white">
          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-black text-base shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Placing your order with restaurant...</span>
              </>
            ) : (
              <>
                <span>Place Order • ${total.toFixed(2)}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
