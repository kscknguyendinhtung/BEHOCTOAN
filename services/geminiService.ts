
import { GoogleGenAI } from "@google/genai";

// Cache cheers để giảm gọi API nếu không cần thiết
const CACHE_CHEERS_SUCCESS = [
  "Giỏi quá bé ơi! 🎉",
  "Xuất sắc luôn! 🌟", 
  "Bé thông minh tuyệt đỉnh! 🌈",
  "Quá đỉnh, tiếp tục nhé! 🚀"
];

const CACHE_CHEERS_FAIL = [
  "Cố lên, bé đếm lại nhé! 💪",
  "Thử lại một chút là được ngay! 🍎",
  "Bé sắp làm đúng rồi đó! 🍭"
];

export const getCheer = async (isSuccess: boolean): Promise<string> => {
  // Nếu không có API Key, dùng cache
  if (!process.env.API_KEY) {
    const list = isSuccess ? CACHE_CHEERS_SUCCESS : CACHE_CHEERS_FAIL;
    return list[Math.floor(Math.random() * list.length)];
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest',
      contents: isSuccess 
        ? "Hãy viết một câu khen ngợi ngắn gọn, vui nhộn bằng tiếng Việt dành cho bé 5 tuổi vừa làm đúng bài toán. Có kèm emoji."
        : "Hãy viết một câu động viên ngắn gọn, nhẹ nhàng bằng tiếng Việt dành cho bé 5 tuổi làm sai bài toán, khích lệ bé thử lại. Có kèm emoji.",
    });

    return response.text || (isSuccess ? "Tuyệt vời! 🎉" : "Cố lên bé ơi! 💪");
  } catch (error) {
    console.error("Gemini API Error:", error);
    const list = isSuccess ? CACHE_CHEERS_SUCCESS : CACHE_CHEERS_FAIL;
    return list[Math.floor(Math.random() * list.length)];
  }
};
