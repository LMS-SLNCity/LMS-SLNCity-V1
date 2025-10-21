-- Add visit code generation to existing database
-- This script adds the sequence, functions, and trigger for auto-generating visit codes

-- Drop existing objects if they exist
DROP TRIGGER IF EXISTS visit_code_trigger ON visits;
DROP FUNCTION IF EXISTS set_visit_code();
DROP FUNCTION IF EXISTS generate_visit_code();
DROP SEQUENCE IF EXISTS visit_code_seq;

-- Create sequence for visit code generation
CREATE SEQUENCE visit_code_seq START 1 INCREMENT 1;

-- Function to generate visit code
CREATE OR REPLACE FUNCTION generate_visit_code()
RETURNS VARCHAR AS $$
DECLARE
    v_code VARCHAR;
    v_date_part VARCHAR;
    v_seq_num INTEGER;
BEGIN
    -- Get current date in YYYYMMDD format
    v_date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    
    -- Get next sequence number
    v_seq_num := NEXTVAL('visit_code_seq');
    
    -- Generate code: V{YYYYMMDD}{SEQUENCE}
    v_code := 'V' || v_date_part || LPAD(v_seq_num::TEXT, 4, '0');
    
    RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate visit code
CREATE OR REPLACE FUNCTION set_visit_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.visit_code = '' OR NEW.visit_code IS NULL THEN
        NEW.visit_code := generate_visit_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER visit_code_trigger
BEFORE INSERT ON visits
FOR EACH ROW
EXECUTE FUNCTION set_visit_code();

