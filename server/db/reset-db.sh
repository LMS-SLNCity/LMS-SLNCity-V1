#!/bin/bash
set -e

echo "Resetting database..."

# Drop and recreate database (using TCP connection)
psql -v ON_ERROR_STOP=1 --host "localhost" --username "postgres" <<-EOSQL
    DROP DATABASE IF EXISTS lms_slncity;
    CREATE DATABASE lms_slncity OWNER lms_user;
    GRANT ALL PRIVILEGES ON DATABASE lms_slncity TO lms_user;
EOSQL

echo "Running schema initialization..."
psql -v ON_ERROR_STOP=1 --host "localhost" --username "lms_user" --dbname "lms_slncity" < "$(dirname "$0")/init.sql"

echo "Seeding data..."
psql -v ON_ERROR_STOP=1 --host "localhost" --username "lms_user" --dbname "lms_slncity" < "$(dirname "$0")/seed-all-data.sql"

echo "Database reset and seeded successfully!"

