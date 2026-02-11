// admin/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, Users, IndianRupee , TrendingUp, Activity, Clock } from 'lucide-react';

const API_BASE = 'http://localhost:3001';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [productsRes, ordersRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/products`),
        fetch(`${API_BASE}/orders`),
        fetch(`${API_BASE}/users`)
      ]);

      if (!productsRes.ok || !ordersRes.ok || !usersRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const products = await productsRes.json();
      const orders = await ordersRes.json();
      const users = await usersRes.json();

      const revenue = orders.reduce((total, order) => total + (order.total || 0), 0);

      setStats({
        products: products.length,
        orders: orders.length,
        users: users.length,
        revenue: revenue
      });
    } catch (err) {
      setError('Failed to load data. Make sure json-server is running on http://localhost:3001');
      console.error('Dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Quick action handlers
  const handleQuickAction = (action) => {
    switch(action) {
      
      case 'viewProducts':
        navigate('/admin/products');
        break;
      case 'viewOrders':
        navigate('/admin/orders');
        break;
      case 'manageUsers':
        navigate('/admin/users');
        break;
      
      default:
        break;
    }
  };

  const statCards = [
    {
      id: 1,
      title: 'Total Products',
      value: stats.products,
      icon: <Package size={24} />,
      color: 'text-[#00A9FF]',
      bgColor: 'bg-[#00A9FF]/10',
      borderColor: 'border-[#00A9FF]/20',
      change: '+12%',
      changeColor: 'text-green-600'
    },
    {
      id: 2,
      title: 'Total Orders',
      value: stats.orders,
      icon: <ShoppingBag size={24} />,
      color: 'text-[#89CFF3]',
      bgColor: 'bg-[#89CFF3]/10',
      borderColor: 'border-[#89CFF3]/20',
      change: '+8%',
      changeColor: 'text-green-600'
    },
    {
      id: 3,
      title: 'Total Users',
      value: stats.users,
      icon: <Users size={24} />,
      color: 'text-[#A0E9FF]',
      bgColor: 'bg-[#A0E9FF]/10',
      borderColor: 'border-[#A0E9FF]/20',
      change: '+15%',
      changeColor: 'text-green-600'
    },
    {
      id: 4,
      title: 'Total Revenue',
      value: `₹${stats.revenue.toLocaleString()}`,
      icon: <IndianRupee size={24} />,
      color: 'text-[#00A9FF]',
      bgColor: 'bg-[#00A9FF]/10',
      borderColor: 'border-[#00A9FF]/20',
      change: '+23%',
      changeColor: 'text-green-600'
    }
  ];

  const quickActions = [
   
    {
      id: 2,
      title: 'View Products',
      description: 'Browse all products',
      icon: <Package size={18} />,
      action: 'viewProducts',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 3,
      title: 'View Orders',
      description: 'Check recent orders',
      icon: <ShoppingBag size={18} />,
      action: 'viewOrders',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 4,
      title: 'Manage Users',
      description: 'User accounts',
      icon: <Users size={18} />,
      action: 'manageUsers',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">Unable to Load Data</h3>
          <p className="text-slate-600">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-[#00A9FF] text-white rounded-lg hover:bg-[#0088CC]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div 
            key={stat.id} 
            className={`bg-white rounded-xl shadow-sm p-6 border ${stat.borderColor} hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor} ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${stat.changeColor} flex items-center`}>
                <TrendingUp size={12} className="mr-1" />
                {stat.change} from last month
              </span>
              <span className="text-xs text-slate-500">Live</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
                <p className="text-slate-600 mt-2">
                  Welcome to your admin dashboard. All data is fetched in real-time from your json-server backend.
                </p>
                <div className="mt-6 p-4 bg-[#CDF5FD] rounded-lg border border-[#A0E9FF]">
                  <h3 className="text-lg font-medium text-slate-800 mb-2">System Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
                      <span className="text-sm text-slate-700">API: Active</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
                      <span className="text-sm text-slate-700">Database: Online</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
                      <span className="text-sm text-slate-700">Updated: Just now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <Activity size={18} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">New orders received</p>
                  <p className="text-xs text-slate-500">5 orders in the last hour</p>
                </div>
                <Clock size={14} className="text-slate-400" />
              </div>
              <div className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <Package size={18} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">Products updated</p>
                  <p className="text-xs text-slate-500">3 products had stock changes</p>
                </div>
                <Clock size={14} className="text-slate-400" />
              </div>
              <div className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <Users size={18} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">New user registrations</p>
                  <p className="text-xs text-slate-500">2 users joined today</p>
                </div>
                <Clock size={14} className="text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.action)}
                  className="w-full flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 text-left transition-colors hover:shadow-sm group"
                >
                  <div className={`p-2 rounded-lg ${action.bgColor} mr-3 group-hover:scale-110 transition-transform`}>
                    <div className={action.color}>
                      {action.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{action.title}</p>
                    <p className="text-xs text-slate-500">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="bg-linear-to-r from-[#00A9FF] to-[#89CFF3] rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Stats Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Products Live</span>
                <span className="text-sm font-bold">{stats.products}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Orders</span>
                <span className="text-sm font-bold">{stats.orders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Users</span>
                <span className="text-sm font-bold">{stats.users}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/20">
                <span className="text-sm">Total Revenue</span>
                <span className="text-sm font-bold">₹{stats.revenue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;