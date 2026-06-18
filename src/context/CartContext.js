'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('croppro_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch(e) {
      console.error('Failed to parse cart JSON', e);
      localStorage.removeItem('croppro_cart');
    }

    try {
      const savedUser = localStorage.getItem('croppro_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch(e) {
      console.error('Failed to parse user JSON', e);
      localStorage.removeItem('croppro_user');
    }
    
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('checkout') === '1') {
        setIsOpen(true);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [user]);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('croppro_cart', JSON.stringify(newCart));
  };

  const addToCart = (product, qty = 1) => {
    const existingIndex = cart.findIndex(item => item.p_id === product.p_id);
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].qty += qty;
      saveCart(newCart);
    } else {
      saveCart([...cart, {
        p_id: product.p_id,
        name: product.p_name,
        price: parseFloat(product.p_current_price),
        photo: product.p_featured_photo,
        qty: qty
      }]);
    }
    setIsOpen(true);
  };

  const removeFromCart = (productId) => {
    saveCart(cart.filter(item => item.p_id !== productId));
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
    } else {
      saveCart(cart.map(item => item.p_id === productId ? { ...item, qty } : item));
    }
  };

  const clearCart = () => {
    saveCart([]);
  };

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem('croppro_user', JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('croppro_user');
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider value={{
      cart,
      isOpen,
      setIsOpen,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      user,
      loginUser,
      logoutUser,
      cartTotal,
      cartCount,
      isInitialized
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
