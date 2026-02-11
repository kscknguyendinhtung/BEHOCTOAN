
import React, { useState, useEffect } from 'react';
import { getCheer } from '../services/geminiService';

interface PatternGameProps {
  onBack: () => void;
  onWin: (stars: number) => void;
  startLevel?: number;
}

const ITEMS = [
  { id: '1', icon: '🍓' }, { id: '2', icon: '🍌' }, { id: '3', icon: '🍎' },
  { id: '4', icon: '🍇' }, { id: '5', icon: '🦁' }, { id: '6', icon: '🐯' },
  { id: '7', icon: '🐱' }, { id: '8', icon: '🐶' }, { id: '9', icon: '🥕' },
  { id: '10', icon: '🍦' }, { id: '11', icon: '⚽' }, { id: '12', icon: '🎈' },
  { id: '13', icon: '🚗' }, { id: '14', icon: '🧸' }, { id: '15', icon: '🚀' }
];

const PatternGame: React.FC<PatternGameProps> = ({ onBack, onWin, startLevel = 1 }) => {
  const [level, setLevel] = useState(startLevel);
  const [pattern, setPattern] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [missingIndex, setMissingIndex] = useState(0);

  const generateLevel = (lvl: number) => {
    setFeedback('');
    setIsCorrect(null);

    const shuffled = [...ITEMS].sort(() => Math.random() - 0.5);
    const [A, B, C, D] = shuffled;

    let fullPattern: any[] = [];
    
    // Pattern logic
    if (lvl <= 10) {
      fullPattern = [A, B, A, B, A, B];
    } else if (lvl <= 20) {
      fullPattern = [A, A, B, A, A, B];
    } else if (lvl <= 30) {
      fullPattern = [A, B, C, A, B, C];
    } else {
      fullPattern = [A, B, B, A, B, B];
    }

    const mIdx = lvl < 5 ? fullPattern.length - 1 : Math.floor(Math.random() * (fullPattern.length - 1)) + 1;
    setMissingIndex(mIdx);
    setPattern(fullPattern);

    const correct = fullPattern[mIdx];
    const wrongs = ITEMS.filter(i => i.id !== correct.id).sort(() => Math.random() - 0.5).slice(0, 3);
    setOptions([correct, ...wrongs].sort(() => Math.random() - 0.5));
  };

  useEffect(() => { generateLevel(level); }, [level]);

  const handleChoice = async (choice: any) => {
    if (isCorrect !== null) return;
    if (choice.id === pattern[missingIndex].id) {
      setIsCorrect(true);
      setFeedback(await getCheer(true));
      onWin(10);
      setTimeout(() => {
        if (level < 50) setLevel(prev => prev + 1);
        else onBack();
      }, 2500);
    } else {
      setIsCorrect(false);
      setFeedback(await getCheer(false));
      setTimeout(() => setIsCorrect(null), 1500);
    }
  };

  return (
    <div className="w-full flex flex-col items-center animate-fadeIn px-2 pb-10">
      <div className="bg-white/95 p-3 rounded-[24px] shadow-sm border-2 border-pink-400 mb-4 text-center w-full relative">
        <button onClick={onBack} className="absolute left-3 top-3 bg-gray-100 w-7 h-7 flex items-center justify-center rounded-full">🏠</button>
        <h2 className="text-lg font-black text-pink-600 uppercase">Quy Luật Kỳ Thú</h2>
        <p className="text-gray-400 font-bold text-[10px]">Cấp độ {level} / 50</p>
      </div>

      <div className="bg-white p-4 py-8 rounded-[32px] shadow border-2 border-pink-50 w-full flex flex-col items-center gap-8 overflow-hidden">
        {/* HÀNG QUY LUẬT - LUÔN TRÊN 1 HÀNG */}
        <div className="flex justify-center items-center gap-1.5 w-full overflow-x-auto no-scrollbar py-2">
          {pattern.map((item, idx) => (
            <div key={idx} className={`flex-shrink-0 w-11 h-11 xs:w-14 xs:h-14 rounded-xl border-2 flex items-center justify-center text-2xl xs:text-3xl shadow-sm transition-all
              ${idx === missingIndex ? (isCorrect ? 'border-green-400 bg-green-50 scale-110 shadow-green-100' : 'border-dashed border-pink-300 bg-pink-50 animate-pulse') : 'border-slate-50 bg-slate-50/30'}
            `}>
              {idx === missingIndex ? (isCorrect ? item.icon : '?') : item.icon}
            </div>
          ))}
        </div>
        
        <div className="w-full h-0.5 bg-pink-50 rounded-full"></div>

        <div className="grid grid-cols-2 gap-4 w-full px-2">
          {options.map((opt, idx) => (
            <button key={idx} onClick={() => handleChoice(opt)} disabled={isCorrect !== null} className="aspect-square bg-white border-2 border-pink-100 rounded-3xl shadow flex items-center justify-center text-5xl hover:border-pink-400 active:scale-95 transition-all">
              {opt.icon}
            </button>
          ))}
        </div>
      </div>
      {feedback && <div className="mt-4 p-3 rounded-2xl bg-white border-2 border-pink-400 text-pink-600 font-black text-sm animate-bounce shadow-md">{feedback}</div>}
    </div>
  );
};

export default PatternGame;
