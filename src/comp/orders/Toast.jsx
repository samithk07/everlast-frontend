import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { X, CheckCircle, AlertCircle, Info, Truck, Package } from 'lucide-react';

const CustomToast = ({ type, message, orderId, status }) => {
  const icons = {
    success: <CheckCircle className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    info: <Info className="text-[#00A9FF]" size={20} />,
    warning: <AlertCircle className="text-amber-500" size={20} />,
    shipping: <Truck className="text-indigo-500" size={20} />,
    processing: <Package className="text-[#89CFF3]" size={20} />
  };

  const getStatusIcon = () => {
    if (status?.includes('shipped') || status?.includes('delivery')) return icons.shipping;
    if (status?.includes('processing')) return icons.processing;
    return icons[type] || icons.info;
  };

  return (
    <div className="relative bg-white rounded-xl shadow-2xl border-l-4 border-[#00A9FF] p-4 min-w-80 max-w-md transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="flex items-start">
        <div className="mr-3 mt-0.5">
          {getStatusIcon()}
        </div>
        <div className="flex-1">
          {orderId && (
            <p className="text-xs font-medium text-slate-500 mb-1">
              Order #{orderId}
            </p>
          )}
          <p className="text-slate-800 font-medium">{message}</p>
          {status && (
            <p className="text-xs text-slate-600 mt-1">
              Status updated to <span className="font-medium text-[#00A9FF]">{status}</span>
            </p>
          )}
        </div>
      </div>
      <div className="absolute -bottom-1 left-0 right-0 h-1 bg-linear-to-r from-[#00A9FF] via-[#89CFF3] to-[#A0E9FF] rounded-full"></div>
    </div>
  );
};

const Toast = () => {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={true}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      toastClassName="!p-0 !bg-transparent !shadow-none !border-0 !m-0 !mb-2"
      bodyClassName="!p-0"
      closeButton={({ closeToast }) => (
        <button
          onClick={closeToast}
          className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A9FF]"
          aria-label="Close notification"
        >
          <X size={14} />
        </button>
      )}
    />
  );
};

// Enhanced helper functions with status support
export const showSuccess = (message, orderId, status) => {
  toast.success(<CustomToast type="success" message={message} orderId={orderId} status={status} />);
};

export const showError = (message, orderId, status) => {
  toast.error(<CustomToast type="error" message={message} orderId={orderId} status={status} />);
};

export const showInfo = (message, orderId, status) => {
  toast.info(<CustomToast type="info" message={message} orderId={orderId} status={status} />);
};

export const showWarning = (message, orderId, status) => {
  toast.warning(<CustomToast type="warning" message={message} orderId={orderId} status={status} />);
};

export const showStatusUpdate = (message, orderId, status) => {
  const iconType = status?.includes('shipped') ? 'shipping' : 
                   status?.includes('processing') ? 'processing' : 'info';
  toast(<CustomToast type={iconType} message={message} orderId={orderId} status={status} />);
};

export default Toast;