import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RefreshCw, 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Truck, 
  CreditCard, 
  Wrench,
  Clock,
  IndianRupee,
  Download,
  Printer,
  Share2
} from 'lucide-react';
import { format } from 'date-fns';
import { useOrders } from '../../hooks/useOrders';
import OrderStatusBadge from './OrderStatusBadge';
import OrderTimeline from './OrderTimeline';
import OrderItemRow from './OrderItemRow';
import LoadingSkeleton from './LoadingSkeleton';
import Toast from './Toast';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    currentOrder, 
    loading, 
    error, 
    fetchOrderDetails, 
    refreshOrders,
    updateOrderStatus
  } = useOrders();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pollingEnabled, setPollingEnabled] = useState(true);
  const [pollingInterval, setPollingInterval] = useState(10000);

  useEffect(() => {
    if (id) {
      fetchOrderDetails(id);
    }
  }, [id, fetchOrderDetails]);

  useEffect(() => {
    let interval;
    if (pollingEnabled && id) {
      interval = setInterval(() => {
        fetchOrderDetails(id);
      }, pollingInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pollingEnabled, pollingInterval, id, fetchOrderDetails]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshOrders();
    if (id) {
      await fetchOrderDetails(id);
    }
    setIsRefreshing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share && currentOrder) {
      navigator.share({
        title: `Order #${currentOrder.orderId || currentOrder.id}`,
        text: `Check my water purifier order details`,
        url: window.location.href,
      });
    }
  };

  const calculateItemTotal = (item) => {
    return (item.price || 0) * (item.quantity || 1);
  };

  const calculateOrderTotal = () => {
    if (!currentOrder?.items) return 0;
    return currentOrder.items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  if (loading && !currentOrder) {
    return <LoadingSkeleton />;
  }

  if (error || !currentOrder) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-white p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Orders
          </button>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">Order Not Found</h3>
            <p className="text-red-600 mb-4">
              {error || 'The order you are looking for does not exist.'}
            </p>
            <button
              onClick={() => navigate('/orders')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View All Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isInstallationOrder = currentOrder.items?.some(item => 
    item.productName?.toLowerCase().includes('installation') || 
    item.type === 'service'
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white p-4 md:p-6 print:bg-white print:p-0">
      <Toast />
      
      <div className="max-w-4xl mx-auto print:max-w-none">
        {/* Header */}
        <div className="mb-6 print:hidden">
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Orders
          </button>
        </div>

        {/* Order Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 print:shadow-none print:border-none">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{currentOrder.orderId || currentOrder.id}
              </h1>
              <p className="text-gray-600 mt-1">
                Placed on {format(new Date(currentOrder.orderDate || currentOrder.createdAt), 'MMMM dd, yyyy hh:mm a')}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <OrderStatusBadge status={currentOrder.status} size="lg" />
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw size={18} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Printer size={18} className="mr-2" />
              Print
            </button>
            
            <button
              onClick={handleShare}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Share2 size={18} className="mr-2" />
              Share
            </button>
            
            <div className="flex items-center ml-auto space-x-4">
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={pollingEnabled}
                  onChange={(e) => setPollingEnabled(e.target.checked)}
                  className="mr-2"
                />
                Auto-refresh
              </label>
              
              <select
                value={pollingInterval}
                onChange={(e) => setPollingInterval(parseInt(e.target.value))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="5000">5 seconds</option>
                <option value="10000">10 seconds</option>
                <option value="30000">30 seconds</option>
                <option value="60000">1 minute</option>
              </select>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Package size={20} className="text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
                <span className="ml-2 text-sm text-gray-600">
                  ({currentOrder.items?.length || 0} items)
                </span>
              </div>
              
              <div className="space-y-4">
                {currentOrder.items?.map((item, index) => (
                  <OrderItemRow key={index} item={item} />
                ))}
              </div>
              
              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">
                      ₹{calculateOrderTotal().toLocaleString()}
                    </span>
                  </div>
                  
                  {currentOrder.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-900">
                        ₹{currentOrder.tax.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {currentOrder.shippingCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">
                        ₹{currentOrder.shippingCost.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                    <span className="text-gray-900">Total Amount</span>
                    <span className="text-blue-600 flex items-center">
                      <IndianRupee size={18} className="mr-1" />
                      {(currentOrder.totalAmount || calculateOrderTotal()).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Clock size={20} className="text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Order Timeline</h2>
              </div>
              <OrderTimeline 
                timeline={currentOrder.statusTimeline} 
                currentStatus={currentOrder.status}
              />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium text-gray-900">
                    {currentOrder.deliveryAddress?.fullName || currentOrder.userName}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <div className="flex items-center text-gray-900">
                    <Phone size={14} className="mr-2" />
                    {currentOrder.deliveryAddress?.phoneNumber || 'Not provided'}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <div className="flex items-center text-gray-900">
                    <Mail size={14} className="mr-2" />
                    {currentOrder.deliveryAddress?.email || currentOrder.userEmail}
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <MapPin size={20} className="text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
              </div>
              
              {currentOrder.deliveryAddress ? (
                <div className="space-y-2">
                  <p className="text-gray-900">
                    {currentOrder.deliveryAddress.addressLine1}
                  </p>
                  {currentOrder.deliveryAddress.addressLine2 && (
                    <p className="text-gray-900">
                      {currentOrder.deliveryAddress.addressLine2}
                    </p>
                  )}
                  <p className="text-gray-900">
                    {currentOrder.deliveryAddress.city}, {currentOrder.deliveryAddress.state}
                  </p>
                  <p className="text-gray-900">
                    {currentOrder.deliveryAddress.pincode}
                  </p>
                  <p className="text-gray-900">
                    {currentOrder.deliveryAddress.country}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No shipping address provided</p>
              )}
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <CreditCard size={20} className="text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium text-gray-900">
                    {currentOrder.paymentMethod?.replace('-', ' ') || 'Not specified'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    currentOrder.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800'
                      : currentOrder.paymentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {currentOrder.paymentStatus || 'Unknown'}
                  </span>
                </div>
                
                {currentOrder.transactionId && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                    <p className="text-sm text-gray-900 font-mono break-all">
                      {currentOrder.transactionId}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tracking Information */}
            {(currentOrder.status === 'shipped' || currentOrder.status === 'out_for_delivery') && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Truck size={20} className="text-orange-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Tracking Details</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Carrier:</span>
                    <span className="font-medium text-gray-900">
                      {currentOrder.shippingCarrier || 'Standard Shipping'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking #:</span>
                    <span className="font-medium text-gray-900">
                      {currentOrder.trackingNumber || 'Not available'}
                    </span>
                  </div>
                  
                  {currentOrder.trackingNumber && (
                    <a
                      href={`https://track24.net/?tracking=${currentOrder.trackingNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-2"
                    >
                      Track Package
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Installation Slot */}
            {isInstallationOrder && currentOrder.installationSlot && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Wrench size={20} className="text-indigo-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Installation Schedule</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-900">
                      {format(new Date(currentOrder.installationSlot.date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Slot:</span>
                    <span className="font-medium text-gray-900">
                      {currentOrder.installationSlot.timeSlot}
                    </span>
                  </div>
                  
                  {currentOrder.installationSlot.technicianName && (
                    <div>
                      <p className="text-sm text-gray-600">Technician</p>
                      <p className="text-sm text-gray-900">
                        {currentOrder.installationSlot.technicianName}
                      </p>
                      {currentOrder.installationSlot.technicianPhone && (
                        <p className="text-sm text-gray-900 flex items-center">
                          <Phone size={12} className="mr-1" />
                          {currentOrder.installationSlot.technicianPhone}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-semibold text-blue-800 mb-2">Need Help?</h4>
              <p className="text-blue-700 text-sm mb-3">
                Questions about your order? Our support team is here to help.
              </p>
              <div className="space-y-2">
                <a
                  href="tel:+918000000000"
                  className="block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Call Support
                </a>
                <a
                  href="mailto:support@waterpurifier.com"
                  className="block text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                >
                  Email Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;