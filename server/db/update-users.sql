-- Update users with correct credentials
DELETE FROM users;
INSERT INTO users (username, password_hash, role, is_active) VALUES
('sudo', '$2a$10$oSEV8ODFQCz35c7OiLvwkOz8L0NULCsVbqKjpGmcMAvc2ebnabG7i', 'SUDO', true),
('admin', '$2a$10$mU8N2yb9sdzgVwz9mlV8EuLE442gE1HDfWbfDXj9iZxx7ef4bLXz2', 'ADMIN', true),
('reception', '$2a$10$MHXalBbTRJtoFl5zCkNpAeFbdwibMpdu5l0ks6MgMl3D9j3mIllAi', 'RECEPTION', true),
('phlebo', '$2a$10$3YFVmtnRZrq0vdA0MMkggezyYvLdH9Q1uX22U3dOTpuaudhcFvke.', 'PHLEBOTOMY', true),
('labtech', '$2a$10$zuxMB35YXHngnd817dlQNu6BPpOOhWBhHcAnKwcoH0fMeAlrUS0j2', 'LAB', true),
('approver', '$2a$10$Bn7b0iHbbU98UJPU0e0WK.DA7a/8OlSXPHVp/SeGNrkaIJRLnDHUu', 'APPROVER', true);

