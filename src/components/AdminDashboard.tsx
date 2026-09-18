import React, { useState, useEffect } from 'react';
import {
  Shield,
  Package,
  TrendingUp,
  Users,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  ShoppingBag,
  CheckCircle,
  Truck,
  ArrowUpDown,
  Search,
  Filter,
  QrCode,
  Save,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Product, Order, User, Role, OrderStatus, Category, Brand } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

export const AdminDashboard: React.FC = () => {
  const { user, fetchWithAuth } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'SALES' | 'USERS' | 'QR_SETTINGS'>('INVENTORY');
  const [metrics, setMetrics] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Static QR Code settings state
  const [qrSettings, setQrSettings] = useState<{
    publishedQrCode: string;
    upiId: string;
    merchantName: string;
    notes: string;
  }>({
    publishedQrCode: '',
    upiId: '8058618106@ybl',
    merchantName: 'SoleVault Premium Shoes Nitesh ',
    notes: 'Scan via Google Pay, PhonePe, Paytm, BHIM, or any UPI banking app.',
  });
  const [qrSaving, setQrSaving] = useState(false);
  const [qrSuccess, setQrSuccess] = useState(false);

  // Search in inventory
  const [invSearch, setInvSearch] = useState<string>('');

  // Add / Edit Product Modal state
  const [productModalOpen, setProductModalOpen] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodBrandId, setProdBrandId] = useState('b-nike');
  const [prodCategoryId, setProdCategoryId] = useState('cat-running');
  const [prodPrice, setProdPrice] = useState(8999);
  const [prodComparePrice, setProdComparePrice] = useState(10999);
  const [prodStock, setProdStock] = useState(15);
  const [prodColors, setProdColors] = useState('Black, White, Red');
  const [prodSizes, setProdSizes] = useState('8, 8.5, 9, 9.5, 10, 11');
  const [prodImages, setProdImages] = useState(
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80'
  );
  const [prodDescription, setProdDescription] = useState(
    'High-performance athletic sneaker with advanced cushioning and durable traction.'
  );

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [resMetrics, resProds, resOrders, resUsers, resCats, resBrands, resSettings] = await Promise.all([
        fetchWithAuth('/api/admin/metrics'),
        fetchWithAuth('/api/products'),
        fetchWithAuth('/api/orders'),
        fetchWithAuth('/api/admin/users'),
        fetch('/api/categories'),
        fetch('/api/brands'),
        fetch('/api/settings'),
      ]);

      if (resMetrics.ok) setMetrics(await resMetrics.json());
      if (resProds.ok) {
        const pData = await resProds.json();
        setProducts(pData.products || []);
      }
      if (resOrders.ok) {
        const oData = await resOrders.json();
        setOrders(oData.orders || []);
      }
      if (resUsers.ok) {
        const uData = await resUsers.json();
        setUsers(uData.users || []);
      }
      if (resCats.ok) {
        const cData = await resCats.json();
        setCategories(cData.categories || []);
      }
      if (resBrands.ok) {
        const bData = await resBrands.json();
        setBrands(bData.brands || []);
      }
      if (resSettings.ok) {
        const sData = await resSettings.json();
        if (sData.settings) {
          setQrSettings(sData.settings);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQrSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setQrSaving(true);
    setQrSuccess(false);
    try {
      const res = await fetchWithAuth('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qrSettings),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setQrSettings(data.settings);
        }
        setQrSuccess(true);
        setTimeout(() => setQrSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save QR settings:', err);
    } finally {
      setQrSaving(false);
    }
  };

  const handleRegenerateQr = async () => {
    setQrSaving(true);
    try {
      const res = await fetchWithAuth('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...qrSettings,
          publishedQrCode: '', // Trigger regeneration from UPI ID
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setQrSettings(data.settings);
        }
        setQrSuccess(true);
        setTimeout(() => setQrSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to regenerate QR:', err);
    } finally {
      setQrSaving(false);
    }
  };

  const handleStockAdjust = async (productId: string, delta: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const newStock = Math.max(0, prod.stock + delta);

    try {
      const res = await fetchWithAuth(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
        );
      }
    } catch (err) {
      console.error('Failed to update stock:', err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to permanently delete this shoe from inventory?')) return;
    try {
      const res = await fetchWithAuth(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdName('');
    setProdBrandId(brands[0]?.id || 'b-nike');
    setProdCategoryId(categories[0]?.id || 'cat-running');
    setProdPrice(140);
    setProdComparePrice(180);
    setProdStock(20);
    setProdColors('Black, White, Blue');
    setProdSizes('8, 8.5, 9, 9.5, 10, 11');
    setProdImages('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80');
    setProdDescription('High performance sneaker engineered for competitive comfort.');
    setProductModalOpen(true);
  };

  const handleSaveProductModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const colorsArr = prodColors.split(',').map((c) => c.trim()).filter(Boolean);
    const sizesArr = prodSizes.split(',').map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
    const imagesArr = prodImages.split(',').map((i) => i.trim()).filter(Boolean);

    const payload = {
      name: prodName,
      brandId: prodBrandId,
      categoryId: prodCategoryId,
      price: Number(prodPrice),
      comparePrice: prodComparePrice ? Number(prodComparePrice) : undefined,
      stock: Number(prodStock),
      colors: colorsArr,
      sizes: sizesArr,
      images: imagesArr,
      description: prodDescription,
    };

    try {
      if (editingProductId) {
        const res = await fetchWithAuth(`/api/products/${editingProductId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setProductModalOpen(false);
          loadDashboardData();
        }
      } else {
        const res = await fetchWithAuth('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setProductModalOpen(false);
          loadDashboardData();
        }
      }
    } catch (err) {
      console.error('Failed to save shoe:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetchWithAuth(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleToggleUserRole = async (userId: string, currentRole: Role) => {
    const nextRole: Role = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    if (!confirm(`Change user access role to ${nextRole}?`)) return;

    try {
      const res = await fetchWithAuth(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u))
        );
      }
    } catch (err) {
      console.error('Failed to change role:', err);
    }
  };

  const filteredInventory = products.filter(
    (p) =>
      p.name.toLowerCase().includes(invSearch.toLowerCase()) ||
      p.brandName.toLowerCase().includes(invSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(invSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="admin-dashboard-container">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('adminDashboard')}
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Admin Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete store management: live inventory control, sales analytics, and customer accounts.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'INVENTORY'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventory ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('SALES')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'SALES'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Sales & Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'USERS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('QR_SETTINGS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'QR_SETTINGS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Payment Settings</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Revenue
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            ₹{metrics?.totalRevenue ? metrics.totalRevenue.toLocaleString('en-IN') : '0'}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            Verified QR payments received
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Orders Placed
            </span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {metrics?.totalOrders || orders.length}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Processed securely</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Low Stock Alerts
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 font-mono">
            {metrics?.lowStockItems || products.filter((p) => p.stock <= 5).length}
          </div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Items under 5 units left</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Accounts
            </span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {metrics?.totalUsers || users.length}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Gmail verified members</p>
        </div>
      </div>

      {/* TAB 1: PRODUCT INVENTORY */}
      {activeTab === 'INVENTORY' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Inventory Controls */}
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={invSearch}
                onChange={(e) => setInvSearch(e.target.value)}
                placeholder="Search kicks by name, SKU, brand..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              id="admin-add-shoe-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Shoe Drop</span>
            </button>
          </div>

          {/* Shoes Inventory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <th className="py-3 px-4">Shoe</th>
                  <th className="py-3 px-4">Brand & Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Available Sizes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Thumbnail & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{prod.name}</p>
                          <span className="font-mono text-[10px] text-slate-400">{prod.sku}</span>
                        </div>
                      </div>
                    </td>

                    {/* Brand & Category */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{prod.brandName}</span>
                      <span className="text-slate-400 block text-[11px]">{prod.categoryName}</span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </td>

                    {/* Stock with quick +/- adjustment */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                            prod.stock <= 5
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {prod.stock} units
                        </span>

                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => handleStockAdjust(prod.id, -1)}
                            className="w-5 h-5 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 text-xs"
                            title="Decrease stock"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleStockAdjust(prod.id, 1)}
                            className="w-5 h-5 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 text-xs"
                            title="Increase stock"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Sizes */}
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {prod.sizes.slice(0, 4).join(', ')}
                      {prod.sizes.length > 4 && ` +${prod.sizes.length - 4} more`}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                        title="Delete Shoe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SALES & ORDERS */}
      {activeTab === 'SALES' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Customer Orders & Fulfillment</h3>
              <p className="text-xs text-slate-500">
                Track QR payment verification and update shipping dispatch statuses.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <th className="py-3 px-4">Order ID & Date</th>
                    <th className="py-3 px-4">Customer & Destination</th>
                    <th className="py-3 px-4">Shoes Ordered</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 block">{order.id}</span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {order.shippingAddress ? (
                          <>
                            <span className="font-bold text-slate-800 block">
                              {order.shippingAddress.recipientName}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {order.shippingAddress.city}, {order.shippingAddress.state}
                            </span>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-500">Address unavailable</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-700 font-medium">
                          {order.items.length} {order.items.length === 1 ? 'pair' : 'pairs'}:
                        </span>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">
                          {order.items.map((i) => i.productName).join(', ')}
                        </p>
                      </td>

                      <td className="py-3 px-4 font-mono font-extrabold text-slate-900">
                        ₹{order.total.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                          }
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none"
                        >
                          <option value="PROCESSING">Processing</option>
                          <option value="PAYMENT_VERIFIED">Payment Verified</option>
                          <option value="SHIPPED">Shipped (In Transit)</option>
                          <option value="DELIVERED">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER ACCOUNTS */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Registered Gmail Customer Accounts</h3>
            <p className="text-xs text-slate-500">
              Users authenticated via Gmail with JWT access and refresh token sessions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role Permission</th>
                  <th className="py-3 px-4">Total Orders</th>
                  <th className="py-3 px-4">Total Spent</th>
                  <th className="py-3 px-4 text-right">Role Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <span className="text-[11px] text-slate-500">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          u.role === 'ADMIN'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {u.orderCount || 0} orders
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ₹{u.totalSpent ? Number(u.totalSpent).toLocaleString('en-IN') : '0'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleUserRole(u.id, u.role)}
                        className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700"
                      >
                        Switch to {u.role === 'ADMIN' ? 'Customer' : 'Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PUBLISHED QR CODE & UPI SETTINGS */}
      {activeTab === 'QR_SETTINGS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Store Payment QR Code & UPI Configuration</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Configure the store's static payment QR code and UPI details. This exact QR code is published and displayed to all customers during checkout.
              </p>
            </div>
            {qrSuccess && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                <Check className="w-4 h-4" />
                Published & Saved!
              </span>
            )}
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Published QR Preview */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center text-center">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                Live Published Customer QR Preview
              </span>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-[260px] w-full aspect-square flex items-center justify-center">
                {qrSettings.publishedQrCode ? (
                  <img
                    src={qrSettings.publishedQrCode}
                    alt="Store Static Payment QR Code"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-slate-400 text-xs flex flex-col items-center gap-2">
                    <QrCode className="w-12 h-12 text-slate-300 animate-pulse" />
                    <span>No QR Published Yet</span>
                  </div>
                )}
              </div>

              <div className="mt-4 w-full text-left space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payee Name:</span>
                  <span className="font-bold text-slate-900">{qrSettings.merchantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">UPI ID:</span>
                  <span className="font-mono font-bold text-blue-600">{qrSettings.upiId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Currency:</span>
                  <span className="font-bold text-emerald-600">INR (₹)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRegenerateQr}
                disabled={qrSaving}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${qrSaving ? 'animate-spin' : ''}`} />
                <span>Re-generate QR from UPI ID</span>
              </button>
            </div>

            {/* Right: Settings Form */}
            <form onSubmit={handleSaveQrSettings} className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payee / Merchant Display Name *
                </label>
                <input
                  type="text"
                  value={qrSettings.merchantName}
                  onChange={(e) => setQrSettings({ ...qrSettings, merchantName: e.target.value })}
                  required
                  placeholder="e.g. SoleVault Premium Shoes Ltd"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Store UPI ID (VPA) *
                </label>
                <input
                  type="text"
                  value={qrSettings.upiId}
                  onChange={(e) => setQrSettings({ ...qrSettings, upiId: e.target.value })}
                  required
                  placeholder="e.g. solevault.pay@oksbi"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-blue-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Customers scan this to pay via Google Pay, PhonePe, Paytm, CRED, or BHIM.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom QR Code Image (Data URL or Hosted Image URL)
                </label>
                <input
                  type="text"
                  value={qrSettings.publishedQrCode}
                  onChange={(e) => setQrSettings({ ...qrSettings, publishedQrCode: e.target.value })}
                  placeholder="data:image/png;base64,... or https://..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-blue-600 truncate"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave as is or click "Re-generate QR from UPI ID" to automatically generate the standard UPI QR code.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Instructions & Notes
                </label>
                <textarea
                  rows={3}
                  value={qrSettings.notes}
                  onChange={(e) => setQrSettings({ ...qrSettings, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-blue-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={qrSaving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{qrSaving ? 'Saving & Publishing...' : 'Save & Publish QR Code'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Shoe Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Add New Shoe to SoleVault Catalog</h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProductModal} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Shoe Name *</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  required
                  placeholder="e.g. Nike Dunk Low Retro Panda"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand *</label>
                  <select
                    value={prodBrandId}
                    onChange={(e) => setProdBrandId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-semibold"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={prodCategoryId}
                    onChange={(e) => setProdCategoryId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Compare Price (₹)</label>
                  <input
                    type="number"
                    value={prodComparePrice}
                    onChange={(e) => setProdComparePrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Count *</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Colorways (comma-separated)
                </label>
                <input
                  type="text"
                  value={prodColors}
                  onChange={(e) => setProdColors(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Available Sizes (US Men, comma-separated)
                </label>
                <input
                  type="text"
                  value={prodSizes}
                  onChange={(e) => setProdSizes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Image URL (High-res Unsplash shoe photo)
                </label>
                <input
                  type="text"
                  value={prodImages}
                  onChange={(e) => setProdImages(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
                >
                  Save Shoe to Inventory
                </button>
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
