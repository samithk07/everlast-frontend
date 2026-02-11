// pages/ProductsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, Plus, Edit2, Trash2, Search, Filter, 
  Image as ImageIcon, X, Upload, Loader2, Save, 
  Link, FolderOpen, Check, XCircle, Star, StarHalf, 
  AlertCircle, Percent, Hash, CheckCircle, XCircle as XCircleIcon, AlertTriangle, Info
} from 'lucide-react';

const API_BASE = 'http://localhost:3001';
const MAX_IMAGE_SIZE = 100 * 1024; // 100KB max for demo
const COMPRESSED_MAX_WIDTH = 400;
const COMPRESSED_QUALITY = 0.7;

// Toast Notification component
const ToastNotification = ({ type, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50 border-green-200',
          textColor: 'text-green-800',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          title: 'Success'
        };
      case 'error':
        return {
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          icon: <XCircleIcon className="w-5 h-5 text-red-600" />,
          title: 'Error'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-800',
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
          title: 'Warning'
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-800',
          icon: <Info className="w-5 h-5 text-blue-600" />,
          title: 'Info'
        };
      default:
        return {
          bgColor: 'bg-[#EEEEEE] border-[#393E46]/30',
          textColor: 'text-[#222831]',
          icon: <Info className="w-5 h-5 text-[#00ADB5]" />,
          title: 'Notification'
        };
    }
  };

  const config = getToastConfig();

  return (
    <div className={`fixed top-6 right-6 z-50 w-96 ${isVisible ? 'animate-slide-in' : 'animate-slide-out'}`}>
      <div className={`${config.bgColor} border rounded-xl shadow-lg p-4`}>
        <div className="flex items-start">
          <div className="shrink-0">
            {config.icon}
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${config.textColor}`}>
              {config.title}
            </p>
            <p className={`mt-1 text-sm ${config.textColor} opacity-90`}>
              {message}
            </p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="ml-4 shrink-0 text-[#393E46]/40 hover:text-[#393E46]/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3">
          <div className={`h-1 ${type === 'success' ? 'bg-green-300' : type === 'error' ? 'bg-red-300' : type === 'warning' ? 'bg-yellow-300' : 'bg-blue-300'} rounded-full animate-progress`} />
        </div>
      </div>
    </div>
  );
};

// StarRating Component
const StarRating = ({ rating, onRatingChange, size = 20, editable = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const renderStar = (index) => {
    const starValue = index + 1;
    const filled = starValue <= (hoverRating || rating);
    const halfFilled = !filled && starValue - 0.5 <= (hoverRating || rating);

    if (halfFilled) {
      return (
        <div className="relative" key={index}>
          <Star
            size={size}
            className="text-[#393E46]/20"
            fill="currentColor"
          />
          <StarHalf
            size={size}
            className="text-[#00ADB5] absolute left-0 top-0"
            fill="currentColor"
          />
        </div>
      );
    }

    return (
      <Star
        key={index}
        size={size}
        className={filled ? "text-[#00ADB5] fill-current" : "text-[#393E46]/20"}
        fill={filled ? "currentColor" : "none"}
      />
    );
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => (
        editable ? (
          <button
            key={index}
            type="button"
            className="hover:scale-110 transition-transform"
            onClick={() => onRatingChange(index + 1)}
            onMouseEnter={() => setHoverRating(index + 1)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`Rate ${index + 1} stars`}
          >
            {renderStar(index)}
          </button>
        ) : (
          <div key={index}>
            {renderStar(index)}
          </div>
        )
      ))}
      {editable && (
        <span className="ml-2 text-sm font-medium text-[#222831]">
          {hoverRating || rating || 0}/5
        </span>
      )}
    </div>
  );
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    category: 'RO', 
    price: '', 
    originalPrice: '', 
    rating: 4.0, 
    stock: '', 
    reviews: 0,
    image: '', 
    description: '',
    brand: '',
    warranty: '1',
    sku: '',
    discount: 0,
    specifications: '',
    features: '',
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageSource, setImageSource] = useState('url');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [imageError, setImageError] = useState(false);
  const [errors, setErrors] = useState({});
  const [toasts, setToasts] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => { 
    fetchProducts(); 
  }, []);

  const generateSKU = () => {
    const prefix = 'PROD';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  };

  const showToast = (type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const compressImage = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > COMPRESSED_MAX_WIDTH) {
          height = (height * COMPRESSED_MAX_WIDTH) / width;
          width = COMPRESSED_MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', COMPRESSED_QUALITY));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
      setError('');
    } catch (err) {
      setError('Failed to load products. Please check if json-server is running.');
      showToast('error', 'Failed to load products. Please check if json-server is running.');
      console.error('Products fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => { 
    resetForm(); 
    setFormData(prev => ({
      ...prev,
      sku: generateSKU()
    }));
    setModalType('add'); 
    setShowModal(true); 
  };

  const handleEditClick = (product) => {
    setFormData({ 
      name: product.name || '', 
      category: product.category || 'RO', 
      price: product.price || '', 
      originalPrice: product.originalPrice || product.price || '', 
      rating: product.rating || 4.0, 
      stock: product.stock || '', 
      reviews: product.reviews || 0,
      image: product.image || '', 
      description: product.description || '',
      brand: product.brand || '',
      warranty: product.warranty || '1',
      sku: product.sku || generateSKU(),
      discount: product.discount || 0,
      specifications: product.specifications || '',
      features: product.features || '',
      status: product.status || 'active'
    });
    if (product.image && isValidImageUrl(product.image)) { 
      setImagePreview(product.image); 
      setImageSource('url'); 
    } else { 
      setImagePreview(null); 
      setImageSource('url'); 
    }
    setUploadedImage(null);
    setEditingProductId(product.id);
    setModalType('edit');
    setShowModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) { 
      setUploadError('Please select a valid image file (JPEG, PNG, GIF, WebP)'); 
      return; 
    }
    if (file.size > MAX_IMAGE_SIZE) { 
      setUploadError(`Image size should be less than ${MAX_IMAGE_SIZE/1024}KB for demo`); 
      return; 
    }
    setUploadError('');
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => { 
      setImagePreview(e.target.result); 
      setImageError(false);
    };
    reader.readAsDataURL(file);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) { 
        clearInterval(interval); 
        setUploadProgress(0); 
      }
    }, 50);
  };

  const handleRemoveImage = () => { 
    setUploadedImage(null); 
    setImagePreview(null); 
    setUploadError(''); 
    if (fileInputRef.current) fileInputRef.current.value = ''; 
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Valid stock quantity is required';
    if (formData.rating < 0 || formData.rating > 5) newErrors.rating = 'Rating must be between 0-5';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.discount < 0 || formData.discount > 100) newErrors.discount = 'Discount must be between 0-100%';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('error', 'Please fix the form errors before submitting.');
      return;
    }

    if (!formData.name.trim() || !formData.price || !formData.stock) { 
      setFormError('Please fill in all required fields'); 
      showToast('error', 'Please fill in all required fields');
      return; 
    }
    
    setIsSubmitting(true);
    setFormError('');
    setUploadError('');
    
    try {
      let imageUrl = formData.image;
      if (imageSource === 'upload' && uploadedImage) {
        try {
          setUploadProgress(50);
          const compressedImage = await compressImage(uploadedImage);
          imageUrl = compressedImage;
          setUploadProgress(100);
        } catch (err) {
          setFormError('Failed to process image. Please try a smaller image.');
          showToast('error', 'Failed to process image. Please try a smaller image.');
          setIsSubmitting(false);
          return;
        }
      } else if (imageSource === 'url' && formData.image.trim() && !isValidImageUrl(formData.image)) {
        setFormError('Please enter a valid image URL');
        showToast('error', 'Please enter a valid image URL');
        setIsSubmitting(false);
        return;
      }
      
      if (imageSource === 'upload' && !uploadedImage) { 
        imageUrl = ''; 
      }

      // Calculate original price if discount is applied
      const originalPriceValue = formData.originalPrice || formData.price;
      const discountValue = formData.discount || 0;
      const finalPrice = discountValue > 0 ? 
        (originalPriceValue * (1 - discountValue/100)) : 
        originalPriceValue;

      const productData = {
        name: formData.name,
        category: formData.category,
        price: Number(finalPrice.toFixed(2)),
        originalPrice: Number(originalPriceValue),
        rating: Number(formData.rating),
        stock: Number(formData.stock),
        reviews: Number(formData.reviews),
        image: imageUrl,
        description: formData.description,
        brand: formData.brand,
        warranty: formData.warranty,
        sku: formData.sku,
        discount: Number(discountValue),
        specifications: formData.specifications,
        features: formData.features,
        status: formData.status,
        createdAt: modalType === 'add' ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString()
      };

      let response;
      if (modalType === 'add') {
        response = await fetch(`${API_BASE}/products`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(productData) 
        });
      } else {
        response = await fetch(`${API_BASE}/products/${editingProductId}`, { 
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(productData) 
        });
      }
      
      if (!response.ok) throw new Error(`Failed to ${modalType} product`);
      const resultProduct = await response.json();
      
      if (modalType === 'add') { 
        setProducts([...products, resultProduct]); 
      } else { 
        setProducts(products.map(p => p.id === editingProductId ? resultProduct : p)); 
      }
      
      resetForm();
      setShowModal(false);
      showToast('success', `Product ${modalType === 'add' ? 'added' : 'updated'} successfully!`);
    } catch (err) {
      setFormError(`Failed to ${modalType} product. Please try again.`);
      showToast('error', `Failed to ${modalType} product. Please try again.`);
      console.error(`${modalType} product error:`, err);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    // Custom confirmation modal
    setShowModal(false); // Close any existing modal
    const productToDelete = products.find(p => p.id === id);
    
    const confirmDelete = () => {
      const confirmModal = document.createElement('div');
      confirmModal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in';
      confirmModal.innerHTML = `
        <div class="bg-white rounded-2xl w-full max-w-md animate-scale-in">
          <div class="p-6 border-b border-[#EEEEEE]">
            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.338 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-[#222831] text-center mb-2">Confirm Delete</h3>
            <p class="text-[#393E46]/60 text-sm text-center">
              Are you sure you want to delete <span class="font-semibold text-[#222831]">"${productToDelete?.name || 'this product'}"</span>?
              This action cannot be undone.
            </p>
          </div>
          <div class="p-6 flex gap-3">
            <button id="cancelDelete" class="flex-1 px-4 py-2.5 border border-[#393E46]/30 text-[#393E46] font-medium rounded-lg hover:bg-[#EEEEEE] transition-all">
              Cancel
            </button>
            <button id="confirmDelete" class="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(confirmModal);
      
      const handleCancel = () => {
        document.body.removeChild(confirmModal);
      };
      
      const handleConfirm = async () => {
        try {
          document.body.removeChild(confirmModal);
          const response = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
          if (!response.ok) throw new Error('Failed to delete product');
          setProducts(products.filter(product => product.id !== id));
          showToast('success', 'Product deleted successfully!');
        } catch (err) {
          showToast('error', 'Failed to delete product. Please try again.');
          console.error('Delete error:', err);
        }
      };
      
      setTimeout(() => {
        document.getElementById('cancelDelete').addEventListener('click', handleCancel);
        document.getElementById('confirmDelete').addEventListener('click', handleConfirm);
      }, 0);
    };
    
    confirmDelete();
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      category: 'RO', 
      price: '', 
      originalPrice: '', 
      rating: 4.0, 
      stock: '', 
      reviews: 0,
      image: '', 
      description: '',
      brand: '',
      warranty: '1',
      sku: generateSKU(),
      discount: 0,
      specifications: '',
      features: '',
      status: 'active'
    });
    setUploadedImage(null);
    setImagePreview(null);
    setImageSource('url');
    setUploadProgress(0);
    setUploadError('');
    setFormError('');
    setImageError(false);
    setErrors({});
    setEditingProductId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const switchImageSource = (source) => { 
    setImageSource(source); 
    setUploadError(''); 
    if (source === 'url' && uploadedImage) handleRemoveImage(); 
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Handle numeric fields
    if (['price', 'originalPrice', 'rating', 'stock', 'reviews', 'discount'].includes(name)) {
      processedValue = value === '' ? '' : Number(value);
    }
    
    // Auto-calculate original price if discount is set
    if (name === 'discount' && formData.price && value) {
      const discount = Number(value);
      const originalPrice = formData.price / (1 - discount/100);
      setFormData(prev => ({
        ...prev,
        [name]: processedValue,
        originalPrice: Math.round(originalPrice * 100) / 100
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (name === 'image' && imageSource === 'url') {
      setImagePreview(value);
      setImageError(false);
    }
  };

  const handleRatingChange = (newRating) => {
    setFormData(prev => ({
      ...prev,
      rating: newRating
    }));
    
    if (errors.rating) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.rating;
        return newErrors;
      });
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  const ProductImage = ({ src, alt, className }) => {
    const [imgError, setImgError] = useState(false);
    const handleError = () => { 
      console.warn(`Failed to load image: ${src}`); 
      setImgError(true); 
    };
    const isBase64 = src && src.startsWith('data:image');
    if (imgError || !src) {
      return (
        <div className={`${className} bg-linear-to-br from-[#EEEEEE] to-[#393E46]/20 flex items-center justify-center`}>
          <ImageIcon className="w-6 h-6 text-[#393E46]/40" />
        </div>
      );
    }
    return (
      <img 
        src={src} 
        alt={alt} 
        className={className} 
        onError={handleError} 
        loading="lazy" 
        crossOrigin={!isBase64 ? "anonymous" : undefined} 
      />
    );
  };

  const isValidImageUrl = (url) => !url ? false : url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image');

  const getModalTitle = () => modalType === 'add' ? 'Add New Product' : 'Edit Product';

  const renderImagePreview = () => {
    if (!imagePreview) {
      return (
        <div className="w-full h-64 bg-linear-to-br from-[#EEEEEE] to-[#393E46]/20 rounded-lg border-2 border-dashed border-[#393E46]/30 flex flex-col items-center justify-center">
          <ImageIcon className="w-12 h-12 text-[#393E46]/40 mb-3" />
          <p className="text-sm text-[#393E46]/60">No image selected</p>
        </div>
      );
    }
    return (
      <div className="relative w-full h-64 rounded-lg overflow-hidden border border-[#393E46]/30 bg-white">
        {imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#EEEEEE]">
            <ImageIcon className="w-12 h-12 text-[#393E46]/40 mb-3" />
            <p className="text-sm text-[#393E46]/60">Failed to load image</p>
          </div>
        ) : (
          <>
            <img 
              src={imagePreview} 
              alt="Product preview" 
              className="w-full h-full object-contain" 
              onError={handleImageError}
            />
            <button 
              type="button" 
              onClick={handleRemoveImage} 
              className="absolute top-2 right-2 p-1 bg-[#00ADB5] text-[#EEEEEE] rounded-full hover:bg-[#008B95] transition-colors"
            >
              <XCircle size={18} />
            </button>
          </>
        )}
      </div>
    );
  };

  const renderStarRating = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          const filled = starValue <= Math.floor(rating);
          const halfFilled = !filled && starValue - 0.5 <= rating;
          
          if (halfFilled) {
            return (
              <div className="relative" key={index}>
                <Star size={12} className="text-[#393E46]/20" fill="currentColor" />
                <StarHalf size={12} className="text-[#00ADB5] absolute left-0 top-0" fill="currentColor" />
              </div>
            );
          }
          
          return (
            <Star
              key={index}
              size={12}
              className={filled ? "text-[#00ADB5] fill-current" : "text-[#393E46]/20"}
              fill={filled ? "currentColor" : "none"}
            />
          );
        })}
        <span className="text-xs font-medium text-[#393E46]/60 ml-1">
          {rating?.toFixed(1) || '0.0'}
        </span>
      </div>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ADB5]"></div>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-[#EEEEEE]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#222831]">Products Management</h2>
              <p className="text-[#393E46] mt-1">Total Products: {products.length} | Showing: {filteredProducts.length}</p>
            </div>
            <button 
              onClick={handleAddClick} 
              className="inline-flex items-center px-4 py-3 bg-[#00ADB5] text-[#EEEEEE] font-medium rounded-lg hover:bg-[#008B95] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ADB5] transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={20} className="mr-2" />Add Product
            </button>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#393E46]/60" size={20} />
              <input 
                type="text" 
                placeholder="Search products by name, description, or SKU..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 border border-[#393E46]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent transition-all"
              />
            </div>
            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#393E46]/60" size={20} />
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 border border-[#393E46]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent appearance-none bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center">
              <div className="text-red-500 mr-3">⚠️</div>
              <div>
                <p className="text-red-800 font-medium">{error}</p>
                <p className="text-red-700 text-sm mt-1">Make sure json-server is running on http://localhost:3001</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#EEEEEE] animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-linear-to-r from-[#222831] to-[#393E46]">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#EEEEEE]">Product</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#EEEEEE]">Category</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#EEEEEE]">Rating</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#EEEEEE]">Price</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#EEEEEE]">Stock</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#EEEEEE]">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#EEEEEE]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr 
                    key={product.id} 
                    className="border-b border-[#EEEEEE] hover:bg-linear-to-r hover:from-[#00ADB5]/5 hover:to-[#00ADB5]/10 transition-all duration-200 group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg mr-4">
                          <ProductImage 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full rounded-lg object-cover border-2 border-[#EEEEEE] group-hover:border-[#00ADB5] transition-all duration-300" 
                          />
                        </div>
                        <div className="relative">
                          <p className="text-sm font-medium text-[#222831] group-hover:text-[#00ADB5] transition-colors">
                            {product.name || 'Unnamed Product'}
                          </p>
                          <p className="text-xs text-[#393E46]/60 mt-1 line-clamp-2">
                            {product.description || 'No description available'}
                          </p>
                          <p className="text-xs text-[#393E46]/40 mt-1">SKU: {product.sku || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-[#EEEEEE] text-[#393E46] rounded-full text-xs font-medium group-hover:bg-[#00ADB5] group-hover:text-[#EEEEEE] transition-all duration-300">
                        {product.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {renderStarRating(product.rating || 0)}
                      {product.reviews > 0 && (
                        <p className="text-xs text-[#393E46]/40 mt-1">
                          ({product.reviews} reviews)
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#222831] group-hover:text-[#00ADB5] transition-colors">
                          ₹{product.price?.toLocaleString() || '0'}
                        </span>
                        {product.discount > 0 && (
                          <>
                            <span className="text-xs text-[#393E46]/60 line-through">
                              ₹{product.originalPrice?.toLocaleString() || product.price?.toLocaleString()}
                            </span>
                            <span className="text-xs text-[#00ADB5] font-medium mt-1">
                              Save {product.discount}%
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                          (product.stock || 0) > 20 
                            ? 'bg-green-100 text-green-800 group-hover:bg-green-600 group-hover:text-white' 
                            : (product.stock || 0) > 5 
                              ? 'bg-yellow-100 text-yellow-800 group-hover:bg-yellow-600 group-hover:text-white' 
                              : 'bg-red-100 text-red-800 group-hover:bg-red-600 group-hover:text-white'
                        }`}>
                          <span className="inline-block w-2 h-2 rounded-full mr-2 bg-current opacity-60"></span>
                          {product.stock || 0} units
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : product.status === 'inactive' 
                            ? 'bg-gray-100 text-gray-800' 
                            : product.status === 'out-of-stock' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                      }`}>
                        {product.status || 'active'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditClick(product)} 
                          className="inline-flex items-center p-2 text-[#00ADB5] hover:bg-[#00ADB5]/10 rounded-lg transition-all duration-300 hover:scale-110 group/edit" 
                          title="Edit Product"
                        >
                          <Edit2 size={16} className="group-hover/edit:rotate-12 transition-transform" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)} 
                          className="inline-flex items-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110 group/delete" 
                          title="Delete Product"
                        >
                          <Trash2 size={16} className="group-hover/delete:shake-animation" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredProducts.length === 0 && !error && (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#EEEEEE] to-[#393E46]/20 flex items-center justify-center mx-auto mb-4">
                <Package size={24} className="text-[#393E46]/40" />
              </div>
              <h3 className="text-lg font-medium text-[#222831] mb-2">No products found</h3>
              <p className="text-[#393E46]/60 mb-4">
                {searchTerm || selectedCategory !== 'all' ? 'Try adjusting your filters' : 'No products available. Add your first product!'}
              </p>
              <button 
                onClick={handleAddClick} 
                className="inline-flex items-center px-4 py-2 bg-[#00ADB5] text-[#EEEEEE] rounded-lg hover:bg-[#008B95] transition-all hover:scale-105 active:scale-95"
              >
                <Plus size={16} className="mr-2" />Add Your First Product
              </button>
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-[#EEEEEE] p-6 flex items-center justify-between rounded-t-2xl">
                <div>
                  <h3 className="text-xl font-bold text-[#222831]">{getModalTitle()}</h3>
                  <p className="text-[#393E46]/60 text-sm mt-1">
                    {modalType === 'add' ? 'Fill in the details to add a new product' : 'Update the product details'}
                  </p>
                </div>
                <button 
                  onClick={() => { resetForm(); setShowModal(false); }} 
                  className="p-2 hover:bg-[#EEEEEE] rounded-lg transition-colors"
                >
                  <X size={24} className="text-[#393E46]/60" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {Object.keys(errors).length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="text-red-500 mr-2" size={20} />
                      <h4 className="text-red-800 font-medium">Please fix the following errors:</h4>
                    </div>
                    <ul className="text-red-700 text-sm mt-2 list-disc list-inside">
                      {Object.values(errors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">{formError}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#393E46] mb-2 items-center">
                      <Hash size={16} className="mr-1" />
                      SKU
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#393E46]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent bg-[#EEEEEE]"
                      placeholder="Auto-generated SKU"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#393E46] mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#393E46]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent"
                      required
                      placeholder="Enter product name"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#393E46] mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#393E46]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent"
                      placeholder="Enter brand name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#393E46] mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#393E46]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent"
                      required
                    >
                      <option value="RO">RO System</option>
                      <option value="UV">UV Purifier</option>
                      <option value="Gravity">Gravity Filter</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Spare Parts">Spare Parts</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#393E46] mb-2">
                      Rating *
                    </label>
                    <div className="flex items-center gap-4">
                      <StarRating 
                        rating={formData.rating} 
                        onRatingChange={handleRatingChange} 
                        editable={true}
                        size={24}
                      />
                      <input
                        type="number"
                        name="rating"
                        value={formData.rating}
                        onChange={handleInputChange}
                        className="w-24 px-4 py-2 border border-[#393E46]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent"
                        min="0"
                        max="5"
                        step="0.1"
                        required
                      />
                    </div>
                    {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#393E46] mb-2">
                      Reviews Count
                    </label>
                    <input
                      type="number"
                      name="reviews"
                      value={formData.reviews}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#393E46]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent"
                      min="0"
                      placeholder="Number of reviews"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#393E46] mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#393E46]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent"
                      required
                      min="0"
                      step="0.01"
                      placeholder="Enter selling price"
                    />
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#393E46] mb-2 flex items-center">
                      <Percent size={16} className="mr-1" />
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#393E46]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="Enter discount percentage"
                    />
                    {formData.discount > 0 && formData.originalPrice && (
                      <p className="text-sm text-[#393E46]/60 mt-1">
                        Original Price: ₹{formData.originalPrice.toFixed(2)}
                      </p>
                    )}
                    {errors.discount && <p className="text-red-500 text-xs mt-1">{errors.discount}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#393E46] mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#393E46]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent"
                      required
                      min="0"
                      placeholder="Enter stock quantity"
                    />
                    {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#393E46] mb-2">
                      Warranty (Years)
                    </label>
                    <select
                      name="warranty"
                      value={formData.warranty}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#393E46]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent"
                    >
                      <option value="0">No Warranty</option>
                      <option value="1">1 Year</option>
                      <option value="2">2 Years</option>
                      <option value="3">3 Years</option>
                      <option value="5">5 Years</option>
                      <option value="10">10 Years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#393E46] mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#393E46]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="out-of-stock">Out of Stock</option>
                      <option value="coming-soon">Coming Soon</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#393E46] mb-2">
                    Image Source
                  </label>
                  <div className="flex gap-2 mb-3">
                    <button 
                      type="button" 
                      onClick={() => switchImageSource('url')} 
                      className={`flex-1 px-4 py-2 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                        imageSource === 'url' 
                          ? 'border-[#00ADB5] bg-[#00ADB5]/10 text-[#00ADB5]' 
                          : 'border-[#393E46]/30 hover:bg-[#EEEEEE]'
                      }`}
                    >
                      <Link size={16} />From URL{imageSource === 'url' && <Check size={14} />}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => switchImageSource('upload')} 
                      className={`flex-1 px-4 py-2 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                        imageSource === 'upload' 
                          ? 'border-[#00ADB5] bg-[#00ADB5]/10 text-[#00ADB5]' 
                          : 'border-[#393E46]/30 hover:bg-[#EEEEEE]'
                      }`}
                    >
                      <Upload size={16} />Upload File{imageSource === 'upload' && <Check size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#393E46] mb-2">
                    Product Image
                  </label>
                  {imageSource === 'url' ? (
                    <>
                      <div className="relative mb-3">
                        <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#393E46]/60" size={20} />
                        <input
                          type="url"
                          name="image"
                          value={formData.image}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-[#393E46]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent transition-all"
                          placeholder="https://example.com/product-image.jpg"
                        />
                      </div>
                      <div className="text-xs text-[#393E46]/60 mb-3">
                        Tip: Use image URLs or upload files under {MAX_IMAGE_SIZE/1024}KB
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-3">
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileSelect} 
                          accept="image/*" 
                          className="hidden" 
                          id="file-upload" 
                        />
                        <label 
                          htmlFor="file-upload" 
                          className="block w-full px-4 py-3 border-2 border-dashed border-[#393E46]/30 rounded-lg cursor-pointer hover:border-[#00ADB5] hover:bg-[#00ADB5]/5 transition-all group"
                        >
                          <div className="flex flex-col items-center justify-center py-4">
                            <div className="w-12 h-12 rounded-full bg-[#EEEEEE] flex items-center justify-center mb-3 group-hover:bg-[#00ADB5]/10 transition-colors">
                              <FolderOpen className="w-6 h-6 text-[#393E46]/60 group-hover:text-[#00ADB5] transition-colors" />
                            </div>
                            <p className="text-sm font-medium text-[#393E46] mb-1">
                              {uploadedImage ? uploadedImage.name : 'Click to select image'}
                            </p>
                            <p className="text-xs text-[#393E46]/60">
                              JPEG, PNG, GIF, WebP (Max {MAX_IMAGE_SIZE/1024}KB)
                            </p>
                            {uploadProgress > 0 && uploadProgress < 100 && (
                              <div className="w-full mt-3">
                                <div className="h-2 bg-[#EEEEEE] rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-[#00ADB5] transition-all duration-300" 
                                    style={{ width: `${uploadProgress}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-[#393E46]/60 mt-1 text-center">
                                  Processing... {uploadProgress}%
                                </p>
                              </div>
                            )}
                          </div>
                        </label>
                        {uploadedImage && (
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-[#393E46]/60">Selected: {uploadedImage.name}</span>
                            <button 
                              type="button" 
                              onClick={handleRemoveImage} 
                              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                            >
                              <XCircle size={14} />Remove
                            </button>
                          </div>
                        )}
                      </div>
                      {uploadError && (
                        <div className="text-sm text-red-600 mb-3">{uploadError}</div>
                      )}
                    </>
                  )}
                  <div className="mt-4">
                    <p className="text-sm text-[#393E46] mb-2">Preview:</p>
                    {renderImagePreview()}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#393E46] mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-4 py-3 border border-[#393E46]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent transition-all resize-none"
                    placeholder="Enter product description"
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#393E46] mb-2">
                    Specifications (One per line)
                  </label>
                  <textarea
                    name="specifications"
                    value={formData.specifications}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-[#393E46]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent transition-all"
                    placeholder="Capacity: 10L/day
Technology: 7-stage RO+UV+UF
Installation: Free"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#393E46] mb-2">
                    Key Features (One per line)
                  </label>
                  <textarea
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-[#393E46]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent transition-all"
                    placeholder="Smart TDS display
Auto shut-off
Energy saving mode"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-[#EEEEEE]">
                  <button 
                    type="button" 
                    onClick={() => { resetForm(); setShowModal(false); }} 
                    className="px-6 py-3 border border-[#393E46]/30 text-[#393E46] font-medium rounded-lg hover:bg-[#EEEEEE] transition-all active:scale-95" 
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="px-6 py-3 bg-[#00ADB5] text-[#EEEEEE] font-medium rounded-lg hover:bg-[#008B95] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ADB5] transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={20} className="mr-2 animate-spin" />
                        {modalType === 'add' ? 'Adding...' : 'Updating...'}
                      </>
                    ) : (
                      <>
                        {modalType === 'add' ? (
                          <>
                            <Plus size={20} className="mr-2" />Add Product
                          </>
                        ) : (
                          <>
                            <Save size={20} className="mr-2" />Update Product
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className={`fixed top-6 right-6 z-50 w-96 animate-slide-in`}
          style={{ top: `${6 + (index * 90)}px` }}
        >
          <div className={`rounded-xl shadow-lg p-4 border ${
            toast.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : toast.type === 'error' 
                ? 'bg-red-50 border-red-200' 
                : toast.type === 'warning' 
                  ? 'bg-yellow-50 border-yellow-200' 
                  : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start">
              <div className="shrink-0">
                {toast.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : toast.type === 'error' ? (
                  <XCircleIcon className="w-5 h-5 text-red-600" />
                ) : toast.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                ) : (
                  <Info className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${
                  toast.type === 'success' 
                    ? 'text-green-800' 
                    : toast.type === 'error' 
                      ? 'text-red-800' 
                      : toast.type === 'warning' 
                        ? 'text-yellow-800' 
                        : 'text-blue-800'
                }`}>
                  {toast.type === 'success' ? 'Success' : 
                   toast.type === 'error' ? 'Error' : 
                   toast.type === 'warning' ? 'Warning' : 'Info'}
                </p>
                <p className={`mt-1 text-sm ${
                  toast.type === 'success' 
                    ? 'text-green-700' 
                    : toast.type === 'error' 
                      ? 'text-red-700' 
                      : toast.type === 'warning' 
                        ? 'text-yellow-700' 
                        : 'text-blue-700'
                } opacity-90`}>
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 shrink-0 text-[#393E46]/40 hover:text-[#393E46]/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3">
              <div className={`h-1 rounded-full animate-progress ${
                toast.type === 'success' 
                  ? 'bg-green-300' 
                  : toast.type === 'error' 
                    ? 'bg-red-300' 
                    : toast.type === 'warning' 
                      ? 'bg-yellow-300' 
                      : 'bg-blue-300'
              }`} />
            </div>
          </div>
        </div>
      ))}

      {/* Add custom animations to global styles */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
        
        .animate-slide-out {
          animation: slideOut 0.3s ease-in forwards;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
        
        .animate-progress {
          animation: progress 3s linear forwards;
        }
        
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(10deg); }
          75% { transform: rotate(-10deg); }
        }
        
        .shake-animation {
          animation: shake 0.5s ease-in-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default ProductsPage;