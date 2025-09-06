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
  
  // Use different characters for different positions
  const characterImage = isCorner 
    ? '/lovable-uploads/bf92ac89-4f90-4ead-bb49-152b90e4af8a.png' // Bunny character
    : '/lovable-uploads/7f74ba46-da6e-4373-b5d5-4750cf7fe854.png'; // Yellow chick character
  
  return (
    <div className={`fixed ${isCorner ? 'bottom-4 left-4' : 'bottom-1/4 right-8'} z-10 pointer-events-none`}>
      <div className="relative animate-bounce">
        {/* Chikn Nuggit Character */}
        <img 
          src={characterImage}
          alt="Chikn Nuggit Character"
          className="w-20 h-20 object-contain drop-shadow-lg"
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
        
        {/* Floating hearts/sparkles around characters */}
        <div className={`absolute ${isCorner ? '-top-3 left-8' : '-top-2 -left-4'} space-x-1 space-y-1`}>
          <div className="w-2 h-2 text-pink-400 animate-pulse inline-block">💫</div>
          <div className="w-2 h-2 text-yellow-400 animate-bounce delay-75 inline-block">✨</div>
          <div className="w-2 h-2 text-purple-400 animate-ping delay-150 inline-block">💖</div>
        </div>
      </div>
    </div>
  );
};