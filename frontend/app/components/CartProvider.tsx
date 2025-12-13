"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CartItem {
  artworkId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (artworkId: string) => void;
  updateQuantity: (artworkId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'shilpohaat_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);

  // Load cart from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      // Check if window is defined (client-side)
      if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
            setCartItems(parsedCart);
            console.log('✓ Loaded cart from localStorage:', parsedCart.length, 'items');
          }
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        console.log('✓ Saved cart to localStorage:', cartItems.length, 'items');
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
  }, [cartItems, isLoaded]);

  const addToCart = useCallback((item: CartItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.artworkId === item.artworkId);
      if (existingItem) {
        // Increase quantity if item already in cart
        console.log(`✓ Increased quantity: ${existingItem.title}`);
        return prevItems.map((i) =>
          i.artworkId === item.artworkId
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      // Add new item
      console.log(`✓ Added to cart: ${item.title}`);
      return [...prevItems, { ...item, quantity: item.quantity || 1 }];
    });
  }, []);

  const removeFromCart = useCallback((artworkId: string) => {
    setCartItems((prevItems) => {
      const removed = prevItems.find((i) => i.artworkId === artworkId);
      if (removed) {
        console.log(`✓ Removed from cart: ${removed.title}`);
      }
      return prevItems.filter((i) => i.artworkId !== artworkId);
    });
  }, []);

  const updateQuantity = useCallback((artworkId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(artworkId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((i) =>
          i.artworkId === artworkId ? { ...i, quantity } : i
        )
      );
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    console.log('✓ Cart cleared');
    setCartItems([]);
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Simple shipping: free for orders > 10000 BDT, otherwise 200 BDT
  const calculatedShippingCost = subtotal > 10000 ? 0 : 200;
  const totalAmount = subtotal + calculatedShippingCost;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        shippingCost: calculatedShippingCost,
        totalAmount,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
