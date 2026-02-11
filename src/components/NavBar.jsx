import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, X, Home, Info,Package , LogIn, UserPlus, Menu , Droplets } from "lucide-react";
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // Import AuthContext

const NavBar = () => {
    const { getCartItemsCount } = useCart();
    const { user, isAuthenticated, logout } = useAuth(); // Use AuthContext
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeLink, setActiveLink] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.user-dropdown')) {
                setIsDropdownOpen(false);
            }
            if (isMenuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-button')) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen, isMenuOpen]);

    const handleNavigation = (path) => {
        navigate(path);
        setIsMenuOpen(false);
        setActiveLink(path);
    };

    const handleUserAction = () => {
        if (isAuthenticated()) {
            setIsDropdownOpen(!isDropdownOpen);
        } else {
            navigate('/login');
        }
    };

    const handleLogout = () => {
        logout(); // Use AuthContext logout
        setIsDropdownOpen(false);
        setIsMenuOpen(false);
        navigate('/login');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const menuItems = [
        { path: '/login', icon: LogIn, label: 'Login', showWhenLoggedIn: false },
        { path: '/signup', icon: UserPlus, label: 'Sign Up', showWhenLoggedIn: false },
        { path: '/home', icon: Home, label: 'Home', showWhenLoggedIn: true },
        { path: '/about', icon: Info, label: 'About Us', showWhenLoggedIn: true },
        { path: '/watertest', icon: Droplets, label: 'Water Test', showWhenLoggedIn: true },
        { path: '/orders', icon: Package , label: 'Orders', showWhenLoggedIn: true },
    ];

    const filteredMenuItems = menuItems.filter(item => 
        isAuthenticated() ? item.showWhenLoggedIn : !item.showWhenLoggedIn
    );

    const cartItemsCount = getCartItemsCount();

    // Get user display name
    const getUserDisplayName = () => {
        if (!user) return 'Welcome';
        return user.username || user.name || user.email?.split('@')[0] || 'User';
    };

    // Get user email
    const getUserEmail = () => {
        if (!user) return 'Login / Register';
        return user.email || 'My Account';
    };

    return (
        <nav className={`w-full fixed top-0 z-50 transition-all duration-300 ${
            isScrolled 
                ? 'shadow-lg bg-[#00A9FF] border-b border-[#89CFF3]' 
                : 'bg-[#00A9FF] border-b border-[#A0E9FF]'
        }`}>
            {/* Main NavBar - Reduced width */}
            <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
                {/* Logo and Mobile Menu */}
                <div className="flex items-center gap-3">
                    <div 
                        className="flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:drop-shadow-lg"
                        onClick={() => handleNavigation('/home')}
                    >
                        <img 
                            src="src/assets/Products/ChatGPT Image Nov 27, 2025, 02_32_36 PM.png" 
                            alt="Everlast Water Solutions" 
                            className="h-12 w-12 duration-300 hover:border-[#A0E9FF]"
                        />
                    </div>
                    <span className="text-lg font-bold text-white transition-colors duration-300 hover:text-gray-800">
                        Everlast Water Solution
                    </span>
                </div>

                {/* Navigation Links - Desktop */}
                <div className="hidden md:flex items-center gap-1">
                    {['/home', '/products', '/services', '/about','/watertest'].map((path) => (
                        <button
                            key={path}
                            className={`font-medium transition-all duration-300 py-2 px-3 rounded-lg relative group ${
                                activeLink === path 
                                ? 'text-black bg-[#A0E9FF] shadow-sm scale-105' 
                                : 'text-black hover:text-gray-800'
                            }`}
                            onClick={() => handleNavigation(path)}
                            onKeyPress={(e) => e.key === 'Enter' && handleNavigation(path)}
                            tabIndex={0}
                        >
                            {/* Background highlight on hover */}
                            <div className={`absolute inset-0 bg-[#A0E9FF] rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 -z-10 ${
                                activeLink === path ? 'opacity-100' : ''
                            }`} />
                            
                            {/* Text content */}
                            <span className="relative z-10 transition-all duration-300 group-hover:scale-105 text-sm">
                                {path === '/home' ? 'Home' : 
                                 path.split('/')[1].charAt(0).toUpperCase() + path.split('/')[1].slice(1)}
                            </span>
                            
                            {/* Bottom border effect */}
                            <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gray-800 transition-all duration-300 group-hover:w-4/5 ${
                                activeLink === path ? 'w-4/5 bg-gray-800' : ''
                            }`} />
                            
                            {/* Subtle glow effect */}
                            <div className={`absolute inset-0 rounded-lg bg-[#A0E9FF] opacity-0 transition-all duration-300 group-hover:opacity-20 -z-10 ${
                                activeLink === path ? 'opacity-20' : ''
                            }`} />
                        </button>
                    ))}
                </div>

                {/* Icons Section */}
                <div className="flex items-center gap-2">
                    {/* Cart Icon with Count */}
                    <button 
                        className="p-2 rounded-lg transition-all duration-300 hover:bg-[#A0E9FF] relative group focus:outline-none focus:ring-2 focus:ring-gray-800"
                        onClick={() => handleNavigation('/cart')}
                        tabIndex={0}
                    >
                        <div className="absolute inset-0 bg-[#A0E9FF] rounded-lg opacity-0 transition-all duration-300 group-hover:opacity-100 -z-10" />
                        <ShoppingCart size={20} className="text-black transition-all duration-300 group-hover:scale-110" />
                        {cartItemsCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-pulse border border-gray-800 transition-all duration-300 group-hover:border-white">
                                {cartItemsCount}
                            </span>
                        )}
                    </button>

                    {/* Menu Bar Icon */}
                    <button 
                        className="mobile-menu-button p-2 rounded-lg transition-all duration-300 hover:bg-[#A0E9FF] group focus:outline-none focus:ring-2 focus:ring-gray-800"
                        onClick={toggleMenu}
                        tabIndex={0}
                    >
                        <div className="absolute inset-0 bg-[#A0E9FF] rounded-lg opacity-0 transition-all duration-300 group-hover:opacity-100 -z-10" />
                        <Menu size={20} className="text-black transition-all duration-300 group-hover:scale-110 group-hover:text-gray-800" />
                    </button>

                    {/* User Button */}
                    <div className="relative user-dropdown">
                        <button
                            className="flex items-center gap-2 p-2 rounded-lg transition-all duration-300 hover:bg-[#A0E9FF] group focus:outline-none focus:ring-2 focus:ring-gray-800"
                            onClick={handleUserAction}
                            tabIndex={0}
                        >
                            <div className="absolute inset-0 bg-[#A0E9FF] rounded-lg opacity-0 transition-all duration-300 group-hover:opacity-100 -z-10" />
                            <div className="w-8 h-8 bg-[#A0E9FF] rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:bg-[#89CFF3] border border-black group-hover:border-gray-800">
                                <User size={16} className="text-black transition-colors duration-300 group-hover:text-black" />
                            </div>
                            <div className="text-left hidden sm:block">
                                <span className="block text-sm font-medium text-black transition-colors duration-300 group-hover:text-gray-800">
                                    {getUserDisplayName()}
                                </span>
                                <span className="block text-xs text-gray-800 transition-colors duration-300 group-hover:text-gray-700">
                                    {getUserEmail()}
                                </span>
                            </div>
                        </button>

                        {/* User Dropdown */}
                        {isAuthenticated() && isDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-[#A0E9FF] rounded-lg shadow-xl border border-[#89CFF3] overflow-hidden z-1000 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="p-3 border-b border-[#89CFF3] bg-[#00A9FF]">
                                    <p className="text-sm font-semibold text-black">{getUserDisplayName()}</p>
                                    <p className="text-xs text-black truncate">{user.email}</p>
                                </div>
                                <button
                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-black transition-all duration-300 hover:bg-[#89CFF3] hover:text-black focus:outline-none focus:bg-[#89CFF3] focus:text-black"
                                    onClick={handleLogout}
                                    tabIndex={0}
                                >
                                    <LogOut size={16} className="text-black" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu - Slides from right */}
            <div className={`mobile-menu fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${
                isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                {/* Backdrop */}
                <div 
                    className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
                    onClick={() => setIsMenuOpen(false)}
                />
                
                {/* Menu Content - Reduced width */}
                <div className="absolute right-0 top-0 h-full w-72 bg-[#00A9FF] shadow-2xl overflow-y-auto border-l border-[#89CFF3]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-[#89CFF3] bg-[#00A9FF]">
                        <h2 className="text-lg font-bold text-black">Menu</h2>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-2 rounded-lg transition-all duration-300 hover:bg-[#A0E9FF] focus:outline-none focus:ring-2 focus:ring-gray-800"
                            tabIndex={0}
                        >
                            <X size={20} className="text-black transition-colors duration-300 hover:text-gray-800" />
                        </button>
                    </div>

                    {/* User Info */}
                    {isAuthenticated() && user && (
                        <div className="p-4 border-b border-[#89CFF3] bg-[#A0E9FF]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#00A9FF] rounded-full flex items-center justify-center border-2 border-black transition-all duration-300 hover:border-gray-800">
                                    <User size={18} className="text-black transition-colors duration-300 hover:text-gray-800" />
                                </div>
                                <div>
                                    <p className="font-semibold text-black text-sm">{getUserDisplayName()}</p>
                                    <p className="text-xs text-black opacity-80">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Menu Items */}
                    <div className="p-3">
                        <div className="space-y-1">
                            {/* Authentication Links */}
                            {filteredMenuItems.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => handleNavigation(item.path)}
                                        className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-300 text-black hover:text-gray-800 focus:outline-none focus:bg-[#A0E9FF] focus:text-black relative group"
                                        tabIndex={0}
                                    >
                                        <div className="absolute inset-0 bg-[#A0E9FF] rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 -z-10" />
                                        <IconComponent size={18} className="transition-all duration-300 group-hover:scale-110 text-black" />
                                        <span className="font-medium transition-all duration-300 group-hover:scale-105 text-sm">
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            })}

                            {/* Cart Item in Mobile Menu */}
                            <button
                                onClick={() => handleNavigation('/cart')}
                                className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-300 text-black hover:text-gray-800 focus:outline-none focus:bg-[#A0E9FF] focus:text-black relative group"
                                tabIndex={0}
                            >
                                <div className="absolute inset-0 bg-[#A0E9FF] rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 -z-10" />
                                <ShoppingCart size={18} className="transition-all duration-300 group-hover:scale-110 text-black" />
                                <span className="font-medium transition-all duration-300 group-hover:scale-105 text-sm">Cart</span>
                                {cartItemsCount > 0 && (
                                    <span className="absolute right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold border border-gray-800 transition-all duration-300 group-hover:border-white group-hover:scale-110">
                                        {cartItemsCount}
                                    </span>
                                )}
                            </button>

                            {/* Logout for logged-in users */}
                            {isAuthenticated() && (
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-300 text-black hover:text-red-800 hover:bg-red-400 mt-3 focus:outline-none focus:bg-red-400 focus:text-red-800 relative group"
                                    tabIndex={0}
                                >
                                    <div className="absolute inset-0 bg-red-400 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 -z-10" />
                                    <LogOut size={18} className="transition-all duration-300 group-hover:scale-110 text-black" />
                                    <span className="font-medium transition-all duration-300 group-hover:scale-105 text-sm">Logout</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;