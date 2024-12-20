import { Observable } from '@nativescript/core';

export interface Match {
    matchNumber: number;
    matchText: string;
}

export class TeamDrawService extends Observable {
    public generateMatches(playerCount: number): Match[] {
        if (playerCount < 4 || playerCount > 99) {
            return [{
                matchNumber: 1,
                matchText: "Le nombre de joueurs doit être entre 4 et 99"
            }];
        }

        const players = Array.from({length: playerCount}, (_, i) => i + 1);
        this.shuffleArray(players);
        const matches: Match[] = [];
        const modulo = playerCount % 4;
        const baseTeamsCount = Math.floor(playerCount / 4);

        let matchNumber = 1;
        let remainingPlayers = [...players];

        switch (modulo) {
            case 0: // Uniquement des doublettes
                while (remainingPlayers.length >= 4) {
                    const team1 = remainingPlayers.splice(0, 2);
                    const team2 = remainingPlayers.splice(0, 2);
                    matches.push(this.createMatch(matchNumber++, team1, team2));
                }
                break;

            case 1: // Dernière ligne en 2v3
                while (remainingPlayers.length > 5) {
                    const team1 = remainingPlayers.splice(0, 2);
                    const team2 = remainingPlayers.splice(0, 2);
                    matches.push(this.createMatch(matchNumber++, team1, team2));
                }
                if (remainingPlayers.length === 5) {
                    const team1 = remainingPlayers.splice(0, 2);
                    const team2 = remainingPlayers.splice(0, 3);
                    matches.push(this.createMatch(matchNumber++, team1, team2));
                }
                break;

            case 2: // Dernière ligne en 3v3
                while (remainingPlayers.length > 6) {
                    const team1 = remainingPlayers.splice(0, 2);
                    const team2 = remainingPlayers.splice(0, 2);
                    matches.push(this.createMatch(matchNumber++, team1, team2));
                }
                if (remainingPlayers.length === 6) {
                    const team1 = remainingPlayers.splice(0, 3);
                    const team2 = remainingPlayers.splice(0, 3);
                    matches.push(this.createMatch(matchNumber++, team1, team2));
                }
                break;

            case 3: // Avant-dernière en 3v3, dernière en 2v3
                while (remainingPlayers.length > 11) {
                    const team1 = remainingPlayers.splice(0, 2);
                    const team2 = remainingPlayers.splice(0, 2);
                    matches.push(this.createMatch(matchNumber++, team1, team2));
                }
                if (remainingPlayers.length === 11) {
                    const team1 = remainingPlayers.splice(0, 3);
                    const team2 = remainingPlayers.splice(0, 3);
                    matches.push(this.createMatch(matchNumber++, team1, team2));
                    
                    const lastTeam1 = remainingPlayers.splice(0, 2);
                    const lastTeam2 = remainingPlayers.splice(0, 3);
                    matches.push(this.createMatch(matchNumber++, lastTeam1, lastTeam2));
                }
                break;
        }

        return matches;
    }

    private createMatch(number: number, team1: number[], team2: number[]): Match {
        return {
            matchNumber: number,
            matchText: `${team1.join(", ")} contre ${team2.join(", ")}`
        };
    }

    private shuffleArray(array: number[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}