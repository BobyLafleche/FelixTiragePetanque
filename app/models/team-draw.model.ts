export class TeamDrawModel {
    static drawTeams(playerCount: number): string[] {
        if (playerCount < 4) return ["Il faut au moins 4 joueurs"];
        if (playerCount > 99) return ["Le nombre maximum de joueurs est 99"];
        
        const players = Array.from({length: playerCount}, (_, i) => i + 1);
        this.shuffleArray(players);
        const matches: string[] = [];
        
        const modulo = playerCount % 4;
        const baseTeamsCount = Math.floor(playerCount / 4);
        
        // Traiter selon le modulo
        switch (modulo) {
            case 0: // Que des doublettes
                for (let i = 0; i < baseTeamsCount; i++) {
                    const team1 = players.splice(0, 2);
                    const team2 = players.splice(0, 2);
                    matches.push(`${team1[0]}, ${team1[1]} contre ${team2[0]}, ${team2[1]}`);
                }
                break;
                
            case 1: // Le dernier joueur va dans la dernière ligne pour faire 2v3
                for (let i = 0; i < baseTeamsCount - 1; i++) {
                    const team1 = players.splice(0, 2);
                    const team2 = players.splice(0, 2);
                    matches.push(`${team1[0]}, ${team1[1]} contre ${team2[0]}, ${team2[1]}`);
                }
                // Dernière ligne en 2v3
                const lastTeam1 = players.splice(0, 2);
                const lastTeam2 = players.splice(0, 3);
                matches.push(`${lastTeam1[0]}, ${lastTeam1[1]} contre ${lastTeam2[0]}, ${lastTeam2[1]}, ${lastTeam2[2]}`);
                break;
                
            case 2: // Les deux derniers joueurs font une triplette
                for (let i = 0; i < baseTeamsCount - 1; i++) {
                    const team1 = players.splice(0, 2);
                    const team2 = players.splice(0, 2);
                    matches.push(`${team1[0]}, ${team1[1]} contre ${team2[0]}, ${team2[1]}`);
                }
                // Dernière ligne en 3v3
                const tripleTeam1 = players.splice(0, 3);
                const tripleTeam2 = players.splice(0, 3);
                matches.push(`${tripleTeam1[0]}, ${tripleTeam1[1]}, ${tripleTeam1[2]} contre ${tripleTeam2[0]}, ${tripleTeam2[1]}, ${tripleTeam2[2]}`);
                break;
                
            case 3: // Avant-dernière ligne en 3v3 et dernière ligne en 2v3
                for (let i = 0; i < baseTeamsCount - 2; i++) {
                    const team1 = players.splice(0, 2);
                    const team2 = players.splice(0, 2);
                    matches.push(`${team1[0]}, ${team1[1]} contre ${team2[0]}, ${team2[1]}`);
                }
                // Avant-dernière ligne en 3v3
                const preLastTeam1 = players.splice(0, 3);
                const preLastTeam2 = players.splice(0, 3);
                matches.push(`${preLastTeam1[0]}, ${preLastTeam1[1]}, ${preLastTeam1[2]} contre ${preLastTeam2[0]}, ${preLastTeam2[1]}, ${preLastTeam2[2]}`);
                // Dernière ligne en 2v3
                const finalTeam1 = players.splice(0, 2);
                const finalTeam2 = players.splice(0, 3);
                matches.push(`${finalTeam1[0]}, ${finalTeam1[1]} contre ${finalTeam2[0]}, ${finalTeam2[1]}, ${finalTeam2[2]}`);
                break;
        }
        
        return matches;
    }

    private static shuffleArray(array: number[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}</content>