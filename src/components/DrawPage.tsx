import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaDice } from 'react-icons/fa';
import { TeamDrawService } from '../services/team-draw.service';
import { Player, DrawResult } from '../types/match.types';
import { useLastMatches } from '../contexts/LastMatchesContext';

interface DrawPageProps {
  playerCount: string;
  presentPlayers: Player[];
  onMatchesUpdate: (DrawResult) => void;
  NumPartie: number;
  setNumPartie: React.Dispatch<React.SetStateAction<number>>;
}

const DrawPage: React.FC<DrawPageProps> = ({ playerCount, presentPlayers, onMatchesUpdate, NumPartie, setNumPartie }) => {
  const { lastMatches, setLastMatches } = useLastMatches();
  const navigate = useNavigate();
  const [csvData, setCsvData] = useState<any[]>([]);
  const [usedGrounds, setUsedGrounds] = useState<number[]>([]);
  const mainRef = useRef<HTMLDivElement>(null);
  const previousNumPartie = useRef<number | null>(null);

  // Récupérer le nombre de terrains depuis localStorage
  const nbrTerrains = localStorage.getItem('NbrTerrains');
  const hasGrounds = nbrTerrains && parseInt(nbrTerrains) > 0; // Vérifier si les terrains sont gérés

	  useEffect(() => {
		if (hasGrounds) {
		  // Vérifier si usedGrounds est déjà stocké dans localStorage
		  const storedUsedGrounds = localStorage.getItem('usedGrounds');
		  if (storedUsedGrounds) {
			// Convertir la chaîne "1,0,0,0,0" en tableau [1, 0, 0, 0, 0]
			const parsedUsedGrounds = storedUsedGrounds.split(',').map(Number);
			setUsedGrounds(parsedUsedGrounds);
		  } else {
			// Sinon, initialiser usedGrounds avec un tableau rempli de zéros
			const initialGrounds = Array.from(
			  { length: parseInt(nbrTerrains!) },
			  () => 0 // Remplir chaque élément du tableau avec 0
			);
			setUsedGrounds(initialGrounds);
			// Stocker usedGrounds dans localStorage
			localStorage.setItem('usedGrounds', initialGrounds.join(',')); // Stocker sous forme de chaîne
		  }
		} else {
		  // Si hasGrounds est false, initialiser usedGrounds à un tableau vide
		  setUsedGrounds([]);
		}
	  }, [nbrTerrains, hasGrounds]);
	  
	  // useEffect(() => {
		// Check if the page is fully constructed and if it's a new game
		// if (mainRef.current && (previousNumPartie.current === null || previousNumPartie.current !== NumPartie)) {
			// previousNumPartie.current = NumPartie;
			// console.log(mainRef.current.outerHTML); // Log the outerHTML
		// }
	  // }, [NumPartie]);

  // Fonction pour incrémenter NumPartie
  const incrementNumPartie = () => {
    setNumPartie(prevNumPartie => prevNumPartie + 1);
  };

  const handleDraw = () => {
    try {
      // Générer les matches
      const drawResult = TeamDrawService.generateMatches(
        presentPlayers.length,
        presentPlayers,
        lastMatches,
        NumPartie
      );

      // Vérifier que le résultat est valide
      if (!drawResult || !Array.isArray(drawResult.matches)) {
        throw new Error('Invalid draw result');
      }

      // Mettre à jour les matches et lastMatches
      onMatchesUpdate(drawResult);

      // Mettre à jour l'utilisation des terrains (seulement si les terrains sont gérés)
      if (hasGrounds) {												  
        const updatedGrounds = [...usedGrounds]; // Copie de l'état actuel
        drawResult.matches.forEach(match => {
          let index;
          if (!localStorage.getItem('typeMarquage')) {
            index = match.terrain; // Utiliser le numéro du terrain directement
          } else {
            index = match.terrain.charCodeAt(0) - 'A'.charCodeAt(0); // Convertir 'A' à 0, 'B' à 1, etc.
          }

          // Vérifier que l'index est valide
          if (index >= 0 && index < updatedGrounds.length) {
            // Incrémenter le compteur d'utilisation pour ce terrain
            updatedGrounds[index] += 1;
          } else {
            console.warn(`Invalid terrain index: ${index}`);
          }
        });

        // Mettre à jour l'état usedGrounds
        setUsedGrounds(updatedGrounds);
        localStorage.setItem('usedGrounds',updatedGrounds);
      }

      // Incrémenter le numéro de partie et mettre à jour les données CSV
      incrementNumPartie();
      setCsvData(drawResult.matches);

      // Naviguer vers la page des équipes
      navigate('/teams');
    } catch (error) {
      console.error('Error during draw:', error);
    }
  };

  return (
    <main ref={mainRef} className="container mx-auto px-4 py-6 max-w-lg">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-center items-center mb-4">
          <h1 className="text-xl font-bold text-center">Tirage au Sort</h1>
        </div>
        <div className="text-center mb-4">
          <p>Joueurs présents: {presentPlayers.length} / {playerCount}</p>
        </div>
        <div className="flex gap-2 justify-center">
          <button
            onClick={handleDraw}
            className={`flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors ${presentPlayers.length < 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={presentPlayers.length < 4}
          >
            <FaDice className="text-xl" />
            <span>TIRAGE</span>
          </button>
          <button
            onClick={() => navigate('/presence')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
          >
            <FaUsers />
            <span>PRÉSENCE</span>
          </button>
        </div>
      </div>
    </main>
  );
};

export default DrawPage;
