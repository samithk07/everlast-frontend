// pages/OrdersPage.jsx
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
  RefreshCw,
  Printer,
  TrendingUp,
  Package,
  User,
  Calendar,
  AlertCircle,
  Truck,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Box,
  Layers,
  ExternalLink,
  Shield,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = 'http://localhost:3001';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching orders from:', `${API_BASE}/orders`);
      
      const response = await fetch(`${API_BASE}/orders`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const ordersData = await response.json();
      console.log('Raw orders data:', ordersData);
      
      if (!Array.isArray(ordersData)) {
        throw new Error('Orders data is not an array');
      }
      
      // Transform orders data
      const transformedOrders = transformOrdersData(ordersData);
      console.log('Transformed orders:', transformedOrders);
      
      setOrders(transformedOrders);
      toast.success(`Loaded ${transformedOrders.length} orders`);
      
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(`Failed to load orders: ${err.message}`);
      toast.error('Failed to load orders');
      
      // Try alternative endpoints if main one fails
      tryAlternativeEndpoints();
    } finally {
      setLoading(false);
    }
  };

  const tryAlternativeEndpoints = async () => {
    const alternativeEndpoints = [
      `${API_BASE}/api/orders`,
      `${API_BASE}/api/v1/orders`,
      `${API_BASE}/order`,
      `${API_BASE}/api/order`
    ];
    
    for (const endpoint of alternativeEndpoints) {
      try {
        console.log('Trying alternative endpoint:', endpoint);
        const response = await fetch(endpoint);
        if (response.ok) {
          const ordersData = await response.json();
          if (Array.isArray(ordersData)) {
            const transformedOrders = transformOrdersData(ordersData);
            setOrders(transformedOrders);
            toast.success(`Loaded ${transformedOrders.length} orders from alternative endpoint`);
            setError('');
            return;
          }
        }
      } catch (error) {
        console.log(`Endpoint ${endpoint} failed:`, error.message);
      }
    }
    
    // If all endpoints fail, load demo data
    if (orders.length === 0) {
      loadDemoOrders();
    }
  };

  const transformOrdersData = (ordersData) => {
    if (!Array.isArray(ordersData)) {
      console.error('Orders data is not an array:', ordersData);
      return [];
    }
    
    return ordersData.map((order, index) => {
      // Debug: Log raw order structure
      console.log(`Order ${index} raw data:`, order);
      
      // Extract order ID - handle different field names
      const orderId = order.id || order._id || order.orderId || `ORD-${String(index + 1).padStart(5, '0')}`;
      
      // Extract customer information
      const customerName = order.customerName || order.userName || 
                          (order.customer && (order.customer.name || order.customer.fullName)) || 
                          (order.user && order.user.name) || 
                          (order.shippingAddress && order.shippingAddress.fullName) ||
                          `Customer ${orderId}`;
      
      const customerEmail = order.customerEmail || order.userEmail || 
                           (order.customer && order.customer.email) || 
                           (order.user && order.user.email) ||
                           (order.shippingAddress && order.shippingAddress.email) ||
                           `customer${orderId.replace(/\D/g, '')}@example.com`;
      
      // Extract items
      let items = [];
      if (Array.isArray(order.items)) {
        items = order.items;
      } else if (Array.isArray(order.products)) {
        items = order.products;
      } else if (order.items && typeof order.items === 'object') {
        // Convert object to array
        items = Object.values(order.items);
      }
      
      // Ensure each item has required fields
      items = items.map((item, itemIndex) => ({
        id: item.id || item.productId || `item-${orderId}-${itemIndex}`,
        name: item.name || item.productName || 'Unknown Product',
        price: item.price || item.unitPrice || 0,
        quantity: item.quantity || item.qty || 1,
        image: item.image || item.productImage,
        category: item.category,
        description: item.description
      }));
      
      // Extract shipping address
      let shippingAddress = {};
      if (order.shippingAddress) {
        if (typeof order.shippingAddress === 'string') {
          shippingAddress.fullAddress = order.shippingAddress;
        } else {
          shippingAddress = {
            street: order.shippingAddress.address || order.shippingAddress.street || order.shippingAddress.addressLine1 || '',
            city: order.shippingAddress.city || '',
            state: order.shippingAddress.state || '',
            zipCode: order.shippingAddress.zipCode || order.shippingAddress.pincode || order.shippingAddress.postalCode || '',
            country: order.shippingAddress.country || 'India',
            fullAddress: formatAddressFromObject(order.shippingAddress)
          };
        }
      }
      
      // Calculate financials
      const subtotal = order.subtotal || order.total || 
                      items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
      
      const tax = order.tax || order.taxAmount || 0;
      const shippingCost = order.shippingCost || order.shipping || order.shippingFee || 0;
      const discount = order.discount || order.discountAmount || 0;
      const totalAmount = order.totalAmount || order.total || 
                         (subtotal + tax + shippingCost - discount);
      
      // Extract dates
      const orderDate = order.orderDate || order.createdAt || order.date || 
                       order.timestamp || new Date().toISOString();
      
      const estimatedDelivery = order.estimatedDelivery || 
                               order.estimatedDeliveryDate ||
                               new Date(new Date(orderDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      // Extract status
      const status = (order.status || 'pending').toLowerCase();
      const paymentStatus = (order.paymentStatus || order.paymentState || 'pending').toLowerCase();
      const paymentMethod = (order.paymentMethod || order.paymentType || 'credit-card').toLowerCase();
      
      return {
        id: order.id || order._id || orderId,
        orderId: orderId,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: order.customerPhone || order.phone || 
                      (order.shippingAddress && order.shippingAddress.phone) ||
                      'Not provided',
        userId: order.userId || order.customerId,
        shippingAddress: shippingAddress,
        items: items,
        subtotal: subtotal,
        tax: tax,
        shippingCost: shippingCost,
        discount: discount,
        totalAmount: totalAmount,
        status: status,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        orderDate: orderDate,
        estimatedDelivery: estimatedDelivery,
        deliveredDate: order.deliveredDate || order.completedDate,
        notes: order.notes || order.note || '',
        trackingNumber: order.trackingNumber || order.trackingId || `TRK-${Date.now()}-${orderId}`,
        shippingMethod: order.shippingMethod || 'standard',
        shippingCarrier: order.shippingCarrier || 'Standard Shipping',
        transactionId: order.transactionId || order.paymentId,
        paymentDetails: order.paymentDetails || {}
      };
    }).filter(order => order != null); // Remove any null orders
  };

  const formatAddressFromObject = (address) => {
    if (!address) return 'Address not specified';
    
    if (typeof address === 'string') return address;
    
    const parts = [];
    
    if (address.fullName) parts.push(address.fullName);
    if (address.address || address.street || address.addressLine1) {
      parts.push(address.address || address.street || address.addressLine1);
    }
    if (address.addressLine2) parts.push(address.addressLine2);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zipCode || address.pincode || address.postalCode) {
      parts.push(address.zipCode || address.pincode || address.postalCode);
    }
    if (address.country && address.country !== 'India') {
      parts.push(address.country);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'Address not specified';
  };

  const loadDemoOrders = () => {
    const demoOrders = [
      {
        id: 1,
        orderId: 'ORD-00001',
        customerName: 'Samith',
        customerEmail: 'samith677@gmail.com',
        customerPhone: '8078332452',
        shippingAddress: {
          street: 'Koppal, muttamgate, shiriya, kumbala',
          city: 'Bandiyod',
          state: 'Kerala',
          zipCode: '671322',
          country: 'India',
          fullAddress: 'Koppal, muttamgate, shiriya, kumbala, Bandiyod, Kerala - 671322, India'
        },
        items: [
          { 
            id: '8edb',
            name: 'Everlast RO purifier', 
            image: 'https://www.lg.com/content/dam/channel/wcms/in/waterpurifiers/category-page-banner/WPR-Steel-Bottle-Banner-720x960-M-v2.jpg',
            price: 13000, 
            quantity: 1
          },
          { 
            id: '2',
            name: 'Installation Kit', 
            price: 1999, 
            quantity: 1
          }
        ],
        subtotal: 14999,
        tax: 1499.9,
        shippingCost: 299,
        discount: 500,
        totalAmount: 16297.9,
        status: 'processing',
        paymentMethod: 'credit-card',
        paymentStatus: 'paid',
        orderDate: '2024-01-15T10:30:00Z',
        estimatedDelivery: '2024-01-22T10:30:00Z',
        notes: 'Customer requested morning delivery',
        trackingNumber: 'TRK-789456123',
        shippingMethod: 'express',
        shippingCarrier: 'Bluedart',
        transactionId: 'TXN-123456789'
      },
      {
        id: 2,
        orderId: 'ORD-00002',
        customerName: 'Priya Sharma',
        customerEmail: 'priya.sharma@example.com',
        customerPhone: '+91 8765432109',
        shippingAddress: {
          street: '456 Park Street, Near Metro Station',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
          fullAddress: '456 Park Street, Near Metro Station, Mumbai, Maharashtra - 400001, India'
        },
        items: [
          { 
            id: '3',
            name: 'UV Shield Purifier', 
            price: 8999, 
            quantity: 1
          }
        ],
        subtotal: 8999,
        tax: 899.9,
        shippingCost: 199,
        discount: 0,
        totalAmount: 10097.9,
        status: 'confirmed',
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        orderDate: '2024-01-14T15:45:00Z',
        estimatedDelivery: '2024-01-21T15:45:00Z',
        notes: 'Customer prefers evening delivery',
        trackingNumber: 'TRK-123456789',
        shippingMethod: 'standard',
        shippingCarrier: 'India Post',
        transactionId: 'TXN-987654321'
      }
    ];
    
    setOrders(demoOrders);
    toast.info('Loaded demo orders data');
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
      if (!order) {
        toast.error('Order not found');
        return false;
      }

      const updatedOrder = {
        ...order,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      if (newStatus === 'delivered' || newStatus === 'completed') {
        updatedOrder.deliveredDate = new Date().toISOString();
      }

      console.log('Updating order:', orderId, 'with data:', { status: newStatus });

      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          ...(updatedOrder.deliveredDate && { deliveredDate: updatedOrder.deliveredDate })
        })
      });

      if (response.ok) {
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
        toast.success(`Order ${order.orderId} status updated to ${newStatus}`);
        return true;
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(`Failed to update order status: ${error.message}`);
      return false;
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder({ ...order });
    setShowEditModal(true);
  };

  const saveEditedOrder = async () => {
    if (!editingOrder) return;
    
    try {
      console.log('Saving edited order:', editingOrder);
      
      const response = await fetch(`${API_BASE}/orders/${editingOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingOrder)
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        setShowEditModal(false);
        setEditingOrder(null);
        toast.success(`Order ${editingOrder.orderId} updated successfully`);
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(`Failed to update order: ${error.message}`);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      console.log('Deleting order:', orderId);
      
      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOrders(orders.filter(order => order.id !== orderId));
        setSelectedOrders(selectedOrders.filter(id => id !== orderId));
        toast.success('Order deleted successfully');
        setShowDeleteModal(false);
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error(`Failed to delete order: ${error.message}`);
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
    if (selectedOrders.length === 0) {
      toast.warning('No orders selected');
      return;
    }
    
    const promises = selectedOrders.map(id => updateOrderStatus(id, status));
    const results = await Promise.all(promises);
    const successCount = results.filter(result => result === true).length;
    
    if (successCount > 0) {
      toast.success(`Updated ${successCount} order(s) to ${status}`);
    }
    
    setSelectedOrders([]);
  };

  // Filter and Sort
  const filteredOrders = orders
    .filter(order => {
      if (!order) return false;
      
      const matchesSearch = 
        (order.orderId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.shippingAddress?.fullAddress?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.items?.some(item => item?.name?.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
      const matchesPayment = selectedPayment === 'all' || order.paymentMethod === selectedPayment;
      
      const matchesAmount = 
        (!minAmount || order.totalAmount >= parseFloat(minAmount)) &&
        (!maxAmount || order.totalAmount <= parseFloat(maxAmount));
      
      return matchesSearch && matchesStatus && matchesPayment && matchesAmount;
    })
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'orderDate' || sortBy === 'estimatedDelivery') {
        aVal = new Date(aVal || 0);
        bVal = new Date(bVal || 0);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // Statistics
  const calculateStats = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const statusCounts = {};
    Object.keys(statusConfig).forEach(status => {
      statusCounts[status] = orders.filter(o => o.status === status).length;
    });
    
    const today = new Date();
    const last7Days = new Date(today.setDate(today.getDate() - 7));
    const recentOrders = orders.filter(o => new Date(o.orderDate) >= last7Days).length;
    
    // Calculate total items sold
    const totalItemsSold = orders.reduce((total, order) => 
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
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zipCode) parts.push(`- ${address.zipCode}`);
    if (address.country) parts.push(address.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Address not specified';
  };

  // Debug button to check API
  const testAPI = async () => {
    try {
      const response = await fetch(`${API_BASE}/orders`);
      const data = await response.json();
      console.log('API Test Response:', data);
      toast.info(`API returned ${Array.isArray(data) ? data.length : 'non-array'} orders`);
    } catch (error) {
      console.error('API Test Error:', error);
      toast.error(`API Test Failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#00A9FF] border-t-transparent"></div>
        <p className="text-slate-600">Loading orders...</p>
        <button 
          onClick={testAPI}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
        >
          Test API Connection
        </button>
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
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchOrders}
              className="inline-flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              <RefreshCw size={18} className="mr-2" />
              Refresh Orders
            </button>
            <button 
              onClick={testAPI}
              className="inline-flex items-center px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50"
              title="Test API Connection"
            >
              Test API
            </button>
          </div>
        </div>

        {/* Stats Dashboard - Keep as is from original */}
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

        {/* Filters - Keep as is from original */}
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center">
            <div className="text-red-500 mr-3">⚠️</div>
            <div>
              <p className="text-red-800 font-medium">{error}</p>
              <p className="text-red-700 text-sm mt-1">
                Make sure json-server is running on http://localhost:3001 with orders data
              </p>
              <button 
                onClick={loadDemoOrders}
                className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
              >
                Load Demo Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the component remains the same - table, modals, etc. */}
      {/* ... (Keep all the table and modal code exactly as in your original) ... */}

    </div>
  );
};

export default OrdersPage;