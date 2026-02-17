CREATE TABLE `z_report_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` int NOT NULL,
	`categoryId` int,
	`categoryName` varchar(255),
	`itemCount` int NOT NULL DEFAULT 0,
	`itemRevenue` decimal(12,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `z_report_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `z_report_shifts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` int NOT NULL,
	`shiftNumber` int NOT NULL,
	`staffId` int,
	`shiftRevenue` decimal(12,2) NOT NULL DEFAULT '0',
	`shiftOrders` int NOT NULL DEFAULT 0,
	`startTime` timestamp,
	`endTime` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `z_report_shifts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `z_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportDate` varchar(10) NOT NULL,
	`totalRevenue` decimal(12,2) NOT NULL DEFAULT '0',
	`totalOrders` int NOT NULL DEFAULT 0,
	`totalDiscounts` decimal(12,2) NOT NULL DEFAULT '0',
	`totalVoids` decimal(12,2) NOT NULL DEFAULT '0',
	`totalTips` decimal(12,2) NOT NULL DEFAULT '0',
	`cashTotal` decimal(12,2) NOT NULL DEFAULT '0',
	`cardTotal` decimal(12,2) NOT NULL DEFAULT '0',
	`splitTotal` decimal(12,2) NOT NULL DEFAULT '0',
	`notes` text,
	`generatedBy` int NOT NULL,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `z_reports_id` PRIMARY KEY(`id`)
);
