import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  X, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  User,
  Phone,
  MessageSquare,
  RefreshCw
} from 'lucide-react';

const ServicesPage = () => {
  // Theme colors
  const colors = {
    primary: '#00A9FF',
    secondary: '#89CFF3',
    accent: '#A0E9FF',
    background: '#CDF5FD'
  };

  // State management
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [bookingToUpdate, setBookingToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // API Base URL
  const API_URL = 'http://localhost:3001/bookings';

  // Fetch bookings from JSON Server
  const fetchBookings = async () => {
    try {
      setError('');
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter and search bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id?.toString().includes(searchTerm);
    
    const matchesStatus = 
      statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // View booking details
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  // Update booking status
  const handleUpdateStatus = async () => {
    if (!bookingToUpdate || !newStatus) return;

    try {
      const response = await fetch(`${API_URL}/${bookingToUpdate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingToUpdate,
          status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      // Update local state
      setBookings(bookings.map(b => 
        b.id === bookingToUpdate.id ? { ...b, status: newStatus } : b
      ));

      setShowStatusModal(false);
      setBookingToUpdate(null);
      setNewStatus('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete booking
  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;

    try {
      const response = await fetch(`${API_URL}/${bookingToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }

      // Update local state
      setBookings(bookings.filter(b => b.id !== bookingToDelete.id));
      setShowDeleteModal(false);
      setBookingToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle size={14} /> },
      completed: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
      cancelled: { color: 'bg-red-100 text-red-800', icon: <X size={14} /> }
    };

    const { color, icon } = config[status] || config.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto" 
               style={{ borderColor: colors.primary }}></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Service Bookings</h1>
              <p className="text-gray-600 mt-1">Manage all customer service bookings</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50"
                style={{ 
                  backgroundColor: colors.secondary,
                  color: 'white'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = colors.primary}
                onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              
              <div className="text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg border">
                <span className="font-semibold" style={{ color: colors.primary }}>
                  {filteredBookings.length}
                </span> bookings found
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <div>
              <p className="text-red-800 font-medium">Error: {error}</p>
              <button 
                onClick={fetchBookings}
                className="text-red-600 hover:text-red-800 text-sm mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Bookings
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, service, or ID..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ focusRingColor: colors.primary }}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter size={16} className="inline mr-1" />
                Filter by Status
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all' ? 'text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  style={{ 
                    backgroundColor: statusFilter === 'all' ? colors.primary : 'transparent'
                  }}
                >
                  All
                </button>
                {['pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === status ? 'text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    style={{ 
                      backgroundColor: statusFilter === status ? colors.primary : 'transparent'
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" 
                   style={{ backgroundColor: colors.background }}>
                <Search className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter' 
                  : 'No bookings have been made yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{booking.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" 
                               style={{ backgroundColor: colors.accent }}>
                            <User size={16} className="text-gray-700" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.name}</div>
                            <div className="text-sm text-gray-500">{booking.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {booking.service?.replace(/-/g, ' ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(booking.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={booking.status || 'pending'} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(booking)}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setBookingToUpdate(booking);
                              setNewStatus(booking.status || 'pending');
                              setShowStatusModal(true);
                            }}
                            className="p-1.5 rounded hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-800"
                            title="Update Status"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setBookingToDelete(booking);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 rounded hover:bg-red-50 transition-colors text-red-600 hover:text-red-800"
                            title="Delete Booking"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowDetailsModal(false)}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
                  <p className="text-sm text-gray-600 mt-1">ID: #{selectedBooking.id}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User size={20} />
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium">{selectedBooking.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <div className="flex items-center gap-2">
                        <Phone size={16} />
                        <p className="font-medium">{selectedBooking.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Info */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="text-lg font-semibold mb-4">Service Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Service Type</p>
                      <p className="font-medium capitalize">
                        {selectedBooking.service?.replace(/-/g, ' ') || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Booking Date</p>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <p className="font-medium">{formatDate(selectedBooking.date)}</p>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="mt-2">
                        <StatusBadge status={selectedBooking.status || 'pending'} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {selectedBooking.message && (
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <MessageSquare size={20} />
                      Additional Message
                    </h4>
                    <p className="text-gray-700 bg-white p-4 rounded-lg">
                      {selectedBooking.message}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2.5 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && bookingToUpdate && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowStatusModal(false)}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Update Booking Status</h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  Booking #{bookingToUpdate.id} • {bookingToUpdate.name}
                </p>
                <p className="font-medium capitalize">
                  Service: {bookingToUpdate.service?.replace(/-/g, ' ')}
                </p>
              </div>

              <div className="space-y-3 mb-8">
                <label className="block text-sm font-medium text-gray-700">
                  Select New Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => setNewStatus(status)}
                      className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${newStatus === status ? 'text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                      style={{ 
                        backgroundColor: newStatus === status ? colors.primary : 'transparent'
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={!newStatus || newStatus === bookingToUpdate.status}
                  className="flex-1 py-3 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: colors.primary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondary}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.primary}
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && bookingToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowDeleteModal(false)}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle size={32} className="text-red-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Booking</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete booking #{bookingToDelete.id}?
                <br />
                <span className="font-medium">{bookingToDelete.name}</span> • {bookingToDelete.service}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteBooking}
                  className="flex-1 py-3 rounded-lg font-medium text-white transition-colors"
                  style={{ backgroundColor: '#EF4444' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#DC2626'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#EF4444'}
                >
                  Delete Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;