import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import NavBar from '../components/NavBar';
import { toast } from 'react-toastify';

const CartPage = () => {
    const { 
        cartItems: cart, 
        removeFromCart, 
        updateCartItemQuantity, 
        clearCart, 
        getCartTotal, 
        getCartItemsCount,
        loading: cartLoading 
    } = useCart();
    
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [userCart, setUserCart] = useState([]);

    const colors = {
        primary: '#00A9FF',
        secondary: '#89CFF3',
        accent: '#A0E9FF',
        background: '#CDF5FD',
        text: '#0B0C10',
        error: '#EF4444',
        success: '#10B981'
    };

    // Filter cart items for current user
    useEffect(() => {
        if (user && user.id) {
            // Filter cart for logged-in user
            const filteredCart = cart.filter(item => item.userId === user.id);
            setUserCart(filteredCart);
        } else {
            // For guest users, filter by 'guest' userId
            const guestCart = cart.filter(item => item.userId === 'guest');
            setUserCart(guestCart);
        }
    }, [cart, user]);

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity < 1) {
            // If quantity becomes 0, remove the item
            await handleRemoveItem(productId);
            return;
        }
        
        try {
            const result = await updateCartItemQuantity(productId, newQuantity);
            if (result.success) {
                toast.success('Quantity updated');
            } else {
                toast.error('Failed to update quantity');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('Error updating quantity');
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            const result = await removeFromCart(productId);
            if (result.success) {
                toast.success('Item removed from cart');
            } else {
                toast.error('Failed to remove item');
            }
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Error removing item');
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            try {
                const result = await clearCart();
                if (result.success) {
                    toast.success('Cart cleared successfully');
                } else {
                    toast.error('Failed to clear cart');
                }
            } catch (error) {
                console.error('Error clearing cart:', error);
                toast.error('Error clearing cart');
            }
        }
    };

    const handleContinueShopping = () => {
        navigate('/products');
    };

    const handleCheckout = async () => {
        console.log('Checkout initiated');
        console.log('User:', user);
        console.log('Cart items:', userCart.length);
        
        setCheckoutLoading(true);

        try {
            // Check if cart is empty
            if (userCart.length === 0) {
                toast.warning('Your cart is empty');
                setCheckoutLoading(false);
                return;
            }

            // For guest users, redirect to login
            if (!user) {
                toast.info('Please login to proceed with checkout');
                sessionStorage.setItem('returnToCheckout', 'true');
                navigate('/login');
                return;
            }

            // For logged-in users, proceed to checkout
            console.log('Proceeding to checkout for user:', user.id);
            navigate('/checkout');
            
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Error during checkout');
        } finally {
            setCheckoutLoading(false);
        }
    };

    // Show loading while checking authentication or cart
    if (authLoading || cartLoading) {
        return (
            <>
                <NavBar />
                <div className="min-h-screen pt-20 flex items-center justify-center" style={{ backgroundColor: colors.background }}>
                    <div className="text-center">
                        <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4" style={{ color: colors.primary }} />
                        <p className="text-gray-600">Loading your cart...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // Show empty cart if cart is empty
    if (userCart.length === 0) {
        return (
            <>
                <NavBar />
                <div className="min-h-screen pt-20 flex items-center justify-center" style={{ backgroundColor: colors.background }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-white mb-6">
                                <ShoppingBag size={48} style={{ color: colors.primary }} />
                            </div>
                            <h1 className="text-3xl font-bold mb-4" style={{ color: colors.text }}>
                                Your Cart is Empty
                            </h1>
                            <p className="text-lg mb-8" style={{ color: colors.text, opacity: 0.7 }}>
                                {user ? `Hello ${user.username}! ` : ''}Looks like you haven't added any products to your cart yet.
                            </p>
                            <button
                                onClick={handleContinueShopping}
                                className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                                style={{ backgroundColor: colors.primary }}
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // Calculate totals
    const subtotal = getCartTotal();
    const shipping = subtotal > 5000 ? 0 : 200;
    const tax = subtotal * 0.18;
    const total = subtotal + shipping + tax;

    return (
        <>
            <NavBar />
            <div className="min-h-screen pt-20" style={{ backgroundColor: colors.background }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleContinueShopping}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white transition-colors"
                                style={{ color: colors.primary }}
                            >
                                <ArrowLeft size={20} />
                                <span>Continue Shopping</span>
                            </button>
                            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: colors.text }}>
                                Shopping Cart
                            </h1>
                        </div>
                        
                        {userCart.length > 0 && (
                            <button
                                onClick={handleClearCart}
                                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start sm:self-center"
                            >
                                <Trash2 size={20} />
                                <span>Clear Cart</span>
                            </button>
                        )}
                    </div>

                    {/* User Status Messages */}
                    {user ? (
                        <div className="bg-linear-to-r from-green-50 to-green-100 border-l-4 border-green-400 p-4 mb-6 rounded">
                            <div className="flex items-center">
                                <div className="shrink-0">
                                    <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-800 font-medium">
                                        Welcome back, <span className="font-bold">{user.username}</span>! Your cart is saved to your account.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-linear-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400 p-4 mb-6 rounded">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                                    <div>
                                        <p className="text-sm text-yellow-800 font-medium">
                                            <span className="font-bold">You're browsing as a guest</span>
                                        </p>
                                        <p className="text-xs text-yellow-700 mt-1">
                                            Login to save your cart and access checkout
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                                >
                                    Login
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-lg border" style={{ borderColor: colors.accent }}>
                                <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: colors.accent }}>
                                    <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
                                        Cart Items ({getCartItemsCount()})
                                    </h2>
                                    <div className="text-sm text-gray-500">
                                        {user ? 'Account cart' : 'Guest cart'}
                                    </div>
                                </div>

                                <div className="divide-y" style={{ borderColor: colors.accent }}>
                                    {userCart.map((item) => (
                                        <div key={`${item.productId}-${item.userId}`} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                {/* Product Image */}
                                                <div className="shrink-0">
                                                    <img
                                                        src={item.productImage}
                                                        alt={item.productName}
                                                        className="w-24 h-24 object-contain rounded-lg bg-gray-100 p-2"
                                                        onError={(e) => {
                                                            e.target.src = `https://via.placeholder.com/150x150?text=Product`;
                                                        }}
                                                    />
                                                </div>

                                                {/* Product Details */}
                                                <div className="grow">
                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                        <div className="grow">
                                                            <h3 className="font-semibold text-lg mb-1" style={{ color: colors.text }}>
                                                                {item.productName}
                                                            </h3>
                                                            <p className="text-sm text-gray-500 mb-2">
                                                                {item.category || 'Water Purifier'}
                                                            </p>
                                                            
                                                            <div className="flex items-center gap-4">
                                                                {/* Price */}
                                                                <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                                                                    ₹{item.price.toLocaleString()}
                                                                </div>
                                                                
                                                                {/* Quantity Controls */}
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                                                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:shadow-sm"
                                                                        style={{
                                                                            backgroundColor: colors.accent,
                                                                            color: colors.primary
                                                                        }}
                                                                    >
                                                                        <Minus size={14} />
                                                                    </button>

                                                                    <span className="text-lg font-semibold w-8 text-center" style={{ color: colors.text }}>
                                                                        {item.quantity}
                                                                    </span>

                                                                    <button
                                                                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                                                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:shadow-sm"
                                                                        style={{
                                                                            backgroundColor: colors.accent,
                                                                            color: colors.primary
                                                                        }}
                                                                    >
                                                                        <Plus size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Item Total and Remove */}
                                                        <div className="flex flex-col items-end gap-2">
                                                            <div className="text-lg font-semibold" style={{ color: colors.text }}>
                                                                ₹{(item.price * item.quantity).toLocaleString()}
                                                            </div>

                                                            <button
                                                                onClick={() => handleRemoveItem(item.productId)}
                                                                className="flex items-center gap-2 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                                <span className="text-sm">Remove</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-lg border p-6 sticky top-28" style={{ borderColor: colors.accent }}>
                                <h2 className="text-xl font-semibold mb-6 pb-4 border-b" style={{ borderColor: colors.accent, color: colors.text }}>
                                    Order Summary
                                </h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between">
                                        <span style={{ color: colors.text, opacity: 0.7 }}>Subtotal ({getCartItemsCount()} items)</span>
                                        <span className="font-medium" style={{ color: colors.text }}>₹{subtotal.toLocaleString()}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span style={{ color: colors.text, opacity: 0.7 }}>Shipping</span>
                                        <span className="font-medium" style={{ color: colors.text }}>
                                            {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span style={{ color: colors.text, opacity: 0.7 }}>Tax (18%)</span>
                                        <span className="font-medium" style={{ color: colors.text }}>₹{tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                    </div>

                                    <div className="border-t pt-4" style={{ borderColor: colors.accent }}>
                                        <div className="flex justify-between text-lg font-bold">
                                            <span style={{ color: colors.text }}>Total Amount</span>
                                            <span style={{ color: colors.primary }}>₹{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Free Shipping Banner */}
                                {subtotal < 5000 && subtotal > 0 && (
                                    <div className="mb-6 p-4 rounded-lg text-center" 
                                         style={{ 
                                             backgroundColor: `${colors.accent}40`,
                                             border: `1px solid ${colors.accent}`
                                         }}>
                                        <p className="text-sm font-medium" style={{ color: colors.primary }}>
                                            🚚 Add ₹{(5000 - subtotal).toLocaleString()} more for <strong>FREE Shipping</strong>!
                                        </p>
                                    </div>
                                )}

                                {/* Checkout Button */}
                                <button
                                    onClick={handleCheckout}
                                    disabled={checkoutLoading || userCart.length === 0}
                                    className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 ${
                                        checkoutLoading ? 'opacity-70 cursor-not-allowed' : 
                                        userCart.length === 0 ? 'opacity-50 cursor-not-allowed' :
                                        'hover:shadow-xl hover:-translate-y-0.5'
                                    }`}
                                    style={{ 
                                        backgroundColor: colors.primary,
                                        background: user ? 'linear-gradient(135deg, #00A9FF, #0077B6)' : 'linear-gradient(135deg, #F59E0B, #D97706)'
                                    }}
                                >
                                    {checkoutLoading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : user ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Proceed to Checkout</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                            </svg>
                                            <span>Login to Checkout</span>
                                        </>
                                    )}
                                </button>

                                {/* Security Message */}
                                <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: colors.accent }}>
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-xs text-gray-600">
                                            Secure checkout • SSL encrypted
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {user ? `Logged in as ${user.username}` : 'Guest checkout available after login'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CartPage;