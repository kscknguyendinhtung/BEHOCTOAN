
import React, { useState, useEffect } from 'react';
import { ComparisonQuiz } from '../types';
import { getCheer } from '../services/geminiService';
import CrocodileMouth from './CrocodileMouth';

interface ComparisonGameProps {
  onBack: () => void;
  onWin: (stars: number) => void;
  startLevel?: number;
}

type CompGameMode = 'CLASSIC' | 'TRUE_FALSE' | 'CHAIN';

const MODES: { id: CompGameMode; label: string; icon: string; color: string; desc: string }[] = [
  { id: 'CLASSIC', label: 'So Sánh 2 Số', icon: '🐊', color: 'emerald', desc: 'Điền dấu < > =' },
  { id: 'TRUE_FALSE', label: 'Đúng Hay Sai', icon: '✅', color: 'purple', desc: 'Chọn Đúng hoặc Sai' },
  { id: 'CHAIN', label: 'Chuỗi 3 Số', icon: '🚂', color: 'orange', desc: 'Điền 2 dấu liên tiếp' }
];

const ComparisonGame: React.FC<ComparisonGameProps> = ({ onBack, onWin }) => {
  const [selectedMode, setSelectedMode] = useState<CompGameMode | null>(null);
  const [quizzes, setQuizzes] = useState<ComparisonQuiz[]>([]);
  const [feedback, setFeedback] = useState('');
  const [isWon, setIsWon] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // --- LOGIC SINH CÂU HỎI ---
  const generateQuizzes = () => {
    if (!selectedMode) return;

    const maxNum = 15;
    // Chain và Ternary T/F tốn diện tích nên chỉ hiện 2 câu, còn lại 3 câu
    const count = (selectedMode === 'CHAIN' || selectedMode === 'TRUE_FALSE') ? 2 : 3;

    const newQuizzes: ComparisonQuiz[] = Array.from({ length: count }).map(() => {
      // Helper: so sánh 2 số trả về dấu thực tế
      const getRealOp = (a: number, b: number) => a < b ? '<' : a > b ? '>' : '=';
      // Helper: random dấu hiển thị
      const getRandomOp = () => ['<', '>', '='][Math.floor(Math.random() * 3)] as '<' | '>' | '=';

      // 1. CLASSIC: A ? B (Điền dấu)
      if (selectedMode === 'CLASSIC') {
        const left = Math.floor(Math.random() * maxNum) + 1;
        const right = Math.floor(Math.random() * maxNum) + 1;
        return {
          mode: 'CLASSIC',
          nums: [left, right],
          correctOps: [getRealOp(left, right)],
          userOps: [null]
        };
      }
      
      // 2. TRUE/FALSE (Đúng/Sai)
      else if (selectedMode === 'TRUE_FALSE') {
        // 30% cơ hội ra câu hỏi chuỗi 3 số (TERNARY), 70% ra 2 số (BINARY)
        const isTernary = Math.random() > 0.7;

        if (isTernary) {
          // Logic 3 số: A op1 B op2 C
          const n1 = Math.floor(Math.random() * maxNum) + 1;
          const n2 = Math.floor(Math.random() * maxNum) + 1;
          const n3 = Math.floor(Math.random() * maxNum) + 1;

          // Random dấu hiển thị
          const op1 = Math.random() > 0.5 ? getRealOp(n1, n2) : getRandomOp();
          const op2 = Math.random() > 0.5 ? getRealOp(n2, n3) : getRandomOp();

          // Tính toán sự thật
          const isPart1Correct = getRealOp(n1, n2) === op1;
          const isPart2Correct = getRealOp(n2, n3) === op2;
          const isWholeCorrect = isPart1Correct && isPart2Correct;

          return {
            mode: 'TRUE_FALSE',
            nums: [n1, n2, n3],
            tfType: 'TERNARY',
            tfOperators: [op1, op2],
            tfStep: 1, // Bắt đầu ở bước 1
            tfTruths: [isPart1Correct, isPart2Correct, isWholeCorrect],
            tfUserAnswers: [null, null, null]
          };
        } else {
          // Logic 2 số truyền thống
          const left = Math.floor(Math.random() * maxNum) + 1;
          const right = Math.floor(Math.random() * maxNum) + 1;
          const realOp = getRealOp(left, right);
          const displayOp = Math.random() > 0.5 ? realOp : getRandomOp();
          
          return {
            mode: 'TRUE_FALSE',
            nums: [left, right],
            tfType: 'BINARY',
            displayOp: displayOp,
            isStatementCorrect: realOp === displayOp,
            userBool: null
          };
        }
      }

      // 3. CHAIN: A ? B ? C (Điền dấu)
      else {
        const n1 = Math.floor(Math.random() * maxNum) + 1;
        const n2 = Math.floor(Math.random() * maxNum) + 1;
        const n3 = Math.floor(Math.random() * maxNum) + 1;
        
        return {
          mode: 'CHAIN',
          nums: [n1, n2, n3],
          correctOps: [getRealOp(n1, n2), getRealOp(n2, n3)],
          userOps: [null, null],
          activeSlot: 0 
        };
      }
    });

    setQuizzes(newQuizzes);
    setIsWon(false);
    setShowErrors(false);
    setFeedback('');
  };

  useEffect(() => { 
    if (selectedMode) generateQuizzes(); 
  }, [selectedMode]);

  // --- XỬ LÝ TƯƠNG TÁC ---

  // Classic & Chain: Chọn dấu < > =
  const handleOpChoice = (quizIdx: number, op: '<' | '>' | '=') => {
    if (isWon) return;
    const newQuizzes = [...quizzes];
    const q = newQuizzes[quizIdx];

    if (q.mode === 'CLASSIC') {
      q.userOps = [op];
    } else if (q.mode === 'CHAIN') {
      const currentSlot = q.activeSlot ?? 0;
      if (q.userOps) {
         q.userOps[currentSlot] = op;
         if (currentSlot < 1) q.activeSlot = currentSlot + 1;
      }
    }
    setQuizzes(newQuizzes);
    setShowErrors(false);
  };

  // Chain: Chọn ô để sửa
  const handleSlotClick = (quizIdx: number, slotIdx: number) => {
    if (isWon) return;
    const newQuizzes = [...quizzes];
    newQuizzes[quizIdx].activeSlot = slotIdx;
    setQuizzes(newQuizzes);
  };

  // True/False: Chọn Đ/S
  const handleBoolChoice = async (quizIdx: number, val: boolean) => {
    if (isWon) return;
    const newQuizzes = [...quizzes];
    const q = newQuizzes[quizIdx];

    if (q.mode === 'TRUE_FALSE') {
      if (q.tfType === 'BINARY') {
        q.userBool = val;
      } 
      else if (q.tfType === 'TERNARY' && q.tfStep && q.tfTruths && q.tfUserAnswers) {
        // Logic từng bước cho Ternary
        const currentStepIdx = q.tfStep - 1; // 0, 1, 2
        const isCorrectChoice = val === q.tfTruths[currentStepIdx];

        if (isCorrectChoice) {
          // Đúng -> Lưu kqua và chuyển bước
          q.tfUserAnswers[currentStepIdx] = val;
          if (q.tfStep < 3) {
             q.tfStep += 1;
             setFeedback("Đúng rồi! Tiếp tục nào! 👍");
          } else {
             q.tfStep = 4; // Hoàn thành
             setFeedback("Xuất sắc! 🎉");
          }
        } else {
          // Sai -> Rung lắc và báo lỗi
          setFeedback("Chưa đúng rồi, bé nhìn kỹ lại nhé! 🤔");
          // Trigger shake animation (handled by CSS key 'showErrors' locally or simplified here)
          const element = document.getElementById(`ternary-card-${quizIdx}`);
          if (element) {
            element.classList.add('animate-shake');
            setTimeout(() => element.classList.remove('animate-shake'), 500);
          }
        }
      }
    }
    setQuizzes(newQuizzes);
    setShowErrors(false);
  };

  const checkResults = async () => {
    let allAnswered = true;
    let correct = true;

    for (const q of quizzes) {
      if (q.mode === 'TRUE_FALSE') {
        if (q.tfType === 'BINARY') {
          if (q.userBool === null) allAnswered = false;
          else if (q.userBool !== q.isStatementCorrect) correct = false;
        } else if (q.tfType === 'TERNARY') {
          if (q.tfStep !== 4) allAnswered = false; // Phải đi đến bước 4 mới tính là xong
          // Logic đúng sai đã được check từng bước rồi, nếu step=4 nghĩa là đã đúng hết
        }
      } else {
        // Classic & Chain
        if (q.userOps?.some(o => o === null)) allAnswered = false;
        else {
           const isMatch = q.userOps?.every((val, idx) => val === q.correctOps?.[idx]);
           if (!isMatch) correct = false;
        }
      }
    }

    if (!allAnswered) {
      setFeedback("Bé hoàn thành hết các câu hỏi nhé! 🐊");
      return;
    }

    if (correct) {
      setIsWon(true);
      setFeedback(await getCheer(true));
      onWin(20);
      setTimeout(() => generateQuizzes(), 2500);
    } else {
      setShowErrors(true);
      setFeedback("Có câu chưa đúng rồi, bé kiểm tra lại nha! 💪");
    }
  };

  const renderVisualDots = (count: number, colorClass: string) => (
    <div className="flex flex-wrap gap-0.5 justify-center mt-1 max-w-[60px]">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full ${colorClass} border border-white/30`}></div>
      ))}
    </div>
  );

  // --- RENDERERS ---

  if (!selectedMode) {
    // ... Menu render code (giữ nguyên)
    return (
      <div className="w-full flex flex-col items-center animate-fadeIn px-4 pb-10 pt-4">
        <div className="bg-white/95 p-6 rounded-[32px] shadow-xl border-4 border-emerald-400 text-center w-full mb-6 relative">
          <button onClick={onBack} className="absolute left-4 top-4 bg-gray-100 w-10 h-10 flex items-center justify-center rounded-full text-xl">🏠</button>
          <h2 className="text-2xl font-black text-emerald-600 uppercase mb-2 mt-2">Bé & Cá Sấu 🐊</h2>
          <p className="text-gray-500 font-bold text-sm italic">"Bé muốn chơi trò gì nào?"</p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          {MODES.map((mode) => (
            <button 
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`flex items-center p-4 bg-white rounded-[24px] border-b-4 shadow-lg active:scale-95 transition-all group
                border-${mode.color}-300 hover:bg-${mode.color}-50`}
            >
              <div className={`w-16 h-16 mr-4 flex items-center justify-center bg-${mode.color}-50 rounded-2xl`}>
                <span className="text-4xl">{mode.icon}</span>
              </div>
              <div className="text-left">
                <div className={`font-black text-${mode.color}-600 text-lg uppercase`}>{mode.label}</div>
                <div className={`text-xs text-${mode.color}-400 font-bold`}>{mode.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentModeInfo = MODES.find(m => m.id === selectedMode);

  return (
    <div className="w-full flex flex-col items-center animate-fadeIn pb-24 px-2">
      {/* HEADER */}
      <div className={`bg-white p-3 rounded-3xl shadow-md border-2 border-${currentModeInfo?.color}-400 mb-4 text-center w-full relative`}>
        <button onClick={() => setSelectedMode(null)} className="absolute left-3 top-3 bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full text-sm">🔙</button>
        <h2 className={`text-lg font-black text-${currentModeInfo?.color}-600 uppercase`}>
          {currentModeInfo?.label}
        </h2>
        <span className={`text-[10px] font-black text-${currentModeInfo?.color}-500 bg-${currentModeInfo?.color}-50 px-2 py-0.5 rounded-full`}>SỐ ĐẾN 15</span>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {quizzes.map((quiz, idx) => {
          // --- RENDER CLASSIC MODE ---
          if (quiz.mode === 'CLASSIC') {
             const isError = showErrors && quiz.userOps?.[0] !== quiz.correctOps?.[0];
             return (
              <div key={idx} className={`bg-white p-4 rounded-[24px] shadow-sm border-2 flex items-center justify-between gap-1 ${isError ? 'border-red-300 bg-red-50 animate-shake' : 'border-emerald-50'}`}>
                <div className="flex flex-col items-center w-16">
                  <div className="text-3xl font-black text-slate-700">{quiz.nums[0]}</div>
                  {renderVisualDots(quiz.nums[0], 'bg-emerald-400')}
                </div>
                <div className="flex flex-col items-center gap-2 flex-1">
                   <div className="h-12 w-20 flex items-center justify-center relative">
                      {quiz.userOps?.[0] ? <div className="scale-75"><CrocodileMouth type={quiz.userOps[0]} isActive={true} /></div> : <div className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-2xl">?</div>}
                   </div>
                   <div className="flex gap-2">
                    {['<', '=', '>'].map(sym => (
                      <button key={sym} onClick={() => handleOpChoice(idx, sym as any)} className={`w-10 h-10 rounded-xl font-black text-lg flex items-center justify-center transition-all ${quiz.userOps?.[0] === sym ? 'bg-emerald-500 text-white shadow-md scale-105' : 'bg-gray-100 text-gray-400'}`}>{sym}</button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center w-16">
                  <div className="text-3xl font-black text-slate-700">{quiz.nums[1]}</div>
                  {renderVisualDots(quiz.nums[1], 'bg-blue-400')}
                </div>
              </div>
            );
          }

          // --- RENDER TRUE/FALSE MODE ---
          if (quiz.mode === 'TRUE_FALSE') {
            
            // 2.1 BINARY MODE (2 Số)
            if (quiz.tfType === 'BINARY') {
                const isError = showErrors && quiz.userBool !== quiz.isStatementCorrect;
                return (
                  <div key={idx} className={`bg-white p-4 rounded-[24px] shadow-sm border-2 flex flex-col items-center gap-3 ${isError ? 'border-red-300 bg-red-50 animate-shake' : 'border-purple-50'}`}>
                    <div className="flex items-center gap-4 bg-purple-50 px-6 py-2 rounded-2xl border border-purple-100">
                      <span className="text-4xl font-black text-purple-700">{quiz.nums[0]}</span>
                      <div className="scale-75"><CrocodileMouth type={quiz.displayOp || '='} isActive={true} /></div>
                      <span className="text-4xl font-black text-purple-700">{quiz.nums[1]}</span>
                    </div>
                    <div className="flex gap-8 w-full justify-center">
                      <button onClick={() => handleBoolChoice(idx, true)} className={`flex-1 py-3 rounded-2xl border-b-4 font-black text-xl transition-all flex items-center justify-center gap-2 ${quiz.userBool === true ? 'bg-green-500 border-green-700 text-white scale-105' : 'bg-white border-gray-200 text-green-600 hover:bg-green-50'}`}><span>✅</span> Đúng</button>
                      <button onClick={() => handleBoolChoice(idx, false)} className={`flex-1 py-3 rounded-2xl border-b-4 font-black text-xl transition-all flex items-center justify-center gap-2 ${quiz.userBool === false ? 'bg-red-500 border-red-700 text-white scale-105' : 'bg-white border-gray-200 text-red-500 hover:bg-red-50'}`}><span>❌</span> Sai</button>
                    </div>
                  </div>
                );
            } 
            
            // 2.2 TERNARY MODE (3 Số - 3 Bước)
            else if (quiz.tfType === 'TERNARY') {
                const step = quiz.tfStep || 1;
                // Determine highlight style based on step
                const highlightPart1 = step === 1 ? 'scale-110 opacity-100 z-10' : 'opacity-40 grayscale';
                const highlightPart2 = step === 2 ? 'scale-110 opacity-100 z-10' : 'opacity-40 grayscale';
                const highlightWhole = step === 3 ? 'scale-105 ring-4 ring-orange-300 opacity-100' : (step === 4 ? 'opacity-100' : 'opacity-40');
                
                return (
                  <div id={`ternary-card-${idx}`} key={idx} className={`bg-white p-4 rounded-[32px] shadow-md border-2 border-orange-200 flex flex-col items-center gap-4 relative overflow-hidden`}>
                     {step < 4 && (
                       <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
                         <div className="h-full bg-orange-400 transition-all duration-300" style={{ width: `${(step-1)*33}%` }}></div>
                       </div>
                     )}

                     {/* Visual Chain Display */}
                     <div className={`flex items-center justify-center gap-1 transition-all duration-300 ${step === 3 || step === 4 ? highlightWhole : ''} bg-orange-50/50 p-2 rounded-2xl`}>
                        {/* Part 1: N1 op N2 */}
                        <div className={`flex items-center gap-1 p-1 rounded-xl transition-all duration-300 ${highlightPart1} ${step === 1 ? 'bg-white shadow-sm border border-orange-100' : ''}`}>
                             <span className="text-3xl font-black text-slate-700">{quiz.nums[0]}</span>
                             <div className="scale-[0.6] -mx-2"><CrocodileMouth type={quiz.tfOperators?.[0] || '='} isActive={true} /></div>
                             <span className="text-3xl font-black text-slate-700">{quiz.nums[1]}</span>
                        </div>
                        
                        {/* Part 2: N2 op N3 (N2 is shared visually but we duplicate for simpler logic or just bridge) */}
                        {/* For visual simplicity, let's just show Op2 and N3, implying N2 connection */}
                        <div className={`flex items-center gap-1 p-1 rounded-xl transition-all duration-300 ${highlightPart2} ${step === 2 ? 'bg-white shadow-sm border border-orange-100' : ''}`}>
                             {/* N2 ghost for spacing/visual anchor if needed, but let's just stick next to it */}
                             <div className="scale-[0.6] -mx-2"><CrocodileMouth type={quiz.tfOperators?.[1] || '='} isActive={true} /></div>
                             <span className="text-3xl font-black text-slate-700">{quiz.nums[2]}</span>
                        </div>
                     </div>

                     {/* Instruction Text */}
                     <div className="text-sm font-black text-orange-600">
                        {step === 1 && "Vế 1 đúng hay sai?"}
                        {step === 2 && "Vế 2 đúng hay sai?"}
                        {step === 3 && "Vậy cả câu đúng hay sai?"}
                        {step === 4 && "Hoàn thành! 🎉"}
                     </div>

                     {/* Interaction Buttons (Only show if not done) */}
                     {step < 4 && (
                       <div className="flex gap-4 w-full px-4">
                          <button onClick={() => handleBoolChoice(idx, true)} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-black shadow-[0_4px_0_rgb(21,128,61)] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2">✅ Đúng</button>
                          <button onClick={() => handleBoolChoice(idx, false)} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black shadow-[0_4px_0_rgb(185,28,28)] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2">❌ Sai</button>
                       </div>
                     )}
                     
                     {/* Completed State */}
                     {step === 4 && (
                       <div className="font-bold text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200 animate-bounce">
                           {quiz.tfTruths?.[2] ? "Cả câu ĐÚNG ✅" : "Cả câu SAI ❌"}
                       </div>
                     )}
                  </div>
                );
            }
          }

          // --- RENDER CHAIN MODE ---
          if (quiz.mode === 'CHAIN') {
            const isError = showErrors && !quiz.userOps?.every((o, i) => o === quiz.correctOps?.[i]);
            return (
              <div key={idx} className={`bg-white p-4 py-6 rounded-[32px] shadow-sm border-2 flex flex-col items-center gap-4 ${isError ? 'border-red-300 bg-red-50 animate-shake' : 'border-orange-100'}`}>
                <div className="flex items-center justify-center w-full gap-1 sm:gap-2">
                    <div className="flex flex-col items-center"><span className="text-3xl font-black text-slate-700">{quiz.nums[0]}</span>{renderVisualDots(quiz.nums[0], 'bg-orange-300')}</div>
                    <button onClick={() => handleSlotClick(idx, 0)} className={`w-14 h-12 rounded-xl border-2 flex items-center justify-center transition-all relative ${quiz.activeSlot === 0 ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200 z-10 scale-110' : 'border-dashed border-gray-300 bg-gray-50'}`}>{quiz.userOps?.[0] ? <div className="scale-[0.6]"><CrocodileMouth type={quiz.userOps[0]} isActive={true} /></div> : null}</button>
                    <div className="flex flex-col items-center"><span className="text-3xl font-black text-slate-700">{quiz.nums[1]}</span>{renderVisualDots(quiz.nums[1], 'bg-orange-300')}</div>
                    <button onClick={() => handleSlotClick(idx, 1)} className={`w-14 h-12 rounded-xl border-2 flex items-center justify-center transition-all relative ${quiz.activeSlot === 1 ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200 z-10 scale-110' : 'border-dashed border-gray-300 bg-gray-50'}`}>{quiz.userOps?.[1] ? <div className="scale-[0.6]"><CrocodileMouth type={quiz.userOps[1]} isActive={true} /></div> : null}</button>
                    <div className="flex flex-col items-center"><span className="text-3xl font-black text-slate-700">{quiz.nums[2]}</span>{renderVisualDots(quiz.nums[2], 'bg-orange-300')}</div>
                </div>
                <div className="flex gap-4 p-2 bg-orange-50 rounded-2xl border border-orange-100">
                    {['<', '=', '>'].map(sym => (
                      <button key={sym} onClick={() => handleOpChoice(idx, sym as any)} className="w-12 h-10 bg-white border-b-4 border-orange-200 text-orange-600 rounded-xl font-black text-xl active:scale-95 active:border-b-0 active:translate-y-1 transition-all shadow-sm hover:bg-orange-100">{sym}</button>
                    ))}
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="mt-6 w-full max-w-sm px-4 fixed bottom-4 z-20">
        {feedback && <div className={`mb-4 p-3 rounded-2xl bg-white border-2 border-${currentModeInfo?.color}-400 text-${currentModeInfo?.color}-600 font-black text-center animate-bounce shadow-xl text-sm`}>{feedback}</div>}
        {!isWon && <button onClick={checkResults} className={`w-full bg-${currentModeInfo?.color}-500 text-white py-4 rounded-2xl font-black text-xl shadow-[0_6px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none uppercase`}>Kiểm Tra ✨</button>}
      </div>
      
      <div className="h-20"></div>
    </div>
  );
};

export default ComparisonGame;
