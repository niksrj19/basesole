import React, { useState } from 'react';
import { CheckCircle2, Copy, ExternalLink, FileText, MessageSquare, ShoppingBag, Check } from 'lucide-react';
import { Order } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface PaymentConfirmationPageProps {
  order: Order;
  customerEmail?: string;
  onViewOrder: (orderId: string) => void;
  onContinueShopping: () => void;
}

export const PaymentConfirmationPage: React.FC<PaymentConfirmationPageProps> = ({
  order,
  customerEmail,
  onViewOrder,
  onContinueShopping,
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const itemNames = order.items.map((item) => `- ${item.productName} (US ${item.size}, ${item.color}) x${item.quantity}`).join('\n');
  const message = `Hello BaseSole Support,\n\nI have completed the QR payment for my order. Please confirm my payment and order.\n\nOrder ID: ${order.id}\nOrder Number: ${order.orderNumber}\nAmount: INR ${order.total.toLocaleString('en-IN')}\nCustomer: ${order.userName}\n\nItems:\n${itemNames}`;
  const encodedMessage = encodeURIComponent(message);
  const supportNumber = '918058618106'
  const whatsappUrl = supportNumber ? `https://wa.me/${supportNumber}?text=${encodedMessage}` : `https://wa.me/?text=${encodedMessage}`;

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12" id="payment-confirmation-page">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-emerald-600 px-6 py-8 text-center text-white">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/15 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] font-bold text-emerald-100">Payment submitted</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold">Confirm your order on WhatsApp</h1>
          <p className="mt-2 text-sm text-emerald-50">Your order is recorded. Send the order ID to our team so payment and dispatch can be confirmed.</p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Order ID</span>
              <strong className="block mt-1 text-sm font-mono text-slate-900 break-all">{order.id}</strong>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Amount paid</span>
              <strong className="block mt-1 text-sm font-mono text-slate-900">INR {order.total.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <h2 className="font-bold text-slate-900">One last step</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">Tap the WhatsApp button below. The message already includes your order ID, order number, amount, and items for quick confirmation.</p>
              </div>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              id="confirm-order-whatsapp-link"
            >
              <ExternalLink className="w-4 h-4" />
              Confirm payment on WhatsApp
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Message preview</p>
            <pre className="mt-3 max-h-36 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-slate-700 font-mono">{message}</pre>
            <button onClick={copyMessage} className="mt-3 text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1.5">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy confirmation message'}
            </button>
          </div>

          {customerEmail && <p className="text-center text-xs text-slate-500">Receipt notification: <span className="font-semibold text-slate-700">{customerEmail}</span></p>}

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => onViewOrder(order.id)} className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" /> View order receipt
            </button>
            <button onClick={onContinueShopping} className="flex-1 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Continue shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
