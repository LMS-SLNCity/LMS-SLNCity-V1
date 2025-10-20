import React from 'react';
import { Client } from '../../types';

interface ClientPriceEditorModalProps {
  client: Client;
  onClose: () => void;
}

export const ClientPriceEditorModal: React.FC<ClientPriceEditorModalProps> = ({ client, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Price Editor</h3>
        <p className="text-gray-600 mb-6">Custom price editor for {client.name}</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark"
        >
          Close
        </button>
      </div>
    </div>
  );
};
