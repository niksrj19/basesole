import React, { useState, useEffect } from 'react';
import {
  Package,
  FileText,
  Mail,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  Printer,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Order, EmailNotification } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface OrderHistoryProps {
  highlightOrderId?: string;
  onExploreShoes: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  highlightOrderId,
  onExploreShoes,
}) => {
  const { user, fetchWithAuth } = useAuth();
  const { t } = useLanguage();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeInvoice, setActiveInvoice] = useState<Order | null>(null);
  const [activeEmailNotification, setActiveEmailNotification] = useState<EmailNotification | null>(
    null
  );
  const [loadingEmail, setLoadingEmail] = useState<boolean>(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);

        if (highlightOrderId && data.orders) {
          const match = data.orders.find((o: Order) => o.id === highlightOrderId);
          if (match) setActiveInvoice(match);
        }
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEmail = async (orderId: string) => {
    setLoadingEmail(true);
    try {
      const res = await fetchWithAuth(`/api/orders/${orderId}/email-receipt`);
      if (res.ok) {
        const data = await res.json();
        setActiveEmailNotification(data.notification);
      }
    } catch (err) {
      console.error('Failed to load email notification:', err);
    } finally {
      setLoadingEmail(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Delivered
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <Truck className="w-3 h-3" />
            In Transit / Shipped
          </span>
        );
      case 'PAYMENT_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
            <ShieldCheck className="w-3 h-3" />
            Payment Verified
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" />
            Processing
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="order-history-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('orderHistory')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your past sneaker purchases, download tax invoices, and check email notifications.
          </p>
        </div>

        <button
          onClick={onExploreShoes}
          className="self-start sm:self-auto px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5"
        >
          <span>Explore More Shoes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Orders List */}
      <div className="mt-8 space-y-6">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Retrieving order history...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200 p-8">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">{t('noOrders')}</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You have not placed any orders yet. Discover our collection of kicks and pay securely via QR code.
            </p>
            <button
              onClick={onExploreShoes}
              className="mt-5 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className={`bg-white rounded-3xl border transition-all p-6 ${
                highlightOrderId === order.id
                  ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg'
                  : 'border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Order Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-900">{order.id}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">
                      ₹{order.total.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveInvoice(order)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t('invoiceSummary')}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEmail(order.id)}
                    className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>Email Receipt</span>
                  </button>
                </div>
              </div>

              {/* Shoes in Order */}
              <div className="mt-4 divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center gap-4 first:pt-0 last:pb-0">
                    <img
                      src={item?.product?.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80'}
                      alt={item.product?.name || 'Shoe'}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-cover rounded-xl border border-slate-100 bg-slate-50 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item?.product?.name || 'SoleVault Shoe'}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Size: <strong className="text-slate-700">US {item.size}</strong> • Color:{' '}
                        <strong className="text-slate-700">{item.color}</strong> • Qty:{' '}
                        <strong className="text-slate-700">{item.quantity}</strong>
                      </p>
                      <span className="text-[10px] text-emerald-700 font-medium">
                        Payment: QR Code Verified
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        ₹{item.totalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        (₹{item.unitPrice.toLocaleString('en-IN')} each)
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Destination Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  {order.shippingAddress ? (
                    <>Delivering to: <strong className="text-slate-700">{order.shippingAddress.recipientName}</strong>,{' '}
                    {order.shippingAddress.street}, {order.shippingAddress.city}</>
                  ) : (
                    'Delivery address unavailable'
                  )}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  Ref: {order?.payment?.transactionRef}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DETAILED INVOICE MODAL (Requirement 5) */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Modal Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Tax Invoice Summary</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / PDF
                </button>
                <button
                  onClick={() => setActiveInvoice(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Body */}
            <div className="mt-6 space-y-6 text-xs text-slate-700" id="printable-invoice">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-lg mb-2">
                    SV
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900">SoleVault Footwear Inc.</h2>
                  <p className="text-[11px] text-slate-500">100 Kicks Way, Portland, OR 97201</p>
                  <p className="text-[11px] text-slate-500">support@solevault.com • GST/Tax ID: US-9874521</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">INVOICE</span>
                  <p className="text-sm font-mono font-bold text-slate-900">{activeInvoice.id}</p>
                  <p className="text-[11px] text-slate-500">
                    Date: {new Date(activeInvoice.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-bold mt-1">STATUS: PAID IN FULL</p>
                </div>
              </div>

              {/* Bill to & Ship to */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Billed & Shipped To:
                  </span>
                  {activeInvoice.shippingAddress ? (
                    <>
                      <p className="font-bold text-slate-900">{activeInvoice.shippingAddress.recipientName}</p>
                      <p className="text-slate-600">{activeInvoice.shippingAddress.street}</p>
                      <p className="text-slate-600">
                        {activeInvoice.shippingAddress.city}, {activeInvoice.shippingAddress.state}{' '}
                        {activeInvoice.shippingAddress.postalCode}
                      </p>
                      <p className="text-slate-500 mt-1">Phone: {activeInvoice.shippingAddress.phoneNumber}</p>
                    </>
                  ) : (
                    <p className="text-slate-500">Address unavailable</p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Payment Verification:
                  </span>
                  <p className="font-semibold text-slate-800">Exclusive QR Code Gateway</p>
                  <p className="font-mono text-slate-600">Ref: {activeInvoice?.payment?.transactionRef}</p>
                  <p className="text-slate-500">Verified via SoleVault Security</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Size</th>
                    <th className="py-2 text-center">Color</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeInvoice.items.map((item, idx) => (
                    <tr key={idx} className="text-xs">
                      <td className="py-2.5 font-bold text-slate-900">{item.product.name}</td>
                      <td className="py-2.5 text-center font-mono">US {item.size}</td>
                      <td className="py-2.5 text-center">{item.color}</td>
                      <td className="py-2.5 text-center font-semibold">{item.quantity}</td>
                      <td className="py-2.5 text-right font-mono">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                        ₹{item.totalPrice.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Calculation */}
              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{activeInvoice.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (18%):</span>
                    <span className="font-mono">₹{activeInvoice.tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping & Handling:</span>
                    <span className="font-mono">₹{activeInvoice.shippingFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Paid (INR):</span>
                    <span className="font-mono text-blue-600">₹{activeInvoice.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                Thank you for choosing SoleVault! This order is protected by our 30-day authentic return policy.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL NOTIFICATION VIEWER MODAL (Requirement 8) */}
      {activeEmailNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">SoleVault Email Notification</h3>
                  <p className="text-[11px] text-slate-500">
                    Exclusively sent to Gmail: <strong>{activeEmailNotification.recipient}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveEmailNotification(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Subject:</span>
                <span className="font-bold text-slate-900">{activeEmailNotification.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dispatch Time:</span>
                <span className="font-mono text-slate-700">
                  {new Date(activeEmailNotification.sentAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Status:</span>
                <span className="font-semibold text-emerald-700">Delivered to Gmail Inbox</span>
              </div>
            </div>

            {/* Email HTML Container */}
            <div
              className="mt-4 p-4 border border-slate-200 rounded-2xl max-h-96 overflow-y-auto bg-white"
              dangerouslySetInnerHTML={{ __html: activeEmailNotification.htmlBody }}
            />

            <button
              onClick={() => setActiveEmailNotification(null)}
              className="mt-4 w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
            >
              Close Notification Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
