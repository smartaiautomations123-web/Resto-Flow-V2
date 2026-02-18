CREATE TABLE `waitlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int,
	`guestName` varchar(255) NOT NULL,
	`guestPhone` varchar(32),
	`guestEmail` varchar(320),
	`partySize` int NOT NULL,
	`estimatedWaitTime` int DEFAULT 0,
	`status` enum('waiting','called','seated','cancelled') NOT NULL DEFAULT 'waiting',
	`notes` text,
	`position` int NOT NULL,
	`smsNotificationSent` boolean DEFAULT false,
	`smsNotificationSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `waitlist_id` PRIMARY KEY(`id`)
);
