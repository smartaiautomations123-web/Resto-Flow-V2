CREATE TABLE `dayparts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`start_time` varchar(5) NOT NULL,
	`end_time` varchar(5) NOT NULL,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dayparts_id` PRIMARY KEY(`id`),
	CONSTRAINT `dayparts_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `menu_item_dayparts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`menu_item_id` int NOT NULL,
	`daypart_id` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `menu_item_dayparts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_item_void_reasons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_item_id` int NOT NULL,
	`void_reason` enum('customer_request','mistake','damage','comp','other') NOT NULL,
	`notes` text,
	`voided_by` int NOT NULL,
	`voided_at` timestamp DEFAULT (now()),
	CONSTRAINT `order_item_void_reasons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_void_reasons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`void_reason` enum('customer_request','mistake','damage','comp','other') NOT NULL,
	`notes` text,
	`voided_by` int NOT NULL,
	`voided_at` timestamp DEFAULT (now()),
	CONSTRAINT `order_void_reasons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `menu_item_dayparts` ADD CONSTRAINT `menu_item_dayparts_menu_item_id_menu_items_id_fk` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `menu_item_dayparts` ADD CONSTRAINT `menu_item_dayparts_daypart_id_dayparts_id_fk` FOREIGN KEY (`daypart_id`) REFERENCES `dayparts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_item_void_reasons` ADD CONSTRAINT `order_item_void_reasons_order_item_id_order_items_id_fk` FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_item_void_reasons` ADD CONSTRAINT `order_item_void_reasons_voided_by_staff_id_fk` FOREIGN KEY (`voided_by`) REFERENCES `staff`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_void_reasons` ADD CONSTRAINT `order_void_reasons_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_void_reasons` ADD CONSTRAINT `order_void_reasons_voided_by_staff_id_fk` FOREIGN KEY (`voided_by`) REFERENCES `staff`(`id`) ON DELETE no action ON UPDATE no action;