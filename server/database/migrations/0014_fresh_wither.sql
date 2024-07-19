-- ALTER TABLE templates ADD `created_at` integer NOT NULL;--> statement-breakpoint
-- set default value for created_at column as now
ALTER TABLE templates ADD `created_at` integer NOT NULL DEFAULT (strftime('%s', 'now'));
ALTER TABLE templates ADD `pipeline_id` integer;