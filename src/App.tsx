import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import PresenceList from './components/PresenceList';
import DrawPage from './components/DrawPage';
import TeamsDisplay from './components/TeamsDisplay';
import { Match, Player } from './types/match.types';
import { TeamDrawService,updatePlayerBonus } from './services/team-draw.service';
import { LastMatchesProvider } from './contexts/LastMatchesContext'; // Ensure the path is correct


function App() {
  const navigate = useNavigate();
  const [playerCount, setPlayerCount] = useState('');
  //const [matchesState, setMatchesState] = useState<Match[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [presentPlayers, setPresentPlayers] = useState<Player[]>([]);
  const [triplettePlayerIds, setTriplettePlayerIds] = useState<number[]>([]);
  const [players, setPlayers] = useState<Map<number, Player>>(new Map());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastMatches, setLastMatches] = useState([]);
  const [isLoggingEnabled, setIsLoggingEnabled] = useState(() => {
    return JSON.parse(localStorage.getItem("loggingEnabled") || "false");
  });

  const teamDrawService = new TeamDrawService();

  useEffect(() => {
    // Clear the temporary CSV data on startup
    localStorage.removeItem("tempCSVData");
  }, []);

  const handlePlayerCountChange = (count: string) => {
    setPlayerCount(count);
    if (!isNaN(parseInt(count))) {
      const newPresent: Player[] = [];
      for (let i = 1; i <= parseInt(count); i++) {
        newPresent.push({ id: i, present: true, bonus: 0, drawCount: 0 });
      }
      setPresentPlayers(newPresent);
    }
  };

  const handleReset = () => {
    setPlayerCount('');
    setPresentPlayers([]);
    setMatches([]);
	setTriplettePlayerIds([]);
    setPlayers(new Map());
    setLastMatches([]);
  };

  const handleTogglePresence = (playerId: number) => {
    setPresentPlayers(prev => prev.map(player => 
      player.id === playerId ? { ...player, present: !player.present, bonus: player.present ? 0 : player.bonus } : player
    ));
  };


    const handleMatchesUpdate = (drawResult: { matches: Match[], triplettePlayerIds: number[] }) => {
        setMatches(drawResult.matches);
        setTriplettePlayerIds(drawResult.triplettePlayerIds);
        const presentPlayersMap = new Map<number, Player>(presentPlayers.map(player => [player.id, player]));
        updatePlayerBonus(presentPlayersMap, drawResult.triplettePlayerIds)
    };

  const isMatchesEmpty = () => {
    return matches.length === 0;
  };

  const saveParameters = () => {
    const duration = (document.getElementById('duration') as HTMLInputElement).value;
    const diversification = (document.getElementById('diversification') as HTMLInputElement).checked;

    localStorage.setItem('duration', duration);
    localStorage.setItem('diversification', JSON.stringify(diversification));

    setIsModalOpen(false);
  };

	const openModal = () => {
	  setIsModalOpen(true);

	  setTimeout(() => {
		// Initialiser les valeurs par défaut dans localStorage si elles n'existent pas
		if (!localStorage.getItem('duration')) {
		  localStorage.setItem('duration', '0'); // Valeur par défaut pour 'duration'
		}

		if (!localStorage.getItem('diversification')) {
		  localStorage.setItem('diversification', JSON.stringify(false)); // Valeur par défaut pour 'diversification'
		}

		// Lire les valeurs de localStorage
		const savedDuration = localStorage.getItem('duration');
		const savedDiversification = JSON.parse(localStorage.getItem('diversification') || 'false');

		// Mettre à jour les champs du formulaire modal
		const durationInput = document.getElementById('duration') as HTMLInputElement;
		if (durationInput && savedDuration) {
		  durationInput.value = savedDuration;
		}

		const diversificationInput = document.getElementById('diversification') as HTMLInputElement;
		if (diversificationInput) {
		  diversificationInput.checked = savedDiversification;
		}
	  }, 0);
	};


  const closeModal = () => setIsModalOpen(false);

  const handleLoggingToggle = (event) => {
    const isChecked = event.target.checked;
    setIsLoggingEnabled(isChecked);
    localStorage.setItem("loggingEnabled", JSON.stringify(isChecked));
  };

  const handleDownload = () => {
    const csvData = localStorage.getItem("tempCSVData"); // Retrieve the temporary CSV data
    if (csvData) {
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', 'matches.csv'); // Specify the file name
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert('No data available for download.');
    }
  };

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    });
  }

  return (
    <LastMatchesProvider>
      <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex-1 flex justify-center">
          <h1 className="text-xl font-bold">Tirage au Sort</h1>
        </div>
        <button id="settingsBtn" className="ml-4 bg-white text-blue-600 p-0 rounded-full w-12 h-12 flex items-center justify-center" onClick={openModal}>
          <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet">
            <path fill="currentColor" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"></path>
          </svg>
        </button>
      </header>

      {isModalOpen && (
        <div className="modal" style={{zIndex: 1000}}>
          <div className="modal-content">
            <h3 className="text-center text-white bg-blue-600 p-2 rounded-md">Paramètres</h3>
			<div className="grid grid-cols-3 items-center mb-4 grid-cols-[10%,25%,auto]">
			  <div className="flex items-center col-span-1">
				<label htmlFor="duration" className="mr-2">Durée:</label>
				<input type="number" id="duration" name="duration" className="border rounded p-1 w-10 ml-2" />
			  </div>
			  <p className="text-sm text-gray-500 col-start-3">
				Maintient la participation à une triplette un certain nombre de tirages
			  </p>
			</div>
			<div className="grid grid-cols-3 items-center mb-4 grid-cols-[10%,25%,auto]">
			  <div className="flex items-center">
				<input type="checkbox" id="diversification" className="mr-2" />
				<label htmlFor="diversification" className="cursor-pointer">Mélange</label>
			  </div>
			  <p className="text-sm text-gray-500 col-start-3">
				Essaye de ne pas retomber sur les mêmes coéquipiers
			  </p>
			</div>
			<div className="grid grid-cols-3 items-center mb-4 grid-cols-[10%,25%,auto]">
			  <div className="flex items-center">
				<input 
				  type="checkbox" 
				  id="logging" 
				  checked={isLoggingEnabled} 
				  onChange={handleLoggingToggle} 
				  className="mr-2" 
				/>
				<label htmlFor="logging" className="cursor-pointer">Logs</label>
			  </div>
			  <p className="text-sm text-gray-500 col-start-3">
				Enregistre les tirages dans un fichier CSV
			  </p>
			</div>
            <div className="flex justify-between mt-4">
              <button onClick={closeModal} className="cancel-button px-4 py-2 rounded-md">
                Annuler
              </button>
              {isLoggingEnabled && (
                <button onClick={handleDownload} className="download-button bg-blue-600 text-white px-4 py-2 rounded-md">
                  Download
                </button>
              )}
              <button onClick={saveParameters} className="save-button bg-green-600 text-white px-4 py-2 rounded-md">
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          .modal {
            display: flex;
            justify-content: center;
            align-items: center;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 1); /* Opaque white background */
            z-index: 1000; /* Ensure it is above other elements */
          }
          .modal-content {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            width: 90%;
            max-width: 500px;
          }
          .modal-content h2 {
            margin-bottom: 15px;
          }
          .modal-content label {
            display: block;
            margin: 10px 0;
          }
          .modal-content button {
            padding: 10px 15px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }

          .modal-content button:hover {
            opacity: 0.9;
          }
        `}
      </style>

      <Routes>
        <Route 
          path="/" 
          element={
            <HomePage 											   
              playerCount={playerCount}
              onPlayerCountChange={handlePlayerCountChange}
              onReset={handleReset}
              presentPlayers={presentPlayers}
              onMatchesUpdate={handleMatchesUpdate}              
            />
          } 
        />
        <Route 
          path="/presence" 
          element={
            parseInt(playerCount) >= 4 ? (
              <PresenceList 
                playerCount={playerCount}
                presentPlayers={presentPlayers}
                onTogglePresence={handleTogglePresence}
                players={players}												   
                triplettePlayerIds={triplettePlayerIds}
                matches={matches}
                isMatchesEmpty={isMatchesEmpty()}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/draw" 
          element={
            parseInt(playerCount) >= 4 ? (
              <DrawPage 
                playerCount={playerCount}
                presentPlayers={presentPlayers.filter(p => p.present)}
                onMatchesUpdate={handleMatchesUpdate}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/teams" 
          element={
            matches.length > 0 ? (
              <TeamsDisplay 
                matches={matches}
                onBack={() => setMatches([])}
              />
            ) : (
              <Navigate to="/draw" replace />
            )
          } 
        />
      </Routes>
    </div>
  </LastMatchesProvider>
);
}

export default App;
