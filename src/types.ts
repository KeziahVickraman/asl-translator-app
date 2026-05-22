export type DisplayMode = "home" | "camera" | "text" | "learn" | "social" | "settings";

export interface SignLetter {
  char: string;
  icon?: string;
}

export interface SignResult {
  type: "WORD" | "FINGERSPELLING";
  word: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  isUnknown?: boolean;
  letters?: SignLetter[];
}

export interface SignItem {
  id: string;
  word: string;
  category: string;
  description: string;
  imageUrl: string;
  usage?: string;
  isGenerated?: boolean;
}

export interface TranslationHistoryItem {
  id: string;
  timestamp: string;
  text: string;
  recognizedText: string;
  mode: "camera" | "text";
  language?: "ASL" | "Auslan" | "BSL";
}

export interface GlobalState {
  mode: DisplayMode;
  inputText: string;
  transcript: string;
  recognisedSign: string;
  signResults: SignResult[];
  isListening: boolean;
  isCameraActive: boolean;
  languageClass: "ASL" | "Auslan" | "BSL";
  textSize: number;
  highContrast: boolean;
  hapticFeedback: boolean;
  aiNoiseSuppression: boolean;
  history: TranslationHistoryItem[];
}
