import React from 'react';

interface PlayerCircleProps {
  number: number;
  isPresent: boolean;
  onClick: () => void;
}

const PlayerCircle: React.FC<PlayerCircleProps> = ({ number, onClick }) => (
  <button 
    className={`
      w-12 h-12
      rounded-full 
      flex items-center justify-center 
      transition-all duration-200 
      transform hover:scale-105
      shadow-lg
    `}
    onClick={onClick}
  >
    <span className="text-xl font-bold text-yellow-300">
      {number}
    </span>
  </button>
);

export default PlayerCircle;