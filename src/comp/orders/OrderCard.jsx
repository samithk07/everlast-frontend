import React from 'react';
import { 
  Package, 
  Calendar, 
  MapPin, 
  ChevronRight,
  IndianRupee
} from 'lucide-react';
import { format } from 'date-fns';
import OrderStatusBadge from './OrderStatusBadge';

const OrderCard = ({ order, onViewDetails }) => {
  const getItemSummary = () => {
    if (!order.items || order.items.length === 0) return 'No items';
    
    const itemNames = order.items.map(item => item.productName).join(', ');
    return itemNames.length > 60 
      ? `${itemNames.substring(0, 60)}...` 
      : itemNames;
  };

  const getTotalItems = () => {
    return order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-gray-900">Order #{order.orderId || order.id}</h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Calendar size={14} className="mr-1" />
              {format(new Date(order.orderDate || order.createdAt), 'MMM dd, yyyy')}
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        
        {order.deliveryAddress?.city && (
          <div className="flex items-center text-sm text-gray-600 mt-2">
            <MapPin size={14} className="mr-1 shrink-0" />
            <span className="truncate">
              {order.deliveryAddress.city}, {order.deliveryAddress.state}
            </span>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Package size={14} className="mr-2" />
          <span>{getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}</span>
        </div>
        <p className="text-gray-700 text-sm line-clamp-2">
          {getItemSummary()}
        </p>
      </div>

      {/* Footer */}
      <div className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="font-bold text-lg text-gray-900 flex items-center">
              <IndianRupee size={16} className="mr-1" />
              {order.totalAmount?.toLocaleString() || 'N/A'}
            </div>
          </div>
          <button
            onClick={onViewDetails}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Details
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;