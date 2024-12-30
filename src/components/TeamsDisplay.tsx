import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaUsers } from 'react-icons/fa';
import { Match } from '../types/match.types';

interface TeamsDisplayProps {
  matches: Match[];
  onBack: () => void;
}

const TeamsDisplay: React.FC<TeamsDisplayProps> = ({ matches, onBack }) => {
  const navigate = useNavigate();

  // Debug log to check matches
  console.log('Matches in TeamsDisplay:', matches);

  return (
    <main className="container mx-auto px-4 py-6 max-w-lg">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Équipes formées</h2>
          <button 
            onClick={() => navigate('/presence')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
          >
            <FaUsers />
            <span>PRÉSENCE</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {matches && matches.map((match, index) => (
            <div key={index} className="p-2 bg-gray-50 rounded-md">
				<div className="flex justify-between text-lg">
				  <span>{index + 1}.</span>
				  <span>{match.matchText}</span>
				</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default TeamsDisplay;