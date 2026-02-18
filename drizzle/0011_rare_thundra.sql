CREATE TABLE `combo_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`combo_id` int NOT NULL,
	`menu_item_id` int NOT NULL,
	`quantity` int DEFAULT 1,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `combo_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `combos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`location_id` int,
	`name` text NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`regular_price` decimal(10,2),
	`discount` decimal(10,2),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `combos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `labour_budget` (
	`id` int AUTO_INCREMENT NOT NULL,
	`location_id` int,
	`month` int NOT NULL,
	`year` int NOT NULL,
	`budgeted_hours` decimal(7,2) NOT NULL,
	`budgeted_cost` decimal(12,2) NOT NULL,
	`actual_hours` decimal(7,2) DEFAULT '0',
	`actual_cost` decimal(12,2) DEFAULT '0',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `labour_budget_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `labour_compliance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`location_id` int,
	`max_hours_per_week` int DEFAULT 40,
	`min_break_minutes` int DEFAULT 30,
	`overtime_threshold` int DEFAULT 40,
	`overtime_multiplier` decimal(3,2) DEFAULT '1.5',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `labour_compliance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`phone` text,
	`email` text,
	`timezone` text DEFAULT ('UTC'),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `overtime_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staff_id` int NOT NULL,
	`week_start_date` timestamp NOT NULL,
	`total_hours` decimal(5,2) NOT NULL,
	`overtime_hours` decimal(5,2) NOT NULL,
	`alert_sent` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `overtime_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `staff_availability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staff_id` int NOT NULL,
	`day_of_week` int NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`is_available` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `staff_availability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `time_off_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staff_id` int NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`reason` text,
	`status` text DEFAULT ('pending'),
	`approved_by` int,
	`approved_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `time_off_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `combo_items` ADD CONSTRAINT `combo_items_combo_id_combos_id_fk` FOREIGN KEY (`combo_id`) REFERENCES `combos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `combo_items` ADD CONSTRAINT `combo_items_menu_item_id_menu_items_id_fk` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `combos` ADD CONSTRAINT `combos_location_id_locations_id_fk` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `labour_budget` ADD CONSTRAINT `labour_budget_location_id_locations_id_fk` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `labour_compliance` ADD CONSTRAINT `labour_compliance_location_id_locations_id_fk` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `overtime_alerts` ADD CONSTRAINT `overtime_alerts_staff_id_staff_id_fk` FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `staff_availability` ADD CONSTRAINT `staff_availability_staff_id_staff_id_fk` FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `time_off_requests` ADD CONSTRAINT `time_off_requests_staff_id_staff_id_fk` FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `time_off_requests` ADD CONSTRAINT `time_off_requests_approved_by_staff_id_fk` FOREIGN KEY (`approved_by`) REFERENCES `staff`(`id`) ON DELETE no action ON UPDATE no action;