export type HistoryItem = {
  q: string;
  dir: "ko-fr" | "fr-ko";
  at: number; // Date.now()
};
