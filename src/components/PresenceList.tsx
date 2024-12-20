import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaDice, FaUsers } from 'react-icons/fa';
import PlayerCircle from './PlayerCircle';

interface PresenceListProps {
  playerCount: string;
  presentPlayers: Set<number>;
  onTogglePresence: (playerId: number) => void;
}

const PresenceList: React.FC<PresenceListProps> = ({
  playerCount,
  presentPlayers,
  onTogglePresence
}) => {
  const navigate = useNavigate();
  const count = parseInt(playerCount);

  if (!playerCount || isNaN(count)) {
    return (
      <main className="container mx-auto px-4 py-6 max-w-lg">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 mb-4">Veuillez d'abord définir le nombre de joueurs</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold"
          >
            <FaHome />
            <span>RETOUR</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6 max-w-lg">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Liste des joueurs</h2>
            <p className="text-sm text-gray-600 mt-1">
              Cliquez sur un numéro pour modifier sa présence
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total joueurs:</span>
            <span className="font-semibold">{count}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Présents:</span>
            <span className="font-semibold text-green-600">{presentPlayers.size}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Absents:</span>
            <span className="font-semibold text-red-600">{count - presentPlayers.size}</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: count }, (_, index) => {
            const playerNumber = index + 1;
            return (
              <PlayerCircle
                key={playerNumber}
                number={playerNumber}
                isPresent={presentPlayers.has(playerNumber)}
                onClick={() => onTogglePresence(playerNumber)}
              />
            );
          })}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaHome />
            <span>Accueil</span>
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/draw')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              <FaDice className="text-xl" />
              <span>TIRAGE</span>
            </button>
            <button
              onClick={() => navigate('/teams')}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors"
            >
              <FaUsers className="text-xl" />
              <span>ÉQUIPES</span>
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-end items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span className="text-sm text-gray-600">Présent</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-200"></div>
            <span className="text-sm text-gray-600">Absent</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PresenceList;