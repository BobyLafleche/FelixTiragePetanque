import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers } from 'react-icons/fa';
import { Player,Match } from '../types/match.types';

interface HomePageProps {
  playerCount: string;
  onPlayerCountChange: (count: string) => void;
  onReset: () => void;
  presentPlayers: Player[];
  onMatchesUpdate: (drawResult: { matches: Match[]; triplettePlayerIds: number[]; }) => void;
}

const HomePage: React.FC<HomePageProps> = ({
  playerCount,
  onPlayerCountChange,
  onReset,
  presentPlayers,
  onMatchesUpdate
}) => {
  const navigate = useNavigate();
  const count = parseInt(playerCount);
  const isValidCount = !isNaN(count) && count >= 4 && count <= 99;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidCount) {
      navigate('/presence');
    }
  };

  return (
    <main className="container mx-auto px-4 py-6 max-w-lg">
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="playerCount" className="block text-lg font-semibold text-gray-700 mb-2 text-center">
              Nombre de joueurs (4-99)
            </label>
            <div className="flex gap-2">
              <input
                id="playerCount"
                type="number"
                value={playerCount}
                onChange={(e) => onPlayerCountChange(e.target.value)}
                className="flex-1 p-3 border rounded-md text-lg"
                min="4"
                max="99"
                placeholder="Entrez un nombre"
                required
              />
              <button
                type="button"
                onClick={onReset}
                className="bg-red-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-red-700 transition-colors"
              >
                RAZ
              </button>
            </div>
          </div>

          {isValidCount && (
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              <FaUsers className="text-xl" />
              <span>FEUILLE DE PRÉSENCE</span>
            </button>
          )}
        </form>
      </div>
    </main>
  );
};

export default HomePage;
