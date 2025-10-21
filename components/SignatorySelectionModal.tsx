import React, { useState } from 'react';
import { Visit, Signatory } from '../types';
import { apiClient } from '../api/client';
import { Select } from './form/Select';

interface SignatorySelectionModalProps {
  visit: Visit;
  onClose: () => void;
  onConfirm: (signatory: Signatory) => void;
}

export const SignatorySelectionModal: React.FC<SignatorySelectionModalProps> = ({ visit, onClose, onConfirm }) => {
  const [signatoryId, setSignatoryId] = useState<number | undefined>(undefined);
  const [signatories, setSignatories] = useState<any[]>([]);

  React.useEffect(() => {
    let mounted = true;
    apiClient.getSignatories().then(s => { if (mounted) { setSignatories(s); setSignatoryId(s[0]?.id); } }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signatoryId) {
      alert('Please select a signatory.');
      return;
    }

  const signatory = signatories.find((s: any) => s.id === signatoryId);
    
    if (signatory) {
      onConfirm(signatory);
    } else {
        alert('Could not find the selected signatory. Please try again.');
    }
  };

  const signatoryOptions = [{ label: '-- Select Signatory --', value: ''}, ...signatories.map((s: any) => ({ label: `${s.name} (${s.title})`, value: s.id }))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
        <form onSubmit={handleSubmit}>
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900" id="modal-title">Select Signatory for Report</h3>
                <p className="text-sm text-gray-500 mt-1">Visit: {visit.visit_code} - {visit.patient.name}</p>
                
                <div className="mt-6 space-y-4">
                    <Select
                        label="Signatory"
                        name="signatory"
                        value={String(signatoryId || '')}
                        onChange={(e) => setSignatoryId(Number(e.target.value))}
                        options={signatoryOptions}
                        required
                    />
                </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end items-center space-x-3 rounded-b-xl">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                    Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Confirm & Generate Report
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};