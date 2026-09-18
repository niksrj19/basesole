import QRCode from 'qrcode';
import { PrismaClient, Role as PrismaRole, OrderStatus as PrismaOrderStatus, PaymentStatus as PrismaPaymentStatus } from '@prisma/client';
import { User, Address, Product, Category, Brand, Order, EmailNotification, Role, StoreSettings, CartItem } from '../src/types.ts';

export interface RefreshTokenRecord {
  token: string;
  userId: string;
  expiresAt: string;
}

const prisma = new PrismaClient();
const defaultSettings: StoreSettings = {
  publishedQrCode: '',
  upiId: 'solevault.pay@oksbi',
  merchantName: 'SoleVault Premium Shoes',
  notes: 'Scan via Google Pay, PhonePe, Paytm, BHIM, or any UPI banking app.',
  updatedAt: new Date().toISOString(),
};

const mapUser = (user: any): User => ({
  id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl || undefined,
  role: user.role as Role, preferredSize: user.preferredSize ?? undefined,
  phoneNumber: user.phoneNumber || undefined, createdAt: user.createdAt.toISOString(),
});

const mapAddress = (address: any): Address => ({
  id: address.id, userId: address.userId, recipientName: address.recipientName, street: address.street,
  apartment: address.apartment || undefined, city: address.city, state: address.state, postalCode: address.postalCode,
  country: address.country, phoneNumber: address.phoneNumber, isDefault: address.isDefault,
  createdAt: address.createdAt.toISOString(),
});

const mapProduct = (product: any): Product => ({
  id: product.id, name: product.name, slug: product.slug, sku: product.sku, brandId: product.brandId,
  brandName: product.brand.name, categoryId: product.categoryId, categoryName: product.category.name,
  price: product.price, comparePrice: product.comparePrice ?? undefined, description: product.description,
  gender: product.gender as Product['gender'], images: product.images, colors: product.colors, sizes: product.sizes,
  stock: product.stock, rating: product.rating, reviewCount: product.reviewCount, tags: product.tags,
  featured: product.featured, createdAt: product.createdAt.toISOString(), specs: product.specs || undefined,
});

const mapCartItem = (item: any): CartItem => {
  const product = mapProduct(item.product);
  return {
    id: item.id,
    productId: item.productId,
    product,
    quantity: item.quantity,
    size: item.size,
    color: item.color,
    unitPrice: product.price,
    totalPrice: Number((product.price * item.quantity).toFixed(2)),
  };
};

const mapNotification = (notification: any): EmailNotification => ({
  id: notification.id, orderId: notification.orderId, orderNumber: notification.order.orderNumber,
  userId: notification.userId, recipient: notification.recipient, subject: notification.subject,
  htmlBody: notification.htmlBody, sentAt: notification.sentAt.toISOString(),
});

const orderInclude = {
  user: true,
  shippingAddress: true,
  items: { include: { product: true } },
  payment: true,
};

const mapOrder = (order: any): Order => ({
  id: order.id, orderNumber: order.orderNumber, userId: order.userId, userEmail: order.user.email,
  userName: order.user.name, shippingAddress: order.shippingAddress ? mapAddress(order.shippingAddress) : undefined, status: order.status,
  subtotal: order.subtotal, tax: order.tax, shippingFee: order.shippingFee, total: order.total,
  deliveryNotes: order.deliveryNotes || undefined,
  items: order.items.map((item: any) => ({
    id: item.id, orderId: item.orderId, productId: item.productId, productName: item.product.name,
    product: { name: item.product.name, images: item.product.images }, productImage: item.product.images[0],
    quantity: item.quantity, size: item.size, color: item.color,
    unitPrice: item.unitPrice, totalPrice: item.totalPrice,
  })),
  payment: order.payment ? {
    id: order.payment.id, orderId: order.payment.orderId, method: order.payment.method,
    qrPayload: order.payment.qrPayload, status: order.payment.status, amount: order.payment.amount,
    transactionRef: order.payment.transactionRef || undefined, paidAt: order.payment.paidAt?.toISOString(),
  } : undefined,
  createdAt: order.createdAt.toISOString(), updatedAt: order.updatedAt.toISOString(),
});

class Store {
  async getUsers(): Promise<User[]> {
    return (await prisma.user.findMany({ orderBy: { createdAt: 'asc' } })).map(mapUser);
  }

  async getUserById(id: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? mapUser(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    return user ? mapUser(user) : undefined;
  }

  async createUser(userData: Partial<User> & { email: string; name: string }): Promise<User> {
    const user = await prisma.user.create({ data: {
      email: userData.email.toLowerCase(), name: userData.name,
      avatarUrl: userData.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}`,
      role: (userData.role || (userData.email.toLowerCase().includes('admin') ? 'ADMIN' : 'CUSTOMER')) as PrismaRole,
      preferredSize: userData.preferredSize ?? 9.5, phoneNumber: userData.phoneNumber || '',
    } });
    return mapUser(user);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      const user = await prisma.user.update({ where: { id }, data: {
        name: updates.name, email: updates.email?.toLowerCase(), avatarUrl: updates.avatarUrl,
        role: updates.role as PrismaRole, preferredSize: updates.preferredSize, phoneNumber: updates.phoneNumber,
      } });
      return mapUser(user);
    } catch { return undefined; }
  }

  async getOrCreateAdmin(email: string, name = 'SoleVault Administrator'): Promise<User> {
    const user = await prisma.user.upsert({ where: { email: email.toLowerCase() }, update: { role: PrismaRole.ADMIN }, create: {
      email: email.toLowerCase(), name, role: PrismaRole.ADMIN, preferredSize: 10, phoneNumber: '+91 98765 43210',
    } });
    return mapUser(user);
  }

  async saveRefreshToken(token: string, userId: string, expiresAt: string) {
    await prisma.refreshToken.upsert({ where: { token }, update: { userId, expiresAt: new Date(expiresAt) }, create: { token, userId, expiresAt: new Date(expiresAt) } });
    await prisma.refreshToken.deleteMany({ where: { userId, token: { not: token } } });
  }

  async findRefreshToken(token: string): Promise<RefreshTokenRecord | undefined> {
    const record = await prisma.refreshToken.findUnique({ where: { token } });
    return record ? { token: record.token, userId: record.userId, expiresAt: record.expiresAt.toISOString() } : undefined;
  }

  async deleteRefreshToken(token: string) { await prisma.refreshToken.deleteMany({ where: { token } }); }
  async deleteUserRefreshTokens(userId: string) { await prisma.refreshToken.deleteMany({ where: { userId } }); }

  async getCart(userId: string): Promise<CartItem[]> {
    const cart = await prisma.cart.findUnique({ where: { userId }, include: { items: { include: { product: { include: { brand: true, category: true } } }, orderBy: { createdAt: 'asc' } } } });
    return cart ? cart.items.map(mapCartItem) : [];
  }

  async addCartItem(userId: string, productId: string, size: number, color: string, quantity: number): Promise<CartItem> {
    const normalizedColor = color.trim().replace(/\s+/g, ' ').toLowerCase();
    const cart = await prisma.cart.upsert({ where: { userId }, update: {}, create: { userId } });
    const item = await prisma.cartItem.upsert({
      where: { cartId_productId_size_color: { cartId: cart.id, productId, size, color: normalizedColor } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId, size, color: normalizedColor, quantity },
      include: { product: { include: { brand: true, category: true } } },
    });
    return mapCartItem(item);
  }

  async updateCartItem(userId: string, itemId: string, quantity: number): Promise<CartItem | undefined> {
    const item = await prisma.cartItem.findFirst({ where: { id: itemId, cart: { userId } } });
    if (!item) return undefined;
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return undefined;
    }
    const updated = await prisma.cartItem.update({ where: { id: itemId }, data: { quantity }, include: { product: { include: { brand: true, category: true } } } });
    return mapCartItem(updated);
  }

  async deleteCartItem(userId: string, itemId: string): Promise<boolean> {
    return (await prisma.cartItem.deleteMany({ where: { id: itemId, cart: { userId } } })).count > 0;
  }

  async clearCart(userId: string) {
    await prisma.cartItem.deleteMany({ where: { cart: { userId } } });
  }

  async getUserAddresses(userId: string): Promise<Address[]> {
    return (await prisma.address.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } })).map(mapAddress);
  }

  async addAddress(address: Omit<Address, 'id' | 'createdAt'>): Promise<Address> {
    if (address.isDefault) await prisma.address.updateMany({ where: { userId: address.userId }, data: { isDefault: false } });
    const saved = await prisma.address.create({ data: { ...address, apartment: address.apartment || null } });
    return mapAddress(saved);
  }

  async updateAddress(id: string, updates: Partial<Address>): Promise<Address | undefined> {
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing) return undefined;
    if (updates.isDefault) await prisma.address.updateMany({ where: { userId: existing.userId }, data: { isDefault: false } });
    const saved = await prisma.address.update({ where: { id }, data: { ...updates, apartment: updates.apartment || null } });
    return mapAddress(saved);
  }

  async deleteAddress(id: string): Promise<boolean> { return (await prisma.address.deleteMany({ where: { id } })).count > 0; }

  async getProducts(): Promise<Product[]> {
    const products = await prisma.product.findMany({ include: { brand: true, category: true }, orderBy: { createdAt: 'desc' } });
    return products.map(mapProduct);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const product = await prisma.product.findFirst({ where: { OR: [{ id }, { slug: id }] }, include: { brand: true, category: true } });
    return product ? mapProduct(product) : undefined;
  }

  async addProduct(productData: Omit<Product, 'id' | 'slug' | 'createdAt'>): Promise<Product> {
    const slug = `${productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Math.random().toString(36).slice(2, 6)}`;
    const product = await prisma.product.create({ data: {
      name: productData.name, slug, sku: productData.sku, brandId: productData.brandId, categoryId: productData.categoryId,
      price: productData.price, comparePrice: productData.comparePrice ?? null, description: productData.description,
      gender: productData.gender, images: productData.images, colors: productData.colors, sizes: productData.sizes,
      stock: productData.stock, rating: 5, reviewCount: productData.reviewCount, tags: productData.tags,
      featured: productData.featured, specs: productData.specs as any,
    }, include: { brand: true, category: true } });
    return mapProduct(product);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    try {
      const product = await prisma.product.update({ where: { id }, data: {
        name: updates.name, slug: updates.slug, sku: updates.sku, brandId: updates.brandId, categoryId: updates.categoryId,
        price: updates.price, comparePrice: updates.comparePrice, description: updates.description, gender: updates.gender,
        images: updates.images, colors: updates.colors, sizes: updates.sizes, stock: updates.stock, rating: updates.rating,
        reviewCount: updates.reviewCount, tags: updates.tags, featured: updates.featured, specs: updates.specs as any,
      }, include: { brand: true, category: true } });
      return mapProduct(product);
    } catch { return undefined; }
  }

  async deleteProduct(id: string): Promise<boolean> { return (await prisma.product.deleteMany({ where: { id } })).count > 0; }
  async getCategories(): Promise<Category[]> { return prisma.category.findMany({ orderBy: { name: 'asc' } }) as Promise<Category[]>; }
  async getBrands(): Promise<Brand[]> { return prisma.brand.findMany({ orderBy: { name: 'asc' } }) as Promise<Brand[]>; }

  async getOrders(userId?: string): Promise<Order[]> {
    const orders = await prisma.order.findMany({ where: userId ? { userId } : undefined, include: orderInclude, orderBy: { createdAt: 'desc' } });
    return orders.map(mapOrder);
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const order = await prisma.order.findFirst({ where: { OR: [{ id }, { orderNumber: id }] }, include: orderInclude });
    return order ? mapOrder(order) : undefined;
  }

  async createOrder(params: { userId: string; shippingAddress: Address; items: Array<{ productId: string; quantity: number; size: number; color: string }>; deliveryNotes?: string }): Promise<Order> {
    const user = await prisma.user.findUnique({ where: { id: params.userId } });
    if (!user) throw new Error('User not found');
    const settings = await this.getStoreSettings();
    const orderId = `order-${Math.random().toString(36).slice(2, 9)}`;
    const orderNumber = `SOV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const address = await prisma.address.upsert({ where: { id: params.shippingAddress.id }, update: { ...params.shippingAddress, apartment: params.shippingAddress.apartment || null }, create: { ...params.shippingAddress, apartment: params.shippingAddress.apartment || null } });
    const products = await Promise.all(params.items.map(async (item) => {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      await prisma.product.update({ where: { id: product.id }, data: { stock: { decrement: item.quantity } } });
      return { item, product, totalPrice: Number((product.price * item.quantity).toFixed(2)) };
    }));
    const subtotal = Math.round(products.reduce((sum, row) => sum + row.totalPrice, 0));
    const tax = Math.round(subtotal * 0.08);
    const shippingFee = subtotal >= 2500 ? 0 : 250;
    const total = subtotal + tax + shippingFee;
    const upiPayload = `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.merchantName)}&am=${total}&cu=INR&tn=Order_${orderNumber}&tr=${orderId}`;
    await prisma.order.create({ data: {
      id: orderId, orderNumber, userId: user.id, addressId: address.id, subtotal, tax, shippingFee, total,
      deliveryNotes: params.deliveryNotes || null,
      items: { create: products.map(({ item, product, totalPrice }) => ({ id: `item-${Math.random().toString(36).slice(2, 9)}`, productId: product.id, quantity: item.quantity, size: item.size, color: item.color, unitPrice: product.price, totalPrice })) },
      payment: { create: { id: `pay-${Math.random().toString(36).slice(2, 9)}`, qrPayload: upiPayload, amount: total } },
    } });
    return (await this.getOrderById(orderId))!;
  }

  async confirmPayment(orderId: string, transactionRef?: string): Promise<Order | undefined> {
    const existing = await prisma.order.findFirst({ where: { OR: [{ id: orderId }, { orderNumber: orderId }] } });
    if (!existing) return undefined;
    await prisma.$transaction([
      prisma.order.update({ where: { id: existing.id }, data: { status: PrismaOrderStatus.PAYMENT_VERIFIED } }),
      prisma.payment.update({ where: { orderId: existing.id }, data: { status: PrismaPaymentStatus.COMPLETED, transactionRef: transactionRef || `UPI-TXN-${Date.now().toString().slice(-6)}`, paidAt: new Date() } }),
    ]);
    return this.getOrderById(existing.id);
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | undefined> {
    const existing = await prisma.order.findFirst({ where: { OR: [{ id: orderId }, { orderNumber: orderId }] } });
    if (!existing) return undefined;
    await prisma.order.update({ where: { id: existing.id }, data: { status: status as PrismaOrderStatus } });
    return this.getOrderById(existing.id);
  }

  async getNotifications(userId?: string): Promise<EmailNotification[]> {
    const notifications = await prisma.emailNotification.findMany({ where: userId ? { userId } : undefined, include: { order: true }, orderBy: { sentAt: 'desc' } });
    return notifications.map(mapNotification);
  }

  async getAdminMetrics() {
    const [orders, products, customers] = await Promise.all([this.getOrders(), this.getProducts(), prisma.user.count({ where: { role: PrismaRole.CUSTOMER } })]);
    const paidOrders = orders.filter((order) => order.status !== 'CANCELLED');
    const salesByCategory: Record<string, number> = {};
    const productSales: Record<string, { name: string; quantity: number; revenue: number; image: string }> = {};
    for (const order of orders) for (const item of order.items) {
      const product = products.find((candidate) => candidate.id === item.productId);
      const category = product?.categoryName || 'Other';
      salesByCategory[category] = (salesByCategory[category] || 0) + item.totalPrice;
      productSales[item.productId] ||= { name: item.productName, quantity: 0, revenue: 0, image: item.productImage };
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += item.totalPrice;
    }
    return {
      totalRevenue: Number(paidOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)), totalOrders: orders.length,
      totalCustomers: customers, totalProducts: products.length, lowStockCount: products.filter((p) => p.stock <= 5).length,
      lowStockProducts: products.filter((p) => p.stock <= 5), salesByCategory,
      topSelling: Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 5),
    };
  }

  async getStoreSettings(): Promise<StoreSettings> {
    let settings = await prisma.storeSetting.findUnique({ where: { id: 'store' } });
    if (!settings) {
      const qrCode = await QRCode.toDataURL('upi://pay?pa=solevault.shoes@upi&pn=SoleVaultShoesStore&cu=INR&tn=SoleVaultOfficialStore');
      settings = await prisma.storeSetting.create({ data: { id: 'store', ...defaultSettings, publishedQrCode: qrCode } });
    }
    return { publishedQrCode: settings.publishedQrCode, upiId: settings.upiId, merchantName: settings.merchantName, notes: settings.notes, updatedAt: settings.updatedAt.toISOString() };
  }

  async updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = await this.getStoreSettings();
    let publishedQrCode = updates.publishedQrCode || current.publishedQrCode;
    if (updates.upiId && !updates.publishedQrCode) publishedQrCode = await QRCode.toDataURL(`upi://pay?pa=${updates.upiId}&pn=${encodeURIComponent(updates.merchantName || current.merchantName)}&cu=INR&tn=SoleVaultOfficialStore`);
    const settings = await prisma.storeSetting.upsert({ where: { id: 'store' }, update: { publishedQrCode, upiId: updates.upiId || current.upiId, merchantName: updates.merchantName || current.merchantName, notes: updates.notes || current.notes }, create: { id: 'store', publishedQrCode, upiId: updates.upiId || current.upiId, merchantName: updates.merchantName || current.merchantName, notes: updates.notes || current.notes } });
    return { publishedQrCode: settings.publishedQrCode, upiId: settings.upiId, merchantName: settings.merchantName, notes: settings.notes, updatedAt: settings.updatedAt.toISOString() };
  }
}

export const store = new Store();
