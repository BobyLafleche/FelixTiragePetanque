import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaUsers } from 'react-icons/fa';
import { Match } from '../services/team-draw.service';

interface TeamsDisplayProps {
  matches: Match[];
  onBack: () => void;
}

const TeamsDisplay: React.FC<TeamsDisplayProps> = ({ matches, onBack }) => {
  const navigate = useNavigate();

  return (
    <main className="container mx-auto px-4 py-6 max-w-lg">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Équipes formées</h2>
          <button 
            onClick={() => navigate('/presence')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold"
          >
            <FaUsers />
            <span>PRÉSENCE</span>
          </button>
        </div>

        <div className="space-y-3">
          {matches.map((match) => (
            <div key={match.matchNumber} className="flex items-start gap-2">
              <span className="text-gray-500 mt-3">{match.matchNumber}.</span>
              <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-800 font-medium">{match.matchText}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaHome />
            <span>Accueil</span>
          </button>
        </div>
      </div>
    </main>
  );
};

export default TeamsDisplay;