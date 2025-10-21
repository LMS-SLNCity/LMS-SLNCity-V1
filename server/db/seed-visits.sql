-- Seed Visits (Sample visits for patients)
INSERT INTO visits (patient_id, ref_customer_id, referred_doctor_id, registration_datetime, visit_code, total_cost, amount_paid, due_amount, payment_mode) VALUES
(1, 1, 1, NOW(), 'V001', 1200.00, 1200.00, 0.00, 'CASH'),
(2, 1, 2, NOW() - INTERVAL '1 day', 'V002', 1500.00, 1500.00, 0.00, 'CARD'),
(3, 2, 1, NOW() - INTERVAL '2 days', 'V003', 2000.00, 2000.00, 0.00, 'CASH'),
(4, 1, 3, NOW() - INTERVAL '3 days', 'V004', 1800.00, 1800.00, 0.00, 'CHEQUE'),
(5, 3, 2, NOW() - INTERVAL '4 days', 'V005', 1600.00, 1600.00, 0.00, 'CASH'),
(6, 1, 1, NOW() - INTERVAL '5 days', 'V006', 1400.00, 1400.00, 0.00, 'CARD'),
(7, 2, 4, NOW() - INTERVAL '6 days', 'V007', 2200.00, 2200.00, 0.00, 'CASH'),
(8, 1, 2, NOW() - INTERVAL '7 days', 'V008', 1300.00, 1300.00, 0.00, 'CARD'),
(9, 3, 1, NOW() - INTERVAL '8 days', 'V009', 1700.00, 1700.00, 0.00, 'CASH'),
(10, 1, 3, NOW() - INTERVAL '9 days', 'V010', 1500.00, 1500.00, 0.00, 'CHEQUE'),
(11, 2, 2, NOW() - INTERVAL '10 days', 'V011', 1900.00, 1900.00, 0.00, 'CASH'),
(12, 1, 1, NOW() - INTERVAL '11 days', 'V012', 1600.00, 1600.00, 0.00, 'CARD'),
(13, 3, 4, NOW() - INTERVAL '12 days', 'V013', 1800.00, 1800.00, 0.00, 'CASH'),
(14, 1, 2, NOW() - INTERVAL '13 days', 'V014', 1400.00, 1400.00, 0.00, 'CARD'),
(15, 2, 1, NOW() - INTERVAL '14 days', 'V015', 2100.00, 2100.00, 0.00, 'CASH'),
(16, 1, 3, NOW() - INTERVAL '15 days', 'V016', 1700.00, 1700.00, 0.00, 'CHEQUE'),
(17, 3, 2, NOW() - INTERVAL '16 days', 'V017', 1500.00, 1500.00, 0.00, 'CASH'),
(18, 1, 1, NOW() - INTERVAL '17 days', 'V018', 1600.00, 1600.00, 0.00, 'CARD'),
(19, 2, 4, NOW() - INTERVAL '18 days', 'V019', 2000.00, 2000.00, 0.00, 'CASH'),
(20, 1, 2, NOW() - INTERVAL '19 days', 'V020', 1400.00, 1400.00, 0.00, 'CARD'),
(1, 2, 1, NOW() - INTERVAL '20 days', 'V021', 1800.00, 1800.00, 0.00, 'CASH'),
(3, 1, 3, NOW() - INTERVAL '21 days', 'V022', 1700.00, 1700.00, 0.00, 'CHEQUE')
ON CONFLICT DO NOTHING;

-- Seed Visit Tests (Tests performed during visits)
INSERT INTO visit_tests (visit_id, test_template_id, status, specimen_type, results, collected_by, collected_at) VALUES
-- Visit 1 - John Smith
(1, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "14.5", "WBC": "7200", "Platelets": "250000"}', 'Phlebotomist A', NOW()),
(1, 5, 'COMPLETED', 'Blood', '{"T3": "120", "T4": "8.5", "TSH": "2.1"}', 'Phlebotomist A', NOW()),

-- Visit 2 - Maria Garcia
(2, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "13.2", "WBC": "6800", "Platelets": "240000"}', 'Phlebotomist B', NOW() - INTERVAL '1 day'),
(2, 2, 'COMPLETED', 'Blood', '{"Bilirubin": "0.8", "ALT": "32"}', 'Phlebotomist B', NOW() - INTERVAL '1 day'),

-- Visit 3 - Rajesh Kumar
(3, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "15.1", "WBC": "7500", "Platelets": "260000"}', 'Phlebotomist A', NOW() - INTERVAL '2 days'),
(3, 3, 'COMPLETED', 'Blood', '{"Urea": "28", "Creatinine": "0.9"}', 'Phlebotomist A', NOW() - INTERVAL '2 days'),
(3, 4, 'COMPLETED', 'Blood', '{"Total_Cholesterol": "180", "HDL": "50", "LDL": "110"}', 'Phlebotomist A', NOW() - INTERVAL '2 days'),

-- Visit 4 - Priya Sharma
(4, 5, 'COMPLETED', 'Blood', '{"T3": "95", "T4": "6.2", "TSH": "3.8"}', 'Phlebotomist C', NOW() - INTERVAL '3 days'),
(4, 7, 'COMPLETED', 'Blood', '{"HbA1c": "5.2"}', 'Phlebotomist C', NOW() - INTERVAL '3 days'),

-- Visit 5 - Amit Patel
(5, 4, 'COMPLETED', 'Blood', '{"Total_Cholesterol": "240", "HDL": "35", "LDL": "160"}', 'Phlebotomist B', NOW() - INTERVAL '4 days'),
(5, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "14.8", "WBC": "7100", "Platelets": "245000"}', 'Phlebotomist B', NOW() - INTERVAL '4 days'),

-- Visit 6 - Sneha Desai
(6, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "11.5", "WBC": "6500", "Platelets": "220000"}', 'Phlebotomist A', NOW() - INTERVAL '5 days'),
(6, 9, 'COMPLETED', 'Blood', '{"Vitamin_B12": "180"}', 'Phlebotomist A', NOW() - INTERVAL '5 days'),

-- Visit 7 - Vikram Singh
(7, 3, 'COMPLETED', 'Blood', '{"Urea": "42", "Creatinine": "1.3"}', 'Phlebotomist C', NOW() - INTERVAL '6 days'),
(7, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "14.2", "WBC": "7300", "Platelets": "255000"}', 'Phlebotomist C', NOW() - INTERVAL '6 days'),

-- Visit 8 - Anjali Reddy
(8, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "13.8", "WBC": "6900", "Platelets": "235000"}', 'Phlebotomist B', NOW() - INTERVAL '7 days'),
(8, 6, 'COMPLETED', 'Urine', '{"Color": "Yellow", "Appearance": "Clear", "pH": "6.5"}', 'Phlebotomist B', NOW() - INTERVAL '7 days'),

-- Visit 9 - Suresh Nair
(9, 2, 'COMPLETED', 'Blood', '{"Bilirubin": "0.9", "ALT": "28"}', 'Phlebotomist A', NOW() - INTERVAL '8 days'),
(9, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "14.6", "WBC": "7400", "Platelets": "250000"}', 'Phlebotomist A', NOW() - INTERVAL '8 days'),

-- Visit 10 - Divya Iyer
(10, 3, 'COMPLETED', 'Blood', '{"Urea": "25", "Creatinine": "0.8"}', 'Phlebotomist C', NOW() - INTERVAL '9 days'),
(10, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "13.5", "WBC": "6700", "Platelets": "240000"}', 'Phlebotomist C', NOW() - INTERVAL '9 days'),

-- Visit 11 - Arjun Verma
(11, 8, 'COMPLETED', 'Blood', '{"Vitamin_D": "22"}', 'Phlebotomist B', NOW() - INTERVAL '10 days'),
(11, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "14.9", "WBC": "7600", "Platelets": "260000"}', 'Phlebotomist B', NOW() - INTERVAL '10 days'),

-- Visit 12 - Neha Gupta
(12, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "13.1", "WBC": "6600", "Platelets": "230000"}', 'Phlebotomist A', NOW() - INTERVAL '11 days'),
(12, 5, 'COMPLETED', 'Blood', '{"T3": "110", "T4": "7.8", "TSH": "2.5"}', 'Phlebotomist A', NOW() - INTERVAL '11 days'),

-- Visit 13 - Kavya Menon
(13, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "14.3", "WBC": "7200", "Platelets": "245000"}', 'Phlebotomist C', NOW() - INTERVAL '12 days'),
(13, 4, 'COMPLETED', 'Blood', '{"Total_Cholesterol": "190", "HDL": "55", "LDL": "120"}', 'Phlebotomist C', NOW() - INTERVAL '12 days'),

-- Visit 14 - Sanjay Rao
(14, 7, 'COMPLETED', 'Blood', '{"HbA1c": "7.8"}', 'Phlebotomist B', NOW() - INTERVAL '13 days'),
(14, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "14.7", "WBC": "7500", "Platelets": "255000"}', 'Phlebotomist B', NOW() - INTERVAL '13 days'),

-- Visit 15 - Pooja Singh
(15, 5, 'COMPLETED', 'Blood', '{"T3": "115", "T4": "8.2", "TSH": "2.3"}', 'Phlebotomist A', NOW() - INTERVAL '14 days'),
(15, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "13.4", "WBC": "6800", "Platelets": "235000"}', 'Phlebotomist A', NOW() - INTERVAL '14 days'),

-- Visit 16 - Nikhil Joshi
(16, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "14.5", "WBC": "7100", "Platelets": "250000"}', 'Phlebotomist C', NOW() - INTERVAL '15 days'),
(16, 2, 'COMPLETED', 'Blood', '{"Bilirubin": "0.7", "ALT": "30"}', 'Phlebotomist C', NOW() - INTERVAL '15 days'),

-- Visit 17 - Ritika Bhat
(17, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "12.8", "WBC": "6500", "Platelets": "225000"}', 'Phlebotomist B', NOW() - INTERVAL '16 days'),
(17, 9, 'COMPLETED', 'Blood', '{"Vitamin_B12": "250"}', 'Phlebotomist B', NOW() - INTERVAL '16 days'),

-- Visit 18 - Arun Nambiar
(18, 3, 'COMPLETED', 'Blood', '{"Urea": "30", "Creatinine": "1.0"}', 'Phlebotomist A', NOW() - INTERVAL '17 days'),
(18, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "14.8", "WBC": "7400", "Platelets": "260000"}', 'Phlebotomist A', NOW() - INTERVAL '17 days'),

-- Visit 19 - Shreya Kapoor
(19, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "13.6", "WBC": "6900", "Platelets": "240000"}', 'Phlebotomist C', NOW() - INTERVAL '18 days'),
(19, 6, 'COMPLETED', 'Urine', '{"Color": "Pale Yellow", "Appearance": "Clear", "pH": "6.8"}', 'Phlebotomist C', NOW() - INTERVAL '18 days'),

-- Visit 20 - John Smith (second visit)
(20, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "14.4", "WBC": "7200", "Platelets": "248000"}', 'Phlebotomist B', NOW() - INTERVAL '19 days'),
(20, 5, 'COMPLETED', 'Blood', '{"T3": "118", "T4": "8.3", "TSH": "2.2"}', 'Phlebotomist B', NOW() - INTERVAL '19 days'),

-- Visit 21 - Rajesh Kumar (second visit)
(21, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "15.0", "WBC": "7400", "Platelets": "258000"}', 'Phlebotomist A', NOW() - INTERVAL '20 days'),
(21, 3, 'COMPLETED', 'Blood', '{"Urea": "29", "Creatinine": "0.95"}', 'Phlebotomist A', NOW() - INTERVAL '20 days'),

-- Visit 22 - Priya Sharma (second visit)
(22, 5, 'COMPLETED', 'Blood', '{"T3": "92", "T4": "6.0", "TSH": "4.2"}', 'Phlebotomist C', NOW() - INTERVAL '21 days'),
(22, 1, 'COMPLETED', 'Blood', '{"Hemoglobin": "13.3", "WBC": "6700", "Platelets": "238000"}', 'Phlebotomist C', NOW() - INTERVAL '21 days')
ON CONFLICT DO NOTHING;

