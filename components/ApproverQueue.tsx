import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Visit, VisitTest } from '../types';
import { ApprovalModal } from './ApprovalModal';

interface ApproverQueueProps {
  onInitiateReport: (visit: Visit) => void;
}

const StatusBadge: React.FC<{ status: VisitTest['status'] }> = ({ status }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full";
  const statusMap = {
    AWAITING_APPROVAL: "bg-purple-100 text-purple-800",
    APPROVED: "bg-green-100 text-green-800",
  };
  const colorClasses = statusMap[status as keyof typeof statusMap] || "bg-gray-100 text-gray-800";
  
  return (
    <span className={`${baseClasses} ${colorClasses}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const EmptyState: React.FC<{ title: string; message: string }> = ({ title, message }) => (
    <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{message}</p>
    </div>
);


export const ApproverQueue: React.FC<ApproverQueueProps> = ({ onInitiateReport }) => {
  const { visits, visitTests } = useAppContext();
  const [selectedTest, setSelectedTest] = useState<VisitTest | null>(null);

  const awaitingApproval = visitTests.filter(test => test.status === 'AWAITING_APPROVAL');
  const recentlyApproved = visitTests.filter(test => test.status === 'APPROVED').sort((a, b) => new Date(b.approvedAt!).getTime() - new Date(a.approvedAt!).getTime());

  const findVisitForTest = (test: VisitTest): Visit | undefined => {
    return visits.find(v => v.id === test.visitId);
  }

  return (
    <>
      {selectedTest && (
        <ApprovalModal
          test={selectedTest}
          onClose={() => setSelectedTest(null)}
        />
      )}
      <div className="bg-white p-8 rounded-xl shadow-lg space-y-8 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Approver Queue</h2>
        
        {/* Awaiting Approval Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Awaiting Final Approval</h3>
          {awaitingApproval.length > 0 ? (
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {awaitingApproval.map(test => (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.visitCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{test.patientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{test.template.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <StatusBadge status={test.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedTest(test)}
                          className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors text-xs"
                        >
                          Review & Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No results awaiting approval" message="Results submitted by the lab will appear here." />
          )}
        </div>

        {/* Recently Approved Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Recently Approved</h3>
           {recentlyApproved.length > 0 ? (
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentlyApproved.map(test => {
                    const visit = findVisitForTest(test);
                    return (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.visitCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{test.template.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(test.approvedAt!).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{test.approvedBy}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {visit && 
                        <button
                          onClick={() => onInitiateReport(visit)}
                          className="px-3 py-1 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-xs"
                        >
                          View Report
                        </button>
                        }
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
              <EmptyState title="No tests have been approved yet" message="Approved tests will be listed here." />
          )}
        </div>
      </div>
    </>
  );
};