
export enum GameMode {
  ADDITION_ONLY = 'ADDITION_ONLY',
  MIXED_LOGIC = 'MIXED_LOGIC'
}

export type AppView = 'MENU' | 'PYRAMID' | 'COMPARISON' | 'CALCULATION' | 'MAZE' | 'PATTERN' | 'SHAPE_COUNT' | 'LOGIC_MATCH';

export interface ComparisonQuiz {
  mode: 'CLASSIC' | 'TRUE_FALSE' | 'CHAIN';
  nums: number[]; // [n1, n2] hoặc [n1, n2, n3]
  
  // Dành cho Classic & Chain (Điền dấu)
  correctOps?: ('<' | '>' | '=')[]; // Mảng các đáp án đúng
  userOps?: ('<' | '>' | '=' | null)[]; // Mảng các lựa chọn của bé
  activeSlot?: number; // Slot đang được chọn để điền (cho mode Chain)

  // Dành cho True/False (Đúng sai)
  displayOp?: '<' | '>' | '='; // Dấu hiển thị (cho mode Binary)
  isStatementCorrect?: boolean; // Đáp án đúng (cho mode Binary)
  userBool?: boolean | null; // Bé chọn Đúng hay Sai (cho mode Binary)

  // Dành cho True/False Nâng Cao (Ternary - 3 số)
  tfType?: 'BINARY' | 'TERNARY'; 
  tfOperators?: ('<' | '>' | '=')[]; // 2 dấu hiển thị [op1, op2]
  tfStep?: 1 | 2 | 3 | 4; // 1: Check vế 1, 2: Check vế 2, 3: Check cả câu, 4: Hoàn thành
  tfTruths?: boolean[]; // [Đúng/Sai vế 1, Đúng/Sai vế 2, Đúng/Sai cả câu]
  tfUserAnswers?: (boolean | null)[]; // Câu trả lời của bé cho 3 bước
}

export interface CalculationQuiz {
  num1: number;
  num2: number;
  operator: '+' | '-';
  options: number[];
  answer: number;
}

export interface MazeLevel {
  id: number;
  targetEmoji: string;
  targetName: string;
  vehicleEmoji: string;
  correctNumber: number;
  paths: { id: number; d: string }[];
}
