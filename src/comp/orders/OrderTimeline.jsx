import React from 'react';
import { format } from 'date-fns';
import { CheckCircle, Clock, User, Cpu, AlertCircle } from 'lucide-react';

const OrderTimeline = ({ timeline, currentStatus }) => {
  const defaultEvents = [
    {
      status: 'pending',
      label: 'Order Placed',
      description: 'Your order has been received and is being processed',
      default: true
    },
    {
      status: 'confirmed',
      label: 'Order Confirmed',
      description: 'We\'ve verified your order details',
      default: true
    },
    {
      status: 'processing',
      label: 'Processing',
      description: 'Preparing your water purifier for shipment',
      default: true
    },
    {
      status: 'shipped',
      label: 'Shipped',
      description: 'Your order has left our facility',
      default: true
    },
    {
      status: 'out_for_delivery',
      label: 'Out for Delivery',
      description: 'On its way to your address',
      default: true
    },
    {
      status: 'delivered',
      label: 'Delivered',
      description: 'Order successfully delivered to you',
      default: true
    },
    {
      status: 'installed',
      label: 'Installed',
      description: 'Professional installation completed',
      default: true
    }
  ];

  const getStatusIndex = (status) => {
    return defaultEvents.findIndex(event => event.status === status);
  };

  const currentStatusIndex = getStatusIndex(currentStatus);

  // Combine timeline events with default events
  const events = defaultEvents.map((defaultEvent, index) => {
    const timelineEvent = timeline?.find(t => t.status === defaultEvent.status);

    return {
      ...defaultEvent,
      completed: index <= currentStatusIndex,
      current: index === currentStatusIndex,
      timestamp: timelineEvent?.timestamp,
      actor: timelineEvent?.actor || (index <= currentStatusIndex ? 'system' : null)
    };
  });

  const getActorIcon = (actor) => {
    switch (actor) {
      case 'admin': return <User size={12} className="text-[#00A9FF]" />;
      case 'system': return <Cpu size={12} className="text-slate-500" />;
      case 'user': return <User size={12} className="text-emerald-500" />;
      default: return <AlertCircle size={12} className="text-slate-400" />;
    }
  };

  const getActorLabel = (actor) => {
    switch (actor) {
      case 'admin': return 'admin';
      case 'system': return 'System';
      case 'user': return 'You';
      default: return 'System';
    }
  };

  return (
    <div className="relative">
      {events.map((event, index) => (
        <div
          key={event.status}
          className="flex mb-8 last:mb-0 group"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Timeline line & dot */}
          <div className="flex flex-col items-center mr-4 relative">
            {/* Connection line */}
            {index < events.length - 1 && (
              <div className={`
                absolute top-8 left-4 w-0.5 h-full -translate-x-1/2
                ${event.completed ? 'bg-linear-to-b from-[#00A9FF] to-[#89CFF3]' : 'bg-slate-200'}
                group-last:opacity-0
              `} />
            )}

            {/* Status dot */}
            <div className={`
              relative w-8 h-8 rounded-full flex items-center justify-center z-10
              ${event.completed
                ? 'bg-linear-to-br from-[#00A9FF] to-[#89CFF3] text-white shadow-lg'
                : event.current
                  ? 'bg-linear-to-br from-white to-slate-100 border-2 border-[#00A9FF]'
                  : 'bg-slate-100 text-slate-400'
              }
              ${event.current ? 'animate-pulse' : ''}
              transition-all duration-300
            `}>
              {event.completed ? (
                <CheckCircle size={14} className={event.current ? 'text-[#00A9FF]' : 'text-white'} />
              ) : (
                <Clock size={14} className={event.current ? 'text-[#00A9FF]' : 'text-slate-400'} />
              )}
              
              {/* Current status indicator */}
              {event.current && (
                <div className="absolute -inset-1 rounded-full border-2 border-[#00A9FF]/30 animate-ping"></div>
              )}
            </div>
          </div>

          {/* Event content */}
          <div className="flex-1 pb-8 group-last:pb-0">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 hover:border-[#A0E9FF] hover:shadow-md transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h4 className={`font-semibold ${event.completed ? 'text-slate-800' : 'text-slate-600'}`}>
                    {event.label}
                  </h4>
                  {event.current && (
                    <span className="px-2 py-0.5 bg-linear-to-r from-[#00A9FF] to-[#89CFF3] text-white text-xs font-medium rounded-full">
                      Current
                    </span>
                  )}
                </div>
                {event.timestamp && (
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {format(new Date(event.timestamp), 'MMM dd, hh:mm a')}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-600 mb-3">
                {event.description}
              </p>

              {event.actor && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-slate-500">
                    {getActorIcon(event.actor)}
                    <span className="ml-1 capitalize font-medium">
                      Updated by {getActorLabel(event.actor)}
                    </span>
                  </div>
                  {event.completed && !event.current && (
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderTimeline;