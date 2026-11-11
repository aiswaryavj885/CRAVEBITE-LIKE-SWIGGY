import {
  Restaurant,
  MenuItem,
  Order,
  OrderStatus,
  PromoCode,
  DeliveryAddress,
  CartItem,
} from '../src/types';
import {
  INITIAL_RESTAURANTS,
  INITIAL_MENU_ITEMS,
  PROMO_CODES,
  INITIAL_ADDRESSES,
} from './mockData';

class FoodDeliveryStore {
  private restaurants: Restaurant[] = [...INITIAL_RESTAURANTS];
  private menuItems: MenuItem[] = [...INITIAL_MENU_ITEMS];
  private promoCodes: PromoCode[] = [...PROMO_CODES];
  private addresses: DeliveryAddress[] = [...INITIAL_ADDRESSES];
  private orders: Order[] = [];

  constructor() {
    // Seed one initial completed demo order so the user sees order history immediately
    const sampleCartItem: CartItem = {
      cartItemId: 'item-101-sample',
      item: this.menuItems[0],
      quantity: 1,
      selectedCustomizations: [
        {
          groupId: 'size',
          groupTitle: 'Choose Crust Size',
          optionId: 'size-12',
          name: 'Large 12" (Serves 2)',
          price: 3.50,
        },
      ],
      itemTotal: 18.00,
    };

    const initialOrder: Order = {
      id: 'ord-1001',
      orderNumber: 'CB-84920',
      restaurant: {
        id: this.restaurants[0].id,
        name: this.restaurants[0].name,
        bannerImage: this.restaurants[0].bannerImage,
        address: this.restaurants[0].address,
        phone: this.restaurants[0].phone,
      },
      items: [sampleCartItem],
      subtotal: 18.00,
      deliveryFee: 0,
      platformFee: 1.50,
      tax: 1.44,
      discount: 3.60,
      tip: 2.00,
      total: 19.34,
      promoCode: 'TASTY20',
      deliveryAddress: this.addresses[0],
      paymentMethod: 'card',
      status: 'delivered',
      statusHistory: [
        { status: 'placed', timestamp: new Date(Date.now() - 3600000).toISOString(), message: 'Order placed successfully' },
        { status: 'confirmed', timestamp: new Date(Date.now() - 3500000).toISOString(), message: 'Restaurant confirmed your order' },
        { status: 'preparing', timestamp: new Date(Date.now() - 3200000).toISOString(), message: 'Chef is cooking your fresh pizza' },
        { status: 'on_the_way', timestamp: new Date(Date.now() - 2000000).toISOString(), message: 'Driver picked up your order' },
        { status: 'delivered', timestamp: new Date(Date.now() - 1000000).toISOString(), message: 'Delivered to your door. Enjoy!' },
      ],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      estimatedDeliveryTime: 'Delivered',
      driverInfo: {
        name: 'Alex Rivera',
        phone: '+1 (555) 948-2819',
        rating: 4.9,
        vehicle: 'Vespa Sprint 150 (Silver)',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        progressPercent: 100,
      },
    };

    this.orders.push(initialOrder);
  }

  public getRestaurants(filters?: {
    search?: string;
    category?: string;
    isVegOnly?: boolean;
    minRating?: number;
    maxDeliveryTime?: number;
    sortBy?: string;
  }): Restaurant[] {
    let list = [...this.restaurants];

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter((r) => {
        const nameMatch = r.name.toLowerCase().includes(q);
        const cuisineMatch = r.cuisine.some((c) => c.toLowerCase().includes(q));
        const tagMatch = r.tags.some((t) => t.toLowerCase().includes(q));
        // Check if any dish in restaurant matches search
        const dishMatch = this.menuItems
          .filter((item) => item.restaurantId === r.id)
          .some((item) => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
        return nameMatch || cuisineMatch || tagMatch || dishMatch;
      });
    }

    if (filters?.category && filters.category !== 'All') {
      const cat = filters.category.toLowerCase();
      list = list.filter((r) => {
        const cuisineMatch = r.cuisine.some((c) => c.toLowerCase() === cat);
        const dishCategoryMatch = this.menuItems
          .filter((item) => item.restaurantId === r.id)
          .some((item) => item.category.toLowerCase().includes(cat));
        return cuisineMatch || dishCategoryMatch;
      });
    }

    if (filters?.isVegOnly) {
      list = list.filter((r) => {
        if (r.isPureVeg) return true;
        // Or if restaurant has veg dishes
        return this.menuItems.some((item) => item.restaurantId === r.id && (item.dietary === 'veg' || item.dietary === 'vegan'));
      });
    }

    if (filters?.minRating) {
      list = list.filter((r) => r.rating >= (filters.minRating || 0));
    }

    if (filters?.maxDeliveryTime) {
      list = list.filter((r) => r.deliveryTimeMinutes <= (filters.maxDeliveryTime || 60));
    }

    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'rating':
          list.sort((a, b) => b.rating - a.rating);
          break;
        case 'deliveryTime':
          list.sort((a, b) => a.deliveryTimeMinutes - b.deliveryTimeMinutes);
          break;
        case 'priceLowToHigh':
          list.sort((a, b) => a.priceForTwo - b.priceForTwo);
          break;
        case 'priceHighToLow':
          list.sort((a, b) => b.priceForTwo - a.priceForTwo);
          break;
        default:
          // 'relevance' - promoted first, then rating
          list.sort((a, b) => {
            if (a.isPromoted && !b.isPromoted) return -1;
            if (!a.isPromoted && b.isPromoted) return 1;
            return b.rating - a.rating;
          });
      }
    }

    return list;
  }

  public getRestaurantById(id: string): { restaurant: Restaurant; menu: MenuItem[]; categories: string[] } | null {
    const restaurant = this.restaurants.find((r) => r.id === id);
    if (!restaurant) return null;

    const menu = this.menuItems.filter((item) => item.restaurantId === id);
    const categories = Array.from(new Set(menu.map((item) => item.category)));

    return { restaurant, menu, categories };
  }

  public getCategories(): { id: string; name: string; count: number; image: string }[] {
    const categoriesMap = new Map<string, number>();

    this.menuItems.forEach((item) => {
      categoriesMap.set(item.category, (categoriesMap.get(item.category) || 0) + 1);
    });

    const categoryImages: Record<string, string> = {
      Pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80',
      Burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80',
      'Sushi Rolls': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=300&q=80',
      Ramen: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=300&q=80',
      Biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80',
      Curries: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=300&q=80',
      Bowls: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80',
      Tacos: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=300&q=80',
      Pasta: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=300&q=80',
      Desserts: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=300&q=80',
      'Sides & Fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=300&q=80',
      Shakes: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=300&q=80',
    };

    return Array.from(categoriesMap.entries()).map(([name, count]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      count,
      image: categoryImages[name] || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80',
    }));
  }

  public validatePromo(code: string, subtotal: number): { valid: boolean; discount: number; freeDelivery: boolean; message: string; promo?: PromoCode } {
    const promo = this.promoCodes.find((p) => p.code.toUpperCase() === code.toUpperCase().trim());
    if (!promo) {
      return { valid: false, discount: 0, freeDelivery: false, message: 'Invalid promo code' };
    }

    if (subtotal < promo.minOrderValue) {
      return {
        valid: false,
        discount: 0,
        freeDelivery: false,
        message: `Minimum order of $${promo.minOrderValue.toFixed(2)} required for code ${promo.code}`,
      };
    }

    let discount = 0;
    if (promo.discountPercent > 0) {
      discount = Math.min((subtotal * promo.discountPercent) / 100, promo.maxDiscount);
    }

    return {
      valid: true,
      discount: Number(discount.toFixed(2)),
      freeDelivery: !!promo.freeDelivery,
      message: `Promo code ${promo.code} applied successfully!`,
      promo,
    };
  }

  public getPromoCodes(): PromoCode[] {
    return this.promoCodes;
  }

  public getAddresses(): DeliveryAddress[] {
    return this.addresses;
  }

  public addAddress(address: Omit<DeliveryAddress, 'id'>): DeliveryAddress {
    const newAddr: DeliveryAddress = {
      ...address,
      id: `addr-${Date.now()}`,
    };
    if (newAddr.isDefault) {
      this.addresses.forEach((a) => (a.isDefault = false));
    }
    this.addresses.push(newAddr);
    return newAddr;
  }

  public createOrder(payload: {
    restaurantId: string;
    items: CartItem[];
    deliveryAddress: DeliveryAddress;
    paymentMethod: 'card' | 'cod' | 'apple_pay' | 'upi';
    promoCode?: string;
    tip?: number;
    deliveryInstructions?: string;
  }): Order {
    const restaurant = this.restaurants.find((r) => r.id === payload.restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    const subtotal = payload.items.reduce((sum, item) => sum + item.itemTotal, 0);

    let deliveryFee = subtotal >= 30 ? 0 : 2.99;
    let discount = 0;

    if (payload.promoCode) {
      const promoResult = this.validatePromo(payload.promoCode, subtotal);
      if (promoResult.valid) {
        discount = promoResult.discount;
        if (promoResult.freeDelivery) {
          deliveryFee = 0;
        }
      }
    }

    const platformFee = 1.49;
    const tax = Number((subtotal * 0.0825).toFixed(2));
    const tip = payload.tip || 0;
    const total = Number(Math.max(0, subtotal + deliveryFee + platformFee + tax + tip - discount).toFixed(2));

    const drivers = [
      { name: 'Jordan Hayes', phone: '+1 (555) 302-8841', rating: 4.9, vehicle: 'Yamaha Zuma 125 (Black)', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
      { name: 'Maria Santos', phone: '+1 (555) 441-2910', rating: 4.8, vehicle: 'Honda Metropolitan (Red)', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' },
      { name: 'David Kim', phone: '+1 (555) 789-4123', rating: 5.0, vehicle: 'Trek E-Cargo Bike (Blue)', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
    ];
    const assignedDriver = drivers[Math.floor(Math.random() * drivers.length)];

    const now = new Date();
    const orderNumber = `CB-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        bannerImage: restaurant.bannerImage,
        address: restaurant.address,
        phone: restaurant.phone,
      },
      items: payload.items,
      subtotal: Number(subtotal.toFixed(2)),
      deliveryFee: Number(deliveryFee.toFixed(2)),
      platformFee,
      tax,
      discount: Number(discount.toFixed(2)),
      tip,
      total,
      promoCode: payload.promoCode,
      deliveryAddress: payload.deliveryAddress,
      paymentMethod: payload.paymentMethod,
      status: 'placed',
      statusHistory: [
        {
          status: 'placed',
          timestamp: now.toISOString(),
          message: 'Order placed & sent to restaurant',
        },
      ],
      createdAt: now.toISOString(),
      estimatedDeliveryTime: `${restaurant.deliveryTimeMinutes} mins`,
      driverInfo: {
        ...assignedDriver,
        progressPercent: 5,
      },
      deliveryInstructions: payload.deliveryInstructions,
    };

    this.orders.unshift(newOrder);
    return newOrder;
  }

  public getOrders(): Order[] {
    // Dynamically update active orders simulation before returning
    this.orders.forEach((o) => this.updateOrderSimulation(o));
    return this.orders;
  }

  public getOrderById(id: string): Order | null {
    const order = this.orders.find((o) => o.id === id);
    if (!order) return null;
    this.updateOrderSimulation(order);
    return order;
  }

  public cancelOrder(id: string): { success: boolean; message: string; order?: Order } {
    const order = this.orders.find((o) => o.id === id);
    if (!order) return { success: false, message: 'Order not found' };

    if (order.status === 'delivered') {
      return { success: false, message: 'Delivered orders cannot be cancelled' };
    }
    if (order.status === 'on_the_way') {
      return { success: false, message: 'Driver is already on the way' };
    }

    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      message: 'Order cancelled by user',
    });

    return { success: true, message: 'Order cancelled successfully', order };
  }

  private updateOrderSimulation(order: Order) {
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return;
    }

    const elapsedSeconds = (Date.now() - new Date(order.createdAt).getTime()) / 1000;

    // Simulation schedule:
    // 0 - 8s: 'placed'
    // 8 - 20s: 'confirmed'
    // 20 - 45s: 'preparing'
    // 45 - 80s: 'on_the_way'
    // 80s+: 'delivered'

    if (elapsedSeconds >= 80) {
      order.status = 'delivered';
      if (order.driverInfo) order.driverInfo.progressPercent = 100;
      order.estimatedDeliveryTime = 'Delivered';
      if (!order.statusHistory.some((h) => h.status === 'delivered')) {
        order.statusHistory.push({
          status: 'delivered',
          timestamp: new Date().toISOString(),
          message: 'Package handed over. Bon appétit!',
        });
      }
    } else if (elapsedSeconds >= 45 && order.status !== 'on_the_way') {
      order.status = 'on_the_way';
      const travelProgress = Math.min(95, 30 + Math.round(((elapsedSeconds - 45) / 35) * 65));
      if (order.driverInfo) order.driverInfo.progressPercent = travelProgress;
      order.estimatedDeliveryTime = `${Math.max(2, Math.round((80 - elapsedSeconds) / 6))} mins`;
      if (!order.statusHistory.some((h) => h.status === 'on_the_way')) {
        order.statusHistory.push({
          status: 'on_the_way',
          timestamp: new Date().toISOString(),
          message: `${order.driverInfo?.name || 'Driver'} picked up your order and is riding to you`,
        });
      }
    } else if (elapsedSeconds >= 20 && order.status !== 'preparing' && order.status !== 'on_the_way') {
      order.status = 'preparing';
      if (order.driverInfo) order.driverInfo.progressPercent = 20;
      if (!order.statusHistory.some((h) => h.status === 'preparing')) {
        order.statusHistory.push({
          status: 'preparing',
          timestamp: new Date().toISOString(),
          message: 'Kitchen is preparing your food with fresh ingredients',
        });
      }
    } else if (elapsedSeconds >= 8 && order.status === 'placed') {
      order.status = 'confirmed';
      if (order.driverInfo) order.driverInfo.progressPercent = 10;
      if (!order.statusHistory.some((h) => h.status === 'confirmed')) {
        order.statusHistory.push({
          status: 'confirmed',
          timestamp: new Date().toISOString(),
          message: 'Restaurant accepted your order',
        });
      }
    } else if (order.status === 'on_the_way') {
      const travelProgress = Math.min(95, 30 + Math.round(((elapsedSeconds - 45) / 35) * 65));
      if (order.driverInfo) order.driverInfo.progressPercent = travelProgress;
      order.estimatedDeliveryTime = `${Math.max(2, Math.round((80 - elapsedSeconds) / 6))} mins`;
    }
  }
}

export const store = new FoodDeliveryStore();
