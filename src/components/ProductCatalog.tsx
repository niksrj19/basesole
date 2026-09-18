import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Star,
  ShoppingBag,
  Eye,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Product, Category, Brand } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useCart } from '../context/CartContext.tsx';

interface ProductCatalogProps {
  onSelectProduct: (productId: string) => void;
  initialCategory?: string;
  initialBrand?: string;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onSelectProduct,
  initialCategory,
  initialBrand,
}) => {
  const { t } = useLanguage();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(25000);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Quick added notification
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Distinct shoe sizes commonly available
  const availableSizes = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12];

  // Distinct popular shoe colorways
  const availableColors = [
    { name: 'Red', hex: '#ef4444' },
    { name: 'Black', hex: '#0f172a' },
    { name: 'White', hex: '#f8fafc', border: true },
    { name: 'Purple', hex: '#9333ea' },
    { name: 'Grey', hex: '#64748b' },
    { name: 'Blue', hex: '#2563eb' },
    { name: 'Orange', hex: '#ea580c' },
    { name: 'Green', hex: '#16a34a' },
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedBrand, selectedCategory, selectedColor, selectedSize, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBrand !== 'all') params.append('brand', selectedBrand);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedColor !== 'all') params.append('color', selectedColor);
      if (selectedSize !== 'all') params.append('size', selectedSize);
      if (search.trim()) params.append('search', search.trim());
      if (sortBy) params.append('sortBy', sortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        if (data.availableBrands) setBrands(data.availableBrands);
        if (data.availableCategories) setCategories(data.availableCategories);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const resetFilters = () => {
    setSelectedBrand('all');
    setSelectedCategory('all');
    setSelectedColor('all');
    setSelectedSize('all');
    setSearch('');
    setMinPrice(0);
    setMaxPrice(25000);
    setSortBy('featured');
  };

  const filteredByPrice = useMemo(() => {
    return products.filter((p) => p.price >= minPrice && p.price <= maxPrice);
  }, [products, minPrice, maxPrice]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSize = product.sizes[0] || 9.5;
    const defaultColor = product.colors[0] || 'Black';
    addToCart(product, defaultSize, defaultColor, 1);
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('catalog')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover performance shoes, limited collector drops, and everyday sneakers.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Main Grid: Filters Sidebar + Shoe Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden flex items-center justify-between">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-sm font-semibold text-slate-800"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters & Refine
          </button>

          {/* Sort selector for mobile */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
          >
            <option value="featured">{t('featured')}</option>
            <option value="price_asc">{t('priceLowHigh')}</option>
            <option value="price_desc">{t('priceHighLow')}</option>
            <option value="rating">{t('highestRated')}</option>
            <option value="newest">{t('newestArrivals')}</option>
          </select>
        </div>

        {/* Sidebar Filters (Desktop + Mobile Drawer) */}
        <aside
          className={`lg:block ${
            mobileFilterOpen
              ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto block'
              : 'hidden'
          } lg:relative lg:p-0 lg:z-auto lg:overflow-visible`}
        >
          {mobileFilterOpen && (
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 lg:hidden">
              <h2 className="text-lg font-bold text-slate-900">Filters</h2>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>
          )}

          <div className="space-y-6">
            {/* Filter Header with Reset */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Refine Kicks</span>
              <button
                onClick={resetFilters}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset All
              </button>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                {t('filterByBrand')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedBrand('all')}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    selectedBrand === 'all'
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  All Brands
                </button>
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrand(b.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      selectedBrand === b.id
                        ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                {t('filterByCategory')}
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === c.id
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter (Mandatory requirement #3 & #12) */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                {t('filterBySize')}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => setSelectedSize('all')}
                  className={`text-xs py-1.5 rounded-lg border text-center font-medium transition-colors ${
                    selectedSize === 'all'
                      ? 'bg-slate-900 text-white border-slate-900 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  All
                </button>
                {availableSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(String(sz))}
                    className={`text-xs py-1.5 rounded-lg border text-center font-medium transition-colors ${
                      selectedSize === String(sz)
                        ? 'bg-slate-900 text-white border-slate-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter (Mandatory requirement #3 & #12) */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                {t('filterByColor')}
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedColor('all')}
                  className={`text-xs px-2.5 py-1 rounded-md border font-medium ${
                    selectedColor === 'all'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  All Colors
                </button>
                {availableColors.map((col) => {
                  const isSelected = selectedColor.toLowerCase() === col.name.toLowerCase();
                  return (
                    <button
                      key={col.name}
                      onClick={() => setSelectedColor(isSelected ? 'all' : col.name)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 font-bold text-blue-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                      title={col.name}
                    >
                      <span
                        className="w-3 h-3 rounded-full inline-block border border-slate-300 shadow-xs"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span>{col.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
                <span>{t('filterByPrice')}</span>
                <span className="text-blue-600 font-bold font-mono">
                  ₹{minPrice.toLocaleString('en-IN')} - ₹{maxPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {mobileFilterOpen && (
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm"
              >
                Apply Filters
              </button>
            )}
          </div>
        </aside>

        {/* Product Cards Grid */}
        <main className="lg:col-span-3">
          {/* Top Sort Controls */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <span className="text-xs text-slate-500">
              Showing <strong className="text-slate-800">{filteredByPrice.length}</strong> styles
            </span>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span>{t('sortBy')}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="featured">{t('featured')}</option>
                <option value="price_asc">{t('priceLowHigh')}</option>
                <option value="price_desc">{t('priceHighLow')}</option>
                <option value="rating">{t('highestRated')}</option>
                <option value="newest">{t('newestArrivals')}</option>
              </select>
            </div>
          </div>

          {/* Grid or Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse bg-white">
                  <div className="aspect-[4/3] bg-slate-100 rounded-xl"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                  <div className="h-5 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredByPrice.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl border border-slate-200">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Shoes Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No kicks matched your chosen combination of filters. Try clearing some filters or searching a different term.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredByPrice.map((product) => {
                const discount = product.comparePrice
                  ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                  : 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => onSelectProduct(product.id)}
                    className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
                    id={`product-card-${product.id}`}
                  >
                    {/* Badge Pill for Discount or Category */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                      {discount > 0 && (
                        <span className="bg-rose-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm">
                          {discount}% OFF
                        </span>
                      )}
                      <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {product.brandName}
                      </span>
                    </div>

                    {/* Stock Status Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      {product.stock <= 5 ? (
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Only {product.stock} left
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          In Stock
                        </span>
                      )}
                    </div>

                    {/* Shoe Image Box */}
                    <div className="aspect-[4/3] bg-slate-50 p-4 flex items-center justify-center overflow-hidden relative">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Content Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span>{product.categoryName}</span>
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{product.rating}</span>
                            <span className="text-slate-400">({product.reviewCount})</span>
                          </div>
                        </div>

                        <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>

                        {/* Colors & Sizes summary */}
                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                          <span>{product.colors.length} Colorways</span>
                          <span className="font-mono">Sizes: US {product.sizes[0]} - {product.sizes[product.sizes.length - 1]}</span>
                        </div>
                      </div>

                      {/* Price & Action Row */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-extrabold text-slate-900 font-mono">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            {product.comparePrice && (
                              <span className="text-xs text-slate-400 line-through font-mono">
                                ₹{product.comparePrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleQuickAdd(product, e)}
                          className={`p-2.5 rounded-xl transition-all flex items-center gap-1 text-xs font-semibold ${
                            justAddedId === product.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-900 text-white hover:bg-blue-600 active:scale-95 shadow-sm'
                          }`}
                          title="Quick Add to Cart (Default Size)"
                        >
                          {justAddedId === product.id ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span className="hidden sm:inline">Added!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4" />
                              <span className="hidden sm:inline">Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
