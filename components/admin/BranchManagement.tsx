import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Branch } from '../../types';
import { Input } from '../form/Input';
import { useAuth } from '../../context/AuthContext';

export const BranchManagement: React.FC = () => {
    const { branches, addBranch, updateBranch, deleteBranch } = useAppContext();
    const { user: actor } = useAuth();
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        city: '',
        state: '',
        pincode: '',
    });

    const handleAddBranch = () => {
        setEditingBranch(null);
        setFormData({
            name: '',
            address: '',
            phone: '',
            email: '',
            city: '',
            state: '',
            pincode: '',
        });
        setIsFormOpen(true);
    };

    const handleEditBranch = (branch: Branch) => {
        setEditingBranch(branch);
        setFormData({
            name: branch.name,
            address: branch.address,
            phone: branch.phone || '',
            email: branch.email || '',
            city: branch.city || '',
            state: branch.state || '',
            pincode: branch.pincode || '',
        });
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.address) {
            alert('Name and address are required');
            return;
        }
        if (!actor) {
            alert("User session has expired. Please log in again.");
            return;
        }

        try {
            if (editingBranch) {
                await updateBranch({
                    id: editingBranch.id,
                    ...formData,
                    isActive: editingBranch.isActive,
                }, actor);
            } else {
                await addBranch({
                    ...formData,
                    isActive: true,
                }, actor);
            }
            alert('Branch saved successfully');
            setIsFormOpen(false);
        } catch (error) {
            alert('Error saving branch');
            console.error(error);
        }
    };

    const handleDeleteBranch = (branch: Branch) => {
        if (!actor) {
            alert("User session has expired. Please log in again.");
            return;
        }
        if (window.confirm(`Are you sure you want to deactivate branch "${branch.name}"?`)) {
            deleteBranch(branch.id, actor);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700">Branch Management</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage diagnostic center branches</p>
                </div>
                <button
                    onClick={handleAddBranch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    + Add Branch
                </button>
            </div>

            {isFormOpen && (
                <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
                    <h4 className="text-md font-semibold text-gray-800 mb-4">
                        {editingBranch ? 'Edit Branch' : 'Add New Branch'}
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Branch Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                            <Input
                                label="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <Input
                                label="City"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                            />
                            <Input
                                label="State"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                            />
                            <Input
                                label="Pincode"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleInputChange}
                            />
                        </div>
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Save Branch
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Address</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">City</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {branches.map((branch, index) => (
                            <tr key={branch.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-800">{branch.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{branch.address}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{branch.city || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{branch.phone || '-'}</td>
                                <td className="px-4 py-3 text-sm">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        branch.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {branch.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm space-x-2">
                                    <button
                                        onClick={() => handleEditBranch(branch)}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Edit
                                    </button>
                                    {branch.isActive && (
                                        <button
                                            onClick={() => handleDeleteBranch(branch)}
                                            className="text-red-600 hover:text-red-800 font-medium"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {branches.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p>No branches found. Create your first branch.</p>
                </div>
            )}
        </div>
    );
};

