import React from 'react';
import { VisitTest } from '../types';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

interface ApprovalModalProps {
  test: VisitTest;
  onClose: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({ test, onClose }) => {
  const { approveTestResult } = useAppContext();
  const { user } = useAuth();

  const handleApprove = async () => {
    if (!user) {
        alert("User session has expired. Please log in again.");
        return;
    }
    if (test.status !== 'AWAITING_APPROVAL') {
        alert(`Cannot approve. Test status is ${test.status}. Only AWAITING_APPROVAL tests can be approved.`);
        return;
    }
    await approveTestResult(test.id, user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
        <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900" id="modal-title">Review & Approve Results</h3>
            <p className="text-sm text-gray-500 mt-1">Test: {test.template.name}</p>
            <p className="text-sm text-gray-500">Patient: {test.patientName} ({test.visitCode})</p>
            
            <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Entered Results:</h4>
                {test.results && Object.keys(test.results).length > 0 ? (
                    <div className="space-y-2">
                        {Object.entries(test.results).map(([key, value]) => {
                            const parameter = test.template.parameters.fields.find(p => p.name === key);
                            return (
                                <div key={key} className="grid grid-cols-2 text-sm">
                                    <span className="text-gray-600 font-medium">{key}:</span>
                                    <span className="text-gray-900">{String(value)} {parameter?.unit || ''}</span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">No specific result parameters were entered for this test.</p>
                )}
            </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end items-center space-x-3 rounded-b-xl">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                Cancel
            </button>
            <button type="button" onClick={handleApprove} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Confirm Approval
            </button>
        </div>
      </div>
    </div>
  );
};