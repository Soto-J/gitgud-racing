CREATE TABLE IF NOT EXISTS `account` (
	`id` varchar(36) NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`scope` text,
	`password` text,
	`id_token` text,
	`access_token` text,
	`refresh_token` text,
	`access_token_expires_at` timestamp,
	`refresh_token_expires_at` timestamp,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `iracing_auth` (
	`id` varchar(21) NOT NULL,
	`auth_code` text NOT NULL,
	`sso_cookie_value` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`expires_at` timestamp,
	CONSTRAINT `iracing_auth_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `license` (
	`id` varchar(21) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`oval_i_rating` int,
	`oval_safety_rating` decimal(4,2),
	`oval_license_class` enum('A','B','C','D','R') NOT NULL DEFAULT 'R',
	`sports_car_i_rating` int,
	`sports_car_safety_rating` decimal(4,2),
	`sports_license_class` enum('A','B','C','D','R') NOT NULL DEFAULT 'R',
	`formula_car_i_rating` int,
	`formula_car_safety_rating` decimal(4,2),
	`formula_license_class` enum('A','B','C','D','R') NOT NULL DEFAULT 'R',
	`dirt_oval_i_rating` int,
	`dirt_oval_safety_rating` decimal(4,2),
	`dirt_oval_license_class` enum('A','B','C','D','R') NOT NULL DEFAULT 'R',
	`dirt_road_i_rating` int,
	`dirt_road_safety_rating` decimal(4,2),
	`dirt_road_license_class` enum('A','B','C','D','R') NOT NULL DEFAULT 'R',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `license_id` PRIMARY KEY(`id`),
	CONSTRAINT `license_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `profile` (
	`id` varchar(21) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`iracing_id` varchar(10),
	`is_active` boolean NOT NULL DEFAULT false,
	`discord` varchar(37) DEFAULT '',
	`team` varchar(20) DEFAULT '',
	`bio` text DEFAULT (''),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profile_id` PRIMARY KEY(`id`),
	CONSTRAINT `profile_user_id_unique` UNIQUE(`user_id`),
	CONSTRAINT `profile_iracing_id_unique` UNIQUE(`iracing_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `series` (
	`series_id` int NOT NULL,
	`category` varchar(25) NOT NULL,
	`series_name` varchar(100) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `series_series_id` PRIMARY KEY(`series_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `series_weekly_stats` (
	`id` varchar(21) NOT NULL,
	`series_id` int,
	`season_id` int,
	`session_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`season_year` int NOT NULL,
	`season_quarter` int NOT NULL,
	`race_week` int NOT NULL,
	`track_name` varchar(100),
	`start_time` varchar(30) NOT NULL,
	`total_splits` int NOT NULL,
	`total_drivers` int NOT NULL,
	`strength_of_field` int NOT NULL,
	`average_entrants` decimal(5,2) NOT NULL,
	`average_splits` decimal(5,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `series_weekly_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `series_weekly_stats_session_id_unique` UNIQUE(`session_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `session` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token` varchar(255) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`impersonated_by` text,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `user` (
	`id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL,
	`image` text,
	`role` enum('admin','staff','member') NOT NULL DEFAULT 'member',
	`banned` boolean,
	`ban_reason` text,
	`ban_expires` timestamp,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `verification` (
	`id` varchar(36) NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp,
	`updated_at` timestamp,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `license` ADD CONSTRAINT `license_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profile` ADD CONSTRAINT `profile_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `series_weekly_stats` ADD CONSTRAINT `series_weekly_stats_series_id_series_series_id_fk` FOREIGN KEY (`series_id`) REFERENCES `series`(`series_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_chart_data` ADD CONSTRAINT `user_chart_data_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;