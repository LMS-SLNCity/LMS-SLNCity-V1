import type { TestTemplate, Client, Patient, Signatory, UserWithPassword, ClientPrice, LedgerEntry, RolePermissions, User, Antibiotic, AuditLog } from '../types';

export const mockRolePermissions: RolePermissions = {
    SUDO: [
        'VIEW_RECEPTION', 'CREATE_VISIT', 'COLLECT_DUE_PAYMENT',
        'VIEW_PHLEBOTOMY', 'COLLECT_SAMPLE',
        'VIEW_LAB', 'ENTER_RESULTS',
        'VIEW_APPROVER', 'APPROVE_RESULTS',
        'VIEW_ADMIN_PANEL', 'MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_TESTS', 'MANAGE_PRICES', 'MANAGE_B2B', 'MANAGE_ANTIBIOTICS',
        'EDIT_APPROVED_REPORT', 'VIEW_AUDIT_LOG'
    ],
    ADMIN: [
        'VIEW_RECEPTION', 'CREATE_VISIT', 'COLLECT_DUE_PAYMENT',
        'VIEW_PHLEBOTOMY', 'COLLECT_SAMPLE',
        'VIEW_LAB', 'ENTER_RESULTS',
        'VIEW_APPROVER', 'APPROVE_RESULTS',
        'VIEW_ADMIN_PANEL', 'MANAGE_TESTS', 'MANAGE_PRICES', 'MANAGE_B2B', 'MANAGE_ANTIBIOTICS'
    ],
    RECEPTION: ['VIEW_RECEPTION', 'CREATE_VISIT', 'COLLECT_DUE_PAYMENT'],
    PHLEBOTOMY: ['VIEW_PHLEBOTOMY', 'COLLECT_SAMPLE'],
    LAB: ['VIEW_LAB', 'ENTER_RESULTS'],
    APPROVER: ['VIEW_APPROVER', 'APPROVE_RESULTS'],
};

export const mockUsers: UserWithPassword[] = [
  { id: 1, username: 'sudo', role: 'SUDO', password_hash: 'sudo', isActive: true, permissions: mockRolePermissions.SUDO },
  { id: 2, username: 'admin', role: 'ADMIN', password_hash: 'admin', isActive: true, permissions: mockRolePermissions.ADMIN },
  { id: 3, username: 'reception', role: 'RECEPTION', password_hash: 'reception', isActive: true, permissions: mockRolePermissions.RECEPTION },
  { id: 4, username: 'phlebo', role: 'PHLEBOTOMY', password_hash: 'phlebo', isActive: true, permissions: mockRolePermissions.PHLEBOTOMY },
  { id: 5, username: 'labtech', role: 'LAB', password_hash: 'labtech', isActive: true, permissions: mockRolePermissions.LAB },
  { id: 6, username: 'approver', role: 'APPROVER', password_hash: 'approver', isActive: true, permissions: mockRolePermissions.APPROVER },
];

export const mockAuditLogs: AuditLog[] = [];

export const mockTestTemplates: TestTemplate[] = [
  { id: 1, code: 'CBC', name: 'Complete Blood Count', category: 'Hematology', price: 350, b2b_price: 300, isActive: true, reportType: 'standard', parameters: { fields: [
    { name: 'Hemoglobin', type: 'number', unit: 'g/dL', reference_range: '13-17' },
    { name: 'WBC', type: 'number', unit: 'cells/mcL', reference_range: '4,500-11,000' },
    { name: 'Platelets', type: 'number', unit: 'cells/mcL', reference_range: '150,000-450,000' },
  ]}},
  { id: 2, code: 'LFT', name: 'Liver Function Test', category: 'Biochemistry', price: 600, b2b_price: 550, isActive: true, reportType: 'standard', parameters: { fields: [
    { name: 'Bilirubin', type: 'number', unit: 'mg/dL', reference_range: '0.1-1.2' },
    { name: 'ALT', type: 'number', unit: 'U/L', reference_range: '7-56' },
  ]}},
  { id: 3, code: 'KFT', name: 'Kidney Function Test', category: 'Biochemistry', price: 550, b2b_price: 500, isActive: true, reportType: 'standard', parameters: { fields: [
    { name: 'Urea', type: 'number', unit: 'mg/dL', reference_range: '17-43' },
    { name: 'Creatinine', type: 'number', unit: 'mg/dL', reference_range: '0.6-1.2' },
  ]}},
  { id: 4, code: 'LIPID', name: 'Lipid Profile', category: 'Biochemistry', price: 700, b2b_price: 650, isActive: true, reportType: 'standard', parameters: { fields: [] }},
  { id: 5, code: 'THYROID', name: 'Thyroid Profile (T3, T4, TSH)', category: 'Hormones', price: 800, b2b_price: 720, isActive: true, reportType: 'standard', parameters: { fields: [
    { name: 'T3', type: 'number', unit: 'ng/dL', reference_range: '80-220' },
    { name: 'T4', type: 'number', unit: 'mcg/dL', reference_range: '4.5-12.5' },
    { name: 'TSH', type: 'number', unit: 'mIU/L', reference_range: '0.4-4.0' },
  ]}},
  { id: 6, code: 'URINE-RE', name: 'Urine Routine Examination', category: 'Clinical Pathology', price: 200, b2b_price: 180, isActive: true, reportType: 'standard', parameters: { fields: [
    { name: 'Color', type: 'text' },
    { name: 'Appearance', type: 'text' },
  ]}},
  { id: 7, code: 'HBA1C', name: 'Glycated Hemoglobin (HbA1c)', category: 'Biochemistry', price: 450, b2b_price: 400, isActive: true, reportType: 'standard', parameters: { fields: [] }},
  { id: 8, code: 'VITD', name: 'Vitamin D (25-OH)', category: 'Vitamins', price: 1200, b2b_price: 1100, isActive: true, reportType: 'standard', parameters: { fields: [] }},
  { id: 9, code: 'VITB12', name: 'Vitamin B12', category: 'Vitamins', price: 1000, b2b_price: 900, isActive: true, reportType: 'standard', parameters: { fields: [] }},
  { id: 10, code: 'CULTURE-U', name: 'Urine Culture & Sensitivity', category: 'Microbiology', price: 900, b2b_price: 850, isActive: true, reportType: 'culture', parameters: { fields: [] }, defaultAntibioticIds: [1, 6, 11, 14] },
];

export const mockAntibiotics: Antibiotic[] = [
    { id: 1, name: 'Amikacin', abbreviation: 'AK', isActive: true },
    { id: 2, name: 'Amoxicillin', abbreviation: 'AMX', isActive: true },
    { id: 3, name: 'Azithromycin', abbreviation: 'AZM', isActive: true },
    { id: 4, name: 'Cefepime', abbreviation: 'CPM', isActive: true },
    { id: 5, name: 'Ceftriaxone', abbreviation: 'CTR', isActive: true },
    { id: 6, name: 'Ciprofloxacin', abbreviation: 'CIP', isActive: true },
    { id: 7, name: 'Clindamycin', abbreviation: 'CD', isActive: true },
    { id: 8, name: 'Doxycycline', abbreviation: 'DO', isActive: true },
    { id: 9, name: 'Gentamicin', abbreviation: 'GEN', isActive: true },
    { id: 10, name: 'Imipenem', abbreviation: 'IPM', isActive: true },
    { id: 11, name: 'Levofloxacin', abbreviation: 'LEV', isActive: true },
    { id: 12, name: 'Linezolid', abbreviation: 'LZ', isActive: true },
    { id: 13, name: 'Meropenem', abbreviation: 'MRP', isActive: true },
    { id: 14, name: 'Nitrofurantoin', abbreviation: 'NIT', isActive: true },
    { id: 15, name: 'Penicillin', abbreviation: 'P', isActive: true },
    { id: 16, name: 'Piperacillin-Tazobactam', abbreviation: 'PIT', isActive: true },
    { id: 17, name: 'Tetracycline', abbreviation: 'TE', isActive: true },
    { id: 18, name: 'Vancomycin', abbreviation: 'VA', isActive: true },
];

export const mockReferralDoctors = [
    { id: 1, name: 'Dr. John Doe' },
    { id: 2, name: 'Dr. Jane Smith' },
    { id: 3, name: 'Dr. Emily Brown' },
    { id: 4, name: 'Dr. Michael Johnson' },
];

export const mockClients: Client[] = [
    { id: 1, name: 'CDCMARKAPUR', type: 'REFERRAL_LAB', balance: 0 },
    { id: 2, name: 'General Hospital', type: 'REFERRAL_LAB', balance: 0 },
    { id: 3, name: 'City Clinic', type: 'REFERRAL_LAB', balance: 0 },
    { id: 4, name: 'Walk-in Patient', type: 'PATIENT', balance: 0 },
];

export const mockPatients: Patient[] = [
    { 
        id: 1,
        salutation: 'Mr',
        name: 'John Smith',
        age_years: 45,
        age_months: 0,
        age_days: 0,
        sex: 'Male',
        phone: '9876543210',
        address: '123 Main St, Anytown',
        email: 'john.smith@example.com',
        clinical_history: 'Hypertension'
    },
    {
        id: 2,
        salutation: 'Ms',
        name: 'Maria Garcia',
        age_years: 32,
        age_months: 0,
        age_days: 0,
        sex: 'Female',
        phone: '1234567890',
        address: '456 Oak Ave, Anytown',
        email: 'maria.garcia@example.com',
        clinical_history: 'None'
    }
];

export const mockSignatories: Signatory[] = [
    { id: 1, name: 'DR MISBHA LATEEFA, MD', title: 'Consultant Pathologist' },
    { id: 2, name: 'DR ASHA KIRAN, MBBS, MD', title: 'Consultant Pathologist' },
    { id: 3, name: 'T.V. SUBBARAO', title: 'M.Sc., Bio-Chemist' },
    { id: 4, name: 'K. SRINIVAS', title: 'M.Sc., Micro-Biologist' },
];

export const mockClientPrices: ClientPrice[] = [
    // Example: CDCMARKAPUR gets a special price for CBC
    { clientId: 1, testTemplateId: 1, price: 280 },
];

export const mockLedgerEntries: LedgerEntry[] = [];