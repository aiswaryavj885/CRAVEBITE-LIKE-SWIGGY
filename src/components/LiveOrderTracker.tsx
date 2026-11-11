import React, { useEffect, useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Phone,
  Bike,
  Store,
  MapPin,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { fetchOrderById, cancelOrder } from '../services/api';

interface LiveOrderTrackerProps {
  orderId: string;
  onClose: () => void;
  onOrderUpdated?: (order: Order) => void;
}

export const LiveOrderTracker: React.FC<LiveOrderTrackerProps> = ({
  orderId,
  onClose,
  onOrderUpdated,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [callActive, setCallActive] = useState(false);

  // Poll for live updates every 3.5 seconds
  useEffect(() => {
    let isMounted = true;

    const loadOrder = async () => {
      try {
        const updated = await fetchOrderById(orderId);
        if (isMounted) {
          setOrder(updated);
          setLoading(false);
          if (onOrderUpdated) onOrderUpdated(updated);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setLoading(false);
      }
    };

    loadOrder();

    const interval = setInterval(loadOrder, 3500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orderId, onOrderUpdated]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    setCancelMessage(null);

    try {
      const res = await cancelOrder(order.id);
      if (res.success && res.order) {
        setOrder(res.order);
        if (onOrderUpdated) onOrderUpdated(res.order);
        setCancelMessage('Order was cancelled successfully.');
      } else {
        setCancelMessage(res.message);
      }
    } catch (err: any) {
      setCancelMessage(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleSimulateCall = () => {
    setCallActive(true);
    setTimeout(() => {
      setCallActive(false);
    }, 4000);
  };

  if (loading || !order) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
          <h4 className="font-extrabold text-gray-900 text-sm">Connecting to Live Tracking...</h4>
        </div>
      </div>
    );
  }

  // Steps configuration
  const steps: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'placed', label: 'Order Placed', desc: 'Sent to restaurant' },
    { status: 'confirmed', label: 'Confirmed', desc: 'Kitchen acknowledged' },
    { status: 'preparing', label: 'Kitchen Preparing', desc: 'Freshly cooking' },
    { status: 'on_the_way', label: 'On The Way', desc: 'Rider en route' },
    { status: 'delivered', label: 'Delivered', desc: 'Handed over' },
  ];

  const statusOrder: OrderStatus[] = ['placed', 'confirmed', 'preparing', 'on_the_way', 'delivered'];
  const currentStepIndex = statusOrder.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  // Driver progress percentage (0 - 100)
  const progressPercent = order.driverInfo?.progressPercent || (currentStepIndex / 4) * 100;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col my-6">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Bike className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base">Live Order Tracking</h3>
                <span className="text-xs bg-white/25 px-2 py-0.5 rounded-full font-mono font-bold">
                  {order.orderNumber}
                </span>
              </div>
              <p className="text-xs text-orange-100 font-medium">
                From {order.restaurant.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Call Banner Alert */}
        {callActive && (
          <div className="p-3 bg-emerald-600 text-white text-xs font-bold flex items-center justify-between px-6 animate-pulse">
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 animate-bounce" />
              Calling {order.driverInfo?.name} ({order.driverInfo?.phone})...
            </span>
            <span className="text-[11px] underline cursor-pointer" onClick={() => setCallActive(false)}>
              End
            </span>
          </div>
        )}

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {cancelMessage && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{cancelMessage}</span>
            </div>
          )}

          {/* Simulated Live Map Route */}
          {!isCancelled && (
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-5 text-white shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                    Live GPS Route
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 font-medium">Estimated Arrival</div>
                  <div className="text-sm font-black text-amber-300">
                    {order.status === 'delivered' ? 'Delivered' : order.estimatedDeliveryTime}
                  </div>
                </div>
              </div>

              {/* Graphical Route Track */}
              <div className="py-6 px-4 relative">
                {/* Background Route Road */}
                <div className="h-3 bg-slate-800 rounded-full relative overflow-hidden">
                  {/* Road centerline dashes */}
                  <div className="absolute inset-0 flex items-center justify-between px-2">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <div key={i} className="w-3 h-0.5 bg-slate-700/80 rounded-full" />
                    ))}
                  </div>

                  {/* Filled traveled track */}
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Pins on the road */}
                <div className="flex items-center justify-between -mt-8 relative pointer-events-none">
                  {/* Restaurant pin */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-600/50 border-2 border-white">
                      <Store className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-300 mt-1 max-w-[80px] text-center truncate">
                      {order.restaurant.name}
                    </span>
                  </div>

                  {/* Delivery destination pin */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/50 border-2 border-white">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-300 mt-1">
                      {order.deliveryAddress.label}
                    </span>
                  </div>
                </div>

                {/* Moving Rider Icon */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out flex flex-col items-center"
                  style={{ left: `calc(${progressPercent}% - 18px)` }}
                >
                  <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-400/50 border-2 border-white ring-4 ring-amber-400/20 animate-bounce">
                    <Bike className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="mt-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-between text-xs">
                <span className="text-gray-300">
                  {order.statusHistory[order.statusHistory.length - 1]?.message || 'Order processing...'}
                </span>
                <span className="text-[11px] font-bold text-orange-400">
                  {progressPercent}% Complete
                </span>
              </div>
            </div>
          )}

          {/* Stepper Progress */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Delivery Milestones
            </h4>

            {isCancelled ? (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-bold text-xs flex items-center gap-2">
                <X className="w-4 h-4" />
                <span>This order was cancelled</span>
              </div>
            ) : (
              <div className="space-y-4 relative pl-6 border-l-2 border-gray-200">
                {steps.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={step.status} className="relative">
                      {/* Milestone Dot */}
                      <div
                        className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white transition-all ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-gray-400" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-extrabold ${
                              isCurrent
                                ? 'text-orange-600'
                                : isDone
                                ? 'text-gray-900'
                                : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black uppercase animate-pulse">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Assigned Driver Card */}
          {order.driverInfo && !isCancelled && (
            <div className="p-4 rounded-3xl bg-gray-50 border border-gray-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-200 shrink-0 shadow-xs">
                  <img
                    src={order.driverInfo.photo}
                    alt={order.driverInfo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-gray-900">
                      {order.driverInfo.name}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      ★ {order.driverInfo.rating}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{order.driverInfo.vehicle}</p>
                </div>
              </div>

              <button
                onClick={handleSimulateCall}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Rider</span>
              </button>
            </div>
          )}

          {/* Ordered Items Summary */}
          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/70 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-gray-900 mb-2">
              <span>Order Summary ({order.items.length} items)</span>
              <span>Paid: ${order.total.toFixed(2)}</span>
            </div>

            <div className="divide-y divide-gray-100">
              {order.items.map((cartItem) => (
                <div key={cartItem.cartItemId} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">
                      {cartItem.quantity}x
                    </span>
                    <span className="text-gray-700">{cartItem.item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    ${cartItem.itemTotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-200 flex justify-between text-gray-500 text-[11px]">
              <span>Delivering to {order.deliveryAddress.addressLine1}</span>
              <span className="font-bold text-gray-700 capitalize">
                Paid via {order.paymentMethod.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          {order.status === 'placed' || order.status === 'confirmed' ? (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-4 py-2 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold transition-colors"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          ) : (
            <span className="text-xs text-gray-400 font-medium">
              Live updates enabled
            </span>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-colors"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
