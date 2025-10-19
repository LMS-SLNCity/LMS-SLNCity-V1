import React from 'react';
import { useAppContext } from '../../context/AppContext';

export const AuditLogViewer: React.FC = () => {
    const { auditLogs } = useAppContext();

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Application Audit Log</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">Timestamp</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/6">User</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/6">Action</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {auditLogs.map((log, index) => (
                            <tr key={log.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-4 py-3 text-xs font-medium text-gray-800">{log.username}</td>
                                <td className="px-4 py-3 text-xs text-gray-600">
                                    <span className="px-2 py-0.5 font-mono text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-600">{log.details}</td>
                            </tr>
                        ))}
                        {auditLogs.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-sm text-gray-500">No audit logs found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
