import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  QrCode,
  ShieldCheck,
  Truck,
  Sparkles,
  Star,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import { HeroCarousel } from './HeroCarousel.tsx';
import { Product, Category } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface HomePageProps {
  onNavigateCatalog: (category?: string, brand?: string) => void;
  onSelectProduct: (productId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateCatalog,
  onSelectProduct,
}) => {
  const { t } = useLanguage();
  const { addToCart } = useCart();

  const [featuredShoes, setFeaturedShoes] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    setLoading(true);
    try {
      const [resProds, resCats] = await Promise.all([
        fetch('/api/products?sortBy=featured'),
        fetch('/api/categories'),
      ]);
      if (resProds.ok) {
        const data = await resProds.json();
        setFeaturedShoes(data.products?.slice(0, 4) || []);
      }
      if (resCats.ok) {
        const cData = await resCats.json();
        setCategories(cData.categories || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-16" id="homepage-container">
      {/* 1. Hero Carousel (Requirement #2: 4 images carousel) */}
      <HeroCarousel onShopNow={() => onNavigateCatalog()} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 2. Three Pillars of SoleVault */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">QR Code Exclusive Checkout</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Fast, contactless UPI/banking QR payment on checkout. Zero card scams or third-party gateways.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">100% Verified Authentic</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Every pair of Nike, Jordan, Adidas, and New Balance kicks passes multi-point physical verification.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Express Dispatch & Tracking</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Real-time email notifications and WhatsApp order dispatch updates sent directly upon confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Categories Quick Navigation */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Shop Footwear by Category
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Explore tailored silhouettes engineered for performance and streetwear.</p>
            </div>
            <button
              onClick={() => onNavigateCatalog()}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onNavigateCatalog(cat.id)}
                className="group relative h-40 sm:h-48 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all"
              >
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Category</span>
                  <h3 className="text-white font-extrabold text-sm sm:text-base">{cat.name}</h3>
                  <span className="text-slate-300 text-[11px] group-hover:translate-x-1 transition-transform flex items-center gap-1 mt-0.5">
                    Explore Kicks →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Trending & Featured Drops Preview */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Trending Kicks of the Week
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Handpicked premium releases with dynamic QR payments.</p>
            </div>

            <button
              onClick={() => onNavigateCatalog()}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>{t('viewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredShoes.map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product.id)}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
              >
                <div className="aspect-[4/3] bg-slate-50 p-4 flex items-center justify-center overflow-hidden relative">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {product.brandName}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>{product.categoryName}</span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{product.rating}</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-base font-extrabold text-slate-900 font-mono">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product, product.sizes[0] || 9.5, product.colors[0] || 'Black', 1);
                      }}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white transition-colors"
                      title="Add to Cart"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. SoleVault Membership Promo */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 z-10 max-w-xl">
            <span className="text-xs uppercase font-extrabold tracking-wider text-blue-400">
              Exclusive Shoe Collectors Circle
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Sign In with Google & Get Exclusive Drop Access
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Get notified of limited Nike SB, Yeezy, and Air Jordan restocks directly to your verified Google inbox.
            </p>
          </div>

          <button
            onClick={() => onNavigateCatalog()}
            className="z-10 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs shadow-lg transition-all"
          >
            Explore Catalog
          </button>
        </div>
      </div>
    </div>
  );
};
