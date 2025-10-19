import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Antibiotic } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../form/Input';

export const AntibioticManagement: React.FC = () => {
    const { antibiotics, addAntibiotic, updateAntibiotic, deleteAntibiotic } = useAppContext();
    const { user: actor } = useAuth();

    const [editing, setEditing] = useState<Partial<Antibiotic> | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleEdit = (antibiotic: Antibiotic) => {
        setEditing({ ...antibiotic });
        setIsCreating(false);
    };

    const handleAddNew = () => {
        setEditing({ name: '', abbreviation: '' });
        setIsCreating(true);
    };
    
    const handleCancel = () => {
        setEditing(null);
        setIsCreating(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editing) return;
        setEditing(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = () => {
        if (!actor || !editing || !editing.name || !editing.abbreviation) {
            alert("Name and Abbreviation are required.");
            return;
        }

        if (isCreating) {
            addAntibiotic({ name: editing.name, abbreviation: editing.abbreviation }, actor);
        } else if (editing.id) {
            updateAntibiotic(editing as Antibiotic, actor);
        }
        handleCancel();
    };
    
    const handleDelete = (id: number) => {
        if (!actor) return;
        if(window.confirm('Are you sure you want to deactivate this antibiotic?')) {
            deleteAntibiotic(id, actor);
        }
    };
    
    const activeAntibiotics = antibiotics.filter(a => a.isActive);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Manage Master Antibiotics</h3>
                 {!editing && <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-primary_hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                    Add New Antibiotic
                </button>}
            </div>

            {editing && (
                 <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 mb-6 space-y-4">
                     <h4 className="font-semibold text-gray-800">{isCreating ? 'Add New Antibiotic' : `Editing: ${editing.name}`}</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input label="Antibiotic Name" name="name" value={editing.name || ''} onChange={handleChange} required />
                        <Input label="Abbreviation" name="abbreviation" value={editing.abbreviation || ''} onChange={handleChange} required />
                     </div>
                     <div className="flex justify-end space-x-3">
                        <button onClick={handleCancel} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">Save</button>
                     </div>
                 </div>
            )}
            
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Abbreviation</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {activeAntibiotics.map((ab, index) => (
                            <tr key={ab.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                                <td className="px-4 py-3 text-sm text-gray-600">{ab.id}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-800">{ab.name}</td>
                                <td className="px-4 py-3 text-sm font-mono text-gray-600">{ab.abbreviation}</td>
                                <td className="px-4 py-3 text-sm space-x-4">
                                    <button onClick={() => handleEdit(ab)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                                    <button onClick={() => handleDelete(ab.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};