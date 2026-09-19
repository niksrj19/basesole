import React, { useState, useEffect } from 'react';
import {
  QrCode,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  MapPin,
  Plus,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Mail,
  FileText,
  AlertCircle,
  MessageSquare,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { Address, Order, PublishedPaymentQR } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { PaymentConfirmationPage } from './PaymentConfirmationPage.tsx';

interface CheckoutPageProps {
  onOrderSuccess: (orderId: string) => void;
  onBackToCart: () => void;
  onNavigateLogin?: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onOrderSuccess,
  onBackToCart,
  onNavigateLogin,
}) => {
  const { items, subtotal, tax, shippingFee, total, clearCart } = useCart();
  const { user, isAuthenticated, fetchWithAuth } = useAuth();
  const { t } = useLanguage();

  // Load existing active order from sessionStorage to prevent accidental redirect on page refresh or component re-render
  const [createdOrder, setCreatedOrder] = useState<Order | null>(() => {
    try {
      const saved = sessionStorage.getItem('solevault_active_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Step state: 1 = Shipping Address, 2 = QR Payment & WhatsApp Confirmation, 3 = Completed
  const [step, setStep] = useState<'SHIPPING' | 'PAYMENT' | 'COMPLETED'>(() => {
    try {
      const savedOrder = sessionStorage.getItem('solevault_active_order');
      const savedStep = sessionStorage.getItem('solevault_checkout_step');
      if (savedOrder && savedStep === 'PAYMENT') return 'PAYMENT';
      sessionStorage.removeItem('solevault_active_order');
      sessionStorage.removeItem('solevault_checkout_step');
      return 'SHIPPING';
    } catch {
      return 'SHIPPING';
    }
  });

  // Published Store QR Settings (Admin Published static QR)
  const [publishedQr, setPublishedQr] = useState<PublishedPaymentQR | null>(null);

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState<boolean>(false);
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');

  // New address form state
  const [newRecipient, setNewRecipient] = useState(user?.name || '');
  const [newPhone, setNewPhone] = useState(user?.phoneNumber || '+91 98765 43210');
  const [newStreet, setNewStreet] = useState('');
  const [newApt, setNewApt] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostal, setNewPostal] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [saveToProfile, setSaveToProfile] = useState<boolean>(true);

  // Status flags
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);
  const [copiedWhatsAppMsg, setCopiedWhatsAppMsg] = useState<boolean>(false);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  // Fetch store's published static payment QR code
  useEffect(() => {
    fetch('/api/payment-qr')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.publishedQrCode) {
          setPublishedQr({
            qrCodeUrl: data.settings.publishedQrCode,
            upiId: data.settings.upiId,
            merchantName: data.settings.merchantName,
            instructions: data.settings.notes,
            updatedAt: data.settings.updatedAt,
          });
        } else if (data.publishedQrCode) {
          setPublishedQr({
            qrCodeUrl: data.publishedQrCode,
            upiId: data.upiId,
            merchantName: data.merchantName,
            instructions: data.notes,
            updatedAt: data.updatedAt,
          });
        }
      })
      .catch((err) => console.error('Error fetching published QR:', err));
  }, []);

  // Fetch saved addresses if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedAddresses();
    }
  }, [isAuthenticated]);

  const fetchSavedAddresses = async () => {
    try {
      const res = await fetchWithAuth('/api/user/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
        const defaultAddr = data.addresses?.find((a: Address) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (data.addresses?.length > 0) {
          setSelectedAddressId(data.addresses[0].id);
        } else {
          setShowNewAddressForm(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
  };

  // CHECKOUT AUTHENTICATION GATE:
  // "without login user can browser product , make add to cart but unable to proceed to QR payment . and its redirect to login page if not loggedIN before"
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center" id="checkout-auth-gate">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner border border-blue-100">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900">
              Sign In to Proceed to Payment
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your cart has <strong className="text-slate-800 font-semibold">{items.length} item(s)</strong> ready for checkout. Please sign in with your Google account (@gmail.com) to provide your shipping address and complete QR payment.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-1.5">
            <div className="flex justify-between font-medium text-slate-600">
              <span>Cart Total:</span>
              <span className="font-mono font-bold text-slate-900">₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-medium text-slate-600">
              <span>Currency:</span>
              <span className="font-semibold text-blue-600">Indian Rupee (INR)</span>
            </div>
            <div className="flex justify-between font-medium text-slate-600">
              <span>Payment:</span>
              <span className="font-semibold text-emerald-600">Store Published QR Code</span>
            </div>
          </div>

          <button
            onClick={() => {
              sessionStorage.setItem('solevault_redirect_after_login', 'checkout');
              if (onNavigateLogin) {
                onNavigateLogin();
              } else {
                window.location.hash = '#/login';
              }
            }}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2"
            id="auth-gate-login-btn"
          >
            <span>Sign In with Google</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onBackToCart}
            className="text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors block mx-auto"
          >
            ← Return to Footwear Catalog
          </button>
        </div>
      </div>
    );
  }

  const handleProceedToQRPayment = async () => {
    let finalAddress: Address | null = null;

    if (showNewAddressForm) {
      if (!newRecipient || !newStreet || !newCity || !newState || !newPostal || !newCountry || !newPhone) {
        alert('Please complete all required shipping address fields.');
        return;
      }

      finalAddress = {
        id: `addr-temp-${Date.now()}`,
        userId: user?.id || 'guest',
        recipientName: newRecipient,
        street: newStreet,
        apartment: newApt,
        city: newCity,
        state: newState,
        postalCode: newPostal,
        country: newCountry,
        phoneNumber: newPhone,
        isDefault: false,
        createdAt: new Date().toISOString(),
      };

      if (saveToProfile) {
        try {
          await fetchWithAuth('/api/user/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalAddress),
          });
        } catch (e) {
          // ignore save failure
        }
      }
    } else {
      finalAddress = addresses.find((a) => a.id === selectedAddressId) || null;
    }

    if (!finalAddress) {
      alert('Please choose or enter a valid shipping address.');
      return;
    }

    if (items.length === 0) {
      alert('Your cart is empty. Add shoes before proceeding to checkout.');
      return;
    }

    setIsCreatingOrder(true);
    try {
      const orderPayload = {
        shippingAddress: finalAddress,
        items: items.map((item) => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          product: {
            id: item.product.id,
            name: item.product.name,
            images: item.product.images,
            brandName: item.product.brandName,
          },
        })),
        deliveryNotes,
      };

      const res = await fetchWithAuth('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to initialize order');
      }

      const data = await res.json();
      const order = data.order;

      // Persist active order session so user NEVER gets redirected away from payment page
      sessionStorage.setItem('solevault_active_order', JSON.stringify(order));
      sessionStorage.setItem('solevault_checkout_step', 'PAYMENT');

      setCreatedOrder(order);
      setStep('PAYMENT');
      clearCart();
    } catch (err: any) {
      alert(err.message || 'Error creating order');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleConfirmQRPayment = async () => {
    if (!createdOrder) return;
    setIsVerifyingPayment(true);

    try {
      const res = await fetchWithAuth(`/api/orders/${createdOrder.id}/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionRef: `UPI-TXN-${Date.now().toString().slice(-6)}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updated = data.order;
        sessionStorage.removeItem('solevault_active_order');
        sessionStorage.removeItem('solevault_checkout_step');
        setCreatedOrder(updated);
        setStep('COMPLETED');
      }
    } catch (err) {
      console.error('Failed to confirm payment:', err);
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const buildWhatsAppMessage = () => {
    if (!createdOrder) return '';
    const itemNames = createdOrder.items
      .map((i) => `• ${i.productName} (US ${i.size}, ${i.color}) x${i.quantity}`)
      .join('\n');

    return `Hello SoleVault Support,

I have completed the QR payment for my footwear order!

*Order Details:*
• Order ID: ${createdOrder.id}
• Total Amount: ₹${createdOrder.total.toLocaleString('en-IN')}
• Payment Method: SoleVault Published Store QR (UPI)
• Customer Name: ${createdOrder?.shippingAddress?.recipientName}
• Delivery Address: ${createdOrder?.shippingAddress?.street}, ${createdOrder?.shippingAddress?.city}, ${createdOrder?.shippingAddress?.state} ${createdOrder?.shippingAddress?.postalCode}

*Shoes Ordered:*
${itemNames}

Kindly confirm payment receipt and dispatch tracking updates. Thank you!`;
  };

  const handleConnectWhatsApp = () => {
    const text = encodeURIComponent(buildWhatsAppMessage());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCopyWhatsAppMsg = () => {
    navigator.clipboard.writeText(buildWhatsAppMessage());
    setCopiedWhatsAppMsg(true);
    setTimeout(() => setCopiedWhatsAppMsg(false), 2000);
  };

  const handleCopyUpi = (upiId: string) => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  if (step === 'COMPLETED' && createdOrder) {
    return (
      <PaymentConfirmationPage
        order={createdOrder}
        customerEmail={user?.email}
        onViewOrder={(orderId) => onOrderSuccess(orderId)}
        onContinueShopping={onBackToCart}
      />
    );
  }

  // If cart is completely empty and no order is active, show clean cart empty state
  if (items.length === 0 && step === 'SHIPPING' && !createdOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <QrCode className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{t('cartEmpty')}</h2>
        <p className="text-sm text-slate-500 mt-2">
          Your cart currently has no items to checkout. Explore our footwear catalog to get started.
        </p>
        <button
          onClick={onBackToCart}
          className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800"
        >
          {t('startShopping')}
        </button>
      </div>
    );
  }

  // Step 2 uses only the QR settings saved by the admin in StoreSetting.
  const displayQrImage = publishedQr?.qrCodeUrl;
  const displayUpiId = publishedQr?.upiId;
  const displayMerchantName = publishedQr?.merchantName;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="checkout-page-container">
      {/* Checkout Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <div className="flex items-center gap-2">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'SHIPPING'
                  ? 'bg-blue-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              1
            </span>
            <span className="text-xs font-bold text-slate-900">{t('deliveryDetails')}</span>
          </div>

          <div className="flex-1 h-0.5 mx-4 bg-slate-200">
            <div
              className={`h-full bg-blue-600 transition-all duration-300 ${
                step !== 'SHIPPING' ? 'w-full' : 'w-0'
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'PAYMENT'
                  ? 'bg-blue-600 text-white'
                  : step === 'COMPLETED'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </span>
            <span className="text-xs font-bold text-slate-900">QR Payment</span>
          </div>

          <div className="flex-1 h-0.5 mx-4 bg-slate-200">
            <div
              className={`h-full bg-emerald-600 transition-all duration-300 ${
                step === 'COMPLETED' ? 'w-full' : 'w-0'
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'COMPLETED' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </span>
            <span className="text-xs font-bold text-slate-900">Order Confirmed</span>
          </div>
        </div>
      </div>

      {/* STEP 1: SHIPPING ADDRESS & CART SUMMARY */}
      {step === 'SHIPPING' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Shipping Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">{t('shippingAddress')}</h2>
                </div>
                {addresses.length > 0 && (
                  <button
                    onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {showNewAddressForm ? 'Select Saved Address' : t('addNewAddress')}
                  </button>
                )}
              </div>

              {/* Saved Addresses Selector */}
              {!showNewAddressForm && addresses.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs text-slate-500 font-medium">Select a saved shipping destination:</p>
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="addressRadio"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 accent-blue-600"
                        />
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">{addr.recipientName}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 mt-1">
                            {addr.street} {addr.apartment && `Apt ${addr.apartment}`}
                          </p>
                          <p className="text-slate-600">
                            {addr.city}, {addr.state} {addr.postalCode} • {addr.country}
                          </p>
                          <p className="text-slate-500 mt-1">Phone: {addr.phoneNumber}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* New Address Form */}
              {(showNewAddressForm || addresses.length === 0) && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Street Address / Flat No. *
                      </label>
                      <input
                        type="text"
                        value={newStreet}
                        onChange={(e) => setNewStreet(e.target.value)}
                        placeholder="123 Linking Road"
                        className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Building / Landmark
                      </label>
                      <input
                        type="text"
                        value={newApt}
                        onChange={(e) => setNewApt(e.target.value)}
                        placeholder="Near Metro Station (Optional)"
                        className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                      <input
                        type="text"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        placeholder="Mumbai"
                        className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                      <input
                        type="text"
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        placeholder="Maharashtra"
                        className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        value={newPostal}
                        onChange={(e) => setNewPostal(e.target.value)}
                        placeholder="400050"
                        className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number (For Delivery Updates) *
                    </label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      placeholder="India"
                      required
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={saveToProfile}
                        onChange={(e) => setSaveToProfile(e.target.checked)}
                        className="accent-blue-600 rounded"
                      />
                      <span>Save this address to my profile</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Delivery Instructions */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Ring bell or leave with security"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Published Static QR Notice Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
              <QrCode className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-950">
                <span className="font-bold block">SoleVault Official Published QR Payment:</span>
                Scan the official store QR code using any UPI app (Google Pay, PhonePe, Paytm, BHIM, Banking Apps). All transactions are processed in Indian Rupees (INR).
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                Order Review ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h3>

              {/* Shoe items list */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-cover rounded-xl border border-slate-100 bg-slate-50"
                    />
                    <div className="flex-1 text-xs">
                      <h4 className="font-bold text-slate-800 line-clamp-1">{item.product.name}</h4>
                      <p className="text-slate-500 text-[11px]">
                        US {item.size} • {item.color} • Qty {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900">
                      ₹{item.totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown in INR */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (GST 18%)</span>
                  <span className="font-mono font-semibold">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Dispatch</span>
                  <span className="font-mono font-semibold">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      `₹${shippingFee.toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900">
                  <span>Total Payable (INR)</span>
                  <span className="text-blue-600 font-mono">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleProceedToQRPayment}
                disabled={isCreatingOrder}
                className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
                id="generate-qr-order-btn"
              >
                {isCreatingOrder ? (
                  <span>Preparing QR Payment...</span>
                ) : (
                  <>
                    <span>Proceed to QR Payment (₹{total.toLocaleString('en-IN')})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>Express courier tracking dispatched upon payment</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: DYNAMIC / PUBLISHED STORE QR CODE SCAN & PAYMENT VERIFICATION */}
      {step === 'PAYMENT' && createdOrder && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
              <QrCode className="w-3.5 h-3.5" />
              <span>Step 2 of 3: Secure QR Code Payment</span>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Scan Published Store QR Code
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Scan using Google Pay, PhonePe, Paytm, BHIM, or your Banking UPI app.
              </p>
            </div>

            {publishedQr ? (
              <>
                {/* Published QR Code Display Container */}
                <div className="relative inline-block p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-blue-500/40 shadow-inner">
                  <img
                    src={displayQrImage}
                    alt="SoleVault Published Payment QR Code"
                    className="w-64 h-64 mx-auto rounded-xl shadow-md border border-slate-200 bg-white p-2 object-contain"
                  />
                  <div className="mt-3 text-xs font-mono font-bold text-slate-700">
                    Order ID: <span className="text-blue-600">{createdOrder.id}</span>
                  </div>
                </div>

              {/* UPI ID Copy Box */}
              <div className="max-w-md mx-auto p-3 bg-slate-100 rounded-2xl flex items-center justify-between gap-3 text-xs border border-slate-200">
              <div className="text-left truncate">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Official UPI ID</span>
                <span className="font-mono font-bold text-slate-900 truncate">{displayUpiId}</span>
              </div>
              <button
                onClick={() => handleCopyUpi(displayUpiId || '')}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs flex items-center gap-1 shrink-0"
              >
                {copiedUpi ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy UPI</span>
                  </>
                )}
              </button>
              </div>

              {/* Payment Details Pill Card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Payable</span>
                <span className="font-extrabold text-base text-slate-900 font-mono">
                  ₹{createdOrder.total.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Store Merchant</span>
                <span className="font-semibold text-slate-800 truncate block">{displayMerchantName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Method</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  QR Scan Only (INR)
                </span>
              </div>
              </div>

                {/* Instructions list */}
                <div className="text-left bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 text-xs text-slate-600 space-y-1.5">
              <p className="font-bold text-slate-900">How to pay:</p>
              <p>{publishedQr.instructions}</p>
              <p>1. Open Google Pay, PhonePe, Paytm, or any UPI banking app on your smartphone.</p>
              <p>2. Scan the official store QR code displayed above (or pay to <code className="font-mono text-slate-800 font-semibold">{displayUpiId}</code>).</p>
              <p>3. Enter exact amount: <strong>₹{createdOrder.total.toLocaleString('en-IN')}</strong>.</p>
              <p>4. After making payment, click <strong>"I Have Paid via QR Code"</strong> below.</p>
                </div>
              </>
            ) : (
              <div className="py-12 text-sm text-slate-500">Loading payment settings...</div>
            )}

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleConfirmQRPayment}
                disabled={isVerifyingPayment}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                id="confirm-qr-payment-btn"
              >
                {isVerifyingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Confirming Payment Receipt...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>I Have Paid via QR Code (₹{createdOrder.total.toLocaleString('en-IN')})</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setStep('SHIPPING')}
                className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
              >
                ← Change Shipping Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: ORDER COMPLETED + WHATSAPP CONFIRMATION */}
      {step === 'COMPLETED' && createdOrder && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Payment Verified & Order Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
                {t('orderPlacedSuccess')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Order Reference: <strong className="font-mono text-slate-800">{createdOrder.id}</strong>
              </p>
            </div>

            {/* Email Notification Notice (Requirement 8) */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-blue-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-blue-900 block">{t('emailSentNotice')}</span>
                  <span className="text-blue-700">Sent exclusively to: {user?.email}</span>
                </div>
              </div>
              <button
                onClick={() => onOrderSuccess(createdOrder.id)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
              >
                View Email
              </button>
            </div>

            {/* MANDATORY REQUIREMENT: CONNECT VIA WHATSAPP */}
            <div className="bg-emerald-50/70 border-2 border-emerald-500/30 rounded-3xl p-6 text-left space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {t('confirmOnWhatsApp')}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {t('whatsAppNotice')}
                  </p>
                </div>
              </div>

              {/* Message Preview Box */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-700 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                {buildWhatsAppMessage()}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleConnectWhatsApp}
                  className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  id="connect-whatsapp-btn"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{t('connectWhatsApp')}</span>
                </button>

                <button
                  onClick={handleCopyWhatsAppMsg}
                  className="py-3.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  {copiedWhatsAppMsg ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onOrderSuccess(createdOrder.id)}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>View Full Invoice & Receipt</span>
              </button>

              <button
                onClick={onBackToCart}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 text-slate-800 rounded-2xl text-xs font-bold hover:bg-slate-200"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
