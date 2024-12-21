export interface Match {
    matchNumber: number;
    matchText: string;
}

export class TeamDrawService {
    public resetBonuses(players: Map<number, Player>): Map<number, Player> {
        const newPlayers = new Map(players);
        for (const [id, player] of newPlayers) {
            newPlayers.set(id, { ...player, bonus: 0 });
        }
        return newPlayers;
    }

    public generateMatches(playerCount: number, presentPlayers: number[]): Match[] {
        if (playerCount < 4 || playerCount > 99) {
            return [{
                matchNumber: 1,
                matchText: "Le nombre de joueurs doit être entre 4 et 99"
            }];
        }


        const players = [...presentPlayers];
        console.log("Players to draw:", players);

        this.shuffleArray(players);
        const matches: Match[] = [];
        let remainingPlayers = [...players];
        let matchNumber = 1;

        while (remainingPlayers.length >= 4) {
            const currentTeam1 = remainingPlayers.splice(0, 2);
            const currentTeam2 = remainingPlayers.splice(0, 2);

            matches.push({
                matchNumber: matchNumber++,
                matchText: `${currentTeam1.join(", ")} contre ${currentTeam2.join(", ")}`
            });
        }

        // Handle remaining players by adding them to last match
        if (remainingPlayers.length > 0 && matches.length > 0) {
            const lastMatch = matches[matches.length - 1];
            const [team1, team2] = lastMatch.matchText.split(" contre ");
            matches[matches.length - 1] = {
                matchNumber: lastMatch.matchNumber,
                matchText: remainingPlayers.length === 1 
                    ? `${team1}, ${remainingPlayers[0]} contre ${team2}`
                    : `${team1} contre ${team2}, ${remainingPlayers.join(", ")}`
            };
        }

        return matches;
    }

    public updateTripletteBonus(players: Map<number, Player>, triplettePlayerIds: number[]): Map<number, Player> {
        const newPlayers = new Map(players);
        triplettePlayerIds.forEach(id => {
            const player = newPlayers.get(id);
            if (player) {
                newPlayers.set(id, { ...player, bonus: player.bonus + 1 });
            }
        });
        return newPlayers;
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

    private filterPlayersWithBonus(players: Player[]): {
        withBonus: Player[],
        withoutBonus: Player[]
    } {
        return {
            withBonus: players.filter(p => p.bonus > 0),
            withoutBonus: players.filter(p => p.bonus === 0)
        };
    }
}