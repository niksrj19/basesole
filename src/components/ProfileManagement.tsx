import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Check,
  Shield,
  Phone,
  Mail,
  Ruler,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Address } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

export const ProfileManagement: React.FC = () => {
  const { user, updateUserProfile, fetchWithAuth } = useAuth();
  const { t } = useLanguage();

  // Profile Fields
  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [preferredSize, setPreferredSize] = useState<number>(user?.preferredSize || 9.5);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState<boolean>(false);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(true);
  const [addressModalOpen, setAddressModalOpen] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Address modal form
  const [formRecipient, setFormRecipient] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formApt, setFormApt] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formPostal, setFormPostal] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formIsDefault, setFormIsDefault] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhoneNumber(user.phoneNumber || '');
      if (user.preferredSize) setPreferredSize(user.preferredSize);
    }
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await fetchWithAuth('/api/user/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const success = await updateUserProfile({
      name,
      phoneNumber,
      preferredSize: Number(preferredSize),
    });
    setIsSavingProfile(false);
    if (success) {
      setProfileSavedSuccess(true);
      setTimeout(() => setProfileSavedSuccess(false), 2500);
    }
  };

  const handleOpenNewAddress = () => {
    setEditingAddress(null);
    setFormRecipient(user?.name || '');
    setFormStreet('');
    setFormApt('');
    setFormCity('');
    setFormState('');
    setFormPostal('');
    setFormCountry('');
    setFormPhone(user?.phoneNumber || '');
    setFormIsDefault(addresses.length === 0);
    setAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setFormRecipient(addr.recipientName);
    setFormStreet(addr.street);
    setFormApt(addr.apartment || '');
    setFormCity(addr.city);
    setFormState(addr.state);
    setFormPostal(addr.postalCode);
    setFormCountry(addr.country);
    setFormPhone(addr.phoneNumber);
    setFormIsDefault(addr.isDefault);
    setAddressModalOpen(true);
  };

  const handleSaveAddressModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRecipient || !formStreet || !formCity || !formState || !formPostal || !formCountry || !formPhone) {
      alert('Please fill out all required address fields.');
      return;
    }

    const payload = {
      recipientName: formRecipient,
      street: formStreet,
      apartment: formApt,
      city: formCity,
      state: formState,
      postalCode: formPostal,
      country: formCountry,
      phoneNumber: formPhone,
      isDefault: formIsDefault,
    };

    try {
      if (editingAddress) {
        await fetchWithAuth(`/api/user/addresses/${editingAddress.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetchWithAuth('/api/user/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setAddressModalOpen(false);
      fetchAddresses();
    } catch (err) {
      console.error('Error saving address:', err);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to remove this address?')) return;
    try {
      await fetchWithAuth(`/api/user/addresses/${id}`, {
        method: 'DELETE',
      });
      fetchAddresses();
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  const handleSetDefault = async (addr: Address) => {
    try {
      await fetchWithAuth(`/api/user/addresses/${addr.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      fetchAddresses();
    } catch (err) {
      console.error('Error setting default address:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="profile-management-container">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('profile')} & Shipping Addresses
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal information, footwear size preferences, and saved shipping destinations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Left Column: Personal Information Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
                <span className="text-[11px] font-semibold text-slate-500">{user?.email}</span>
                <span className="inline-block ml-2 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded uppercase">
                  {user?.role}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Google Account (Sign-In Restricted)
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Google Verified
                  </span>
                </div>
                <div className="relative">
                  <div className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2">
                    <svg viewBox="0 0 24 24" className="w-4 h-4">
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
                  </div>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl cursor-not-allowed font-medium"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  SoleVault user login is exclusively tied to your verified Google account.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Shoe Size (US Men)
                </label>
                <div className="relative">
                  <Ruler className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={preferredSize}
                    onChange={(e) => setPreferredSize(Number(e.target.value))}
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold"
                  >
                    {[7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12].map((s) => (
                      <option key={s} value={s}>
                        US {s}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  We pre-select this size automatically when you view kicks.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  {profileSavedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Profile Updated Successfully!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isSavingProfile ? 'Saving...' : 'Update Personal Information'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Saved Shipping Addresses */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">{t('shippingAddress')}</h3>
              </div>
              <button
                onClick={handleOpenNewAddress}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('addNewAddress')}</span>
              </button>
            </div>

            {loadingAddresses ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading addresses...</div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 mt-4">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No Shipping Addresses Saved</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Save your home, work, or gym address for seamless QR checkout.
                </p>
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      addr.isDefault
                        ? 'border-blue-500 bg-blue-50/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {addr.recipientName}
                          </span>
                          {addr.isDefault ? (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSetDefault(addr)}
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              Set as Default
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          {addr.street} {addr.apartment && `Apt ${addr.apartment}`}
                        </p>
                        <p className="text-xs text-slate-600">
                          {addr.city}, {addr.state} {addr.postalCode} • {addr.country}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">Phone: {addr.phoneNumber}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditAddress(addr)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          title="Edit Address"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 transition-colors"
                          title="Delete Address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Address Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingAddress ? 'Edit Shipping Address' : 'Add New Shipping Address'}
              </h3>
              <button
                onClick={() => setAddressModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddressModal} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  value={formRecipient}
                  onChange={(e) => setFormRecipient(e.target.value)}
                  required
                  placeholder="e.g. Alex Hunter"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={formStreet}
                    onChange={(e) => setFormStreet(e.target.value)}
                    required
                    placeholder="450 Broadway Ave"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Apt / Suite
                  </label>
                  <input
                    type="text"
                    value={formApt}
                    onChange={(e) => setFormApt(e.target.value)}
                    placeholder="Suite 12B"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    required
                    placeholder="Portland"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    required
                    placeholder="OR"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Zip Code *</label>
                  <input
                    type="text"
                    value={formPostal}
                    onChange={(e) => setFormPostal(e.target.value)}
                    required
                    placeholder="97201"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Country *</label>
                <input
                  type="text"
                  value={formCountry}
                  onChange={(e) => setFormCountry(e.target.value)}
                  required
                  placeholder="India"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  required
                  placeholder="+1 (555) 000-0000"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={formIsDefault}
                    onChange={(e) => setFormIsDefault(e.target.checked)}
                    className="accent-blue-600 rounded"
                  />
                  <span>Make this my default shipping address</span>
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
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