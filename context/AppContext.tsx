import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Visit, VisitTest, Patient, TestTemplate, VisitTestStatus, User, Role, UserWithPassword, Client, ClientPrice, LedgerEntry, RolePermissions, Permission, CultureResult, AuditLog, Antibiotic, Branch } from '../types';

// Define a type for user creation data to avoid exposing password hash elsewhere
type UserCreationData = Omit<User, 'id' | 'isActive' | 'permissions'> & { password_hash: string };


interface ReferralDoctor {
  id: number;
  name: string;
}

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
  referralDoctors: ReferralDoctor[];
  branches: Branch[];
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
  addClient: (clientData: { name: string; type: 'PATIENT' | 'REFERRAL_LAB' | 'INTERNAL' }, actor: User) => void;
  addReferralDoctor: (doctorData: { name: string }, actor: User) => void;
  updateClientPrices: (clientId: number, prices: { testTemplateId: number, price: number }[], actor: User) => void;
  addClientPayment: (clientId: number, amount: number, description: string, actor: User) => void;
  // Antibiotic Management
  addAntibiotic: (antibiotic: Omit<Antibiotic, 'id' | 'isActive'>, actor: User) => void;
  updateAntibiotic: (antibiotic: Antibiotic, actor: User) => void;
  deleteAntibiotic: (antibioticId: number, actor: User) => void;
  // Data loading
  reloadData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    visits: [],
    visitTests: [],
    users: [],
    testTemplates: [],
    clients: [],
    clientPrices: [],
    ledgerEntries: [],
    rolePermissions: {},
    auditLogs: [],
    antibiotics: [],
    patients: [],
    referralDoctors: [],
    branches: [],
  });

  // Load clients, referral doctors, test templates, branches, antibiotics, and visit tests from API on mount and when auth token changes
  useEffect(() => {
    const loadData = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        console.log('Auth token:', authToken ? 'Present' : 'Missing');

        if (!authToken) {
          console.log('No auth token, skipping data load');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${authToken}`,
        };

        // Load clients
        const clientsResponse = await fetch('http://localhost:5001/api/clients', { headers });
        const clients = clientsResponse.ok ? await clientsResponse.json() : [];
        console.log('Loaded clients:', clients.length);

        // Load referral doctors
        const doctorsResponse = await fetch('http://localhost:5001/api/referral-doctors', { headers });
        const referralDoctors = doctorsResponse.ok ? await doctorsResponse.json() : [];
        console.log('Loaded referral doctors:', referralDoctors.length);

        // Load test templates
        const templatesResponse = await fetch('http://localhost:5001/api/test-templates', { headers });
        const testTemplates = templatesResponse.ok ? await templatesResponse.json() : [];
        console.log('Loaded test templates:', testTemplates.length);

        // Load branches
        const branchesResponse = await fetch('http://localhost:5001/api/branches', { headers });
        const branches = branchesResponse.ok ? await branchesResponse.json() : [];
        console.log('Loaded branches:', branches.length);

        // Load antibiotics
        const antibioticsResponse = await fetch('http://localhost:5001/api/antibiotics', { headers });
        const antibiotics = antibioticsResponse.ok ? await antibioticsResponse.json() : [];
        console.log('Loaded antibiotics:', antibiotics.length);

        // Load visits
        const visitsResponse = await fetch('http://localhost:5001/api/visits', { headers });
        const visits = visitsResponse.ok ? await visitsResponse.json() : [];
        console.log('Loaded visits:', visits.length);

        // Load visit tests
        const visitTestsResponse = await fetch('http://localhost:5001/api/visit-tests', { headers });
        const visitTests = visitTestsResponse.ok ? await visitTestsResponse.json() : [];
        console.log('Loaded visit tests:', visitTests.length);

        setState(prevState => ({
          ...prevState,
          clients: clients,
          referralDoctors: referralDoctors,
          testTemplates: testTemplates,
          branches: branches,
          antibiotics: antibiotics,
          visits: visits,
          visitTests: visitTests,
        }));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    // Use a small delay to ensure localStorage is updated
    const timer = setTimeout(() => {
      loadData();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

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

  const addVisit = async (visitData: AddVisitData, actor: User) => {
    try {
      const authToken = localStorage.getItem('authToken');

      // First, create the visit in the database
      const visitResponse = await fetch('http://localhost:5001/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          patient_id: visitData.patient.id,
          referred_doctor_id: visitData.referred_doctor_id,
          ref_customer_id: visitData.ref_customer_id,
          other_ref_doctor: visitData.other_ref_doctor,
          other_ref_customer: visitData.other_ref_customer,
          registration_datetime: visitData.registration_datetime,
          total_cost: visitData.total_cost,
          amount_paid: visitData.amount_paid,
          payment_mode: visitData.payment_mode,
        }),
      });

      if (!visitResponse.ok) {
        throw new Error('Failed to create visit');
      }

      const createdVisit = await visitResponse.json();

      // If this is a B2B client, update the client balance
      if (visitData.ref_customer_id) {
        const client = state.clients.find(c => c.id === visitData.ref_customer_id);
        if (client && client.type === 'REFERRAL_LAB') {
          const newBalance = client.balance + visitData.total_cost;
          await fetch(`http://localhost:5001/api/clients/${visitData.ref_customer_id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ balance: newBalance }),
          });
        }
      }

      addAuditLog(actor.username, 'CREATE_VISIT', `Created visit for patient ${visitData.patient.name} with ${visitData.testIds.length} tests.`);

      // Update local state
      setState(prevState => {
        const newVisitId = createdVisit.id;
        const visitCode = createdVisit.visit_code;

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
    } catch (error) {
      console.error('Error creating visit:', error);
      throw error;
    }
  };
  
  const updateVisitTestStatus = async (visitTestId: number, status: VisitTestStatus, actor: User, details?: UpdateStatusDetails) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const test = state.visitTests.find(t => t.id === visitTestId);

      const updateData: any = { status };
      if (details?.collectedBy) updateData.collected_by = details.collectedBy;
      if (details?.specimen_type) updateData.specimen_type = details.specimen_type;
      if (status === 'SAMPLE_COLLECTED') updateData.collected_at = new Date().toISOString();

      const response = await fetch(`http://localhost:5001/api/visit-tests/${visitTestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        if (test) {
          addAuditLog(actor.username, 'UPDATE_TEST_STATUS', `Updated status for test ${test.template.code} (Visit: ${test.visitCode}) to ${status}.`);
        }
        setState(prevState => ({
          ...prevState,
          visitTests: prevState.visitTests.map(t =>
            t.id === visitTestId
              ? {
                  ...t,
                  status,
                  collectedBy: details?.collectedBy || t.collectedBy,
                  collectedAt: status === 'SAMPLE_COLLECTED' ? new Date().toISOString() : t.collectedAt,
                  specimen_type: details?.specimen_type || t.specimen_type,
                }
              : t
          ),
        }));
      } else {
        console.error('Error updating visit test status:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating visit test status:', error);
    }
  };
  
  const addTestResult = async (visitTestId: number, data: AddResultData, actor: User) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const test = state.visitTests.find(t => t.id === visitTestId);

      const updateData: any = {
        status: 'AWAITING_APPROVAL',
      };
      if (data.results) updateData.results = data.results;
      if (data.cultureResult) updateData.culture_result = data.cultureResult;

      const response = await fetch(`http://localhost:5001/api/visit-tests/${visitTestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        if(test) {
          addAuditLog(actor.username, 'ENTER_RESULTS', `Entered results for test ${test.template.code} (Visit: ${test.visitCode}).`);
        }
        setState(prevState => ({
          ...prevState,
          visitTests: prevState.visitTests.map(t =>
            t.id === visitTestId
              ? {
                  ...t,
                  status: 'AWAITING_APPROVAL',
                  results: data.results || t.results,
                  cultureResult: data.cultureResult || t.cultureResult
                }
              : t
          ),
        }));
      } else {
        console.error('Error adding test result:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding test result:', error);
    }
  };

   const editTestResult = async (visitTestId: number, data: AddResultData, reason: string, actor: User) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const test = state.visitTests.find(t => t.id === visitTestId);

      const updateData: any = {};
      if (data.results) updateData.results = data.results;
      if (data.cultureResult) updateData.culture_result = data.cultureResult;

      const response = await fetch(`http://localhost:5001/api/visit-tests/${visitTestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        if (test) {
          addAuditLog(actor.username, 'EDIT_APPROVED_REPORT', `Edited approved results for test ${test.template.code} (Visit: ${test.visitCode}). Reason: ${reason}`);
        }
        setState(prevState => ({
          ...prevState,
          visitTests: prevState.visitTests.map(t =>
            t.id === visitTestId
              ? {
                  ...t,
                  results: data.results || t.results,
                  cultureResult: data.cultureResult || t.cultureResult
                }
              : t
          ),
        }));
      } else {
        console.error('Error editing test result:', response.statusText);
      }
    } catch (error) {
      console.error('Error editing test result:', error);
    }
  };

  const approveTestResult = async (visitTestId: number, actor: User) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const test = state.visitTests.find(t => t.id === visitTestId);

      const updateData = {
        status: 'APPROVED',
        approved_by: actor.username,
        approved_at: new Date().toISOString(),
      };

      const response = await fetch(`http://localhost:5001/api/visit-tests/${visitTestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        if(test) {
          addAuditLog(actor.username, 'APPROVE_RESULTS', `Approved results for test ${test.template.code} (Visit: ${test.visitCode}).`);
        }
        setState(prevState => ({
            ...prevState,
            visitTests: prevState.visitTests.map(t =>
                t.id === visitTestId
                ? {
                    ...t,
                    status: 'APPROVED',
                    approvedBy: actor.username,
                    approvedAt: new Date().toISOString(),
                  }
                : t
            )
        }));
      } else {
        console.error('Error approving test result:', response.statusText);
      }
    } catch (error) {
      console.error('Error approving test result:', error);
    }
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

  const addUser = async (userData: UserCreationData, actor: User) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          username: userData.username,
          password: userData.password_hash,
          role: userData.role,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      const createdUser = await response.json();
      addAuditLog(actor.username, 'MANAGE_USERS', `Created new user: ${userData.username} with role ${userData.role}.`);

      setState(prevState => {
        const newUser: UserWithPassword = {
          id: createdUser.id,
          isActive: createdUser.is_active,
          username: createdUser.username,
          role: createdUser.role,
          password_hash: userData.password_hash,
          permissions: prevState.rolePermissions[userData.role] || []
        };
        return {
          ...prevState,
          users: [...prevState.users, newUser]
        };
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
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

  const addTestTemplate = async (templateData: Omit<TestTemplate, 'id'>, actor: User) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5001/api/test-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        const newTemplate = await response.json();
        addAuditLog(actor.username, 'MANAGE_TESTS', `Created new test template: ${templateData.name}.`);
        setState(prevState => ({
          ...prevState,
          testTemplates: [...prevState.testTemplates, newTemplate]
        }));
      } else {
        console.error('Error creating test template:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating test template:', error);
    }
  };

  const updateTestTemplate = async (templateData: TestTemplate, actor: User) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5001/api/test-templates/${templateData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        const updatedTemplate = await response.json();
        addAuditLog(actor.username, 'MANAGE_TESTS', `Updated test template: ${templateData.name}.`);
        setState(prevState => ({
          ...prevState,
          testTemplates: prevState.testTemplates.map(t => t.id === templateData.id ? updatedTemplate : t)
        }));
      } else {
        console.error('Error updating test template:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating test template:', error);
    }
  };

  const deleteTestTemplate = async (templateId: number, actor: User) => {
    try {
      const template = state.testTemplates.find(t => t.id === templateId);
      if (!template) return;

      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5001/api/test-templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        addAuditLog(actor.username, 'MANAGE_TESTS', `Deactivated test template: ${template.name}.`);
        setState(prevState => ({
          ...prevState,
          testTemplates: prevState.testTemplates.map(t => t.id === templateId ? { ...t, isActive: false } : t)
        }));
      } else {
        console.error('Error deleting test template:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting test template:', error);
    }
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

  const updateRolePermissions = async (role: Role, permissions: Permission[], actor: User) => {
    try {
      addAuditLog(actor.username, 'MANAGE_ROLES', `Updated permissions for role: ${role}.`);

      // Call backend API to save permissions
      const response = await fetch(`http://localhost:5001/api/role-permissions/${role}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ permissions }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role permissions');
      }

      // Update local state after successful API call
      setState(prevState => ({
          ...prevState,
          rolePermissions: {
              ...prevState.rolePermissions,
              [role]: permissions,
          }
      }));
    } catch (error) {
      console.error('Error updating role permissions:', error);
      throw error;
    }
  }

  const addClient = async (clientData: { name: string; type: 'PATIENT' | 'REFERRAL_LAB' | 'INTERNAL' }, actor: User) => {
    try {
      addAuditLog(actor.username, 'MANAGE_B2B', `Created new B2B client: ${clientData.name}.`);

      // Call backend API to create client
      const response = await fetch('http://localhost:5001/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        throw new Error('Failed to add client');
      }

      const newClient = await response.json();
      console.log('✅ Client created:', newClient);

      // Update local state with the new client
      setState(prevState => ({
          ...prevState,
          clients: [...prevState.clients, newClient]
      }));
    } catch (error) {
      console.error('Error adding client:', error);
      throw error;
    }
  };

  const deleteClient = async (clientId: number, actor: User) => {
    try {
      addAuditLog(actor.username, 'MANAGE_B2B', `Deleted B2B client with ID: ${clientId}.`);

      const response = await fetch(`http://localhost:5001/api/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      // Update local state
      setState(prevState => ({
          ...prevState,
          clients: prevState.clients.filter(c => c.id !== clientId)
      }));
      console.log('✅ Client deleted:', clientId);
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  };

  const settleClientBalance = async (clientId: number, actor: User) => {
    try {
      addAuditLog(actor.username, 'MANAGE_B2B', `Settled balance for client ID: ${clientId}.`);

      const response = await fetch(`http://localhost:5001/api/clients/${clientId}/settle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to settle client balance');
      }

      const result = await response.json();

      // Update local state
      setState(prevState => ({
          ...prevState,
          clients: prevState.clients.map(c =>
            c.id === clientId ? { ...c, balance: 0 } : c
          )
      }));
      console.log('✅ Client balance settled:', result);
    } catch (error) {
      console.error('Error settling client balance:', error);
      throw error;
    }
  };

  const addReferralDoctor = async (doctorData: { name: string }, actor: User) => {
    try {
      addAuditLog(actor.username, 'MANAGE_B2B', `Created new referral doctor: ${doctorData.name}.`);

      // Call backend API to create referral doctor
      const response = await fetch('http://localhost:5001/api/referral-doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(doctorData),
      });

      if (!response.ok) {
        throw new Error('Failed to add referral doctor');
      }

      const newDoctor = await response.json();
      console.log('✅ Referral doctor created:', newDoctor);

      // Update local state with the new doctor
      setState(prevState => ({
          ...prevState,
          referralDoctors: [...prevState.referralDoctors, newDoctor]
      }));
    } catch (error) {
      console.error('Error adding referral doctor:', error);
      throw error;
    }
  };

  const updateReferralDoctor = async (doctorId: number, doctorData: { name: string }, actor: User) => {
    try {
      addAuditLog(actor.username, 'MANAGE_B2B', `Updated referral doctor ID ${doctorId}: ${doctorData.name}.`);

      const response = await fetch(`http://localhost:5001/api/referral-doctors/${doctorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(doctorData),
      });

      if (!response.ok) {
        throw new Error('Failed to update referral doctor');
      }

      const updatedDoctor = await response.json();
      console.log('✅ Referral doctor updated:', updatedDoctor);

      // Update local state
      setState(prevState => ({
          ...prevState,
          referralDoctors: prevState.referralDoctors.map(d =>
            d.id === doctorId ? updatedDoctor : d
          )
      }));
    } catch (error) {
      console.error('Error updating referral doctor:', error);
      throw error;
    }
  };

  const deleteReferralDoctor = async (doctorId: number, actor: User) => {
    try {
      addAuditLog(actor.username, 'MANAGE_B2B', `Deleted referral doctor with ID: ${doctorId}.`);

      const response = await fetch(`http://localhost:5001/api/referral-doctors/${doctorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete referral doctor');
      }

      // Update local state
      setState(prevState => ({
          ...prevState,
          referralDoctors: prevState.referralDoctors.filter(d => d.id !== doctorId)
      }));
      console.log('✅ Referral doctor deleted:', doctorId);
    } catch (error) {
      console.error('Error deleting referral doctor:', error);
      throw error;
    }
  };

  const updateClientPrices = async (clientId: number, pricesToUpdate: { testTemplateId: number, price: number }[], actor: User) => {
    try {
      const client = state.clients.find(c => c.id === clientId);
      if (client) {
         addAuditLog(actor.username, 'MANAGE_B2B', `Updated custom prices for B2B client: ${client.name}.`);
      }

      // Call backend API to update client prices
      const response = await fetch(`http://localhost:5001/api/clients/${clientId}/prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ clientId, prices: pricesToUpdate }),
      });

      if (!response.ok) {
        throw new Error('Failed to update client prices');
      }

      // Update local state after successful API call
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
    } catch (error) {
      console.error('Error updating client prices:', error);
      throw error;
    }
  };

  const addClientPayment = async (clientId: number, amount: number, description: string, actor: User) => {
    try {
      const client = state.clients.find(c => c.id === clientId);
      if (client) {
          addAuditLog(actor.username, 'MANAGE_B2B', `Added payment of ₹${amount} for B2B client: ${client.name}.`);
      }

      // Call backend API to add payment
      const response = await fetch(`http://localhost:5001/api/clients/${clientId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ amount, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to add client payment');
      }

      // Update local state after successful API call
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
    } catch (error) {
      console.error('Error adding client payment:', error);
      throw error;
    }
  };
  
  const addAntibiotic = async (antibioticData: Omit<Antibiotic, 'id' | 'isActive'>, actor: User) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5001/api/antibiotics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(antibioticData),
      });

      if (response.ok) {
        const newAntibiotic = await response.json();
        addAuditLog(actor.username, 'MANAGE_ANTIBIOTICS', `Created new antibiotic: ${antibioticData.name}.`);
        setState(prevState => ({
          ...prevState,
          antibiotics: [...prevState.antibiotics, newAntibiotic]
        }));
      } else {
        console.error('Error creating antibiotic:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating antibiotic:', error);
    }
  };

  const updateAntibiotic = async (antibioticData: Antibiotic, actor: User) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5001/api/antibiotics/${antibioticData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(antibioticData),
      });

      if (response.ok) {
        const updatedAntibiotic = await response.json();
        addAuditLog(actor.username, 'MANAGE_ANTIBIOTICS', `Updated antibiotic: ${antibioticData.name}.`);
        setState(prevState => ({
          ...prevState,
          antibiotics: prevState.antibiotics.map(a => a.id === antibioticData.id ? updatedAntibiotic : a)
        }));
      } else {
        console.error('Error updating antibiotic:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating antibiotic:', error);
    }
  };

  const deleteAntibiotic = async (antibioticId: number, actor: User) => {
    try {
      const antibiotic = state.antibiotics.find(a => a.id === antibioticId);
      if (!antibiotic) return;

      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5001/api/antibiotics/${antibioticId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        addAuditLog(actor.username, 'MANAGE_ANTIBIOTICS', `Deactivated antibiotic: ${antibiotic.name}.`);
        setState(prevState => ({
          ...prevState,
          antibiotics: prevState.antibiotics.map(a => a.id === antibioticId ? { ...a, isActive: false } : a)
        }));
      } else {
        console.error('Error deleting antibiotic:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting antibiotic:', error);
    }
  };

  const addBranch = async (branchData: Omit<Branch, 'id'>, actor: User) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5001/api/branches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(branchData),
      });

      if (response.ok) {
        const newBranch = await response.json();
        addAuditLog(actor.username, 'MANAGE_BRANCHES', `Created new branch: ${branchData.name}.`);
        setState(prevState => ({
          ...prevState,
          branches: [...prevState.branches, newBranch]
        }));
      } else {
        console.error('Error creating branch:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating branch:', error);
    }
  };

  const updateBranch = async (branchData: Branch, actor: User) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5001/api/branches/${branchData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(branchData),
      });

      if (response.ok) {
        const updatedBranch = await response.json();
        addAuditLog(actor.username, 'MANAGE_BRANCHES', `Updated branch: ${branchData.name}.`);
        setState(prevState => ({
          ...prevState,
          branches: prevState.branches.map(b => b.id === branchData.id ? updatedBranch : b)
        }));
      } else {
        console.error('Error updating branch:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating branch:', error);
    }
  };

  const deleteBranch = async (branchId: number, actor: User) => {
    try {
      const branch = state.branches.find(b => b.id === branchId);
      if (!branch) return;

      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5001/api/branches/${branchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        addAuditLog(actor.username, 'MANAGE_BRANCHES', `Deactivated branch: ${branch.name}.`);
        setState(prevState => ({
          ...prevState,
          branches: prevState.branches.map(b => b.id === branchId ? { ...b, isActive: false } : b)
        }));
      } else {
        console.error('Error deleting branch:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
    }
  };

  const reloadData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.log('No auth token, skipping data reload');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${authToken}`,
      };

      // Load visits
      const visitsResponse = await fetch('http://localhost:5001/api/visits', { headers });
      const visits = visitsResponse.ok ? await visitsResponse.json() : [];
      console.log('Reloaded visits:', visits.length);

      // Load visit tests
      const visitTestsResponse = await fetch('http://localhost:5001/api/visit-tests', { headers });
      const visitTests = visitTestsResponse.ok ? await visitTestsResponse.json() : [];
      console.log('Reloaded visit tests:', visitTests.length);

      // Load users
      const usersResponse = await fetch('http://localhost:5001/api/users', { headers });
      const usersData = usersResponse.ok ? await usersResponse.json() : [];
      const users = usersData.map((user: any) => ({
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.is_active,
        password_hash: '',
        permissions: state.rolePermissions[user.role] || []
      }));
      console.log('Reloaded users:', users.length);

      // Load test templates
      const testTemplatesResponse = await fetch('http://localhost:5001/api/test-templates', { headers });
      const testTemplates = testTemplatesResponse.ok ? await testTemplatesResponse.json() : [];
      console.log('Reloaded test templates:', testTemplates.length);

      // Load clients
      const clientsResponse = await fetch('http://localhost:5001/api/clients', { headers });
      const clients = clientsResponse.ok ? await clientsResponse.json() : [];
      console.log('Reloaded clients:', clients.length);

      // Load antibiotics
      const antibioticsResponse = await fetch('http://localhost:5001/api/antibiotics', { headers });
      const antibiotics = antibioticsResponse.ok ? await antibioticsResponse.json() : [];
      console.log('Reloaded antibiotics:', antibiotics.length);

      // Load referral doctors
      const referralDoctorsResponse = await fetch('http://localhost:5001/api/referral-doctors', { headers });
      const referralDoctors = referralDoctorsResponse.ok ? await referralDoctorsResponse.json() : [];
      console.log('Reloaded referral doctors:', referralDoctors.length);

      // Load branches
      const branchesResponse = await fetch('http://localhost:5001/api/branches', { headers });
      const branches = branchesResponse.ok ? await branchesResponse.json() : [];
      console.log('Reloaded branches:', branches.length);

      setState(prevState => ({
        ...prevState,
        visits: visits,
        visitTests: visitTests,
        users: users,
        testTemplates: testTemplates,
        clients: clients,
        antibiotics: antibiotics,
        referralDoctors: referralDoctors,
        branches: branches,
      }));
    } catch (error) {
      console.error('Error reloading data:', error);
    }
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
    addClient,
    deleteClient,
    settleClientBalance,
    addReferralDoctor,
    updateReferralDoctor,
    deleteReferralDoctor,
    updateClientPrices,
    addClientPayment,
    addAntibiotic,
    updateAntibiotic,
    deleteAntibiotic,
    addBranch,
    updateBranch,
    deleteBranch,
    reloadData
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