import pool from './connection.js';
import { Pool } from 'pg';

const seedData = async () => {
  // First, connect as postgres to create the lms_user if it doesn't exist
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

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Note: Users should be created through the admin panel or API
    // No default users are seeded to production database

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

    // Note: Referral doctors should be created through the admin panel or API
    // No default referral doctors are seeded

    // Note: B2B clients should be created through the admin panel or API
    // No default clients are seeded

    // Note: Signatories should be created through the admin panel or API
    // No default signatories are seeded

    // Note: Patients should be created through the reception panel or API
    // No default patients are seeded

    await client.query('COMMIT');
    console.log('✅ Database seeded successfully!');
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

