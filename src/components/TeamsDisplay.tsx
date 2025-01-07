import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaUsers } from 'react-icons/fa';
import { Match } from '../types/match.types';

interface TeamsDisplayProps {
  matches: Match[];
  onBack: () => void;
  NumPartie: number;
}

const TeamsDisplay: React.FC<TeamsDisplayProps> = ({ matches, onBack, NumPartie }) => {
  const navigate = useNavigate();



  // Debug log to check matches
  console.log('Matches in TeamsDisplay:', matches);

  return (
    <main className="container mx-auto px-4 py-6 max-w-lg">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Partie n°{NumPartie}</h2>
          <button 
            onClick={() => navigate('/presence')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
          >
            <FaUsers />
            <span>PRÉSENCE</span>
          </button>
        </div>        
		<div className="space-y-4">
		  <div className="bg-gray-50 rounded-md">
			<div className="grid items-center mb-4 grid-cols-[10%,25%,auto]  font-bold p-2 bg-gray-200">
			  <span> </span>
			  <span className="flex justify-center">Terrains</span>
			  <span className="flex justify-center">Équipes</span>
			</div>
			{matches && matches.map((match, index) => (
			  <div key={index} className="grid items-center mb-4 grid-cols-[10%,25%,auto]  p-2 bg-gray-200">
				<span>{index + 1}</span>
				<span className="flex justify-center">{match.terrain}</span>
				<span className="flex justify-center">{match.teams}</span>
			  </div>
			))}
		  </div>
		</div>
      </div>
    </main>
  );
};

export default TeamsDisplay;