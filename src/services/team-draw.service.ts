												  
import { Match, Player, DrawResult } from '../types/match.types';
												   

export class TeamDrawService {

    public static  generateMatches(playerCount: number, presentPlayers: Player[]): DrawResult {
        if (playerCount < 4 || playerCount > 99) {
            return {
                matches: [{
                    matchNumber: 1,
                    matchText: "Le nombre de joueurs doit être entre 4 et 99"
                }],
                triplettePlayerIds: []
            };
        }
        console.log("Présents :", presentPlayers);
        const players = [...presentPlayers];
        this.shuffleArray(players);
        const matches: Match[] = [];
        const triplettePlayerIds: number[] = [];
        const modulo = playerCount % 4;

        let matchNumber = 1;
        let remainingPlayers = [...players];

        console.log("modulo :", modulo);
        console.log("remainingPlayers :", remainingPlayers);
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

				 
															  
                    const lastTeam1 = remainingPlayers.splice(0, 2);
                    const lastTeam2 = remainingPlayers.splice(0, 3);

                    triplettePlayerIds.push(...lastTeam2.map(p => p.id));
														  

                    matches.push(this.createMatch(matchNumber++, lastTeam1, lastTeam2));
                }
                break;
        }

        console.log("triplettePlayerIds :", triplettePlayerIds);
        return { matches, triplettePlayerIds };
    }

    private static createMatch(matchNumber: number, team1: Player[], team2: Player[]): Match {
        const formatTeam = (team: Player[]) => team.map(p => p.id).join(", ").trim();
        const team1Text = formatTeam(team1);
        const team2Text = formatTeam(team2);
        return {
            matchNumber,
            matchText: team1Text && team2Text ? `${team1Text} contre ${team2Text}` : "Match incomplet",
        };
        //console.log(`Match ${i + Math.floor(playerCount / 4) + 1}: ${team1.join(", ")} contre ${team2.join(", ")}`);
    }

    private static shuffleArray(array: Player[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
  
}


function  updatePlayerBonus(players: Map<number, Player>, triplettePlayerIds: number[]): void { 
	players.forEach(player => {
		if (!player.present) {
			player.bonus = 0;
		} else if (triplettePlayerIds.includes(player.id)) {
			player.bonus += 1;
		} else {
			player.bonus = Math.max(0, player.bonus - 1);
		}
	});
}  



export {updatePlayerBonus}
//export {createMatch      }
