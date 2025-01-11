import { Match, Player, DrawResult } from "../types/match.types";
 
import { jsPDF } from "jspdf";

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
  private static convertToCSVWithTab(data: any[], numPartie: number): string {
    const csvRows = [];

    // Loop through each match and format the output
    data.forEach(match => {
      const matchNumber = match.matchNumber;      
      const matchTerrain = match.terrain;

      // Get IDs for team 1
      const team1Ids: number[] = match.team1.map(player => player.id);
      
      // Get IDs for team 2
      const team2Ids: number[] = match.team2.map(player => player.id);
      
      // Format the row based on the length of team1Ids
      let row: string;
      if (team1Ids.length === 3) {
        row = [numPartie + 1, matchNumber, ...matchTerrain, ...team1Ids, ...team2Ids].join('\t');
      } else {
        row = [numPartie + 1, matchNumber, ...matchTerrain, ...team1Ids, '', ...team2Ids].join('\t');
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
    lastMatches: any[],
    numPartie: number
  ): DrawResult {
    const Diversification = JSON.parse(
      localStorage.getItem("diversification") || "false"
    );
	 // Récupérer NbrTerrains depuis localStorage
    const nbrTerrains = Number(localStorage.getItem('NbrTerrains')) || 0;
    const maxPlayers = nbrTerrains && parseInt(nbrTerrains) > 0 ? 6 * parseInt(nbrTerrains) : playerCount;

    // Valider le nombre de joueurs
    if (playerCount < 4 || playerCount > maxPlayers) {
      return {
        matches: [
          {
            matchNumber: 1,
            matchText: "Le nombre de joueurs doit être entre 4 et maxPlayers",
            team1: [],
            team2: [],
            terrain: 0,
            teams: [],
          },
        ],
        triplettePlayerIds: [],
      };
    }
    console.log("Présents :", presentPlayers);

    // Séparer les joueurs en groupes en fonction de leur bonus
    let playersWithBonus: Player[] = presentPlayers.filter((player) => player.bonus > 0);
    let playersWithNoBonus: Player[] = presentPlayers.filter((player) => player.bonus === 0);
	
    this.shuffleArray(playersWithBonus);
    this.shuffleArray(playersWithNoBonus);

    let modulo = playerCount % 4;

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
//-------------------------------------
	const calculerNombreDoublettes = (
		N : number,
		T :number
	): number => {
	  // Calcul du nombre maximal de triplettes
	  const maxTriplettes = Math.floor(N / 6);

	  // Calcul du nombre de joueurs restants après avoir créé les triplettes
	  const joueursRestants = N - 6 * maxTriplettes;
	  let NombreDoublettes = T-maxTriplettes;
	  if (NombreDoublettes) {
		  switch(joueursRestants) {	  		  
			  case 1:
			  case 2:
			  case 3:	  	  
				NombreDoublettes ++;
				break;
			  case 0:
			  case 4:			  
				NombreDoublettes +=2;
				break;
			 case 5:
			   NombreDoublettes =0;
		  }
	  }
	  return NombreDoublettes;
	};
		
	  const createAndAddMatch = (
		team1Size: number,
		team2Size: number
	  ): number => {
		// Function to create teams and add a match
		const team1 = remainingPlayers.splice(0, team1Size);
		const team2 = remainingPlayers.splice(0, team2Size);

		// Ajouter les joueurs des triplettes à la liste des triplettePlayerIds
		if (team1Size === 3) triplettePlayerIds.push(...team1.map(p => p.id));
		if (team2Size === 3) triplettePlayerIds.push(...team2.map(p => p.id));

		// Ajouter le match à la liste des matches
		matches.push(this.createMatch(matchNumber++, team1, team2));

		return matchNumber;
	  };
//-----------------------------------
	const reste = [-1, 1, 2, 7];
	let EstimationTerrains = Math.floor(remainingPlayers.length / 4);
	let MaxTriplettes = nbrTerrains * 6;
	let compensation = 0;
	// Activer la compensation s'il n'y a pas assez de terrains
	if (EstimationTerrains > nbrTerrains) {
	  compensation = EstimationTerrains - nbrTerrains;
	  console.log("Pas assez de terrains :", nbrTerrains, EstimationTerrains);
	}
	if (compensation > 0 ) {
		let nombreDoublettes = calculerNombreDoublettes(remainingPlayers.length, nbrTerrains);
		console.log("Nombre optimal de doublettes :", nombreDoublettes);
		// Ajuster la répartition des joueurs en fonction de la compensation
		while (nombreDoublettes) {
		  const team1 = remainingPlayers.splice(0, 2);
		  const team2 = remainingPlayers.splice(0, 2);													   
		  matches.push(this.createMatch(matchNumber++, team1, team2));
		  nombreDoublettes--;
		}
		let nombreTriplettes = Math.floor(remainingPlayers.length/6);
		// Ajuster la répartition des joueurs en fonction de la compensation
		while (nombreTriplettes > 0) {
		  const team1 = remainingPlayers.splice(0, 3);
		  const team2 = remainingPlayers.splice(0, 3);
		  matches.push(this.createMatch(matchNumber++, team1, team2));
		  nombreTriplettes --;
		}
		modulo = remainingPlayers.length %4;
	}
	else {
		while (remainingPlayers.length > (4 + reste[modulo])) {
		  const team1 = remainingPlayers.splice(0, 2);
		  const team2 = remainingPlayers.splice(0, 2);
		  matches.push(this.createMatch(matchNumber++, team1, team2));
		}	
	}
	switch (modulo) {
	case 1:
	  // Dernière ligne en 2v3
	  createAndAddMatch(2, 3);
	  break;

	case 2:
	  // Dernière ligne en 3v3
	  createAndAddMatch(3, 3);
	  break;

	case 3:
	  // Avant-dernière en 3v3, dernière en 2v3
	  createAndAddMatch(3, 3); // Avant-dernière ligne
	  createAndAddMatch(2, 3); // Dernière ligne
	  break;
	}

    const savedNbrTerrains = parseInt(localStorage.getItem('NbrTerrains') || '1');
    const savedTypeMarquage = JSON.parse(localStorage.getItem('typeMarquage') || 'false');

    //const teams = matches.map(match => [match.team1.map(player => player.id), match.team2.map(player => player.id)]);
    const distributedMatches = this.distributeMatches(matches);//teams

	// 
	const logType = localStorage.getItem("logType") || "None"; // Récupérer le type de log

	if (logType === "CSV") {
	  // Générer les données CSV
	  const newCSVData = this.convertToCSVWithTab(distributedMatches, numPartie);

	  // Récupérer les données CSV existantes
	  const existingCSVData = localStorage.getItem("tempCSVData") || "";

	  // Combiner les données existantes avec les nouvelles données
	  const combinedCSVData = existingCSVData ? existingCSVData + '\n' + newCSVData : newCSVData;

	  // Stocker les données CSV combinées dans localStorage
	  localStorage.setItem("tempCSVData", combinedCSVData);
	}

    return { matches: distributedMatches, triplettePlayerIds };
  }

  private static areTerrainsAdjacent = (terrain1: string, terrain2: string): boolean => {
    return (
      terrain1 === String.fromCharCode(terrain2.charCodeAt(0) + 1) ||
      terrain1 === String.fromCharCode(terrain2.charCodeAt(0) - 1) ||
      terrain1 === (parseInt(terrain2) + 1).toString() ||
      terrain1 === (parseInt(terrain2) - 1).toString()
    );
  };

	private static distributeMatches(
	  matches: Array<{
		matchNumber: number;
		matchText: string;
		team1: any[];
		team2: any[];
	  }>
	): { matchNumber: number; teams: string; team1: any[]; team2: any[]; terrain: string }[] {
	  const distributedMatches: { matchNumber: number; teams: string; team1: any[]; team2: any[]; terrain: string }[] = [];
	  const nbrTerrains = parseInt(localStorage.getItem('NbrTerrains') || '0');

	  if (nbrTerrains === 0) {
		return matches.map(match => ({
		  matchNumber: match.matchNumber,
		  teams: match.matchText,
		  team1: match.team1,
		  team2: match.team2,
		  terrain: '',
		}));
	  }

	  const storedUsedGrounds = localStorage.getItem('usedGrounds');
	  let usedGrounds: number[] = storedUsedGrounds ? storedUsedGrounds.split(',').map(Number) : Array(nbrTerrains).fill(0);

	  const terrains: string[] = Array.from({ length: nbrTerrains }, (_, i) =>
		JSON.parse(localStorage.getItem('typeMarquage') || 'false')
		  ? String.fromCharCode(65 + i)
		  : (i + 1).toString()
	  );

	  if (matches.length > nbrTerrains) {
		throw new Error('Not enough terrains for the number of matches.');
	  }

	  // Initial terrain assignment favoring least used
	  const sortedTerrains = [...terrains].sort((a, b) => usedGrounds[terrains.indexOf(a)] - usedGrounds[terrains.indexOf(b)]);
	  const assignedTerrains = new Set<string>();

	  matches.forEach((match) => {
		for (const terrain of sortedTerrains) {
		  if (!assignedTerrains.has(terrain)) {
			distributedMatches.push({
			  matchNumber: match.matchNumber,
			  teams: match.matchText,
			  team1: match.team1,
			  team2: match.team2,
			  terrain,
			});
			assignedTerrains.add(terrain);
			usedGrounds[terrains.indexOf(terrain)]++;
			break;
		  }
		}
	  });

	  // Correction des terrains consécutifs
	  for (let i = 1; i < distributedMatches.length; i++) {
		const currentTerrain = distributedMatches[i].terrain;
		const previousTerrain = distributedMatches[i - 1].terrain;

		if (this.areTerrainsConsecutive(currentTerrain, previousTerrain)) {
		  // Trouver un autre terrain disponible
		  for (let j = 0; j < distributedMatches.length; j++) {
			if (!this.areTerrainsConsecutive(distributedMatches[j].terrain, previousTerrain) && j !== i) {
			  // Échanger les terrains
			  const temp = distributedMatches[i].terrain;
			  distributedMatches[i].terrain = distributedMatches[j].terrain;
			  distributedMatches[j].terrain = temp;
			  break;
			}
		  }
		}
	  }

	  localStorage.setItem('usedGrounds', usedGrounds.join(','));

	  return distributedMatches;
	}

	// Fonction pour vérifier si deux terrains sont consécutifs
	private static areTerrainsConsecutive(terrain1: string, terrain2: string): boolean {
	  // Vérifier si les terrains sont numériques
	  const isTerrain1Numeric = !isNaN(Number(terrain1));
	  const isTerrain2Numeric = !isNaN(Number(terrain2));

	  if (isTerrain1Numeric && isTerrain2Numeric) {
		// Si les deux terrains sont numériques, vérifier s'ils sont consécutifs
		return Math.abs(Number(terrain1) - Number(terrain2)) === 1;
	  }

	  // Si les deux terrains sont des lettres (A-Z), vérifier s'ils sont consécutifs
	  if (!isTerrain1Numeric && !isTerrain2Numeric) {
		const charCode1 = terrain1.charCodeAt(0);
		const charCode2 = terrain2.charCodeAt(0);

		// Vérifier si les deux caractères sont des lettres (A-Z) et s'ils sont consécutifs
		return Math.abs(charCode1 - charCode2) === 1;
	  }

	  // Si un terrain est numérique et l'autre est une lettre, ils ne sont pas consécutifs
	  return false;
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
