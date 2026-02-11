import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { TestTube, Shield, Users, CheckCircle, Phone, Award, FileText, ShoppingCart, X } from 'lucide-react';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

const HomePage = () => {
    const { addToCart } = useCart();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        city: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [popupType, setPopupType] = useState('success'); // 'success' or 'error'

    // Color theme from your specification
    const colors = {
        primary: '#00A9FF',
        secondary: '#89CFF3',
        accent: '#A0E9FF',
        background: '#CDF5FD',
        text: '#0B0C10',
        error: '#EF4444',
        success: '#10B981'
    };

    // Testimonials data
    const testimonials = [
        {
            name: "Rajesh Kumar",
            location: "Mumbai",
            rating: 5,
            text: "The water test helped me choose the perfect RO system. Water quality improved dramatically!",
            beforeTds: 850,
            afterTds: 25
        },
        {
            name: "Priya Sharma",
            location: "Pune",
            rating: 5,
            text: "Free home demo was very helpful. Technician explained everything clearly.",
            beforeTds: 650,
            afterTds: 20
        },
        {
            name: "Amit Patel",
            location: "Thane",
            rating: 4,
            text: "Great service and support. Never miss filter changes with their reminder service.",
            beforeTds: 1200,
            afterTds: 15
        }
    ];

    // Products data - Updated with proper product structure
    const products = [
        {
            id: 1,
            name: "AquaPure RO+UV+UF",
            price: 18999,
            originalPrice: 21999,
            rating: 4.5,
            reviews: 124,
            features: ["7 Stage Purification", "Smart TDS Controller", "10L Storage"],
            image: "src/assets/home1.jpg",
            category: "ro",
            stock: 15
        },
        {
            id: 2,
            name: "CleanWater UV Purifier",
            price: 12499,
            originalPrice: 14999,
            rating: 4.3,
            reviews: 89,
            features: ["UV Disinfection", "3 Stage Filtration", "Compact Design"],
            image: "src/assets/home2.jpg",
            category: "uv",
            stock: 12
        },
        {
            id: 3,
            name: "PureFlow UF System",
            price: 8999,
            originalPrice: 10999,
            rating: 4.0,
            reviews: 67,
            features: ["UF Membrane", "No Electricity", "5L Capacity"],
            image: "src/assets/home4.jpg",
            category: "uf",
            stock: 20
        },
        {
            id: 4,
            name: "Mineral RO System",
            price: 21999,
            originalPrice: 25999,
            rating: 4.7,
            reviews: 156,
            features: ["Mineral Booster", "8 Stage RO", "12L Tank"],
            image: "src/assets/home3.jpg",
            category: "ro",
            stock: 8
        }
    ];

    // Auto-rotate testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const showPopupMessage = (message, type = 'success') => {
        setPopupMessage(message);
        setPopupType(type);
        setShowPopup(true);

        // Auto hide after 5 seconds for success, 7 seconds for errors
        setTimeout(() => {
            setShowPopup(false);
        }, type === 'success' ? 5000 : 7000);
    };

    const sendWhatsAppMessage = (userData) => {
        const adminNumber = '9656567901';
        const message = ` *New Water Test Booking Request* 

*Customer Details:*
 Name: ${userData.name}
 Phone: ${userData.phone}
 City: ${userData.city}
 Address: ${userData.address}

*Request Type:* Free Home Water Test
*Timestamp:* ${new Date().toLocaleString()}

Please contact the customer to schedule the water test.`;

        
        const encodedMessage = encodeURIComponent(message);

        
        const whatsappUrl = `https://wa.me/${adminNumber}?text=${encodedMessage}`;

        
        window.open(whatsappUrl, '_blank');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.phone || !formData.name || !formData.city) {
            showPopupMessage('Please fill in all required fields: Name, Phone, and City.', 'error');
            return;
        }

        // Phone number validation (Indian numbers)
        const phoneRegex = /^[6-9]\d{9}$/;
        const cleanPhone = formData.phone.replace(/\D/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            showPopupMessage('Please enter a valid 10-digit Indian phone number.', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            // Update form data with cleaned phone number
            const userData = {
                ...formData,
                phone: cleanPhone
            };

            // Send WhatsApp message
            sendWhatsAppMessage(userData);

            // Show success message
            showPopupMessage(`Thank you ${userData.name}! We will contact you soon for your free water test. WhatsApp message has been sent to our team.`);

            // Reset form
            setFormData({
                name: '',
                phone: '',
                address: '',
                city: ''
            });

        } catch (error) {
            console.error('Error sending message:', error);
            showPopupMessage('There was an error submitting your request. Please try again or call us directly.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        // Show success popup for cart addition
        showPopupMessage(`${product.name} has been added to your cart!`);
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-white" style={{ color: colors.text }}>

                {/* Popup Message */}
                {showPopup && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
                            onClick={closePopup}
                        ></div>

                        {/* Popup Content */}
                        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
                            {/* Header */}
                            <div className={`p-4 rounded-t-2xl ${popupType === 'success'
                                ? 'bg-green-500'
                                : 'bg-red-500'
                                }`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                            {popupType === 'success' ? (
                                                <CheckCircle size={20} className="text-white" />
                                            ) : (
                                                <X size={20} className="text-white" />
                                            )}
                                        </div>
                                        <h3 className="text-white font-semibold text-lg">
                                            {popupType === 'success' ? 'Success!' : 'Attention Required'}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={closePopup}
                                        className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="p-6">
                                <p className="text-gray-700 text-center">{popupMessage}</p>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-200">
                                <button
                                    onClick={closePopup}
                                    className="w-full py-3 rounded-lg font-semibold transition-colors duration-200"
                                    style={{
                                        backgroundColor: popupType === 'success' ? colors.success : colors.error,
                                        color: 'white'
                                    }}
                                    onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🌊 1. Hero Section */}
                <section
                    className="relative py-20 lg:py-32 text-white"
                    style={{
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                    }}
                >
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="text-center lg:text-left">
                                <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                                    Check Your Water TDS Before Buying a Purifier
                                </h1>
                                <p className="text-xl lg:text-2xl mb-8" style={{ color: colors.accent }}>
                                    Accurate purifier recommendations based on your area water.
                                </p>

                                <form onSubmit={handleSubmit}>
                                    <div
                                        className="rounded-2xl p-6 mb-8 backdrop-blur-sm"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                                    >
                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Your Name *"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                className="px-4 py-3 rounded-lg border text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
                                                style={{
                                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                                    borderColor: 'rgba(255,255,255,0.2)'
                                                }}
                                            />
                                            <input
                                                type="tel"
                                                name="phone"
                                                placeholder="Phone Number *"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                className="px-4 py-3 rounded-lg border text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
                                                style={{
                                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                                    borderColor: 'rgba(255,255,255,0.2)'
                                                }}
                                            />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <input
                                                type="text"
                                                name="city"
                                                placeholder="City *"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                required
                                                className="px-4 py-3 rounded-lg border text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
                                                style={{
                                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                                    borderColor: 'rgba(255,255,255,0.2)'
                                                }}
                                            />
                                            <input
                                                type="text"
                                                name="address"
                                                placeholder="Full Address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className="px-4 py-3 rounded-lg border text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
                                                style={{
                                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                                    borderColor: 'rgba(255,255,255,0.2)'
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-1 py-3 px-6 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{
                                                    backgroundColor: isSubmitting ? colors.secondary : 'white',
                                                    color: colors.primary
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isSubmitting) {
                                                        e.target.style.backgroundColor = colors.background;
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isSubmitting) {
                                                        e.target.style.backgroundColor = 'white';
                                                    }
                                                }}
                                            >
                                                <TestTube size={20} />
                                                {isSubmitting ? 'Booking...' : 'Book Free Home Water Test'}
                                            </button>
                                        </div>
                                        <p className="text-blue-200 text-sm mt-3 text-center">
                                            * Required fields. We'll contact you within 24 hours.
                                        </p>
                                    </div>
                                </form>
                            </div>

                            <div className="relative">
                                <div
                                    className="rounded-3xl p-8 transform rotate-3 backdrop-blur-sm"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                                >
                                    <img
                                        src="src/assets/home first image.webp"
                                        alt="Water Purifier"
                                        className="rounded-2xl transform -rotate-3 shadow-2xl"
                                    />
                                </div>
                                {/* Animated water droplets */}
                                <div
                                    className="absolute -top-4 -right-4 w-8 h-8 rounded-full animate-bounce"
                                    style={{ backgroundColor: colors.accent }}
                                ></div>
                                <div
                                    className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full animate-pulse"
                                    style={{ backgroundColor: colors.primary }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 🌟 2. USP Section */}
                <section
                    className="py-16"
                    style={{ backgroundColor: colors.background }}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
                            Why Choose Our Water Solutions?
                        </h2>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    icon: <TestTube className="w-12 h-12" style={{ color: colors.primary }} />,
                                    title: "Water Quality Checker",
                                    description: "Get accurate water analysis and personalized purifier recommendations"
                                },
                                {
                                    icon: <Users className="w-12 h-12" style={{ color: colors.primary }} />,
                                    title: "Free Home Demo",
                                    description: "Experience purifier performance with our free home demonstration"
                                },
                                {
                                    icon: <Shield className="w-12 h-12" style={{ color: colors.primary }} />,
                                    title: "Certified Products",
                                    description: "All purifiers meet ISO standards and WHO water quality guidelines"
                                },
                                {
                                    icon: <Phone className="w-12 h-12" style={{ color: colors.primary }} />,
                                    title: "Expert Support",
                                    description: "24/7 technician support and annual maintenance services"
                                }
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center hover:transform hover:scale-105"
                                >
                                    <div className="flex justify-center mb-4">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 🛒 4. Top Selling Purifiers */}
                <section
                    className="py-16"
                    style={{ backgroundColor: colors.background }}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
                            Top Selling Water Purifiers
                        </h2>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105"
                                >
                                    <div className="p-6">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-48 object-cover rounded-xl mb-4"
                                        />
                                        <h3 className="text-xl font-semibold mb-2">
                                            {product.name}
                                        </h3>
                                        <ul className="space-y-1 mb-4">
                                            {product.features.map((feature, index) => (
                                                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                                    <CheckCircle size={16} style={{ color: colors.primary }} />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <span className="text-2xl font-bold" style={{ color: colors.primary }}>
                                                    ₹{product.price.toLocaleString()}
                                                </span>
                                                {product.originalPrice > product.price && (
                                                    <span className="text-lg line-through text-gray-500 ml-2">
                                                        ₹{product.originalPrice.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className={`text-sm font-medium ${product.stock > 10
                                                ? 'text-green-600'
                                                : product.stock > 0
                                                    ? 'text-orange-500'
                                                    : 'text-red-500'
                                                }`}>
                                                {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                                            </span>
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                disabled={product.stock === 0}
                                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${product.stock === 0
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'text-white hover:shadow-lg transform hover:-translate-y-0.5'
                                                    }`}
                                                style={product.stock === 0 ? {} : {
                                                    backgroundColor: colors.primary
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (product.stock !== 0) {
                                                        e.target.style.backgroundColor = colors.secondary;
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (product.stock !== 0) {
                                                        e.target.style.backgroundColor = colors.primary;
                                                    }
                                                }}
                                            >
                                                <ShoppingCart size={18} />
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

               

              

                {/* 🏅 12. Certifications */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
                            Certified & Trusted Water Solutions
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { icon: <Award className="w-12 h-12" style={{ color: colors.primary }} />, text: "ISO Certified" },
                                { icon: <FileText className="w-12 h-12" style={{ color: colors.primary }} />, text: "WHO Guidelines" },
                                { icon: <Shield className="w-12 h-12" style={{ color: colors.primary }} />, text: "2 Year Warranty" },
                                { icon: <CheckCircle className="w-12 h-12" style={{ color: colors.primary }} />, text: "Free Installation" }
                            ].map((cert, index) => (
                                <div key={index} className="text-center">
                                    <div className="flex justify-center mb-4">
                                        {cert.icon}
                                    </div>
                                    <p className="font-semibold">{cert.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
};

export default HomePage;