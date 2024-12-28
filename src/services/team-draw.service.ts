import { Match, Player, DrawResult } from "../types/match.types";

export class TeamDrawService {
  public static generateMatches(
    playerCount: number,
    presentPlayers: Player[]
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
            lastMatchAssociations
          );
          const team2 = this.createTeam(
            remainingPlayers,
            lastMatchAssociations
          );
          matches.push(this.createMatch(matchNumber++, team1, team2));
        }
        break;

      case 1: // Dernière ligne en 2v3
        while (remainingPlayers.length > 5) {
          const team1 = this.createTeam(
            remainingPlayers,
            lastMatchAssociations
          );
          const team2 = this.createTeam(
            remainingPlayers,
            lastMatchAssociations
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
            lastMatchAssociations
          );
          const team2 = this.createTeam(
            remainingPlayers,
            lastMatchAssociations
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
            lastMatchAssociations
          );
          const team2 = this.createTeam(
            remainingPlayers,
            lastMatchAssociations
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

    console.log("triplettePlayerIds :", triplettePlayerIds);
    return { matches, triplettePlayerIds };
  }

  private static createTeam(
    remainingPlayers: Player[],
    lastMatchAssociations: Set<string>
  ): Player[] {
    let team: Player[] = [];
    let attempt = 0;
    // Essayer de créer une équipe qui n'a pas joué ensemble dans le dernier match
    while (team.length < 2 && attempt < 10) {
      // Limite d'essais pour éviter boucle infinie
      const player = remainingPlayers.splice(0, 1)[0];
      let canAdd = true;

      // Vérifier si ce joueur a joué avec un autre joueur dans cette équipe dans le dernier match
      team.forEach((existingPlayer) => {
        if (lastMatchAssociations.has(`${existingPlayer.id},${player.id}`)) {
          canAdd = false; // Si oui, on ne l'ajoute pas
        }
      });

      if (canAdd) {
        team.push(player);
      }

      attempt++;
    }

    // Ajouter cette association aux "derniers matchs" si l'équipe est validée
    if (team.length === 2) {
      lastMatchAssociations.add(`${team[0].id},${team[1].id}`);
    }

    return team;
  }

  private static createMatch(
    matchNumber: number,
    team1: Player[],
    team2: Player[]
  ): Match {
    const formatTeam = (team: Player[]) =>
      team
        .map((p) => p.id)
        .join(", ")
        .trim();
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

const handleDraw = () => {
  console.log('presentPlayers before draw:', presentPlayers);
  const drawResult = TeamDrawService.generateMatches(presentPlayers.length, presentPlayers);
  onMatchesUpdate(drawResult);
  
  // Extract team1 and team2 from drawResult and store them in the global lastMatches
  lastMatches.team1 = drawResult.matches.map(match => match.team1);
  lastMatches.team2 = drawResult.matches.map(match => match.team2);

  navigate('/teams');
};

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
