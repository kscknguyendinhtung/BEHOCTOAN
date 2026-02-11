
import React, { useState } from 'react';
import { AppView } from './types';
import Background from './components/Background';
import StarProgress from './components/StarProgress';
import MathPyramidGame from './components/MathPyramidGame';
import ComparisonGame from './components/ComparisonGame';
import CalculationGame from './components/CalculationGame';
import MazeGame from './components/MazeGame';
import PatternGame from './components/PatternGame';
import ShapeCountingGame from './components/ShapeCountingGame';
import LogicMatchGame from './components/LogicMatchGame';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('MENU');
  const [stars, setStars] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [showLevelPicker, setShowLevelPicker] = useState<AppView | null>(null);

  const handleWin = (addedStars: number) => setStars(prev => prev + addedStars);

  const openPicker = (view: AppView) => setShowLevelPicker(view);

  const startGame = (level: number) => {
    setSelectedLevel(level);
    if (showLevelPicker) {
      setView(showLevelPicker);
      setShowLevelPicker(null);
    }
  };

  const renderLevelPicker = () => {
    if (!showLevelPicker) return null;
    const max = showLevelPicker === 'LOGIC_MATCH' ? 100 : 50;
    // Calculation game handles its own level/mode selection now
    if (showLevelPicker === 'CALCULATION') {
       setView('CALCULATION');
       setShowLevelPicker(null);
       return null;
    }

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
        <div className="bg-white rounded-[32px] w-full max-w-sm p-5 shadow-2xl flex flex-col max-h-[70vh]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black text-blue-600 uppercase">Chọn Cấp Độ ✨</h2>
            <button onClick={() => setShowLevelPicker(null)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-xl font-bold">×</button>
          </div>
          <div className="grid grid-cols-4 gap-2 overflow-y-auto p-1 pb-6 custom-scrollbar">
            {Array.from({ length: max }).map((_, i) => (
              <button key={i} onClick={() => startGame(i + 1)} className="aspect-square bg-blue-50 hover:bg-blue-500 hover:text-white rounded-xl font-bold text-blue-600 border-b-2 border-blue-200 text-base flex items-center justify-center active:scale-90 transition-transform">
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f0fdf4] overflow-x-hidden">
      <Background />
      {renderLevelPicker()}
      
      <header className="w-full sticky top-0 z-[40] bg-white/90 backdrop-blur-md px-4 py-2 flex justify-between items-center border-b border-green-100 shadow-sm safe-area-top">
        <button className="flex items-center gap-1.5" onClick={() => setView('MENU')}>
          <span className="text-xl">🎒</span>
          <h1 className="text-base font-black text-green-600">BÉ HỌC TOÁN</h1>
        </button>
        <StarProgress stars={stars} />
      </header>

      <main className="flex-1 w-full max-w-md flex flex-col items-center pt-4 px-3 pb-10">
        {view === 'MENU' && (
          <div className="flex flex-col items-center w-full animate-fadeIn overflow-y-auto pb-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-blue-600">Chào Bé Yêu! 🎈</h2>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Cùng chơi và học nhé</p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <MenuCard icon="🤝" title="Đôi Bạn" color="orange" onClick={() => openPicker('LOGIC_MATCH')} tag="100 Câu" />
              <MenuCard icon="🧱" title="Tháp Số" color="yellow" onClick={() => openPicker('PYRAMID')} tag="Tư duy" />
              <MenuCard icon="🎨" title="Đếm Hình" color="cyan" onClick={() => openPicker('SHAPE_COUNT')} tag="Quan sát" />
              <MenuCard icon="🍓" title="Quy Luật" color="pink" onClick={() => openPicker('PATTERN')} tag="IQ Trẻ" />
              <MenuCard icon="🌀" title="Mê Cung" color="indigo" onClick={() => openPicker('MAZE')} tag="Khám phá" />
              <MenuCard icon="🐊" title="Cá Sấu" color="emerald" onClick={() => openPicker('COMPARISON')} tag="Lớn nhỏ" />
              <MenuCard icon="🖐️" title="Phép Tính" color="rose" onClick={() => setView('CALCULATION')} tag="Cộng trừ" />
            </div>
          </div>
        )}

        <div className="w-full">
          {view === 'PYRAMID' && <MathPyramidGame onBack={() => setView('MENU')} onWin={handleWin} />}
          {view === 'COMPARISON' && <ComparisonGame onBack={() => setView('MENU')} onWin={handleWin} />}
          {view === 'CALCULATION' && <CalculationGame onBack={() => setView('MENU')} onWin={handleWin} />}
          {view === 'MAZE' && <MazeGame onBack={() => setView('MENU')} onWin={handleWin} />}
          {view === 'PATTERN' && <PatternGame onBack={() => setView('MENU')} onWin={handleWin} />}
          {view === 'SHAPE_COUNT' && <ShapeCountingGame onBack={() => setView('MENU')} onWin={handleWin} startLevel={selectedLevel} />}
          {view === 'LOGIC_MATCH' && <LogicMatchGame onBack={() => setView('MENU')} onWin={handleWin} startLevel={selectedLevel} />}
        </div>
      </main>
      
      <style>{`
        .safe-area-top { padding-top: max(0.5rem, env(safe-area-inset-top)); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

const MenuCard = ({ icon, title, color, onClick, tag }: any) => (
  <button onClick={onClick} className={`bg-white p-3 py-5 rounded-[24px] shadow-sm border-b-[4px] border-${color}-200 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center group`}>
    <div className="text-4xl mb-2 group-active:scale-90 transition-transform">{icon}</div>
    <h3 className="text-sm font-black text-slate-700">{title}</h3>
    <div className={`mt-1.5 text-[8px] bg-${color}-50 text-${color}-600 px-2 py-0.5 rounded-full uppercase font-black border border-${color}-100`}>{tag}</div>
  </button>
);

export default App;
