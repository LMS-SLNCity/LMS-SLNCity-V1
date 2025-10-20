import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const ReferralDoctorManagement: React.FC = () => {
    const { referralDoctors, addReferralDoctor } = useAppContext();
    const { user: actor } = useAuth();
    const [doctorName, setDoctorName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!doctorName.trim()) {
            alert('Please enter doctor name');
            return;
        }

        if (!actor) {
            alert("User session has expired. Please log in again.");
            return;
        }

        setIsLoading(true);
        try {
            await addReferralDoctor({ name: doctorName }, actor);
            setDoctorName('');
        } catch (error) {
            console.error('Failed to add referral doctor:', error);
            alert('Failed to add referral doctor');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add New Doctor Form */}
            <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Add New Referral Doctor</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Doctor Name
                            </label>
                            <input
                                type="text"
                                value={doctorName}
                                onChange={(e) => setDoctorName(e.target.value)}
                                placeholder="e.g., Dr. John Doe"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-primary text-white py-2 rounded-lg hover:bg-brand-primary_hover disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {isLoading ? 'Adding...' : 'Add Doctor'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Referral Doctors List */}
            <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Referral Doctors</h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor Name</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {referralDoctors && referralDoctors.length > 0 ? (
                                referralDoctors.map((doctor, index) => (
                                    <tr key={doctor.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                                        <td className="px-4 py-3 text-sm text-gray-600">{doctor.id}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{doctor.name}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2} className="px-4 py-3 text-center text-sm text-gray-500">
                                        No referral doctors found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

