CREATE TABLE `networks` (
	`id` text PRIMARY KEY NOT NULL,
	`domain` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ports` (
	`id` text PRIMARY KEY NOT NULL,
	`number` integer NOT NULL,
	`network_id` text NOT NULL,
	FOREIGN KEY (`network_id`) REFERENCES `networks`(`id`) ON UPDATE no action ON DELETE no action
);
