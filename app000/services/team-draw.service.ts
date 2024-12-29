import { Observable } from '@nativescript/core';
import { Match, Player, DrawResult } from '../types/match.types';

export class TeamDrawService extends Observable {
    public resetBonuses(players: Map<number, Player>): Map<number, Player> {
        const newPlayers = new Map(players);
        for (const [id, player] of newPlayers) {
            newPlayers.set(id, { ...player, bonus: 0 });
        }
        return newPlayers;
    }

    public generateMatches(playerCount: number, presentPlayers: Player[]): DrawResult {
		// Validation du nombre de joueurs
        if (playerCount < 4 || playerCount > 99) {
            return [{
                matchNumber: 1,
                matchText: "Le nombre de joueurs doit être entre 4 et 99"
            }];
        }

        // Logs de débogage
        console.log("Présents :", presentPlayers);

        // Mélange des joueurs
        const players = [...presentPlayers];
        this.shuffleArray(players);
        const matches: Match[] = [];
		const triplettePlayerIds: number[] = [];												
        const modulo = playerCount % 4;

        let matchNumber = 1;
        let remainingPlayers = [...players];

        // Génération des matches en fonction du modulo														 
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
                    triplettePlayerIds.push(...team2.map(p => p.id));																	 
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
                    triplettePlayerIds.push(...team1.map(p => p.id));																	 
                    const team2 = remainingPlayers.splice(0, 3);
                    triplettePlayerIds.push(...team2.map(p => p.id));																	 
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
                    triplettePlayerIds.push(...team1.map(p => p.id));

                    const team2 = remainingPlayers.splice(0, 3);
                    triplettePlayerIds.push(...team2.map(p => p.id));

                    matches.push(this.createMatch(matchNumber++, team1, team2));
                    
															  
                    // Pour éviter la duplication des joueurs
					const lastTeam1 = remainingPlayers.splice(0, 2);
                    const lastTeam2 = remainingPlayers.splice(0, 3);

                    // Ajouter uniquement les joueurs non encore ajoutés à triplettePlayerIds
                    triplettePlayerIds.push(...lastTeam2.map(p => p.id));

                    matches.push(this.createMatch(matchNumber++, lastTeam1, lastTeam2));
                }
                break;
        }

		 
        // Logs de débogage
        console.log("triplettePlayerIds :", triplettePlayerIds);
        return { matches, triplettePlayerIds };

    }

    private createMatch(matchNumber: number, team1: Player[], team2: Player[]): Match {
        return {
            matchNumber,
            matchText: `${team1.map(p => p.id).join(", ")} contre ${team2.map(p => p.id).join(", ")}`,
        };
    }

    private shuffleArray(array: Player[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }


	public updateTripletteBonus(players: Map<number, Player>, triplettePlayerIds: number[]): void {
		triplettePlayerIds.forEach(id => {
			const player = players.get(id);
			if (player) {
				players.set(id, { ...player, bonus: player.bonus + 1 });
			}
		});
	}

	public updatePlayerBonus(players: Map<number, Player>, triplettePlayerIds: number[]): void {
		for (const [id, player] of players) {
			if (!player.present) {
				players.set(id, { ...player, bonus: 0 });
			} else if (triplettePlayerIds.includes(id)) {
				players.set(id, { ...player, bonus: player.bonus + 1 });
			} else {
				players.set(id, { ...player, bonus: Math.max(0, player.bonus - 1) });
			}
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

