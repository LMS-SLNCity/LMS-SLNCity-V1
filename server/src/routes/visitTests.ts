import express, { Request, Response } from 'express';
import pool from '../db/connection.js';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT vt.id, vt.visit_id, vt.test_template_id, vt.status, vt.collected_by, vt.collected_at, vt.specimen_type,
              vt.results, vt.culture_result, vt.approved_by, vt.approved_at,
              tt.id as template_id, tt.code, tt.name, tt.category, tt.price, tt.b2b_price, tt.is_active, tt.report_type, tt.parameters, tt.default_antibiotic_ids,
              v.visit_code, p.name as patient_name
       FROM visit_tests vt
       JOIN test_templates tt ON vt.test_template_id = tt.id
       JOIN visits v ON vt.visit_id = v.id
       JOIN patients p ON v.patient_id = p.id
       ORDER BY vt.created_at DESC`
    );
    res.json(result.rows.map(row => ({
      id: row.id,
      visitId: row.visit_id,
      patientName: row.patient_name,
      visitCode: row.visit_code,
      template: {
        id: row.template_id,
        code: row.code,
        name: row.name,
        category: row.category,
        price: row.price,
        b2b_price: row.b2b_price,
        isActive: row.is_active,
        reportType: row.report_type,
        parameters: typeof row.parameters === 'string' ? JSON.parse(row.parameters) : row.parameters,
        defaultAntibioticIds: row.default_antibiotic_ids,
      },
      status: row.status,
      collectedBy: row.collected_by,
      collectedAt: row.collected_at,
      specimen_type: row.specimen_type,
      results: row.results,
      cultureResult: row.culture_result,
      approvedBy: row.approved_by,
      approvedAt: row.approved_at,
    })));
  } catch (error) {
    console.error('Error fetching visit tests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT vt.id, vt.visit_id, vt.test_template_id, vt.status, vt.collected_by, vt.collected_at, vt.specimen_type,
              vt.results, vt.culture_result, vt.approved_by, vt.approved_at,
              tt.id as template_id, tt.code, tt.name, tt.category, tt.price, tt.b2b_price, tt.is_active, tt.report_type, tt.parameters, tt.default_antibiotic_ids,
              v.visit_code, p.name as patient_name
       FROM visit_tests vt
       JOIN test_templates tt ON vt.test_template_id = tt.id
       JOIN visits v ON vt.visit_id = v.id
       JOIN patients p ON v.patient_id = p.id
       WHERE vt.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Visit test not found' });
    
    const row = result.rows[0];
    res.json({
      id: row.id,
      visitId: row.visit_id,
      patientName: row.patient_name,
      visitCode: row.visit_code,
      template: {
        id: row.template_id,
        code: row.code,
        name: row.name,
        category: row.category,
        price: row.price,
        b2b_price: row.b2b_price,
        isActive: row.is_active,
        reportType: row.report_type,
        parameters: typeof row.parameters === 'string' ? JSON.parse(row.parameters) : row.parameters,
        defaultAntibioticIds: row.default_antibiotic_ids,
      },
      status: row.status,
      collectedBy: row.collected_by,
      collectedAt: row.collected_at,
      specimen_type: row.specimen_type,
      results: row.results,
      cultureResult: row.culture_result,
      approvedBy: row.approved_by,
      approvedAt: row.approved_at,
    });
  } catch (error) {
    console.error('Error fetching visit test:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { visit_id, test_template_id } = req.body;
    const result = await pool.query(
      `INSERT INTO visit_tests (visit_id, test_template_id, status)
       VALUES ($1, $2, 'PENDING')
       RETURNING id, visit_id, test_template_id, status`,
      [visit_id, test_template_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating visit test:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { status, collected_by, collected_at, specimen_type, results, culture_result, approved_by, approved_at } = req.body;
    const result = await pool.query(
      `UPDATE visit_tests
       SET status = COALESCE($1, status),
           collected_by = COALESCE($2, collected_by),
           collected_at = COALESCE($3, collected_at),
           specimen_type = COALESCE($4, specimen_type),
           results = COALESCE($5, results),
           culture_result = COALESCE($6, culture_result),
           approved_by = COALESCE($7, approved_by),
           approved_at = COALESCE($8, approved_at),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING id, visit_id, test_template_id, status, collected_by, collected_at, specimen_type, results, culture_result, approved_by, approved_at`,
      [status, collected_by, collected_at, specimen_type, results ? JSON.stringify(results) : null, culture_result ? JSON.stringify(culture_result) : null, approved_by, approved_at, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Visit test not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating visit test:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

