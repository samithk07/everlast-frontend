import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

const API_BASE = 'http://localhost:3001';

export const useOrders = (userId = '1') => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [statusChanges, setStatusChanges] = useState([]);
  
  const pollingRef = useRef(null);
  const previousOrdersRef = useRef([]);

  // Fetch all orders for user
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/orders?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      setOrders(data);
      previousOrdersRef.current = data;
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching orders:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch single order details
  const fetchOrderDetails = useCallback(async (orderId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/orders/${orderId}`);
      if (!response.ok) throw new Error('Failed to fetch order details');
      
      const data = await response.json();
      setCurrentOrder(data);
      return data;
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load order details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Start polling for order updates
  const startPolling = useCallback((interval = 10000) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    pollingRef.current = setInterval(async () => {
      const newOrders = await fetchOrders();
      
      // Check for status changes
      newOrders.forEach((newOrder) => {
        const oldOrder = previousOrdersRef.current.find(o => o.id === newOrder.id);
        if (oldOrder && oldOrder.status !== newOrder.status) {
          // Status changed
          const change = {
            orderId: newOrder.orderId || newOrder.id,
            oldStatus: oldOrder.status,
            newStatus: newOrder.status,
            timestamp: new Date().toISOString()
          };
          
          setStatusChanges(prev => [...prev, change]);
          
          // Show toast notification
          toast.info(`Order #${newOrder.orderId || newOrder.id} status changed to ${newOrder.status}`);
        }
      });
      
      previousOrdersRef.current = newOrders;
    }, interval);
  }, [fetchOrders]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Manual refresh
  const refreshOrders = useCallback(async () => {
    await fetchOrders();
    toast.success('Orders refreshed');
  }, [fetchOrders]);

  // Update order status (for testing)
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          updatedAt: new Date().toISOString(),
          statusTimeline: [
            ...(currentOrder?.statusTimeline || []),
            {
              status: newStatus,
              timestamp: new Date().toISOString(),
              actor: 'admin'
            }
          ]
        })
      });

      if (response.ok) {
        await fetchOrders();
        toast.success(`Order status updated to ${newStatus}`);
        return true;
      }
      throw new Error('Failed to update order status');
    } catch (err) {
      toast.error('Failed to update order status');
      return false;
    }
  }, [currentOrder, fetchOrders]);

  // Initialize
  useEffect(() => {
    fetchOrders();
    startPolling(10000); // Poll every 10 seconds

    return () => {
      stopPolling();
    };
  }, [fetchOrders, startPolling, stopPolling]);

  return {
    orders,
    loading,
    error,
    currentOrder,
    statusChanges,
    fetchOrders,
    fetchOrderDetails,
    refreshOrders,
    updateOrderStatus,
    startPolling,
    stopPolling
  };
};