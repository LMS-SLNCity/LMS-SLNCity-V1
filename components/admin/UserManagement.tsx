import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Role, User } from '../../types';
import { Input } from '../form/Input';
import { Select } from '../form/Select';
import { UserPermissionsModal } from './UserPermissionsModal';
import { useAuth } from '../../context/AuthContext';

export const UserManagement: React.FC = () => {
    const { users, addUser } = useAppContext();
    const { user: actor } = useAuth();
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>('RECEPTION');
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!username || !password || !role) {
            alert('Please fill all fields');
            return;
        }
        if (!actor) {
            alert("User session has expired. Please log in again.");
            return;
        }
        addUser({ username, password_hash: password, role }, actor);
        setUsername('');
        setPassword('');
        setRole('RECEPTION');
    };

    const roleOptions: Role[] = ['SUDO', 'ADMIN', 'RECEPTION', 'PHLEBOTOMY', 'LAB', 'APPROVER'];

    return (
        <>
        {editingUser && (
            <UserPermissionsModal 
                user={editingUser}
                onClose={() => setEditingUser(null)}
            />
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Existing Users</h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user, index) => (
                                <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                                    <td className="px-4 py-3 text-sm text-gray-600">{user.id}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{user.username}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{user.role}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <button 
                                            onClick={() => setEditingUser(user)}
                                            className="font-medium text-brand-primary hover:text-brand-primary_hover"
                                        >
                                            Edit Permissions
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Create New User</h3>
                <form onSubmit={handleSubmit} className="p-6 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
                    <Input label="Username" name="username" value={username} onChange={e => setUsername(e.target.value)} required />
                    <Input label="Password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <Select label="Role (template)" name="role" value={role} onChange={e => setRole(e.target.value as Role)} options={roleOptions} required />
                    <button type="submit" className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-primary_hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        Create User
                    </button>
                </form>
            </div>
        </div>
        </>
    );
};