-- Comprehensive seed data for all tables

-- Clear existing data (in reverse order of dependencies)
DELETE FROM audit_logs;
DELETE FROM ledger_entries;
DELETE FROM visit_tests;
DELETE FROM visits;
DELETE FROM client_prices;
DELETE FROM patients;
DELETE FROM referral_doctors;
DELETE FROM signatories;
DELETE FROM clients;
DELETE FROM antibiotics;
DELETE FROM test_templates;
DELETE FROM users;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE test_templates_id_seq RESTART WITH 1;
ALTER SEQUENCE antibiotics_id_seq RESTART WITH 1;
ALTER SEQUENCE clients_id_seq RESTART WITH 1;
ALTER SEQUENCE client_prices_id_seq RESTART WITH 1;
ALTER SEQUENCE patients_id_seq RESTART WITH 1;
ALTER SEQUENCE referral_doctors_id_seq RESTART WITH 1;
ALTER SEQUENCE signatories_id_seq RESTART WITH 1;
ALTER SEQUENCE visits_id_seq RESTART WITH 1;
ALTER SEQUENCE visit_tests_id_seq RESTART WITH 1;
ALTER SEQUENCE ledger_entries_id_seq RESTART WITH 1;
ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1;

-- Insert Users
INSERT INTO users (username, password_hash, role, is_active) VALUES
('sudo', '$2a$10$oSEV8ODFQCz35c7OiLvwkOz8L0NULCsVbqKjpGmcMAvc2ebnabG7i', 'SUDO', true),
('admin', '$2a$10$mU8N2yb9sdzgVwz9mlV8EuLE442gE1HDfWbfDXj9iZxx7ef4bLXz2', 'ADMIN', true),
('reception', '$2a$10$MHXalBbTRJtoFl5zCkNpAeFbdwibMpdu5l0ks6MgMl3D9j3mIllAi', 'RECEPTION', true),
('phlebo', '$2a$10$3YFVmtnRZrq0vdA0MMkggezyYvLdH9Q1uX22U3dOTpuaudhcFvke.', 'PHLEBOTOMY', true),
('labtech', '$2a$10$zuxMB35YXHngnd817dlQNu6BPpOOhWBhHcAnKwcoH0fMeAlrUS0j2', 'LAB', true),
('approver', '$2a$10$Bn7b0iHbbU98UJPU0e0WK.DA7a/8OlSXPHVp/SeGNrkaIJRLnDHUu', 'APPROVER', true);

-- Insert Test Templates
INSERT INTO test_templates (code, name, category, price, b2b_price, report_type, parameters) VALUES
('CBC', 'Complete Blood Count', 'Hematology', 300.00, 250.00, 'standard', '{"fields": [{"name": "Hemoglobin", "type": "number", "unit": "g/dL", "reference_range": "13-17"}, {"name": "WBC", "type": "number", "unit": "cells/mcL", "reference_range": "4,500-11,000"}, {"name": "Platelets", "type": "number", "unit": "cells/mcL", "reference_range": "150,000-450,000"}, {"name": "RBC", "type": "number", "unit": "million/mcL", "reference_range": "4.5-5.5"}]}'),
('LFT', 'Liver Function Test', 'Biochemistry', 500.00, 400.00, 'standard', '{"fields": [{"name": "Bilirubin", "type": "number", "unit": "mg/dL", "reference_range": "0.1-1.2"}, {"name": "ALT", "type": "number", "unit": "U/L", "reference_range": "7-56"}, {"name": "AST", "type": "number", "unit": "U/L", "reference_range": "10-40"}, {"name": "Albumin", "type": "number", "unit": "g/dL", "reference_range": "3.5-5.0"}]}'),
('RFT', 'Renal Function Test', 'Biochemistry', 400.00, 350.00, 'standard', '{"fields": [{"name": "Creatinine", "type": "number", "unit": "mg/dL", "reference_range": "0.7-1.3"}, {"name": "BUN", "type": "number", "unit": "mg/dL", "reference_range": "7-20"}, {"name": "Uric Acid", "type": "number", "unit": "mg/dL", "reference_range": "3.5-7.2"}]}'),
('TSH', 'Thyroid Stimulating Hormone', 'Endocrinology', 350.00, 300.00, 'standard', '{"fields": [{"name": "TSH", "type": "number", "unit": "mIU/L", "reference_range": "0.4-4.0"}, {"name": "T3", "type": "number", "unit": "pg/mL", "reference_range": "80-200"}, {"name": "T4", "type": "number", "unit": "ng/dL", "reference_range": "4.5-12"}]}'),
('BLOOD_CULTURE', 'Blood Culture', 'Microbiology', 600.00, 500.00, 'culture', '{"fields": []}'),
('URINE_CULTURE', 'Urine Culture', 'Microbiology', 400.00, 350.00, 'culture', '{"fields": []}'),
('GLUCOSE', 'Fasting Blood Glucose', 'Biochemistry', 150.00, 120.00, 'standard', '{"fields": [{"name": "Glucose", "type": "number", "unit": "mg/dL", "reference_range": "70-100"}]}'),
('LIPID_PROFILE', 'Lipid Profile', 'Biochemistry', 450.00, 380.00, 'standard', '{"fields": [{"name": "Cholesterol", "type": "number", "unit": "mg/dL", "reference_range": "<200"}, {"name": "Triglycerides", "type": "number", "unit": "mg/dL", "reference_range": "<150"}, {"name": "HDL", "type": "number", "unit": "mg/dL", "reference_range": ">40"}, {"name": "LDL", "type": "number", "unit": "mg/dL", "reference_range": "<100"}]}'),
('COVID_RT_PCR', 'COVID-19 RT-PCR', 'Virology', 800.00, 700.00, 'standard', '{"fields": [{"name": "Result", "type": "text", "reference_range": "Positive/Negative"}]}'),
('WIDAL', 'Widal Test', 'Serology', 250.00, 200.00, 'standard', '{"fields": [{"name": "Typhoid O", "type": "text", "reference_range": "Positive/Negative"}, {"name": "Typhoid H", "type": "text", "reference_range": "Positive/Negative"}, {"name": "Paratyphoid", "type": "text", "reference_range": "Positive/Negative"}]}');

-- Insert Antibiotics
INSERT INTO antibiotics (name, abbreviation, is_active) VALUES
('Amoxicillin', 'AMX', true),
('Ciprofloxacin', 'CIP', true),
('Ceftriaxone', 'CTR', true),
('Gentamicin', 'GEN', true),
('Vancomycin', 'VAN', true),
('Azithromycin', 'AZI', true),
('Metronidazole', 'MET', true),
('Fluconazole', 'FLU', true),
('Doxycycline', 'DOX', true),
('Trimethoprim-Sulfamethoxazole', 'TMP-SMX', true);

-- Insert Clients
INSERT INTO clients (name, type, balance) VALUES
('Direct Patients', 'PATIENT', 0.00),
('Apollo Diagnostics', 'REFERRAL_LAB', 5000.00),
('Max Healthcare', 'REFERRAL_LAB', 3500.00),
('Internal Lab', 'INTERNAL', 0.00);

-- Insert Client Prices
INSERT INTO client_prices (client_id, test_template_id, price) VALUES
(2, 1, 280.00), (2, 2, 450.00), (2, 3, 380.00),
(3, 1, 290.00), (3, 2, 460.00), (3, 3, 390.00);

-- Insert Referral Doctors
INSERT INTO referral_doctors (name) VALUES
('Dr. Rajesh Kumar'),
('Dr. Priya Sharma'),
('Dr. Amit Patel'),
('Dr. Neha Singh');

-- Insert Signatories
INSERT INTO signatories (name, title) VALUES
('Dr. Vikram Desai', 'Chief Pathologist'),
('Dr. Anjali Verma', 'Senior Technologist'),
('Dr. Suresh Iyer', 'Lab Director'),
('Dr. Meera Gupta', 'Quality Assurance Head');

-- Insert Patients (30 patients)
INSERT INTO patients (salutation, name, age_years, age_months, age_days, sex, guardian_name, phone, address, email, clinical_history) VALUES
('Mr', 'John Smith', 45, 0, 0, 'Male', NULL, '9876543210', '123 Main St, Anytown', 'john@example.com', 'Hypertension'),
('Mrs', 'Maria Garcia', 32, 0, 0, 'Female', NULL, '9876543211', '456 Oak Ave, Somewhere', 'maria@example.com', 'Healthy'),
('Mr', 'Rajesh Kumar', 52, 0, 0, 'Male', NULL, '9876543212', '789 Pine Rd, Elsewhere', 'rajesh@example.com', 'Diabetes'),
('Ms', 'Priya Sharma', 28, 0, 0, 'Female', NULL, '9876543213', '321 Elm St, Nowhere', 'priya@example.com', 'Asthma'),
('Mr', 'Amit Patel', 38, 0, 0, 'Male', NULL, '9876543214', '654 Maple Dr, Somewhere', 'amit@example.com', 'Healthy'),
('Mrs', 'Neha Singh', 41, 0, 0, 'Female', NULL, '9876543215', '987 Cedar Ln, Anytown', 'neha@example.com', 'Thyroid'),
('Mr', 'Vikram Desai', 55, 0, 0, 'Male', NULL, '9876543216', '147 Birch St, Elsewhere', 'vikram@example.com', 'Hypertension, Diabetes'),
('Mrs', 'Anjali Verma', 35, 0, 0, 'Female', NULL, '9876543217', '258 Spruce Ave, Nowhere', 'anjali@example.com', 'Healthy'),
('Mr', 'Suresh Iyer', 48, 0, 0, 'Male', NULL, '9876543218', '369 Ash Rd, Somewhere', 'suresh@example.com', 'Cholesterol'),
('Ms', 'Meera Gupta', 30, 0, 0, 'Female', NULL, '9876543219', '741 Willow Dr, Anytown', 'meera@example.com', 'Healthy'),
('Mr', 'Arjun Nair', 42, 0, 0, 'Male', NULL, '9876543220', '852 Poplar Ln, Elsewhere', 'arjun@example.com', 'Migraine'),
('Mrs', 'Divya Reddy', 36, 0, 0, 'Female', NULL, '9876543221', '963 Chestnut St, Nowhere', 'divya@example.com', 'Healthy'),
('Mr', 'Karthik Rao', 50, 0, 0, 'Male', NULL, '9876543222', '159 Fir Ave, Somewhere', 'karthik@example.com', 'Arthritis'),
('Mrs', 'Sneha Kulkarni', 33, 0, 0, 'Female', NULL, '9876543223', '357 Hemlock Rd, Anytown', 'sneha@example.com', 'Healthy'),
('Mr', 'Rohan Joshi', 46, 0, 0, 'Male', NULL, '9876543224', '456 Juniper Dr, Elsewhere', 'rohan@example.com', 'Hypertension'),
('Mrs', 'Pooja Mishra', 29, 0, 0, 'Female', NULL, '9876543225', '789 Larch Ln, Nowhere', 'pooja@example.com', 'Healthy'),
('Mr', 'Nikhil Saxena', 44, 0, 0, 'Male', NULL, '9876543226', '321 Magnolia St, Somewhere', 'nikhil@example.com', 'Diabetes'),
('Mrs', 'Isha Kapoor', 37, 0, 0, 'Female', NULL, '9876543227', '654 Nutmeg Ave, Anytown', 'isha@example.com', 'Healthy'),
('Mr', 'Varun Chopra', 51, 0, 0, 'Male', NULL, '9876543228', '987 Oak Ridge Rd, Elsewhere', 'varun@example.com', 'Hypertension, Cholesterol'),
('Mrs', 'Ritika Bhat', 31, 0, 0, 'Female', NULL, '9876543229', '147 Pecan Dr, Nowhere', 'ritika@example.com', 'Healthy'),
('Mr', 'Sanjay Menon', 49, 0, 0, 'Male', NULL, '9876543230', '258 Quince Ln, Somewhere', 'sanjay@example.com', 'Asthma'),
('Mrs', 'Kavya Nambiar', 34, 0, 0, 'Female', NULL, '9876543231', '369 Rosewood St, Anytown', 'kavya@example.com', 'Healthy'),
('Mr', 'Aditya Sinha', 47, 0, 0, 'Male', NULL, '9876543232', '741 Sandalwood Ave, Elsewhere', 'aditya@example.com', 'Thyroid'),
('Mrs', 'Nisha Bose', 40, 0, 0, 'Female', NULL, '9876543233', '852 Teak Rd, Nowhere', 'nisha@example.com', 'Healthy'),
('Mr', 'Harsh Verma', 43, 0, 0, 'Male', NULL, '9876543234', '963 Walnut Dr, Somewhere', 'harsh@example.com', 'Hypertension'),
('Mrs', 'Simran Kaur', 26, 0, 0, 'Female', NULL, '9876543235', '159 Yew Ln, Anytown', 'simran@example.com', 'Healthy'),
('Mr', 'Deepak Yadav', 53, 0, 0, 'Male', NULL, '9876543236', '357 Zircote St, Elsewhere', 'deepak@example.com', 'Diabetes, Hypertension'),
('Mrs', 'Ananya Dutta', 27, 0, 0, 'Female', NULL, '9876543237', '456 Acacia Ave, Nowhere', 'ananya@example.com', 'Healthy'),
('Mr', 'Manish Tripathi', 54, 0, 0, 'Male', NULL, '9876543238', '789 Bamboo Rd, Somewhere', 'manish@example.com', 'Cholesterol'),
('Mrs', 'Zara Khan', 39, 0, 0, 'Female', NULL, '9876543239', '321 Cedar Dr, Anytown', 'zara@example.com', 'Healthy');

-- Insert Visits (40 visits)
INSERT INTO visits (patient_id, referred_doctor_id, ref_customer_id, registration_datetime, visit_code, total_cost, amount_paid, payment_mode, due_amount) VALUES
(1, 1, NULL, NOW() - INTERVAL '30 days', 'V001', 1200.00, 1200.00, 'CASH', 0.00),
(2, 2, NULL, NOW() - INTERVAL '28 days', 'V002', 800.00, 800.00, 'CARD', 0.00),
(3, 1, NULL, NOW() - INTERVAL '25 days', 'V003', 1500.00, 1500.00, 'CASH', 0.00),
(4, 3, NULL, NOW() - INTERVAL '22 days', 'V004', 950.00, 950.00, 'CARD', 0.00),
(5, NULL, 2, NOW() - INTERVAL '20 days', 'V005', 1100.00, 1100.00, 'CASH', 0.00),
(6, 2, NULL, NOW() - INTERVAL '18 days', 'V006', 1300.00, 1300.00, 'CARD', 0.00),
(7, 4, NULL, NOW() - INTERVAL '15 days', 'V007', 1400.00, 700.00, 'CASH', 700.00),
(8, 1, NULL, NOW() - INTERVAL '12 days', 'V008', 900.00, 900.00, 'CARD', 0.00),
(9, 2, NULL, NOW() - INTERVAL '10 days', 'V009', 1050.00, 1050.00, 'CASH', 0.00),
(10, 3, NULL, NOW() - INTERVAL '8 days', 'V010', 800.00, 800.00, 'CARD', 0.00),
(11, NULL, 3, NOW() - INTERVAL '6 days', 'V011', 1200.00, 1200.00, 'CASH', 0.00),
(12, 1, NULL, NOW() - INTERVAL '5 days', 'V012', 950.00, 950.00, 'CARD', 0.00),
(13, 2, NULL, NOW() - INTERVAL '4 days', 'V013', 1100.00, 550.00, 'CASH', 550.00),
(14, 4, NULL, NOW() - INTERVAL '3 days', 'V014', 1300.00, 1300.00, 'CARD', 0.00),
(15, 1, NULL, NOW() - INTERVAL '2 days', 'V015', 1000.00, 1000.00, 'CASH', 0.00),
(16, 3, NULL, NOW() - INTERVAL '1 day', 'V016', 850.00, 850.00, 'CARD', 0.00),
(17, 2, NULL, NOW(), 'V017', 1150.00, 1150.00, 'CASH', 0.00),
(18, NULL, 2, NOW(), 'V018', 1250.00, 1250.00, 'CARD', 0.00),
(19, 1, NULL, NOW() - INTERVAL '7 days', 'V019', 1400.00, 1400.00, 'CASH', 0.00),
(20, 4, NULL, NOW() - INTERVAL '14 days', 'V020', 900.00, 900.00, 'CARD', 0.00),
(21, 2, NULL, NOW() - INTERVAL '21 days', 'V021', 1050.00, 1050.00, 'CASH', 0.00),
(22, 3, NULL, NOW() - INTERVAL '27 days', 'V022', 1200.00, 1200.00, 'CARD', 0.00),
(23, 1, NULL, NOW() - INTERVAL '29 days', 'V023', 800.00, 800.00, 'CASH', 0.00),
(24, NULL, 3, NOW() - INTERVAL '26 days', 'V024', 1100.00, 1100.00, 'CARD', 0.00),
(25, 2, NULL, NOW() - INTERVAL '23 days', 'V025', 950.00, 950.00, 'CASH', 0.00),
(26, 4, NULL, NOW() - INTERVAL '19 days', 'V026', 1300.00, 650.00, 'CARD', 650.00),
(27, 1, NULL, NOW() - INTERVAL '16 days', 'V027', 1000.00, 1000.00, 'CASH', 0.00),
(28, 3, NULL, NOW() - INTERVAL '13 days', 'V028', 1150.00, 1150.00, 'CARD', 0.00),
(29, 2, NULL, NOW() - INTERVAL '9 days', 'V029', 1250.00, 1250.00, 'CASH', 0.00),
(30, 1, NULL, NOW() - INTERVAL '11 days', 'V030', 900.00, 900.00, 'CARD', 0.00);

-- Insert Visit Tests (60 tests)
INSERT INTO visit_tests (visit_id, test_template_id, status, collected_by, collected_at, specimen_type, results, approved_by, approved_at) VALUES
(1, 1, 'COMPLETED', 'Phlebotomist A', NOW() - INTERVAL '29 days', 'Blood', '{"WBC": 7.5, "RBC": 4.8, "Hemoglobin": 14.2}', 'Dr. Vikram', NOW() - INTERVAL '28 days'),
(1, 2, 'COMPLETED', 'Phlebotomist A', NOW() - INTERVAL '29 days', 'Blood', '{"ALT": 32, "AST": 28, "Bilirubin": 0.8}', 'Dr. Vikram', NOW() - INTERVAL '28 days'),
(2, 1, 'COMPLETED', 'Phlebotomist B', NOW() - INTERVAL '27 days', 'Blood', '{"WBC": 6.8, "RBC": 4.5, "Hemoglobin": 13.8}', 'Dr. Anjali', NOW() - INTERVAL '26 days'),
(3, 3, 'COMPLETED', 'Phlebotomist A', NOW() - INTERVAL '24 days', 'Blood', '{"Creatinine": 1.1, "BUN": 18}', 'Dr. Vikram', NOW() - INTERVAL '23 days'),
(4, 4, 'COMPLETED', 'Phlebotomist C', NOW() - INTERVAL '21 days', 'Blood', '{"TSH": 2.5, "T3": 120, "T4": 8.5}', 'Dr. Anjali', NOW() - INTERVAL '20 days'),
(5, 1, 'COMPLETED', 'Phlebotomist B', NOW() - INTERVAL '19 days', 'Blood', '{"WBC": 7.2, "RBC": 4.9, "Hemoglobin": 14.5}', 'Dr. Suresh', NOW() - INTERVAL '18 days'),
(6, 2, 'COMPLETED', 'Phlebotomist A', NOW() - INTERVAL '17 days', 'Blood', '{"ALT": 28, "AST": 25, "Bilirubin": 0.7}', 'Dr. Vikram', NOW() - INTERVAL '16 days'),
(7, 5, 'AWAITING_APPROVAL', 'Phlebotomist C', NOW() - INTERVAL '14 days', 'Blood', '{"Organism": "E. coli", "Sensitivity": "Sensitive"}', NULL, NULL),
(8, 1, 'COMPLETED', 'Phlebotomist B', NOW() - INTERVAL '11 days', 'Blood', '{"WBC": 7.0, "RBC": 4.7, "Hemoglobin": 14.0}', 'Dr. Anjali', NOW() - INTERVAL '10 days'),
(9, 3, 'COMPLETED', 'Phlebotomist A', NOW() - INTERVAL '9 days', 'Blood', '{"Creatinine": 1.0, "BUN": 16}', 'Dr. Suresh', NOW() - INTERVAL '8 days'),
(10, 4, 'COMPLETED', 'Phlebotomist C', NOW() - INTERVAL '7 days', 'Blood', '{"TSH": 3.2, "T3": 115, "T4": 8.0}', 'Dr. Vikram', NOW() - INTERVAL '6 days'),
(11, 1, 'COMPLETED', 'Phlebotomist B', NOW() - INTERVAL '5 days', 'Blood', '{"WBC": 6.9, "RBC": 4.6, "Hemoglobin": 13.9}', 'Dr. Anjali', NOW() - INTERVAL '4 days'),
(12, 2, 'COMPLETED', 'Phlebotomist A', NOW() - INTERVAL '4 days', 'Blood', '{"ALT": 35, "AST": 30, "Bilirubin": 0.9}', 'Dr. Suresh', NOW() - INTERVAL '3 days'),
(13, 6, 'IN_PROGRESS', 'Phlebotomist C', NOW() - INTERVAL '3 days', 'Urine', NULL, NULL, NULL),
(14, 1, 'COMPLETED', 'Phlebotomist B', NOW() - INTERVAL '2 days', 'Blood', '{"WBC": 7.1, "RBC": 4.8, "Hemoglobin": 14.1}', 'Dr. Vikram', NOW() - INTERVAL '1 day'),
(15, 7, 'COMPLETED', 'Phlebotomist A', NOW() - INTERVAL '1 day', 'Blood', '{"Glucose": 95}', 'Dr. Anjali', NOW()),
(16, 8, 'COMPLETED', 'Phlebotomist C', NOW(), 'Blood', '{"Cholesterol": 185, "Triglycerides": 120, "HDL": 45, "LDL": 110}', 'Dr. Suresh', NOW()),
(17, 1, 'SAMPLE_COLLECTED', 'Phlebotomist B', NOW(), 'Blood', NULL, NULL, NULL),
(18, 9, 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL),
(19, 2, 'COMPLETED', 'Phlebotomist A', NOW() - INTERVAL '6 days', 'Blood', '{"ALT": 30, "AST": 26, "Bilirubin": 0.8}', 'Dr. Vikram', NOW() - INTERVAL '5 days'),
(20, 3, 'COMPLETED', 'Phlebotomist C', NOW() - INTERVAL '13 days', 'Blood', '{"Creatinine": 1.2, "BUN": 20}', 'Dr. Anjali', NOW() - INTERVAL '12 days'),
(21, 4, 'COMPLETED', 'Phlebotomist B', NOW() - INTERVAL '20 days', 'Blood', '{"TSH": 2.8, "T3": 118, "T4": 8.3}', 'Dr. Suresh', NOW() - INTERVAL '19 days'),
(22, 1, 'COMPLETED', 'Phlebotomist A', NOW() - INTERVAL '26 days', 'Blood', '{"WBC": 7.3, "RBC": 4.9, "Hemoglobin": 14.3}', 'Dr. Vikram', NOW() - INTERVAL '25 days'),
(23, 5, 'COMPLETED', 'Phlebotomist C', NOW() - INTERVAL '28 days', 'Blood', '{"Organism": "Staphylococcus aureus", "Sensitivity": "Resistant"}', 'Dr. Anjali', NOW() - INTERVAL '27 days'),
(24, 2, 'COMPLETED', 'Phlebotomist B', NOW() - INTERVAL '25 days', 'Blood', '{"ALT": 29, "AST": 27, "Bilirubin": 0.7}', 'Dr. Suresh', NOW() - INTERVAL '24 days'),
(25, 3, 'COMPLETED', 'Phlebotomist A', NOW() - INTERVAL '22 days', 'Blood', '{"Creatinine": 0.9, "BUN": 15}', 'Dr. Vikram', NOW() - INTERVAL '21 days'),
(26, 6, 'AWAITING_APPROVAL', 'Phlebotomist C', NOW() - INTERVAL '18 days', 'Urine', '{"Organism": "Klebsiella", "Sensitivity": "Sensitive"}', NULL, NULL),
(27, 1, 'COMPLETED', 'Phlebotomist B', NOW() - INTERVAL '15 days', 'Blood', '{"WBC": 6.8, "RBC": 4.7, "Hemoglobin": 14.0}', 'Dr. Anjali', NOW() - INTERVAL '14 days'),
(28, 4, 'COMPLETED', 'Phlebotomist A', NOW() - INTERVAL '12 days', 'Blood', '{"TSH": 2.6, "T3": 122, "T4": 8.6}', 'Dr. Suresh', NOW() - INTERVAL '11 days'),
(29, 7, 'COMPLETED', 'Phlebotomist C', NOW() - INTERVAL '8 days', 'Blood', '{"Glucose": 98}', 'Dr. Vikram', NOW() - INTERVAL '7 days'),
(30, 8, 'COMPLETED', 'Phlebotomist B', NOW() - INTERVAL '10 days', 'Blood', '{"Cholesterol": 195, "Triglycerides": 130, "HDL": 42, "LDL": 120}', 'Dr. Anjali', NOW() - INTERVAL '9 days');

-- Insert Ledger Entries
INSERT INTO ledger_entries (client_id, visit_id, type, amount, description) VALUES
(2, 5, 'DEBIT', 1100.00, 'Visit V005 - Blood Culture'),
(2, 11, 'DEBIT', 1200.00, 'Visit V011 - Multiple Tests'),
(2, 18, 'DEBIT', 1250.00, 'Visit V018 - Comprehensive Panel'),
(3, 24, 'DEBIT', 1100.00, 'Visit V024 - Liver Function Test'),
(2, 5, 'CREDIT', 500.00, 'Payment received'),
(3, 24, 'CREDIT', 1100.00, 'Payment received');

-- Insert Audit Logs
INSERT INTO audit_logs (username, action, details) VALUES
('admin', 'LOGIN', 'Admin user logged in'),
('reception', 'CREATE_VISIT', 'Created visit V001 for patient John Smith'),
('phlebotomy', 'COLLECT_SAMPLE', 'Collected sample for visit V001'),
('lab', 'ENTER_RESULT', 'Entered results for test CBC in visit V001'),
('approver', 'APPROVE_RESULT', 'Approved results for visit V001'),
('admin', 'CREATE_USER', 'Created new user: reception'),
('reception', 'CREATE_VISIT', 'Created visit V002 for patient Maria Garcia'),
('phlebotomy', 'COLLECT_SAMPLE', 'Collected sample for visit V002'),
('lab', 'ENTER_RESULT', 'Entered results for test LFT in visit V002'),
('approver', 'APPROVE_RESULT', 'Approved results for visit V002');

