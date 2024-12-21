import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaDice } from 'react-icons/fa';
import { TeamDrawService } from '../services/team-draw.service';
import { Match } from '../types/match.types';

interface DrawPageProps {
  playerCount: string;
  presentPlayers: number[];
  onMatchesUpdate: (matches: Array<{matchNumber: number, matchText: string}>) => void;
}

const DrawPage: React.FC<DrawPageProps> = ({ playerCount, presentPlayers, onMatchesUpdate }) => {
  const [isDrawn, setIsDrawn] = useState(false);
  const teamDrawService = new TeamDrawService();
  const navigate = useNavigate();

  const handleDraw = () => {
    const drawResult = teamDrawService.generateMatches(presentPlayers.length, presentPlayers);
    onMatchesUpdate(drawResult);
    navigate('/teams');
  };

  return (
    <main className="container mx-auto px-4 py-6 max-w-lg">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Tirage au sort</h2>
          <button 
            onClick={() => navigate('/presence')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold"
          >
            <FaUsers />
            <span>PRÉSENCE</span>
          </button>
        </div>
        <div className="text-center mb-4">
          <p>Joueurs présents: {presentPlayers.length} / {playerCount}</p>
        </div>
        <div className="flex gap-2 justify-center">
          <button
            onClick={handleDraw}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors"
          >
            <FaDice className="text-xl" />
            <span>EFFECTUER LE TIRAGE</span>
          </button>
        </div>
      </div>
    </main>
  );
};

export default DrawPage;