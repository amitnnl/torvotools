import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const localData = localStorage.getItem('cart');
        return localData ? JSON.parse(localData) : [];
    });
    const [coupon, setCoupon] = useState(null);
    const [discount, setDiscount] = useState(0);

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
        // Recalculate discount if cart changes
        if (coupon) {
            calculateDiscount(coupon);
        }
    }, [cart, coupon]);

    const calculateDiscount = (couponData) => {
        if (couponData.discount_type === 'percentage') {
            setDiscount((subtotal * couponData.discount_value) / 100);
        } else {
            setDiscount(couponData.discount_value);
        }
    };

    const applyCoupon = (couponData) => {
        setCoupon(couponData);
        calculateDiscount(couponData);
    };

    const removeCoupon = () => {
        setCoupon(null);
        setDiscount(0);
    };

    const addToCart = (product, quantity = 1) => {
        const existingProduct = cart.find(item => item.id === product.id);
        if (existingProduct) {
            setCart(cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
            ));
        } else {
            setCart([...cart, { ...product, quantity }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            setCart(cart.map(item =>
                item.id === productId ? { ...item, quantity } : item
            ));
        }
    };

    const clearCart = () => {
        setCart([]);
        removeCoupon();
    };

    const total = subtotal - discount;

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, total, coupon, discount, applyCoupon, removeCoupon }}>
            {children}
        </CartContext.Provider>
    );
};
