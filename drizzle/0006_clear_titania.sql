CREATE TABLE `qr_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tableId` int NOT NULL,
	`qrUrl` text NOT NULL,
	`qrSize` int NOT NULL DEFAULT 200,
	`format` varchar(20) NOT NULL DEFAULT 'png',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `qr_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `qr_codes_tableId_unique` UNIQUE(`tableId`)
);
