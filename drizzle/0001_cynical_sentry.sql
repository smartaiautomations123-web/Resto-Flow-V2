CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(32),
	`loyaltyPoints` int DEFAULT 0,
	`totalSpent` decimal(12,2) DEFAULT '0',
	`visitCount` int DEFAULT 0,
	`notes` text,
	`birthday` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ingredients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`unit` varchar(32) NOT NULL,
	`currentStock` decimal(10,3) DEFAULT '0',
	`minStock` decimal(10,3) DEFAULT '0',
	`costPerUnit` decimal(10,4) DEFAULT '0',
	`supplierId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ingredients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `item_modifiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`menuItemId` int NOT NULL,
	`modifierId` int NOT NULL,
	CONSTRAINT `item_modifiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`sortOrder` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `menu_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`cost` decimal(10,2) DEFAULT '0',
	`taxRate` decimal(5,2) DEFAULT '0',
	`imageUrl` text,
	`isAvailable` boolean NOT NULL DEFAULT true,
	`isPopular` boolean NOT NULL DEFAULT false,
	`prepTime` int DEFAULT 10,
	`station` enum('grill','fryer','salad','dessert','bar','general') DEFAULT 'general',
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `menu_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu_modifiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`price` decimal(10,2) DEFAULT '0',
	`groupName` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `menu_modifiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`menuItemId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` decimal(10,2) NOT NULL,
	`totalPrice` decimal(10,2) NOT NULL,
	`modifiers` json,
	`status` enum('pending','preparing','ready','served','voided') NOT NULL DEFAULT 'pending',
	`station` varchar(32),
	`notes` text,
	`sentToKitchenAt` timestamp,
	`readyAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(32) NOT NULL,
	`type` enum('dine_in','takeaway','delivery','collection','online') NOT NULL DEFAULT 'dine_in',
	`status` enum('pending','preparing','ready','served','completed','cancelled') NOT NULL DEFAULT 'pending',
	`tableId` int,
	`staffId` int,
	`customerId` int,
	`customerName` varchar(255),
	`subtotal` decimal(10,2) DEFAULT '0',
	`taxAmount` decimal(10,2) DEFAULT '0',
	`discountAmount` decimal(10,2) DEFAULT '0',
	`serviceCharge` decimal(10,2) DEFAULT '0',
	`tipAmount` decimal(10,2) DEFAULT '0',
	`total` decimal(10,2) DEFAULT '0',
	`paymentMethod` enum('card','cash','split','online','unpaid') DEFAULT 'unpaid',
	`paymentStatus` enum('unpaid','paid','refunded','partial') DEFAULT 'unpaid',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchaseOrderId` int NOT NULL,
	`ingredientId` int NOT NULL,
	`quantity` decimal(10,3) NOT NULL,
	`unitCost` decimal(10,4) NOT NULL,
	`totalCost` decimal(10,2) NOT NULL,
	CONSTRAINT `purchase_order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`supplierId` int NOT NULL,
	`status` enum('draft','sent','received','cancelled') NOT NULL DEFAULT 'draft',
	`totalAmount` decimal(10,2) DEFAULT '0',
	`notes` text,
	`orderedAt` timestamp,
	`receivedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchase_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`menuItemId` int NOT NULL,
	`ingredientId` int NOT NULL,
	`quantity` decimal(10,4) NOT NULL,
	CONSTRAINT `recipes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int,
	`guestName` varchar(255) NOT NULL,
	`guestPhone` varchar(32),
	`guestEmail` varchar(320),
	`tableId` int,
	`partySize` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`time` varchar(5) NOT NULL,
	`status` enum('confirmed','seated','completed','cancelled','no_show') NOT NULL DEFAULT 'confirmed',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reservations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shifts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staffId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`startTime` varchar(5) NOT NULL,
	`endTime` varchar(5) NOT NULL,
	`role` varchar(32),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shifts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `staff` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(32),
	`pin` varchar(10),
	`role` enum('owner','manager','server','bartender','kitchen') NOT NULL DEFAULT 'server',
	`hourlyRate` decimal(10,2) DEFAULT '0',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staff_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`contactName` varchar(255),
	`email` varchar(320),
	`phone` varchar(32),
	`address` text,
	`notes` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`seats` int DEFAULT 4,
	`status` enum('free','occupied','reserved','cleaning') NOT NULL DEFAULT 'free',
	`positionX` int DEFAULT 0,
	`positionY` int DEFAULT 0,
	`section` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `time_clock` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staffId` int NOT NULL,
	`clockIn` timestamp NOT NULL,
	`clockOut` timestamp,
	`breakMinutes` int DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `time_clock_id` PRIMARY KEY(`id`)
);
