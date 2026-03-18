import React, { createContext, useState, useEffect, useContext } from 'react';
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/api';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);

    const fetchWishlist = async () => {
        if (!user) {
            setWishlist([]);
            return;
        }
        setLoading(true);
        try {
            const response = await getWishlist();
            setWishlist(response.data || []);
        } catch (err) {
            console.error("Failed to fetch wishlist:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [user]);

    const toggleWishlist = async (productId) => {
        if (!user) {
            alert("Please login to manage your wishlist.");
            return;
        }

        const isItemInWishlist = wishlist.some(item => item.id === productId);

        try {
            if (isItemInWishlist) {
                await removeFromWishlist(productId);
                setWishlist(prev => prev.filter(item => item.id !== productId));
            } else {
                await addToWishlist(productId);
                // We could refetch or just add if we had the full product data.
                // For simplicity and accuracy, we refetch.
                fetchWishlist();
            }
        } catch (err) {
            console.error("Failed to toggle wishlist:", err);
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => item.id === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isInWishlist, fetchWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
