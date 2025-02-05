import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import PresenceList from './components/PresenceList';
import DrawPage from './components/DrawPage';
import TeamsDisplay from './components/TeamsDisplay';
import { Match, Player, DrawResult } from './types/match.types';
import { TeamDrawService, updatePlayerBonus } from './services/team-draw.service';
import { LastMatchesProvider } from './contexts/LastMatchesContext';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';

function App() {
  const navigate = useNavigate();
  const [playerCount, setPlayerCount] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<any[]>([]);
  const [presentPlayers, setPresentPlayers] = useState<Player[]>([]);
  const [triplettePlayerIds, setTriplettePlayerIds] = useState<number[]>([]);
  const [players, setPlayers] = useState<Map<number, Player>>(new Map());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastMatches, setLastMatches] = useState([]);
  const [logType, setLogType] = useState(() => {
    const savedLogType = localStorage.getItem("logType");
    return savedLogType || "None";
  });
  const [NumPartie, setNumPartie] = useState(0);
  // isLoggingEnabled est true si logType est différent de "None"
  const [isLoggingEnabled, setIsLoggingEnabled] = useState(() => {
    return logType !== "None";
  });

  // Mettre à jour isLoggingEnabled lorsque logType change
  useEffect(() => {
    setIsLoggingEnabled(logType !== "None");
  }, [logType]);

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
    setPlayers(new Map());
    setPresentPlayers([]);
    setMatches([]);
    setLastMatches([]);
    setAllMatches([]);
    setTriplettePlayerIds([]);
  };

  const handleTogglePresence = (playerId: number) => {
    setPresentPlayers(prev => prev.map(player =>
      player.id === playerId ? { ...player, present: !player.present, bonus: player.present ? 0 : player.bonus } : player
    ));
  };

  const handleMatchesUpdate = (drawTeams: DrawResult) => {
    setMatches(drawTeams.matches);
    setAllMatches(prevMatches => [...prevMatches, drawTeams.matches]);
    setTriplettePlayerIds(drawTeams.triplettePlayerIds);
    const presentPlayersMap = new Map<number, Player>(presentPlayers.map(player => [player.id, player]));
    updatePlayerBonus(presentPlayersMap, drawTeams.triplettePlayerIds);
  };

  const isMatchesEmpty = () => {
    return matches.length === 0;
  };

  const saveParameters = () => {
    const duration = (document.getElementById('duration') as HTMLInputElement).value;
    const diversification = (document.getElementById('diversification') as HTMLInputElement).checked;
    const NbrTerrains = (document.getElementById('NbrTerrains') as HTMLInputElement).value;
    const typeMarquage = (document.getElementById('typeMarquage') as HTMLInputElement).checked;
	const logType = (document.getElementById('logType') as HTMLInputElement).value;

    // Récupérer l'ancienne valeur de NbrTerrains
    const oldNbrTerrains = localStorage.getItem('NbrTerrains');

    // Sauvegarder les paramètres dans localStorage
    localStorage.setItem('duration', duration);
    localStorage.setItem('diversification', JSON.stringify(diversification));

    // Gestion spéciale pour NbrTerrains
    if (NbrTerrains === '0') {
      localStorage.removeItem('NbrTerrains'); // Effacer la variable si le nombre de terrains est 0
      localStorage.removeItem('usedGrounds'); // Effacer usedGrounds car il n'y a plus de terrains
    } else {
      localStorage.setItem('NbrTerrains', NbrTerrains); // Sinon, sauvegarder la valeur

      // Si le nombre de terrains a changé, effacer usedGrounds
      if (oldNbrTerrains !== NbrTerrains) {
        localStorage.removeItem('usedGrounds');
      }
    }

    localStorage.setItem('typeMarquage', JSON.stringify(typeMarquage));

	localStorage.setItem("logType",logType); // sauvegarde le type de log	

    setIsModalOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);

    setTimeout(() => {
      // Initialiser les valeurs par défaut dans localStorage si elles n'existent pas
      if (!localStorage.getItem('duration')) {
        localStorage.setItem('duration', '0');
      }

      if (!localStorage.getItem('diversification')) {
        localStorage.setItem('diversification', JSON.stringify(false));
      }

      if (!localStorage.getItem('NbrTerrains')) {
        localStorage.setItem('NbrTerrains', '0');
      }

      if (!localStorage.getItem('typeMarquage')) {
        localStorage.setItem('typeMarquage', JSON.stringify(false));
      }

      // Lire les valeurs de localStorage
      const savedDuration = localStorage.getItem('duration');
      const savedDiversification = JSON.parse(localStorage.getItem('diversification') || 'false');
      const savedNbrTerrains = localStorage.getItem('NbrTerrains');
      const savedTypeMarquage = JSON.parse(localStorage.getItem('typeMarquage') || 'false');

      // Mettre à jour les champs du formulaire modal
      const durationInput = document.getElementById('duration') as HTMLInputElement;
      if (durationInput && savedDuration) {
        durationInput.value = savedDuration;
      }

      const diversificationInput = document.getElementById('diversification') as HTMLInputElement;
      if (diversificationInput) {
        diversificationInput.checked = savedDiversification;
      }

      const NbrTerrainsInput = document.getElementById('NbrTerrains') as HTMLInputElement;
      if (NbrTerrainsInput && savedNbrTerrains) {
        NbrTerrainsInput.value = savedNbrTerrains;
      }

      const typeMarquageInput = document.getElementById('typeMarquage') as HTMLInputElement;
      if (typeMarquageInput) {
        typeMarquageInput.checked = savedTypeMarquage;
      }
//
      // Mettre à jour les champs du formulaire modal
	  const savedLogType = localStorage.getItem('logType') ?? '';
      const LogTypeInput = document.getElementById('logType') as HTMLInputElement;
	  if (LogTypeInput) {
		  LogTypeInput.value = savedLogType;

	  }

    }, 0);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleLogTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLogType(event.target.value); // Met à jour logType avec la nouvelle valeur
  };

  const generatePDF = (allMatches, showTerrains = true) => {
    const doc = new jsPDF();
    
    // Configuration
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    // Style configurations
    const styles = {
      title: { fontSize: 14, fontStyle: 'bold' },
      header: { fontSize: 10, fontStyle: 'bold' },
      content: { fontSize: 9 },
      cellPadding: 3,
      rowHeight: 10,
      headerHeight: 12,
      blockMargin: 20
    };

    // Vérifier si une partie a plus de 10 matches
    const hasLongMatch = allMatches.some(matches => matches.length > 10);

    if (hasLongMatch) {
      // Mode une partie par page
      allMatches.forEach((matches, pageIndex) => {
        if (pageIndex > 0) {
          doc.addPage();
        }

        // Configuration pour page complète
        const contentWidth = pageWidth - (2 * margin);

        // Title
        doc.setFontSize(styles.title.fontSize);
        doc.setFont('helvetica', 'bold');
        doc.text(`Partie n° ${pageIndex + 1}`, margin, margin + 10);
        
        // Header background
        const headerY = margin + 20;
        doc.setFillColor(230, 230, 230);
        doc.rect(margin, headerY, contentWidth, styles.headerHeight, 'F');
        
        // Header text
        doc.setFontSize(styles.header.fontSize);
        let currentX = margin + styles.cellPadding;
        
        // Column widths for full width
        const numberWidth = contentWidth * 0.1;
        const terrainWidth = showTerrains ? contentWidth * 0.25 : 0;
        const teamsWidth = showTerrains ? contentWidth * 0.65 : contentWidth * 0.9;
        
        // Header labels
        doc.text("N°", currentX, headerY + 10);
        currentX += numberWidth;
        
        if (showTerrains) {
          doc.text("Terrains", currentX + (terrainWidth/3), headerY + 10);
          currentX += terrainWidth;
        }
        
        doc.text("Équipes", currentX + (teamsWidth/3), headerY + 10);
        
        // Content
        doc.setFontSize(styles.content.fontSize);
        doc.setFont('helvetica', 'normal');
        
        matches.forEach((match, index) => {
          const rowY = headerY + styles.headerHeight + (index * styles.rowHeight);
          
          // Row background
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, rowY, contentWidth, styles.rowHeight, 'F');
          
          // Row content
          currentX = margin + styles.cellPadding;
          
          // Match number
          doc.text(`${index + 1}`, currentX, rowY + 8);
          currentX += numberWidth;
          
          // Terrain (if showing)
          if (showTerrains) {
            doc.text(match.terrain?.toString() || '-', currentX + (terrainWidth/3), rowY + 8);
            currentX += terrainWidth;
          }
          
          // Teams
          const teamsText = match.matchText;
          doc.text(teamsText, currentX, rowY + 8, {
            maxWidth: teamsWidth - styles.cellPadding
          });
        });
      });
    } else {
      // Mode 4 parties par page (2×2)
      const contentWidth = (pageWidth - (3 * margin)) / 2;
      const blocksPerPage = 4;
      
      for (let i = 0; i < allMatches.length; i += blocksPerPage) {
        if (i > 0 && i % blocksPerPage === 0) {
          doc.addPage();
        }

        // Process each block in the current page (up to 4 blocks)
        for (let blockIndex = 0; blockIndex < Math.min(blocksPerPage, allMatches.length - i); blockIndex++) {
          const colIndex = blockIndex % 2;
          const rowIndex = Math.floor(blockIndex / 2);
          const matches = allMatches[i + blockIndex];

          if (!matches) continue;

          const columnX = margin + (colIndex * (contentWidth + margin));
          const blockY = margin + (rowIndex * (pageHeight / 2));

          // Title
          doc.setFontSize(styles.title.fontSize);
          doc.setFont('helvetica', 'bold');
          doc.text(`Partie n° ${i + blockIndex + 1}`, columnX, blockY + 10);
          
          // Header background
          const headerY = blockY + 20;
          doc.setFillColor(230, 230, 230);
          doc.rect(columnX, headerY, contentWidth, styles.headerHeight, 'F');
          
          // Header text
          doc.setFontSize(styles.header.fontSize);
          let currentX = columnX + styles.cellPadding;
          
          // Column widths
          const numberWidth = contentWidth * 0.1;
          const terrainWidth = showTerrains ? contentWidth * 0.25 : 0;
          const teamsWidth = showTerrains ? contentWidth * 0.65 : contentWidth * 0.9;
          
          // Header labels
          doc.text("N°", currentX, headerY + 10);
          currentX += numberWidth;
          
          if (showTerrains) {
            doc.text("Terrains", currentX + (terrainWidth/3), headerY + 10);
            currentX += terrainWidth;
          }
          
          doc.text("Équipes", currentX + (teamsWidth/3), headerY + 10);
          
          // Content
          doc.setFontSize(styles.content.fontSize);
          doc.setFont('helvetica', 'normal');
          
          matches.forEach((match, index) => {
            const rowY = headerY + styles.headerHeight + (index * styles.rowHeight);
            
            // Row background
            doc.setFillColor(245, 245, 245);
            doc.rect(columnX, rowY, contentWidth, styles.rowHeight, 'F');
            
            // Row content
            currentX = columnX + styles.cellPadding;
            
            // Match number
            doc.text(`${index + 1}`, currentX, rowY + 8);
            currentX += numberWidth;
            
            // Terrain (if showing)
            if (showTerrains) {
              doc.text(match.terrain?.toString() || '-', currentX + (terrainWidth/3), rowY + 8);
              currentX += terrainWidth;
            }
            
            // Teams
            const teamsText = match.matchText;
            doc.text(teamsText, currentX, rowY + 8, {
              maxWidth: teamsWidth - styles.cellPadding
            });
          });
        }
      }
    }
    
    const datetimestamp = new Date().toISOString();
    const timestamp = datetimestamp.replace(/T/, '_').replace(/\..*/, '').replace(/:/g, '-');
    doc.save(`parties-petanque-${timestamp}.pdf`);
    
  };

const handleDownload = () => {
  if (logType === "CSV") {
    // Enregistrement en CSV (inchangé)
    const csvData = localStorage.getItem('tempCSVData');
    if (csvData) {
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', 'matches.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert('No CSV data available for download.');
    }
  } else if (logType === "PDF") {
    let _T = localStorage.getItem('NbrTerrains') || '1';
    let _Tn = isNaN(parseInt(_T)) ? 1 : parseInt(_T);
    generatePDF(allMatches, _Tn > 0);
  } else {
    // Si logType est "None", ne rien faire ou afficher un message
    alert('Choisir un type.');
  }
  setIsModalOpen(false);
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

  const handleBack = () => {
    setMatches([]);
  };


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
            <div className="relative">
  <h3 className="text-center text-white bg-blue-600 p-2 rounded-md mb-4">Paramètres</h3>
  <span className="absolute bottom-0 right-0 text-xs text-blue-300 pr-2 pb-2">v0.50</span>
</div>

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
        <div className="flex items-center col-span-1">
          <label htmlFor="NbrTerrains" className="mr-2">Terrains:</label>
          <input type="number" id="NbrTerrains" name="NbrTerrains" className="border rounded p-1 w-10 ml-2" />
        </div>
        <p className="text-sm text-gray-500 col-start-3">Nombre de terrains disponibles</p>
      </div>
			<div className="grid grid-cols-3 items-center mb-4 grid-cols-[10%,25%,auto]">
			  <div className="flex items-center">
				<input type="checkbox" id="typeMarquage" className="mr-2" />
				<label htmlFor="typeMarquage" className="cursor-pointer">Lettres</label>
			  </div>
			  <p className="text-sm text-gray-500 col-start-3">
				Type de marquage des terrains : Lettres ou Nombres
			  </p>
			</div>		    
			<div className="grid grid-cols-3 items-center mb-4 grid-cols-[10%,25%,auto]">
			  <div className="flex items-center">
				<select
				  id="logType"
				  value={logType}
				  onChange={handleLogTypeChange}
				  className="mr-2 p-1 border rounded"
				>
				  <option value="None">Aucun</option>
				  <option value="CSV">CSV</option>
				  <option value="PDF">PDF</option>
				</select>
			  </div>
			  <p className="text-sm text-gray-500 col-start-3">
				{logType === "None"
				  ? "Aucun enregistrement de tirage"
				  : `Enregistre les tirages dans un fichier ${logType}`}
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
                NumPartie={NumPartie}
                setNumPartie={setNumPartie}
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
                onBack={handleBack}
                NumPartie={NumPartie}
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
