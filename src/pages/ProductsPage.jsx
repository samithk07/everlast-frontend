import React, { useState, useEffect } from 'react';
import { Heart, Star, Search, ShoppingCart, Loader2, AlertCircle, Filter, TrendingUp, Shield, Zap, Battery, Droplets } from 'lucide-react';
import Footer from '../components/Footer';
import NavBar from '../components/NavBar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductsPage = () => {
    const { addToCart, getCartItemQuantity } = useCart();
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('featured');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addingToCart, setAddingToCart] = useState({});

    // Use the same API_BASE as your admin panel
    const API_BASE = 'http://localhost:3001';

    const colors = {
        primary: '#00A9FF',
        secondary: '#89CFF3',
        accent: '#A0E9FF',
        background: '#CDF5FD',
        text: '#0B0C10',
        error: '#EF4444',
        success: '#10B981',
        gradient: 'linear-gradient(135deg, #00A9FF 0%, #0088CC 100%)',
        gradientHover: 'linear-gradient(135deg, #0088CC 0%, #006699 100%)'
    };

    const categoryIcons = {
        'ro': <Zap className="w-5 h-5" />,
        'uv': <Droplets className="w-5 h-5" />,
        'uf': <Battery className="w-5 h-5" />,
        'gravity': <Droplets className="w-5 h-5" />,
        'all': <Filter className="w-5 h-5" />
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                // Try JSON Server endpoint first
                const response = await fetch(`${API_BASE}/products`);
                
                if (!response.ok) {
                    // If JSON Server fails, try local db.json
                    console.warn('JSON Server not running, trying local db.json');
                    const localResponse = await fetch('/db.json');
                    
                    if (!localResponse.ok) {
                        throw new Error('Failed to fetch products from both sources');
                    }
                    
                    const data = await localResponse.json();
                    
                    if (data.products && Array.isArray(data.products)) {
                        setProducts(data.products);
                    } else if (Array.isArray(data)) {
                        setProducts(data);
                    } else {
                        throw new Error('Invalid data format in db.json');
                    }
                } else {
                    // JSON Server is working
                    const data = await response.json();
                    setProducts(data);
                }
                
                setError(null);
            } catch (err) {
                console.error('Error loading products:', err);
                setError('Failed to load products. Please check if JSON Server is running on port 3001.');
                
                // Fallback products
                const fallbackProducts = [
                    {
                        id: 'p001',
                        name: 'AquaFresh RO + UV + UF + TDS Water Purifier',
                        category: 'ro',
                        price: 18999,
                        originalPrice: 21999,
                        image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop',
                        rating: 4.7,
                        reviews: 342,
                        stock: 15,
                        features: ['8-stage purification', 'TDS controller', 'UV LED', 'Smart display', 'Copper Technology'],
                        description: 'Advanced 8-stage purification system with UV LED and copper technology for 99.9% pure water.',
                        warranty: '5 Years',
                        capacity: '10 LPH',
                        color: 'Matte Black'
                    },
                    {
                        id: 'p002',
                        name: 'PureFlow UV Water Purifier with Tank',
                        category: 'uv',
                        price: 12999,
                        originalPrice: 14999,
                        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
                        rating: 4.3,
                        reviews: 189,
                        stock: 25,
                        features: ['UV purification', 'Sediment filter', 'Carbon filter', '10L capacity', 'Auto Shut-off'],
                        description: 'Efficient UV purification system with auto shut-off feature and large storage capacity.',
                        warranty: '3 Years',
                        capacity: '8 LPH',
                        color: 'Pearl White'
                    },
                    {
                        id: 'p003',
                        name: 'AquaGuard UF Water Purifier',
                        category: 'uf',
                        price: 8999,
                        originalPrice: 10999,
                        image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&h=300&fit=crop',
                        rating: 4.2,
                        reviews: 156,
                        stock: 8,
                        features: ['UF membrane', 'No electricity', 'No wastage', '6L capacity'],
                        description: 'Ultra filtration system that works without electricity and produces zero water wastage.',
                        warranty: '2 Years',
                        capacity: '6 LPH',
                        color: 'Blue'
                    },
                    {
                        id: 'p004',
                        name: 'Gravity Pure Water Filter',
                        category: 'gravity',
                        price: 4999,
                        originalPrice: 5999,
                        image: 'https://images.unsplash.com/photo-1520218508822-998633d997e6?w=400&h=300&fit=crop',
                        rating: 4.0,
                        reviews: 210,
                        stock: 30,
                        features: ['Gravity based', 'No electricity', 'Ceramic filter', '20L capacity'],
                        description: 'Simple gravity-based water filter perfect for areas with frequent power cuts.',
                        warranty: '1 Year',
                        capacity: '20L',
                        color: 'White'
                    }
                ];
                setProducts(fallbackProducts);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [API_BASE]);

    const handleAddToCart = async (product) => {
        console.log('Add to cart clicked for product:', product);
        
        if (!product || !product.id) {
            toast.error('Invalid product data');
            return;
        }

        if (product.stock === 0) {
            toast.warning('This product is out of stock');
            return;
        }

        setAddingToCart(prev => ({ ...prev, [product.id]: true }));

        try {
            const result = await addToCart(product);
            
            console.log('Add to cart result:', result);
            
            if (result && result.success) {
                const cartQuantity = getCartItemQuantity(product.id);
                
                if (cartQuantity > 1) {
                    toast.success(`Updated quantity: ${cartQuantity} in cart`, {
                        icon: '🔄',
                        autoClose: 2000,
                    });
                } else {
                    toast.success(`${product.name} added to cart!`, {
                        icon: '✅',
                        autoClose: 3000,
                    });
                }
                
                // Visual feedback
                triggerCartAnimation(product.id);
            } else {
                const errorMessage = result?.error || 'Failed to add to cart';
                console.error('Add to cart failed:', errorMessage);
                
                if (errorMessage.includes('network') || errorMessage.includes('Network')) {
                    toast.error('Network error. Please check your connection.', { icon: '📶' });
                } else if (errorMessage.includes('401') || errorMessage.includes('auth')) {
                    toast.error('Please login to save your cart.', { icon: '🔒' });
                } else if (errorMessage.includes('Failed to fetch')) {
                    toast.error('Server connection failed. Please check if JSON Server is running on port 3001.', { icon: '🔄' });
                } else {
                    toast.error(errorMessage, { icon: '⚠️' });
                }
            }
            
        } catch (error) {
            console.error('Error in handleAddToCart:', error);
            
            if (error.message.includes('Network Error')) {
                toast.error('Network error. Please check your connection.', { icon: '📶' });
            } else if (error.message.includes('401')) {
                toast.error('Please login to save your cart.', { icon: '🔒' });
            } else {
                toast.error('Failed to add to cart. Please try again.', { icon: '⚠️' });
            }
        } finally {
            setAddingToCart(prev => ({ ...prev, [product.id]: false }));
        }
    };

    const triggerCartAnimation = (productId) => {
        const button = document.getElementById(`cart-btn-${productId}`);
        if (button) {
            button.classList.add('animate-pulse');
            setTimeout(() => {
                button.classList.remove('animate-pulse');
            }, 500);
        }
    };

    const toggleWishlist = (productId) => {
        setWishlist(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
        
        const isAdding = !wishlist.includes(productId);
        toast.info(
            isAdding ? 'Added to wishlist' : 'Removed from wishlist',
            { 
                icon: isAdding ? '❤️' : '🤍',
                autoClose: 1500 
            }
        );
    };

    const categories = [
        { value: 'all', label: 'All Products', icon: categoryIcons.all },
        { value: 'ro', label: 'RO Purifiers', icon: categoryIcons.ro },
        { value: 'uv', label: 'UV Purifiers', icon: categoryIcons.uv },
        { value: 'uf', label: 'UF Purifiers', icon: categoryIcons.uf },
        { value: 'gravity', label: 'Gravity Filters', icon: categoryIcons.gravity }
    ];

    const sortOptions = [
        { value: 'featured', label: 'Featured', icon: <TrendingUp className="w-4 h-4" /> },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'rating', label: 'Highest Rated' },
        { value: 'name', label: 'Name: A to Z' }
    ];

    const filteredProducts = products
        .filter(product => {
            const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
            
            if (!searchTerm.trim()) {
                return categoryMatch;
            }
            
            const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
            
            return searchMatch && categoryMatch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'rating':
                    return b.rating - a.rating;
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return b.rating - a.rating;
            }
        });

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                size={18}
                className={index < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
            />
        ));
    };

    const ProductCardGrid = ({ product }) => {
        const cartQuantity = getCartItemQuantity(product.id);
        const isAdding = addingToCart[product.id];
        const isInCart = cartQuantity > 0;
        
        return (
            <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 flex flex-col h-full">
                {/* Product Image */}
                <div className="relative overflow-hidden bg-gray-50 p-4">
                    <div className="relative h-40 w-full">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x200?text=Water+Purifier';
                            }}
                        />
                    </div>
                    
                    {/* Wishlist Button */}
                    <button
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white hover:scale-110 transition-all duration-200 z-10"
                    >
                        <Heart
                            size={18}
                            className={
                                wishlist.includes(product.id)
                                ? 'text-red-500 fill-current'
                                : 'text-gray-500 hover:text-red-400 transition-colors'
                            }
                        />
                    </button>
                    
                    {/* Discount Badge */}
                    {product.originalPrice > product.price && (
                        <div className="absolute top-2 left-2">
                            <span className="text-xs font-medium px-2 py-1 bg-[#A0E9FF] text-[#0B0C10] rounded-full">
                                Save ₹{(product.originalPrice - product.price).toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col grow">
                    {/* Category */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase">
                            {product.category || 'Water Purifier'}
                        </span>
                        <div className="flex items-center gap-1">
                            {renderStars(product.rating)}
                            <span className="text-xs text-gray-500">({product.reviews})</span>
                        </div>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-sm font-medium text-[#0B0C10] line-clamp-2 mb-2">
                        {product.name}
                    </h3>

                    {/* Description */}
                    {product.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                            {product.description}
                        </p>
                    )}

                    {/* Features */}
                    {product.features?.length > 0 && (
                        <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                                {product.features.slice(0, 2).map((feature, index) => (
                                    <span
                                        key={index}
                                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                                    >
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Price and Stock */}
                    <div className="mt-auto">
                        <div className="flex items-baseline justify-between mb-2">
                            <div>
                                <span className="text-base font-semibold text-[#00A9FF]">
                                    ₹{product.price.toLocaleString()}
                                </span>
                                {product.originalPrice > product.price && (
                                    <span className="text-xs text-gray-400 line-through ml-2">
                                        ₹{product.originalPrice.toLocaleString()}
                                    </span>
                                )}
                            </div>
                            
                            {/* In Cart Indicator */}
                            {isInCart && (
                                <span className="text-xs font-medium px-2 py-1 bg-[#10B981] text-white rounded-full">
                                    {cartQuantity} in cart
                                </span>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            {/* Stock Status */}
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                    product.stock > 10 ? 'bg-[#10B981]' : 
                                    product.stock > 0 ? 'bg-yellow-500' : 'bg-[#EF4444]'
                                }`} />
                                <span className="text-xs text-gray-500">
                                    {product.stock > 10 ? 'In stock' : 
                                    product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                                </span>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                                id={`cart-btn-${product.id}`}
                                onClick={() => handleAddToCart(product)}
                                disabled={product.stock === 0 || isAdding}
                                className={`
                                    px-3 py-2 text-xs font-medium rounded-md transition-colors
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    flex items-center gap-1.5 min-w-[100px]
                                `}
                                style={product.stock === 0 || isAdding ? { 
                                    backgroundColor: '#9CA3AF', 
                                    color: 'white' 
                                } : isInCart ? { 
                                    backgroundColor: '#10B981',
                                    color: 'white'
                                } : { 
                                    backgroundColor: '#00A9FF',
                                    color: 'white'
                                }}
                            >
                                {isAdding ? (
                                    <>
                                        <Loader2 className="animate-spin h-3 w-3" />
                                        <span>Adding</span>
                                    </>
                                ) : isInCart ? (
                                    <>
                                        <ShoppingCart size={12} />
                                        <span>Add More</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={12} />
                                        <span>Add to Cart</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <>
                <NavBar />
                <ToastContainer />
                <div className="min-h-screen flex items-center justify-center pt-20" style={{ backgroundColor: colors.background }}>
                    <div className="text-center">
                        <div className="relative">
                            <div className="w-12 h-12 border-2 border-t-blue-500 border-r-transparent border-b-blue-300 border-l-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                        <p className="mt-4 text-[#0B0C10] text-sm">Loading products...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error && products.length === 0) {
        return (
            <>
                <NavBar />
                <ToastContainer />
                <div className="min-h-screen flex items-center justify-center pt-20" style={{ backgroundColor: colors.background }}>
                    <div className="text-center max-w-md p-6">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-6 w-6 text-red-500" />
                        </div>
                        <p className="text-[#EF4444] mb-4 text-sm">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-[#00A9FF] text-white text-sm rounded-md hover:bg-[#0077B6] transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <NavBar />
            <ToastContainer 
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                toastClassName="rounded-md font-normal text-sm"
            />
            
            <div className="min-h-screen pt-16 bg-[#CDF5FD]">
                
                {/* Header */}
                <div className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h1 className="text-xl font-semibold text-[#0B0C10]">Water Purifiers</h1>
                                <p className="text-sm text-gray-500 mt-1">Professional water purification solutions</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                    <span className="font-medium text-[#00A9FF]">{filteredProducts.length}</span> of {products.length} products
                                </span>
                                {user ? (
                                    <span className="text-xs px-2 py-1 bg-[#A0E9FF] text-[#0B0C10] rounded-full">
                                        Logged in
                                    </span>
                                ) : (
                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                        Guest
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search 
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                                size={18} 
                            />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00A9FF] focus:border-[#00A9FF] transition-colors bg-white"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="appearance-none w-full md:w-48 px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00A9FF] focus:border-[#00A9FF] transition-colors bg-white cursor-pointer pr-10"
                            >
                                {categories.map(category => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none w-full md:w-48 px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00A9FF] focus:border-[#00A9FF] transition-colors bg-white cursor-pointer pr-10"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Results Info */}
                    {(searchTerm || selectedCategory !== 'all') && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                {filteredProducts.length} products found
                                {searchTerm && ` for "${searchTerm}"`}
                                {selectedCategory !== 'all' && ` in ${categories.find(c => c.value === selectedCategory)?.label}`}
                            </p>
                        </div>
                    )}

                    {/* Products Grid */}
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredProducts.map(product => 
                                <ProductCardGrid key={product.id} product={product} />
                            )}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={24} className="text-gray-400" />
                            </div>
                            <h3 className="text-base font-medium text-gray-700 mb-2">No products found</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                                Try adjusting your search or filter to find what you're looking for.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('all');
                                }}
                                className="px-4 py-2 text-sm bg-[#00A9FF] text-white rounded-md hover:bg-[#0077B6] transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ProductsPage;