
import React, { useState, useEffect } from 'react';
import { getCheer } from '../services/geminiService';

type ShapeType = 'triangle' | 'square' | 'circle' | 'rectangle';

interface ShapeConfig {
  label: string;
  color: string;
  exampleEmoji: string;
}

const SHAPE_INFO: Record<ShapeType, ShapeConfig> = {
  triangle: { label: 'Tam Giác', color: '#ef4444', exampleEmoji: '▲' },
  square: { label: 'Hình Vuông', color: '#3b82f6', exampleEmoji: '■' },
  circle: { label: 'Hình Tròn', color: '#22c55e', exampleEmoji: '●' },
  rectangle: { label: 'Hình Chữ Nhật', color: '#eab308', exampleEmoji: '▮' },
};

type SceneType = 'TURTLE' | 'FISH' | 'ROBOT' | 'WINDMILL' | 'HOUSE' | 'TRAIN' | 'ROCKET' | 'CITY' | 'FOREST' | 'TRUCK';

const ShapeCountingGame: React.FC<{ onBack: () => void; onWin: (stars: number) => void; startLevel?: number }> = ({ onBack, onWin, startLevel = 1 }) => {
  const [level, setLevel] = useState(startLevel);
  const [scene, setScene] = useState<SceneType>('TURTLE');
  const [counts, setCounts] = useState<Record<ShapeType, number>>({ triangle: 0, square: 0, circle: 0, rectangle: 0 });
  const [correctCounts, setCorrectCounts] = useState<Record<ShapeType, number>>({ triangle: 0, square: 0, circle: 0, rectangle: 0 });
  const [feedback, setFeedback] = useState('');
  const [isWon, setIsWon] = useState(false);
  const [wrongShapes, setWrongShapes] = useState<ShapeType[]>([]);

  const generateLevel = (lvl: number) => {
    setIsWon(false);
    setFeedback('');
    setWrongShapes([]);
    setCounts({ triangle: 0, square: 0, circle: 0, rectangle: 0 });
    
    const scenes: SceneType[] = ['TURTLE', 'FISH', 'ROBOT', 'WINDMILL', 'HOUSE', 'TRAIN', 'ROCKET', 'CITY', 'FOREST', 'TRUCK'];
    const selectedScene = scenes[(lvl - 1) % scenes.length];
    setScene(selectedScene);

    const configs: Record<SceneType, Record<ShapeType, number>> = {
      TURTLE: { triangle: 3, square: 0, circle: 2, rectangle: 5 },
      FISH: { triangle: 4, square: 1, circle: 4, rectangle: 0 },
      ROBOT: { triangle: 1, square: 1, circle: 1, rectangle: 6 },
      WINDMILL: { triangle: 4, square: 0, circle: 1, rectangle: 2 },
      HOUSE: { triangle: 2, square: 4, circle: 2, rectangle: 3 },
      TRAIN: { triangle: 1, square: 2, circle: 4, rectangle: 4 },
      ROCKET: { triangle: 3, square: 0, circle: 5, rectangle: 2 },
      CITY: { triangle: 0, square: 5, circle: 2, rectangle: 6 },
      FOREST: { triangle: 6, square: 0, circle: 2, rectangle: 3 },
      TRUCK: { triangle: 1, square: 2, circle: 2, rectangle: 4 }
    };

    setCorrectCounts(configs[selectedScene]);
  };

  useEffect(() => { generateLevel(level); }, [level]);

  const updateCount = (type: ShapeType, delta: number) => {
    if (isWon) return;
    const newCount = Math.max(0, Math.min(counts[type] + delta, 9));
    setCounts(prev => ({ ...prev, [type]: newCount }));
    setWrongShapes(prev => prev.filter(s => s !== type));
  };

  const checkResult = async () => {
    const wrongOnes = (Object.keys(correctCounts) as ShapeType[]).filter(
      type => counts[type] !== correctCounts[type]
    );

    if (wrongOnes.length === 0) {
      setIsWon(true);
      const cheer = await getCheer(true);
      setFeedback(cheer);
      onWin(15);
      setTimeout(() => {
        if (level < 100) setLevel(l => l + 1);
        else onBack();
      }, 3000);
    } else {
      setWrongShapes(wrongOnes);
      setFeedback("Bé đếm lại nha!");
    }
  };

  const renderShapeNumber = (type: ShapeType, index: number, x: number, y: number) => {
    if (counts[type] > index) {
      return (
        <g key={`${type}-${index}`}>
          <circle cx={x} cy={y} r="5" fill="white" stroke={SHAPE_INFO[type].color} strokeWidth="0.5" />
          <text x={x} y={y} textAnchor="middle" alignmentBaseline="middle" fontSize="6" fontWeight="bold" fill={SHAPE_INFO[type].color}>
            {index + 1}
          </text>
        </g>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col items-center animate-fadeIn px-2 pb-24">
      <div className="bg-white/95 p-3 rounded-[24px] shadow-sm border-2 border-cyan-400 mb-3 text-center w-full relative">
        <button onClick={onBack} className="absolute left-3 top-3 bg-gray-100 w-7 h-7 flex items-center justify-center rounded-full active:scale-90">🏠</button>
        <h2 className="text-base font-black text-cyan-600 uppercase">Đếm Hình Vui Nhộn</h2>
        <div className="text-[10px] font-black text-blue-500">Cấp độ {level}</div>
      </div>

      <div className="bg-white p-2 rounded-[32px] shadow-md border-2 border-slate-100 aspect-square w-full max-w-sm flex items-center justify-center relative overflow-hidden mb-4">
         <svg viewBox="0 0 200 200" className="w-full h-full">
            <rect width="200" height="200" fill="#f8fafc" />
            
            {scene === 'TURTLE' && (
              <g>
                <rect x="40" y="85" width="110" height="40" rx="10" fill="#713f12" />
                {renderShapeNumber('rectangle', 0, 95, 105)}
                <rect x="50" y="125" width="8" height="20" fill="#a16207" />
                {renderShapeNumber('rectangle', 1, 54, 135)}
                <rect x="75" y="125" width="8" height="20" fill="#a16207" />
                {renderShapeNumber('rectangle', 2, 79, 135)}
                <rect x="110" y="125" width="8" height="20" fill="#a16207" />
                {renderShapeNumber('rectangle', 3, 114, 135)}
                <rect x="135" y="125" width="8" height="20" fill="#a16207" />
                {renderShapeNumber('rectangle', 4, 139, 135)}
                <path d="M 60,85 L 80,55 L 100,85 Z" fill="#ef4444" />
                {renderShapeNumber('triangle', 0, 80, 70)}
                <path d="M 100,85 L 120,55 L 140,85 Z" fill="#ef4444" />
                {renderShapeNumber('triangle', 1, 120, 70)}
                <path d="M 80,55 L 100,25 L 120,55 Z" fill="#ef4444" />
                {renderShapeNumber('triangle', 2, 100, 40)}
                <circle cx="165" cy="100" r="18" fill="#22c55e" />
                {renderShapeNumber('circle', 0, 165, 100)}
                <circle cx="172" cy="95" r="3" fill="black" />
                {renderShapeNumber('circle', 1, 172, 95)}
              </g>
            )}

            {scene === 'FISH' && (
              <g>
                <path d="M 30,100 L 70,60 L 70,140 Z" fill="#f97316" />
                {renderShapeNumber('triangle', 0, 50, 100)}
                <rect x="70" y="70" width="60" height="60" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                {renderShapeNumber('square', 0, 100, 100)}
                <path d="M 130,70 L 175,100 L 130,130 Z" fill="#fbbf24" />
                {renderShapeNumber('triangle', 1, 145, 100)}
                <path d="M 90,70 L 105,40 L 120,70 Z" fill="#f97316" />
                {renderShapeNumber('triangle', 2, 105, 55)}
                <path d="M 90,130 L 105,160 L 120,130 Z" fill="#f97316" />
                {renderShapeNumber('triangle', 3, 105, 145)}
                <circle cx="155" cy="92" r="4" fill="black" />
                {renderShapeNumber('circle', 0, 155, 92)}
                <circle cx="20" cy="50" r="6" fill="#bae6fd" />
                {renderShapeNumber('circle', 1, 20, 50)}
                <circle cx="35" cy="30" r="8" fill="#bae6fd" />
                {renderShapeNumber('circle', 2, 35, 30)}
                <circle cx="15" cy="80" r="4" fill="#bae6fd" />
                {renderShapeNumber('circle', 3, 15, 80)}
              </g>
            )}

            {scene === 'ROBOT' && (
              <g>
                <rect x="82.5" y="35" width="35" height="35" rx="5" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
                {renderShapeNumber('square', 0, 100, 52.5)}
                <rect x="75" y="70" width="50" height="75" fill="#3b82f6" />
                {renderShapeNumber('rectangle', 0, 100, 107.5)}
                <rect x="45" y="80" width="30" height="10" fill="#64748b" />
                {renderShapeNumber('rectangle', 1, 60, 85)}
                <rect x="125" y="80" width="30" height="10" fill="#64748b" />
                {renderShapeNumber('rectangle', 2, 140, 85)}
                <rect x="85" y="145" width="10" height="35" fill="#1e293b" />
                {renderShapeNumber('rectangle', 3, 90, 162.5)}
                <rect x="105" y="145" width="10" height="35" fill="#1e293b" />
                {renderShapeNumber('rectangle', 4, 110, 162.5)}
                <rect x="75" y="180" width="50" height="10" fill="#1e293b" />
                {renderShapeNumber('rectangle', 5, 100, 185)}
                <circle cx="100" cy="105" r="10" fill="#fde047" />
                {renderShapeNumber('circle', 0, 100, 105)}
                <path d="M 95,35 L 100,15 L 105,35 Z" fill="#ef4444" />
                {renderShapeNumber('triangle', 0, 100, 25)}
              </g>
            )}

            {scene === 'WINDMILL' && (
              <g>
                 <rect x="92.5" y="110" width="15" height="60" fill="#78350f" />
                 {renderShapeNumber('rectangle', 0, 100, 140)}
                 <rect x="85" y="100" width="30" height="10" fill="#92400e" />
                 {renderShapeNumber('rectangle', 1, 100, 105)}
                 <path d="M 100,100 L 65,65 L 100,65 Z" fill="#ef4444" /> 
                 {renderShapeNumber('triangle', 0, 82.5, 75)}
                 <path d="M 100,100 L 135,65 L 135,100 Z" fill="#ef4444" />
                 {renderShapeNumber('triangle', 1, 125, 82.5)}
                 <path d="M 100,100 L 135,135 L 100,135 Z" fill="#ef4444" />
                 {renderShapeNumber('triangle', 2, 117.5, 125)}
                 <path d="M 100,100 L 65,135 L 65,100 Z" fill="#ef4444" />
                 {renderShapeNumber('triangle', 3, 75, 117.5)}
                 <circle cx="100" cy="100" r="8" fill="#fde047" />
                 {renderShapeNumber('circle', 0, 100, 100)}
              </g>
            )}

            {scene === 'HOUSE' && (
              <g>
                <rect x="40" y="100" width="70" height="70" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
                {renderShapeNumber('square', 0, 75, 135)}
                <rect x="50" y="115" width="18" height="18" fill="#93c5fd" stroke="#3b82f6" strokeWidth="1" />
                {renderShapeNumber('square', 1, 59, 124)}
                <rect x="80" y="115" width="18" height="18" fill="#93c5fd" stroke="#3b82f6" strokeWidth="1" />
                {renderShapeNumber('square', 2, 89, 124)}
                <rect x="80" y="145" width="18" height="18" fill="#93c5fd" stroke="#3b82f6" strokeWidth="1" />
                {renderShapeNumber('square', 3, 89, 154)}
                <path d="M 30,100 L 75,40 L 120,100 Z" fill="#ef4444" />
                {renderShapeNumber('triangle', 0, 75, 70)}
                <rect x="48" y="142" width="22" height="28" fill="#92400e" />
                {renderShapeNumber('rectangle', 0, 59, 156)}
                <rect x="150" y="140" width="8" height="30" fill="#78350f" />
                {renderShapeNumber('rectangle', 1, 154, 155)}
                <path d="M 135,140 L 154,100 L 173,140 Z" fill="#22c55e" />
                {renderShapeNumber('triangle', 1, 154, 125)}
                <circle cx="165" cy="35" r="15" fill="#f97316" />
                {renderShapeNumber('circle', 0, 165, 35)}
                <circle cx="160" cy="32" r="2" fill="white" />
                {renderShapeNumber('circle', 1, 160, 32)}
                <rect x="20" y="170" width="160" height="10" fill="#dcfce7" />
                {renderShapeNumber('rectangle', 2, 100, 175)}
              </g>
            )}

            {scene === 'TRAIN' && (
              <g>
                <rect x="90" y="80" width="85" height="50" fill="#3b82f6" />
                {renderShapeNumber('rectangle', 0, 132.5, 105)}
                <rect x="40" y="90" width="50" height="40" fill="#ef4444" />
                {renderShapeNumber('rectangle', 1, 65, 110)}
                <rect x="45" y="65" width="8" height="25" fill="#475569" />
                {renderShapeNumber('rectangle', 2, 49, 77.5)}
                <rect x="85" y="120" width="15" height="4" fill="#1e293b" />
                {renderShapeNumber('rectangle', 3, 92.5, 122)}
                <rect x="105" y="90" width="18" height="18" fill="#93c5fd" />
                {renderShapeNumber('square', 0, 114, 99)}
                <rect x="140" y="90" width="18" height="18" fill="#93c5fd" />
                {renderShapeNumber('square', 1, 149, 99)}
                <path d="M 40,90 L 20,115 L 40,130 Z" fill="#fbbf24" />
                {renderShapeNumber('triangle', 0, 32, 112)}
                <circle cx="55" cy="140" r="10" fill="#1e293b" />
                {renderShapeNumber('circle', 0, 55, 140)}
                <circle cx="105" cy="140" r="10" fill="#1e293b" />
                {renderShapeNumber('circle', 1, 105, 140)}
                <circle cx="130" cy="140" r="10" fill="#1e293b" />
                {renderShapeNumber('circle', 2, 130, 140)}
                <circle cx="155" cy="140" r="10" fill="#1e293b" />
                {renderShapeNumber('circle', 3, 155, 140)}
              </g>
            )}

            {scene === 'ROCKET' && (
              <g>
                <rect x="80" y="60" width="40" height="80" fill="#94a3b8" />
                {renderShapeNumber('rectangle', 0, 100, 100)}
                <rect x="85" y="140" width="30" height="10" fill="#ef4444" />
                {renderShapeNumber('rectangle', 1, 100, 145)}
                <path d="M 80,60 L 100,20 L 120,60 Z" fill="#ef4444" />
                {renderShapeNumber('triangle', 0, 100, 40)}
                <path d="M 60,140 L 80,110 L 80,140 Z" fill="#3b82f6" />
                {renderShapeNumber('triangle', 1, 72, 130)}
                <path d="M 140,140 L 120,110 L 120,140 Z" fill="#3b82f6" />
                {renderShapeNumber('triangle', 2, 128, 130)}
                <circle cx="100" cy="80" r="8" fill="white" />
                {renderShapeNumber('circle', 0, 100, 80)}
                <circle cx="100" cy="110" r="8" fill="white" />
                {renderShapeNumber('circle', 1, 100, 110)}
                <circle cx="30" cy="40" r="10" fill="#fde047" />
                {renderShapeNumber('circle', 2, 30, 40)}
                <circle cx="170" cy="150" r="6" fill="#cbd5e1" />
                {renderShapeNumber('circle', 3, 170, 150)}
                <circle cx="185" cy="130" r="4" fill="#cbd5e1" />
                {renderShapeNumber('circle', 4, 185, 130)}
              </g>
            )}

            {scene === 'CITY' && (
              <g>
                <rect x="20" y="80" width="30" height="90" fill="#3b82f6" />
                {renderShapeNumber('rectangle', 0, 35, 125)}
                <rect x="60" y="100" width="40" height="70" fill="#ef4444" />
                {renderShapeNumber('rectangle', 1, 80, 135)}
                <rect x="110" y="40" width="30" height="130" fill="#22c55e" />
                {renderShapeNumber('rectangle', 2, 125, 105)}
                <rect x="150" y="90" width="30" height="80" fill="#eab308" />
                {renderShapeNumber('rectangle', 3, 165, 130)}
                <rect x="15" y="170" width="170" height="10" fill="#475569" />
                {renderShapeNumber('rectangle', 4, 100, 175)}
                <rect x="25" y="90" width="10" height="10" fill="white" />
                {renderShapeNumber('square', 0, 30, 95)}
                <rect x="65" y="110" width="10" height="10" fill="white" />
                {renderShapeNumber('square', 1, 70, 115)}
                <rect x="85" y="110" width="10" height="10" fill="white" />
                {renderShapeNumber('square', 2, 90, 115)}
                <rect x="115" y="50" width="10" height="10" fill="white" />
                {renderShapeNumber('square', 3, 120, 55)}
                <rect x="155" y="100" width="10" height="10" fill="white" />
                {renderShapeNumber('square', 4, 160, 105)}
                <circle cx="160" cy="30" r="12" fill="#f97316" />
                {renderShapeNumber('circle', 0, 160, 30)}
                <circle cx="40" cy="20" r="5" fill="#cbd5e1" />
                {renderShapeNumber('circle', 1, 40, 20)}
                <rect x="60" y="170" width="2" height="10" fill="#94a3b8" />
                {renderShapeNumber('rectangle', 5, 61, 175)}
              </g>
            )}

            {scene === 'FOREST' && (
              <g>
                <rect x="40" y="130" width="10" height="40" fill="#78350f" />
                {renderShapeNumber('rectangle', 0, 45, 150)}
                <path d="M 20,130 L 45,80 L 70,130 Z" fill="#15803d" />
                {renderShapeNumber('triangle', 0, 45, 110)}
                <path d="M 25,100 L 45,60 L 65,100 Z" fill="#16a34a" />
                {renderShapeNumber('triangle', 1, 45, 80)}
                <path d="M 30,75 L 45,45 L 60,75 Z" fill="#15803d" />
                {renderShapeNumber('triangle', 2, 45, 60)}
                
                <rect x="100" y="120" width="12" height="50" fill="#78350f" />
                {renderShapeNumber('rectangle', 1, 106, 145)}
                <path d="M 80,120 L 106,60 L 132,120 Z" fill="#15803d" />
                {renderShapeNumber('triangle', 3, 106, 95)}
                <path d="M 85,90 L 106,45 L 127,90 Z" fill="#16a34a" />
                {renderShapeNumber('triangle', 4, 106, 70)}
                <path d="M 90,65 L 106,35 L 122,65 Z" fill="#15803d" />
                {renderShapeNumber('triangle', 5, 106, 50)}

                <rect x="160" y="140" width="8" height="30" fill="#78350f" />
                {renderShapeNumber('rectangle', 2, 164, 155)}
                <circle cx="30" cy="30" r="10" fill="#fde047" />
                {renderShapeNumber('circle', 0, 30, 30)}
                <circle cx="170" cy="40" r="8" fill="#bae6fd" />
                {renderShapeNumber('circle', 1, 170, 40)}
              </g>
            )}

            {scene === 'TRUCK' && (
              <g>
                <rect x="30" y="80" width="100" height="60" fill="#3b82f6" rx="2" />
                {renderShapeNumber('rectangle', 0, 80, 110)}
                <rect x="130" y="100" width="40" height="40" fill="#ef4444" rx="5" />
                {renderShapeNumber('rectangle', 1, 150, 120)}
                <rect x="140" y="105" width="20" height="15" fill="#93c5fd" />
                {renderShapeNumber('square', 0, 150, 112)}
                <rect x="165" y="130" width="5" height="5" fill="#fde047" />
                {renderShapeNumber('square', 1, 167, 132)}
                <rect x="25" y="135" width="150" height="5" fill="#475569" />
                {renderShapeNumber('rectangle', 2, 100, 137)}
                <rect x="35" y="115" width="20" height="15" fill="white" />
                {renderShapeNumber('rectangle', 3, 45, 122)}
                <circle cx="60" cy="150" r="12" fill="#1e293b" />
                {renderShapeNumber('circle', 0, 60, 150)}
                <circle cx="140" cy="150" r="12" fill="#1e293b" />
                {renderShapeNumber('circle', 1, 140, 150)}
                <path d="M 130,100 L 150,80 L 170,100 Z" fill="#ef4444" />
                {renderShapeNumber('triangle', 0, 150, 92)}
              </g>
            )}
         </svg>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {(['triangle', 'square', 'circle', 'rectangle'] as ShapeType[]).map(type => {
          const isWrong = wrongShapes.includes(type);
          const info = SHAPE_INFO[type];
          if (correctCounts[type] === 0) return null;

          return (
            <div key={type} className={`bg-white p-3 rounded-2xl shadow-sm border-2 transition-all ${isWrong ? 'border-red-400 bg-red-50 animate-shake' : 'border-slate-50'} flex flex-col items-center`}>
              <div className="text-3xl" style={{ color: info.color }}>{info.exampleEmoji}</div>
              <span className="text-[10px] font-black uppercase text-slate-400 mb-2">{info.label}</span>
              <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-xl w-full">
                <button onClick={() => updateCount(type, -1)} className="w-8 h-8 bg-rose-500 text-white rounded-lg font-black text-xl shadow-sm active:scale-90">-</button>
                <div className="text-xl font-black text-slate-700 mx-1">{counts[type]}</div>
                <button onClick={() => updateCount(type, 1)} className="w-8 h-8 bg-emerald-500 text-white rounded-lg font-black text-xl shadow-sm active:scale-90">+</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 w-full max-w-sm px-4">
        {feedback && <div className="mb-4 p-4 rounded-2xl bg-white border-2 border-orange-400 text-orange-600 font-black text-center animate-bounce shadow-md text-sm">{feedback}</div>}
        <button onClick={checkResult} className="w-full bg-cyan-500 text-white py-4 rounded-[24px] font-black text-xl shadow-[0_6px_0_rgb(8,145,178)] active:translate-y-1 active:shadow-none transition-all uppercase">
           Kiểm Tra ✨
        </button>
      </div>
    </div>
  );
};

export default ShapeCountingGame;
