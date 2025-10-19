import React, { useState, useEffect } from 'react';
import { Client } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface ClientPriceEditorModalProps {
  client: Client;
  onClose: () => void;
}

type PriceEditState = {
    [testTemplateId: number]: string;
};

export const ClientPriceEditorModal: React.FC<ClientPriceEditorModalProps> = ({ client, onClose }) => {
    const { testTemplates, clientPrices, updateClientPrices } = useAppContext();
    const { user: actor } = useAuth();
    const [prices, setPrices] = useState<PriceEditState>({});

    useEffect(() => {
        const initialPrices = clientPrices
            .filter(p => p.clientId === client.id)
            .reduce((acc, p) => {
                acc[p.testTemplateId] = String(p.price);
                return acc;
            }, {} as PriceEditState);
        setPrices(initialPrices);
    }, [clientPrices, client.id]);

    const handleChange = (testTemplateId: number, value: string) => {
        setPrices(prev => ({ ...prev, [testTemplateId]: value }));
    };

    const handleSave = () => {
        if (!actor) {
            alert("User session has expired. Please log in again.");
            return;
        }
        const pricesToUpdate = Object.entries(prices)
            .map(([testTemplateId, price]) => ({
                testTemplateId: Number(testTemplateId),
                price: Number(price)
            }))
            .filter(p => !isNaN(p.price));
            
        updateClientPrices(client.id, pricesToUpdate, actor);
        onClose();
    };

    const activeTemplates = testTemplates.filter(t => t.isActive);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl transform transition-all max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900" id="modal-title">
                        Custom Price List for {client.name}
                    </h3>
                     <p className="text-sm text-gray-500 mt-1">
                        Leave a price blank to use the default B2B price for that test.
                    </p>
                </div>
                
                <div className="p-6 overflow-y-auto flex-grow">
                     <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Test Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Default B2B Price (₹)</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Custom Price (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {activeTemplates.map((template, index) => (
                                    <tr key={template.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-800">{template.name}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{template.b2b_price.toFixed(2)}</td>
                                        <td className="px-4 py-2">
                                             <input 
                                                type="number"
                                                placeholder="Use Default"
                                                value={prices[template.id] || ''}
                                                onChange={(e) => handleChange(template.id, e.target.value)}
                                                className="w-32 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end items-center space-x-3 rounded-b-2xl border-t border-gray-200">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">
                        Cancel
