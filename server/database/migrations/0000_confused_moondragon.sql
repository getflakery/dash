CREATE TABLE `file` (
	`id` text PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`content` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `template` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`flake_url` text NOT NULL,
	`aws_instance_type` text
);
--> statement-breakpoint
CREATE TABLE `template_file` (
	`id` text PRIMARY KEY NOT NULL,
	`file_id` text NOT NULL,
	`template_id` text NOT NULL,
	FOREIGN KEY (`file_id`) REFERENCES `file`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`template_id`) REFERENCES `template`(`id`) ON UPDATE no action ON DELETE no action
);
