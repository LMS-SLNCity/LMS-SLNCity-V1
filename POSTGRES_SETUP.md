# PostgreSQL Setup Guide

## Overview

This project has been configured to use PostgreSQL instead of mock data. The setup includes:

- **Docker PostgreSQL** instance running on port 5432
- **Node.js/Express backend** API server running on port 5001
- **React frontend** running on port 3000
- **Complete database schema** with all required tables

## Quick Start

### 1. Start PostgreSQL with Docker

```bash
cd /Users/ramgopal/LMS-SLNCity-V1
docker compose up -d
```

This will:
- Start a PostgreSQL 16 Alpine container
- Create the `lms_user` and `lms_slncity` database
- Initialize all database tables and indexes

### 2. Start the Backend Server

```bash
cd /Users/ramgopal/LMS-SLNCity-V1/server
nvm use 18
npm install  # if not already installed
npm run dev
```

The backend will be available at: `http://localhost:5001`

Health check endpoint: `http://localhost:5001/health`

### 3. Start the Frontend

In a new terminal:

```bash
cd /Users/ramgopal/LMS-SLNCity-V1
nvm use 18
npm run dev
```

The frontend will be available at: `http://localhost:3000`

## Database Credentials

- **Host**: localhost (or 10.89.1.2 from inside containers)
- **Port**: 5432
- **User**: lms_user
- **Password**: lms_password
- **Database**: lms_slncity

## Database Schema

The following tables are created:

- `users` - User accounts with roles
- `test_templates` - Lab test definitions
- `antibiotics` - Antibiotic database for culture tests
- `clients` - Referral labs and patients
- `client_prices` - Custom pricing per client
- `patients` - Patient information
- `referral_doctors` - Doctor references
- `signatories` - Report signatories
- `visits` - Patient visits
- `visit_tests` - Individual tests within visits
- `ledger_entries` - Financial transactions
- `audit_logs` - System audit trail

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user

### Test Templates
- `GET /api/test-templates` - List all test templates
- `POST /api/test-templates` - Create test template
- `PATCH /api/test-templates/:id` - Update test template
- `DELETE /api/test-templates/:id` - Delete test template

### Antibiotics
- `GET /api/antibiotics` - List all antibiotics
- `POST /api/antibiotics` - Create antibiotic
- `PATCH /api/antibiotics/:id` - Update antibiotic
- `DELETE /api/antibiotics/:id` - Delete antibiotic

### Clients
- `GET /api/clients` - List all clients
- `GET /api/clients/:id/prices` - Get client prices
- `POST /api/clients/:id/prices` - Update client prices

### Patients
- `GET /api/patients` - List all patients
- `POST /api/patients` - Create patient
- `PATCH /api/patients/:id` - Update patient

### Visits
- `GET /api/visits` - List all visits
- `POST /api/visits` - Create visit
- `PATCH /api/visits/:id` - Update visit

### Visit Tests
- `GET /api/visit-tests` - List all visit tests
- `POST /api/visit-tests` - Create visit test
- `PATCH /api/visit-tests/:id` - Update visit test

### Signatories
- `GET /api/signatories` - List all signatories

### Referral Doctors
- `GET /api/referral-doctors` - List all referral doctors

### Audit Logs
- `GET /api/audit-logs` - List audit logs
- `POST /api/audit-logs` - Create audit log

## Seeding Data

The database is automatically seeded with initial data when the Docker container starts:

- 6 users (sudo, admin, reception, phlebo, labtech, approver)
- 18 antibiotics
- 10 test templates
- 4 referral doctors
- 4 clients
- 4 signatories
- 2 sample patients

To manually seed additional data, connect to the database:

```bash
docker exec -it lms-slncity-postgres psql -U lms_user -d lms_slncity
```

## Troubleshooting

### PostgreSQL Connection Issues

If you get "role does not exist" errors:

1. Check if the container is running:
   ```bash
   docker ps | grep lms-slncity-postgres
   ```

2. Check container logs:
   ```bash
   docker logs lms-slncity-postgres
   ```

3. Restart the container:
   ```bash
   docker compose down -v
   docker compose up -d
   ```

### Backend Connection Issues

If the backend can't connect to PostgreSQL:

1. Verify the database is running
2. Check the `.env` file in the `server` directory
3. Ensure the port 5432 is not blocked

### Frontend API Calls

The frontend API client is located at `/api/client.ts`. It uses:
- Base URL: `http://localhost:5001/api`
- All requests use JSON content type

## Next Steps

1. **Integrate API calls in AppContext** - Replace mock data imports with API calls
2. **Update components** - Modify components to use the API client
3. **Add error handling** - Implement proper error handling for API failures
4. **Add loading states** - Show loading indicators during API calls
5. **Implement authentication** - Use the login endpoint to authenticate users

## File Structure

```
/Users/ramgopal/LMS-SLNCity-V1/
├── docker-compose.yml          # Docker configuration
├── server/                      # Backend
│   ├── src/
│   │   ├── index.ts            # Express server
│   │   ├── db/
│   │   │   ├── connection.ts    # Database connection
│   │   │   ├── init.sql         # Schema initialization
│   │   │   └── setup-db.sh      # Database setup script
│   │   └── routes/              # API endpoints
│   ├── .env                     # Backend configuration
│   └── package.json
├── api/
│   ├── client.ts                # Frontend API client
│   └── mock.ts                  # Legacy mock data (deprecated)
└── ...frontend files
```

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5001)
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_USER` - Database user (default: lms_user)
- `DB_PASSWORD` - Database password (default: lms_password)
- `DB_NAME` - Database name (default: lms_slncity)
- `NODE_ENV` - Environment (default: development)

## Support

For issues or questions, refer to the main README.md or check the database logs.

