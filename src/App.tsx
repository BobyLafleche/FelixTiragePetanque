import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import PresenceList from './components/PresenceList';
import DrawPage from './components/DrawPage';
import TeamsDisplay from './components/TeamsDisplay';
import { Match } from './services/team-draw.service';

function App() {
  const [playerCount, setPlayerCount] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [presentPlayers, setPresentPlayers] = useState<Set<number>>(new Set());

  const handlePlayerCountChange = (count: string) => {
    setPlayerCount(count);
    if (!isNaN(parseInt(count))) {
      const newPresent = new Set<number>();
      for (let i = 1; i <= parseInt(count); i++) {
        newPresent.add(i);
      }
      setPresentPlayers(newPresent);
    }
  };

  const handleReset = () => {
    setPlayerCount('');
    setPresentPlayers(new Set());
    setMatches([]);
  };

  const handleTogglePresence = (playerId: number) => {
    const newPresent = new Set(presentPlayers);
    if (newPresent.has(playerId)) {
      newPresent.delete(playerId);
    } else {
      newPresent.add(playerId);
    }
    setPresentPlayers(newPresent);
  };

  const handleMatchesUpdate = (newMatches: Match[]) => {
    setMatches(newMatches);
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
                presentPlayers={Array.from(presentPlayers)}
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