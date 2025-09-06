import React from 'react';

export const WitchCharacter: React.FC<{ position: 'left' | 'right' }> = ({ position }) => {
  const isLeft = position === 'left';
  
  return (
    <div className={`fixed ${isLeft ? 'left-4' : 'right-4'} top-1/3 z-10 pointer-events-none animate-bounce`}>
      <div className="relative">
        {/* Witch Hat */}
        <div className="w-8 h-12 bg-gradient-to-b from-purple-800 to-purple-900 rounded-t-full relative mb-2 mx-auto">
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-1 w-12 h-3 bg-purple-700 rounded-full -left-2"></div>
        </div>
        
        {/* Witch Face */}
        <div className="w-10 h-10 bg-green-200 rounded-full relative mx-auto">
          {/* Eyes */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-black rounded-full"></div>
          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-black rounded-full"></div>
          {/* Nose */}
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-green-300 rounded-sm rotate-12"></div>
          {/* Mouth */}
          <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-purple-600 rounded-full"></div>
        </div>
        
        {/* Witch Body */}
        <div className="w-12 h-16 bg-gradient-to-b from-purple-700 to-purple-800 rounded-b-lg mx-auto mt-1 relative">
          {/* Arms */}
          <div className="absolute -left-2 top-3 w-4 h-2 bg-green-200 rounded-full rotate-12"></div>
          <div className="absolute -right-2 top-3 w-4 h-2 bg-green-200 rounded-full -rotate-12"></div>
          {/* Dress pattern */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-purple-600 rounded-full"></div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-purple-600 rounded-full"></div>
        </div>
        
        {/* Magic Sparkles */}
        <div className={`absolute ${isLeft ? '-right-8' : '-left-8'} top-0 space-y-2`}>
          <div className="w-1 h-1 bg-yellow-300 rounded-full animate-ping"></div>
          <div className="w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-pink-300 rounded-full animate-ping delay-100"></div>
        </div>
      </div>
    </div>
  );
};

export const ChickenNuggetCharacter: React.FC<{ position: 'corner' | 'side' }> = ({ position }) => {
  const isCorner = position === 'corner';
  
  return (
    <div className={`fixed ${isCorner ? 'bottom-4 left-4' : 'bottom-1/4 right-8'} z-10 pointer-events-none`}>
      <div className="relative animate-pulse">
        {/* Nugget Body */}
        <div className="w-14 h-10 bg-gradient-to-br from-yellow-600 via-orange-500 to-yellow-700 rounded-2xl relative shadow-lg">
          {/* Crispy texture bumps */}
          <div className="absolute top-1 left-2 w-2 h-2 bg-yellow-500 rounded-full"></div>
          <div className="absolute top-3 right-2 w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
          <div className="absolute bottom-2 left-3 w-1 h-1 bg-yellow-400 rounded-full"></div>
          <div className="absolute bottom-1 right-3 w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
          
          {/* Eyes */}
          <div className="absolute top-2 left-4 w-2 h-2 bg-black rounded-full">
            <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full"></div>
          </div>
          <div className="absolute top-2 right-4 w-2 h-2 bg-black rounded-full">
            <div className="absolute top-0 right-0 w-0.5 h-0.5 bg-white rounded-full"></div>
          </div>
          
          {/* Beak */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-orange-600 rounded-sm"></div>
          
          {/* Smile */}
          <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-orange-700 rounded-full"></div>
        </div>
        
        {/* Tiny wings */}
        <div className="absolute -left-1 top-3 w-3 h-4 bg-yellow-500 rounded-l-full opacity-80"></div>
        <div className="absolute -right-1 top-3 w-3 h-4 bg-yellow-500 rounded-r-full opacity-80"></div>
        
        {/* Crumbs */}
        <div className={`absolute ${isCorner ? '-top-3 left-8' : '-top-2 -left-4'} space-x-1 space-y-1`}>
          <div className="w-1 h-1 bg-yellow-600 rounded-full inline-block animate-bounce"></div>
          <div className="w-0.5 h-0.5 bg-orange-500 rounded-full inline-block animate-bounce delay-75"></div>
          <div className="w-1 h-1 bg-yellow-500 rounded-full inline-block animate-bounce delay-150"></div>
        </div>
      </div>
    </div>
  );
};