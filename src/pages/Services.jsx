import React, { useState } from 'react';
import { Phone, Calendar, Droplets, X, CheckCircle } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const Services = () => {
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [showCallPopup, setShowCallPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Color theme matching your existing design
  const colors = {
    primary: '#00A9FF',
    secondary: '#89CFF3',
    accent: '#A0E9FF',
    background: '#CDF5FD',
    text: '#0B0C10',
    success: '#10B981',
    error: '#EF4444'
  };

  // Background image URL - Replace with your actual image
  const backgroundImage = "url('src/assets/Water purifier.jpg')";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^[6-9]\d{9}$/;
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        errors.phone = 'Please enter a valid 10-digit Indian phone number';
      }
    }

    // Service validation
    if (!formData.service) {
      errors.service = 'Please select a service';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookService = () => {
    setShowBookingPopup(true);
  };

  const handleContactUs = () => {
    setShowCallPopup(true);
  };

  const handleCallNow = () => {
    window.location.href = 'tel:+919656567901';
  };

  // UPDATED FUNCTION: Save to JSON Server
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare booking data with additional fields
      const bookingData = {
        ...formData,
        phone: formData.phone.replace(/\D/g, ''), // Clean phone number
        date: new Date().toISOString(),
        status: 'pending'
      };

      // Send POST request to JSON Server
      const response = await fetch('http://localhost:3001/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        throw new Error('Failed to save booking');
      }

      const result = await response.json();
      console.log('Booking saved successfully:', result);

      // Show success popup
      setShowSuccessPopup(true);
      setShowBookingPopup(false);
      setFormData({ name: '', phone: '', service: '', message: '' });
      
    } catch (error) {
      console.error('Error saving booking:', error);
      // Show error message but keep the form open
      alert('Failed to submit booking. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closePopup = () => {
    setShowBookingPopup(false);
    setShowCallPopup(false);
    setShowSuccessPopup(false);
    setFormErrors({});
  };

  return (
    <>
      <NavBar/>
      
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={closePopup}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-100">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle size={32} className="text-green-600" />
              </div>

              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>
                Booking Confirmed!
              </h3>
              <p className="text-gray-600 mb-4">
                Thank you for your booking request. Our team will contact you shortly to confirm your appointment.
              </p>

              <button
                onClick={closePopup}
                className="w-full py-3 rounded-lg font-semibold text-white transition-colors"
                style={{
                  backgroundColor: colors.success
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                onMouseLeave={(e) => e.target.style.backgroundColor = colors.success}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Popup */}
      {showBookingPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={closePopup}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold" style={{ color: colors.primary }}>
                  Book a Service
                </h3>
                <button
                  onClick={closePopup}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your 10-digit phone number"
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Required *
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.service ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a service</option>
                    <option value="installation">Water Purifier Installation</option>
                    <option value="maintenance">Annual Maintenance</option>
                    <option value="repair">Repair Service</option>
                    <option value="filter">Filter Replacement</option>
                    <option value="other">Other</option>
                  </select>
                  {formErrors.service && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.service}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any specific requirements or questions..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: isSubmitting ? colors.secondary : colors.primary,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = colors.secondary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = colors.primary;
                    }
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Call Popup */}
      {showCallPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={closePopup}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-100">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <Phone size={32} className="text-green-600" />
              </div>

              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>
                Call Our Expert
              </h3>
              <p className="text-gray-600 mb-4">
                Speak directly with our water purification specialist
              </p>

              <div className="text-2xl font-bold mb-6" style={{ color: colors.primary }}>
                +91 80783 32452
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closePopup}
                  className="flex-1 py-3 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCallNow}
                  className="flex-1 py-3 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: colors.success
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.success}
                >
                  <Phone size={20} />
                  Call Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Hero Section */}
      <section
        className="relative py-20 lg:py-32 text-white overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(0, 169, 255, 0.9), rgba(137, 207, 243, 0.9)), ${backgroundImage}`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Enhanced Background Pattern with Glass Morphism */}
        <div className="absolute inset-0">
          {/* Glass morphism overlay */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>

          {/* Animated bubbles */}
          <div className="absolute top-20 left-20 w-24 h-24 rounded-full bg-white/20 animate-pulse"></div>
          <div className="absolute top-40 right-32 w-20 h-20 rounded-full bg-white/15 animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/3 w-16 h-16 rounded-full bg-white/25 animate-pulse delay-500"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 rounded-full bg-white/10 animate-pulse delay-1500"></div>
        </div>

        {/* Enhanced Water Droplet Animations */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white opacity-20 animate-bounce"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2000}ms`,
                animationDuration: `${Math.random() * 3000 + 2000}ms`
              }}
            ></div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              {/* Main Title */}
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6 drop-shadow-lg">
                Pure & Safe Water Solutions
                <span className="block mt-2" style={{ color: colors.accent, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                  For Your Home & Office
                </span>
              </h1>

              {/* Tagline */}
              <p className="text-xl lg:text-2xl font-semibold mb-4 drop-shadow-md" style={{ color: colors.accent }}>
                Expert Installation • Reliable Service • Complete Support
              </p>

              {/* Description */}
              <p className="text-lg lg:text-xl mb-8 max-w-2xl mx-auto lg:mx-0 opacity-95 drop-shadow-md">
                We provide affordable water purifier services with professional installation,
                maintenance, and 24/7 customer support to ensure your water stays pure and safe.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {/* Primary CTA */}
                <button
                  onClick={handleBookService}
                  className="group px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 backdrop-blur-sm"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    color: colors.primary
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.95)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                >
                  <Calendar size={24} className="group-hover:scale-110 transition-transform" />
                  Book a Service
                </button>

                {/* Secondary CTA */}
                <button
                  onClick={handleContactUs}
                  className="group px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 border-2 border-white hover:border-transparent backdrop-blur-sm"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    borderColor: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.25)';
                    e.target.style.borderColor = colors.accent;
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.15)';
                    e.target.style.borderColor = 'white';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <Phone size={24} className="group-hover:scale-110 transition-transform" />
                  Contact Us
                </button>
              </div>

              {/* Enhanced Trust Indicators */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm">
                {[
                  { text: '24/7 Support' },
                  { text: 'Certified Experts' },
                  { text: 'Free Installation' },
                  { text: 'Quick Response' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full">
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Visual Element */}
            <div className="relative">
              <div
                className="rounded-3xl p-8 transform rotate-3 backdrop-blur-lg mx-auto max-w-md"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              >
                <div className="rounded-2xl transform -rotate-3 shadow-2xl overflow-hidden border-4 border-white/30">
                  {/* Enhanced Service Image */}
                  <div
                    className="w-full h-80 bg-cover bg-center flex items-center justify-center relative"
                    style={{
                      backgroundImage: "url('src/assets/service-2.jpg')"
                    }}
                  >
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent"></div>
                    <Droplets size={80} className="text-white drop-shadow-lg relative z-10" />
                  </div>
                </div>
              </div>

              {/* Enhanced Floating Elements */}
              <div
                className="absolute -top-6 -right-6 w-12 h-12 rounded-full animate-pulse backdrop-blur-sm"
                style={{
                  backgroundColor: colors.accent,
                  border: '2px solid rgba(255,255,255,0.5)'
                }}
              ></div>
              <div
                className="absolute -bottom-6 -left-6 w-10 h-10 rounded-full animate-bounce backdrop-blur-sm"
                style={{
                  backgroundColor: colors.primary,
                  border: '2px solid rgba(255,255,255,0.5)'
                }}
              ></div>

              {/* Enhanced Stats Card */}
              <div
                className="absolute -bottom-8 -right-8 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl transform rotate-6 border border-white/20"
                style={{ color: colors.text }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1" style={{ color: colors.primary }}>1000+</div>
                  <div className="text-sm font-semibold opacity-80">Happy Customers</div>
                  <div className="w-12 h-1 bg-linear-to-r from-blue-400 to-cyan-400 rounded-full mx-auto mt-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center backdrop-blur-sm">
            <div className="w-1 h-4 bg-white rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </section>
      <Footer/>
    </>
  );
};

export default Services;