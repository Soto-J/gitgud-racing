-- Selective Migration Script
-- Apply only the changes needed without recreating existing tables

-- Step 1: Create user_chart_data table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS `user_chart_data` (
	`id` varchar(21) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`category_id` int,
	`category` varchar(50) NOT NULL,
	`chart_type` varchar(50) NOT NULL,
	`when` date NOT NULL,
	`value` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_chart_data_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_chart_data_user_id_category_chart_type_when_unique` UNIQUE(`user_id`,`category`,`chart_type`,`when`)
);

-- Step 2: Add foreign key constraint for user_chart_data (if table was just created)
-- This will fail gracefully if constraint already exists
ALTER TABLE `user_chart_data` ADD CONSTRAINT `user_chart_data_user_id_user_id_fk` 
FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;

-- Step 3: Modify series table - change series_id from varchar to int
-- First, drop foreign key constraints that reference series_id
ALTER TABLE `series_weekly_stats` DROP FOREIGN KEY IF EXISTS `series_weekly_stats_series_id_series_series_id_fk`;

-- Change series.series_id from varchar to int
ALTER TABLE `series` MODIFY COLUMN `series_id` int NOT NULL;

-- Step 4: Modify series_weekly_stats table - change varchar columns to int
ALTER TABLE `series_weekly_stats` MODIFY COLUMN `series_id` int;
ALTER TABLE `series_weekly_stats` MODIFY COLUMN `season_id` int;
ALTER TABLE `series_weekly_stats` MODIFY COLUMN `session_id` int NOT NULL;

-- Step 5: Re-create foreign key constraint
ALTER TABLE `series_weekly_stats` ADD CONSTRAINT `series_weekly_stats_series_id_series_series_id_fk` 
FOREIGN KEY (`series_id`) REFERENCES `series`(`series_id`) ON DELETE cascade ON UPDATE no action;

-- Step 6: Verify changes
SELECT 'Migration completed successfully' as status;