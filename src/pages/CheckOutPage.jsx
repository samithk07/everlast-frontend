import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, CheckCircle, Shield, Lock, User, Package, Home, MapPin, Phone, Mail, Navigation, Globe, AlertCircle } from 'lucide-react';
import Footer from '../components/Footer';
import NavBar from '../components/NavBar';
import { toast } from 'react-toastify';
import axios from 'axios';

const CheckoutPage = () => {
    const { 
        getCurrentUserCart, 
        clearCart, 
        getCartTotal, 
        getCartItemsCount,
        cartItems: allCartItems
    } = useCart();
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    
    const [activePaymentMethod, setActivePaymentMethod] = useState('upi');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [touchedFields, setTouchedFields] = useState({});

    // Get current user's cart items
    const cart = getCurrentUserCart();

    // Form state
    const [formData, setFormData] = useState({
        // Delivery Information
        fullName: '',
        phoneNumber: '',
        email: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        
        // Payment Information
        upiId: '',
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
    });

    const [errors, setErrors] = useState({});

    const colors = {
        primary: '#00A9FF',
        secondary: '#89CFF3',
        accent: '#A0E9FF',
        background: '#CDF5FD',
        text: '#0B0C10',
        error: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B'
    };

    // API base URL
    const API_BASE_URL = 'http://localhost:3001';

    // Pre-fill user data on component mount
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.username || '',
                email: user.email || '',
            }));
        }
    }, [user]);

    // Load saved address if exists
    useEffect(() => {
        if (user?.id) {
            try {
                const savedAddress = localStorage.getItem(`user_address_${user.id}`);
                if (savedAddress) {
                    const addressData = JSON.parse(savedAddress);
                    setFormData(prev => ({
                        ...prev,
                        ...addressData
                    }));
                }
            } catch (error) {
                console.error('Error loading saved address:', error);
            }
        }
    }, [user]);

    // Redirect if cart is empty or user not logged in
    useEffect(() => {
        if (!loading) {
            if (cart.length === 0 && !showSuccessModal) {
                toast.info('Your cart is empty');
                navigate('/products');
            }
            if (!user && !showSuccessModal) {
                toast.info('Please login to checkout');
                navigate('/login');
            }
        }
    }, [cart, navigate, showSuccessModal, user, loading]);

    // Calculate order totals
    const subtotal = getCartTotal();
    const shipping = subtotal > 5000 ? 0 : 200;
    const tax = subtotal * 0.18;
    const total = subtotal + shipping + tax;

    // Generate random order ID
    const generateOrderId = () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `ORD${timestamp}${random}`;
    };

    // Enhanced validation functions (same as before)
    const validateField = (field, value) => {
        switch (field) {
            case 'fullName':
                if (!value.trim()) return 'Full name is required';
                if (value.length < 2) return 'Name must be at least 2 characters';
                if (value.length > 50) return 'Name is too long';
                return '';

            case 'phoneNumber':
                if (!value.trim()) return 'Phone number is required';
                if (!/^[6-9]\d{9}$/.test(value.replace(/\s/g, ''))) {
                    return 'Enter a valid 10-digit Indian mobile number';
                }
                return '';

            case 'email':
                if (!value.trim()) return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return 'Enter a valid email address';
                }
                return '';

            case 'addressLine1':
                if (!value.trim()) return 'Address line 1 is required';
                if (value.length < 5) return 'Address is too short';
                if (value.length > 100) return 'Address is too long';
                return '';

            case 'city':
                if (!value.trim()) return 'City is required';
                if (value.length < 2) return 'City name is too short';
                if (value.length > 50) return 'City name is too long';
                return '';

            case 'state':
                if (!value.trim()) return 'State is required';
                if (value.length < 2) return 'State name is too short';
                if (value.length > 50) return 'State name is too long';
                return '';

            case 'pincode':
                if (!value.trim()) return 'Pincode is required';
                if (!/^\d{6}$/.test(value)) return 'Enter a valid 6-digit pincode';
                const pincodeNum = parseInt(value);
                if (pincodeNum < 110000 || pincodeNum > 855117) {
                    return 'Enter a valid Indian pincode';
                }
                return '';

            case 'upiId':
                if (!value.trim()) return 'UPI ID is required';
                if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(value)) {
                    return 'Invalid UPI ID format (e.g., username@upi)';
                }
                return '';

            case 'cardNumber':
                if (!value.trim()) return 'Card number is required';
                const cleanCardNumber = value.replace(/\s/g, '');
                if (!/^\d{16}$/.test(cleanCardNumber)) return 'Card number must be 16 digits';
                if (!isValidLuhn(cleanCardNumber)) return 'Invalid card number';
                return '';

            case 'cardHolder':
                if (!value.trim()) return 'Card holder name is required';
                if (value.length < 2) return 'Name is too short';
                if (value.length > 50) return 'Name is too long';
                return '';

            case 'expiryDate':
                if (!value.trim()) return 'Expiry date is required';
                if (!/^\d{2}\/\d{2}$/.test(value)) return 'Format: MM/YY';
                const [month, year] = value.split('/');
                const currentYear = new Date().getFullYear() % 100;
                const currentMonth = new Date().getMonth() + 1;
                
                const monthNum = parseInt(month);
                const yearNum = parseInt(year);
                
                if (monthNum < 1 || monthNum > 12) return 'Invalid month';
                if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
                    return 'Card has expired';
                }
                if (yearNum > currentYear + 20) return 'Invalid expiry year';
                return '';

            case 'cvv':
                if (!value.trim()) return 'CVV is required';
                if (!/^\d{3,4}$/.test(value)) return 'CVV must be 3 or 4 digits';
                return '';

            default:
                return '';
        }
    };

    // Luhn algorithm for card validation
    const isValidLuhn = (cardNumber) => {
        let sum = 0;
        let shouldDouble = false;
        
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i));
            
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        
        return sum % 10 === 0;
    };

    // Delivery information validation
    const validateDeliveryInfo = () => {
        const newErrors = {};
        const fields = ['fullName', 'phoneNumber', 'email', 'addressLine1', 'city', 'state', 'pincode'];
        
        fields.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        return newErrors;
    };

    // Payment information validation
    const validatePaymentInfo = () => {
        const newErrors = {};

        if (activePaymentMethod === 'upi') {
            const error = validateField('upiId', formData.upiId);
            if (error) newErrors.upiId = error;
        } else {
            const fields = ['cardNumber', 'cardHolder', 'expiryDate', 'cvv'];
            fields.forEach(field => {
                const error = validateField(field, formData[field]);
                if (error) newErrors[field] = error;
            });
        }

        return newErrors;
    };

    // Check if form is valid
    const isDeliveryInfoValid = () => {
        return Object.keys(validateDeliveryInfo()).length === 0;
    };

    const isPaymentInfoValid = () => {
        return Object.keys(validatePaymentInfo()).length === 0;
    };

    // Handle field blur (touch)
    const handleFieldBlur = (field) => {
        setTouchedFields(prev => ({ ...prev, [field]: true }));
        
        const error = validateField(field, formData[field]);
        if (error) {
            setErrors(prev => ({ ...prev, [field]: error }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Handle form input changes with validation
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (touchedFields[field]) {
            const error = validateField(field, value);
            if (error) {
                setErrors(prev => ({ ...prev, [field]: error }));
            } else {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[field];
                    return newErrors;
                });
            }
        }
    };

    // Format phone number
    const formatPhoneNumber = (value) => {
        const phone = value.replace(/\D/g, '');
        if (phone.length <= 10) {
            return phone;
        }
        return phone.slice(0, 10);
    };

    // Format pincode
    const formatPincode = (value) => {
        const pincode = value.replace(/\D/g, '');
        if (pincode.length <= 6) {
            return pincode;
        }
        return pincode.slice(0, 6);
    };

    // Format card number with spaces
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        return parts.length ? parts.join(' ') : value;
    };

    // Format expiry date
    const formatExpiryDate = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
        }
        return v;
    };

    // Generate order details for storage
    const generateOrderDetails = () => {
        return {
            id: generateOrderId(),
            userId: user.id,
            userName: user.username,
            userEmail: user.email,
            
            // Delivery Information
            deliveryAddress: {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                addressLine1: formData.addressLine1,
                addressLine2: formData.addressLine2,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                country: formData.country
            },
            
            // Order Items
            items: cart.map(item => ({
                productId: item.productId,
                productName: item.productName || item.name,
                productImage: item.productImage || item.image,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity
            })),
            
            // Order Totals
            subtotal,
            shipping,
            tax,
            total,
            
            // Payment Information
            paymentMethod: activePaymentMethod,
            paymentDetails: activePaymentMethod === 'upi' 
                ? { upiId: formData.upiId }
                : { 
                    cardLast4: formData.cardNumber.slice(-4),
                    cardHolder: formData.cardHolder
                },
            
            status: 'confirmed',
            orderDate: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
    };

    // Save order to db.json (JSON Server)
    const saveOrderToDbJson = async (order) => {
        try {
            console.log('Saving order to db.json...');
            
            // Save to orders endpoint
            const response = await axios.post(`${API_BASE_URL}/orders`, order, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 201) {
                console.log('✅ Order saved to db.json successfully:', response.data);
                return true;
            } else {
                console.error('Failed to save order to db.json');
                return false;
            }
        } catch (error) {
            console.error('Error saving order to db.json:', error);
            return false;
        }
    };

    // Save order to localStorage (fallback)
    const saveOrderToLocalStorage = (order) => {
        try {
            const existingOrders = JSON.parse(localStorage.getItem('user_orders')) || {};
            
            if (!existingOrders[user.id]) {
                existingOrders[user.id] = [];
            }
            
            existingOrders[user.id].push(order);
            localStorage.setItem('user_orders', JSON.stringify(existingOrders));
            
            // Also save delivery address for future use
            localStorage.setItem(`user_address_${user.id}`, JSON.stringify(order.deliveryAddress));
            
            return true;
        } catch (error) {
            console.error('Error saving order to localStorage:', error);
            return false;
        }
    };

    // Check if server is available
    const isServerAvailable = async () => {
        try {
            await axios.get(`${API_BASE_URL}/orders`, { timeout: 3000 });
            return true;
        } catch (error) {
            console.log('JSON Server not available, using localStorage');
            return false;
        }
    };

    // Handle payment submission
    const handlePaymentSubmit = async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            toast.warning('Your cart is empty');
            navigate('/products');
            return;
        }

        if (!user) {
            toast.warning('Please log in to complete your purchase');
            navigate('/login');
            return;
        }

        // Validate both delivery and payment info
        const deliveryErrors = validateDeliveryInfo();
        const paymentErrors = validatePaymentInfo();
        const allErrors = { ...deliveryErrors, ...paymentErrors };

        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors);
            
            const allFields = ['fullName', 'phoneNumber', 'email', 'addressLine1', 'city', 'state', 'pincode'];
            if (activePaymentMethod === 'upi') {
                allFields.push('upiId');
            } else {
                allFields.push('cardNumber', 'cardHolder', 'expiryDate', 'cvv');
            }
            
            const newTouched = { ...touchedFields };
            allFields.forEach(field => { newTouched[field] = true; });
            setTouchedFields(newTouched);
            
            const firstErrorField = Object.keys(allErrors)[0];
            const element = document.getElementById(firstErrorField);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.focus();
            }
            
            toast.error('Please fix all errors before proceeding');
            return;
        }

        setIsProcessing(true);

        try {
            // Create order details
            const orderDetails = generateOrderDetails();
            const newOrderId = orderDetails.id;
            
            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Try to save to db.json first
            let saveSuccess = false;
            try {
                const serverAvailable = await isServerAvailable();
                if (serverAvailable) {
                    saveSuccess = await saveOrderToDbJson(orderDetails);
                    if (saveSuccess) {
                        toast.success(' Order saved to database successfully!');
                    }
                }
            } catch (serverError) {
                console.warn('Failed to save to db.json:', serverError);
            }
            
            // Always save to localStorage as backup
            const localStorageSuccess = saveOrderToLocalStorage(orderDetails);
            if (localStorageSuccess) {
                console.log(' Order saved to localStorage');
            }
            
            // Clear the cart
            await clearCart();
            
            // Show success
            setOrderId(newOrderId);
            setShowSuccessModal(true);
            
            toast.success(' Payment successful! Order placed.');
            
        } catch (error) {
            console.error('Payment error:', error);
            toast.error(' Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Continue shopping
    const handleContinueShopping = () => {
        setShowSuccessModal(false);
        navigate('/products');
    };

    // View order details
    // const handleViewOrders = () => {
    //     setShowSuccessModal(false);
    //     navigate('/cart');
    // };

    // Check if all required fields are filled for delivery
    const isDeliveryComplete = () => {
        const requiredFields = ['fullName', 'phoneNumber', 'email', 'addressLine1', 'city', 'state', 'pincode'];
        return requiredFields.every(field => formData[field].trim() !== '');
    };

    // Check if all required fields are filled for payment
    const isPaymentComplete = () => {
        if (activePaymentMethod === 'upi') {
            return formData.upiId.trim() !== '';
        } else {
            return formData.cardNumber.trim() !== '' && 
                   formData.cardHolder.trim() !== '' && 
                   formData.expiryDate.trim() !== '' && 
                   formData.cvv.trim() !== '';
        }
    };

    // Show form completion status
    const getCompletionStatus = () => {
        const deliveryComplete = isDeliveryComplete();
        const paymentComplete = isPaymentComplete();
        const deliveryValid = isDeliveryInfoValid();
        const paymentValid = isPaymentInfoValid();

        return {
            delivery: { complete: deliveryComplete, valid: deliveryValid },
            payment: { complete: paymentComplete, valid: paymentValid }
        };
    };

    // Handle delivery info submission
    const handleDeliveryInfoSubmit = (e) => {
        e.preventDefault();
        
        const deliveryFields = ['fullName', 'phoneNumber', 'email', 'addressLine1', 'city', 'state', 'pincode'];
        const newTouched = { ...touchedFields };
        deliveryFields.forEach(field => { newTouched[field] = true; });
        setTouchedFields(newTouched);
        
        const validationErrors = validateDeliveryInfo();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            
            const firstErrorField = Object.keys(validationErrors)[0];
            const element = document.getElementById(firstErrorField);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.focus();
            }
            
            toast.error('Please fix the errors in the form');
            return;
        }
        
        // Save address for future use
        if (user?.id) {
            const addressData = {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                addressLine1: formData.addressLine1,
                addressLine2: formData.addressLine2,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                country: formData.country
            };
            localStorage.setItem(`user_address_${user.id}`, JSON.stringify(addressData));
        }
        
        toast.success('✅ Delivery information saved!');
    };

    // Show loading state while checking authentication
    if (loading) {
        return (
            <>
                <NavBar />
                <div className="min-h-screen flex items-center justify-center pt-20" style={{ backgroundColor: colors.background }}>
                    <div className="text-center max-w-md mx-auto p-8">
                        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                            <User size={32} style={{ color: colors.primary }} />
                        </div>
                        <h1 className="text-3xl font-bold mb-4" style={{ color: colors.text }}>
                            Loading...
                        </h1>
                        <p className="text-lg mb-6" style={{ color: colors.text, opacity: 0.7 }}>
                            Checking authentication...
                        </p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (cart.length === 0 && !showSuccessModal) {
        return (
            <>
                <NavBar />
                <div className="min-h-screen flex items-center justify-center pt-20" style={{ backgroundColor: colors.background }}>
                    <div className="text-center max-w-md mx-auto p-8">
                        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                            <User size={32} style={{ color: colors.primary }} />
                        </div>
                        <h1 className="text-3xl font-bold mb-4" style={{ color: colors.text }}>
                            Cart is Empty
                        </h1>
                        <p className="text-lg mb-6" style={{ color: colors.text, opacity: 0.7 }}>
                            Please add some products to your cart before checkout
                        </p>
                        <button
                            onClick={() => navigate('/products')}
                            className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                            style={{ backgroundColor: colors.primary }}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!user && !showSuccessModal) {
        return (
            <>
                <NavBar />
                <div className="min-h-screen flex items-center justify-center pt-20" style={{ backgroundColor: colors.background }}>
                    <div className="text-center max-w-md mx-auto p-8">
                        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                            <User size={32} style={{ color: colors.primary }} />
                        </div>
                        <h1 className="text-3xl font-bold mb-4" style={{ color: colors.text }}>
                            Login Required
                        </h1>
                        <p className="text-lg mb-6" style={{ color: colors.text, opacity: 0.7 }}>
                            Please log in to complete your purchase
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                            style={{ backgroundColor: colors.primary }}
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // Get completion status for UI indicators
    const completionStatus = getCompletionStatus();

    return (
        <>
            <NavBar />
            <div className="min-h-screen pt-20" style={{ backgroundColor: colors.background }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* User Info Banner */}
                    <div className="bg-white rounded-xl shadow-sm border p-4 mb-6" style={{ borderColor: colors.accent }}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User size={20} style={{ color: colors.primary }} />
                                </div>
                                <div>
                                    <h3 className="font-semibold" style={{ color: colors.text }}>
                                        {user.username}
                                    </h3>
                                    <p className="text-sm" style={{ color: colors.text, opacity: 0.7 }}>
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm" style={{ color: colors.text, opacity: 0.7 }}>Items in Cart</p>
                                    <p className="font-semibold" style={{ color: colors.primary }}>
                                        {getCartItemsCount()} items
                                    </p>
                                </div>
                                <div className="h-8 w-px bg-gray-300"></div>
                                <div className="text-right">
                                    <p className="text-sm" style={{ color: colors.text, opacity: 0.7 }}>Order Total</p>
                                    <p className="font-semibold" style={{ color: colors.primary }}>
                                        ₹{total.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                    completionStatus.delivery.complete 
                                        ? completionStatus.delivery.valid 
                                            ? 'border-green-500 bg-green-50 text-green-600' 
                                            : 'border-red-500 bg-red-50 text-red-600'
                                        : 'border-blue-600 bg-blue-50 text-blue-600'
                                }`}>
                                    <Home size={20} />
                                </div>
                                <span className="text-sm font-medium mt-2">Delivery</span>
                            </div>
                            <div className={`w-24 h-1 mx-2 ${
                                completionStatus.delivery.complete && completionStatus.delivery.valid 
                                    ? 'bg-green-500' 
                                    : completionStatus.delivery.complete && !completionStatus.delivery.valid
                                    ? 'bg-red-500'
                                    : 'bg-gray-300'
                            }`}></div>
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                    completionStatus.payment.complete 
                                        ? completionStatus.payment.valid 
                                            ? 'border-green-500 bg-green-50 text-green-600' 
                                            : 'border-red-500 bg-red-50 text-red-600'
                                        : 'border-gray-300 text-gray-400'
                                }`}>
                                    <CreditCard size={20} />
                                </div>
                                <span className="text-sm font-medium mt-2">Payment</span>
                            </div>
                        </div>
                    </div>

                    {/* Validation Summary */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={20} className="text-red-500 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-red-700 mb-1">
                                        Please fix the following errors:
                                    </h4>
                                    <ul className="text-sm text-red-600 list-disc list-inside">
                                        {Object.entries(errors).map(([field, error]) => (
                                            <li key={field}>
                                                {error}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Forms */}
                        <div className="space-y-6">
                            {/* Delivery Information Form */}
                            <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: colors.accent }}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <MapPin size={20} style={{ color: colors.primary }} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
                                            Delivery Information
                                        </h2>
                                        <p className="text-sm" style={{ color: colors.text, opacity: 0.7 }}>
                                            Where should we deliver your order?
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleDeliveryInfoSubmit} className="space-y-4">
                                    {/* Contact Information */}
                                    <div className="p-4 rounded-lg border border-blue-100 bg-blue-50">
                                        <h3 className="font-medium mb-3" style={{ color: colors.text }}>
                                            <span className="flex items-center gap-2">
                                                <User size={16} />
                                                Contact Information
                                            </span>
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                                                    Full Name *
                                                </label>
                                                <input
                                                    id="fullName"
                                                    type="text"
                                                    value={formData.fullName}
                                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                                    onBlur={() => handleFieldBlur('fullName')}
                                                    placeholder="John Doe"
                                                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                                                        errors.fullName 
                                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                            : touchedFields.fullName && !errors.fullName
                                                            ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                    }`}
                                                />
                                                {errors.fullName && (
                                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                        <AlertCircle size={12} />
                                                        {errors.fullName}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                                                    Phone Number *
                                                </label>
                                                <input
                                                    id="phoneNumber"
                                                    type="tel"
                                                    value={formData.phoneNumber}
                                                    onChange={(e) => handleInputChange('phoneNumber', formatPhoneNumber(e.target.value))}
                                                    onBlur={() => handleFieldBlur('phoneNumber')}
                                                    placeholder="9876543210"
                                                    maxLength={10}
                                                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                                                        errors.phoneNumber 
                                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                            : touchedFields.phoneNumber && !errors.phoneNumber
                                                            ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                    }`}
                                                />
                                                {errors.phoneNumber && (
                                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                        <AlertCircle size={12} />
                                                        {errors.phoneNumber}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                                                    Email Address *
                                                </label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    onBlur={() => handleFieldBlur('email')}
                                                    placeholder="john@example.com"
                                                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                                                        errors.email 
                                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                            : touchedFields.email && !errors.email
                                                            ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                    }`}
                                                />
                                                {errors.email && (
                                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                        <AlertCircle size={12} />
                                                        {errors.email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delivery Address */}
                                    <div className="p-4 rounded-lg border border-blue-100 bg-blue-50">
                                        <h3 className="font-medium mb-3" style={{ color: colors.text }}>
                                            <span className="flex items-center gap-2">
                                                <Home size={16} />
                                                Delivery Address
                                            </span>
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                                                    Address Line 1 *
                                                </label>
                                                <input
                                                    id="addressLine1"
                                                    type="text"
                                                    value={formData.addressLine1}
                                                    onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                                                    onBlur={() => handleFieldBlur('addressLine1')}
                                                    placeholder="House no., Building name, Street"
                                                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                                                        errors.addressLine1 
                                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                            : touchedFields.addressLine1 && !errors.addressLine1
                                                            ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                    }`}
                                                />
                                                {errors.addressLine1 && (
                                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                        <AlertCircle size={12} />
                                                        {errors.addressLine1}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                                                    Address Line 2 (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.addressLine2}
                                                    onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                                                    onBlur={() => handleFieldBlur('addressLine2')}
                                                    placeholder="Area, Landmark"
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                                                        City *
                                                    </label>
                                                    <input
                                                        id="city"
                                                        type="text"
                                                        value={formData.city}
                                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                                        onBlur={() => handleFieldBlur('city')}
                                                        placeholder="Mumbai"
                                                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                                                            errors.city 
                                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                                : touchedFields.city && !errors.city
                                                                ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                        }`}
                                                    />
                                                    {errors.city && (
                                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                            <AlertCircle size={12} />
                                                            {errors.city}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                                                        State *
                                                    </label>
                                                    <input
                                                        id="state"
                                                        type="text"
                                                        value={formData.state}
                                                        onChange={(e) => handleInputChange('state', e.target.value)}
                                                        onBlur={() => handleFieldBlur('state')}
                                                        placeholder="Maharashtra"
                                                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                                                            errors.state 
                                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                                : touchedFields.state && !errors.state
                                                                ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                        }`}
                                                    />
                                                    {errors.state && (
                                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                            <AlertCircle size={12} />
                                                            {errors.state}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                                                        Pincode *
                                                    </label>
                                                    <input
                                                        id="pincode"
                                                        type="text"
                                                        value={formData.pincode}
                                                        onChange={(e) => handleInputChange('pincode', formatPincode(e.target.value))}
                                                        onBlur={() => handleFieldBlur('pincode')}
                                                        placeholder="400001"
                                                        maxLength={6}
                                                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                                                            errors.pincode 
                                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                                : touchedFields.pincode && !errors.pincode
                                                                ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                        }`}
                                                    />
                                                    {errors.pincode && (
                                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                            <AlertCircle size={12} />
                                                            {errors.pincode}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                                                    Country
                                                </label>
                                                <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-300 bg-gray-50">
                                                    <Globe size={16} style={{ color: colors.text, opacity: 0.7 }} />
                                                    <span style={{ color: colors.text }}>India</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Continue Button */}
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={!isDeliveryInfoValid()}
                                            className={`w-full py-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                                                !isDeliveryInfoValid()
                                                    ? 'opacity-60 cursor-not-allowed bg-gray-400'
                                                    : 'hover:shadow-lg transform hover:-translate-y-0.5'
                                            }`}
                                            style={{ 
                                                backgroundColor: isDeliveryInfoValid() ? colors.primary : '#9CA3AF',
                                                background: isDeliveryInfoValid() 
                                                    ? 'linear-gradient(135deg, #00A9FF 0%, #0077B6 100%)' 
                                                    : '#9CA3AF'
                                            }}
                                        >
                                            {isDeliveryInfoValid() ? (
                                                <>
                                                    <CheckCircle size={20} />
                                                    Save Delivery Information
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle size={20} />
                                                    Fix Errors to Continue
                                                </>
                                            )}
                                        </button>
                                        {!isDeliveryInfoValid() && Object.keys(errors).length > 0 && (
                                            <p className="text-center text-sm text-red-500 mt-2">
                                                Please fix all errors before proceeding
                                            </p>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* Payment Information Form */}
                            <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: colors.accent }}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <CreditCard size={20} style={{ color: colors.primary }} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
                                                Payment Information
                                            </h2>
                                            <p className="text-sm" style={{ color: colors.text, opacity: 0.7 }}>
                                                How would you like to pay?
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Methods */}
                                <div className="space-y-4 mb-6">
                                    <div 
                                        className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200"
                                        style={{
                                            borderColor: activePaymentMethod === 'upi' ? colors.primary : colors.accent,
                                            backgroundColor: activePaymentMethod === 'upi' ? '#A0E9FF20' : 'transparent'
                                        }}
                                        onClick={() => setActivePaymentMethod('upi')}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${activePaymentMethod === 'upi' ? 'border-blue-500' : 'border-gray-300'}`}>
                                            {activePaymentMethod === 'upi' && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            )}
                                        </div>
                                        <Smartphone size={24} style={{ color: colors.primary }} />
                                        <div>
                                            <h3 className="font-semibold" style={{ color: colors.text }}>UPI Payment</h3>
                                            <p className="text-sm" style={{ color: colors.text, opacity: 0.7 }}>Pay using UPI ID</p>
                                        </div>
                                    </div>

                                    <div 
                                        className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200"
                                        style={{
                                            borderColor: activePaymentMethod === 'card' ? colors.primary : colors.accent,
                                            backgroundColor: activePaymentMethod === 'card' ? '#A0E9FF20' : 'transparent'
                                        }}
                                        onClick={() => setActivePaymentMethod('card')}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${activePaymentMethod === 'card' ? 'border-blue-500' : 'border-gray-300'}`}>
                                            {activePaymentMethod === 'card' && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            )}
                                        </div>
                                        <CreditCard size={24} style={{ color: colors.primary }} />
                                        <div>
                                            <h3 className="font-semibold" style={{ color: colors.text }}>Debit Card</h3>
                                            <p className="text-sm" style={{ color: colors.text, opacity: 0.7 }}>Pay using debit card</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Form */}
                                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                                    {activePaymentMethod === 'upi' ? (
                                        <div>
                                            <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                                                UPI ID *
                                            </label>
                                            <input
                                                id="upiId"
                                                type="text"
                                                value={formData.upiId}
                                                onChange={(e) => handleInputChange('upiId', e.target.value)}
                                                onBlur={() => handleFieldBlur('upiId')}
                                                placeholder="username@upi"
                                                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                                                    errors.upiId 
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                        : touchedFields.upiId && !errors.upiId
                                                        ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                }`}
                                            />
                                            {errors.upiId && (
                                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                    <AlertCircle size={12} />
                                                    {errors.upiId}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                Example: username@oksbi, username@ybl, username@paytm
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                                                    Card Number *
                                                </label>
                                                <input
                                                    id="cardNumber"
                                                    type="text"
                                                    value={formData.cardNumber}
                                                    onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                                                    onBlur={() => handleFieldBlur('cardNumber')}
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength={19}
                                                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                                                        errors.cardNumber 
                                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                            : touchedFields.cardNumber && !errors.cardNumber
                                                            ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                    }`}
                                                />
                                                {errors.cardNumber && (
                                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                        <AlertCircle size={12} />
                                                        {errors.cardNumber}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                                                    Card Holder Name *
                                                </label>
                                                <input
                                                    id="cardHolder"
                                                    type="text"
                                                    value={formData.cardHolder}
                                                    onChange={(e) => handleInputChange('cardHolder', e.target.value.toUpperCase())}
                                                    onBlur={() => handleFieldBlur('cardHolder')}
                                                    placeholder="JOHN DOE"
                                                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                                                        errors.cardHolder 
                                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                            : touchedFields.cardHolder && !errors.cardHolder
                                                            ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                    }`}
                                                />
                                                {errors.cardHolder && (
                                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                        <AlertCircle size={12} />
                                                        {errors.cardHolder}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                                                        Expiry Date *
                                                    </label>
                                                    <input
                                                        id="expiryDate"
                                                        type="text"
                                                        value={formData.expiryDate}
                                                        onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                                                        onBlur={() => handleFieldBlur('expiryDate')}
                                                        placeholder="MM/YY"
                                                        maxLength={5}
                                                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                                                            errors.expiryDate 
                                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                                : touchedFields.expiryDate && !errors.expiryDate
                                                                ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                        }`}
                                                    />
                                                    {errors.expiryDate && (
                                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                            <AlertCircle size={12} />
                                                            {errors.expiryDate}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                                                        CVV *
                                                    </label>
                                                    <input
                                                        id="cvv"
                                                        type="password"
                                                        value={formData.cvv}
                                                        onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                                                        onBlur={() => handleFieldBlur('cvv')}
                                                        placeholder="123"
                                                        maxLength={4}
                                                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                                                            errors.cvv 
                                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                                                : touchedFields.cvv && !errors.cvv
                                                                ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                        }`}
                                                    />
                                                    {errors.cvv && (
                                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                            <AlertCircle size={12} />
                                                            {errors.cvv}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Security Notice */}
                                    <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-blue-50" style={{ color: colors.text }}>
                                        <Lock size={16} style={{ color: colors.primary }} />
                                        <span>Your payment details are secure and encrypted</span>
                                    </div>

                                    {/* Validation Summary */}
                                    {!isPaymentInfoValid() && (
                                        <div className="p-3 rounded-lg border border-red-200 bg-red-50">
                                            <p className="text-sm text-red-600 flex items-center gap-2">
                                                <AlertCircle size={16} />
                                                Please fix payment information errors before proceeding
                                            </p>
                                        </div>
                                    )}

                                    {/* Pay Button */}
                                    <button
                                        type="submit"
                                        disabled={!isDeliveryInfoValid() || !isPaymentInfoValid() || isProcessing}
                                        className={`w-full py-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                                            !isDeliveryInfoValid() || !isPaymentInfoValid() || isProcessing
                                                ? 'opacity-60 cursor-not-allowed bg-gray-400'
                                                : 'hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0'
                                        }`}
                                        style={{ 
                                            backgroundColor: (isDeliveryInfoValid() && isPaymentInfoValid() && !isProcessing) ? colors.primary : '#9CA3AF',
                                            background: (isDeliveryInfoValid() && isPaymentInfoValid() && !isProcessing) 
                                                ? 'linear-gradient(135deg, #00A9FF 0%, #0077B6 100%)' 
                                                : '#9CA3AF'
                                        }}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Processing Payment...
                                            </>
                                        ) : (
                                            <>
                                                <Shield size={20} />
                                                Complete Order - ₹{total.toLocaleString()}
                                            </>
                                        )}
                                    </button>

                                    {/* Validation Error Message */}
                                    {(!isDeliveryInfoValid() || !isPaymentInfoValid()) && (
                                        <p className="text-center text-sm text-red-500">
                                            {!isDeliveryInfoValid() ? 'Please complete delivery information first' : 'Please fix payment information errors'}
                                        </p>
                                    )}
                                </form>
                            </div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-28" style={{ borderColor: colors.accent }}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
                                        Order Summary
                                    </h2>
                                    <div className="flex items-center gap-2 text-sm" style={{ color: colors.primary }}>
                                        <Package size={16} />
                                        <span>{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
                                    </div>
                                </div>

                                {/* Cart Items */}
                                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                                    {cart.map((item, index) => (
                                        <div key={`${item.productId}-${index}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                            <div className="shrink-0">
                                                <img
                                                    src={item.productImage || item.image}
                                                    alt={item.productName || item.name}
                                                    className="w-12 h-12 object-contain rounded-lg bg-gray-100 p-1"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/100x100?text=Product';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-sm truncate" style={{ color: colors.text }}>
                                                    {item.productName || item.name}
                                                </h3>
                                                <div className="flex items-center justify-between text-xs">
                                                    <p style={{ color: colors.text, opacity: 0.7 }}>
                                                        Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                                                    </p>
                                                    <p className="font-semibold" style={{ color: colors.primary }}>
                                                        ₹{(item.price * item.quantity).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Delivery Summary */}
                                {isDeliveryInfoValid() && (
                                    <div className="mb-4 p-3 rounded-lg border border-green-100 bg-green-50">
                                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2" style={{ color: colors.text }}>
                                            <Navigation size={14} />
                                            Delivery To
                                        </h4>
                                        <div className="text-sm" style={{ color: colors.text, opacity: 0.8 }}>
                                            <p className="font-medium">{formData.fullName}</p>
                                            <p>{formData.addressLine1}</p>
                                            {formData.addressLine2 && <p>{formData.addressLine2}</p>}
                                            <p>{formData.city}, {formData.state} - {formData.pincode}</p>
                                            <p className="flex items-center gap-1 mt-1">
                                                <Phone size={12} />
                                                {formData.phoneNumber}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Price Breakdown */}
                                <div className="space-y-3 border-t pt-4" style={{ borderColor: colors.accent }}>
                                    <div className="flex justify-between">
                                        <span style={{ color: colors.text, opacity: 0.7 }}>Subtotal</span>
                                        <span style={{ color: colors.text }}>₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: colors.text, opacity: 0.7 }}>Shipping</span>
                                        <span style={{ color: colors.text }}>
                                            {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: colors.text, opacity: 0.7 }}>Tax (18%)</span>
                                        <span style={{ color: colors.text }}>₹{tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-semibold border-t pt-3" style={{ borderColor: colors.accent }}>
                                        <span style={{ color: colors.text }}>Total Amount</span>
                                        <span style={{ color: colors.primary }}>₹{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>

                                {/* Free Shipping Message */}
                                {subtotal < 5000 && subtotal > 0 && (
                                    <div className="mt-4 p-3 rounded-lg text-center text-sm" 
                                         style={{ 
                                             backgroundColor: `${colors.accent}20`,
                                             color: colors.primary,
                                             border: `1px dashed ${colors.accent}`
                                         }}>
                                        <span className="font-medium">
                                            Add ₹{(5000 - subtotal).toLocaleString()} more for <strong>FREE Shipping</strong>!
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent bg-opacity-70 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100 animate-slideUp">
                        <div className="text-center">
                            {/* Success Icon */}
                            <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4 animate-pulse">
                                <CheckCircle size={40} className="text-green-500" />
                            </div>

                            {/* Success Message */}
                            <h3 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
                                Order Confirmed!
                            </h3>
                            <p className="text-gray-600 mb-2">
                                Thank you for your purchase, {formData.fullName || user.username}!
                            </p>
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <p className="text-sm font-semibold text-gray-800">
                                    Order ID: <span className="text-blue-600">{orderId}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Estimated delivery: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                </p>
                                <div className="mt-2 text-left text-xs">
                                    <p className="font-medium">Delivery Address:</p>
                                    <p>{formData.addressLine1}</p>
                                    {formData.addressLine2 && <p>{formData.addressLine2}</p>}
                                    <p>{formData.city}, {formData.state} - {formData.pincode}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleContinueShopping}
                                    className="flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg"
                                    style={{ 
                                        backgroundColor: colors.primary,
                                        background: 'linear-gradient(135deg, #00A9FF 0%, #0077B6 100%)'
                                    }}
                                >
                                    Continue Shopping
                                </button>
                                {/* <button
                                    onClick={handleViewOrders}
                                    className="flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg border-2"
                                    style={{ 
                                        borderColor: colors.primary, 
                                        color: colors.primary,
                                        backgroundColor: 'white'
                                    }}
                                >
                                    View Orders
                                </button> */}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CheckoutPage;

