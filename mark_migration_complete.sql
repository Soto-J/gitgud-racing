-- Mark the Drizzle migration as completed
-- Run this AFTER successfully applying selective_migration.sql

-- First, check if __drizzle_migrations table exists, if not create it
CREATE TABLE IF NOT EXISTS `__drizzle_migrations` (
    `id` SERIAL PRIMARY KEY,
    `hash` text NOT NULL,
    `created_at` bigint
);

-- Mark the migration as completed
-- Replace 'naive_slyde' with the actual hash from your migration file
INSERT INTO `__drizzle_migrations` (`hash`, `created_at`) 
VALUES ('naive_slyde', UNIX_TIMESTAMP() * 1000)
ON DUPLICATE KEY UPDATE `created_at` = `created_at`;

SELECT 'Migration marked as complete' as status;