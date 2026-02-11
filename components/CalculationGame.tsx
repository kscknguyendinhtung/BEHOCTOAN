
import React, { useState, useEffect } from 'react';
import { CalculationQuiz } from '../types';
import { getCheer } from '../services/geminiService';

interface CalculationGameProps {
  onBack: () => void;
  onWin: (stars: number) => void;
  startLevel?: number;
}

type GameModeConfig = {
  operator: '+' | '-';
  max: 10 | 20;
  label: string;
};

// --- SVG COMPONENTS CHO BÀN TAY VÀ BÀN CHÂN ---

const HandSVG: React.FC<{ fingers: number; color: string }> = ({ fingers, color }) => {
  // Màu da
  const skinColor = "#fca5a5"; // Rose-300
  const strokeColor = "#be123c"; // Rose-700
  
  // Tọa độ và góc xoay cho 5 ngón tay (ngón cái -> ngón út)
  const fingerPositions = [
    { x: 25, y: 50, rotate: -40, h: 25 }, // Thumb
    { x: 40, y: 25, rotate: -10, h: 32 }, // Index
    { x: 60, y: 20, rotate: 0,   h: 35 }, // Middle
    { x: 80, y: 25, rotate: 10,  h: 32 }, // Ring
    { x: 95, y: 45, rotate: 30,  h: 25 }, // Pinky
  ];

  // Logic hiển thị ngón tay:
  // 1: Ngón trỏ
  // 2: Trỏ + Giữa
  // 3: Trỏ + Giữa + Áp út
  // 4: Trỏ + Giữa + Áp + Út (Tất cả trừ ngón cái)
  // 5: Cả bàn
  
  const showFinger = (index: number) => {
    if (fingers === 0) return false;
    if (fingers === 5) return true;
    
    // Mapping ngón nào hiện lên với số lượng < 5
    // Index trong mảng: 0(Cái), 1(Trỏ), 2(Giữa), 3(Áp), 4(Út)
    if (fingers === 1) return index === 1; 
    if (fingers === 2) return index === 1 || index === 2;
    if (fingers === 3) return index === 1 || index === 2 || index === 3;
    if (fingers === 4) return index !== 0; // Hiện tất cả trừ ngón cái
    return false;
  };

  return (
    <svg width="80" height="80" viewBox="0 0 120 120" className="drop-shadow-sm transition-transform hover:scale-110">
      {/* Lòng bàn tay */}
      <circle cx="60" cy="80" r="30" fill={skinColor} stroke={strokeColor} strokeWidth="3" />
      
      {/* Vẽ các ngón tay */}
      {fingerPositions.map((pos, idx) => (
        <g key={idx} transform={`rotate(${pos.rotate}, ${pos.x}, ${pos.y + pos.h})`}>
          {/* Nếu ngón tay được giơ lên */}
          {showFinger(idx) ? (
            <rect 
              x={pos.x} y={pos.y} width="16" height={pos.h} rx="8" 
              fill={skinColor} stroke={strokeColor} strokeWidth="3" 
            />
          ) : (
             // Ngón tay cụp xuống - đốt ngón tay
             <circle cx={pos.x + 5} cy={80 - (idx === 0 ? 10 : 20)} r="7" fill="#f43f5e" opacity="0.3" />
          )}
        </g>
      ))}
      
      {/* Số đếm ở giữa lòng bàn tay */}
      <text x="60" y="90" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold" style={{textShadow: '1px 1px 0 #be123c'}}>
        {fingers}
      </text>
    </svg>
  );
};

const FootSVG: React.FC<{ toes: number }> = ({ toes }) => {
  const skinColor = "#fcd34d"; // Amber-300
  const strokeColor = "#b45309"; // Amber-700

  return (
    <svg width="80" height="80" viewBox="0 0 120 120" className="drop-shadow-sm transition-transform hover:scale-110">
      {/* Bàn chân (dáng củ đậu) */}
      <path 
        d="M 40,40 C 20,40 20,100 50,110 C 90,120 100,90 100,60 C 100,30 60,30 40,40 Z" 
        fill={skinColor} stroke={strokeColor} strokeWidth="3" 
      />
      
      {/* Các ngón chân */}
      {[0, 1, 2, 3, 4].map((i) => {
        const isActive = i < toes; 
        const xBase = 35 + i * 14;
        const yBase = 35 + Math.abs(i - 2) * 3; 
        
        return isActive ? (
           <circle key={i} cx={xBase} cy={yBase} r={6 + (i===0?2:0)} fill={skinColor} stroke={strokeColor} strokeWidth="2" />
        ) : null;
      })}

      <text x="60" y="85" textAnchor="middle" fill={strokeColor} fontSize="24" fontWeight="bold">
        {toes}
      </text>
    </svg>
  );
};

// --- LOGIC HELPER ---

// Tính số lượng bàn tay đã bị "chiếm dụng" bởi một con số
const calculateHandsUsed = (num: number): number => {
  if (num === 0) return 0;
  if (num <= 5) return 1;
  return 2; // Số > 5 chiếm 2 bàn tay (5 + phần dư)
};

// Component hiển thị bộ phận cơ thể dựa trên số lượng và số tay đã dùng trước đó
const VisualBodyParts: React.FC<{ count: number; previousHandsUsed: number }> = ({ count, previousHandsUsed }) => {
  const parts: { type: 'hand' | 'foot', val: number }[] = [];
  
  let remaining = count;
  let currentHandsUsed = previousHandsUsed;
  const MAX_HANDS = 2; // Giới hạn logic: chỉ có 2 bàn tay tối đa trên màn hình

  // 1. Ưu tiên xếp vào Bàn Tay nếu còn chỗ (currentHandsUsed < 2)
  while (remaining > 0 && currentHandsUsed < MAX_HANDS) {
    // Nếu số còn lại >= 5, ta ưu tiên lấp đầy 1 bàn tay (5 ngón)
    // Nếu < 5, ta hiển thị số lẻ đó trên 1 bàn tay
    const amount = remaining >= 5 ? 5 : remaining;
    
    parts.push({ type: 'hand', val: amount });
    remaining -= amount;
    currentHandsUsed++;
  }

  // 2. Nếu vẫn còn dư (hết tay hoặc số quá lớn), chuyển sang Bàn Chân
  while (remaining > 0) {
    const amount = remaining >= 5 ? 5 : remaining;
    parts.push({ type: 'foot', val: amount });
    remaining -= amount;
  }
  
  // Trường hợp đặc biệt: Số 0
  if (count === 0 && parts.length === 0) {
     // Nếu chưa dùng tay nào thì hiện tay 0, nếu hết tay rồi thì thôi (hoặc hiện tay 0 đè logic)
     // Thường số 0 đứng đầu thì hiện tay nắm đấm
     if (currentHandsUsed < MAX_HANDS) {
         parts.push({ type: 'hand', val: 0 });
     }
  }

  return (
    <div className="flex flex-wrap justify-center items-end gap-1 px-1">
      {parts.map((part, idx) => (
          <div key={idx} className="animate-bounce-slow" style={{ animationDelay: `${idx * 0.1}s` }}>
              {part.type === 'hand' ? (
                  <HandSVG fingers={part.val} color="rose" />
              ) : (
                  <FootSVG toes={part.val} />
              )}
          </div>
      ))}
    </div>
  );
};

// --- GAME COMPONENT ---

const CalculationGame: React.FC<CalculationGameProps> = ({ onBack, onWin }) => {
  const [mode, setMode] = useState<GameModeConfig | null>(null);
  const [quiz, setQuiz] = useState<CalculationQuiz | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const generateQuiz = () => {
    if (!mode) return;
    
    let num1, num2, answer;
    
    // Logic cộng
    if (mode.operator === '+') {
      if (mode.max === 10) {
        answer = Math.floor(Math.random() * 9) + 2; 
        num1 = Math.floor(Math.random() * (answer - 1)) + 1;
        num2 = answer - num1;
      } else {
        // Cộng tới 20
        answer = Math.floor(Math.random() * 10) + 11;
        num1 = Math.floor(Math.random() * 9) + 1 + (Math.random() > 0.5 ? 5 : 0);
        if (num1 > answer) num1 = answer - 1;
        num2 = answer - num1;
      }
    } 
    // Logic trừ
    else {
      num1 = Math.floor(Math.random() * 9) + 2; 
      num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
      answer = num1 - num2;
    }

    const options = new Set<number>([answer]);
    while (options.size < 4) {
      let wrong;
      if (mode.max === 10) wrong = Math.floor(Math.random() * 11);
      else wrong = Math.floor(Math.random() * 21);
      
      if (wrong !== answer && wrong >= 0 && wrong <= mode.max) {
        options.add(wrong);
      }
    }

    setQuiz({
      num1, num2, operator: mode.operator, answer,
      options: Array.from(options).sort((a, b) => a - b)
    });
    setFeedback('');
    setIsCorrect(null);
  };

  useEffect(() => {
    if (mode) generateQuiz();
  }, [mode]);

  const handleChoice = async (choice: number) => {
    if (!quiz || isCorrect !== null) return;
    if (choice === quiz.answer) {
      setIsCorrect(true);
      setFeedback(await getCheer(true));
      onWin(10);
      setTimeout(() => generateQuiz(), 2000);
    } else {
      setIsCorrect(false);
      setFeedback(await getCheer(false));
      setTimeout(() => setIsCorrect(null), 1200);
    }
  };

  if (!mode) {
    return (
      <div className="w-full flex flex-col items-center animate-fadeIn px-4 pb-10 pt-4">
         <div className="bg-white/95 p-6 rounded-[32px] shadow-xl border-4 border-rose-400 text-center w-full mb-6 relative">
          <button onClick={onBack} className="absolute left-4 top-4 bg-gray-100 w-10 h-10 flex items-center justify-center rounded-full text-xl">🏠</button>
          <h2 className="text-2xl font-black text-rose-600 uppercase mb-2 mt-2">Đếm Ngón Tay 🖐️</h2>
          <p className="text-gray-500 font-bold text-sm italic">"Bé chọn cách tính nhé!"</p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={() => setMode({ operator: '+', max: 10, label: 'Cộng đến 10' })}
            className="flex items-center p-4 bg-white rounded-[24px] border-b-4 border-rose-300 shadow-lg active:scale-95 transition-all group"
          >
            <div className="w-16 h-16 mr-4"><HandSVG fingers={5} color="rose" /></div>
            <div className="text-left">
              <div className="font-black text-rose-600 text-lg uppercase">Cộng đến 10</div>
              <div className="text-xs text-rose-400 font-bold">Dùng ngón tay</div>
            </div>
          </button>

          <button 
            onClick={() => setMode({ operator: '-', max: 10, label: 'Trừ trong 10' })}
            className="flex items-center p-4 bg-white rounded-[24px] border-b-4 border-blue-300 shadow-lg active:scale-95 transition-all group"
          >
             <div className="w-16 h-16 mr-4"><HandSVG fingers={2} color="blue" /></div>
            <div className="text-left">
              <div className="font-black text-blue-600 text-lg uppercase">Trừ trong 10</div>
              <div className="text-xs text-blue-400 font-bold">Dùng ngón tay</div>
            </div>
          </button>

          <button 
            onClick={() => setMode({ operator: '+', max: 20, label: 'Cộng đến 20' })}
            className="flex items-center p-4 bg-white rounded-[24px] border-b-4 border-purple-300 shadow-lg active:scale-95 transition-all group"
          >
             <div className="w-16 h-16 mr-4 flex"><FootSVG toes={5} /></div>
            <div className="text-left">
              <div className="font-black text-purple-600 text-lg uppercase">Cộng đến 20</div>
              <div className="text-xs text-purple-400 font-bold">Tay & Chân</div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  // Tính toán số lượng tay đã dùng cho Num1 để truyền vào Num2
  const handsUsedByNum1 = calculateHandsUsed(quiz.num1);

  return (
    <div className="w-full flex flex-col items-center animate-fadeIn px-2 pb-10">
      <div className="bg-white/95 p-3 rounded-[24px] shadow-sm border-2 border-rose-400 mb-4 text-center w-full relative flex items-center justify-center">
        <button onClick={() => setMode(null)} className="absolute left-3 bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full text-sm">🔙</button>
        <div>
          <h2 className="text-lg font-black text-rose-600 uppercase">{mode.label}</h2>
        </div>
      </div>

      <div className="bg-white p-3 py-6 rounded-[32px] shadow-md border-2 border-rose-50 w-full flex flex-col items-center">
        
        {/* PHẦN HIỂN THỊ PHÉP TÍNH */}
        <div className="flex flex-col gap-4 w-full mb-4 px-1 bg-rose-50/30 p-4 rounded-3xl min-h-[220px]">
          
          <div className="flex items-start justify-around w-full">
            {/* SỐ 1 */}
            <div className="flex flex-col items-center w-5/12">
                <div className="text-5xl font-black text-slate-700 mb-2">{quiz.num1}</div>
                {/* Số thứ nhất luôn bắt đầu với 0 tay đã dùng */}
                <VisualBodyParts count={quiz.num1} previousHandsUsed={0} />
            </div>

            {/* DẤU */}
            <div className="flex flex-col items-center justify-start pt-8 w-2/12">
                 <div className="text-4xl font-black text-white bg-rose-400 w-10 h-10 rounded-full flex items-center justify-center shadow-sm">{quiz.operator}</div>
            </div>

            {/* SỐ 2 */}
            <div className="flex flex-col items-center w-5/12">
                <div className="text-5xl font-black text-slate-700 mb-2">{quiz.num2}</div>
                {/* Số thứ hai nhận vào số tay đã bị số 1 chiếm dụng */}
                <VisualBodyParts count={quiz.num2} previousHandsUsed={handsUsedByNum1} />
            </div>
          </div>

          <div className="w-full h-1 bg-rose-200 rounded-full my-4 opacity-50"></div>

          <div className="flex items-center justify-center gap-4">
             <div className="text-4xl font-black text-slate-400">=</div>
             <div className="w-20 h-20 bg-white rounded-2xl border-4 border-dashed border-rose-300 flex items-center justify-center text-3xl font-black text-rose-200 animate-pulse">?</div>
          </div>
        </div>

        {/* CÁC NÚT CHỌN ĐÁP ÁN */}
        <div className="grid grid-cols-2 gap-3 w-full px-2">
          {quiz.options.map((opt) => (
            <button 
              key={opt} 
              onClick={() => handleChoice(opt)} 
              disabled={isCorrect !== null} 
              className={`py-4 rounded-2xl text-4xl font-black transition-all shadow-sm active:scale-95 flex flex-col items-center justify-center gap-1
                ${isCorrect === true && opt === quiz.answer 
                  ? 'bg-green-500 text-white border-b-4 border-green-700 shadow-green-200 scale-105' 
                  : 'bg-white border-b-4 border-rose-100 text-rose-500 active:border-rose-400 hover:bg-rose-50'}`}
            >
              <span>{opt}</span>
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className="mt-4 p-3 rounded-2xl bg-white border-2 border-rose-400 text-rose-600 font-black text-sm animate-bounce shadow-md text-center">
          {feedback}
        </div>
      )}
    </div>
  );
};

export default CalculationGame;
