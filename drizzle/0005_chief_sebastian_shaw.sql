CREATE TABLE `void_audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`action` enum('void_requested','void_approved','void_rejected','refund_processed') NOT NULL,
	`reason` varchar(255),
	`refundMethod` enum('original_payment','store_credit','cash'),
	`performedBy` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `void_audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `status` enum('pending','preparing','ready','served','completed','cancelled','voided') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `orders` ADD `voidReason` enum('customer_request','mistake','damage','comp','other');--> statement-breakpoint
ALTER TABLE `orders` ADD `refundMethod` enum('original_payment','store_credit','cash');--> statement-breakpoint
ALTER TABLE `orders` ADD `voidRequestedBy` int;--> statement-breakpoint
ALTER TABLE `orders` ADD `voidRequestedAt` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `voidApprovedBy` int;--> statement-breakpoint
ALTER TABLE `orders` ADD `voidApprovedAt` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `voidNotes` text;