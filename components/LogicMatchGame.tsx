
import React, { useState, useEffect, useCallback } from 'react';
import { getCheer } from '../services/geminiService';

interface MatchItem {
  id: number;
  mainEmoji: string;
  mainLabel: string;
  correctEmoji: string;
  correctLabel: string;
  wrongEmojis: { emoji: string; label: string }[];
  description: string;
}

const REAL_DATA: MatchItem[] = [
  // 1-10: Đồ ăn & Động vật
  { id: 1, mainEmoji: '🐒', mainLabel: 'Bạn Khỉ', correctEmoji: '🍌', correctLabel: 'Chuối', wrongEmojis: [{ emoji: '🦴', label: 'Xương' }, { emoji: '🥕', label: 'Cà rốt' }], description: 'Bạn Khỉ thích ăn gì nhất?' },
  { id: 2, mainEmoji: '🐱', mainLabel: 'Bạn Mèo', correctEmoji: '🐟', correctLabel: 'Con Cá', wrongEmojis: [{ emoji: '🧀', label: 'Phô mai' }, { emoji: '🥩', label: 'Thịt bò' }], description: 'Bạn Mèo thích ăn món gì?' },
  { id: 3, mainEmoji: '🐰', mainLabel: 'Bạn Thỏ', correctEmoji: '🥕', correctLabel: 'Cà Rốt', wrongEmojis: [{ emoji: '🍗', label: 'Đùi gà' }, { emoji: '🍞', label: 'Bánh mì' }], description: 'Bạn Thỏ đói bụng sẽ ăn gì?' },
  { id: 4, mainEmoji: '🐶', mainLabel: 'Bạn Chó', correctEmoji: '🦴', correctLabel: 'Khúc Xương', wrongEmojis: [{ emoji: '🍕', label: 'Pizza' }, { emoji: '🍟', label: 'Khoai tây' }], description: 'Món quà tặng cho bạn Chó?' },
  { id: 5, mainEmoji: '🐘', mainLabel: 'Bạn Voi', correctEmoji: '🎋', correctLabel: 'Cây Mía', wrongEmojis: [{ emoji: '🍔', label: 'Bánh kẹp' }, { emoji: '🍳', label: 'Trứng rán' }], description: 'Bạn Voi thích ăn cây gì nhất?' },
  { id: 6, mainEmoji: '🐼', mainLabel: 'Gấu Trúc', correctEmoji: '🎋', correctLabel: 'Cây Trúc', wrongEmojis: [{ emoji: '🍫', label: 'Sô-cô-la' }, { emoji: '🍇', label: 'Quả nho' }], description: 'Gấu Trúc thích ăn cây gì?' },
  { id: 7, mainEmoji: '🐿️', mainLabel: 'Sóc Nhỏ', correctEmoji: '🥜', correctLabel: 'Hạt Dẻ', wrongEmojis: [{ emoji: '🍭', label: 'Kẹo mút' }, { emoji: '🍙', label: 'Cơm nắm' }], description: 'Bạn Sóc hay giấu hạt gì?' },
  { id: 8, mainEmoji: '🐎', mainLabel: 'Bạn Ngựa', correctEmoji: '🌿', correctLabel: 'Cỏ Xanh', wrongEmojis: [{ emoji: '🥓', label: 'Thịt nguội' }, { emoji: '🍪', label: 'Bánh quy' }], description: 'Bạn Ngựa thích ăn gì trên đồng cỏ?' },
  { id: 9, mainEmoji: '🐔', mainLabel: 'Bạn Gà', correctEmoji: '🌽', correctLabel: 'Hạt Ngô', wrongEmojis: [{ emoji: '🥣', label: 'Súp' }, { emoji: '🍰', label: 'Bánh ngọt' }], description: 'Bạn Gà tìm hạt gì để ăn?' },
  { id: 10, mainEmoji: '🐭', mainLabel: 'Bạn Chuột', correctEmoji: '🧀', correctLabel: 'Phô Mai', wrongEmojis: [{ emoji: '🌶️', label: 'Quả ớt' }, { emoji: '🥥', label: 'Quả dừa' }], description: 'Bạn Chuột thích ăn gì nhất?' },
  
  // 11-20: Đồ dùng sinh hoạt
  { id: 11, mainEmoji: '🍚', mainLabel: 'Bát Cơm', correctEmoji: '🥢', correctLabel: 'Đũa', wrongEmojis: [{ emoji: '🎒', label: 'Cặp' }, { emoji: '🪁', label: 'Diều' }], description: 'Bé dùng gì để ăn cơm?' },
  { id: 12, mainEmoji: '🦷', mainLabel: 'Răng Xinh', correctEmoji: '🪥', correctLabel: 'Bàn Chải', wrongEmojis: [{ emoji: '🔨', label: 'Búa' }, { emoji: '🧺', label: 'Giỏ' }], description: 'Bé đánh răng bằng gì?' },
  { id: 13, mainEmoji: '🚿', mainLabel: 'Vòi Hoa Sen', correctEmoji: '🧼', correctLabel: 'Xà Bông', wrongEmojis: [{ emoji: '🪖', label: 'Mũ bảo hiểm' }, { emoji: '🔭', label: 'Kính viễn vọng' }], description: 'Khi đi tắm bé cần dùng gì?' },
  { id: 14, mainEmoji: '🏫', mainLabel: 'Trường Học', correctEmoji: '🎒', correctLabel: 'Cặp Sách', wrongEmojis: [{ emoji: '🥣', label: 'Bát' }, { emoji: '🛋️', label: 'Ghế' }], description: 'Đi học bé mang gì trên vai?' },
  { id: 15, mainEmoji: '👣', mainLabel: 'Bàn Chân', correctEmoji: '🧦', correctLabel: 'Đôi Tất', wrongEmojis: [{ emoji: '👒', label: 'Mũ' }, { emoji: '🕶️', label: 'Kính' }], description: 'Trước khi đi giày bé đi gì?' },
  { id: 16, mainEmoji: '🛌', mainLabel: 'Giường Ngủ', correctEmoji: ' pillows', correctLabel: 'Cái Gối', wrongEmojis: [{ emoji: '🚲', label: 'Xe đạp' }, { emoji: '🪣', label: 'Cái xô' }], description: 'Bé đi ngủ cần nằm lên cái gì?' },
  { id: 17, mainEmoji: '🖌️', mainLabel: 'Cọ Vẽ', correctEmoji: '🎨', correctLabel: 'Bảng Màu', wrongEmojis: [{ emoji: '🧸', label: 'Gấu bông' }, { emoji: '🏸', label: 'Vợt' }], description: 'Cọ vẽ cần đi cùng cái gì?' },
  { id: 18, mainEmoji: '👕', mainLabel: 'Cái Áo', correctEmoji: '👖', correctLabel: 'Cái Quần', wrongEmojis: [{ emoji: '🥄', label: 'Cái thìa' }, { emoji: '🪴', label: 'Chậu cây' }], description: 'Bé mặc áo rồi phải mặc thêm gì?' },
  { id: 19, mainEmoji: '🥣', mainLabel: 'Bát Súp', correctEmoji: '🥄', correctLabel: 'Cái Thìa', wrongEmojis: [{ emoji: '🪒', label: 'Dao cạo' }, { emoji: '🪁', label: 'Con diều' }], description: 'Bé dùng gì để xúc súp ăn?' },
  { id: 20, mainEmoji: '🧺', mainLabel: 'Giỏ Quần Áo', correctEmoji: '👗', correctLabel: 'Váy Xinh', wrongEmojis: [{ emoji: '🚜', label: 'Máy kéo' }, { emoji: '🎻', label: 'Đàn' }], description: 'Trong giỏ quần áo có gì?' },

  // 21-30: Thiên nhiên & Thời tiết
  { id: 21, mainEmoji: '☀️', mainLabel: 'Ông Mặt Trời', correctEmoji: '🕶️', correctLabel: 'Kính Râm', wrongEmojis: [{ emoji: '🧤', label: 'Găng tay' }, { emoji: '🧣', label: 'Khăn len' }], description: 'Trời nắng chói bé nên đeo gì?' },
  { id: 22, mainEmoji: '🌧️', mainLabel: 'Trời Mưa', correctEmoji: '☂️', correctLabel: 'Cái Ô', wrongEmojis: [{ emoji: '🍦', label: 'Kem' }, { emoji: '🔋', label: 'Pin' }], description: 'Trời mưa bé cần cầm gì?' },
  { id: 23, mainEmoji: '❄️', mainLabel: 'Trời Tuyết', correctEmoji: '🧣', correctLabel: 'Khăn Len', wrongEmojis: [{ emoji: '🩴', label: 'Dép lê' }, { emoji: '🕶️', label: 'Kính mát' }], description: 'Trời lạnh bé cần quàng gì?' },
  { id: 24, mainEmoji: '🌙', mainLabel: 'Mặt Trăng', correctEmoji: '⭐', correctLabel: 'Ngôi Sao', wrongEmojis: [{ emoji: '🍅', label: 'Cà chua' }, { emoji: '🚁', label: 'Máy bay' }], description: 'Buổi đêm mặt trăng đi cùng ai?' },
  { id: 25, mainEmoji: '🌊', mainLabel: 'Bãi Biển', correctEmoji: '🏖️', correctLabel: 'Cái Dù', wrongEmojis: [{ emoji: '🔥', label: 'Ngọn lửa' }, { emoji: '🏛️', label: 'Nhà thờ' }], description: 'Đi biển bé cần cái gì che nắng?' },
  { id: 26, mainEmoji: '🐝', mainLabel: 'Bạn Ong', correctEmoji: '🌸', correctLabel: 'Bông Hoa', wrongEmojis: [{ emoji: '🚲', label: 'Xe đạp' }, { emoji: '📺', label: 'Tivi' }], description: 'Bạn Ong thích tìm gì để lấy mật?' },
  { id: 27, mainEmoji: '🧤', mainLabel: 'Găng Tay', correctEmoji: '☃️', correctLabel: 'Người Tuyết', wrongEmojis: [{ emoji: '🍉', label: 'Dưa hấu' }, { emoji: '🌞', label: 'Nắng' }], description: 'Đeo găng tay để làm gì nhỉ?' },
  { id: 28, mainEmoji: '⚡', mainLabel: 'Sấm Sét', correctEmoji: '☁️', correctLabel: 'Đám Mây', wrongEmojis: [{ emoji: '🧁', label: 'Bánh' }, { emoji: '🎁', label: 'Quà' }], description: 'Sấm sét thường đi cùng cái gì?' },
  { id: 29, mainEmoji: '🌳', mainLabel: 'Cây Xanh', correctEmoji: '🍎', correctLabel: 'Quả Táo', wrongEmojis: [{ emoji: '🥛', label: 'Sữa' }, { emoji: '🧂', label: 'Muối' }], description: 'Cây xanh cho bé quả gì đây?' },
  { id: 30, mainEmoji: '🪴', mainLabel: 'Chậu Cây', correctEmoji: '🚿', correctLabel: 'Bình Tưới', wrongEmojis: [{ emoji: '🪑', label: 'Cái ghế' }, { emoji: '🧸', label: 'Gấu' }], description: 'Bé dùng gì để chăm sóc cây?' },

  // 31-40: Phương tiện & Nghề nghiệp
  { id: 31, mainEmoji: '🚂', mainLabel: 'Tàu Hỏa', correctEmoji: '🛤️', correctLabel: 'Đường Ray', wrongEmojis: [{ emoji: '🛶', label: 'Cái thuyền' }, { emoji: '🚁', label: 'Máy bay' }], description: 'Tàu hỏa chạy trên cái gì?' },
  { id: 32, mainEmoji: '🚢', mainLabel: 'Con Thuyền', correctEmoji: '🌊', correctLabel: 'Sóng Biển', wrongEmojis: [{ emoji: '🏜️', label: 'Sa mạc' }, { emoji: '🏢', label: 'Nhà cao' }], description: 'Thuyền đi ở đâu bé nhỉ?' },
  { id: 33, mainEmoji: '✈️', mainLabel: 'Máy Bay', correctEmoji: '☁️', correctLabel: 'Đám Mây', wrongEmojis: [{ emoji: '🚜', label: 'Máy kéo' }, { emoji: '🏡', label: 'Nhà' }], description: 'Máy bay bay trên cao cùng ai?' },
  { id: 34, mainEmoji: '🚑', mainLabel: 'Xe Cấp Cứu', correctEmoji: '🏥', correctLabel: 'Bệnh Viện', wrongEmojis: [{ emoji: '🎠', label: 'Đu quay' }, { emoji: '🎬', label: 'Phim' }], description: 'Xe cấp cứu đưa bệnh nhân đi đâu?' },
  { id: 35, mainEmoji: '🚲', mainLabel: 'Xe Đạp', correctEmoji: '🪖', correctLabel: 'Mũ Bảo Hiểm', wrongEmojis: [{ emoji: '👔', label: 'Cà vạt' }, { emoji: '🎹', label: 'Đàn' }], description: 'Đi xe đạp bé nhớ đội gì?' },
  { id: 36, mainEmoji: '👨‍🚒', mainLabel: 'Chú Cứu Hỏa', correctEmoji: '🚒', correctLabel: 'Xe Cứu Hỏa', wrongEmojis: [{ emoji: '🎸', label: 'Đàn' }, { emoji: '🍳', label: 'Chảo' }], description: 'Chú cứu hỏa đi xe gì?' },
  { id: 37, mainEmoji: '👮', mainLabel: 'Chú Cảnh Sát', correctEmoji: '🚓', correctLabel: 'Xe Cảnh Sát', wrongEmojis: [{ emoji: '🚲', label: 'Xe đạp' }, { emoji: '🛵', label: 'Xe máy' }], description: 'Xe của chú cảnh sát đâu nhỉ?' },
  { id: 38, mainEmoji: '🚀', mainLabel: 'Tên Lửa', correctEmoji: '👨‍🚀', correctLabel: 'Phi Hành Gia', wrongEmojis: [{ emoji: '🤡', label: 'Chú hề' }, { emoji: '🧛', label: 'Ma cà rồng' }], description: 'Ai lái tên lửa bay vào vũ trụ?' },
  { id: 39, mainEmoji: '👨‍🍳', mainLabel: 'Đầu Bếp', correctEmoji: '🍲', correctLabel: 'Nồi Súp', wrongEmojis: [{ emoji: '🪃', label: 'Boomerang' }, { emoji: '🎳', label: 'Bowling' }], description: 'Đầu bếp dùng gì để nấu ăn?' },
  { id: 40, mainEmoji: '🧑‍🏫', mainLabel: 'Cô Giáo', correctEmoji: '📚', correctLabel: 'Quyển Sách', wrongEmojis: [{ emoji: '🧨', label: 'Pháo' }, { emoji: '🏹', label: 'Cái cung' }], description: 'Cô giáo dùng gì để dạy bé?' },

  // 41-50: Giải trí & Khác
  { id: 41, mainEmoji: '⚽', mainLabel: 'Quả Bóng', correctEmoji: '🥅', correctLabel: 'Khung Thành', wrongEmojis: [{ emoji: '🛏️', label: 'Giường' }, { emoji: '🚿', label: 'Vòi sen' }], description: 'Sút bóng vào đâu để ghi bàn?' },
  { id: 42, mainEmoji: '🎈', mainLabel: 'Quả Bóng Bay', correctEmoji: '🧵', correctLabel: 'Sợi Chỉ', wrongEmojis: [{ emoji: '🪓', label: 'Cái rìu' }, { emoji: '🪜', label: 'Cái thang' }], description: 'Bé cầm dây gì để giữ bóng?' },
  { id: 43, mainEmoji: '🎁', mainLabel: 'Hộp Quà', correctEmoji: '🎀', correctLabel: 'Cái Nơ', wrongEmojis: [{ emoji: '🩹', label: 'Băng dán' }, { emoji: '🔑', label: 'Chìa khóa' }], description: 'Hộp quà có cái gì xinh xinh?' },
  { id: 44, mainEmoji: '🎂', mainLabel: 'Bánh Sinh Nhật', correctEmoji: '🕯️', correctLabel: 'Ngọn Nến', wrongEmojis: [{ emoji: '🧯', label: 'Bình cứu hỏa' }, { emoji: '🔦', label: 'Đèn pin' }], description: 'Bé thổi cái gì trên bánh?' },
  { id: 45, mainEmoji: '📸', mainLabel: 'Máy Ảnh', correctEmoji: '🖼️', correctLabel: 'Bức Ảnh', wrongEmojis: [{ emoji: '🧽', label: 'Miếng xốp' }, { emoji: '🪁', label: 'Diều' }], description: 'Chụp ảnh xong sẽ có cái gì?' },
  { id: 46, mainEmoji: '🎸', mainLabel: 'Đàn Ghi-ta', correctEmoji: '🎶', correctLabel: 'Nốt Nhạc', wrongEmojis: [{ emoji: '👣', label: 'Dấu chân' }, { emoji: '💦', label: 'Giọt nước' }], description: 'Đàn phát ra cái gì nghe vui tai?' },
  { id: 47, mainEmoji: '🗝️', mainLabel: 'Chìa Khóa', correctEmoji: '🔒', correctLabel: 'Ổ Khóa', wrongEmojis: [{ emoji: '📦', label: 'Thùng' }, { emoji: '📎', label: 'Kẹp giấy' }], description: 'Chìa khóa dùng để mở cái gì?' },
  { id: 48, mainEmoji: '🎏', mainLabel: 'Con Diều', correctEmoji: '🌬️', correctLabel: 'Cơn Gió', wrongEmojis: [{ emoji: '🌋', label: 'Núi lửa' }, { emoji: '🧱', label: 'Gạch' }], description: 'Có cái gì thì diều mới bay cao?' },
  { id: 49, mainEmoji: '🍦', mainLabel: 'Cây Kem', correctEmoji: '👅', correctLabel: 'Cái Lưỡi', wrongEmojis: [{ emoji: '👂', label: 'Cái tai' }, { emoji: '👃', label: 'Cái mũi' }], description: 'Bé dùng gì để nếm vị kem?' },
  { id: 50, mainEmoji: '🧸', mainLabel: 'Gấu Bông', correctEmoji: '🛌', correctLabel: 'Giường Ngủ', wrongEmojis: [{ emoji: '🛁', label: 'Bồn tắm' }, { emoji: '🎢', label: 'Tàu lượn' }], description: 'Bé ôm gấu bông khi đi đâu?' }
];

const LogicMatchGame: React.FC<{ onBack: () => void; onWin: (stars: number) => void; startLevel?: number }> = ({ onBack, onWin, startLevel = 1 }) => {
  const [currentIndex, setCurrentIndex] = useState(startLevel - 1);
  const [options, setOptions] = useState<{ emoji: string; label: string; isCorrect: boolean }[]>([]);
  const [feedback, setFeedback] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [wrongSelection, setWrongSelection] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Lấy dữ liệu theo index, hỗ trợ lặp lại nếu hết 50 câu (hoặc mở rộng sau này)
  const currentItem = REAL_DATA[currentIndex % REAL_DATA.length];

  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    const item = REAL_DATA[currentIndex % REAL_DATA.length];
    const opts = [
      { emoji: item.correctEmoji, label: item.correctLabel, isCorrect: true },
      ...item.wrongEmojis.map(w => ({ ...w, isCorrect: false }))
    ].sort(() => Math.random() - 0.5);
    setOptions(opts);
    setSelectedId(null);
    setWrongSelection(null);
    setFeedback('');
    
    const timer = setTimeout(() => speakText(item.description), 600);
    return () => clearTimeout(timer);
  }, [currentIndex, speakText]);

  const handleChoice = async (idx: number) => {
    if (selectedId !== null || isAnimating) return;
    
    speakText(options[idx].label);

    if (options[idx].isCorrect) {
      setSelectedId(idx);
      setIsAnimating(true);
      const cheer = await getCheer(true);
      setFeedback(cheer);
      onWin(10);
      
      setTimeout(() => speakText(cheer), 800);

      setTimeout(() => {
        setIsAnimating(false);
        // Tiến tới câu tiếp theo
        setCurrentIndex(prev => prev + 1);
      }, 2500);
    } else {
      setWrongSelection(idx);
      const cheer = await getCheer(false);
      setFeedback(cheer);
      speakText(cheer);
      setTimeout(() => setWrongSelection(null), 1200);
    }
  };

  return (
    <div className="w-full flex flex-col items-center animate-fadeIn px-2 pb-10">
      <div className="bg-white/95 p-3 rounded-[30px] shadow-sm border-2 border-orange-400 mb-4 text-center w-full relative">
        <button onClick={onBack} className="absolute left-3 top-3 bg-gray-100 w-7 h-7 flex items-center justify-center rounded-full active:scale-90">🏠</button>
        <h2 className="text-lg font-black text-orange-600 uppercase">Đôi Bạn Hoàn Hảo</h2>
        <div className="flex items-center justify-center gap-1.5">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-tighter">Câu số: {currentIndex + 1} / {REAL_DATA.length}</p>
          {isSpeaking && <span className="text-xs animate-pulse">🔊</span>}
        </div>
      </div>

      <div className="bg-white p-4 py-6 rounded-[32px] shadow-md border-2 border-orange-50 w-full flex flex-col items-center gap-5">
        <div className="flex flex-col items-center gap-3 w-full">
          <div className={`text-7xl transition-all duration-700 ${isAnimating ? 'scale-110 rotate-12' : ''}`}>
            {currentItem.mainEmoji}
          </div>
          <div className="flex items-center gap-2 bg-orange-50 px-4 py-3 rounded-2xl border border-orange-100 w-full">
            <p className="text-orange-800 font-bold text-sm text-center flex-1 italic leading-tight">
              "{currentItem.description}"
            </p>
            <button 
              onClick={() => speakText(currentItem.description)} 
              className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm active:scale-90"
            >
              🔊
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          {options.map((opt, idx) => (
            <button 
              key={idx} 
              onClick={() => handleChoice(idx)} 
              disabled={isAnimating}
              className={`flex items-center p-3 rounded-2xl border-2 transition-all 
                ${selectedId === idx ? 'bg-green-500 border-green-200 text-white shadow-md' : 
                  wrongSelection === idx ? 'animate-shake border-red-500 bg-red-50' : 
                  'bg-white border-orange-50 shadow-sm active:scale-95'}`}
            >
              <div className="text-4xl mr-4">{opt.emoji}</div>
              <div className="font-black uppercase text-xs flex-1 text-left tracking-wide">
                {opt.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className="mt-4 p-3 rounded-2xl bg-white border-2 border-orange-400 text-orange-600 font-black text-sm animate-bounce shadow-md w-full text-center">
          {feedback}
        </div>
      )}
      
      <div className="mt-4 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
        Bé hãy chọn hình đúng nhất nhé!
      </div>
    </div>
  );
};

export default LogicMatchGame;
