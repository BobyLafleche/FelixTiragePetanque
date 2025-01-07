// src/types/match.types.ts
export interface Match {
    matchNumber: number;
    matchText: string;
    team1: Player[];
    team2: Player[];
}

export interface MatchPlayer {
    team: Player[];
}

export interface Player {
    id: number;
    present: boolean;
    bonus: number;
    drawCount : number;
}

export interface DrawResult {
  matches: { teams: string; terrain: string }[];
  triplettePlayerIds: number[];
}