CREATE TABLE `woodpecker_token` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`token` text NOT NULL,
	`initialization_vector` text NOT NULL,
	`user_id` text NOT NULL
);
