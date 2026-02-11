import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#CDF5FD] to-white animate-pulse">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button skeleton */}
        <div className="h-6 w-32 bg-slate-300 rounded mb-8"></div>

        {/* Hero header skeleton */}
        <div className="bg-linear-to-r from-slate-300 to-slate-200 rounded-2xl p-6 mb-8">
          <div className="h-8 w-64 bg-slate-400/50 rounded mb-2"></div>
          <div className="h-4 w-96 bg-slate-400/30 rounded"></div>
        </div>

        {/* Order summary skeleton */}
        <div className="bg-white/60 rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div>
              <div className="h-10 w-80 bg-slate-300 rounded mb-3"></div>
              <div className="h-4 w-96 bg-slate-200 rounded"></div>
            </div>
            <div className="h-10 w-32 bg-slate-300 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-300">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-200/50 rounded-xl"></div>
            ))}
          </div>
        </div>

        {/* Two column layout skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content skeleton */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order items skeleton */}
            <div className="bg-white/60 rounded-2xl p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-slate-300 rounded-xl mr-4"></div>
                <div>
                  <div className="h-6 w-48 bg-slate-300 rounded mb-2"></div>
                  <div className="h-4 w-32 bg-slate-200 rounded"></div>
                </div>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center p-4 border border-slate-300 rounded-xl mb-4">
                  <div className="w-16 h-16 bg-slate-300 rounded-xl mr-4"></div>
                  <div className="flex-1">
                    <div className="h-5 w-3/4 bg-slate-300 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
                  </div>
                  <div className="h-6 w-20 bg-slate-300 rounded"></div>
                </div>
              ))}
            </div>

            {/* Timeline skeleton */}
            <div className="bg-white/60 rounded-2xl p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-slate-300 rounded-xl mr-4"></div>
                <div>
                  <div className="h-6 w-48 bg-slate-300 rounded mb-2"></div>
                  <div className="h-4 w-64 bg-slate-200 rounded"></div>
                </div>
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex mb-6">
                  <div className="w-8 h-8 bg-slate-300 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <div className="h-5 w-40 bg-slate-300 rounded mb-2"></div>
                    <div className="h-4 w-64 bg-slate-200 rounded mb-1"></div>
                    <div className="h-3 w-24 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/60 rounded-2xl p-6">
                <div className="h-6 w-40 bg-slate-300 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-slate-200 rounded"></div>
                  <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                  <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;