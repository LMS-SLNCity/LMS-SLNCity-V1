-- Create tables for LMS SLNCity Diagnostic Center

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SUDO', 'ADMIN', 'RECEPTION', 'PHLEBOTOMY', 'LAB', 'APPROVER')),
    is_active BOOLEAN DEFAULT true,
    signature_image_url VARCHAR(500),
    branch_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test Templates table
CREATE TABLE test_templates (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    b2b_price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('standard', 'culture')),
    parameters JSONB DEFAULT '{"fields": []}',
    default_antibiotic_ids INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Branches table
CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Antibiotics table
CREATE TABLE antibiotics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('PATIENT', 'REFERRAL_LAB', 'INTERNAL')),
    balance DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Client Prices table
CREATE TABLE client_prices (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    test_template_id INTEGER NOT NULL REFERENCES test_templates(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, test_template_id)
);

-- Patients table
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    salutation VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    age_years INTEGER NOT NULL,
    age_months INTEGER DEFAULT 0,
    age_days INTEGER DEFAULT 0,
    sex VARCHAR(20) NOT NULL,
    guardian_name VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    email VARCHAR(255),
    clinical_history TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referral Doctors table
CREATE TABLE referral_doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Signatories table
CREATE TABLE signatories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sequence for visit code generation
CREATE SEQUENCE visit_code_seq START 1 INCREMENT 1;

-- Visits table
CREATE TABLE visits (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    referred_doctor_id INTEGER REFERENCES referral_doctors(id),
    ref_customer_id INTEGER REFERENCES clients(id),
    other_ref_doctor VARCHAR(255),
    other_ref_customer VARCHAR(255),
    registration_datetime TIMESTAMP,
    visit_code VARCHAR(50) UNIQUE NOT NULL DEFAULT '',
    total_cost DECIMAL(12, 2) NOT NULL,
    amount_paid DECIMAL(12, 2) NOT NULL,
    payment_mode VARCHAR(50),
    due_amount DECIMAL(12, 2) NOT NULL,
    branch_id INTEGER REFERENCES branches(id),
    qr_code_token VARCHAR(500),
    qr_code_generated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function to generate visit code
CREATE OR REPLACE FUNCTION generate_visit_code()
RETURNS VARCHAR AS $$
DECLARE
    v_code VARCHAR;
    v_date_part VARCHAR;
    v_seq_num INTEGER;
BEGIN
    -- Get current date in YYYYMMDD format
    v_date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');

    -- Get next sequence number
    v_seq_num := NEXTVAL('visit_code_seq');

    -- Generate code: V{YYYYMMDD}{SEQUENCE}
    v_code := 'V' || v_date_part || LPAD(v_seq_num::TEXT, 4, '0');

    RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate visit code
CREATE OR REPLACE FUNCTION set_visit_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.visit_code = '' OR NEW.visit_code IS NULL THEN
        NEW.visit_code := generate_visit_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER visit_code_trigger
BEFORE INSERT ON visits
FOR EACH ROW
EXECUTE FUNCTION set_visit_code();

-- Visit Tests table
CREATE TABLE visit_tests (
    id SERIAL PRIMARY KEY,
    visit_id INTEGER NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    test_template_id INTEGER NOT NULL REFERENCES test_templates(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'AWAITING_APPROVAL', 'APPROVED', 'COMPLETED')),
    collected_by VARCHAR(255),
    collected_at TIMESTAMP,
    specimen_type VARCHAR(100),
    results JSONB,
    culture_result JSONB,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ledger Entries table
CREATE TABLE ledger_entries (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    visit_id INTEGER REFERENCES visits(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('DEBIT', 'CREDIT')),
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- B2B Client Logins table
CREATE TABLE b2b_client_logins (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id)
);

-- Patient Report Access Logs table
CREATE TABLE patient_report_access_logs (
    id SERIAL PRIMARY KEY,
    visit_id INTEGER NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    access_method VARCHAR(50) NOT NULL CHECK (access_method IN ('QR_CODE', 'PHONE_OTP')),
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Role Permissions table
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL UNIQUE CHECK (role IN ('SUDO', 'ADMIN', 'RECEPTION', 'PHLEBOTOMY', 'LAB', 'APPROVER')),
    permissions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_visits_patient_id ON visits(patient_id);
CREATE INDEX idx_visits_visit_code ON visits(visit_code);
CREATE INDEX idx_visits_branch_id ON visits(branch_id);
CREATE INDEX idx_visits_qr_code_token ON visits(qr_code_token);
CREATE INDEX idx_visit_tests_visit_id ON visit_tests(visit_id);
CREATE INDEX idx_visit_tests_status ON visit_tests(status);
CREATE INDEX idx_client_prices_client_id ON client_prices(client_id);
CREATE INDEX idx_ledger_entries_client_id ON ledger_entries(client_id);
CREATE INDEX idx_b2b_client_logins_client_id ON b2b_client_logins(client_id);
CREATE INDEX idx_patient_report_access_logs_visit_id ON patient_report_access_logs(visit_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

