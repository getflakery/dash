ALTER TABLE deployments ADD `promote_to_production` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE deployments ADD `state` text DEFAULT 'waiting for instances to come online' NOT NULL;