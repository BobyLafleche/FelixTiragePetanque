import React from 'react';
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import PresenceList from './components/PresenceList';
import DrawPage from './components/DrawPage';
import TeamsDisplay from './components/TeamsDisplay';
import { Match, Player } from './types/match.types';
import { TeamDrawService,updatePlayerBonus } from './services/team-draw.service';

function App() {
  const [playerCount, setPlayerCount] = useState('');
  const [matchesState, setMatchesState] = useState<Match[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [presentPlayers, setPresentPlayers] = useState<Player[]>([]);
  const [triplettePlayerIds, setTriplettePlayerIds] = useState<number[]>([]);
  const [players, setPlayers] = useState<Map<number, Player>>(new Map());
  //const { TeamDrawService } = await import('./services/team-draw.service');
  const teamDrawService = new TeamDrawService();

  const handlePlayerCountChange = (count: string) => {
    setPlayerCount(count);
    if (!isNaN(parseInt(count))) {
      const newPresent: Player[] = [];
      for (let i = 1; i <= parseInt(count); i++) {
        newPresent.push({ id: i, present: true, bonus: 0 });
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
  };

  const handleTogglePresence = (playerId: number) => {
    setPresentPlayers(prev => prev.map(player => 
      player.id === playerId ? { ...player, present: !player.present, bonus: player.present ? 0 : player.bonus } : player
    ));
  };

	//const updatePlayerBonus = (players, triplettePlayerIds) => {
    //return players.map(player => {
    //    if (!player.present) {
    //        return { ...player, bonus: 0 };
    //    } else if (triplettePlayerIds.includes(player.id)) {
    //        return { ...player, bonus: player.bonus + 1 };
    //    } else {
    //        return { ...player, bonus: Math.max(0, player.bonus - 1) };
    //    }
    //});
  //};

    const handleMatchesUpdate = (drawResult: { matches: Match[], triplettePlayerIds: number[] }) => {
        setMatches(drawResult.matches);
        setTriplettePlayerIds(drawResult.triplettePlayerIds);

        // Mettez à jour les joueurs en utilisant la méthode updatePlayerBonus
//        setPresentPlayers(prevPlayers => 
            updatePlayerBonus(presentPlayers, drawResult.triplettePlayerIds)
//        );
    };

//	const handleMatchesUpdate = (drawResult: { matches: Match[], triplettePlayerIds: number[] }) => {
//		setMatches(drawResult.matches);
//		
//		// Mettez à jour les joueurs en utilisant la méthode updatePlayerBonus
//		setPresentPlayers(prevPlayers => 
//			teamDrawService.updatePlayerBonus(prevPlayers, drawResult.triplettePlayerIds)
//		);
//	};

  const isMatchesEmpty = () => {
    return matches.length === 0;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold text-center">Tirage au Sort</h1>
      </header>

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
  );
}

export default App;
