import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient, Role, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();
const storePath = path.join(process.cwd(), 'data', 'store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

const asDate = (value: string | undefined) => (value ? new Date(value) : undefined);

async function main() {
  for (const user of store.users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email, name: user.name, avatarUrl: user.avatarUrl || null, role: user.role as Role, preferredSize: user.preferredSize ?? null, phoneNumber: user.phoneNumber || null },
      create: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl || null, role: user.role as Role, preferredSize: user.preferredSize ?? null, phoneNumber: user.phoneNumber || null, createdAt: asDate(user.createdAt) },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@solevault.com';
  await prisma.user.upsert({ where: { email: adminEmail }, update: { name: 'SoleVault Administrator', role: Role.ADMIN }, create: { email: adminEmail, name: 'SoleVault Administrator', role: Role.ADMIN } });

  for (const category of store.categories) {
    await prisma.category.upsert({ where: { id: category.id }, update: { slug: category.slug, name: category.name, description: category.description || null }, create: category });
  }

  for (const brand of store.brands) {
    await prisma.brand.upsert({ where: { id: brand.id }, update: { slug: brand.slug, name: brand.name, logoUrl: brand.logoUrl || null }, create: { ...brand, logoUrl: brand.logoUrl || null } });
  }

  for (const product of store.products) {
    const productData = {
      name: product.name, slug: product.slug, sku: product.sku, brandId: product.brandId, categoryId: product.categoryId,
      price: product.price, comparePrice: product.comparePrice ?? null, description: product.description, gender: product.gender,
      images: product.images, colors: product.colors, sizes: product.sizes, stock: product.stock, rating: product.rating,
      reviewCount: product.reviewCount, tags: product.tags, featured: product.featured,
      specs: product.specs || null,
    };
    await prisma.product.upsert({ where: { id: product.id }, update: productData, create: { id: product.id, ...productData, createdAt: asDate(product.createdAt) } });
  }

  for (const address of store.addresses) {
    const addressData = {
      userId: address.userId, recipientName: address.recipientName, street: address.street, apartment: address.apartment || null,
      city: address.city, state: address.state, postalCode: address.postalCode, country: address.country,
      phoneNumber: address.phoneNumber, isDefault: address.isDefault,
    };
    await prisma.address.upsert({ where: { id: address.id }, update: addressData, create: { id: address.id, ...addressData, createdAt: asDate(address.createdAt) } });
  }

  for (const token of store.refreshTokens) {
    await prisma.refreshToken.upsert({ where: { token: token.token }, update: { userId: token.userId, expiresAt: new Date(token.expiresAt) }, create: { token: token.token, userId: token.userId, expiresAt: new Date(token.expiresAt) } });
  }

  for (const order of store.orders) {
    const matchingAddress = await prisma.address.findFirst({ where: { userId: order.userId, street: order.shippingAddress.street, postalCode: order.shippingAddress.postalCode } });
    const orderData = {
      orderNumber: order.orderNumber, userId: order.userId, addressId: matchingAddress?.id, status: order.status as OrderStatus,
      subtotal: order.subtotal, tax: order.tax, shippingFee: order.shippingFee, total: order.total, deliveryNotes: order.deliveryNotes || null,
    };
    await prisma.order.upsert({ where: { id: order.id }, update: orderData, create: { id: order.id, ...orderData, createdAt: asDate(order.createdAt), updatedAt: asDate(order.updatedAt) } });

    for (const item of order.items) {
      const itemData = { orderId: order.id, productId: item.productId, quantity: item.quantity, size: item.size, color: item.color, unitPrice: item.unitPrice, totalPrice: item.totalPrice };
      await prisma.orderItem.upsert({ where: { id: item.id }, update: itemData, create: { id: item.id, ...itemData } });
    }

    if (order.payment) {
      const paymentData = {
        orderId: order.id, method: order.payment.method as PaymentMethod, qrPayload: order.payment.qrPayload,
        status: order.payment.status as PaymentStatus, transactionRef: order.payment.transactionRef || null,
        amount: order.payment.amount, paidAt: asDate(order.payment.paidAt),
      };
      await prisma.payment.upsert({ where: { id: order.payment.id }, update: paymentData, create: { id: order.payment.id, ...paymentData } });
    }
  }

  for (const notification of store.notifications) {
    const notificationData = {
      orderId: notification.orderId, userId: notification.userId, recipient: notification.recipient,
      subject: notification.subject, htmlBody: notification.htmlBody, sentAt: asDate(notification.sentAt),
    };
    await prisma.emailNotification.upsert({ where: { id: notification.id }, update: notificationData, create: { id: notification.id, ...notificationData } });
  }

  if (store.settings) {
    await prisma.storeSetting.upsert({
      where: { id: 'store' },
      update: {
        publishedQrCode: store.settings.publishedQrCode,
        upiId: store.settings.upiId,
        merchantName: store.settings.merchantName,
        notes: store.settings.notes,
      },
      create: {
        id: 'store',
        publishedQrCode: store.settings.publishedQrCode,
        upiId: store.settings.upiId,
        merchantName: store.settings.merchantName,
        notes: store.settings.notes,
      },
    });
  }

  const [users, categories, brands, products, addresses, orders, orderItems, payments, notifications] = await Promise.all([
    prisma.user.count(), prisma.category.count(), prisma.brand.count(), prisma.product.count(), prisma.address.count(),
    prisma.order.count(), prisma.orderItem.count(), prisma.payment.count(), prisma.emailNotification.count(),
  ]);
  console.log(`Seeded users=${users}, categories=${categories}, brands=${brands}, products=${products}, addresses=${addresses}, orders=${orders}, orderItems=${orderItems}, payments=${payments}, notifications=${notifications}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
