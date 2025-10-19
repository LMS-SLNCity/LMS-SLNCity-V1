import React, { useState } from 'react';
import { Client } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Input } from '../form/Input';
import { useAuth } from '../../context/AuthContext';

interface ClientLedgerModalProps {
  client: Client;
  onClose: () => void;
}

export const ClientLedgerModal: React.FC<ClientLedgerModalProps> = ({ client, onClose }) => {
    const { ledgerEntries, addClientPayment } = useAppContext();
    const { user: actor } = useAuth();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('Monthly Settlement');

    const clientLedger = ledgerEntries
        .filter(entry => entry.clientId === client.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const paymentAmount = Number(amount);
        if (!actor) {
            alert("User session has expired. Please log in again.");
            return;
        }
        if(paymentAmount > 0 && description) {
            addClientPayment(client.id, paymentAmount, description, actor);
            setAmount('');
            setDescription('Monthly Settlement');
        } else {
            alert('Please enter a valid amount and description.');
        }
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl transform transition-all max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900" id="modal-title">
                        Ledger for {client.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Current Balance: 
                        <span className={`font-bold ml-2 ${client.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                           ₹{client.balance.toFixed(2)}
                        </span>
                    </p>
                </div>

                <div className="p-6 overflow-y-auto flex-grow">
                     <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Debit (₹)</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Credit (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {clientLedger.map((entry, index) => (
                                    <tr key={entry.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                                        <td className="px-4 py-2 text-xs text-gray-600 whitespace-nowrap">{new Date(entry.created_at).toLocaleString()}</td>
                                        <td className="px-4 py-2 text-xs text-gray-800">{entry.description}</td>
                                        <td className="px-4 py-2 text-xs text-right font-mono text-red-600">
                                            {entry.type === 'DEBIT' ? entry.amount.toFixed(2) : '-'}
                                        </td>
                                        <td className="px-4 py-2 text-xs text-right font-mono text-green-600">
                                             {entry.type === 'CREDIT' ? entry.amount.toFixed(2) : '-'}
                                        </td>
                                    </tr>
                                ))}
                                {clientLedger.length === 0 && (
                                    <tr><td colSpan={4} className="text-center py-4 text-sm text-gray-500">No transactions found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <form onSubmit={handlePaymentSubmit} className="p-6 border-t border-gray-200 bg-gray-50">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Add Payment / Settlement</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <Input label="Amount (₹)" name="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
                        <Input label="Description" name="description" value={description} onChange={e => setDescription(e.target.value)} required />
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-primary_hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                            Add Credit
                        </button>
                    </div>
                </form>

                <div className="bg-gray-100 px-6 py-4 flex justify-end items-center rounded-b-2xl border-t border-gray-200">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};