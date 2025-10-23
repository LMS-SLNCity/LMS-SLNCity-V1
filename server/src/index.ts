import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db/connection.js';

// Import routes
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import testTemplatesRoutes from './routes/testTemplates.js';
import antibioticsRoutes from './routes/antibiotics.js';
import clientsRoutes from './routes/clients.js';
import patientsRoutes from './routes/patients.js';
import visitsRoutes from './routes/visits.js';
import visitTestsRoutes from './routes/visitTests.js';
import signatariesRoutes from './routes/signatories.js';
import referralDoctorsRoutes from './routes/referralDoctors.js';
import auditLogsRoutes from './routes/auditLogs.js';
import branchesRoutes from './routes/branches.js';
import signaturesRoutes from './routes/signatures.js';
import dashboardRoutes from './routes/dashboard.js';
import rolePermissionsRoutes from './routes/rolePermissions.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public')); // Serve static files (signatures, etc.)

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', timestamp: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/test-templates', testTemplatesRoutes);
app.use('/api/antibiotics', antibioticsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/visit-tests', visitTestsRoutes);
app.use('/api/signatories', signatariesRoutes);
app.use('/api/referral-doctors', referralDoctorsRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/signatures', signaturesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/role-permissions', rolePermissionsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

