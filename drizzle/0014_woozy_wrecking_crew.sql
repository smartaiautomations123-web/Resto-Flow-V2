ALTER TABLE `payment_transactions` MODIFY COLUMN `refund_amount` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `supplier_performance` MODIFY COLUMN `on_time_rate` decimal(5,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `supplier_performance` MODIFY COLUMN `average_price` decimal(10,2) DEFAULT '0';