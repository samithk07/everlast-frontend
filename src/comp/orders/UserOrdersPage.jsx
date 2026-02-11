import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye, 
  IndianRupee,
  Filter,
  Search,
  Edit2,
  Trash2,
  MoreVertical,
  Plus,
  RefreshCw,
  Printer,
  TrendingUp,
  TrendingDown,
  Package,
  User,
  DollarSign,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Truck,
  CreditCard,
  Shield,
  Box,
  Layers
} from 'lucide-react';
import { format } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = 'http://localhost:3001';

const OrderDetailsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  
  // Modal States
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  
  // Filter States
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Bulk Actions
  const [selectedOrders, setSelectedOrders] = useState([]);
  
  // Products data for reference
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  // For debugging
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    fetchAllData();
    checkLocalStorageOrders();
  }, []);

  // Check localStorage for orders
  const checkLocalStorageOrders = () => {
    try {
      const allOrders = JSON.parse(localStorage.getItem('user_orders')) || {};
      console.log('📦 LocalStorage orders:', allOrders);
      
      // Get all orders from localStorage (combine all users)
      let allLocalStorageOrders = [];
      Object.keys(allOrders).forEach(userId => {
        if (Array.isArray(allOrders[userId])) {
          allLocalStorageOrders = [...allLocalStorageOrders, ...allOrders[userId]];
        }
      });
      
      console.log('📦 Total localStorage orders:', allLocalStorageOrders.length);
      
      if (allLocalStorageOrders.length > 0) {
        // Transform localStorage orders to match expected format
        const transformedLocalOrders = allLocalStorageOrders.map(order => {
          return transformSingleOrder(order, [], []);
        });
        
        // Merge with existing orders
        setOrders(prev => {
          const existingIds = new Set(prev.map(o => o.id));
          const newOrders = transformedLocalOrders.filter(o => !existingIds.has(o.id));
          return [...prev, ...newOrders];
        });
      }
    } catch (error) {
      console.error('Error checking localStorage:', error);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setDebugInfo('Fetching data...');
      
      // Fetch all data in parallel
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/orders`),
        fetch(`${API_BASE}/products`),
        fetch(`${API_BASE}/users`)
      ]);

      if (!ordersRes.ok) throw new Error('Failed to fetch orders');
      if (!productsRes.ok) throw new Error('Failed to fetch products');
      if (!usersRes.ok) throw new Error('Failed to fetch users');

      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();
      const usersData = await usersRes.json();

      console.log('📦 Orders from DB:', ordersData);
      console.log('📦 Products from DB:', productsData.length);
      console.log('📦 Users from DB:', usersData.length);

      setProducts(productsData);
      setUsers(usersData);

      // Transform orders data with complete details
      const transformedOrders = transformOrdersData(ordersData, productsData, usersData);
      console.log('📦 Transformed orders:', transformedOrders);
      
      setOrders(transformedOrders);
      setError('');
      setDebugInfo(`Loaded ${transformedOrders.length} orders from database`);
      
      toast.success('All data loaded successfully');
    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Failed to load data from server. Using localStorage data.');
      setDebugInfo('Using localStorage data');
      toast.warning('Using localStorage data');
      
      // Load from localStorage as fallback
      checkLocalStorageOrders();
    } finally {
      setLoading(false);
    }
  };

  const transformSingleOrder = (order, productsData, usersData) => {
    try {
      // Generate numeric ID if not present
      const numericId = typeof order.id === 'number' ? order.id : Date.now();
      const orderId = order.orderId || order.id || `ORD-${String(numericId).padStart(5, '0')}`;
      
      // Find user details
      const user = usersData.find(u => 
        u.id === order.userId || 
        u.email === order.userEmail || 
        u.username === order.userName
      );
      
      // Get all ordered products with full details
      const orderItems = order.items || order.products || [];
      const detailedItems = orderItems.map(item => {
        const product = productsData.find(p => 
          p.id === item.productId || 
          p.name === item.productName
        );
        return {
          ...item,
          id: item.productId || product?.id || item.id,
          name: item.productName || product?.name || item.name || 'Unknown Product',
          price: item.price || product?.price || 0,
          quantity: item.quantity || 1,
          image: item.productImage || product?.image || item.image,
          category: product?.category || item.category,
          description: product?.description || item.description
        };
      });

      // Calculate total from items if not provided
      const calculatedTotal = detailedItems.reduce((total, item) => 
        total + ((item.price || 0) * (item.quantity || 1)), 0
      );

      // Extract address data from the order
      const deliveryAddress = order.deliveryAddress || {};
      
      // Build shipping address object from deliveryAddress
      const shippingAddress = {
        street: deliveryAddress.addressLine1 || '',
        city: deliveryAddress.city || '',
        state: deliveryAddress.state || '',
        zipCode: deliveryAddress.pincode || deliveryAddress.zipCode || '',
        country: deliveryAddress.country || 'India',
        fullAddress: deliveryAddress.addressLine1 || ''
      };

      // Add addressLine2 if exists
      if (deliveryAddress.addressLine2 && deliveryAddress.addressLine2.trim() !== '') {
        shippingAddress.fullAddress += `, ${deliveryAddress.addressLine2}`;
      }

      // Add city, state, zip if they exist
      if (deliveryAddress.city) {
        shippingAddress.fullAddress += `, ${deliveryAddress.city}`;
      }
      if (deliveryAddress.state) {
        shippingAddress.fullAddress += `, ${deliveryAddress.state}`;
      }
      if (deliveryAddress.pincode) {
        shippingAddress.fullAddress += ` - ${deliveryAddress.pincode}`;
      }
      if (deliveryAddress.country && deliveryAddress.country !== 'India') {
        shippingAddress.fullAddress += `, ${deliveryAddress.country}`;
      }

      // Build customer details
      const customerName = order.userName || user?.username || user?.name || deliveryAddress.fullName || `Customer #${numericId}`;
      const customerEmail = order.userEmail || user?.email || deliveryAddress.email || `customer${numericId}@example.com`;

      return {
        // Core identifiers
        id: numericId,
        orderId: orderId,
        
        // Customer details
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: deliveryAddress.phoneNumber || order.phone || 'Not provided',
        userId: order.userId || user?.id,
        
        // Shipping address details
        shippingAddress: shippingAddress,
        
        // Order items with full product details
        items: detailedItems,
        
        // Financial details
        subtotal: order.subtotal || calculatedTotal,
        tax: order.tax || order.taxAmount || calculatedTotal * 0.18,
        shippingCost: order.shippingCost || order.shipping || (calculatedTotal > 5000 ? 0 : 200),
        discount: order.discount || order.discountAmount || 0,
        totalAmount: order.totalAmount || order.total || calculatedTotal,
        
        // Order status and dates
        status: order.status || 'pending',
        paymentMethod: order.paymentMethod || 'credit-card',
        paymentStatus: order.paymentStatus || 'paid',
        orderDate: order.orderDate || order.createdAt || order.date || new Date().toISOString(),
        estimatedDelivery: order.estimatedDelivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        deliveredDate: order.deliveredDate,
        
        // Additional info
        notes: order.notes || order.note || '',
        trackingNumber: order.trackingNumber || `TRK-${Date.now()}`,
        shippingMethod: order.shippingMethod || 'standard',
        shippingCarrier: order.shippingCarrier || 'Standard Shipping',
        
        // Payment details
        transactionId: order.transactionId,
        paymentDetails: order.paymentDetails || {}
      };
    } catch (error) {
      console.error('Error transforming order:', error, order);
      return null;
    }
  };

  const transformOrdersData = (ordersData, productsData, usersData) => {
    const transformed = ordersData
      .map(order => transformSingleOrder(order, productsData, usersData))
      .filter(order => order !== null);
    
    console.log('✅ Transformed orders count:', transformed.length);
    return transformed;
  };

  // Order Status Configuration
  const statusConfig = {
    'pending': {
      label: 'Pending',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: <Clock size={14} className="mr-1" />,
      badgeColor: 'bg-yellow-500'
    },
    'confirmed': {
      label: 'Confirmed',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: <CheckCircle size={14} className="mr-1" />,
      badgeColor: 'bg-blue-500'
    },
    'processing': {
      label: 'Processing',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      icon: <RefreshCw size={14} className="mr-1 animate-spin" />,
      badgeColor: 'bg-indigo-500'
    },
    'shipped': {
      label: 'Shipped',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: <Truck size={14} className="mr-1" />,
      badgeColor: 'bg-purple-500'
    },
    'delivered': {
      label: 'Delivered',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: <CheckCircle size={14} className="mr-1" />,
      badgeColor: 'bg-green-500'
    },
    'completed': {
      label: 'Completed',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: <CheckCircle size={14} className="mr-1" />,
      badgeColor: 'bg-emerald-500'
    },
    'cancelled': {
      label: 'Cancelled',
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: <XCircle size={14} className="mr-1" />,
      badgeColor: 'bg-red-500'
    },
    'refunded': {
      label: 'Refunded',
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: <DollarSign size={14} className="mr-1" />,
      badgeColor: 'bg-gray-500'
    }
  };

  // Payment Status Configuration
  const paymentStatusConfig = {
    'paid': {
      label: 'Paid',
      color: 'bg-green-100 text-green-800',
      icon: <CheckCircle size={12} />
    },
    'pending': {
      label: 'Pending',
      color: 'bg-yellow-100 text-yellow-800',
      icon: <Clock size={12} />
    },
    'failed': {
      label: 'Failed',
      color: 'bg-red-100 text-red-800',
      icon: <XCircle size={12} />
    },
    'refunded': {
      label: 'Refunded',
      color: 'bg-blue-100 text-blue-800',
      icon: <DollarSign size={12} />
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status) => {
    const config = paymentStatusConfig[status] || paymentStatusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </span>
    );
  };

  // Order Actions
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      const updatedOrder = {
        ...order,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      if (newStatus === 'delivered' || newStatus === 'completed') {
        updatedOrder.deliveredDate = new Date().toISOString();
      }

      // Try to update in db.json
      try {
        const response = await fetch(`${API_BASE}/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: newStatus, 
            updatedAt: updatedOrder.updatedAt,
            ...(updatedOrder.deliveredDate && { deliveredDate: updatedOrder.deliveredDate })
          })
        });

        if (response.ok) {
          console.log('✅ Order status updated in database');
        }
      } catch (dbError) {
        console.log('⚠️ Could not update in database, updating locally only');
      }

      // Update local state
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      toast.success(`Order status updated to ${newStatus}`);
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
      return false;
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder({ ...order });
    setShowEditModal(true);
  };

  const saveEditedOrder = async () => {
    try {
      // Try to save to db.json
      try {
        const response = await fetch(`${API_BASE}/orders/${editingOrder.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingOrder)
        });

        if (response.ok) {
          const updatedOrder = await response.json();
          console.log('✅ Order updated in database');
        }
      } catch (dbError) {
        console.log('⚠️ Could not update in database, updating locally only');
      }

      // Update local state
      setOrders(orders.map(o => o.id === editingOrder.id ? editingOrder : o));
      setShowEditModal(false);
      setEditingOrder(null);
      toast.success('Order updated successfully');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      // Try to delete from db.json
      try {
        const response = await fetch(`${API_BASE}/orders/${orderId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          console.log('✅ Order deleted from database');
        }
      } catch (dbError) {
        console.log('⚠️ Could not delete from database, deleting locally only');
      }

      // Update local state
      setOrders(orders.filter(order => order.id !== orderId));
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
      toast.success('Order deleted successfully');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Bulk Actions
  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  const bulkUpdateStatus = async (status) => {
    if (selectedOrders.length === 0) return;
    
    const promises = selectedOrders.map(id => 
      updateOrderStatus(id, status)
    );
    
    await Promise.all(promises);
    setSelectedOrders([]);
    toast.success(`Updated ${selectedOrders.length} order(s) to ${status}`);
  };

  // Filter and Sort
  const filteredOrders = orders
    .filter(order => {
      if (!order) return false;
      
      const matchesSearch = 
        (order.orderId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (order.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (order.customerEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        formatAddress(order.shippingAddress)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
      const matchesPayment = selectedPayment === 'all' || order.paymentMethod === selectedPayment;
      
      const matchesAmount = 
        (!minAmount || (order.totalAmount || 0) >= parseFloat(minAmount)) &&
        (!maxAmount || (order.totalAmount || 0) <= parseFloat(maxAmount));
      
      return matchesSearch && matchesStatus && matchesPayment && matchesAmount;
    })
    .sort((a, b) => {
      let aVal = a[sortBy] || '';
      let bVal = b[sortBy] || '';
      
      if (sortBy === 'orderDate' || sortBy === 'estimatedDelivery') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  // Pagination
  const totalpages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // Statistics
  const calculateStats = () => {
    const validOrders = orders.filter(o => o);
    const totalOrders = validOrders.length;
    const totalRevenue = validOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const statusCounts = {};
    Object.keys(statusConfig).forEach(status => {
      statusCounts[status] = validOrders.filter(o => o.status === status).length;
    });
    
    const today = new Date();
    const last7Days = new Date(today.setDate(today.getDate() - 7));
    const recentOrders = validOrders.filter(o => new Date(o.orderDate || Date.now()) >= last7Days).length;
    
    // Calculate total items sold
    const totalItemsSold = validOrders.reduce((total, order) => 
      total + (order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0), 0
    );
    
    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      statusCounts,
      recentOrders,
      totalItemsSold
    };
  };

  const stats = calculateStats();

  // Debug function
  const debugOrders = () => {
    console.log('=== DEBUG ORDERS ===');
    console.log('All orders:', orders);
    console.log('Filtered orders:', filteredOrders);
    console.log('From localStorage:', JSON.parse(localStorage.getItem('user_orders') || '{}'));
    
    const allLocalStorageOrders = JSON.parse(localStorage.getItem('user_orders') || '{}');
    Object.keys(allLocalStorageOrders).forEach(userId => {
      console.log(`User ${userId} orders:`, allLocalStorageOrders[userId]);
    });
    
    toast.info('Check console for debug information');
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return 'Address not specified';
    
    if (typeof address === 'string') return address;
    
    // If address has fullAddress field, use it
    if (address.fullAddress && address.fullAddress.trim() !== '') {
      return address.fullAddress;
    }
    
    // Build address from individual components
    const parts = [];
    if (address.street && address.street.trim() !== '') parts.push(address.street);
    if (address.city && address.city.trim() !== '') parts.push(address.city);
    if (address.state && address.state.trim() !== '') parts.push(address.state);
    if (address.zipCode && address.zipCode.trim() !== '') parts.push(`- ${address.zipCode}`);
    if (address.country && address.country.trim() !== '') parts.push(address.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Address not specified';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#00A9FF] border-t-transparent"></div>
        <p className="text-slate-600">Loading orders and products...</p>
        <p className="text-sm text-slate-500">{debugInfo}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Orders Management</h2>
            <p className="text-slate-600 mt-1">
              Total Orders: {orders.length} | Showing: {filteredOrders.length}
              {selectedOrders.length > 0 && ` | Selected: ${selectedOrders.length}`}
            </p>
            {debugInfo && (
              <p className="text-sm text-blue-600 mt-1">{debugInfo}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={debugOrders}
              className="inline-flex items-center px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50"
            >
              <AlertCircle size={18} className="mr-2" />
              Debug Orders
            </button>
            
            <button 
              onClick={fetchAllData}
              className="inline-flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              <RefreshCw size={18} className="mr-2" />
              Refresh All
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
          <div className="bg-linear-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                <ShoppingBag size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-800">Total Orders</p>
                <p className="text-xl font-bold text-blue-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-linear-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                <IndianRupee size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-800">Total Revenue</p>
                <p className="text-xl font-bold text-green-900">₹{stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-linear-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                <TrendingUp size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-800">Avg Order Value</p>
                <p className="text-xl font-bold text-purple-900">₹{stats.avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-linear-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3">
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-yellow-800">Pending Orders</p>
                <p className="text-xl font-bold text-yellow-900">{stats.statusCounts.pending || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-linear-to-br from-red-50 to-red-100 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mr-3">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-800">Last 7 Days</p>
                <p className="text-xl font-bold text-red-900">{stats.recentOrders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-linear-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3">
                <Package size={20} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-indigo-800">Items Sold</p>
                <p className="text-xl font-bold text-indigo-900">{stats.totalItemsSold}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search orders by ID, customer name, email, address, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent transition-all"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              <Filter size={18} className="mr-2" />
              More Filters
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                <select
                  value={selectedPayment}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="all">All Methods</option>
                  <option value="credit-card">Credit Card</option>
                  <option value="debit-card">Debit Card</option>
                  <option value="cash-on-delivery">Cash on Delivery</option>
                  <option value="upi">UPI</option>
                  <option value="net-banking">Net Banking</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Min Amount (₹)</label>
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Min amount"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Max Amount (₹)</label>
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Max amount"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setShowFilters(false);
                    setSearchTerm('');
                    setSelectedStatus('all');
                    setSelectedPayment('all');
                    setMinAmount('');
                    setMaxAmount('');
                  }}
                  className="w-full px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedOrders.length > 0 && (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
                {selectedOrders.length}
              </div>
              <p className="text-blue-800 font-medium">
                {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => bulkUpdateStatus('processing')}
                className="inline-flex items-center px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
              >
                <RefreshCw size={14} className="mr-2" />
                Mark as Processing
              </button>
              
              <button
                onClick={() => bulkUpdateStatus('shipped')}
                className="inline-flex items-center px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600"
              >
                <Truck size={14} className="mr-2" />
                Mark as Shipped
              </button>
              
              <button
                onClick={() => bulkUpdateStatus('completed')}
                className="inline-flex items-center px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
              >
                <CheckCircle size={14} className="mr-2" />
                Mark as Completed
              </button>
              
              <button
                onClick={() => setSelectedOrders([])}
                className="inline-flex items-center px-3 py-2 border border-blue-300 text-blue-700 text-sm rounded-lg hover:bg-blue-50"
              >
                <XCircle size={14} className="mr-2" />
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center">
            <div className="text-yellow-500 mr-3">⚠️</div>
            <div>
              <p className="text-yellow-800 font-medium">{error}</p>
              <p className="text-yellow-700 text-sm mt-1">
                Using localStorage data. Make sure json-server is running on http://localhost:3001 for full functionality.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-linear-to-r from-[#00A9FF] to-[#89CFF3]">
                <th className="text-left py-4 px-6 text-sm font-semibold text-white w-12">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={selectAllOrders}
                    className="w-4 h-4 text-white rounded focus:ring-white"
                  />
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-white">Order ID</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-white">Customer</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-white">Shipping Address</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-white">Items</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-white">Date</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-white">Total Amount</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-white">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => {
                if (!order) return null;
                
                return (
                  <tr 
                    key={order.id} 
                    className={`border-b border-slate-100 transition-all duration-200 group ${
                      selectedOrders.includes(order.id) ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleOrderSelection(order.id)}
                        className="w-4 h-4 text-[#00A9FF] rounded focus:ring-[#00A9FF]"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-slate-800 group-hover:text-[#00A9FF] transition-colors">
                          {order.orderId}
                        </p>
                        <div className="flex items-center mt-1">
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-slate-800">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center">
                          <Mail size={10} className="mr-1" />
                          {order.customerEmail}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center">
                          <Phone size={10} className="mr-1" />
                          {order.customerPhone}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <div className="flex items-start">
                          <MapPin size={12} className="text-slate-400 mr-2 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-700 line-clamp-2">
                              {formatAddress(order.shippingAddress)}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {order.shippingAddress?.city}, {order.shippingAddress?.state}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <div className="flex items-center mb-1">
                          <Package size={12} className="text-slate-400 mr-2" />
                          <span className="text-xs font-medium text-slate-700">
                            {order.items?.length || 0} product{order.items?.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {order.items?.slice(0, 2).map((item, index) => (
                            <div key={index} className="flex items-center">
                              <Box size={10} className="text-slate-400 mr-2" />
                              <span className="text-xs text-slate-600 truncate max-w-[120px]">
                                {item.name} × {item.quantity}
                              </span>
                            </div>
                          ))}
                          {order.items?.length > 2 && (
                            <p className="text-xs text-slate-500">
                              <Layers size={10} className="inline mr-1" />
                              +{order.items.length - 2} more
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <p className="text-sm text-slate-800">
                          {format(new Date(order.orderDate || Date.now()), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(order.orderDate || Date.now()), 'HH:mm')}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-800">
                          ₹{order.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {order.paymentMethod === 'cash-on-delivery' ? 'COD' : 'Prepaid'}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        {getStatusBadge(order.status)}
                        <p className="text-xs text-slate-500 mt-1">
                          Est: {format(new Date(order.estimatedDelivery || Date.now() + 7*24*60*60*1000), 'MMM dd')}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleViewDetails(order)}
                          className="inline-flex items-center p-2 text-[#00A9FF] hover:bg-[#00A9FF]/10 rounded-lg transition-all duration-300 hover:scale-110"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        
                        <button 
                          onClick={() => handleEditOrder(order)}
                          className="inline-flex items-center p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-300 hover:scale-110"
                          title="Edit Order"
                        >
                          <Edit2 size={16} />
                        </button>
                        
                        <button 
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDeleteModal(true);
                          }}
                          className="inline-flex items-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110"
                          title="Delete Order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalpages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-sm text-slate-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalpages) }, (_, i) => {
                  let pageNum;
                  if (totalpages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalpages - 2) {
                    pageNum = totalpages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-[#00A9FF] text-white'
                          : 'border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalpages, prev + 1))}
                  disabled={currentPage === totalpages}
                  className="px-3 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">No orders found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm || selectedStatus !== 'all'
                ? 'Try adjusting your filters' 
                : 'No orders have been placed yet.'}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={fetchAllData}
                className="inline-flex items-center px-4 py-2 bg-[#00A9FF] text-white rounded-lg hover:bg-[#0088CC]"
              >
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </button>
              <button
                onClick={debugOrders}
                className="inline-flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                <AlertCircle size={16} className="mr-2" />
                Debug
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Order Details - {selectedOrder.orderId}</h3>
                <p className="text-slate-600 text-sm mt-1">
                  Placed on {format(new Date(selectedOrder.orderDate), 'MMMM dd, yyyy hh:mm a')}
                </p>
              </div>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XCircle size={24} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer & Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Details */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <User size={18} className="text-blue-600 mr-2" />
                    <h4 className="font-medium text-blue-800">Customer Details</h4>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{selectedOrder.customerName}</p>
                      <p className="text-xs text-slate-600">{selectedOrder.customerEmail}</p>
                      <p className="text-xs text-slate-600">{selectedOrder.customerPhone}</p>
                    </div>
                    {selectedOrder.userId && (
                      <p className="text-xs text-slate-500">User ID: {selectedOrder.userId}</p>
                    )}
                  </div>
                </div>
                
                {/* Shipping Address */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <MapPin size={18} className="text-green-600 mr-2" />
                    <h4 className="font-medium text-green-800">Shipping Address</h4>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-800">{selectedOrder.shippingAddress?.street}</p>
                    <p className="text-sm text-slate-800">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                    <p className="text-sm text-slate-800">{selectedOrder.shippingAddress?.zipCode}, {selectedOrder.shippingAddress?.country}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {formatAddress(selectedOrder.shippingAddress)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping & Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Info */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Truck size={18} className="text-purple-600 mr-2" />
                    <h4 className="font-medium text-purple-800">Shipping Information</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Method:</span>
                      <span className="text-sm font-medium text-slate-800">{selectedOrder.shippingMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Carrier:</span>
                      <span className="text-sm font-medium text-slate-800">{selectedOrder.shippingCarrier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Tracking:</span>
                      <span className="text-sm font-medium text-slate-800">{selectedOrder.trackingNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Est. Delivery:</span>
                      <span className="text-sm font-medium text-slate-800">
                        {format(new Date(selectedOrder.estimatedDelivery), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {selectedOrder.deliveredDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Delivered:</span>
                        <span className="text-sm font-medium text-slate-800">
                          {format(new Date(selectedOrder.deliveredDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Payment Info */}
                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <CreditCard size={18} className="text-amber-600 mr-2" />
                    <h4 className="font-medium text-amber-800">Payment Information</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Method:</span>
                      <span className="text-sm font-medium text-slate-800">
                        {selectedOrder.paymentMethod?.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Status:</span>
                      <span>{getPaymentStatusBadge(selectedOrder.paymentStatus)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Transaction ID:</span>
                      <span className="text-sm font-medium text-slate-800 truncate ml-2">
                        {selectedOrder.transactionId || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border border-slate-200 rounded-lg">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <h4 className="font-medium text-slate-800">Order Items ({selectedOrder.items?.length || 0})</h4>
                </div>
                <div className="divide-y divide-slate-200">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-8 h-8 object-contain rounded" />
                          ) : (
                            <Package size={16} className="text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-slate-600">Quantity: {item.quantity}</span>
                            <span className="text-xs text-slate-600">Price: ₹{item.price?.toLocaleString() || '0'}</span>
                            {item.category && (
                              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                                {item.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border border-slate-200 rounded-lg">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <h4 className="font-medium text-slate-800">Order Summary</h4>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="text-slate-800">₹{selectedOrder.subtotal?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Shipping</span>
                    <span className="text-slate-800">₹{selectedOrder.shippingCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax</span>
                    <span className="text-slate-800">₹{selectedOrder.tax?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount</span>
                      <span className="text-green-600">-₹{selectedOrder.discount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-800">Total Amount</span>
                      <span className="text-lg text-[#00A9FF]">
                        ₹{selectedOrder.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              {selectedOrder.notes && (
                <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertCircle size={16} className="text-amber-600 mr-2" />
                    <h4 className="font-medium text-amber-800">Order Notes</h4>
                  </div>
                  <p className="text-sm text-amber-700">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Order Actions */}
              <div className="flex flex-wrap justify-end gap-3 pt-6 border-t border-slate-200">
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'processing');
                    setShowOrderDetails(false);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  Mark as Processing
                </button>
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'shipped');
                    setShowOrderDetails(false);
                  }}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                >
                  Mark as Shipped
                </button>
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'delivered');
                    setShowOrderDetails(false);
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                >
                  Mark as Delivered
                </button>
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'completed');
                    setShowOrderDetails(false);
                  }}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-sm"
                >
                  Mark as Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && editingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Edit Order - {editingOrder.orderId}</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingOrder(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <XCircle size={24} className="text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Order Status</label>
                <select
                  value={editingOrder.status}
                  onChange={(e) => setEditingOrder({...editingOrder, status: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment Status</label>
                <select
                  value={editingOrder.paymentStatus}
                  onChange={(e) => setEditingOrder({...editingOrder, paymentStatus: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {Object.entries(paymentStatusConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tracking Number</label>
                <input
                  type="text"
                  value={editingOrder.trackingNumber}
                  onChange={(e) => setEditingOrder({...editingOrder, trackingNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  value={editingOrder.notes || ''}
                  onChange={(e) => setEditingOrder({...editingOrder, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  rows="3"
                  placeholder="Add any notes about this order..."
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingOrder(null);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedOrder}
                  className="px-4 py-2 bg-[#00A9FF] text-white rounded-lg hover:bg-[#0088CC]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Delete Order</h3>
                <p className="text-slate-600 text-sm">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-slate-800">
                Are you sure you want to delete order <span className="font-medium">{selectedOrder.orderId}</span>?
              </p>
              <p className="text-xs text-slate-600 mt-2">
                Customer: {selectedOrder.customerName} • Amount: ₹{selectedOrder.totalAmount?.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-slate-600">
                Items: {selectedOrder.items?.length} product{selectedOrder.items?.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;
