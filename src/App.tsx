import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { HomePage } from './components/HomePage.tsx';
import { ProductCatalog } from './components/ProductCatalog.tsx';
import { ProductDetail } from './components/ProductDetail.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutPage } from './components/CheckoutPage.tsx';
import { OrderHistory } from './components/OrderHistory.tsx';
import { ProfileManagement } from './components/ProfileManagement.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { AdminLoginPage } from './components/AdminLoginPage.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import {
  QrCode,
  ShieldCheck,
  Truck,
  Mail,
  Heart,
  Globe,
  ArrowRight,
  ExternalLink,
  Lock,
} from 'lucide-react';

function AppContent() {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { setIsCartOpen } = useCart();

  // Navigation state with URL hash synchronization
  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
      if (
        hash &&
        [
          'home',
          'catalog',
          'pdp',
          'checkout',
          'orders',
          'profile',
          'admin',
          'admin-login',
          'login',
        ].includes(hash)
      ) {
        return hash;
      }
    }
    return 'home';
  });

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [initialCatalogCategory, setInitialCatalogCategory] = useState<string | undefined>(undefined);
  const [highlightOrderId, setHighlightOrderId] = useState<string | undefined>(undefined);

  // Synchronize navigation with window.location.hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
      if (
        hash &&
        [
          'home',
          'catalog',
          'pdp',
          'checkout',
          'orders',
          'profile',
          'admin',
          'admin-login',
          'login',
        ].includes(hash)
      ) {
        setCurrentView(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentView === 'login') {
      window.location.hash = 'home';
      setCurrentView('home');
    }
  }, [isAuthenticated, currentView]);

  const handleNavigate = (view: string, params?: any) => {
    // Auth gate for checkout: unauthenticated users are redirected to login
    if (view === 'checkout' && !isAuthenticated) {
      sessionStorage.setItem('solevault_redirect_after_login', 'checkout');
      window.location.hash = 'login';
      setCurrentView('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'pdp' && params?.productId) {
      setSelectedProductId(params.productId);
      window.location.hash = `pdp?id=${params.productId}`;
      setCurrentView('pdp');
    } else if (view === 'catalog') {
      setInitialCatalogCategory(params?.category);
      window.location.hash = 'catalog';
      setCurrentView('catalog');
    } else if (view === 'orders') {
      setHighlightOrderId(params?.orderId);
      window.location.hash = 'orders';
      setCurrentView('orders');
    } else {
      window.location.hash = view;
      setCurrentView(view);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Sticky Top Header Navigation */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onNavigateCatalog={(category) => handleNavigate('catalog', { category })}
            onSelectProduct={(id) => handleNavigate('pdp', { productId: id })}
          />
        )}

        {currentView === 'catalog' && (
          <ProductCatalog
            onSelectProduct={(id) => handleNavigate('pdp', { productId: id })}
            initialCategory={initialCatalogCategory}
          />
        )}

        {currentView === 'pdp' && selectedProductId && (
          <ProductDetail
            productId={selectedProductId}
            onBack={() => handleNavigate('catalog')}
            onCheckoutNow={() => handleNavigate('checkout')}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onOrderSuccess={(orderId) => handleNavigate('orders', { orderId })}
            onBackToCart={() => handleNavigate('catalog')}
            onNavigateLogin={() => handleNavigate('login')}
          />
        )}

        {currentView === 'orders' && (
          <OrderHistory
            highlightOrderId={highlightOrderId}
            onExploreShoes={() => handleNavigate('catalog')}
          />
        )}

        {currentView === 'profile' && <ProfileManagement />}

        {currentView === 'admin' && (
          isAdmin ? (
            <AdminDashboard />
          ) : (
            <AdminLoginPage
              onLoginSuccess={() => handleNavigate('admin')}
              onNavigateHome={() => handleNavigate('home')}
            />
          )
        )}

        {currentView === 'admin-login' && (
          <AdminLoginPage
            onLoginSuccess={() => handleNavigate('admin')}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onLoginSuccess={(target) => handleNavigate(target || 'home')}
            onNavigateAdminLogin={() => handleNavigate('admin-login')}
          />
        )}
      </main>

      {/* Slide-over Cart Management Drawer */}
      <CartDrawer
        onProceedToCheckout={() => handleNavigate('checkout')}
        onExploreShoes={() => handleNavigate('catalog')}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  SV
                </div>
                <span className="text-white font-extrabold text-base tracking-tight">
                  Sole<span className="text-blue-400">Vault</span>
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Premium footwear marketplace offering guaranteed authentic performance and lifestyle shoes with contact-free QR code payment.
              </p>
              <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>QR Code Payments Only (INR)</span>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
                Footwear Catalog
              </h4>
              <ul className="space-y-2 text-[11px]">
                <li>
                  <button onClick={() => handleNavigate('catalog')} className="hover:text-white transition-colors">
                    All Kicks & Sneakers
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('catalog', { category: 'cat-running' })} className="hover:text-white transition-colors">
                    Running Shoes
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('catalog', { category: 'cat-basketball' })} className="hover:text-white transition-colors">
                    Basketball High-Tops
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('catalog', { category: 'cat-lifestyle' })} className="hover:text-white transition-colors">
                    Streetwear & Lifestyle
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
                Customer Services
              </h4>
              <ul className="space-y-2 text-[11px]">
                <li>
                  <button onClick={() => handleNavigate('orders')} className="hover:text-white transition-colors">
                    Order Tracking & Invoices
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('profile')} className="hover:text-white transition-colors">
                    Shipping Address Book
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('checkout')} className="hover:text-white transition-colors">
                    QR Code Checkout
                  </button>
                </li>
                <li>
                  <span className="text-slate-500">Order Notifications via Gmail</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
                Security & Authentication
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                Customer sign-in powered strictly by verified Google accounts. Secure JWT authentication and contactless QR payment.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => handleNavigate('admin-login')}
                  className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white font-semibold transition-colors bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700"
                >
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Admin Portal</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} SoleVault Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Secure QR Payments</span>
              <span>•</span>
              <span>Currency: INR (₹)</span>
              <span>•</span>
              <span>Google OAuth 2.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
