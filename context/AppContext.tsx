import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Visit, VisitTest, Patient, TestTemplate, VisitTestStatus, User, Role, UserWithPassword, Client, ClientPrice, LedgerEntry, RolePermissions, Permission, CultureResult, AuditLog, Antibiotic } from '../types';
import { mockTestTemplates, mockUsers, mockClients, mockClientPrices, mockLedgerEntries, mockRolePermissions, mockAuditLogs, mockAntibiotics, mockPatients } from '../api/mock';

// Define a type for user creation data to avoid exposing password hash elsewhere
type UserCreationData = Omit<User, 'id' | 'isActive' | 'permissions'> & { password_hash: string };


interface AppState {
  visits: Visit[];
  visitTests: VisitTest[];
  users: UserWithPassword[];
  testTemplates: TestTemplate[];
  clients: Client[];
  clientPrices: ClientPrice[];
  ledgerEntries: LedgerEntry[];
  rolePermissions: RolePermissions;
  auditLogs: AuditLog[];
  antibiotics: Antibiotic[];
  patients: Patient[];
}

interface AddVisitData {
    patient: Omit<Patient, 'id'>;
    referred_doctor_id?: number;
    ref_customer_id?: number;
    other_ref_doctor?: string;
    other_ref_customer?: string;
    registration_datetime?: string;
    testIds: number[];
    total_cost: number;
    amount_paid: number;
    payment_mode: 'Cash' | 'Card' | 'UPI' | '';
}

interface UpdateStatusDetails {
    collectedBy?: string;
    specimen_type?: string;
}

interface AddResultData {
    results?: Record<string, string | number>;
    cultureResult?: CultureResult;
}

interface AppContextType extends AppState {
  addVisit: (visitData: AddVisitData, actor: User) => void;
  updateVisitTestStatus: (visitTestId: number, status: VisitTestStatus, actor: User, details?: UpdateStatusDetails) => void;
  addTestResult: (visitTestId: number, data: AddResultData, actor: User) => void;
  editTestResult: (visitTestId: number, data: AddResultData, reason: string, actor: User) => void;
  approveTestResult: (visitTestId: number, actor: User) => void;
  collectDuePayment: (visitId: number, amount: number, mode: Visit['payment_mode'], actor: User) => void;
  // Admin functions
  addUser: (userData: UserCreationData, actor: User) => void;
  updateUserPermissions: (userId: number, permissions: Permission[], actor: User) => void;
  addTestTemplate: (templateData: Omit<TestTemplate, 'id'>, actor: User) => void;
  updateTestTemplate: (templateData: TestTemplate, actor: User) => void;
  deleteTestTemplate: (templateId: number, actor: User) => void;
  updateTestPrices: (priceData: { id: number, price: number, b2b_price: number }[], actor: User) => void;
  updateRolePermissions: (role: Role, permissions: Permission[], actor: User) => void;
  // B2B Functions
  updateClientPrices: (clientId: number, prices: { testTemplateId: number, price: number }[], actor: User) => void;
  addClientPayment: (clientId: number, amount: number, description: string, actor: User) => void;
  // Antibiotic Management
  addAntibiotic: (antibiotic: Omit<Antibiotic, 'id' | 'isActive'>, actor: User) => void;
  updateAntibiotic: (antibiotic: Antibiotic, actor: User) => void;
  deleteAntibiotic: (antibioticId: number, actor: User) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    visits: [],
    visitTests: [],
    users: mockUsers,
    testTemplates: mockTestTemplates,
    clients: mockClients,
    clientPrices: mockClientPrices,
    ledgerEntries: mockLedgerEntries,
    rolePermissions: mockRolePermissions,
    auditLogs: mockAuditLogs,
    antibiotics: mockAntibiotics,
    patients: mockPatients,
  });
  
  const addAuditLog = (username: string, action: string, details: string) => {
      setState(prevState => {
          const newLog: AuditLog = {
              id: prevState.auditLogs.length + 1,
              timestamp: new Date().toISOString(),
              username,
              action,
              details,
          };
          return { ...prevState, auditLogs: [newLog, ...prevState.auditLogs] };
      });
  };

  const addVisit = (visitData: AddVisitData, actor: User) => {
    addAuditLog(actor.username, 'CREATE_VISIT', `Created visit for patient ${visitData.patient.name} with ${visitData.testIds.length} tests.`);
    setState(prevState => {
      const newVisitId = (prevState.visits.length > 0 ? Math.max(...prevState.visits.map(v => v.id)) : 0) + 1;
      const visitCode = `LAB-${new Date().getFullYear()}-${String(newVisitId).padStart(4, '0')}`;

      let lastTestId = (prevState.visitTests.length > 0 ? Math.max(...prevState.visitTests.map(t => t.id)) : 0);

      const newTests: VisitTest[] = visitData.testIds.map(templateId => {
        const template = prevState.testTemplates.find(t => t.id === templateId);
        if (!template) throw new Error(`Test template with id ${templateId} not found.`);
        
        lastTestId++;
        return {
          id: lastTestId,
          visitId: newVisitId,
          patientName: visitData.patient.name,
          visitCode: visitCode,
          template: template,
          status: 'PENDING',
        };
      });
      
      let updatedPatients = [...prevState.patients];
      const existingPatientIndex = prevState.patients.findIndex(p => p.phone && p.phone === visitData.patient.phone);
      let patientForVisit: Patient;

      if (existingPatientIndex !== -1) {
          const existingPatient = prevState.patients[existingPatientIndex];
          patientForVisit = {
              ...existingPatient,
              ...visitData.patient,
              id: existingPatient.id,
          };
          updatedPatients[existingPatientIndex] = patientForVisit;
      } else {
          const newPatientId = (prevState.patients.length > 0 ? Math.max(...prevState.patients.map(p => p.id || 0)) : 0) + 1;
          patientForVisit = {
              ...visitData.patient,
              id: newPatientId,
          };
          updatedPatients.push(patientForVisit);
      }

      const newVisit: Visit = {
        id: newVisitId,
        patient: patientForVisit,
        referred_doctor_id: visitData.referred_doctor_id,
        ref_customer_id: visitData.ref_customer_id,
        other_ref_doctor: visitData.other_ref_doctor,
        other_ref_customer: visitData.other_ref_customer,
        registration_datetime: visitData.registration_datetime,
        visit_code: visitCode,
        created_at: new Date().toISOString(),
        total_cost: visitData.total_cost,
        amount_paid: visitData.amount_paid,
        payment_mode: visitData.payment_mode,
        due_amount: visitData.total_cost - visitData.amount_paid,
        tests: newTests.map(t => t.id),
      };
      
      let newLedgerEntries = [...prevState.ledgerEntries];
      let newClients = [...prevState.clients];
      
      const client = prevState.clients.find(c => c.id === visitData.ref_customer_id);
      if(client && client.type === 'REFERRAL_LAB') {
        const newLedgerId = (prevState.ledgerEntries.length > 0 ? Math.max(...prevState.ledgerEntries.map(l => l.id)) : 0) + 1;
        const debitEntry: LedgerEntry = {
            id: newLedgerId,
            clientId: client.id,
            visitId: newVisitId,
            type: 'DEBIT',
            amount: newVisit.total_cost,
            description: `Visit ${visitCode} for ${visitData.patient.name}`,
            created_at: new Date().toISOString(),
        };
        newLedgerEntries.push(debitEntry);
        
        newClients = prevState.clients.map(c => 
            c.id === client.id ? { ...c, balance: c.balance + newVisit.total_cost } : c
        );
      }

      return {
        ...prevState,
        visits: [...prevState.visits, newVisit],
        visitTests: [...prevState.visitTests, ...newTests],
        ledgerEntries: newLedgerEntries,
        clients: newClients,
        patients: updatedPatients,
      };
    });
  };
  
  const updateVisitTestStatus = (visitTestId: number, status: VisitTestStatus, actor: User, details?: UpdateStatusDetails) => {
    const test = state.visitTests.find(t => t.id === visitTestId);
    if (test) {
        addAuditLog(actor.username, 'UPDATE_TEST_STATUS', `Updated status for test ${test.template.code} (Visit: ${test.visitCode}) to ${status}.`);
    }
    setState(prevState => ({
      ...prevState,
      visitTests: prevState.visitTests.map(test =>
        test.id === visitTestId
          ? {
              ...test,
              status,
              collectedBy: details?.collectedBy || test.collectedBy,
              collectedAt: status === 'SAMPLE_COLLECTED' ? new Date().toISOString() : test.collectedAt,
              specimen_type: details?.specimen_type || test.specimen_type,
            }
          : test
      ),
    }));
  };
  
  const addTestResult = (visitTestId: number, data: AddResultData, actor: User) => {
    const test = state.visitTests.find(t => t.id === visitTestId);
    if(test) {
       addAuditLog(actor.username, 'ENTER_RESULTS', `Entered results for test ${test.template.code} (Visit: ${test.visitCode}).`);
    }
    setState(prevState => ({
      ...prevState,
      visitTests: prevState.visitTests.map(test =>
        test.id === visitTestId
          ? { 
              ...test, 
              status: 'AWAITING_APPROVAL', 
              results: data.results || test.results,
              cultureResult: data.cultureResult || test.cultureResult 
            }
          : test
      ),
    }));
  };

   const editTestResult = (visitTestId: number, data: AddResultData, reason: string, actor: User) => {
    const test = state.visitTests.find(t => t.id === visitTestId);
    if (test) {
        addAuditLog(actor.username, 'EDIT_APPROVED_REPORT', `Edited approved results for test ${test.template.code} (Visit: ${test.visitCode}). Reason: ${reason}`);
    }
    setState(prevState => ({
      ...prevState,
      visitTests: prevState.visitTests.map(test =>
        test.id === visitTestId
          ? { 
              ...test, 
              results: data.results || test.results,
              cultureResult: data.cultureResult || test.cultureResult 
            }
          : test
      ),
    }));
  };

  const approveTestResult = (visitTestId: number, actor: User) => {
    const test = state.visitTests.find(t => t.id === visitTestId);
     if(test) {
       addAuditLog(actor.username, 'APPROVE_RESULTS', `Approved results for test ${test.template.code} (Visit: ${test.visitCode}).`);
    }
    setState(prevState => ({
        ...prevState,
        visitTests: prevState.visitTests.map(test => 
            test.id === visitTestId
            ? {
                ...test,
                status: 'APPROVED',
                approvedBy: actor.username,
                approvedAt: new Date().toISOString(),
              }
            : test
        )
    }));
  };
  
  const collectDuePayment = (visitId: number, amount: number, mode: Visit['payment_mode'], actor: User) => {
     const visit = state.visits.find(v => v.id === visitId);
     if(visit) {
        addAuditLog(actor.username, 'COLLECT_DUE_PAYMENT', `Collected due payment of ₹${amount} for visit ${visit.visit_code}.`);
     }
    setState(prevState => ({
        ...prevState,
        visits: prevState.visits.map(visit => {
            if (visit.id === visitId) {
                const newAmountPaid = visit.amount_paid + amount;
                return {
                    ...visit,
                    amount_paid: newAmountPaid,
                    due_amount: visit.total_cost - newAmountPaid,
                    payment_mode: mode,
                };
            }
            return visit;
        })
    }));
  };

  const addUser = (userData: UserCreationData, actor: User) => {
    addAuditLog(actor.username, 'MANAGE_USERS', `Created new user: ${userData.username} with role ${userData.role}.`);
    setState(prevState => {
        const newUserId = (prevState.users.length > 0 ? Math.max(...prevState.users.map(u => u.id)) : 0) + 1;
        const newUser: UserWithPassword = {
            id: newUserId,
            isActive: true,
            username: userData.username,
            role: userData.role,
            password_hash: userData.password_hash,
            permissions: prevState.rolePermissions[userData.role] || []
        };
        return {
            ...prevState,
            users: [...prevState.users, newUser]
        };
    });
  };

  const updateUserPermissions = (userId: number, permissions: Permission[], actor: User) => {
      const user = state.users.find(u => u.id === userId);
      if(user) {
         addAuditLog(actor.username, 'MANAGE_USERS', `Updated permissions for user: ${user.username}.`);
      }
      setState(prevState => ({
          ...prevState,
          users: prevState.users.map(user => 
              user.id === userId ? { ...user, permissions } : user
          )
      }));
  };

  const addTestTemplate = (templateData: Omit<TestTemplate, 'id'>, actor: User) => {
     addAuditLog(actor.username, 'MANAGE_TESTS', `Created new test template: ${templateData.name}.`);
     setState(prevState => {
        const newTemplateId = (prevState.testTemplates.length > 0 ? Math.max(...prevState.testTemplates.map(t => t.id)) : 0) + 1;
        const newTemplate: TestTemplate = {
            id: newTemplateId,
            ...templateData,
        };
        return {
            ...prevState,
            testTemplates: [...prevState.testTemplates, newTemplate]
        };
    });
  };

  const updateTestTemplate = (templateData: TestTemplate, actor: User) => {
    addAuditLog(actor.username, 'MANAGE_TESTS', `Updated test template: ${templateData.name}.`);
    setState(prevState => ({
        ...prevState,
        testTemplates: prevState.testTemplates.map(t => t.id === templateData.id ? templateData : t)
    }));
  };
  
  const deleteTestTemplate = (templateId: number, actor: User) => {
     const template = state.testTemplates.find(t => t.id === templateId);
     if(template){
        addAuditLog(actor.username, 'MANAGE_TESTS', `Deactivated test template: ${template.name}.`);
     }
     setState(prevState => ({
        ...prevState,
        testTemplates: prevState.testTemplates.map(t => t.id === templateId ? { ...t, isActive: false } : t)
    }));
  };

  const updateTestPrices = (priceData: { id: number, price: number, b2b_price: number }[], actor: User) => {
    addAuditLog(actor.username, 'MANAGE_PRICES', `Updated prices for ${priceData.length} tests.`);
    setState(prevState => {
        const updatedTemplates = prevState.testTemplates.map(template => {
            const update = priceData.find(p => p.id === template.id);
            if (update) {
                return { ...template, price: update.price, b2b_price: update.b2b_price };
            }
            return template;
        });
        return { ...prevState, testTemplates: updatedTemplates };
    });
  };

  const updateRolePermissions = (role: Role, permissions: Permission[], actor: User) => {
    addAuditLog(actor.username, 'MANAGE_ROLES', `Updated permissions for role: ${role}.`);
    setState(prevState => ({
        ...prevState,
        rolePermissions: {
            ...prevState.rolePermissions,
            [role]: permissions,
        }
    }));
  }
  
  const updateClientPrices = (clientId: number, pricesToUpdate: { testTemplateId: number, price: number }[], actor: User) => {
    const client = state.clients.find(c => c.id === clientId);
    if (client) {
       addAuditLog(actor.username, 'MANAGE_B2B', `Updated custom prices for B2B client: ${client.name}.`);
    }
    setState(prevState => {
        const otherClientPrices = prevState.clientPrices.filter(p => p.clientId !== clientId);
        const newClientPrices = pricesToUpdate
            .filter(p => p.price > 0)
            .map(p => ({
                clientId: clientId,
                testTemplateId: p.testTemplateId,
                price: p.price
            }));
        return { ...prevState, clientPrices: [...otherClientPrices, ...newClientPrices] };
    });
  };

  const addClientPayment = (clientId: number, amount: number, description: string, actor: User) => {
    const client = state.clients.find(c => c.id === clientId);
    if (client) {
        addAuditLog(actor.username, 'MANAGE_B2B', `Added payment of ₹${amount} for B2B client: ${client.name}.`);
    }
    setState(prevState => {
        const newLedgerId = (prevState.ledgerEntries.length > 0 ? Math.max(...prevState.ledgerEntries.map(l => l.id)) : 0) + 1;
        const creditEntry: LedgerEntry = {
            id: newLedgerId,
            clientId: clientId,
            type: 'CREDIT',
            amount: amount,
            description: description,
            created_at: new Date().toISOString(),
        };
        const newClients = prevState.clients.map(c => 
            c.id === clientId ? { ...c, balance: c.balance - amount } : c
        );
        return { ...prevState, ledgerEntries: [...prevState.ledgerEntries, creditEntry], clients: newClients };
    });
  };
  
  const addAntibiotic = (antibioticData: Omit<Antibiotic, 'id' | 'isActive'>, actor: User) => {
    addAuditLog(actor.username, 'MANAGE_ANTIBIOTICS', `Created new antibiotic: ${antibioticData.name}.`);
    setState(prevState => {
        const newId = (prevState.antibiotics.length > 0 ? Math.max(...prevState.antibiotics.map(a => a.id)) : 0) + 1;
        const newAntibiotic: Antibiotic = { id: newId, ...antibioticData, isActive: true };
        return { ...prevState, antibiotics: [...prevState.antibiotics, newAntibiotic] };
    });
  };

  const updateAntibiotic = (antibioticData: Antibiotic, actor: User) => {
      addAuditLog(actor.username, 'MANAGE_ANTIBIOTICS', `Updated antibiotic: ${antibioticData.name}.`);
      setState(prevState => ({
          ...prevState,
          antibiotics: prevState.antibiotics.map(a => a.id === antibioticData.id ? antibioticData : a)
      }));
  };
  
  const deleteAntibiotic = (antibioticId: number, actor: User) => {
      const antibiotic = state.antibiotics.find(a => a.id === antibioticId);
      if(antibiotic) {
         addAuditLog(actor.username, 'MANAGE_ANTIBIOTICS', `Deactivated antibiotic: ${antibiotic.name}.`);
      }
      setState(prevState => ({
          ...prevState,
          antibiotics: prevState.antibiotics.map(a => a.id === antibioticId ? { ...a, isActive: false } : a)
      }));
  };

  const value = {
    ...state,
    addVisit,
    updateVisitTestStatus,
    addTestResult,
    editTestResult,
    approveTestResult,
    collectDuePayment,
    addUser,
    updateUserPermissions,
    addTestTemplate,
    updateTestTemplate,
    deleteTestTemplate,
    updateTestPrices,
    updateRolePermissions,
    updateClientPrices,
    addClientPayment,
    addAntibiotic,
    updateAntibiotic,
    deleteAntibiotic
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};