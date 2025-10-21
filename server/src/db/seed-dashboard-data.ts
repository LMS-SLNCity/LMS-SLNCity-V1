import pool from './connection.js';

const seedDashboardData = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('🔄 Seeding dashboard test data...');

    // Create test patients
    const patientIds: number[] = [];
    for (let i = 1; i <= 5; i++) {
      const result = await client.query(
        `INSERT INTO patients (name, phone, email, age, gender, address)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [
          `Patient ${i}`,
          `999999999${i}`,
          `patient${i}@test.com`,
          25 + i * 5,
          i % 2 === 0 ? 'M' : 'F',
          `Address ${i}`,
        ]
      );
      patientIds.push(result.rows[0].id);
    }

    // Get B2B client IDs
    const clientResult = await client.query(
      "SELECT id FROM clients WHERE type = 'REFERRAL_LAB' LIMIT 2"
    );
    const clientIds = clientResult.rows.map((r: any) => r.id);

    // Get test template IDs
    const templateResult = await client.query(
      'SELECT id FROM test_templates LIMIT 5'
    );
    const templateIds = templateResult.rows.map((r: any) => r.id);

    // Create visits with different dates and statuses
    const statuses = ['PENDING', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'APPROVED'];
    let visitCount = 0;

    for (let i = 0; i < 10; i++) {
      const patientId = patientIds[i % patientIds.length];
      const clientId = clientIds[i % clientIds.length];
      const totalCost = 500 + Math.random() * 2000;
      const dueAmount = Math.random() > 0.7 ? Math.random() * 500 : 0;
      const daysAgo = Math.floor(Math.random() * 30);

      const visitResult = await client.query(
        `INSERT INTO visits (patient_id, ref_customer_id, total_cost, due_amount, payment_mode, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '${daysAgo} days')
         RETURNING id`,
        [patientId, clientId, totalCost, dueAmount, 'CASH']
      );

      const visitId = visitResult.rows[0].id;
      visitCount++;

      // Add 2-4 tests to each visit
      const testCount = 2 + Math.floor(Math.random() * 3);
      for (let j = 0; j < testCount; j++) {
        const templateId = templateIds[j % templateIds.length];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        await client.query(
          `INSERT INTO visit_tests (visit_id, test_template_id, status, created_at)
           VALUES ($1, $2, $3, NOW() - INTERVAL '${daysAgo} days')`,
          [visitId, templateId, status]
        );
      }
    }

    await client.query('COMMIT');
    console.log(`✅ Dashboard data seeded successfully!`);
    console.log(`   - Created ${patientIds.length} patients`);
    console.log(`   - Created ${visitCount} visits`);
    console.log(`   - Created ~${visitCount * 3} tests`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding dashboard data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

seedDashboardData().catch(console.error);

