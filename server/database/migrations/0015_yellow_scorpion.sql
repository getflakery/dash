ALTER TABLE templates ADD `repo_full_name` text;--> statement-breakpoint
ALTER TABLE templates ADD `webhook` integer DEFAULT 0 NOT NULL;