import React, { useState } from 'react';
import { Visit } from '../types';
import { Input } from './form/Input';
import { Select } from './form/Select';

type PaymentMode = 'Cash' | 'Card' | 'UPI' | '';

interface CollectDueModalProps {
  visit: Visit;
  onClose: () => void;
  onSuccess: (visitId: number, amount: number, mode: PaymentMode) => void;
}

export const CollectDueModal: React.FC<CollectDueModalProps> = ({ visit, onClose, onSuccess }) => {
  const [amountPaid, setAmountPaid] = useState(visit.due_amount);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  
  const paymentModeOptions: { label: string, value: PaymentMode }[] = [
    { label: 'Cash', value: 'Cash' },
    { label: 'Card', value: 'Card' },
    { label: 'UPI', value: 'UPI' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountPaid <= 0 || !paymentMode) {
        alert("Please enter a valid amount and select a payment mode.");
        return;
    }
    if (amountPaid > visit.due_amount) {
        alert(`Amount paid cannot be more than the due amount of ₹${visit.due_amount.toFixed(2)}`);
        return;
    }
    onSuccess(visit.id, amountPaid, paymentMode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        <form onSubmit={handleSubmit}>
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900" id="modal-title">Collect Due Payment</h3>
                <p className="text-sm text-gray-500 mt-1">Visit: {visit.visit_code} - {visit.patient.name}</p>
                
                <div className="mt-6 p-4 border rounded-lg bg-gray-50 text-center">
                    <p className="text-sm font-medium text-gray-600">Amount Due</p>
                    <p className="text-3xl font-bold text-red-600">₹{visit.due_amount.toFixed(2)}</p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4">
                    <Input 
                        name="amount_paid"
                        label="Amount Being Paid"
                        type="number"
                        value={String(amountPaid)}
                        onChange={(e) => setAmountPaid(Number(e.target.value))}
                        required
                        min="0.01"
                        step="0.01"
                    />
                    <Select 
                        name="payment_mode"
                        label="Payment Mode"
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                        options={paymentModeOptions}
                        required
                    />
                </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end items-center space-x-3 rounded-b-xl">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                    Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Confirm Payment & Print
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};