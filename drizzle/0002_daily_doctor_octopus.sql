CREATE TABLE `price_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorProductId` int NOT NULL,
	`uploadId` int,
	`casePrice` decimal(10,2),
	`unitPrice` decimal(10,4),
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_upload_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uploadId` int NOT NULL,
	`vendorCode` varchar(32) NOT NULL,
	`description` text NOT NULL,
	`casePrice` decimal(10,2),
	`unitPrice` decimal(10,4),
	`packSize` varchar(128),
	`calculatedUnitPrice` decimal(10,4),
	`previousCasePrice` decimal(10,2),
	`priceChange` decimal(10,2),
	`isNew` boolean NOT NULL DEFAULT false,
	`vendorProductId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_upload_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_uploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`supplierId` int NOT NULL,
	`fileName` varchar(512) NOT NULL,
	`fileUrl` text,
	`dateRangeStart` varchar(10),
	`dateRangeEnd` varchar(10),
	`status` enum('processing','review','applied','failed') NOT NULL DEFAULT 'processing',
	`totalItems` int DEFAULT 0,
	`newItems` int DEFAULT 0,
	`priceChanges` int DEFAULT 0,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `price_uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendor_product_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorProductId` int NOT NULL,
	`ingredientId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vendor_product_mappings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendor_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`supplierId` int NOT NULL,
	`vendorCode` varchar(32) NOT NULL,
	`description` text NOT NULL,
	`packSize` varchar(128),
	`packUnit` varchar(32),
	`packQty` decimal(10,4),
	`unitPricePer` varchar(32),
	`currentCasePrice` decimal(10,2) DEFAULT '0',
	`currentUnitPrice` decimal(10,4) DEFAULT '0',
	`lastUpdated` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendor_products_id` PRIMARY KEY(`id`)
);
