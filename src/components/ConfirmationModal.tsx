import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ligne1: string;
  ligne2: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, ligne1, ligne2 }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Confirmation</h2>        
		<p>
		<span>{ligne1}</span>
		<span>{ligne2}</span>
		</p>
        <div className="flex justify-end mt-4">
          <button className="mr-2 px-4 py-2 bg-gray-300 rounded" onClick={onClose}>Annuler</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={onConfirm}>D'accord</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
