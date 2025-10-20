#!/bin/bash
set -e

echo "Creating lms_user and lms_slncity database..."

psql -v ON_ERROR_STOP=1 --username "postgres" <<-EOSQL
    CREATE USER lms_user WITH ENCRYPTED PASSWORD 'lms_password';
    CREATE DATABASE lms_slncity OWNER lms_user;
    GRANT ALL PRIVILEGES ON DATABASE lms_slncity TO lms_user;
    ALTER USER lms_user WITH CREATEDB;
EOSQL

echo "Running schema initialization..."
psql -v ON_ERROR_STOP=1 --username "lms_user" --dbname "lms_slncity" < /docker-entrypoint-initdb.d/init.sql

echo "Database setup complete!"

