
import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-200 rounded-full blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-blue-200 rounded-full blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pink-200 rounded-full blur-3xl opacity-30"></div>
      
      {/* Floating math symbols */}
      <div className="absolute top-20 right-1/4 text-4xl text-blue-300 opacity-20 animate-bounce-slow font-bold">+</div>
      <div className="absolute bottom-1/4 left-10 text-4xl text-green-300 opacity-20 animate-bounce font-bold">123</div>
      <div className="absolute top-1/3 right-10 text-4xl text-purple-300 opacity-20 animate-pulse font-bold">△</div>
      <div className="absolute bottom-10 left-1/3 text-4xl text-orange-300 opacity-20 animate-bounce-slow font-bold">O</div>
    </div>
  );
};

export default Background;
