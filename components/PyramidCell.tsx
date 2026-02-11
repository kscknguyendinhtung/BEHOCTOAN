
import React, { useEffect, useState } from 'react';

interface PyramidCellProps {
  value: number;
  isVisible: boolean;
  userInput: number | null;
  onInput: (val: number) => void;
  status?: 'correct' | 'wrong' | 'none';
}

const PyramidCell: React.FC<PyramidCellProps> = ({ value, isVisible, userInput, onInput, status }) => {
  const [isChanging, setIsChanging] = useState(false);
  const displayValue = isVisible ? value : (userInput || 0);

  useEffect(() => {
    if (!isVisible && userInput !== null) {
      setIsChanging(true);
      const timer = setTimeout(() => setIsChanging(false), 150);
      return () => clearTimeout(timer);
    }
  }, [userInput, isVisible]);

  const renderDots = (count: number) => {
    if (count <= 0) return <div className="h-4"></div>;
    const maxDots = 20;
    const dotCount = Math.min(count, maxDots);
    
    return (
      <div className={`flex flex-wrap gap-0.5 justify-center mt-2 w-full px-1 overflow-hidden transition-transform duration-150 ${isChanging ? 'scale-110' : 'scale-100'}`}>
        {Array.from({ length: dotCount }).map((_, i) => (
          <div 
            key={i} 
            className={`w-1.5 h-1.5 rounded-full shadow-sm ${
              isVisible ? 'bg-orange-400' : 'bg-blue-500'
            } border border-white/30`}
          ></div>
        ))}
      </div>
    );
  };

  const baseClasses = "w-20 h-32 xs:w-24 xs:h-36 rounded-[28px] flex flex-col items-center justify-start pt-3 transition-all duration-300 shadow-xl border-[4px] relative";
  
  const getColors = () => {
    if (isVisible) return 'bg-yellow-50 border-yellow-300 text-yellow-700';
    if (status === 'correct') return 'bg-green-100 border-green-500 text-green-700 scale-105 z-20 shadow-green-200';
    if (status === 'wrong') return 'bg-red-50 border-red-300 text-red-600 animate-shake';
    return 'bg-white border-blue-200 text-blue-600';
  };

  const handleAdjust = (delta: number) => {
    const current = userInput === null ? 0 : userInput;
    onInput(Math.max(0, current + delta));
  };

  return (
    <div className={`${baseClasses} ${getColors()}`}>
      <span className={`text-3xl xs:text-4xl font-black transition-transform ${isChanging ? 'scale-125' : ''}`}>
        {isVisible ? value : (userInput === null ? '?' : userInput)}
      </span>
      
      {renderDots(displayValue)}
      
      {!isVisible && status !== 'correct' && (
        <div className="absolute -bottom-14 left-[-10px] right-[-10px] flex justify-between z-30">
          <button 
            onClick={(e) => { e.stopPropagation(); handleAdjust(-1); }}
            className="w-12 h-12 bg-rose-500 text-white rounded-2xl font-black text-2xl shadow-lg active:scale-90 flex items-center justify-center border-b-4 border-rose-800"
          >
            -
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleAdjust(1); }}
            className="w-12 h-12 bg-emerald-500 text-white rounded-2xl font-black text-2xl shadow-lg active:scale-90 flex items-center justify-center border-b-4 border-emerald-800"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

export default PyramidCell;
