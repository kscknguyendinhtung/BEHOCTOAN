
import React from 'react';

interface StarProgressProps {
  stars: number;
}

const StarProgress: React.FC<StarProgressProps> = ({ stars }) => {
  return (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full border-2 border-yellow-400 shadow-lg">
      <span className="text-2xl">⭐</span>
      <span className="text-xl font-bold text-yellow-600">{stars}</span>
    </div>
  );
};

export default StarProgress;
