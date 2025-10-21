import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Client } from '../../types';
import { ClientLedgerModal } from './ClientLedgerModal';
import { ClientPriceEditorModal } from './ClientPriceEditorModal';

export const B2BManagement: React.FC = () => {
    const { clients, addClient } = useAppContext();
    const { user: actor } = useAuth();
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);
    const [isPriceEditorOpen, setIsPriceEditorOpen] = useState(false);
    const [clientName, setClientName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const b2bClients = clients.filter(c => c.type === 'REFERRAL_LAB');

    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!clientName.trim()) {
            alert('Please enter client name');
            return;
        }

        if (!actor) {
            alert("User session has expired. Please log in again.");
            return;
        }

        setIsLoading(true);
        try {
            addClient({ name: clientName, type: 'REFERRAL_LAB' }, actor);
            setClientName('');
        } catch (error) {
            console.error('Failed to add client:', error);
            alert('Failed to add client');
        } finally {
            setIsLoading(false);
        }
    };

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add New Client Form */}
            <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Add New B2B Client</h3>
                    <form onSubmit={handleAddClient} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Client Name
                            </label>
                            <input
                                type="text"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="e.g., City Clinic"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark disabled:opacity-50"
                        >
                            {isLoading ? 'Adding...' : 'Add Client'}
                        </button>
                    </form>
                </div>
            </div>

            {/* B2B Clients List */}
            <div className="lg:col-span-2">
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
        </div>
        </>
    );
};