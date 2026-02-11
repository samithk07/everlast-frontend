// components/ProductModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Image as ImageIcon,
  AlertCircle,
  Tag,
  Star,
  Package,
  Percent,
  Hash
} from 'lucide-react';

const ProductModal = ({ product, onSubmit, onClose }) => {
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

  const [imageError, setImageError] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
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
        sku: product.sku || '',
        discount: product.discount || 0,
        specifications: product.specifications || '',
        features: product.features || '',
        status: product.status || 'active'
      });
    } else {
      // Generate SKU for new product
      const generateSKU = () => {
        const prefix = 'PROD';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}-${timestamp}-${random}`;
      };
      
      setFormData(prev => ({
        ...prev,
        sku: generateSKU()
      }));
    }
  }, [product]);

  const handleChange = (e) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Ensure all numeric fields are properly formatted
    const submitData = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      rating: Number(formData.rating),
      reviews: Number(formData.reviews),
      discount: Number(formData.discount),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Number(formData.price)
    };
    
    onSubmit(submitData);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            {product ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 items-center">
                <Hash size={16} className="mr-1" />
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                placeholder="Auto-generated SKU"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter brand name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="RO">RO System</option>
                <option value="UV">UV Purifier</option>
                <option value="Gravity">Gravity Filter</option>
                <option value="Accessories">Accessories</option>
                <option value="Spare Parts">Spare Parts</option>
              </select>
            </div>

            {/* Pricing Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="0"
                step="0.01"
                placeholder="Enter selling price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 items-center">
                <Percent size={16} className="mr-1" />
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="100"
                step="0.1"
                placeholder="Enter discount percentage"
              />
              {formData.discount > 0 && formData.originalPrice && (
                <p className="text-sm text-gray-600 mt-1">
                  Original Price: ₹{formData.originalPrice.toFixed(2)}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Star size={16} className="mr-1" />
                Rating (0-5)
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="5"
                step="0.1"
                placeholder="4.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reviews Count
              </label>
              <input
                type="number"
                name="reviews"
                value={formData.reviews}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                placeholder="Number of reviews"
              />
            </div>

            {/* Stock & Warranty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 items-center">
                <Package size={16} className="mr-1" />
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="0"
                placeholder="Enter stock quantity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warranty (Years)
              </label>
              <select
                name="warranty"
                value={formData.warranty}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="coming-soon">Coming Soon</option>
              </select>
            </div>
          </div>

          {/* Image Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <div className="flex gap-4">
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={(e) => {
                  handleChange(e);
                  setImageError(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                onClick={() => {
                  const sampleImages = [
                    'https://images.unsplash.com/photo-1520218508822-998633d997e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                  ];
                  const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
                  setFormData(prev => ({ ...prev, image: randomImage }));
                  setImageError(false);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Use Sample
              </button>
            </div>
            
            {formData.image && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                <div className="w-48 h-48 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
                  {imageError ? (
                    <div className="text-center">
                      <ImageIcon size={48} className="text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-500 mt-2">Failed to load image</p>
                    </div>
                  ) : (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                      onLoad={() => setImageError(false)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="Enter detailed product description"
            />
          </div>

          {/* Specifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specifications (One per line)
            </label>
            <textarea
              name="specifications"
              value={formData.specifications}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Capacity: 10L/day
Technology: 7-stage RO+UV+UF
Installation: Free"
            />
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Features (One per line)
            </label>
            <textarea
              name="features"
              value={formData.features}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Smart TDS display
Auto shut-off
Energy saving mode"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;