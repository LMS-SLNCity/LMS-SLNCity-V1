import pool from './connection.js';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const seedData = async () => {
  // Try to connect as postgres to create the lms_user if it doesn't exist
  // If postgres user doesn't exist, skip this step (database already set up)
  try {
    const adminPool = new Pool({
      user: 'postgres',
      password: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: 'postgres',
    });

    const adminClient = await adminPool.connect();
    try {
      // Check if lms_user exists
      const userCheck = await adminClient.query(
        "SELECT 1 FROM pg_user WHERE usename = 'lms_user'"
      );
      if (userCheck.rows.length === 0) {
        console.log('Creating lms_user...');
        await adminClient.query(
          "CREATE USER lms_user WITH ENCRYPTED PASSWORD 'lms_password'"
        );
        await adminClient.query('ALTER USER lms_user CREATEDB');
      }

      // Check if lms_slncity database exists
      const dbCheck = await adminClient.query(
        "SELECT 1 FROM pg_database WHERE datname = 'lms_slncity'"
      );
      if (dbCheck.rows.length === 0) {
        console.log('Creating lms_slncity database...');
        await adminClient.query('CREATE DATABASE lms_slncity OWNER lms_user');
      }

      await adminClient.query('GRANT ALL PRIVILEGES ON DATABASE lms_slncity TO lms_user');
    } finally {
      adminClient.release();
      await adminPool.end();
    }
  } catch (error) {
    console.log('Skipping admin setup (database already configured)');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Note: Users should be created through the admin panel or API
    // No default users are seeded to production database

    // Check if test templates already exist
    const templateCheck = await client.query('SELECT COUNT(*) FROM test_templates');
    const templatesExist = parseInt(templateCheck.rows[0].count) > 0;

    // Seed Antibiotics
    const antibiotics = [
      { name: 'Amikacin', abbreviation: 'AK' },
      { name: 'Amoxicillin', abbreviation: 'AMX' },
      { name: 'Azithromycin', abbreviation: 'AZM' },
      { name: 'Cefepime', abbreviation: 'CPM' },
      { name: 'Ceftriaxone', abbreviation: 'CTR' },
      { name: 'Ciprofloxacin', abbreviation: 'CIP' },
      { name: 'Clindamycin', abbreviation: 'CD' },
      { name: 'Doxycycline', abbreviation: 'DO' },
      { name: 'Gentamicin', abbreviation: 'GEN' },
      { name: 'Imipenem', abbreviation: 'IPM' },
      { name: 'Levofloxacin', abbreviation: 'LEV' },
      { name: 'Linezolid', abbreviation: 'LZ' },
      { name: 'Meropenem', abbreviation: 'MRP' },
      { name: 'Nitrofurantoin', abbreviation: 'NIT' },
      { name: 'Penicillin', abbreviation: 'P' },
      { name: 'Piperacillin-Tazobactam', abbreviation: 'PIT' },
      { name: 'Tetracycline', abbreviation: 'TE' },
      { name: 'Vancomycin', abbreviation: 'VA' },
    ];

    for (const antibiotic of antibiotics) {
      await client.query(
        'INSERT INTO antibiotics (name, abbreviation, is_active) VALUES ($1, $2, $3)',
        [antibiotic.name, antibiotic.abbreviation, true]
      );
    }

    // Seed Test Templates
    const testTemplates = [
      {
        code: 'CBC',
        name: 'Complete Blood Count',
        category: 'Hematology',
        price: 350,
        b2b_price: 300,
        reportType: 'standard',
        parameters: { fields: [
          { name: 'Hemoglobin', type: 'number', unit: 'g/dL', reference_range: '13-17' },
          { name: 'WBC', type: 'number', unit: 'cells/mcL', reference_range: '4,500-11,000' },
          { name: 'Platelets', type: 'number', unit: 'cells/mcL', reference_range: '150,000-450,000' },
        ]},
      },
      {
        code: 'LFT',
        name: 'Liver Function Test',
        category: 'Biochemistry',
        price: 600,
        b2b_price: 550,
        reportType: 'standard',
        parameters: { fields: [
          { name: 'Bilirubin', type: 'number', unit: 'mg/dL', reference_range: '0.1-1.2' },
          { name: 'ALT', type: 'number', unit: 'U/L', reference_range: '7-56' },
        ]},
      },
      {
        code: 'KFT',
        name: 'Kidney Function Test',
        category: 'Biochemistry',
        price: 550,
        b2b_price: 500,
        reportType: 'standard',
        parameters: { fields: [
          { name: 'Urea', type: 'number', unit: 'mg/dL', reference_range: '17-43' },
          { name: 'Creatinine', type: 'number', unit: 'mg/dL', reference_range: '0.6-1.2' },
        ]},
      },
      {
        code: 'LIPID',
        name: 'Lipid Profile',
        category: 'Biochemistry',
        price: 700,
        b2b_price: 650,
        reportType: 'standard',
        parameters: { fields: [] },
      },
      {
        code: 'THYROID',
        name: 'Thyroid Profile (T3, T4, TSH)',
        category: 'Hormones',
        price: 800,
        b2b_price: 720,
        reportType: 'standard',
        parameters: { fields: [
          { name: 'T3', type: 'number', unit: 'ng/dL', reference_range: '80-220' },
          { name: 'T4', type: 'number', unit: 'mcg/dL', reference_range: '4.5-12.5' },
          { name: 'TSH', type: 'number', unit: 'mIU/L', reference_range: '0.4-4.0' },
        ]},
      },
      {
        code: 'URINE-RE',
        name: 'Urine Routine Examination',
        category: 'Clinical Pathology',
        price: 200,
        b2b_price: 180,
        reportType: 'standard',
        parameters: { fields: [
          { name: 'Color', type: 'text' },
          { name: 'Appearance', type: 'text' },
        ]},
      },
      {
        code: 'HBA1C',
        name: 'Glycated Hemoglobin (HbA1c)',
        category: 'Biochemistry',
        price: 450,
        b2b_price: 400,
        reportType: 'standard',
        parameters: { fields: [] },
      },
      {
        code: 'VITD',
        name: 'Vitamin D (25-OH)',
        category: 'Vitamins',
        price: 1200,
        b2b_price: 1100,
        reportType: 'standard',
        parameters: { fields: [] },
      },
      {
        code: 'VITB12',
        name: 'Vitamin B12',
        category: 'Vitamins',
        price: 1000,
        b2b_price: 900,
        reportType: 'standard',
        parameters: { fields: [] },
      },
      {
        code: 'CULTURE-U',
        name: 'Urine Culture & Sensitivity',
        category: 'Microbiology',
        price: 900,
        b2b_price: 850,
        reportType: 'culture',
        parameters: { fields: [] },
        defaultAntibioticIds: [1, 6, 11, 14],
      },
    ];

    if (!templatesExist) {
      for (const template of testTemplates) {
        await client.query(
          `INSERT INTO test_templates (code, name, category, price, b2b_price, report_type, parameters, default_antibiotic_ids, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            template.code,
            template.name,
            template.category,
            template.price,
            template.b2b_price,
            template.reportType,
            JSON.stringify(template.parameters),
            template.defaultAntibioticIds || [],
            true,
          ]
        );
      }
      console.log('✅ Test templates seeded');
    } else {
      console.log('ℹ️  Test templates already exist, skipping');
    }

    // Note: Referral doctors should be created through the admin panel or API
    // No default referral doctors are seeded

    // Note: B2B clients should be created through the admin panel or API
    // No default clients are seeded

    // Note: Signatories should be created through the admin panel or API
    // No default signatories are seeded

    // Seed sample patients (check if they already exist)
    const patients = [
      { salutation: 'Mr.', name: 'Rajesh Kumar', age_years: 45, age_months: 0, age_days: 0, sex: 'M', phone: '9876543210', address: '123 Main St, City', email: 'rajesh@example.com', clinical_history: 'Diabetes' },
      { salutation: 'Ms.', name: 'Priya Singh', age_years: 32, age_months: 6, age_days: 0, sex: 'F', phone: '9876543211', address: '456 Oak Ave, City', email: 'priya@example.com', clinical_history: 'Hypertension' },
      { salutation: 'Mr.', name: 'Amit Patel', age_years: 28, age_months: 3, age_days: 15, sex: 'M', phone: '9876543212', address: '789 Pine Rd, City', email: 'amit@example.com', clinical_history: 'None' },
      { salutation: 'Ms.', name: 'Neha Sharma', age_years: 55, age_months: 0, age_days: 0, sex: 'F', phone: '9876543213', address: '321 Elm St, City', email: 'neha@example.com', clinical_history: 'Thyroid' },
      { salutation: 'Mr.', name: 'Vikram Desai', age_years: 38, age_months: 9, age_days: 0, sex: 'M', phone: '9876543214', address: '654 Maple Dr, City', email: 'vikram@example.com', clinical_history: 'Cholesterol' },
    ];

    const patientResults = [];
    for (const patient of patients) {
      // Check if patient already exists
      const existingPatient = await client.query(
        `SELECT id FROM patients WHERE name = $1 AND phone = $2`,
        [patient.name, patient.phone]
      );

      if (existingPatient.rows.length > 0) {
        patientResults.push(existingPatient.rows[0].id);
      } else {
        const result = await client.query(
          `INSERT INTO patients (salutation, name, age_years, age_months, age_days, sex, phone, address, email, clinical_history)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING id`,
          [patient.salutation, patient.name, patient.age_years, patient.age_months, patient.age_days, patient.sex, patient.phone, patient.address, patient.email, patient.clinical_history]
        );
        patientResults.push(result.rows[0].id);
      }
    }

    // Seed sample visits (check if they already exist)
    const visits = [
      { patient_id: patientResults[0], total_cost: 1500, amount_paid: 1500, payment_mode: 'Cash', test_ids: [1, 2] },
      { patient_id: patientResults[1], total_cost: 2000, amount_paid: 1000, payment_mode: 'Card', test_ids: [3, 4] },
      { patient_id: patientResults[2], total_cost: 1200, amount_paid: 1200, payment_mode: 'UPI', test_ids: [1, 5] },
      { patient_id: patientResults[3], total_cost: 2500, amount_paid: 2500, payment_mode: 'Cash', test_ids: [2, 3, 6] },
      { patient_id: patientResults[4], total_cost: 1800, amount_paid: 1800, payment_mode: 'Card', test_ids: [4, 7] },
    ];

    const visitResults = [];
    for (let i = 0; i < visits.length; i++) {
      const visit = visits[i];
      const visitCode = `LAB-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`;

      // Check if visit already exists
      const existingVisit = await client.query(
        `SELECT id FROM visits WHERE visit_code = $1`,
        [visitCode]
      );

      if (existingVisit.rows.length > 0) {
        visitResults.push({ id: existingVisit.rows[0].id, test_ids: visit.test_ids });
      } else {
        const result = await client.query(
          `INSERT INTO visits (patient_id, visit_code, total_cost, amount_paid, payment_mode, due_amount)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [visit.patient_id, visitCode, visit.total_cost, visit.amount_paid, visit.payment_mode, visit.total_cost - visit.amount_paid]
        );
        visitResults.push({ id: result.rows[0].id, test_ids: visit.test_ids });
      }
    }

    // Seed sample visit tests with various statuses (check if they already exist)
    const testStatuses = ['PENDING', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'AWAITING_APPROVAL', 'APPROVED'];
    let testIndex = 0;
    for (const visit of visitResults) {
      for (const testTemplateId of visit.test_ids) {
        // Check if this visit test already exists
        const existingTest = await client.query(
          `SELECT id FROM visit_tests WHERE visit_id = $1 AND test_template_id = $2`,
          [visit.id, testTemplateId]
        );

        if (existingTest.rows.length > 0) {
          testIndex++;
          continue;
        }

        const status = testStatuses[testIndex % testStatuses.length];
        const collectedAt = status !== 'PENDING' ? new Date().toISOString() : null;
        const approvedAt = status === 'APPROVED' ? new Date().toISOString() : null;

        // Add sample results for APPROVED tests
        let results = null;
        if (status === 'APPROVED') {
          // Get the test template to know what parameters to add
          const templateResult = await client.query('SELECT parameters FROM test_templates WHERE id = $1', [testTemplateId]);
          if (templateResult.rows.length > 0) {
            const template = templateResult.rows[0];
            const parameters = typeof template.parameters === 'string' ? JSON.parse(template.parameters) : template.parameters;

            // Create sample results for each parameter
            if (parameters.fields && parameters.fields.length > 0) {
              results = {};
              parameters.fields.forEach((field: any) => {
                if (field.type === 'number') {
                  results[field.name] = Math.floor(Math.random() * 100) + 1;
                } else {
                  results[field.name] = 'Normal';
                }
              });
            }
          }
        }

        await client.query(
          `INSERT INTO visit_tests (visit_id, test_template_id, status, collected_by, collected_at, approved_by, approved_at, results)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [visit.id, testTemplateId, status, status !== 'PENDING' ? 'phlebotomist' : null, collectedAt, status === 'APPROVED' ? 'approver' : null, approvedAt, results ? JSON.stringify(results) : null]
        );
        testIndex++;
      }
    }

    // Seed B2B Client Logins (check if clients exist and set up login credentials)
    const clientsResult = await client.query('SELECT id FROM clients WHERE type = $1', ['REFERRAL_LAB']);

    if (clientsResult.rows.length > 0) {
      for (const clientRow of clientsResult.rows) {
        const clientId = clientRow.id;

        // Check if login already exists
        const loginCheck = await client.query(
          'SELECT id FROM b2b_client_logins WHERE client_id = $1',
          [clientId]
        );

        if (loginCheck.rows.length === 0) {
          // Create default password: client_<id>
          const defaultPassword = `client_${clientId}`;
          const hashedPassword = await bcrypt.hash(defaultPassword, 10);

          await client.query(
            'INSERT INTO b2b_client_logins (client_id, password_hash, is_active) VALUES ($1, $2, $3)',
            [clientId, hashedPassword, true]
          );
          console.log(`✅ B2B login set up for client ${clientId} with password: ${defaultPassword}`);
        }
      }
    }

    await client.query('COMMIT');
    console.log('✅ Database seeded successfully with sample data!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

seedData().catch(console.error);

