export type Salutation = 'Mr' | 'Ms' | 'Mrs' | 'Master' | 'Baby' | 'Baby of';
export type Sex = 'Male' | 'Female' | 'Other' | '';

export interface Patient {
  id?: number; // Unique patient ID for searching
  salutation: Salutation;
  name: string;
  age_years: number;
  age_months: number;
  age_days: number;
  sex: Sex;
  guardian_name?: string;
  phone: string;
  address: string;
  email?: string;
  clinical_history?: string;
}

export interface Client {
    id: number;
    name: string;
    type: 'PATIENT' | 'REFERRAL_LAB' | 'INTERNAL';
    balance: number;
}

export interface TestTemplateParameter {
    name: string;
    type: 'number' | 'text';
    unit?: string;
    reference_range?: string;
}

export interface TestTemplate {
  id: number;
  code: string;
  name: string;
  category: string;
  price: number;
  b2b_price: number;
  isActive: boolean;
  parameters: {
    fields: TestTemplateParameter[];
  };
  reportType: 'standard' | 'culture';
  defaultAntibioticIds?: number[];
}

export type VisitTestStatus = 'PENDING' | 'SAMPLE_COLLECTED' | 'IN_PROGRESS' | 'AWAITING_APPROVAL' | 'APPROVED' | 'COMPLETED';

// --- NEW TYPES FOR CULTURE REPORT ---
export interface Antibiotic {
  id: number;
  name: string;
  abbreviation: string;
  isActive: boolean;
}

export interface SensitivityResult {
  antibioticId: number;
  sensitivity: 'S' | 'R' | 'I'; // Sensitive, Resistant, Intermediate
}

export interface CultureResult {
  growthStatus: 'growth' | 'no_growth';
  organismIsolated?: string;
  colonyCount?: string;
  sensitivity?: SensitivityResult[];
  remarks?: string;
}
// --- END NEW TYPES ---


export interface VisitTest {
  id: number; // Unique ID for this specific test instance in a visit
  visitId: number;
  patientName: string; // Denormalized for easier display
  visitCode: string; // Denormalized for easier display
  template: TestTemplate;
  status: VisitTestStatus;
  collectedBy?: string;
  collectedAt?: string; // ISO String
  specimen_type?: string;
  results?: Record<string, string | number>;
  cultureResult?: CultureResult; // New field for structured culture results
  approvedBy?: string;
  approvedAt?: string; // ISO String
}


export interface Visit {
  id: number;
  patient: Patient;
  referred_doctor_id?: number;
  ref_customer_id?: number;
  other_ref_doctor?: string;
  other_ref_customer?: string;
  registration_datetime?: string; // YYYY-MM-DD HH:MM
  visit_code: string;
  created_at: string; // ISO String
  total_cost: number;
  amount_paid: number;
  payment_mode?: 'Cash' | 'Card' | 'UPI' | '';
  due_amount: number;
  tests: number[]; // Array of VisitTest IDs
}

export interface Signatory {
  id: number;
  name: string;
  title: string;
}

export interface ClientPrice {
    clientId: number;
    testTemplateId: number;
    price: number;
}

export interface LedgerEntry {
    id: number;
    clientId: number;
    visitId?: number;
    type: 'DEBIT' | 'CREDIT';
    amount: number;
    description: string;
    created_at: string; // ISO String
}

export interface AuditLog {
    id: number;
    timestamp: string; // ISO String
    username: string;
    action: string;
    details: string;
}


export type Role = 'SUDO' | 'ADMIN' | 'RECEPTION' | 'PHLEBOTOMY' | 'LAB' | 'APPROVER';

export type Permission = 
    | 'VIEW_RECEPTION'
    | 'CREATE_VISIT'
    | 'COLLECT_DUE_PAYMENT'
    | 'VIEW_PHLEBOTOMY'
    | 'COLLECT_SAMPLE'
    | 'VIEW_LAB'
    | 'ENTER_RESULTS'
    | 'VIEW_APPROVER'
    | 'APPROVE_RESULTS'
    | 'VIEW_ADMIN_PANEL'
    | 'MANAGE_USERS'        // SUDO Only
    | 'MANAGE_ROLES'        // SUDO Only
    | 'MANAGE_TESTS'
    | 'MANAGE_PRICES'
    | 'MANAGE_B2B'
    | 'MANAGE_ANTIBIOTICS'  // ADMIN/SUDO
    | 'EDIT_APPROVED_REPORT' // SUDO Only
    | 'VIEW_AUDIT_LOG';      // SUDO Only

export type RolePermissions = Record<Role, Permission[]>;

export interface User {
  id: number;
  username: string;
  role: Role;
  isActive: boolean;
  permissions: Permission[];
}

export type UserWithPassword = User & { password_hash: string };