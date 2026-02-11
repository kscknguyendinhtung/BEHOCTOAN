
import React, { useState, useEffect, useCallback } from 'react';

interface MazeGameProps {
  onBack: () => void;
  onWin: (stars: number) => void;
}

const MAZE_SIZE = 15; 

const MISSIONS = [
  { id: 1, name: 'Cảnh Sát', icon: '🚓', target: '🦹', targetLabel: 'Bắt Trộm', color: '#3b82f6', border: 'border-blue-400' },
  { id: 2, name: 'Cứu Hỏa', icon: '🚒', target: '🔥', targetLabel: 'Dập Lửa', color: '#ef4444', border: 'border-red-400' },
  { id: 3, name: 'Cấp Cứu', icon: '🚑', target: '🏥', targetLabel: 'Đến Viện', color: '#f43f5e', border: 'border-rose-400' },
  { id: 4, name: 'Cứu Hộ', icon: '🚜', target: '🚗', targetLabel: 'Kéo Xe', color: '#f59e0b', border: 'border-amber-400' },
  { id: 5, name: 'Xe Rác', icon: '🚛', target: '🗑️', targetLabel: 'Dọn Rác', color: '#10b981', border: 'border-emerald-400' }
];

const MazeGame: React.FC<MazeGameProps> = ({ onBack, onWin }) => {
  const [step, setStep] = useState<'SELECT' | 'PLAY'>('SELECT');
  const [grid, setGrid] = useState<number[][]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState({ x: MAZE_SIZE - 1, y: MAZE_SIZE - 1 });
  const [mission, setMission] = useState(MISSIONS[0]);
  const [facingLeft, setFacingLeft] = useState(false);
  const [isWon, setIsWon] = useState(false);

  const generateMaze = useCallback(() => {
    const newGrid = Array(MAZE_SIZE).fill(0).map(() => Array(MAZE_SIZE).fill(1));
    const stack: [number, number][] = [[0, 0]];
    newGrid[0][0] = 0;

    const directions = [[0, 2], [0, -2], [2, 0], [-2, 0]];

    while (stack.length > 0) {
      const [cx, cy] = stack[stack.length - 1];
      const neighbors = directions
        .map(([dx, dy]) => [cx + dx, cy + dy])
        .filter(([nx, ny]) => nx >= 0 && nx < MAZE_SIZE && ny >= 0 && ny < MAZE_SIZE && newGrid[ny][nx] === 1);

      if (neighbors.length > 0) {
        const [nx, ny] = neighbors[Math.floor(Math.random() * neighbors.length)];
        newGrid[ny][nx] = 0;
        newGrid[cy + (ny - cy) / 2][cx + (nx - cx) / 2] = 0;
        stack.push([nx, ny]);
      } else {
        stack.pop();
      }
    }
    
    newGrid[MAZE_SIZE - 1][MAZE_SIZE - 1] = 0;
    setGrid(newGrid);
    setPlayerPos({ x: 0, y: 0 });
    setIsWon(false);
  }, []);

  const selectMission = (m: typeof MISSIONS[0]) => {
    setMission(m);
    generateMaze();
    setStep('PLAY');
  };

  const movePlayer = (dx: number, dy: number) => {
    if (isWon || step !== 'PLAY') return;
    const nextX = playerPos.x + dx;
    const nextY = playerPos.y + dy;

    if (nextX >= 0 && nextX < MAZE_SIZE && nextY >= 0 && nextY < MAZE_SIZE && grid[nextY][nextX] === 0) {
      setPlayerPos({ x: nextX, y: nextY });
      if (dx < 0) setFacingLeft(true);
      if (dx > 0) setFacingLeft(false);

      if (nextX === targetPos.x && nextY === targetPos.y) {
        setIsWon(true);
        onWin(30);
        setTimeout(() => setStep('SELECT'), 3000);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') movePlayer(0, -1);
      if (e.key === 'ArrowDown') movePlayer(0, 1);
      if (e.key === 'ArrowLeft') movePlayer(-1, 0);
      if (e.key === 'ArrowRight') movePlayer(1, 0);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, isWon, grid, step]);

  if (step === 'SELECT') {
    return (
      <div className="w-full flex flex-col items-center animate-fadeIn px-2 pb-10">
        <div className="bg-white/95 p-6 rounded-[32px] shadow-xl border-4 border-indigo-400 text-center w-full mb-6">
          <button onClick={onBack} className="absolute left-6 top-6 bg-gray-100 w-10 h-10 flex items-center justify-center rounded-full text-xl">🏠</button>
          <h2 className="text-2xl font-black text-indigo-600 uppercase mb-2">Chọn Xe Cứu Hộ</h2>
          <p className="text-gray-500 font-bold text-sm italic tracking-wide">"Bé muốn lái xe nào để đi giúp đỡ mọi người?"</p>
        </div>

        <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
          {MISSIONS.map((m) => (
            <button 
              key={m.id} 
              onClick={() => selectMission(m)}
              className={`flex items-center p-4 bg-white rounded-[28px] border-b-8 border-2 transition-all active:scale-95 shadow-lg group ${m.border}`}
            >
              <div className="text-5xl mr-6 group-hover:scale-110 transition-transform">{m.icon}</div>
              <div className="text-left">
                <div className="text-lg font-black text-slate-700 uppercase">{m.name}</div>
                <div className="text-xs font-bold text-slate-400 italic">Nhiệm vụ: {m.targetLabel} {m.target}</div>
              </div>
              <div className="ml-auto text-2xl text-slate-200">▶️</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center animate-fadeIn pb-10">
      <div className="bg-white/95 p-3 rounded-[24px] shadow-sm border-2 border-indigo-400 mb-4 text-center w-full relative">
        <button onClick={() => setStep('SELECT')} className="absolute left-3 top-3 bg-gray-100 w-7 h-7 flex items-center justify-center rounded-full text-sm">🔙</button>
        <h2 className="text-lg font-black text-indigo-600 uppercase">Lái Xe {mission.name}</h2>
        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">Về {mission.target} để {mission.targetLabel} bé nhé!</div>
      </div>

      <div className="relative bg-white p-1 rounded-2xl shadow-xl border-4 border-indigo-100 overflow-hidden">
        <div 
          className="grid gap-0" 
          style={{ 
            gridTemplateColumns: `repeat(${MAZE_SIZE}, 1fr)`,
            width: 'min(90vw, 360px)',
            height: 'min(90vw, 360px)'
          }}
        >
          {grid.map((row, y) => row.map((cell, x) => (
            <div 
              key={`${x}-${y}`} 
              className={`relative flex items-center justify-center
                ${cell === 1 ? 'bg-indigo-900 rounded-[1px]' : 'bg-indigo-50/20'}`}
            >
              {playerPos.x === x && playerPos.y === y && (
                <div className={`text-2xl z-10 transition-transform duration-150 ${facingLeft ? 'scale-x-[-1]' : ''}`}>
                  {mission.icon}
                </div>
              )}
              {targetPos.x === x && targetPos.y === y && (
                <div className="text-2xl animate-bounce">{isWon ? '✅' : mission.target}</div>
              )}
            </div>
          )))}
        </div>

        {isWon && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fadeIn z-20">
            <div className="text-7xl mb-4 animate-bounce">🌟</div>
            <div className="text-3xl font-black text-indigo-600 uppercase">Giỏi Quá!</div>
          </div>
        )}
      </div>

      {/* D-PAD Control Buttons */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        <div />
        <button 
          onClick={() => movePlayer(0, -1)}
          className="w-16 h-16 bg-blue-500 text-white rounded-2xl shadow-[0_6px_0_rgb(29,78,216)] active:translate-y-1 active:shadow-none flex items-center justify-center text-4xl font-bold"
        >
          ↑
        </button>
        <div />
        
        <button 
          onClick={() => movePlayer(-1, 0)}
          className="w-16 h-16 bg-blue-500 text-white rounded-2xl shadow-[0_6px_0_rgb(29,78,216)] active:translate-y-1 active:shadow-none flex items-center justify-center text-4xl font-bold"
        >
          ←
        </button>
        <button 
          onClick={() => movePlayer(0, 1)}
          className="w-16 h-16 bg-blue-500 text-white rounded-2xl shadow-[0_6px_0_rgb(29,78,216)] active:translate-y-1 active:shadow-none flex items-center justify-center text-4xl font-bold"
        >
          ↓
        </button>
        <button 
          onClick={() => movePlayer(1, 0)}
          className="w-16 h-16 bg-blue-500 text-white rounded-2xl shadow-[0_6px_0_rgb(29,78,216)] active:translate-y-1 active:shadow-none flex items-center justify-center text-4xl font-bold"
        >
          →
        </button>
      </div>

      <div className="mt-6 text-[10px] font-black text-slate-300 uppercase tracking-widest animate-pulse">
        Sử dụng nút bấm để di chuyển xe
      </div>
    </div>
  );
};

export default MazeGame;
