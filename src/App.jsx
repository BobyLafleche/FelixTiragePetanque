import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import PresenceList from './components/PresenceList';
import DrawPage from './components/DrawPage';
import TeamsDisplay from './components/TeamsDisplay';

function App() {
  const [playerCount, setPlayerCount] = useState('');
  const [presentPlayers, setPresentPlayers] = useState(new Set());
  const [matches, setMatches] = useState([]);
  const [triplettePlayerIds, setTriplettePlayerIds] = useState([]); // Add state

  const handlePlayerCountChange = (count) => {
    setPlayerCount(count);
    if (!isNaN(parseInt(count))) {
      const newPresent = new Set();
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

  const handleTogglePresence = (playerId) => {
    const newPresent = new Set(presentPlayers);
    if (newPresent.has(playerId)) {
      newPresent.delete(playerId);
    } else {
      newPresent.add(playerId);
    }
    setPresentPlayers(newPresent);
  };

  const handleMatchesUpdate = (drawResult) => {
    setMatches(drawResult.matches);
    setTriplettePlayerIds(drawResult.triplettePlayerIds);
  };

  return (
    <div className="min-h-screen bg-gray-100">
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
                triplettePlayerIds={triplettePlayerIds}
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