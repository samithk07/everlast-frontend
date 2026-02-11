import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Home,
  RefreshCw
} from 'lucide-react';

const OrderStatusBadge = ({ status, size = 'md' }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 1000);
    return () => clearTimeout(timer);
  }, [status]);

  const statusConfig = {
    pending: {
      label: 'Pending',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: <Clock size={size === 'lg' ? 18 : 14} />,
      gradient: 'from-amber-100 to-amber-50'
    },
    confirmed: {
      label: 'Confirmed',
      color: 'bg-[#CDF5FD] text-[#0077B6] border-[#A0E9FF]',
      icon: <CheckCircle size={size === 'lg' ? 18 : 14} />,
      gradient: 'from-[#CDF5FD] to-[#A0E9FF]'
    },
    processing: {
      label: 'Processing',
      color: 'bg-gradient-to-r from-[#CDF5FD] to-[#A0E9FF] text-[#0077B6] border-[#89CFF3]',
      icon: <RefreshCw size={size === 'lg' ? 18 : 14} className={animate ? 'animate-spin' : ''} />,
      gradient: 'from-[#CDF5FD] to-[#A0E9FF]'
    },
    shipped: {
      label: 'Shipped',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: <Truck size={size === 'lg' ? 18 : 14} />,
      gradient: 'from-indigo-100 to-violet-100'
    },
    out_for_delivery: {
      label: 'Out for Delivery',
      color: 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200',
      icon: <Truck size={size === 'lg' ? 18 : 14} className={animate ? 'animate-bounce' : ''} />,
      gradient: 'from-orange-100 to-amber-100'
    },
    delivered: {
      label: 'Delivered',
      color: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200',
      icon: <CheckCircle size={size === 'lg' ? 18 : 14} className={animate ? 'scale-110' : ''} />,
      gradient: 'from-green-100 to-emerald-100'
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: <XCircle size={size === 'lg' ? 18 : 14} />,
      gradient: 'from-red-100 to-rose-100'
    },
    installed: {
      label: 'Installed',
      color: 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200',
      icon: <Home size={size === 'lg' ? 18 : 14} />,
      gradient: 'from-emerald-100 to-teal-100'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`
      inline-flex items-center px-4 py-2 rounded-full font-medium border shadow-sm
      ${config.color}
      ${size === 'lg' ? 'px-5 py-2.5 text-base' : 'text-sm'}
      ${animate ? 'animate-pulse-once ring-2 ring-offset-2 ring-offset-white' : ''}
      transition-all duration-300 ease-out
    `}>
      <span className={`mr-2 ${animate ? 'scale-110' : ''} transition-transform`}>
        {config.icon}
      </span>
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;