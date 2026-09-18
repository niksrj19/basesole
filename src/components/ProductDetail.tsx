import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
  Ruler,
  ShoppingBag,
  Heart,
  Share2,
  Info,
} from 'lucide-react';
import { Product } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
  onCheckoutNow?: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  productId,
  onBack,
  onCheckoutNow,
}) => {
  const { t } = useLanguage();
  const { addToCart, setIsCartOpen } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (res.ok) {
        const data = await res.json();
        const p: Product = data.product;
        setProduct(p);
        setSelectedImage(p.images[0] || '');
        setSelectedColor(p.colors[0] || 'Black');
        setSelectedSize(p.sizes[2] || p.sizes[0] || 9.5);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    if (!isAuthenticated) {
      sessionStorage.setItem('solevault_redirect_after_login', 'checkout');
      window.location.hash = '#/login';
    } else if (onCheckoutNow) {
      onCheckoutNow();
    } else {
      setIsCartOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 mt-3">Loading kicks specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-base text-slate-700 font-bold">Shoe not found</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Back to Shoes Catalog
        </button>
      </div>
    );
  }

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="pdp-page-container">
      {/* Back button breadcrumb */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Shoes</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Display Image */}
          <div className="relative aspect-[4/3] bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex items-center justify-center p-6">
            <img
              src={selectedImage}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-2xl transform transition-transform duration-300 hover:scale-105"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-black uppercase px-3 py-1 rounded-full shadow-md">
                {discount}% OFF
              </span>
            )}
            <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-3 py-1 rounded-full border border-slate-200">
              {product.brandName}
            </span>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`relative w-24 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  selectedImage === img
                    ? 'border-blue-600 ring-2 ring-blue-600/20'
                    : 'border-slate-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Technical Specifications Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-8">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              {t('productSpecs')}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Upper Material</span>
                <span className="font-semibold text-slate-800">{product.specs?.material || 'Engineered Mesh'}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Midsole Cushioning</span>
                <span className="font-semibold text-slate-800">{product.specs?.cushioning || 'Responsive Air Foam'}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Shoe Weight</span>
                <span className="font-semibold text-slate-800">{product.specs?.weight || '310g'}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-0.5">SKU Reference</span>
                <span className="font-semibold text-slate-800 font-mono">{product.sku}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Buying Details & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
              <span>{product.brandName}</span>
              <span>•</span>
              <span className="text-slate-500">{product.categoryName}</span>
              <span>•</span>
              <span className="text-slate-500">{product.gender}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>

            {/* Ratings & Stock */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400 font-normal">({product.reviewCount} reviews)</span>
              </div>
              <span className="text-slate-300">|</span>
              {product.stock > 0 ? (
                <span className="text-emerald-700 text-xs font-bold px-2.5 py-0.5 bg-emerald-50 rounded-full border border-emerald-200">
                  {product.stock <= 5 ? `Only ${product.stock} units left in stock` : 'In Stock & Ready to Ship'}
                </span>
              ) : (
                <span className="text-red-700 text-xs font-bold px-2.5 py-0.5 bg-red-50 rounded-full">
                  Sold Out
                </span>
              )}
            </div>

            {/* Price section */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.comparePrice && (
                <span className="text-base text-slate-400 line-through font-mono">
                  ₹{product.comparePrice.toLocaleString('en-IN')}
                </span>
              )}
              {discount > 0 && (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Save ₹{(product.comparePrice! - product.price).toLocaleString('en-IN')} ({discount}%)
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
            {product.description}
          </p>

          {/* Colorway Selection */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider">{t('selectColor')}:</span>
              <span className="text-slate-600 font-medium">{selectedColor}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedColor(col)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedColor === col
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider">
                <span>{t('selectSize')} (US Men):</span>
                <span className="text-blue-600 font-mono text-sm">{selectedSize}</span>
              </div>
              <button
                onClick={() => setSizeGuideOpen(true)}
                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 text-xs"
              >
                <Ruler className="w-3.5 h-3.5" />
                {t('sizeGuide')}
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    selectedSize === sz
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600/30'
                      : 'border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  US {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              {/* Quantity selector */}
              <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-white rounded-lg transition-colors"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-bold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-white rounded-lg transition-colors"
                >
                  +
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  addedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                }`}
                id="pdp-add-to-cart-button"
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t('addedToCart')}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t('addToCart')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Fast Checkout CTA */}
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-500 shadow-md transition-all active:scale-95"
            >
              Buy Now with QR Code
            </button>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-600">
            <div className="p-2 bg-slate-50 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <span className="font-semibold block">100% Authentic</span>
              <span className="text-[10px] text-slate-400">Verified by SoleVault</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <Truck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <span className="font-semibold block">Free Shipping</span>
              <span className="text-[10px] text-slate-400">Orders over ₹5,000</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <RotateCcw className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <span className="font-semibold block">Easy Returns</span>
              <span className="text-[10px] text-slate-400">30-day trial policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Footwear Size Conversion Chart</h3>
              </div>
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="my-4 overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold">
                    <th className="p-2 border border-slate-200">US Men</th>
                    <th className="p-2 border border-slate-200">US Women</th>
                    <th className="p-2 border border-slate-200">UK</th>
                    <th className="p-2 border border-slate-200">EU</th>
                    <th className="p-2 border border-slate-200">Length (CM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr><td className="p-2 border">7.0</td><td className="p-2 border">8.5</td><td className="p-2 border">6.0</td><td className="p-2 border">40.0</td><td className="p-2 border">25.0 cm</td></tr>
                  <tr><td className="p-2 border">7.5</td><td className="p-2 border">9.0</td><td className="p-2 border">6.5</td><td className="p-2 border">40.5</td><td className="p-2 border">25.5 cm</td></tr>
                  <tr><td className="p-2 border">8.0</td><td className="p-2 border">9.5</td><td className="p-2 border">7.0</td><td className="p-2 border">41.0</td><td className="p-2 border">26.0 cm</td></tr>
                  <tr className="bg-blue-50/50 font-bold text-blue-900"><td className="p-2 border">8.5</td><td className="p-2 border">10.0</td><td className="p-2 border">7.5</td><td className="p-2 border">42.0</td><td className="p-2 border">26.5 cm</td></tr>
                  <tr className="bg-blue-50/50 font-bold text-blue-900"><td className="p-2 border">9.0</td><td className="p-2 border">10.5</td><td className="p-2 border">8.0</td><td className="p-2 border">42.5</td><td className="p-2 border">27.0 cm</td></tr>
                  <tr className="bg-blue-50/50 font-bold text-blue-900"><td className="p-2 border">9.5</td><td className="p-2 border">11.0</td><td className="p-2 border">8.5</td><td className="p-2 border">43.0</td><td className="p-2 border">27.5 cm</td></tr>
                  <tr><td className="p-2 border">10.0</td><td className="p-2 border">11.5</td><td className="p-2 border">9.0</td><td className="p-2 border">44.0</td><td className="p-2 border">28.0 cm</td></tr>
                  <tr><td className="p-2 border">10.5</td><td className="p-2 border">12.0</td><td className="p-2 border">9.5</td><td className="p-2 border">44.5</td><td className="p-2 border">28.5 cm</td></tr>
                  <tr><td className="p-2 border">11.0</td><td className="p-2 border">12.5</td><td className="p-2 border">10.0</td><td className="p-2 border">45.0</td><td className="p-2 border">29.0 cm</td></tr>
                  <tr><td className="p-2 border">12.0</td><td className="p-2 border">13.5</td><td className="p-2 border">11.0</td><td className="p-2 border">46.0</td><td className="p-2 border">30.0 cm</td></tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              <strong>Tip:</strong> If between two sizes, choose the larger size for running shoes or basketball sneakers to allow natural foot expansion during movement.
            </p>

            <button
              onClick={() => setSizeGuideOpen(false)}
              className="mt-4 w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
