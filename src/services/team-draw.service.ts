import { Match, Player, DrawResult } from "../types/match.types";

export class TeamDrawService {
  // Function to convert data to CSV format
  private static convertToCSV(data: { [key: string]: any }[]): string {
    if (!data || data.length === 0) return '';
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(',')); // Add headers

    for (const row of data) {
      csvRows.push(headers.map(fieldName => JSON.stringify(row[fieldName], (key, value) => value === null ? '' : value)).join(','));
    }
    
    return csvRows.join('\n');
  }

  // Function to convert data to CSV format with semicolon as separator
  private static convertToCSVWithSemicolon(data: { [key: string]: any }[]): string {
    if (!data || data.length === 0) return '';
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(';')); // Use semicolon as separator

    for (const row of data) {
      csvRows.push(headers.map(fieldName => JSON.stringify(row[fieldName], (key, value) => value === null ? '' : value)).join(';'));
    }
    
    return csvRows.join('\n');
  }

  // Function to convert data to CSV format with tab as separator
  private static convertToCSVWithTab(data: any[]): string {
    const csvRows = [];

    // Loop through each match and format the output
    data.forEach(match => {
      const matchNumber = match.matchNumber;
      
      // Get IDs for team 1
      const team1Ids: number[] = match.team1.map(player => player.id);
      
      // Get IDs for team 2
      const team2Ids: number[] = match.team2.map(player => player.id);
      
      // Format the row based on the length of team1Ids
      let row: string;
      if (team1Ids.length === 3) {
        row = [matchNumber, ...team1Ids, ...team2Ids].join('\t');
      } else {
        row = [matchNumber, ...team1Ids, '', ...team2Ids].join('\t');
      }
      
      // Add the formatted row to csvRows
      csvRows.push(row);
    });

    return csvRows.join('\n');
  }

  // Function to download CSV file
  public static downloadCSV(data: any[]): void {
    const csvData = this.convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'matches.csv'); // Specify the file name
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  public static generateMatches(
    playerCount: number,
    presentPlayers: Player[],
    lastMatches: any[]
  ): DrawResult {
    const Diversification = JSON.parse(
      localStorage.getItem("diversification") || "false"
    );

    if (playerCount < 4 || playerCount > 99) {
      return {
        matches: [
          {
            matchNumber: 1,
            matchText: "Le nombre de joueurs doit être entre 4 et 99",
            team1: [],
            team2: [] ,
          },
        ],
        triplettePlayerIds: [],
      };
    }
    console.log("Présents :", presentPlayers);

    // Séparer les joueurs en groupes en fonction de leur bonus
    let playersWithBonus: Player[] = [];
    let playersWithNoBonus: Player[] = [];

    playersWithBonus = presentPlayers.filter((player) => player.bonus > 0);
    playersWithNoBonus = presentPlayers.filter((player) => player.bonus === 0);	
    this.shuffleArray(playersWithBonus);
    this.shuffleArray(playersWithNoBonus);

    const modulo = playerCount % 4;

    // Extraire les derniers 3 joueurs de playersWithNoBonus en fonction du modulo
    const lastPlayers = playersWithNoBonus.slice(-3 * modulo);

    // Ajouter les premiers joueurs restants de playersWithNoBonus avec playersWithBonus dans playersDoublettes
    const playersDoublettes = [...playersWithBonus, ...playersWithNoBonus.slice(0, -3 * modulo)];

    this.shuffleArray(playersDoublettes);

    // Combinaison finale des joueurs en un seul tableau
    const players = [...playersDoublettes, ...lastPlayers];

    const matches: Match[] = [];
    const triplettePlayerIds: number[] = [];

    let matchNumber = 1;
    let remainingPlayers = [...players];

    console.log("modulo :", modulo);
    console.log("remainingPlayers :", remainingPlayers);

    // Structure pour suivre les associations des joueurs
    let lastMatchAssociations: Set<string> = new Set();

    switch (modulo) {
      case 0: // Uniquement des doublettes
        while (remainingPlayers.length >= 4) {
          const team1 = this.createTeam(
            remainingPlayers,
            Diversification,
            lastMatches
          );
          const team2 = this.createTeam(
            remainingPlayers,
            Diversification,
            lastMatches
          );
          matches.push(this.createMatch(matchNumber++, team1, team2));
        }
        break;

      case 1: // Dernière ligne en 2v3
        while (remainingPlayers.length > 5) {
          const team1 = this.createTeam(
            remainingPlayers,
            Diversification,
            lastMatches
          );
          const team2 = this.createTeam(
            remainingPlayers,
            Diversification,
            lastMatches
          );
          matches.push(this.createMatch(matchNumber++, team1, team2));
        }
        if (remainingPlayers.length === 5) {
          const team1 = remainingPlayers.splice(0, 2);
          const team2 = remainingPlayers.splice(0, 3);
          triplettePlayerIds.push(...team2.map((p) => p.id));
          matches.push(this.createMatch(matchNumber++, team1, team2));
        }
        break;

      case 2: // Dernière ligne en 3v3
        while (remainingPlayers.length > 6) {
          const team1 = this.createTeam(
            remainingPlayers,
            Diversification,
            lastMatches
          );
          const team2 = this.createTeam(
            remainingPlayers,
            Diversification,
            lastMatches
          );
          matches.push(this.createMatch(matchNumber++, team1, team2));
        }
        if (remainingPlayers.length === 6) {
          const team1 = remainingPlayers.splice(0, 3);
          triplettePlayerIds.push(...team1.map((p) => p.id));
          const team2 = remainingPlayers.splice(0, 3);
          triplettePlayerIds.push(...team2.map((p) => p.id));
          matches.push(this.createMatch(matchNumber++, team1, team2));
        }
        break;

      case 3: // Avant-dernière en 3v3, dernière en 2v3
        while (remainingPlayers.length > 11) {
          const team1 = this.createTeam(
            remainingPlayers,
            Diversification,
            lastMatches
          );
          const team2 = this.createTeam(
            remainingPlayers,
            Diversification,
            lastMatches
          );
          matches.push(this.createMatch(matchNumber++, team1, team2));
        }
        if (remainingPlayers.length === 11) {
          const team1 = remainingPlayers.splice(0, 3);
          triplettePlayerIds.push(...team1.map((p) => p.id));

          const team2 = remainingPlayers.splice(0, 3);
          triplettePlayerIds.push(...team2.map((p) => p.id));

          matches.push(this.createMatch(matchNumber++, team1, team2));

          const lastTeam1 = remainingPlayers.splice(0, 2);
          const lastTeam2 = remainingPlayers.splice(0, 3);

          triplettePlayerIds.push(...lastTeam2.map((p) => p.id));

          matches.push(this.createMatch(matchNumber++, lastTeam1, lastTeam2));
        }
        break;
    }

    // Check if logging is enabled before writing to CSV
    const isLoggingEnabled = JSON.parse(localStorage.getItem("loggingEnabled") || "false");
    if (isLoggingEnabled) {
      const newCSVData = this.convertToCSVWithTab(matches); // Use the updated method

      // Retrieve existing CSV data
      const existingCSVData = localStorage.getItem("tempCSVData") || "";
      
      // Combine existing data with new data
      const combinedCSVData = existingCSVData ? existingCSVData + '\n' + newCSVData : newCSVData;

      // Store the combined CSV data in localStorage
      localStorage.setItem("tempCSVData", combinedCSVData);
    }

    return { matches, triplettePlayerIds };
  }

  private static createTeam(
    remainingPlayers: Player[],
    diversification: boolean,
    lastMatches: any[]
  ): Player[] {
    let team: Player[] = [];
    let attempt = 0;

    // Si la diversification n'est pas activée ou si les conditions minimales ne sont pas respectées
    if (!diversification || remainingPlayers.length < 2 || lastMatches.length === 0) {
      return remainingPlayers.splice(0, 2); // Retire et retourne les deux premiers joueurs
    }

    // Créer une liste des IDs des joueurs restants
    let localRemainingPlayers = [...remainingPlayers.map(player => player.id)];

    while (team.length < 2 && attempt < 10) {
      const candidateId = localRemainingPlayers.shift(); // Prend le premier joueur disponible
      if (!candidateId) break; // Plus de joueurs disponibles

      const candidate = remainingPlayers.find(player => player.id === candidateId);
      if (!candidate) continue; // Ignore si le joueur n'est pas trouvé

      // Vérifie si le joueur peut être ajouté à l'équipe
      const isCompatible = lastMatches.every(match =>
        !match.includes(candidateId) || // Le joueur n'était pas dans ce match
        team.every(player => !match.includes(player.id)) // Pas de conflit avec l'équipe existante
      );

      if (isCompatible) {
        team.push(candidate);
      }

      // Réinitialise les joueurs si aucun compatible n'a été trouvé
      if (team.length < 2 && localRemainingPlayers.length === 0) {
        localRemainingPlayers = [...remainingPlayers.map(player => player.id)];
        team = [];
        attempt++;
      }
    }

    // Supprime les joueurs sélectionnés de remainingPlayers
    team.forEach(selectedPlayer => {
      const index = remainingPlayers.findIndex(player => player.id === selectedPlayer.id);
      if (index !== -1) {
        remainingPlayers.splice(index, 1); // Retire le joueur du tableau des joueurs restants
      }
    });

    return team;
  }

  private static createMatch(
    matchNumber: number,
    team1: Player[],
    team2: Player[]
  ): Match {
	const formatTeam = (team: Player[]) =>
	  team
		.map((p) => p.id) // Extraire les IDs
		.sort((a, b) => a - b) // Trier les IDs en tant que nombres
		.join(", ") // Joindre les IDs avec des virgules
		.trim(); // Supprimer les espaces inutiles
    const team1Text = formatTeam(team1);
    const team2Text = formatTeam(team2);
    return {
      matchNumber,
      matchText:
        team1Text && team2Text
          ? `${team1Text} contre ${team2Text}`
          : "Match incomplet",
      team1: team1,
      team2: team2,
    };
  }

  private static shuffleArray(array: Player[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

let lastMatches = { team1: [], team2: [] };

//const handleDraw = () => {
//  console.log('presentPlayers before draw:', presentPlayers);
//  const drawResult = TeamDrawService.generateMatches(presentPlayers.length, presentPlayers, lastMatches);
//  onMatchesUpdate(drawResult);
//  
//  // Extract team1 and team2 from drawResult and store them in the global lastMatches
//  lastMatches.team1 = drawResult.matches.map(match => match.team1);
//  lastMatches.team2 = drawResult.matches.map(match => match.team2);
//
//  navigate('/teams');
//};

function updatePlayerBonus(
  players: Map<number, Player>,
  triplettePlayerIds: number[]
): void {
  // Lire les paramètres sauvegardés depuis localStorage
  const savedDuration = Number(localStorage.getItem("duration")) || 0; // Valeur par défaut : 0

  players.forEach((player) => {
    player.drawCount += 1;
    if (!player.present) {
      player.bonus = 0;
      player.drawCount = 0;
    } else if (triplettePlayerIds.includes(player.id)) {
      player.bonus += 1;
    } else if (player.drawCount >= savedDuration) {
      player.bonus = Math.max(0, player.bonus - 1);
      if (!player.bonus) player.drawCount = 0;
    }
  });
}

export { updatePlayerBonus };
//export {createMatch      }
