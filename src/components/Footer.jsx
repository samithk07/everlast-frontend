import React from 'react';
import { Phone, Mail, MapPin, Home, User, ShoppingCart, Info } from 'lucide-react';

const Footer = () => {
    const colors = {
        primary: '#00A9FF',
        secondary: '#89CFF3',
        accent: '#A0E9FF',
        background: '#CDF5FD',
        text: '#0B0C10',
        error: '#EF4444'
    };

    // Google Maps link for the address
    const mapsLink = "https://maps.app.goo.gl/MDbBZH5WGTFFFA9cA";

    return (
        <footer style={{ backgroundColor: colors.text }} className="text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Left Section - Company Info */}
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                            <img 
                                src="src/assets/everlastLogo.jpeg" 
                                alt="Everlast Water Solutions" 
                                className="h-10 w-10 object-contain rounded-full"
                            />
                            <div>
                                <h3 className="text-xl font-bold text-white">Everlast Water</h3>
                                <p className="text-sm text-gray-300">Pure Water Solutions</p>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Providing clean, safe drinking water solutions for families and businesses across India with trusted purification technology.
                        </p>
                    </div>

                    {/* Middle Section - Quick Links */}
                    <div className="text-center md:text-left">
                        <h3 className="font-semibold text-white mb-4 text-lg border-b border-gray-700 pb-2">Quick Links</h3>
                        <ul className="space-y-2">
                            {[
                                { icon: Home, label: 'Home', path: '/home' },
                                { icon: User, label: 'About', path: '/about' },
                                { icon: ShoppingCart, label: 'Products', path: '/products' },
                           
                            ].map((link, index) => {
                                const IconComponent = link.icon;
                                return (
                                    <li key={index}>
                                        <a 
                                            href={link.path}
                                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 text-sm group"
                                        >
                                            <IconComponent size={16} className="group-hover:scale-110 transition-transform" />
                                            {link.label}
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Right Section - Contact Info */}
                    <div className="text-center md:text-left">
                        <h3 className="font-semibold text-white mb-4 text-lg border-b border-gray-700 pb-2">Contact Us</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-center md:justify-start gap-3 text-gray-400 hover:text-white transition-colors duration-200 group">
                                <Phone size={16} className="group-hover:scale-110 transition-transform" />
                                <span className="text-sm">+91 8078332452</span>
                            </div>
                            
                            <div className="flex items-center justify-center md:justify-start gap-3 text-gray-400 hover:text-white transition-colors duration-200 group">
                                <Mail size={16} className="group-hover:scale-110 transition-transform" />
                                <span className="text-sm">info@everlastwater.com</span>
                            </div>
                            
                            <a 
                                href={mapsLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center md:justify-start gap-3 text-gray-400 hover:text-white transition-colors duration-200 group"
                            >
                                <MapPin size={16} className="group-hover:scale-110 transition-transform" />
                                <span className="text-sm text-left">
                                    Kumbala, Uppala,<br />
                                    Vitla, Thokkot
                                </span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Copyright */}
                <div className="border-t border-gray-700 mt-8 pt-6 text-center">
                    <p className="text-gray-400 text-sm">
                        © 2025 Everlast Water Solutions. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;