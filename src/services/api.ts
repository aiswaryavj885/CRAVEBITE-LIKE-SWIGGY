import { Restaurant, MenuItem, PromoCode, DeliveryAddress, Order, CartItem } from '../types';

const API_BASE = '/api';

export async function fetchRestaurants(params?: {
  search?: string;
  category?: string;
  isVegOnly?: boolean;
  minRating?: number;
  maxDeliveryTime?: number;
  sortBy?: string;
}): Promise<Restaurant[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.category) query.append('category', params.category);
  if (params?.isVegOnly) query.append('isVegOnly', 'true');
  if (params?.minRating) query.append('minRating', params.minRating.toString());
  if (params?.maxDeliveryTime) query.append('maxDeliveryTime', params.maxDeliveryTime.toString());
  if (params?.sortBy) query.append('sortBy', params.sortBy);

  const res = await fetch(`${API_BASE}/restaurants?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch restaurants');
  const json = await res.json();
  return json.data || [];
}

export async function fetchRestaurantDetails(id: string): Promise<{
  restaurant: Restaurant;
  menu: MenuItem[];
  categories: string[];
}> {
  const res = await fetch(`${API_BASE}/restaurants/${id}`);
  if (!res.ok) throw new Error('Failed to fetch restaurant details');
  const json = await res.json();
  return json.data;
}

export async function fetchCategories(): Promise<{ id: string; name: string; count: number; image: string }[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  const json = await res.json();
  return json.data || [];
}

export async function fetchPromos(): Promise<PromoCode[]> {
  const res = await fetch(`${API_BASE}/promos`);
  if (!res.ok) throw new Error('Failed to fetch promos');
  const json = await res.json();
  return json.data || [];
}

export async function validatePromoCode(code: string, subtotal: number): Promise<{
  valid: boolean;
  discount: number;
  freeDelivery: boolean;
  message: string;
  promo?: PromoCode;
}> {
  const res = await fetch(`${API_BASE}/promos/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, subtotal }),
  });
  return res.json();
}

export async function fetchAddresses(): Promise<DeliveryAddress[]> {
  const res = await fetch(`${API_BASE}/addresses`);
  if (!res.ok) throw new Error('Failed to fetch addresses');
  const json = await res.json();
  return json.data || [];
}

export async function saveAddress(addr: Omit<DeliveryAddress, 'id'>): Promise<DeliveryAddress> {
  const res = await fetch(`${API_BASE}/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(addr),
  });
  if (!res.ok) throw new Error('Failed to save address');
  const json = await res.json();
  return json.data;
}

export async function createOrder(payload: {
  restaurantId: string;
  items: CartItem[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'card' | 'cod' | 'apple_pay' | 'upi';
  promoCode?: string;
  tip?: number;
  deliveryInstructions?: string;
}): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to place order');
  }
  const json = await res.json();
  return json.data;
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/orders`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  const json = await res.json();
  return json.data || [];
}

export async function fetchOrderById(id: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}`);
  if (!res.ok) throw new Error('Failed to fetch order');
  const json = await res.json();
  return json.data;
}

export async function cancelOrder(id: string): Promise<{ success: boolean; message: string; order?: Order }> {
  const res = await fetch(`${API_BASE}/orders/${id}/cancel`, {
    method: 'PATCH',
  });
  return res.json();
}
