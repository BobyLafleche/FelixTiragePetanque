import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaDice } from 'react-icons/fa';
import { TeamDrawService } from '../services/team-draw.service';
import { Player, DrawResult, MatchPlayer } from '../types/match.types';
import { useLastMatches } from '../contexts/LastMatchesContext';

interface DrawPageProps {
  playerCount: string;
  presentPlayers: Player[];
  onMatchesUpdate: (drawResult: DrawResult) => void;
}

const DrawPage: React.FC<DrawPageProps> = ({ playerCount, presentPlayers, onMatchesUpdate }) => {
  const { lastMatches, setLastMatches } = useLastMatches(); // Access the context
  const navigate = useNavigate();
  const [csvData, setCsvData] = useState<any[]>([]);

  const handleDraw = () => {
    let last = lastMatches; // Access the lastMatches from context
    const drawResult = TeamDrawService.generateMatches(presentPlayers.length, presentPlayers, lastMatches);
    onMatchesUpdate(drawResult);

    // Extract team1 and team2 from drawResult
    let newLastMatches = drawResult.matches.map(match => [
        ...match.team1.map(player => player.id),
        ...match.team2.map(player => player.id)
    ]);

    setLastMatches(newLastMatches); // Update state with current LastMatches

    // Set the CSV data to be downloaded
    setCsvData(drawResult.matches);

    navigate('/teams');
  };

  const handleDownloadCSV = () => {
    TeamDrawService.downloadCSV(csvData);
  };

  return (
    <main className="container mx-auto px-4 py-6 max-w-lg">
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
          {/* Removed the CSV download button */}
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
