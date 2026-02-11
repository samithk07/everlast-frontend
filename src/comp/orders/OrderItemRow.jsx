import React from 'react';
import { Package, Wrench, IndianRupee, ChevronRight } from 'lucide-react';

const OrderItemRow = ({ item }) => {
  const isService = item.type === 'service' ||
    item.productName?.toLowerCase().includes('installation') ||
    item.productName?.toLowerCase().includes('service');

  const itemTotal = (item.price || 0) * (item.quantity || 1);

  return (
    <div className="group flex items-start p-4 border border-[#A0E9FF]/40 rounded-xl bg-white/60 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out cursor-default">
      {/* Item Icon */}
      <div className={`
        shrink-0 w-16 h-16 rounded-xl flex items-center justify-center mr-4
        ${isService
          ? 'bg-linear-to-br from-violet-100 to-violet-200'
          : 'bg-linear-to-br from-[#CDF5FD] to-[#A0E9FF]'
        } shadow-md group-hover:shadow-lg transition-shadow
      `}>
        {isService ? (
          <Wrench size={24} className="text-violet-600" />
        ) : (
          <Package size={24} className="text-[#00A9FF]" />
        )}
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="flex-1">
            <h4 className="font-semibold text-slate-800 group-hover:text-[#00A9FF] transition-colors">
              {item.productName}
            </h4>
            <div className="flex items-center flex-wrap gap-2 mt-2">
              {isService ? (
                <span className="px-2 py-1 bg-violet-100 text-violet-800 text-xs font-medium rounded-lg">
                  Installation Service
                </span>
              ) : (
                <span className="px-2 py-1 bg-[#CDF5FD] text-[#0077B6] text-xs font-medium rounded-lg">
                  Water Purifier Product
                </span>
              )}
              <span className="text-xs text-slate-500">SKU: {item.productId || 'N/A'}</span>
              <span className="text-xs text-slate-500">
                Qty: {item.quantity || 1}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end text-slate-800 font-bold text-lg">
              <IndianRupee size={18} className="mr-1" />
              {itemTotal.toLocaleString()}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {item.quantity || 1} × <IndianRupee size={12} className="inline mr-1" />
              {item.price?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Image if available */}
        {item.productImage && !isService && (
          <div className="mt-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-white shadow-md group-hover:shadow-lg transition-shadow">
              <img
                src={item.productImage}
                alt={item.productName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderItemRow;