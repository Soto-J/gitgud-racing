CREATE TABLE `account` (
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
CREATE TABLE `session` (
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
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`email` varchar(255),
	`email_verified` boolean NOT NULL,
	`image` text,
	`role` enum('admin','staff','user','guest') NOT NULL DEFAULT 'user',
	`banned` boolean,
	`ban_reason` text,
	`ban_expires` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(36) NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp,
	`updated_at` timestamp,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `league_schedule` (
	`id` varchar(21) NOT NULL,
	`season_number` int NOT NULL,
	`track_name` varchar(50) NOT NULL,
	`date` timestamp NOT NULL,
	`temp` int NOT NULL,
	`race_length` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `league_schedule_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `series_weekly_stats` (
	`id` varchar(21) NOT NULL,
	`series_id` int NOT NULL,
	`season_id` int NOT NULL,
	`session_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`track_name` varchar(100) NOT NULL,
	`season_year` int NOT NULL,
	`season_quarter` int NOT NULL DEFAULT 1,
	`race_week` int NOT NULL DEFAULT 0,
	`official_session` boolean NOT NULL DEFAULT true,
	`start_time` datetime NOT NULL,
	`total_splits` int NOT NULL,
	`total_drivers` int NOT NULL,
	`strength_of_field` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `series_weekly_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `weekly_series_unique` UNIQUE(`series_id`,`season_year`,`season_quarter`,`race_week`)
);
--> statement-breakpoint
CREATE TABLE `user_chart_data` (
	`id` varchar(21) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`category_id` int NOT NULL,
	`category` varchar(50) NOT NULL,
	`chart_type_id` int NOT NULL,
	`chart_type` varchar(30) NOT NULL,
	`when` date NOT NULL,
	`value` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_chart_data_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniqueUserChartData` UNIQUE(`user_id`,`category`,`chart_type`,`when`)
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`id` varchar(21) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT false,
	`discord` varchar(37) DEFAULT '',
	`team` varchar(20) DEFAULT '',
	`bio` text DEFAULT (''),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profile_id` PRIMARY KEY(`id`),
	CONSTRAINT `profile_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `license` (
	`id` varchar(21) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`oval_i_rating` int NOT NULL,
	`oval_safety_rating` decimal(4,2) NOT NULL,
	`oval_license_class` enum('A','B','C','D','R') NOT NULL DEFAULT 'R',
	`sports_car_i_rating` int NOT NULL,
	`sports_car_safety_rating` decimal(4,2) NOT NULL,
	`sports_license_class` enum('A','B','C','D','R') NOT NULL DEFAULT 'R',
	`formula_car_i_rating` int NOT NULL,
	`formula_car_safety_rating` decimal(4,2) NOT NULL,
	`formula_license_class` enum('A','B','C','D','R') NOT NULL DEFAULT 'R',
	`dirt_oval_i_rating` int NOT NULL DEFAULT 0,
	`dirt_oval_safety_rating` decimal(4,2) NOT NULL,
	`dirt_oval_license_class` enum('A','B','C','D','R') NOT NULL DEFAULT 'R',
	`dirt_road_i_rating` int NOT NULL DEFAULT 0,
	`dirt_road_safety_rating` decimal(4,2) NOT NULL,
	`dirt_road_license_class` enum('A','B','C','D','R') NOT NULL DEFAULT 'R',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `license_id` PRIMARY KEY(`id`),
	CONSTRAINT `license_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_chart_data` ADD CONSTRAINT `user_chart_data_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profile` ADD CONSTRAINT `profile_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `license` ADD CONSTRAINT `license_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `season_lookup_idx` ON `series_weekly_stats` (`season_year`,`season_quarter`,`race_week`);