CREATE TABLE `instance_files` (
	`id` text PRIMARY KEY NOT NULL,
	`file_id` text NOT NULL,
	`instance_id` text NOT NULL,
	FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`instance_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE cascade
);
