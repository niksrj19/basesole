export type Role = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: Role;
  preferredSize?: number;
  phoneNumber?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface Address {
  id: string;
  userId: string;
  recipientName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  price: number;
  comparePrice?: number;
  description: string;
  gender: 'Men' | 'Women' | 'Unisex';
  images: string[];
  colors: string[];
  sizes: number[];
  stock: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  featured: boolean;
  createdAt: string;
  specs?: {
    material: string;
    cushioning: string;
    weight: string;
    origin: string;
  };
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  size: number;
  color: string;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_VERIFIED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Pick<Product, 'name' | 'images'>;
  productName: string;
  productImage: string;
  quantity: number;
  size: number;
  color: string;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentDetails {
  id: string;
  orderId: string;
  method: 'QR_CODE';
  qrPayload: string;
  qrDataUrl?: string;
  status: PaymentStatus;
  amount: number;
  transactionRef?: string;
  paidAt?: string;
}

export interface PublishedPaymentQR {
  qrCodeUrl: string;
  upiId: string;
  merchantName: string;
  instructions: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  shippingAddress?: Address;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  deliveryNotes?: string;
  items: OrderItem[];
  payment?: PaymentDetails;
  createdAt: string;
  updatedAt: string;
}

export interface EmailNotification {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  recipient: string;
  subject: string;
  htmlBody: string;
  sentAt: string;
}

export interface ProductFilters {
  brand?: string;
  category?: string;
  color?: string;
  size?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

export type Language = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'ja';

export interface StoreSettings {
  publishedQrCode: string;
  upiId: string;
  merchantName: string;
  notes: string;
  updatedAt: string;
}
