import React from 'react';

export const FloatingSparkles: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-5 overflow-hidden">
      {/* Background floating sparkles */}
      <div className="absolute top-20 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-40"></div>
      <div className="absolute top-40 right-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-pulse opacity-60"></div>
      <div className="absolute top-60 left-1/6 w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce opacity-50"></div>
      <div className="absolute bottom-40 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-ping opacity-40"></div>
      <div className="absolute bottom-60 left-1/3 w-2 h-2 bg-green-300 rounded-full animate-pulse opacity-50"></div>
      <div className="absolute top-1/3 right-1/6 w-1 h-1 bg-purple-300 rounded-full animate-bounce opacity-60"></div>
      
      {/* Corner mystical effects */}
      <div className="absolute top-8 left-8 w-4 h-4 border border-purple-400 rounded-full animate-spin opacity-30"></div>
      <div className="absolute top-8 right-8 w-3 h-3 border border-yellow-400 rounded-full animate-spin opacity-40 delay-75"></div>
      <div className="absolute bottom-8 left-8 w-5 h-5 border border-pink-400 rounded-full animate-spin opacity-20 delay-150"></div>
      <div className="absolute bottom-8 right-8 w-3 h-3 border border-blue-400 rounded-full animate-spin opacity-35 delay-200"></div>
    </div>
  );
};