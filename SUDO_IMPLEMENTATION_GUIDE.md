# SUDO Features - Implementation Guide

## Database Schema Additions

### 1. Organization Settings Table
```sql
CREATE TABLE organization_settings (
    id SERIAL PRIMARY KEY,
    lab_name VARCHAR(255) NOT NULL,
    lab_logo_url VARCHAR(500),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    gst_number VARCHAR(50),
    registration_number VARCHAR(100),
    report_header TEXT,
    report_footer TEXT,
    email_smtp_host VARCHAR(255),
    email_smtp_port INTEGER,
    email_from_address VARCHAR(255),
    sms_gateway_provider VARCHAR(50),
    sms_api_key VARCHAR(255),
    currency VARCHAR(10) DEFAULT 'INR',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. User Activity Log Table
```sql
CREATE TABLE user_activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_activity_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_created_at ON user_activity_logs(created_at);
```

### 3. Backup History Table
```sql
CREATE TABLE backup_history (
    id SERIAL PRIMARY KEY,
    backup_name VARCHAR(255) NOT NULL,
    backup_size BIGINT,
    backup_path VARCHAR(500),
    backup_type VARCHAR(50), -- FULL, INCREMENTAL
    status VARCHAR(20), -- PENDING, IN_PROGRESS, COMPLETED, FAILED
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. API Keys Table
```sql
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    secret_key VARCHAR(255) NOT NULL,
    scope TEXT[], -- Array of permissions
    rate_limit INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. System Health Metrics Table
```sql
CREATE TABLE system_health_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC,
    metric_unit VARCHAR(50),
    threshold_warning NUMERIC,
    threshold_critical NUMERIC,
    status VARCHAR(20), -- OK, WARNING, CRITICAL
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_metrics_name ON system_health_metrics(metric_name);
CREATE INDEX idx_health_metrics_recorded_at ON system_health_metrics(recorded_at);
```

---

## Backend API Endpoints

### Organization Settings
```typescript
// GET /api/sudo/settings
router.get('/settings', requireRole(['SUDO']), async (req, res) => {
  const result = await pool.query('SELECT * FROM organization_settings LIMIT 1');
  res.json(result.rows[0] || {});
});

// PATCH /api/sudo/settings
router.patch('/settings', requireRole(['SUDO']), async (req, res) => {
  const { lab_name, address, phone, email, ... } = req.body;
  const result = await pool.query(
    `UPDATE organization_settings SET lab_name=$1, address=$2, ... 
     WHERE id=1 RETURNING *`,
    [lab_name, address, ...]
  );
  res.json(result.rows[0]);
});
```

### User Activity Logs
```typescript
// GET /api/sudo/activity-logs
router.get('/activity-logs', requireRole(['SUDO']), async (req, res) => {
  const { user_id, action, limit = 100, offset = 0 } = req.query;
  let query = 'SELECT * FROM user_activity_logs WHERE 1=1';
  const params = [];
  
  if (user_id) {
    query += ` AND user_id = $${params.length + 1}`;
    params.push(user_id);
  }
  
  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);
  
  const result = await pool.query(query, params);
  res.json(result.rows);
});
```

### Backup Management
```typescript
// POST /api/sudo/backups/create
router.post('/backups/create', requireRole(['SUDO']), async (req, res) => {
  const backup_name = `backup_${new Date().toISOString()}`;
  
  // Insert backup record
  const result = await pool.query(
    `INSERT INTO backup_history (backup_name, status, created_by) 
     VALUES ($1, 'IN_PROGRESS', $2) RETURNING id`,
    [backup_name, req.user.id]
  );
  
  // Trigger backup job (async)
  triggerBackupJob(result.rows[0].id);
  
  res.json({ message: 'Backup started', backup_id: result.rows[0].id });
});

// GET /api/sudo/backups
router.get('/backups', requireRole(['SUDO']), async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM backup_history ORDER BY created_at DESC LIMIT 50'
  );
  res.json(result.rows);
});
```

### System Health
```typescript
// GET /api/sudo/health
router.get('/health', requireRole(['SUDO']), async (req, res) => {
  const metrics = await pool.query(
    `SELECT metric_name, metric_value, metric_unit, status 
     FROM system_health_metrics 
     WHERE recorded_at > NOW() - INTERVAL '1 hour'
     ORDER BY recorded_at DESC`
  );
  
  res.json({
    database_size: await getDatabaseSize(),
    active_connections: await getActiveConnections(),
    api_response_time: await getAvgResponseTime(),
    error_rate: await getErrorRate(),
    metrics: metrics.rows
  });
});
```

### API Key Management
```typescript
// POST /api/sudo/api-keys
router.post('/api-keys', requireRole(['SUDO']), async (req, res) => {
  const { key_name, scope, rate_limit } = req.body;
  const api_key = generateRandomKey(32);
  const secret_key = generateRandomKey(64);
  
  const result = await pool.query(
    `INSERT INTO api_keys (key_name, api_key, secret_key, scope, rate_limit, created_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, key_name, api_key`,
    [key_name, api_key, secret_key, scope, rate_limit, req.user.id]
  );
  
  res.json(result.rows[0]);
});

// DELETE /api/sudo/api-keys/:id
router.delete('/api-keys/:id', requireRole(['SUDO']), async (req, res) => {
  await pool.query('DELETE FROM api_keys WHERE id = $1', [req.params.id]);
  res.json({ message: 'API key deleted' });
});
```

---

## Frontend Components Structure

### SudoSettings.tsx
```typescript
export const SudoSettings: React.FC = () => {
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    const response = await fetch('/api/sudo/settings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setSettings(await response.json());
  };
  
  const handleSave = async () => {
    setIsLoading(true);
    await fetch('/api/sudo/settings', {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(settings)
    });
    setIsLoading(false);
  };
  
  return (
    <div className="space-y-6">
      <h2>Organization Settings</h2>
      {/* Form fields */}
      <button onClick={handleSave} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
};
```

---

## Permission Checks

### Middleware
```typescript
// Ensure SUDO-only access
export const requireSudo = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'SUDO') {
    return res.status(403).json({ error: 'SUDO access required' });
  }
  next();
};
```

### Frontend
```typescript
const { user } = useAuth();

if (user?.role !== 'SUDO') {
  return <div>Access Denied</div>;
}
```

---

## Activity Logging Helper

```typescript
async function logActivity(
  userId: number,
  action: string,
  entityType: string,
  entityId: number,
  oldValues?: any,
  newValues?: any,
  ipAddress?: string
) {
  await pool.query(
    `INSERT INTO user_activity_logs 
     (user_id, action, entity_type, entity_id, old_values, new_values, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [userId, action, entityType, entityId, oldValues, newValues, ipAddress]
  );
}
```

---

## Next Steps

1. Create database tables
2. Implement backend endpoints
3. Build frontend components
4. Add permission checks
5. Test thoroughly
6. Deploy to production

