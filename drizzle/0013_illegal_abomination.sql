CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`newOrders` boolean DEFAULT true,
	`lowStock` boolean DEFAULT true,
	`staffAlerts` boolean DEFAULT true,
	`systemEvents` boolean DEFAULT true,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`title` varchar(255),
	`message` text,
	`type` varchar(50),
	`relatedId` int,
	`isRead` boolean DEFAULT false,
	`isArchived` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int,
	`amount` decimal(10,2),
	`currency` varchar(3) DEFAULT 'USD',
	`payment_method` varchar(50),
	`provider` varchar(50),
	`transaction_id` varchar(255),
	`status` varchar(50),
	`refund_amount` decimal(10,2) DEFAULT 0,
	`refund_status` varchar(50),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipe_cost_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipeId` int,
	`total_cost` decimal(10,2),
	`ingredientCount` int,
	`recordedAt` timestamp DEFAULT (now()),
	CONSTRAINT `recipe_cost_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplier_performance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`supplierId` int,
	`month` int,
	`year` int,
	`totalOrders` int DEFAULT 0,
	`onTimeDeliveries` int DEFAULT 0,
	`lateDeliveries` int DEFAULT 0,
	`on_time_rate` decimal(5,2) DEFAULT 0,
	`average_price` decimal(10,2) DEFAULT 0,
	`quality_rating` decimal(3,1),
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supplier_performance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplier_price_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`supplierId` int,
	`ingredientId` int,
	`price` decimal(10,2),
	`unit` varchar(50),
	`recordedAt` timestamp DEFAULT (now()),
	CONSTRAINT `supplier_price_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_transactions` ADD CONSTRAINT `payment_transactions_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recipe_cost_history` ADD CONSTRAINT `recipe_cost_history_recipeId_recipes_id_fk` FOREIGN KEY (`recipeId`) REFERENCES `recipes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supplier_performance` ADD CONSTRAINT `supplier_performance_supplierId_suppliers_id_fk` FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supplier_price_history` ADD CONSTRAINT `supplier_price_history_supplierId_suppliers_id_fk` FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supplier_price_history` ADD CONSTRAINT `supplier_price_history_ingredientId_ingredients_id_fk` FOREIGN KEY (`ingredientId`) REFERENCES `ingredients`(`id`) ON DELETE no action ON UPDATE no action;