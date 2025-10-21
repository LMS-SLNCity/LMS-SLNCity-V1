import React, { useState } from 'react';
import { Client } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface ClientPriceEditorModalProps {
  client: Client;
  onClose: () => void;
}

export const ClientPriceEditorModal: React.FC<ClientPriceEditorModalProps> = ({ client, onClose }) => {
  const { testTemplates, clientPrices, updateClientPrices } = useAppContext();
  const { user: actor } = useAuth();
  const [prices, setPrices] = useState<Record<number, string>>(() => {
    const initialPrices: Record<number, string> = {};
    testTemplates.forEach(test => {
      const clientPrice = clientPrices.find(p => p.clientId === client.id && p.testTemplateId === test.id);
      initialPrices[test.id] = clientPrice ? clientPrice.price.toString() : test.b2b_price.toString();
    });
    return initialPrices;
  });

  const [isSaving, setIsSaving] = useState(false);

  const handlePriceChange = (testId: number, value: string) => {
    setPrices((prev: Record<number, string>) => ({
      ...prev,
      [testId]: value
    }));
  };

  const handleSave = async () => {
    if (!actor) {
      alert('User session expired');
      return;
    }

    setIsSaving(true);
    try {
      const pricesToUpdate = Object.entries(prices)
        .map(([testId, price]) => ({
          testTemplateId: parseInt(testId),
          price: parseFloat(price) || 0
        }))
        .filter(p => p.price > 0);

      updateClientPrices(client.id, pricesToUpdate, actor);
      alert('Prices updated successfully');
      onClose();
    } catch (error) {
      console.error('Failed to update prices:', error);
      alert('Failed to update prices');
    } finally {
      setIsSaving(false);
    }
  };

  const activeTests = testTemplates.filter(t => t.isActive);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Custom Prices for {client.name}</h3>
        <p className="text-sm text-gray-600 mb-6">Set custom prices for this B2B client. Leave blank to use default B2B price.</p>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wider pb-2 border-b">
            <div>Test Name</div>
            <div className="grid grid-cols-3 gap-2">
              <div>Default B2B</div>
              <div>Custom Price</div>
              <div>Savings</div>
            </div>
          </div>

          {activeTests.map(test => {
            const customPrice = parseFloat(prices[test.id]) || test.b2b_price;
            const savings = test.b2b_price - customPrice;
            const savingsPercent = ((savings / test.b2b_price) * 100).toFixed(1);

            return (
              <div key={test.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{test.name}</p>
                  <p className="text-xs text-gray-500">{test.code}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-semibold text-gray-700">₹{test.b2b_price.toFixed(2)}</div>
                  <input
                    type="number"
                    value={prices[test.id]}
                    onChange={(e) => handlePriceChange(test.id, e.target.value)}
                    placeholder={test.b2b_price.toString()}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    disabled={isSaving}
                  />
                  <div className={`text-sm font-semibold ${savings > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                    {savings > 0 ? `₹${savings.toFixed(2)} (${savingsPercent}%)` : '-'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Prices'}
          </button>
        </div>
      </div>
    </div>
  );
};
