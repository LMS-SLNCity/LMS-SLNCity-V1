import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Role, Permission } from '../../types';
import { useAuth } from '../../context/AuthContext';

const allPermissions: Permission[] = [
    'VIEW_RECEPTION', 'CREATE_VISIT', 'COLLECT_DUE_PAYMENT',
    'VIEW_PHLEBOTOMY', 'COLLECT_SAMPLE',
    'VIEW_LAB', 'ENTER_RESULTS',
    'VIEW_APPROVER', 'APPROVE_RESULTS',
    'VIEW_ADMIN_PANEL', 'MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_TESTS', 'MANAGE_ANTIBIOTICS', 'MANAGE_PRICES', 'MANAGE_B2B',
    'EDIT_APPROVED_REPORT', 'VIEW_AUDIT_LOG'
];

export const RoleManagement: React.FC = () => {
    const { rolePermissions, updateRolePermissions } = useAppContext();
    const { user: actor } = useAuth();
    const [permissions, setPermissions] = useState(rolePermissions);

    const handlePermissionChange = (role: Role, permission: Permission, checked: boolean) => {
        setPermissions(prev => {
            const currentPermissions = prev[role] || [];
            const newPermissions = checked
                ? [...currentPermissions, permission]
                : currentPermissions.filter(p => p !== permission);
            return { ...prev, [role]: Array.from(new Set(newPermissions)) };
        });
    };

    const handleSaveChanges = (role: Role) => {
        if (!actor) {
            alert("User session has expired. Please log in again.");
            return;
        }
        updateRolePermissions(role, permissions[role], actor);
        alert(`Permissions for ${role} updated successfully!`);
    };
    
    const editableRoles = Object.keys(permissions).filter(r => r !== 'SUDO') as Role[];

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Manage Role Permissions</h3>
            <p className="text-sm text-gray-600 mb-6">Assign granular permissions to each user role. Changes will apply to users of that role on their next login. <br/>Note: SUDO role is non-editable and has all permissions.</p>
            <div className="space-y-6">
                {editableRoles.map(role => (
                    <div key={role} className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                            <h4 className="text-md font-bold text-gray-800">{role}</h4>
                            <button 
                                onClick={() => handleSaveChanges(role)}
                                className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-xs"
                            >
                                Save Changes
                            </button>
                        </div>
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {allPermissions.map(permission => (
                                <label key={permission} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={permissions[role]?.includes(permission) || false}
                                        onChange={(e) => handlePermissionChange(role, permission, e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span className="text-sm font-medium text-gray-700">{permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
