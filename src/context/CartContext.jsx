import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const API_BASE_URL = 'http://localhost:3001';

    // Fetch cart items when user changes
    useEffect(() => {
        const fetchCart = async () => {
            setLoading(true);
            try {
                if (user?.id) {
                    // Fetch from server for logged-in users
                    const response = await axios.get(`${API_BASE_URL}/cart?userId=${user.id}`);
                    console.log('Loaded cart from server:', response.data);
                    setCartItems(response.data || []);
                } else {
                    // Load from localStorage for guests
                    const guestCart = JSON.parse(localStorage.getItem('guest_cart')) || [];
                    console.log('Loaded guest cart:', guestCart);
                    setCartItems(guestCart);
                }
            } catch (error) {
                console.error('Error loading cart:', error);
                // Fallback to localStorage
                const fallbackCart = user?.id 
                    ? JSON.parse(localStorage.getItem(`cart_${user.id}`)) || []
                    : JSON.parse(localStorage.getItem('guest_cart')) || [];
                setCartItems(fallbackCart);
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [user]);

    // Main add to cart function - saves to db.json
    const addToCart = async (product) => {
        try {
            const userId = user?.id || 'guest';
            const userName = user?.username || 'Guest';
            const userEmail = user?.email || 'guest@example.com';
            
            console.log('Adding to cart for user:', userId, 'Product:', product);

            // Validation
            if (!product || !product.id) {
                throw new Error('Invalid product data');
            }

            // Prepare cart item data
            const cartItemData = {
                productId: product.id,
                userId: userId,
                userName: userName,
                userEmail: userEmail,
                productName: product.name || product.title,
                productImage: product.image,
                price: product.price,
                quantity: 1,
                category: product.category,
                stock: product.stock || 10,
                addedAt: new Date().toISOString()
            };

            console.log('Cart item data to save:', cartItemData);

            let result;
            let updatedItems;
            
            // Check if item already exists in current user's cart
            const existingItemIndex = cartItems.findIndex(
                item => item.productId === product.id && item.userId === userId
            );

            if (existingItemIndex > -1) {
                // Update quantity if item exists
                const updatedQuantity = cartItems[existingItemIndex].quantity + 1;
                const updatedItem = {
                    ...cartItems[existingItemIndex],
                    quantity: updatedQuantity
                };

                if (user?.id && cartItems[existingItemIndex].id) {
                    // Update on server for logged-in users
                    result = await axios.put(`${API_BASE_URL}/cart/${cartItems[existingItemIndex].id}`, updatedItem);
                    console.log('Updated item on server:', result.data);
                } else {
                    // For guests, update localStorage
                    const guestCart = JSON.parse(localStorage.getItem('guest_cart')) || [];
                    const updatedCart = guestCart.map(item => 
                        item.productId === product.id 
                        ? { ...item, quantity: updatedQuantity }
                        : item
                    );
                    localStorage.setItem('guest_cart', JSON.stringify(updatedCart));
                    result = { data: updatedItem };
                }
                
                // Update local state
                updatedItems = [...cartItems];
                updatedItems[existingItemIndex] = result.data;
                setCartItems(updatedItems);
                
            } else {
                // Add new item to cart
                if (user?.id) {
                    // Save to server for logged-in users
                    result = await axios.post(`${API_BASE_URL}/cart`, cartItemData);
                    console.log('Added item to server:', result.data);
                } else {
                    // Save to localStorage for guests
                    const guestCart = JSON.parse(localStorage.getItem('guest_cart')) || [];
                    guestCart.push(cartItemData);
                    localStorage.setItem('guest_cart', JSON.stringify(guestCart));
                    result = { data: cartItemData };
                }
                
                // Update local state
                updatedItems = [...cartItems, result.data];
                setCartItems(updatedItems);
            }

            // Update localStorage backup for logged-in users
            if (user?.id) {
                const userCart = updatedItems.filter(item => item.userId === userId);
                localStorage.setItem(`cart_${userId}`, JSON.stringify(userCart));
            }

            console.log('Cart operation successful:', result.data);
            return { success: true, data: result.data };

        } catch (error) {
            console.error('Error in addToCart:', error);
            return { 
                success: false, 
                error: error.message || 'Failed to add to cart'
            };
        }
    };

    // Remove from cart
    const removeFromCart = async (productId) => {
        try {
            const userId = user?.id || 'guest';
            console.log('Removing item:', productId, 'for user:', userId);

            // Find the item to remove
            const itemToRemove = cartItems.find(
                item => item.productId === productId && item.userId === userId
            );

            if (!itemToRemove) {
                return { success: false, error: 'Item not found in cart' };
            }

            // Update local state
            const updatedCart = cartItems.filter(item => 
                !(item.productId === productId && item.userId === userId)
            );
            setCartItems(updatedCart);

            // Remove from storage
            if (user?.id && itemToRemove.id) {
                // Remove from server if it has an ID
                await axios.delete(`${API_BASE_URL}/cart/${itemToRemove.id}`);
                console.log('Removed from server:', itemToRemove.id);
            }

            // Update localStorage
            if (user?.id) {
                const userCart = updatedCart.filter(item => item.userId === userId);
                localStorage.setItem(`cart_${userId}`, JSON.stringify(userCart));
            } else {
                localStorage.setItem('guest_cart', JSON.stringify(updatedCart.filter(item => item.userId === 'guest')));
            }

            return { success: true };

        } catch (error) {
            console.error('Error removing from cart:', error);
            return { success: false, error: error.message };
        }
    };

    // Update quantity
    const updateCartItemQuantity = async (productId, newQuantity) => {
        try {
            const userId = user?.id || 'guest';
            
            // Find the item
            const itemIndex = cartItems.findIndex(
                item => item.productId === productId && item.userId === userId
            );
            
            if (itemIndex === -1) {
                return { success: false, error: 'Item not found' };
            }
            
            if (newQuantity < 1) {
                return await removeFromCart(productId);
            }
            
            // Update local state
            const updatedCart = [...cartItems];
            updatedCart[itemIndex] = {
                ...updatedCart[itemIndex],
                quantity: newQuantity
            };
            setCartItems(updatedCart);
            
            // Update storage
            if (user?.id && updatedCart[itemIndex].id) {
                await axios.put(`${API_BASE_URL}/cart/${updatedCart[itemIndex].id}`, updatedCart[itemIndex]);
            }
            
            // Update localStorage
            if (user?.id) {
                const userCart = updatedCart.filter(item => item.userId === userId);
                localStorage.setItem(`cart_${userId}`, JSON.stringify(userCart));
            } else {
                localStorage.setItem('guest_cart', JSON.stringify(updatedCart.filter(item => item.userId === 'guest')));
            }
            
            return { success: true };
            
        } catch (error) {
            console.error('Error updating quantity:', error);
            return { success: false, error: error.message };
        }
    };

    // Clear cart
    const clearCart = async () => {
        try {
            const userId = user?.id || 'guest';
            
            // Get items for this user
            const userItems = cartItems.filter(item => item.userId === userId);
            
            // Remove from server
            if (user?.id) {
                for (const item of userItems) {
                    if (item.id) {
                        try {
                            await axios.delete(`${API_BASE_URL}/cart/${item.id}`);
                        } catch (error) {
                            console.warn('Failed to delete from server:', error);
                        }
                    }
                }
            }
            
            // Update local state
            const updatedCart = cartItems.filter(item => item.userId !== userId);
            setCartItems(updatedCart);
            
            // Clear localStorage
            if (user?.id) {
                localStorage.removeItem(`cart_${userId}`);
            } else {
                localStorage.removeItem('guest_cart');
            }
            
            return { success: true };
            
        } catch (error) {
            console.error('Error clearing cart:', error);
            return { success: false, error: error.message };
        }
    };

    // Helper functions
    const getCartItemQuantity = (productId) => {
        const userId = user?.id || 'guest';
        const item = cartItems.find(
            item => item.productId === productId && item.userId === userId
        );
        return item ? item.quantity : 0;
    };

    const getCartTotal = () => {
        const userId = user?.id || 'guest';
        return cartItems
            .filter(item => item.userId === userId)
            .reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartItemsCount = () => {
        const userId = user?.id || 'guest';
        return cartItems
            .filter(item => item.userId === userId)
            .reduce((total, item) => total + item.quantity, 0);
    };

    const getCurrentUserCart = () => {
        const userId = user?.id || 'guest';
        return cartItems.filter(item => item.userId === userId);
    };

    const value = {
        cartItems,
        loading,
        error,
        addToCart,
        getCartItemQuantity,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        getCurrentUserCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};