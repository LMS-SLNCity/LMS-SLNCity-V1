import React, { useState } from 'react';
import { Visit, Signatory, VisitTest } from '../types';
import { TestReport } from './TestReport';
import { useAuth } from '../context/AuthContext';


interface ReportModalProps {
  visit: Visit;
  signatory: Signatory;
  onClose: () => void;
  onEdit: (test: VisitTest) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ visit, signatory, onClose, onEdit }) => {
  const { hasPermission } = useAuth();
  const [printMode, setPrintMode] = useState<'full' | 'content-only'>('full');

  const handlePrint = (mode: 'full' | 'content-only') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 100);
  };
  
  const printClass = printMode === 'content-only' ? 'print-content-only' : '';
  const canEditReport = hasPermission('EDIT_APPROVED_REPORT');

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 print:bg-white ${printClass}`} aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="bg-gray-200 w-full h-full overflow-y-auto">
        <div className="sticky top-0 z-10 bg-gray-800 p-3 flex justify-end items-center space-x-4 print:hidden">
            <button 
                onClick={() => handlePrint('full')} 
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Print Full Report (with Header)
            </button>
             <button 
                onClick={() => handlePrint('content-only')} 
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                title="Use this option for printing on pre-printed letterhead paper"
            >
                Print Content Only
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                Close
            </button>
        </div>
        <div className="p-4 sm:p-8">
          <TestReport visit={visit} signatory={signatory} canEdit={canEditReport} onEdit={onEdit} />
        </div>
      </div>
    </div>
  );
};