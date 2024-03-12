CREATE TABLE `instance_deployment` (
	`id` text PRIMARY KEY NOT NULL,
	`flake_compute_id` text,
	`aws_instance_id` text,
	`created_at` text NOT NULL,
	`active` integer NOT NULL,
	`instance_id` text NOT NULL,
	FOREIGN KEY (`instance_id`) REFERENCES `instances`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `instances` DROP COLUMN `flake_compute_id`;--> statement-breakpoint
ALTER TABLE `instances` DROP COLUMN `aws_instance_id`;