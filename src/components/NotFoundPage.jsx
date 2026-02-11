import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);

  useEffect(() => {
    // Trigger animation on mount
    setIsVisible(true);
    
    // Create a pulsing animation for the 404 text
    const pulseInterval = setInterval(() => {
      setPulseCount(prev => (prev + 1) % 4);
    }, 1500);

    return () => clearInterval(pulseInterval);
  }, []);

  const handleGoToDashboard = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-[#222831] text-[#EEEEEE] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Moving gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-linear-to-r from-[#00ADB5]/10 to-transparent rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-linear-to-l from-[#00ADB5]/5 to-transparent rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(to right, #393E46 1px, transparent 1px),
                           linear-gradient(to bottom, #393E46 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#00ADB5] rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      <div className="container mx-auto max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-12 relative z-10">
        
        {/* Left Column - Animated Illustration */}
        <div className={`flex-1 max-w-lg transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
          <div className="relative">
            {/* Main 404 with advanced animations */}
            <div className="relative p-8">
              {/* Animated 404 text */}
              <div className="relative">
                {/* Glow effect behind numbers */}
                <div className="absolute inset-0 bg-linear-to-r from-[#00ADB5]/20 via-transparent to-[#00ADB5]/20 blur-2xl animate-pulse"></div>
                
                {/* Main 404 numbers with individual animations */}
                <div className="flex justify-center items-center space-x-2 md:space-x-4">
                  <div className={`relative transition-all duration-500 ${pulseCount === 0 ? 'scale-110' : 'scale-100'}`}>
                    <div className="text-8xl md:text-9xl font-bold text-[#00ADB5] drop-shadow-lg animate-bounce" style={{ animationDelay: '0.1s' }}>
                      4
                    </div>
                    <div className="absolute -inset-2 bg-[#00ADB5]/20 rounded-full blur-md animate-ping"></div>
                  </div>
                  
                  <div className={`relative transition-all duration-500 ${pulseCount === 1 ? 'scale-110' : 'scale-100'}`}>
                    <div className="text-8xl md:text-9xl font-bold text-[#EEEEEE] drop-shadow-lg animate-bounce" style={{ animationDelay: '0.2s' }}>
                      0
                    </div>
                    <div className="absolute -inset-2 bg-[#EEEEEE]/10 rounded-full blur-md animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                  
                  <div className={`relative transition-all duration-500 ${pulseCount === 2 ? 'scale-110' : 'scale-100'}`}>
                    <div className="text-8xl md:text-9xl font-bold text-[#00ADB5] drop-shadow-lg animate-bounce" style={{ animationDelay: '0.3s' }}>
                      4
                    </div>
                    <div className="absolute -inset-2 bg-[#00ADB5]/20 rounded-full blur-md animate-ping" style={{ animationDelay: '1s' }}></div>
                  </div>
                </div>
                
                {/* Floating elements around 404 */}
                <div className="absolute -top-4 -left-4 w-6 h-6 bg-[#00ADB5] rounded-full animate-bounce"></div>
                <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-[#EEEEEE] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute top-1/2 -right-8 w-4 h-4 bg-[#00ADB5] rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
                <div className="absolute bottom-1/2 -left-8 w-5 h-5 bg-[#EEEEEE] rounded-full animate-bounce" style={{ animationDelay: '0.9s' }}></div>
              </div>
              
              {/* Animated connecting lines */}
              <div className="relative mt-12">
                <svg className="w-full h-20" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M20,50 Q100,10 180,50 T340,50"
                    stroke="#00ADB5"
                    strokeWidth="2"
                    fill="none"
                    className="animate-dash"
                  />
                  <circle cx="20" cy="50" r="4" fill="#00ADB5" className="animate-pulse">
                    <animate attributeName="r" values="4;8;4" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="180" cy="50" r="4" fill="#EEEEEE" className="animate-pulse" style={{ animationDelay: '0.5s' }}>
                    <animate attributeName="r" values="4;8;4" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="340" cy="50" r="4" fill="#00ADB5" className="animate-pulse" style={{ animationDelay: '1s' }}>
                    <animate attributeName="r" values="4;8;4" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className={`flex-1 max-w-lg text-center lg:text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
          <div className="space-y-8">
            {/* Animated Title */}
            <div className="overflow-hidden">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-[#EEEEEE] animate-slide-in">
                Page Not Found
              </h2>
              
              {/* Description with typewriter effect */}
              <div className="overflow-hidden">
                <p className="text-lg lg:text-xl text-[#EEEEEE]/80 leading-relaxed animate-typewriter">
                  Oops! The page you're looking for doesn't exist or has been moved.
                </p>
              </div>
            </div>

            {/* Animated Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <button
                onClick={handleGoToDashboard}
                className="group relative px-8 py-4 bg-linear-to-r from-[#00ADB5] to-[#00ADB5]/90 text-[#222831] font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#00ADB5]/40"
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {/* Ripple effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 animate-ripple"></div>
                </div>
                
                <span className="relative flex items-center justify-center gap-3">
                  <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  Go to Home
                </span>
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="group relative px-8 py-4 border-2 border-[#393E46] text-[#EEEEEE] font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:border-[#00ADB5] hover:scale-105 hover:shadow-lg hover:shadow-[#00ADB5]/20"
              >
                {/* Border animation */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#00ADB5] rounded-lg transition-all duration-300"></div>
                
                <span className="relative flex items-center justify-center gap-3">
                  <svg className="w-6 h-6 transition-transform group-hover:-translate-x-1 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Go Back
                </span>
              </button>
            </div>

            {/* Animated Help Text */}
            <div className="pt-8 border-t border-[#393E46] animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="w-3 h-3 bg-[#00ADB5] rounded-full animate-pulse"></div>
                <p className="text-[#EEEEEE]/60 text-sm">
                  If you believe this is an error, please contact support or try searching for what you need.
                </p>
              </div>
              
              {/* Search suggestion with animation */}
              <div className="mt-4 animate-shake" style={{ animationDelay: '2s' }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#393E46]/50 rounded-full">
                  <svg className="w-4 h-4 text-[#00ADB5]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  <span className="text-xs text-[#EEEEEE]/70">Try searching instead</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;