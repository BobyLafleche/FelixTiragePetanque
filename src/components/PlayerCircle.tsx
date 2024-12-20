import React from 'react';

interface PlayerCircleProps {
  number: number;
  isPresent: boolean;
  onClick: () => void;
}

const PlayerCircle: React.FC<PlayerCircleProps> = ({ number, isPresent, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-16 h-16 
        rounded-full 
        flex items-center justify-center 
        transition-all duration-200 
        transform hover:scale-105
        ${isPresent ? 'bg-red-600 shadow-lg' : 'bg-gray-200'}
      `}
    >
      <span className={`
        text-xl font-bold
        ${isPresent ? 'text-yellow-300' : 'text-gray-700'}
      `}>
        {number}
      </span>
    </button>
  );
};

export default PlayerCircle;