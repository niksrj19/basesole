import React, { useState } from 'react';
import {
  ShoppingBag,
  User,
  Shield,
  LogOut,
  Globe,
  Menu,
  X,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { language, setLanguage, languages, t } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNav = (view: string, params?: any) => {
    onNavigate(view, params);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    onNavigate('home');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('home')}>
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-xl shadow-md tracking-tighter">
              SV
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Sole<span className="text-blue-600">Vault</span>
              </span>
              <span className="hidden sm:block text-[10px] font-semibold tracking-wider text-slate-500 uppercase -mt-1">
                Kicks & Sneaker Store
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3 text-sm font-medium text-slate-700">
            <button
              onClick={() => handleNav('home')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentView === 'home'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('home')}
            </button>
            <button
              onClick={() => handleNav('catalog')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentView === 'catalog'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('allShoes')}
            </button>
            <button
              onClick={() => handleNav('orders')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentView === 'orders'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('orders')}
            </button>
            {isAdmin && (
              <button
                onClick={() => handleNav('admin')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Shield className="w-4 h-4" />
                {t('adminDashboard')}
              </button>
            )}
          </nav>

          {/* Right utility icons & user menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                title="Switch Language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">
                  {languages.find((l) => l.code === language)?.flag}{' '}
                  {languages.find((l) => l.code === language)?.code.toUpperCase()}
                </span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        language === lang.code ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                      {language === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Badge (only when authenticated as Admin) */}
            {isAdmin && (
              <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-slate-900 text-white shadow-xs">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Admin</span>
              </span>
            )}

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title={t('cart')}
              id="navbar-cart-button"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                  id="navbar-user-button"
                >
                  <img
                    src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
                    alt={user?.name}
                    className="w-7 h-7 rounded-lg object-cover bg-slate-100 border border-slate-200"
                  />
                  <span className="hidden xl:inline text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                    {user?.name.split(' ')[0]}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      {isAdmin ? (
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            Administrator
                          </span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-emerald-600 font-semibold mt-1">Google Verified</p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        handleNav('profile');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      {t('profile')} & Shipping Addresses
                    </button>

                    <button
                      onClick={() => {
                        handleNav('orders');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Package className="w-3.5 h-3.5 text-slate-500" />
                      {t('orders')} & Invoices
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          handleNav('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2"
                      >
                        <Shield className="w-3.5 h-3.5 text-blue-600" />
                        {t('adminDashboard')}
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNav('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-xs transition-colors"
                id="navbar-google-signin-btn"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleNav('home')}
              className="text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {t('home')}
            </button>
            <button
              onClick={() => handleNav('catalog')}
              className="text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {t('allShoes')}
            </button>
            <button
              onClick={() => handleNav('orders')}
              className="text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {t('orders')}
            </button>
            <button
              onClick={() => handleNav('profile')}
              className="text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {t('profile')} & Addresses
            </button>
            {isAdmin && (
              <button
                onClick={() => handleNav('admin')}
                className="text-left px-3 py-2 rounded-lg text-sm font-medium text-blue-700 bg-blue-50"
              >
                {t('adminDashboard')}
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
            {isAuthenticated ? (
              <button onClick={logout} className="text-xs font-semibold text-red-600">
                {t('logout')}
              </button>
            ) : (
              <button
                onClick={() => handleNav('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 shadow-xs"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
