// components/adminLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Menu,
  X,
  Wrench,
  Droplets,
  LogOut,
  Search,
  Shield,
  Database,
  RefreshCw,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const logoutRef = useRef(null);
  const mainContentRef = useRef(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { id: 'products', label: 'Products', icon: <Package size={20} />, path: '/admin/products' },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={20} />, path: '/admin/orders' },
    { id: 'users', label: 'Users', icon: <Users size={20} />, path: '/admin/users' },
    { id: 'services', label: 'Services', icon: <Wrench size={20} />, path: '/admin/services' },
  ];

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    document.body.style.overflowX = 'hidden';
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.body.style.overflowX = '';
    };
  }, []);

  const getPageTitle = () => {
    const currentPath = location.pathname;
    const item = navItems.find(item => currentPath.includes(item.id));
    return item ? item.label : 'Dashboard';
  };

  const getPageDescription = () => {
    const currentPath = location.pathname;
    if (currentPath.includes('dashboard')) return 'Overview and analytics';
    if (currentPath.includes('products')) return 'Manage product catalog';
    if (currentPath.includes('orders')) return 'View and process orders';
    if (currentPath.includes('users')) return 'Manage user accounts';
    if (currentPath.includes('services')) return 'Manage service requests';
    return 'admin Panel';
  };

  const handleLogout = () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    const button = logoutRef.current;
    if (button) {
      button.style.transform = 'scale(0.95)';
      button.style.opacity = '0.7';
    }

    setTimeout(() => {
      logout();
      navigate('/login');
      setIsLoggingOut(false);
    }, 1500);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className={`min-h-screen w-screen overflow-hidden ${darkMode ? 'dark bg-[#222831]' : 'bg-[#EEEEEE]'}`}>
      {/* Top Navigation Bar - Mobile & Tablet */}
      <header className={`${darkMode ? 'bg-[#393E46]' : 'bg-white'} border-b ${darkMode ? 'border-[#222831]' : 'border-[#EEEEEE]'} lg:hidden sticky top-0 z-50 w-full`}>
        <div className="px-4 py-3 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-[#EEEEEE] dark:hover:bg-[#222831] transition-colors shrink-0"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-[#222831] dark:text-[#EEEEEE] truncate">
                  {getPageTitle()}
                </h1>
                <p className="text-xs text-[#393E46] dark:text-[#00ADB5] truncate">
                  {getPageDescription()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              {/* Mobile Search - Hidden on very small screens */}
              <div className="hidden xs:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#393E46]" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 w-32 sm:w-40 rounded-lg border border-[#EEEEEE] focus:outline-none focus:ring-1 focus:ring-[#00ADB5] text-sm max-w-full dark:bg-[#393E46] dark:border-[#222831] dark:text-[#EEEEEE]"
                />
              </div>
              <div className="w-8 h-8 rounded-full bg-[#00ADB5] flex items-center justify-center text-[#EEEEEE] font-bold text-sm shadow-md shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex w-full h-[calc(100vh-64px)] lg:h-screen">
        {/* Sidebar - Mobile Overlay & Desktop Sidebar */}
        <div
          className={`
            fixed lg:relative inset-y-0 left-0 z-40
            bg-[#222831]
            transform transition-all duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${sidebarOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'}
            flex flex-col h-full
            shadow-xl lg:shadow-lg
            ${sidebarOpen ? 'w-64 lg:w-72 xl:w-80' : 'w-0 lg:w-0'}
          `}
        >
          {/* Sidebar Header */}
          <div className={`p-4 border-b border-[#393E46] ${sidebarOpen ? '' : 'lg:p-2'}`}>
            <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'lg:justify-center'}`}>
              {sidebarOpen ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#00ADB5] flex items-center justify-center shrink-0">
                      <Droplets size={24} className="text-[#EEEEEE]" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xl font-bold text-white truncate">Everlast Water Solution</h5>
                      <p className="text-xs text-white truncate">Since-2006</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleSidebar}
                    className="hidden lg:block p-1.5 rounded-lg hover:bg-[#393E46] transition-colors shrink-0"
                    aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                  >
                    <ChevronLeft size={20} className="text-white" />
                  </button>
                </>
              ) : (
                <div className="hidden lg:flex justify-center w-full">
                  <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-lg hover:bg-[#393E46] transition-colors"
                    aria-label="Expand sidebar"
                  >
                    <ChevronRightIcon size={20} className="text-[#EEEEEE]" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation - Scrollbar hidden */}
          <nav className={`flex-1 overflow-y-auto scrollbar-hide ${sidebarOpen ? 'p-4' : 'lg:p-0'}`}>
            <div className="mb-6">
              {sidebarOpen && (
                <p className="text-xs font-semibold text-white uppercase tracking-wider mb-3 px-2 truncate">
                  Main Menu
                </p>
              )}
              {sidebarOpen || mobileMenuOpen ? (
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.id}>
                      <NavLink
                        to={item.path}
                        onClick={closeMobileMenu}
                        end={item.path === '/admin/dashboard'}
                        className={({ isActive }) => `
                          group flex items-center rounded-xl transition-all duration-200 overflow-hidden
                          ${sidebarOpen ? 'px-3 py-3 sm:py-2.5' : 'lg:hidden px-3 py-3'}
                          ${isActive
                            ? 'bg-[#00ADB5] text-white shadow-lg'
                            : 'text-white hover:bg-[#393E46] hover:shadow-md'
                          }
                          active:scale-[0.98]
                        `}
                        style={{ textDecoration: 'none' }}
                        title={!sidebarOpen ? item.label : ''}
                      >
                        <span className={`${sidebarOpen ? 'mr-3' : ''} group-hover:scale-110 transition-transform shrink-0`}>
                          {item.icon}
                        </span>
                        {sidebarOpen && (
                          <>
                            <span className="text-sm font-medium flex-1 min-w-0 truncate">{item.label}</span>
                            <ChevronRightIcon size={14} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </>
                        )}
                        {item.id === 'dashboard' && location.pathname === '/admin/dashboard' && sidebarOpen && (
                          <div className="w-2 h-2 bg-[#00ADB5] rounded-full animate-pulse ml-2 shrink-0"></div>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              ) : (
                // Collapsed sidebar navigation icons (desktop only)
                <div className="hidden lg:flex flex-col items-center space-y-1 py-2">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      end={item.path === '/admin/dashboard'}
                      className={({ isActive }) => `
                        group flex items-center justify-center p-3 rounded-xl transition-all duration-200
                        ${isActive
                          ? 'bg-[#00ADB5] text-white shadow-lg'
                          : 'text-white hover:bg-[#393E46] hover:shadow-md'
                        }
                        active:scale-[0.98]
                      `}
                      style={{ textDecoration: 'none' }}
                      title={item.label}
                    >
                      {item.icon}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats - Hidden on collapsed sidebar */}
            {sidebarOpen && (
              <div className="mt-8 p-3 bg-[#393E46] rounded-xl">
                <p className="text-xs font-semibold text-[#00ADB5] mb-2 truncate">Quick Stats</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#222831] rounded-lg p-2">
                    <p className="text-xs text-[#EEEEEE]/80 truncate">Online</p>
                    <p className="text-sm font-bold text-[#EEEEEE] truncate">24/7</p>
                  </div>
                  <div className="bg-[#222831] rounded-lg p-2">
                    <p className="text-xs text-[#EEEEEE]/80 truncate">Users</p>
                    <p className="text-sm font-bold text-[#EEEEEE] truncate">15</p>
                  </div>
                </div>
              </div>
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className={`border-t border-[#393E46] ${sidebarOpen ? 'p-4' : 'lg:p-2'}`}>
            {/* User Info */}
            {sidebarOpen ? (
              <div className="flex items-center space-x-3 mb-4 p-2 rounded-lg bg-[#393E46]">
                <div className="w-10 h-10 rounded-full bg-[#00ADB5] flex items-center justify-center text-[#EEEEEE] font-bold shadow-md shrink-0">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#EEEEEE] truncate">{user?.name || 'admin User'}</p>
                  <p className="text-xs text-[#00ADB5] truncate">administrator</p>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex justify-center mb-4 py-2">
                <div className="w-10 h-10 rounded-full bg-[#00ADB5] flex items-center justify-center text-[#EEEEEE] font-bold shadow-md">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button 
              ref={logoutRef}
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`
                w-full flex items-center justify-center rounded-xl transition-all duration-300 overflow-hidden
                ${sidebarOpen ? 'px-4 py-3' : 'lg:px-3 lg:py-3'}
                ${isLoggingOut 
                  ? 'bg-[#c71a1a] animate-pulse' 
                  : 'bg-[#00ADB5] hover:bg-[#f60800] active:scale-[0.98]'
                }
                text-[#EEEEEE] font-medium shadow-lg hover:shadow-xl
              `}
              title={!sidebarOpen ? 'Logout' : ''}
            >
              {isLoggingOut ? (
                <>
                  <RefreshCw size={18} className={`${sidebarOpen ? 'mr-2' : ''} animate-spin`} />
                  {sidebarOpen && <span className="text-sm truncate">Logging Out...</span>}
                </>
              ) : (
                <>
                  <LogOut size={18} className={`${sidebarOpen ? 'mr-2' : ''}`} />
                  {sidebarOpen && <span className="text-sm truncate">Logout</span>}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main 
          ref={mainContentRef}
          className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:w-[calc(100vw-288px)] xl:w-[calc(100vw-320px)]' : 'lg:w-full'}`}
        >
          {/* Top Bar - Desktop */}
          <header className={`${darkMode ? 'bg-[#393E46]' : 'bg-white'} border-b ${darkMode ? 'border-[#222831]' : 'border-[#EEEEEE]'} hidden lg:block sticky top-0 z-40 w-full`}>
            <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-4 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-4 min-w-0">
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-[#EEEEEE] dark:hover:bg-[#222831] transition-colors shrink-0"
                    aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                  >
                    <Menu size={20} className={darkMode ? 'text-[#EEEEEE]' : 'text-[#393E46]'} />
                  </button>
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#222831] dark:text-[#EEEEEE] truncate">
                      {getPageTitle()}
                    </h1>
                    <p className="text-sm text-[#393E46] dark:text-[#00ADB5] truncate">
                      {getPageDescription()}
                    </p>
                  </div>
                </div>
                
                {/* <div className="flex items-center space-x-4 shrink-0">
                  <div className="hidden md:block relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#393E46] dark:text-[#EEEEEE]" size={18} />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-48 lg:w-64 rounded-lg border border-[#EEEEEE] focus:outline-none focus:ring-1 focus:ring-[#00ADB5] dark:bg-[#393E46] dark:border-[#222831] dark:text-[#EEEEEE]"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#00ADB5] flex items-center justify-center text-[#EEEEEE] font-bold text-sm shadow-md shrink-0">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                </div> */}
              </div>
            </div>
          </header>

          {/* Page Content - Scrollbar hidden */}
          <div className={`flex-1 p-3 sm:p-4 lg:p-6 xl:p-8 overflow-y-auto overflow-x-hidden w-full scrollbar-hide ${darkMode ? 'bg-[#222831]' : 'bg-[#EEEEEE]'}`}>
            {/* Content Container */}
            <div className="w-full max-w-none lg:max-w-screen-2xl mx-auto">
              {/* System Status Bar - Hidden on mobile */}
              <div className={`mb-4 sm:mb-6 p-4 rounded-xl ${darkMode ? 'bg-[#393E46]' : 'bg-white'} shadow-sm border ${darkMode ? 'border-[#222831]' : 'border-[#EEEEEE]'} hidden sm:block`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-[#00ADB5] animate-pulse mr-2 shrink-0"></div>
                      <span className={`text-sm ${darkMode ? 'text-[#EEEEEE]' : 'text-[#222831]'} truncate`}>System Online</span>
                    </div>
                    <div className="hidden md:flex items-center">
                      <Database size={16} className="mr-2 text-[#00ADB5] shrink-0" />
                      <span className={`text-sm ${darkMode ? 'text-[#EEEEEE]' : 'text-[#222831]'} truncate`}>
                        admin Panel v1.0
                      </span>
                    </div>
                    <div className="hidden lg:flex items-center">
                      <Shield size={16} className="mr-2 text-[#00ADB5] shrink-0" />
                      <span className={`text-sm ${darkMode ? 'text-[#EEEEEE]' : 'text-[#222831]'} truncate`}>
                        Security: Active
                      </span>
                    </div>
                  </div>
                  
                  
                </div>
              </div>

              {/* Main Content Outlet */}
              <div className="w-full">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Bottom Navigation - Only on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#EEEEEE] dark:bg-[#393E46] dark:border-[#222831] z-40">
        <div className="flex justify-around py-2 px-1">
          {navItems.slice(0, 3).map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/admin/dashboard'}
              className={({ isActive }) => `
                flex flex-col items-center p-2 rounded-lg transition-colors flex-1 min-w-0 mx-1
                ${isActive 
                  ? 'text-[#00ADB5] bg-[#00ADB5]/10' 
                  : 'text-[#393E46] dark:text-[#EEEEEE]'
                }
              `}
              onClick={closeMobileMenu}
            >
              <span className="mb-1 shrink-0">{item.icon}</span>
              <span className="text-xs font-medium truncate">{item.label}</span>
            </NavLink>
          ))}
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center p-2 rounded-lg text-[#00ADB5] hover:bg-[#00ADB5]/10 dark:hover:bg-[#00ADB5]/20 transition-colors flex-1 min-w-0 mx-1"
          >
            <LogOut size={20} className="mb-1 shrink-0" />
            <span className="text-xs font-medium truncate">Logout</span>
          </button>
        </div>
      </div>

      {/* Global scrollbar hide CSS */}
      <style jsx>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        
        /* Hide scrollbar for the entire app */
        ::-webkit-scrollbar {
          width: 0px;
          height: 0px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: tran nsparent;
        }
        
        /* Ensure smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;