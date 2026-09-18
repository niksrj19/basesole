import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types.ts';
import { useAuth } from './AuthContext.tsx';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: number, color: string, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const normalizeCartColor = (color: string) => color.trim().replace(/\s+/g, ' ').toLowerCase();

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: isAuthLoading, fetchWithAuth } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('solevault_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      setItems([]);
      localStorage.removeItem('solevault_cart');
      return;
    }

    const loadUserCart = async () => {
      try {
        const guestItems = items;
        if (guestItems.length > 0) {
          for (const item of guestItems) {
            await fetchWithAuth('/api/cart/items', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId: item.productId, size: item.size, color: item.color, quantity: item.quantity }),
            });
          }
          localStorage.removeItem('solevault_cart');
        }
        const response = await fetchWithAuth('/api/cart');
        if (response.ok) {
          const data = await response.json();
          setItems(data.items || []);
        }
      } catch (error) {
        console.error('Failed to load user cart:', error);
      }
    };

    loadUserCart();
  }, [isAuthLoading, isAuthenticated]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      localStorage.setItem('solevault_cart', JSON.stringify(items));
    }
  }, [items, isAuthLoading, isAuthenticated]);

  const addToCart = async (product: Product, size: number, color: string, quantity = 1) => {
    const normalizedColor = normalizeCartColor(color);
    if (isAuthenticated) {
      const response = await fetchWithAuth('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, size, color: normalizedColor, quantity }),
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
      setIsCartOpen(true);
      return;
    }

    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.productId === product.id && item.size === size && normalizeCartColor(item.color) === normalizedColor
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: Number((product.price * newQty).toFixed(2)),
        };
        return updated;
      }

      const newItem: CartItem = {
        id: `cart-${product.id}-${size}-${color.replace(/\s+/g, '')}`,
        productId: product.id,
        product,
        quantity,
        size,
        color: normalizedColor,
        unitPrice: product.price,
        totalPrice: Number((product.price * quantity).toFixed(2)),
      };
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = async (itemId: string, newQty: number) => {
    if (isAuthenticated) {
      const response = await fetchWithAuth(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty }),
      });
      if (response.ok) setItems((await response.json()).items || []);
      return;
    }
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: newQty,
            totalPrice: Number((item.unitPrice * newQty).toFixed(2)),
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = async (itemId: string) => {
    if (isAuthenticated) {
      const response = await fetchWithAuth(`/api/cart/items/${itemId}`, { method: 'DELETE' });
      if (response.ok) setItems((await response.json()).items || []);
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      await fetchWithAuth('/api/cart', { method: 'DELETE' });
    }
    setItems([]);
    localStorage.removeItem('solevault_cart');
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Number(items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2));
  const tax = Number((subtotal * 0.08).toFixed(2));
  const shippingFee = subtotal === 0 || subtotal >= 150 ? 0 : 12.0;
  const total = Number((subtotal + tax + shippingFee).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemsCount,
        subtotal,
        tax,
        shippingFee,
        total,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
