-- Add test data to populate the dashboard

-- Insert test patients
INSERT INTO patients (salutation, name, age_years, age_months, age_days, sex, phone, address, email, clinical_history)
VALUES 
('Mr', 'John Doe', 35, 0, 0, 'Male', '9876543210', '123 Main St', 'john@test.com', 'No allergies'),
('Ms', 'Jane Smith', 28, 0, 0, 'Female', '9876543211', '456 Oak Ave', 'jane@test.com', 'Asthma'),
('Mr', 'Rajesh Kumar', 45, 0, 0, 'Male', '9876543212', '789 Pine Rd', 'rajesh@test.com', 'Diabetes'),
('Ms', 'Priya Sharma', 32, 0, 0, 'Female', '9876543213', '321 Elm St', 'priya@test.com', 'Thyroid'),
('Mr', 'Amit Patel', 50, 0, 0, 'Male', '9876543214', '654 Maple Dr', 'amit@test.com', 'Hypertension')
ON CONFLICT (phone) DO NOTHING;

-- Get patient IDs
WITH patient_ids AS (
  SELECT id FROM patients WHERE phone IN ('9876543210', '9876543211', '9876543212', '9876543213', '9876543214')
),
client_ids AS (
  SELECT id FROM clients WHERE type = 'REFERRAL_LAB' LIMIT 2
),
template_ids AS (
  SELECT id FROM test_templates LIMIT 5
)
INSERT INTO visits (patient_id, ref_customer_id, total_cost, amount_paid, due_amount, payment_mode, registration_datetime)
SELECT 
  p.id,
  c.id,
  1500.00,
  1500.00,
  0.00,
  'CASH',
  NOW() - INTERVAL '5 days'
FROM (SELECT id FROM patient_ids LIMIT 1) p, (SELECT id FROM client_ids LIMIT 1) c;

-- Add more visits
WITH patient_ids AS (
  SELECT id FROM patients WHERE phone IN ('9876543210', '9876543211', '9876543212', '9876543213', '9876543214')
),
client_ids AS (
  SELECT id FROM clients WHERE type = 'REFERRAL_LAB' LIMIT 2
)
INSERT INTO visits (patient_id, ref_customer_id, total_cost, amount_paid, due_amount, payment_mode, registration_datetime)
SELECT 
  p.id,
  c.id,
  2000.00,
  2000.00,
  0.00,
  'CARD',
  NOW() - INTERVAL '3 days'
FROM (SELECT id FROM patient_ids OFFSET 1 LIMIT 1) p, (SELECT id FROM client_ids OFFSET 1 LIMIT 1) c;

-- Add tests to visits
WITH visit_ids AS (
  SELECT id FROM visits ORDER BY created_at DESC LIMIT 2
),
template_ids AS (
  SELECT id FROM test_templates LIMIT 3
)
INSERT INTO visit_tests (visit_id, test_template_id, status)
SELECT v.id, t.id, 'APPROVED'
FROM visit_ids v, template_ids t;

SELECT 'Test data added successfully' as status;

