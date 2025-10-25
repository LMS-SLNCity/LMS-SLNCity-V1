-- Migration: Add approvers system for dynamic report signatories
-- Date: 2025-10-25
-- Description: Creates approvers table and links it to users and visit_tests

-- ============================================================================
-- STEP 1: Create approvers table
-- ============================================================================
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

-- ============================================================================
-- STEP 2: Add indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_approvers_user_id ON approvers(user_id);
CREATE INDEX IF NOT EXISTS idx_approvers_is_active ON approvers(is_active);
CREATE INDEX IF NOT EXISTS idx_approvers_display_order ON approvers(display_order);

-- ============================================================================
-- STEP 3: Add approver_id column to visit_tests
-- ============================================================================
ALTER TABLE visit_tests ADD COLUMN IF NOT EXISTS approver_id INTEGER REFERENCES approvers(id) ON DELETE SET NULL;

-- ============================================================================
-- STEP 4: Add index on new column
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_visit_tests_approver_id ON visit_tests(approver_id);

-- ============================================================================
-- STEP 5: Insert default approvers
-- ============================================================================
INSERT INTO approvers (name, title, role, display_order, show_on_print, is_active) VALUES
('DR MISBHA LATEEFA, MD', 'Consultant Pathologist', 'pathologist', 1, true, true),
('T.V. SUBBARAO', 'M.Sc., Bio-Chemist', 'biochemist', 2, true, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 6: Create view for easy querying
-- ============================================================================
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

-- ============================================================================
-- STEP 7: Add comments for documentation
-- ============================================================================
COMMENT ON TABLE approvers IS 'Stores information about report approvers/signatories. Each approver can be linked to a user account.';
COMMENT ON COLUMN approvers.user_id IS 'Optional link to users table. When a user approves a test, their approver record is used for the signature.';
COMMENT ON COLUMN approvers.display_order IS 'Order in which approvers appear on the report (1 = leftmost, 2 = middle, etc.)';
COMMENT ON COLUMN approvers.show_on_print IS 'Whether this approver should be shown on printed reports';
COMMENT ON COLUMN visit_tests.approver_id IS 'References the approver who approved this test. Replaces the old approved_by string field.';

