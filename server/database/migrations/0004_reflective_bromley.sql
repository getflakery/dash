CREATE TABLE `target` (
	`id` text PRIMARY KEY NOT NULL,
	`deployment_id` text NOT NULL,
	`host` text NOT NULL,
	FOREIGN KEY (`deployment_id`) REFERENCES `deployments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE deployments ADD `port` integer;