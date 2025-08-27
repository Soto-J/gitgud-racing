-- Rollback Script
-- Use this ONLY if the selective migration fails and you need to revert changes

-- Step 1: Drop foreign key constraint
ALTER TABLE `series_weekly_stats` DROP FOREIGN KEY IF EXISTS `series_weekly_stats_series_id_series_series_id_fk`;

-- Step 2: Revert series_weekly_stats columns back to varchar
ALTER TABLE `series_weekly_stats` MODIFY COLUMN `series_id` varchar(36);
ALTER TABLE `series_weekly_stats` MODIFY COLUMN `season_id` varchar(100);
ALTER TABLE `series_weekly_stats` MODIFY COLUMN `session_id` varchar(100) NOT NULL;

-- Step 3: Revert series.series_id back to varchar
ALTER TABLE `series` MODIFY COLUMN `series_id` varchar(36) NOT NULL;

-- Step 4: Re-create foreign key constraint with varchar reference
ALTER TABLE `series_weekly_stats` ADD CONSTRAINT `series_weekly_stats_series_id_series_series_id_fk` 
FOREIGN KEY (`series_id`) REFERENCES `series`(`series_id`) ON DELETE cascade ON UPDATE no action;

-- Step 5: Drop user_chart_data table if needed
-- DROP TABLE IF EXISTS `user_chart_data`;

SELECT 'Rollback completed' as status;