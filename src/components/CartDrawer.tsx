import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onExploreShoes: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onExploreShoes,
}) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    tax,
    shippingFee,
    total,
    totalItemsCount,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    if (!isAuthenticated) {
      sessionStorage.setItem('solevault_redirect_after_login', 'checkout');
      window.location.hash = '#/login';
    } else {
      onProceedToCheckout();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-container">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-slate-900" />
              <h2 className="text-base font-bold text-slate-900">
                {t('cart')} ({totalItemsCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">{t('cartEmpty')}</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Find the perfect pair of runners, basketball high-tops, or lifestyle kicks.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onExploreShoes();
                  }}
                  className="mt-5 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  {t('startShopping')}
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all bg-white"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        US {item.size} • {item.color}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-white rounded-md"
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-white rounded-md"
                        >
                          +
                        </button>
                      </div>

                      {/* Total Price in INR */}
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        ₹{item.totalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span className="font-semibold font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span className="font-semibold font-mono">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('shipping')}</span>
                  <span className="font-semibold font-mono">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold">{t('freeShipping')}</span>
                    ) : (
                      `₹${shippingFee.toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>{t('total')} (INR)</span>
                  <span className="font-mono text-base text-blue-600">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Secure QR Code UPI Payment Only</span>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                id="cart-proceed-checkout-btn"
              >
                {!isAuthenticated && <Lock className="w-4 h-4 text-blue-400" />}
                <span>
                  {isAuthenticated ? t('proceedToCheckout') : 'Sign In to Proceed to Payment'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
