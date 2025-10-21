#!/usr/bin/env python3
import subprocess
import json
import time

# Wait for PostgreSQL to be ready
print("Waiting for PostgreSQL to be ready...")
time.sleep(3)

# Seed data using docker exec
seed_sql = """
-- Create user and database if they don't exist
CREATE USER IF NOT EXISTS lms_user WITH ENCRYPTED PASSWORD 'lms_password';
CREATE DATABASE IF NOT EXISTS lms_slncity OWNER lms_user;
GRANT ALL PRIVILEGES ON DATABASE lms_slncity TO lms_user;
ALTER USER lms_user CREATEDB;

-- Connect to the database and seed data
\\c lms_slncity lms_user

-- Seed Users
INSERT INTO users (username, password_hash, role, is_active) VALUES
('sudo', '$2b$10$YourHashedPasswordHere', 'SUDO', true),
('admin', '$2b$10$YourHashedPasswordHere', 'ADMIN', true),
('reception', '$2b$10$YourHashedPasswordHere', 'RECEPTION', true),
('phlebo', '$2b$10$YourHashedPasswordHere', 'PHLEBOTOMY', true),
('labtech', '$2b$10$YourHashedPasswordHere', 'LAB', true),
('approver', '$2b$10$YourHashedPasswordHere', 'APPROVER', true)
ON CONFLICT (username) DO NOTHING;

-- Seed Antibiotics
INSERT INTO antibiotics (name, abbreviation, is_active) VALUES
('Amikacin', 'AK', true),
('Amoxicillin', 'AMX', true),
('Azithromycin', 'AZM', true),
('Cefepime', 'CPM', true),
('Ceftriaxone', 'CTR', true),
('Ciprofloxacin', 'CIP', true),
('Clindamycin', 'CD', true),
('Doxycycline', 'DO', true),
('Gentamicin', 'GEN', true),
('Imipenem', 'IPM', true),
('Levofloxacin', 'LEV', true),
('Linezolid', 'LZ', true),
('Meropenem', 'MRP', true),
('Nitrofurantoin', 'NIT', true),
('Penicillin', 'P', true),
('Piperacillin-Tazobactam', 'PIT', true),
('Tetracycline', 'TE', true),
('Vancomycin', 'VA', true)
ON CONFLICT DO NOTHING;

-- Seed Test Templates
INSERT INTO test_templates (code, name, category, price, b2b_price, report_type, parameters, default_antibiotic_ids, is_active) VALUES
('CBC', 'Complete Blood Count', 'Hematology', 350, 300, 'standard', '{\"fields\": [{\"name\": \"Hemoglobin\", \"type\": \"number\", \"unit\": \"g/dL\", \"reference_range\": \"13-17\"}, {\"name\": \"WBC\", \"type\": \"number\", \"unit\": \"cells/mcL\", \"reference_range\": \"4,500-11,000\"}, {\"name\": \"Platelets\", \"type\": \"number\", \"unit\": \"cells/mcL\", \"reference_range\": \"150,000-450,000\"}]}', ARRAY[]::INTEGER[], true),
('LFT', 'Liver Function Test', 'Biochemistry', 600, 550, 'standard', '{\"fields\": [{\"name\": \"Bilirubin\", \"type\": \"number\", \"unit\": \"mg/dL\", \"reference_range\": \"0.1-1.2\"}, {\"name\": \"ALT\", \"type\": \"number\", \"unit\": \"U/L\", \"reference_range\": \"7-56\"}]}', ARRAY[]::INTEGER[], true),
('KFT', 'Kidney Function Test', 'Biochemistry', 550, 500, 'standard', '{\"fields\": [{\"name\": \"Urea\", \"type\": \"number\", \"unit\": \"mg/dL\", \"reference_range\": \"17-43\"}, {\"name\": \"Creatinine\", \"type\": \"number\", \"unit\": \"mg/dL\", \"reference_range\": \"0.6-1.2\"}]}', ARRAY[]::INTEGER[], true),
('LIPID', 'Lipid Profile', 'Biochemistry', 700, 650, 'standard', '{\"fields\": []}', ARRAY[]::INTEGER[], true),
('THYROID', 'Thyroid Profile (T3, T4, TSH)', 'Hormones', 800, 720, 'standard', '{\"fields\": [{\"name\": \"T3\", \"type\": \"number\", \"unit\": \"ng/dL\", \"reference_range\": \"80-220\"}, {\"name\": \"T4\", \"type\": \"number\", \"unit\": \"mcg/dL\", \"reference_range\": \"4.5-12.5\"}, {\"name\": \"TSH\", \"type\": \"number\", \"unit\": \"mIU/L\", \"reference_range\": \"0.4-4.0\"}]}', ARRAY[]::INTEGER[], true),
('URINE-RE', 'Urine Routine Examination', 'Clinical Pathology', 200, 180, 'standard', '{\"fields\": [{\"name\": \"Color\", \"type\": \"text\"}, {\"name\": \"Appearance\", \"type\": \"text\"}]}', ARRAY[]::INTEGER[], true),
('HBA1C', 'Glycated Hemoglobin (HbA1c)', 'Biochemistry', 450, 400, 'standard', '{\"fields\": []}', ARRAY[]::INTEGER[], true),
('VITD', 'Vitamin D (25-OH)', 'Vitamins', 1200, 1100, 'standard', '{\"fields\": []}', ARRAY[]::INTEGER[], true),
('VITB12', 'Vitamin B12', 'Vitamins', 1000, 900, 'standard', '{\"fields\": []}', ARRAY[]::INTEGER[], true),
('CULTURE-U', 'Urine Culture & Sensitivity', 'Microbiology', 900, 850, 'culture', '{\"fields\": []}', ARRAY[1, 6, 11, 14]::INTEGER[], true)
ON CONFLICT (code) DO NOTHING;

-- Seed Referral Doctors
INSERT INTO referral_doctors (name) VALUES
('Dr. John Doe'),
('Dr. Jane Smith'),
('Dr. Emily Brown'),
('Dr. Michael Johnson')
ON CONFLICT DO NOTHING;

-- Seed Clients
INSERT INTO clients (name, type, balance) VALUES
('CDCMARKAPUR', 'REFERRAL_LAB', 0),
('General Hospital', 'REFERRAL_LAB', 0),
('City Clinic', 'REFERRAL_LAB', 0),
('Walk-in Patient', 'PATIENT', 0)
ON CONFLICT DO NOTHING;

-- Seed Signatories
INSERT INTO signatories (name, title) VALUES
('DR MISBHA LATEEFA, MD', 'Consultant Pathologist'),
('DR ASHA KIRAN, MBBS, MD', 'Consultant Pathologist'),
('T.V. SUBBARAO', 'M.Sc., Bio-Chemist'),
('K. SRINIVAS', 'M.Sc., Micro-Biologist')
ON CONFLICT DO NOTHING;

-- Seed Patients
INSERT INTO patients (salutation, name, age_years, age_months, age_days, sex, phone, address, email, clinical_history) VALUES
('Mr', 'John Smith', 45, 0, 0, 'Male', '9876543210', '123 Main St, Anytown', 'john.smith@example.com', 'Hypertension'),
('Ms', 'Maria Garcia', 32, 0, 0, 'Female', '1234567890', '456 Oak Ave, Anytown', 'maria.garcia@example.com', 'None')
ON CONFLICT DO NOTHING;
"""

# Write SQL to a temporary file and execute it
with open('/tmp/seed.sql', 'w') as f:
    f.write(seed_sql)

# Execute the SQL file in the container
cmd = ['docker', 'exec', '-i', 'lms-slncity-postgres', 'psql', '-U', 'postgres', '-d', 'postgres', '-f', '/tmp/seed.sql']
result = subprocess.run(cmd, capture_output=True, text=True)

if result.returncode == 0:
    print("✅ Database seeded successfully!")
else:
    print(f"❌ Error seeding database: {result.stderr}")
    exit(1)

