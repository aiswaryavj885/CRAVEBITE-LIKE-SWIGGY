import React from 'react';
import { X, Clock, CheckCircle2, RotateCcw, ArrowRight, ShoppingBag } from 'lucide-react';
import { Order, CartItem } from '../types';

interface OrdersHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onTrackOrder: (order: Order) => void;
  onReorder: (items: CartItem[]) => void;
}

export const OrdersHistoryModal: React.FC<OrdersHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onTrackOrder,
  onReorder,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col my-8">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Your Orders</h3>
              <p className="text-xs text-gray-400 font-medium">{orders.length} orders placed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200/80 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[70vh] space-y-4">
          {orders.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400 mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-gray-800">No orders yet</h4>
              <p className="text-xs text-gray-400 mt-1">When you place orders, they will show up here.</p>
            </div>
          ) : (
            orders.map((order) => {
              const isActive = order.status !== 'delivered' && order.status !== 'cancelled';
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs space-y-3 hover:border-gray-300 transition-colors"
                >
                  {/* Restaurant & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img
                          src={order.restaurant.bannerImage}
                          alt={order.restaurant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-900">
                          {order.restaurant.name}
                        </h4>
                        <span className="text-[11px] text-gray-400 font-medium">
                          {formattedDate} • {order.orderNumber}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="text-xs text-gray-600 line-clamp-1">
                    {order.items.map((i) => `${i.quantity}x ${i.item.name}`).join(', ')}
                  </div>

                  {/* Card bottom: Total & Actions */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xs font-black text-gray-900">
                      Total: ${order.total.toFixed(2)}
                    </div>

                    <div className="flex items-center gap-2">
                      {isActive ? (
                        <button
                          onClick={() => {
                            onTrackOrder(order);
                            onClose();
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                        >
                          <span>Track Live</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              onTrackOrder(order);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => {
                              onReorder(order.items);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reorder</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
