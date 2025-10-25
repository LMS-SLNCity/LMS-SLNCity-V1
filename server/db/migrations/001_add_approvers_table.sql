-- Migration: Add approvers table and update visit_tests
-- This migration creates a proper approvers system where multiple approvers can be configured
-- and their information is displayed on reports

-- Step 1: Create approvers table
CREATE TABLE IF NOT EXISTS approvers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('pathologist', 'biochemist', 'microbiologist', 'lab_director', 'quality_head', 'other')),
    display_order INTEGER NOT NULL DEFAULT 1,
    show_on_print BOOLEAN DEFAULT true,
    signature_image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Add index for better query performance
CREATE INDEX idx_approvers_user_id ON approvers(user_id);
CREATE INDEX idx_approvers_is_active ON approvers(is_active);
CREATE INDEX idx_approvers_display_order ON approvers(display_order);

-- Step 3: Alter visit_tests table to reference approvers
-- First, add new column
ALTER TABLE visit_tests ADD COLUMN IF NOT EXISTS approver_id INTEGER REFERENCES approvers(id) ON DELETE SET NULL;

-- Step 4: Create index on new column
CREATE INDEX idx_visit_tests_approver_id ON visit_tests(approver_id);

-- Step 5: Insert default approvers (Dr. Misbha Lateefa and T.V. Subbarao)
INSERT INTO approvers (name, title, role, display_order, show_on_print, is_active) VALUES
('DR MISBHA LATEEFA, MD', 'Consultant Pathologist', 'pathologist', 1, true, true),
('T.V. SUBBARAO', 'M.Sc., Bio-Chemist', 'biochemist', 2, true, true);

-- Step 6: Update existing users table to link with approvers
-- Link 'sudo' user to first approver (will be updated later)
-- Link 'approver' user to first approver
UPDATE users SET signature_image_url = NULL WHERE username IN ('sudo', 'approver');

-- Step 7: Create a view for easy querying of approvers with user info
CREATE OR REPLACE VIEW approvers_with_users AS
SELECT 
    a.id,
    a.user_id,
    a.name,
    a.title,
    a.role,
    a.display_order,
    a.show_on_print,
    a.signature_image_url,
    a.is_active,
    u.username,
    u.role as user_role
FROM approvers a
LEFT JOIN users u ON a.user_id = u.id
WHERE a.is_active = true
ORDER BY a.display_order;

-- Step 8: Add comment to explain the migration
COMMENT ON TABLE approvers IS 'Stores information about report approvers/signatories. Each approver can be linked to a user account.';
COMMENT ON COLUMN approvers.user_id IS 'Optional link to users table. When a user approves a test, their approver record is used for the signature.';
COMMENT ON COLUMN approvers.display_order IS 'Order in which approvers appear on the report (1 = leftmost, 2 = middle, etc.)';
COMMENT ON COLUMN approvers.show_on_print IS 'Whether this approver should be shown on printed reports';
COMMENT ON COLUMN visit_tests.approver_id IS 'References the approver who approved this test. Replaces the old approved_by string field.';

