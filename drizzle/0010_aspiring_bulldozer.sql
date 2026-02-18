CREATE TABLE `customer_sms_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`opt_in_reservations` boolean DEFAULT true,
	`opt_in_waitlist` boolean DEFAULT true,
	`opt_in_order_updates` boolean DEFAULT true,
	`opt_in_promotions` boolean DEFAULT false,
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_sms_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_campaign_recipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaign_id` int NOT NULL,
	`customer_id` int NOT NULL,
	`email` varchar(255) NOT NULL,
	`status` varchar(20) DEFAULT 'pending',
	`sent_at` timestamp,
	`opened_at` timestamp,
	`clicked_at` timestamp,
	`converted_at` timestamp,
	CONSTRAINT `email_campaign_recipients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`template_id` int NOT NULL,
	`segment_id` int,
	`status` varchar(20) DEFAULT 'draft',
	`scheduled_at` timestamp,
	`sent_at` timestamp,
	`recipient_count` int DEFAULT 0,
	`open_count` int DEFAULT 0,
	`click_count` int DEFAULT 0,
	`conversion_count` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`subject` varchar(200) NOT NULL,
	`html_content` text NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sms_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int,
	`phone_number` varchar(20) NOT NULL,
	`message` text NOT NULL,
	`type` varchar(50) NOT NULL,
	`status` varchar(20) DEFAULT 'pending',
	`sent_at` timestamp,
	`delivered_at` timestamp,
	`failure_reason` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `sms_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sms_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurant_id` int NOT NULL,
	`twilio_account_sid` varchar(255),
	`twilio_auth_token` varchar(255),
	`twilio_phone_number` varchar(20),
	`is_enabled` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sms_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `waste_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ingredient_id` int NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`unit` varchar(20) NOT NULL,
	`reason` varchar(50) NOT NULL,
	`cost` decimal(10,2) NOT NULL,
	`notes` text,
	`logged_by` int NOT NULL,
	`logged_at` timestamp DEFAULT (now()),
	CONSTRAINT `waste_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `waste_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`total_waste_cost` decimal(12,2) NOT NULL,
	`waste_count` int NOT NULL,
	`generated_at` timestamp DEFAULT (now()),
	CONSTRAINT `waste_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `customer_sms_preferences` ADD CONSTRAINT `customer_sms_preferences_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_campaign_recipients` ADD CONSTRAINT `email_campaign_recipients_campaign_id_email_campaigns_id_fk` FOREIGN KEY (`campaign_id`) REFERENCES `email_campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_campaign_recipients` ADD CONSTRAINT `email_campaign_recipients_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_campaigns` ADD CONSTRAINT `email_campaigns_template_id_email_templates_id_fk` FOREIGN KEY (`template_id`) REFERENCES `email_templates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_campaigns` ADD CONSTRAINT `email_campaigns_segment_id_customer_segments_id_fk` FOREIGN KEY (`segment_id`) REFERENCES `customer_segments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sms_messages` ADD CONSTRAINT `sms_messages_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `waste_logs` ADD CONSTRAINT `waste_logs_ingredient_id_ingredients_id_fk` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `waste_logs` ADD CONSTRAINT `waste_logs_logged_by_staff_id_fk` FOREIGN KEY (`logged_by`) REFERENCES `staff`(`id`) ON DELETE no action ON UPDATE no action;