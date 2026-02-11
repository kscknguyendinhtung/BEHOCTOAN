
// Dữ liệu câu khen ngợi Offline phong phú, vui nhộn cho bé
const CHEERS_SUCCESS = [
  "Giỏi quá bé ơi! 🎉",
  "Xuất sắc luôn! 🌟", 
  "Bé thông minh tuyệt đỉnh! 🌈",
  "Quá đỉnh, tiếp tục nhé! 🚀",
  "Woa, bé tính siêu như máy tính! 🖥️",
  "10 điểm về chỗ! 💯",
  "Tuyệt vời ông mặt trời! ☀️",
  "Bé làm đúng rồi, yeah! ✌️",
  "Siêu nhân toán học là đây! 🦸",
  "Chính xác! Bé ngoan quá! 🍬",
  "Bé giỏi nhất quả đất! 🌍",
  "Hoan hô! Đúng rồi! 👏",
  "Bé thông minh quá đi! 💖",
  "Tuyệt cú mèo! 🐱",
  "10 điểm cho bé! 🔟",
  "Bé làm bố mẹ vui quá! 🥰",
  "Siêu nhân Toán học! 🦸‍♂️",
  "Đúng rồi! Yeah! ✌️",
  "Xuất sắc! Bé ngoan lắm! 🌟",
  "Bé đếm siêu quá! 🚀"
];

const CHEERS_FAIL = [
  "Cố lên, bé đếm lại nhé! 💪",
  "Thử lại một chút là được ngay! 🍎",
  "Bé sắp làm đúng rồi đó! 🍭",
  "Sai một xíu thôi, không sao đâu! 🐢",
  "Bé nhìn kỹ lại nha! 👀",
  "Hít thở sâu và thử lại nào! 🍃",
  "Chưa đúng rồi, bé chọn lại đi! 🎲",
  "Sai rồi, thử lại nhé! 🐢",
  "Gần đúng rồi đó! 🤏",
  "Không sao, làm lại nào! 🌈",
  "Thử lại lần nữa đi bé! 🎲",
  "Bé bình tĩnh nhìn lại nhé! 🔍",
  "Thử lại lần nữa nào! 🔄",
  "Bé đừng buồn, thử lại nhé! 🌞"
];

// Hàm lấy câu khen ngợi (giữ nguyên async để tương thích với code cũ nhưng chạy tức thì)
export const getCheer = async (isSuccess: boolean): Promise<string> => {
  const list = isSuccess ? CHEERS_SUCCESS : CHEERS_FAIL;
  // Lấy ngẫu nhiên một câu trong danh sách
  return list[Math.floor(Math.random() * list.length)];
};
