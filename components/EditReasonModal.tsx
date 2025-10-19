import React, { useState } from 'react';

interface EditReasonModalProps {
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export const EditReasonModal: React.FC<EditReasonModalProps> = ({ onClose, onSubmit }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim() === '') {
      alert('A reason for editing is mandatory.');
      return;
    }
    onSubmit(reason);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900" id="modal-title">Reason for Edit</h3>
            <p className="text-sm text-gray-500 mt-2">
              Please provide a mandatory reason for editing this approved report. This action will be logged.
            </p>
            <div className="mt-4">
              <textarea
                id="edit-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                placeholder="e.g., Correcting a typographical error in the result."
                required
              />
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end items-center space-x-3 rounded-b-xl">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600">
              Proceed to Edit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
