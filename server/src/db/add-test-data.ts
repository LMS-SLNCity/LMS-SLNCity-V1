import pool from './connection.js';

const addTestData = async () => {
  const client = await pool.connect();
  try {
    console.log('🔄 Adding test data...');

    // Insert patients
    const patientResult = await client.query(`
      INSERT INTO patients (salutation, name, age_years, age_months, age_days, sex, phone, address, email, clinical_history)
      VALUES
      ('Mr', 'John Doe', 35, 0, 0, 'Male', '9876543210', '123 Main St', 'john@test.com', 'No allergies'),
      ('Ms', 'Jane Smith', 28, 0, 0, 'Female', '9876543211', '456 Oak Ave', 'jane@test.com', 'Asthma'),
      ('Mr', 'Rajesh Kumar', 45, 0, 0, 'Male', '9876543212', '789 Pine Rd', 'rajesh@test.com', 'Diabetes'),
      ('Ms', 'Priya Sharma', 32, 0, 0, 'Female', '9876543213', '321 Elm St', 'priya@test.com', 'Thyroid'),
      ('Mr', 'Amit Patel', 50, 0, 0, 'Male', '9876543214', '654 Maple Dr', 'amit@test.com', 'Hypertension')
      RETURNING id;
    `);

    console.log(`✅ Created ${patientResult.rows.length} patients`);

    // Get patient IDs
    const patientsResult = await client.query(
      "SELECT id FROM patients WHERE phone IN ('9876543210', '9876543211', '9876543212', '9876543213', '9876543214') LIMIT 5"
    );
    const patientIds = patientsResult.rows.map((r: any) => r.id);

    // Get client IDs
    const clientsResult = await client.query(
      "SELECT id FROM clients WHERE type = 'REFERRAL_LAB' LIMIT 2"
    );
    const clientIds = clientsResult.rows.map((r: any) => r.id);

    // Get template IDs
    const templatesResult = await client.query(
      'SELECT id FROM test_templates LIMIT 5'
    );
    const templateIds = templatesResult.rows.map((r: any) => r.id);

    console.log(`Found ${patientIds.length} patients, ${clientIds.length} clients, ${templateIds.length} templates`);

    // Create visits
    let visitCount = 0;
    for (let i = 0; i < 5; i++) {
      const patientId = patientIds[i % patientIds.length];
      const clientId = clientIds[i % clientIds.length];
      const totalCost = 1000 + Math.random() * 2000;
      const daysAgo = Math.floor(Math.random() * 30);

      const visitResult = await client.query(
        `INSERT INTO visits (patient_id, ref_customer_id, total_cost, amount_paid, due_amount, payment_mode, registration_datetime)
         VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '${daysAgo} days')
         RETURNING id`,
        [patientId, clientId, totalCost, totalCost, 0, 'CASH']
      );

      const visitId = visitResult.rows[0].id;
      visitCount++;

      // Add 2-3 tests to each visit
      const testCount = 2 + Math.floor(Math.random() * 2);
      for (let j = 0; j < testCount; j++) {
        const templateId = templateIds[j % templateIds.length];
        const statuses = ['PENDING', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'APPROVED'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        await client.query(
          `INSERT INTO visit_tests (visit_id, test_template_id, status)
           VALUES ($1, $2, $3)`,
          [visitId, templateId, status]
        );
      }
    }

    console.log(`✅ Created ${visitCount} visits with tests`);
    console.log('✅ Test data added successfully!');
  } catch (error) {
    console.error('❌ Error adding test data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

addTestData().catch(console.error);

