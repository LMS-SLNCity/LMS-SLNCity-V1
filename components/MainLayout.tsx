import React, { useState, useEffect, useMemo } from 'react';
import { CreateVisitForm } from './CreateVisitForm';
import { PhlebotomyQueue } from './PhlebotomyQueue';
import { LabQueue } from './LabQueue';
import { Navbar, View } from './Navbar';
import { ApproverQueue } from './ApproverQueue';
import { AdminPanel } from './AdminPanel';
import { ReportModal } from './ReportModal';
import { SignatorySelectionModal } from './SignatorySelectionModal';
import { Visit, Signatory, User, Permission, VisitTest } from '../types';
import { useAuth } from '../context/AuthContext';
import { ResultEntryForm } from './ResultEntryForm';
import { EditReasonModal } from './EditReasonModal';


interface MainLayoutProps {
    user: User;
}

const viewOrder: { view: View; permission: Permission }[] = [
    { view: 'reception', permission: 'VIEW_RECEPTION' },
    { view: 'phlebotomy', permission: 'VIEW_PHLEBOTOMY' },
    { view: 'lab', permission: 'VIEW_LAB' },
    { view: 'approver', permission: 'VIEW_APPROVER' },
    { view: 'admin', permission: 'VIEW_ADMIN_PANEL' },
];

export const MainLayout: React.FC<MainLayoutProps> = ({ user }) => {
  const { hasPermission, logout } = useAuth();
  
  const allowedViews = useMemo(() => {
    return viewOrder
        .filter(item => hasPermission(item.permission))
        .map(item => item.view);
  }, [user.permissions, hasPermission]);
  
  // FIX: Initialize with undefined and let useEffect handle setting the initial view.
  const [currentView, setCurrentView] = useState<View | undefined>(undefined);
  
  useEffect(() => {
    const defaultView = allowedViews.length > 0 ? allowedViews[0] : undefined;
    
    if (user && allowedViews.length === 0) {
        alert("You do not have any permissions to view this application. Please contact an administrator.");
        logout();
        return; 
    }
    
    // This condition prevents the infinite loop.
    // It only sets the view if it's undefined (on initial load) or invalid.
    if (!currentView || !allowedViews.includes(currentView)) {
        setCurrentView(defaultView);
    }
  // FIX: Removed `currentView` from dependency array to break the infinite loop.
  }, [user, allowedViews, logout]);


  const [visitForReport, setVisitForReport] = useState<Visit | null>(null);
  const [isSignatoryModalOpen, setIsSignatoryModalOpen] = useState(false);
  const [selectedSignatory, setSelectedSignatory] = useState<Signatory | null>(null);

  const [testToEdit, setTestToEdit] = useState<VisitTest | null>(null);
  const [isEditReasonModalOpen, setIsEditReasonModalOpen] = useState(false);
  const [editReason, setEditReason] = useState("");


  const handleInitiateReport = (visit: Visit) => {
    setVisitForReport(visit);
    setIsSignatoryModalOpen(true);
  };

  const handleSignatoryConfirm = (signatory: Signatory) => {
    setSelectedSignatory(signatory);
    setIsSignatoryModalOpen(false);
  };

  const handleCloseReport = () => {
    setVisitForReport(null);
    setSelectedSignatory(null);
  };
  
  const handleCloseSignatoryModal = () => {
    setVisitForReport(null);
    setIsSignatoryModalOpen(false);
  }
  
  const handleEditReport = (test: VisitTest) => {
    setTestToEdit(test);
    setIsEditReasonModalOpen(true);
    // Don't close the main report modal, just hide it temporarily
    setVisitForReport(null);
    setSelectedSignatory(null);
  }
  
  const handleEditReasonSubmit = (reason: string) => {
      setEditReason(reason);
      setIsEditReasonModalOpen(false);
  }

  const handleCloseEdit = () => {
      setTestToEdit(null);
      setEditReason("");
  }

  const isReportModalOpen = visitForReport && selectedSignatory;
  
  if (!currentView) {
      return <div className="min-h-screen flex items-center justify-center">Loading user permissions...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
        <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-brand-secondary">SLNCity</h1>
                <span className="text-gray-500 font-light">Diagnostic Center</span>
            </div>
            <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 hidden sm:block">Welcome, <span className="font-semibold">{user.username} ({user.role})</span></span>
                <Navbar currentView={currentView} setCurrentView={setCurrentView} allowedViews={allowedViews} />
            </div>
        </div>
        </header>
        <main className="container mx-auto p-4 md:p-6">
        {currentView === 'reception' && <CreateVisitForm onInitiateReport={handleInitiateReport} />}
        {currentView === 'phlebotomy' && <PhlebotomyQueue onInitiateReport={handleInitiateReport} />}
        {currentView === 'lab' && <LabQueue onInitiateReport={handleInitiateReport} />}
        {currentView === 'approver' && <ApproverQueue onInitiateReport={handleInitiateReport} />}
        {currentView === 'admin' && <AdminPanel user={user} />}
        </main>
        <footer className="text-center py-4 text-sm text-gray-500">
        <p>&copy; 2024 SLNCity Diagnostic Center. All rights reserved.</p>
        </footer>
        
        {isEditReasonModalOpen && testToEdit && (
            <EditReasonModal 
                onClose={() => setIsEditReasonModalOpen(false)}
                onSubmit={handleEditReasonSubmit}
            />
        )}


        {testToEdit && editReason && (
            <ResultEntryForm
                test={testToEdit}
                onClose={handleCloseEdit}
                isEditMode={true}
                editReason={editReason}
            />
        )}


        {isSignatoryModalOpen && visitForReport && (
        <SignatorySelectionModal
            visit={visitForReport}
            onClose={handleCloseSignatoryModal}
            onConfirm={handleSignatoryConfirm}
        />
        )}

        {isReportModalOpen && (
            <ReportModal visit={visitForReport} signatory={selectedSignatory} onClose={handleCloseReport} onEdit={handleEditReport}/>
        )}
    </div>
  );
};