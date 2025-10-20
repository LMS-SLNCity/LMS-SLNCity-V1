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
('CBC', 'Complete Blood Count', 'Hematology', 350, 300, 'standard', '{"fields": [{"name": "Hemoglobin", "type": "number", "unit": "g/dL", "reference_range": "13-17"}, {"name": "WBC", "type": "number", "unit": "cells/mcL", "reference_range": "4,500-11,000"}, {"name": "Platelets", "type": "number", "unit": "cells/mcL", "reference_range": "150,000-450,000"}]}', ARRAY[]::INTEGER[], true),
('LFT', 'Liver Function Test', 'Biochemistry', 600, 550, 'standard', '{"fields": [{"name": "Bilirubin", "type": "number", "unit": "mg/dL", "reference_range": "0.1-1.2"}, {"name": "ALT", "type": "number", "unit": "U/L", "reference_range": "7-56"}]}', ARRAY[]::INTEGER[], true),
('KFT', 'Kidney Function Test', 'Biochemistry', 550, 500, 'standard', '{"fields": [{"name": "Urea", "type": "number", "unit": "mg/dL", "reference_range": "17-43"}, {"name": "Creatinine", "type": "number", "unit": "mg/dL", "reference_range": "0.6-1.2"}]}', ARRAY[]::INTEGER[], true),
('LIPID', 'Lipid Profile', 'Biochemistry', 700, 650, 'standard', '{"fields": []}', ARRAY[]::INTEGER[], true),
('THYROID', 'Thyroid Profile (T3, T4, TSH)', 'Hormones', 800, 720, 'standard', '{"fields": [{"name": "T3", "type": "number", "unit": "ng/dL", "reference_range": "80-220"}, {"name": "T4", "type": "number", "unit": "mcg/dL", "reference_range": "4.5-12.5"}, {"name": "TSH", "type": "number", "unit": "mIU/L", "reference_range": "0.4-4.0"}]}', ARRAY[]::INTEGER[], true),
('URINE-RE', 'Urine Routine Examination', 'Clinical Pathology', 200, 180, 'standard', '{"fields": [{"name": "Color", "type": "text"}, {"name": "Appearance", "type": "text"}]}', ARRAY[]::INTEGER[], true),
('HBA1C', 'Glycated Hemoglobin (HbA1c)', 'Biochemistry', 450, 400, 'standard', '{"fields": []}', ARRAY[]::INTEGER[], true),
('VITD', 'Vitamin D (25-OH)', 'Vitamins', 1200, 1100, 'standard', '{"fields": []}', ARRAY[]::INTEGER[], true),
('VITB12', 'Vitamin B12', 'Vitamins', 1000, 900, 'standard', '{"fields": []}', ARRAY[]::INTEGER[], true),
('CULTURE-U', 'Urine Culture & Sensitivity', 'Microbiology', 900, 850, 'culture', '{"fields": []}', ARRAY[1, 6, 11, 14]::INTEGER[], true)
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
('Ms', 'Maria Garcia', 32, 0, 0, 'Female', '1234567890', '456 Oak Ave, Anytown', 'maria.garcia@example.com', 'None'),
('Mr', 'Rajesh Kumar', 52, 6, 15, 'Male', '9988776655', '789 Park Lane, Hyderabad', 'rajesh.kumar@example.com', 'Diabetes, Hypertension'),
('Ms', 'Priya Sharma', 28, 3, 0, 'Female', '9123456789', '321 Garden Rd, Bangalore', 'priya.sharma@example.com', 'Thyroid disorder'),
('Mr', 'Amit Patel', 38, 11, 20, 'Male', '8765432109', '654 Oak Street, Mumbai', 'amit.patel@example.com', 'High cholesterol'),
('Ms', 'Sneha Desai', 41, 2, 5, 'Female', '9876543211', '987 Elm Ave, Pune', 'sneha.desai@example.com', 'Anemia'),
('Mr', 'Vikram Singh', 55, 8, 10, 'Male', '9654321098', '147 Maple Dr, Delhi', 'vikram.singh@example.com', 'Kidney disease'),
('Ms', 'Anjali Reddy', 35, 5, 0, 'Female', '9543210987', '258 Pine St, Hyderabad', 'anjali.reddy@example.com', 'Asthma'),
('Mr', 'Suresh Nair', 48, 1, 12, 'Male', '9432109876', '369 Birch Ln, Kochi', 'suresh.nair@example.com', 'Arthritis'),
('Ms', 'Divya Iyer', 26, 9, 3, 'Female', '9321098765', '741 Cedar Rd, Chennai', 'divya.iyer@example.com', 'None'),
('Mr', 'Arjun Verma', 62, 4, 18, 'Male', '9210987654', '852 Spruce Ave, Jaipur', 'arjun.verma@example.com', 'Heart disease, Diabetes'),
('Ms', 'Neha Gupta', 33, 7, 8, 'Female', '9109876543', '963 Willow St, Lucknow', 'neha.gupta@example.com', 'Migraine'),
('Mr', 'Rohan Chopra', 29, 0, 25, 'Male', '8998765432', '159 Ash Ln, Chandigarh', 'rohan.chopra@example.com', 'None'),
('Ms', 'Kavya Menon', 44, 10, 14, 'Female', '8887654321', '357 Hazel Dr, Thiruvananthapuram', 'kavya.menon@example.com', 'Hypertension'),
('Mr', 'Sanjay Rao', 51, 3, 0, 'Male', '8776543210', '456 Poplar Ave, Bangalore', 'sanjay.rao@example.com', 'Obesity, Diabetes'),
('Ms', 'Pooja Singh', 37, 6, 11, 'Female', '8665432109', '789 Sycamore St, Gurgaon', 'pooja.singh@example.com', 'Thyroid'),
('Mr', 'Nikhil Joshi', 40, 2, 7, 'Male', '8554321098', '321 Chestnut Ln, Pune', 'nikhil.joshi@example.com', 'None'),
('Ms', 'Ritika Bhat', 31, 8, 19, 'Female', '8443210987', '654 Dogwood Dr, Bangalore', 'ritika.bhat@example.com', 'Anemia'),
('Mr', 'Arun Nambiar', 58, 5, 2, 'Male', '8332109876', '987 Fir Ave, Kochi', 'arun.nambiar@example.com', 'Hypertension, Cholesterol'),
('Ms', 'Shreya Kapoor', 25, 1, 9, 'Female', '8221098765', '147 Juniper St, Delhi', 'shreya.kapoor@example.com', 'None')
ON CONFLICT DO NOTHING;

