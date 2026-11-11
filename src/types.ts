export type DietaryType = 'veg' | 'non-veg' | 'vegan';

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

export interface CustomizationGroup {
  id: string;
  title: string;
  type: 'radio' | 'checkbox';
  required?: boolean;
  options: CustomizationOption[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  dietary: DietaryType;
  isBestseller?: boolean;
  isSpicy?: boolean;
  rating: number;
  ratingCount: number;
  customizationGroups?: CustomizationGroup[];
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  cuisine: string[];
  rating: number;
  ratingCount: number;
  deliveryTimeMinutes: number; // e.g. 25
  distanceKm: number;
  priceForTwo: number;
  bannerImage: string;
  logoImage: string;
  isPureVeg: boolean;
  isPromoted?: boolean;
  offers: string[];
  address: string;
  phone: string;
  isOpen: boolean;
  featuredDishes?: string[];
  tags: string[];
}

export interface SelectedCustomization {
  groupId: string;
  groupTitle: string;
  optionId: string;
  name: string;
  price: number;
}

export interface CartItem {
  cartItemId: string; // unique key (dishId + customizations)
  item: MenuItem;
  quantity: number;
  selectedCustomizations: SelectedCustomization[];
  itemTotal: number;
  specialInstructions?: string;
}

export interface DeliveryAddress {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  isDefault?: boolean;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export interface DriverInfo {
  name: string;
  phone: string;
  rating: number;
  vehicle: string;
  photo: string;
  progressPercent: number; // 0 to 100
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurant: {
    id: string;
    name: string;
    bannerImage: string;
    address: string;
    phone: string;
  };
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  discount: number;
  tip: number;
  total: number;
  promoCode?: string;
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'card' | 'cod' | 'apple_pay' | 'upi';
  status: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: string; message: string }[];
  createdAt: string;
  estimatedDeliveryTime: string;
  driverInfo?: DriverInfo;
  deliveryInstructions?: string;
}

export interface PromoCode {
  code: string;
  description: string;
  discountPercent: number;
  maxDiscount: number;
  minOrderValue: number;
  freeDelivery?: boolean;
}
