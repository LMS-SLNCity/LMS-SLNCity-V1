import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { SignatureUploadModal } from './SignatureUploadModal';

export const ApproverManagement: React.FC = () => {
    const { users } = useAppContext();
    const { user: actor } = useAuth();
    const [selectedApprover, setSelectedApprover] = useState<User | null>(null);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

    const approvers = users.filter(u => u.role === 'APPROVER');

    const handleUploadSignature = (approver: User) => {
        setSelectedApprover(approver);
        setIsSignatureModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedApprover(null);
        setIsSignatureModalOpen(false);
    };

    return (
        <>
            {selectedApprover && isSignatureModalOpen && (
                <SignatureUploadModal
                    approver={selectedApprover}
                    onClose={handleCloseModal}
                />
            )}

            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Approver Management</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Manage approvers and their digital signatures. Signatures are required for report approval.
                </p>

                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Username
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Signature
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {approvers.map((approver, index) => (
                                <tr key={approver.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{approver.username}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            approver.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {approver.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {approver.signatureImageUrl ? (
                                            <div className="flex items-center space-x-2">
                                                <img
                                                    src={approver.signatureImageUrl}
                                                    alt="Signature"
                                                    className="h-8 w-auto border border-gray-300 rounded"
                                                />
                                                <span className="text-xs text-green-600">✓ Uploaded</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-red-600">✗ Not uploaded</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm space-x-2">
                                        <button
                                            onClick={() => handleUploadSignature(approver)}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            {approver.signatureImageUrl ? 'Update' : 'Upload'} Signature
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {approvers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p>No approvers found. Create approver users first.</p>
                    </div>
                )}
            </div>
        </>
    );
};

