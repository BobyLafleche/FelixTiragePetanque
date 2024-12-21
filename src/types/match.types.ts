// src/types/match.types.ts
export interface Match {
    matchNumber: number;
    matchText: string;
}

export interface Player {
    id: number;
    present: boolean;
    bonus: number;
}

export interface DrawResult {
  matches: Match[];
  triplettePlayerIds: number[];
}