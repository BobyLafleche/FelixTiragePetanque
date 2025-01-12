// src/types/match.types.ts

// Interface pour un joueur
export interface Player {
    id: number;
    present: boolean;
    bonus: number;
    drawCount: number;
}

// Interface pour un match
export interface Match {
    matchNumber: number;
    matchText: string;
    team1: Player[];
    team2: Player[];
    terrain: string;
    teams: string[];
}

// Interface pour le résultat du tirage
export interface DrawResult {
    matches: Match[];  // Simplifié car Match contient déjà terrain
    triplettePlayerIds: number[];
}

export interface MatchDistribution {
  doublettes: number;  // matchs 2v2
  triplettes: number;  // matchs 3v3
  mixtes: number;      // matchs 2v3
  reste: number;       // joueurs non assignés
}