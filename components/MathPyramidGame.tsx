
import React, { useState, useEffect } from 'react';
import { getCheer } from '../services/geminiService';
import PyramidCell from './PyramidCell';

interface MathPyramidGameProps {
  onBack: () => void;
  onWin: (stars: number) => void;
  startLevel?: number;
}

const MathPyramidGame: React.FC<MathPyramidGameProps> = ({ onBack, onWin, startLevel = 1 }) => {
  const [level, setLevel] = useState(startLevel);
  const [pyramid, setPyramid] = useState<any[][]>([]);
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [isWon, setIsWon] = useState(false);

  const generatePyramid = (rows: number) => {
    const limitForBottom = level <= 10 ? 3 : 5;
    const maxTopValue = 30;

    let attempts = 0;
    while (attempts < 50) {
      attempts++;
      const base = Array.from({ length: rows }, () => Math.floor(Math.random() * limitForBottom) + 1);
      
      let tempRows: number[][] = [base];
      for (let i = 0; i < rows - 1; i++) {
        let nextRow: number[] = [];
        for (let j = 0; j < tempRows[i].length - 1; j++) {
          nextRow.push(tempRows[i][j] + tempRows[i][j + 1]);
        }
        tempRows.push(nextRow);
      }

      const finalPyramidValues = tempRows.reverse();
      if (finalPyramidValues[0][0] <= maxTopValue) {
        return finalPyramidValues.map((row, rIdx) => 
          row.map(val => {
            let isVisible = rIdx === rows - 1;
            if (level > 20 && rIdx === rows - 1 && Math.random() > 0.8) isVisible = false;
            if (rIdx < rows - 1) isVisible = false;
            return { value: val, isVisible, userInput: null };
          })
        );
      }
    }
    return [[{value: 5, isVisible: false, userInput: null}], [{value: 2, isVisible: true, userInput: null}, {value: 3, isVisible: true, userInput: null}]];
  };

  const initGame = (rows: number) => {
    setRowCount(rows);
    setIsWon(false);
    setFeedback('');
    setPyramid(generatePyramid(rows));
  };

  useEffect(() => {
    if (rowCount !== null) {
      setPyramid(generatePyramid(rowCount));
    }
  }, [level, rowCount]);

  const checkAnswer = async () => {
    const isCorrect = pyramid.flat().every(cell => cell.isVisible || cell.userInput === cell.value);
    if (isCorrect) {
      setIsWon(true);
      const cheer = await getCheer(true);
      setFeedback(cheer);
      onWin(20);
      setTimeout(() => {
        setIsWon(false);
        setFeedback('');
        setLevel(prev => prev + 1);
      }, 3000);
    } else {
      const tryAgain = await getCheer(false);
      setFeedback(tryAgain);
    }
  };

  const handleInput = (rIdx: number, cIdx: number, val: number) => {
    const newPyramid = [...pyramid];
    newPyramid[rIdx][cIdx].userInput = val;
    setPyramid(newPyramid);
  };

  if (rowCount === null) {
    return (
      <div className="w-full flex flex-col items-center animate-fadeIn px-2 py-6">
        <div className="bg-white p-8 rounded-[48px] shadow-2xl border-4 border-yellow-400 text-center w-full">
           <h2 className="text-3xl font-black text-yellow-600 mb-4 uppercase">Tháp Số Thông Thái 🧱</h2>
           <p className="text-gray-500 font-bold mb-10 text-base italic">"Bé chọn tháp để xây nhé!"</p>
           <div className="flex flex-col gap-6">
              {[3, 4].map(num => (
                <button key={num} onClick={() => initGame(num)} className="bg-white hover:bg-yellow-50 p-8 rounded-[36px] border-4 border-yellow-100 hover:border-yellow-400 transition-all shadow-lg flex items-center justify-between group active:scale-95">
                   <div className="text-6xl group-hover:scale-110 transition-transform">
                      {num === 3 ? '🏠' : '🏰'}
                   </div>
                   <div className="text-2xl font-black text-yellow-600 uppercase">{num} TẦNG</div>
                   <div className="text-3xl">➡️</div>
                </button>
              ))}
           </div>
           <button onClick={onBack} className="mt-12 text-gray-400 font-bold text-sm uppercase tracking-widest">Quay lại menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center px-2 pb-32">
      <div className="bg-white/95 p-4 rounded-[32px] shadow-md border-2 border-yellow-400 mb-8 text-center w-full relative">
        <button onClick={() => setRowCount(null)} className="absolute left-4 top-4 bg-gray-100 w-10 h-10 flex items-center justify-center rounded-full active:scale-90">🔙</button>
        <h2 className="text-lg font-black text-yellow-600 uppercase">
           Tháp {rowCount} tầng - Cấp {level}
        </h2>
      </div>

      <div className="flex flex-col items-center gap-16 w-full overflow-x-auto py-6">
        {pyramid.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-4">
            {row.map((cell, cIdx) => (
              <PyramidCell 
                key={cIdx} 
                value={cell.value} 
                isVisible={cell.isVisible} 
                userInput={cell.userInput} 
                onInput={(val) => handleInput(rIdx, cIdx, val)} 
                status={isWon ? 'correct' : (cell.userInput !== null && cell.userInput !== cell.value ? 'wrong' : 'none')} 
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-16 w-full max-w-sm px-4">
        {feedback && <div className="mb-6 p-4 bg-white border-2 border-orange-400 rounded-3xl text-orange-600 font-black animate-bounce shadow-md text-center text-base">{feedback}</div>}
        {!isWon && (
          <button onClick={checkAnswer} className="w-full bg-yellow-400 text-blue-900 py-5 rounded-[28px] font-black text-2xl shadow-[0_8px_0_rgb(161,130,0)] active:translate-y-1 active:shadow-none transition-all uppercase">
            Xây Xong! ✨
          </button>
        )}
      </div>
    </div>
  );
};

export default MathPyramidGame;
