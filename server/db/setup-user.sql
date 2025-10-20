-- Create user and database
CREATE USER lms_user WITH PASSWORD 'lms_password';
CREATE DATABASE lms_slncity OWNER lms_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE lms_slncity TO lms_user;
ALTER USER lms_user CREATEDB;

