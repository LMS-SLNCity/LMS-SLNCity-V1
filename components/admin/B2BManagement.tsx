import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Client } from '../../types';
import { ClientLedgerModal } from './ClientLedgerModal';
import { ClientPriceEditorModal } from './ClientPriceEditorModal';

export const B2BManagement: React.FC = () => {
    const { clients } = useAppContext();
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);
    const [isPriceEditorOpen, setIsPriceEditorOpen] = useState(false);

    const b2bClients = clients.filter(c => c.type === 'REFERRAL_LAB');

    const openLedger = (client: Client) => {
        setSelectedClient(client);
        setIsLedgerOpen(true);
    };

    const openPriceEditor = (client: Client) => {
        setSelectedClient(client);
        setIsPriceEditorOpen(true);
    };

    const closeModal = () => {
        setSelectedClient(null);
        setIsLedgerOpen(false);
        setIsPriceEditorOpen(false);
    }

    return (
        <>
        {isLedgerOpen && selectedClient && <ClientLedgerModal client={selectedClient} onClose={closeModal} />}
        {isPriceEditorOpen && selectedClient && <ClientPriceEditorModal client={selectedClient} onClose={closeModal} />}

        <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">B2B Client Management</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Balance (₹)</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {b2bClients.map((client, index) => (
                            <tr key={client.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                                <td className="px-4 py-3 text-sm text-gray-600">{client.id}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-800">{client.name}</td>
                                <td className="px-4 py-3 text-sm font-semibold">
                                    <span className={client.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                                        {client.balance.toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm space-x-4">
                                    <button onClick={() => openLedger(client)} className="text-green-600 hover:text-green-800 font-medium">View Ledger</button>
                                    <button onClick={() => openPriceEditor(client)} className="text-blue-600 hover:text-blue-800 font-medium">Edit Prices</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        </>
    );
};