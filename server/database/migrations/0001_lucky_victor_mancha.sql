ALTER TABLE deployments ADD `data` text;--> statement-breakpoint
ALTER TABLE `deployments` DROP COLUMN `flake_compute_id`;