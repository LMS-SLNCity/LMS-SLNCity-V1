import React, { useState, useMemo } from 'react';
import { User, Permission } from '../types';
import { UserManagement } from './admin/UserManagement';
import { TestTemplateManagement } from './admin/TestTemplateManagement';
import { PriceManagement } from './admin/PriceManagement';
import { B2BManagement } from './admin/B2BManagement';
import { RoleManagement } from './admin/RoleManagement';
import { useAuth } from '../context/AuthContext';
import { AuditLogViewer } from './admin/AuditLogViewer';
import { AntibioticManagement } from './admin/AntibioticManagement';
import { ReferralDoctorManagement } from './admin/ReferralDoctorManagement';
import { Dashboard } from './admin/Dashboard';
import { ApproverManagement } from './admin/ApproverManagement';
import { BranchManagement } from './admin/BranchManagement';

type AdminTab = 'dashboard' | 'users' | 'roles' | 'tests' | 'pricing' | 'b2b' | 'referral_doctors' | 'approvers' | 'branches' | 'audit' | 'antibiotics';

interface AdminPanelProps {
    user: User;
}

const TabButton: React.FC<{
    label: string;
    tabName: AdminTab;
    activeTab: AdminTab;
    onClick: (tab: AdminTab) => void;
}> = ({ label, tabName, activeTab, onClick }) => (
    <button
        onClick={() => onClick(tabName)}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
            activeTab === tabName 
            ? 'border-brand-primary text-brand-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
        {label}
    </button>
);


export const AdminPanel: React.FC<AdminPanelProps> = ({ user }) => {
    const { hasPermission } = useAuth();

    const availableTabs = useMemo(() => {
        const tabs: {name: AdminTab, label: string, permission: Permission}[] = [];
        tabs.push({name: 'dashboard', label: 'Dashboard', permission: 'MANAGE_USERS'});
        if(hasPermission('MANAGE_USERS')) tabs.push({name: 'users', label: 'User Management', permission: 'MANAGE_USERS'});
        if(hasPermission('MANAGE_USERS')) tabs.push({name: 'approvers', label: 'Approvers & Signatures', permission: 'MANAGE_USERS'});
        if(hasPermission('MANAGE_USERS')) tabs.push({name: 'branches', label: 'Branch Management', permission: 'MANAGE_USERS'});
        if(hasPermission('MANAGE_ROLES')) tabs.push({name: 'roles', label: 'Role Management', permission: 'MANAGE_ROLES'});
        if(hasPermission('MANAGE_TESTS')) tabs.push({name: 'tests', label: 'Test Management', permission: 'MANAGE_TESTS'});
        if(hasPermission('MANAGE_ANTIBIOTICS')) tabs.push({name: 'antibiotics', label: 'Manage Antibiotics', permission: 'MANAGE_ANTIBIOTICS'});
        if(hasPermission('MANAGE_PRICES')) tabs.push({name: 'pricing', label: 'Price Management', permission: 'MANAGE_PRICES'});
        if(hasPermission('MANAGE_B2B')) tabs.push({name: 'b2b', label: 'B2B Management', permission: 'MANAGE_B2B'});
        if(hasPermission('MANAGE_B2B')) tabs.push({name: 'referral_doctors', label: 'Referral Doctors', permission: 'MANAGE_B2B'});
        if(hasPermission('VIEW_AUDIT_LOG')) tabs.push({name: 'audit', label: 'Audit Log', permission: 'VIEW_AUDIT_LOG'});
        return tabs;
    }, [user, hasPermission]);


    const [activeTab, setActiveTab] = useState<AdminTab>(availableTabs[0]?.name || 'tests');
  
    return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
      <div className="mt-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {availableTabs.map(tab => (
                 <TabButton key={tab.name} label={tab.label} tabName={tab.name} activeTab={activeTab} onClick={setActiveTab} />
            ))}
        </nav>
      </div>

      <div className="mt-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'users' && hasPermission('MANAGE_USERS') && <UserManagement />}
        {activeTab === 'approvers' && hasPermission('MANAGE_USERS') && <ApproverManagement />}
        {activeTab === 'branches' && hasPermission('MANAGE_USERS') && <BranchManagement />}
        {activeTab === 'roles' && hasPermission('MANAGE_ROLES') && <RoleManagement />}
        {activeTab === 'tests' && hasPermission('MANAGE_TESTS') && <TestTemplateManagement />}
        {activeTab === 'antibiotics' && hasPermission('MANAGE_ANTIBIOTICS') && <AntibioticManagement />}
        {activeTab === 'pricing' && hasPermission('MANAGE_PRICES') && <PriceManagement />}
        {activeTab === 'b2b' && hasPermission('MANAGE_B2B') && <B2BManagement />}
        {activeTab === 'referral_doctors' && hasPermission('MANAGE_B2B') && <ReferralDoctorManagement />}
        {activeTab === 'audit' && hasPermission('VIEW_AUDIT_LOG') && <AuditLogViewer />}
      </div>
    </div>
  );
};