-- Historical local-drift repair migration.
-- Kept as a no-op for fresh cloud deployments because the later migrations add
-- StudentProfile.phoneNumber and AuditLog in their final supported shape.
SELECT 1;
