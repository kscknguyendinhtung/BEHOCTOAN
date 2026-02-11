
import React from 'react';

interface CrocodileMouthProps {
  type: '<' | '>' | '=';
  isActive: boolean;
}

const CrocodileMouth: React.FC<CrocodileMouthProps> = ({ type, isActive }) => {
  if (!isActive) return <div className="w-[80px] h-[50px] bg-gray-50 rounded-full border-2 border-dashed border-gray-200"></div>;

  if (type === '=') {
    return (
      <div className="flex flex-col gap-2 scale-[1.2]">
        <div className="w-10 h-2.5 bg-gradient-to-b from-[#60e2d3] via-[#b7fdf5] to-[#60e2d3] rounded-sm shadow-sm border border-[#a0fcf0]"></div>
        <div className="w-10 h-2.5 bg-gradient-to-b from-[#60e2d3] via-[#b7fdf5] to-[#60e2d3] rounded-sm shadow-sm border border-[#a0fcf0]"></div>
      </div>
    );
  }

  return (
    <div className="relative w-[140px] h-[80px] flex items-center justify-center scale-[0.8]">
      <svg width="220" height="120" viewBox="0 0 220 120" className="overflow-visible">
        <g transform={type === '<' ? "translate(220, 0) scale(-1, 1)" : ""}>
          <path 
            d="M 180,60 C 180,20 140,5 100,10 C 80,10 60,15 45,25 L 185,60 L 45,95 C 60,105 80,110 100,110 C 140,115 180,100 180,60 Z" 
            fill="#79b933" stroke="#3f6212" strokeWidth="1.5"
          />
          <circle cx="110" cy="12" r="10" fill="#79b933" stroke="#3f6212" strokeWidth="1" />
          <circle cx="135" cy="15" r="11" fill="#79b933" stroke="#3f6212" strokeWidth="1" />
          <circle cx="160" cy="25" r="10" fill="#79b933" stroke="#3f6212" strokeWidth="1" />
          <circle cx="120" cy="28" r="7" fill="white" stroke="#000" strokeWidth="0.5" />
          <circle cx="123" cy="28" r="3" fill="black" />
          <circle cx="145" cy="30" r="7" fill="white" stroke="#000" strokeWidth="0.5" />
          <circle cx="148" cy="30" r="3" fill="black" />
          <path d="M 60,35 L 65,42 L 75,38 L 80,45 L 90,41 L 95,48 L 105,44 L 110,51" fill="white" />
          <path d="M 60,85 L 65,78 L 75,82 L 80,75 L 90,79 L 95,72 L 105,76 L 110,69" fill="white" />
          <path d="M 185,60 L 40,30" fill="none" stroke="#b91c1c" strokeWidth="10" strokeLinecap="round" />
          <path d="M 185,60 L 40,95" fill="none" stroke="#b91c1c" strokeWidth="10" strokeLinecap="round" />
          <circle cx="185" cy="60" r="5" fill="#b91c1c" />
        </g>
      </svg>
    </div>
  );
};

export default CrocodileMouth;
