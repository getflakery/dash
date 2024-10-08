import { he } from 'date-fns/locale';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Template table definition
export const templates = sqliteTable('templates', {
  id: text('id').primaryKey(),
  name: text('name'),
  flakeURL: text('flake_url').notNull(),
  awsInstanceType: text('aws_instance_type'),
  userID: text('user_id').notNull(),
  host: text('host').unique(),
  createdAt: integer('created_at').notNull(),
  pipelineID: integer('pipeline_id'),
  repoFullName: text('repo_full_name'),
  webhook: integer('webhook').notNull().default(0),
});

// File table definition
export const files = sqliteTable('files', {
  id: text('id').primaryKey(),
  path: text('path').notNull(),
  content: text('content').notNull(),
  userID: text('user_id').notNull(),
  iv: text('initialization_vector').notNull(),
});

// Junction table to represent the many-to-many relationship
export const templateFiles = sqliteTable('template_files', {
  id: text('id').primaryKey(),
  fileId: text('file_id').notNull().references(() => files.id, { onDelete: 'cascade' }).notNull(),
  templateId: text('template_id').notNull().references(() => templates.id, { onDelete: 'cascade' }).notNull(),
});



// instanceDeployment
export const deployments = sqliteTable('deployments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  templateID: text('template_id').notNull().references(() => templates.id, { onDelete: 'no action' }).notNull(),
  userID: text('user_id').notNull(),
  awsInstanceID: text('aws_instance_id'),
  createdAt: integer('created_at').notNull(),
  host: text('host'),
  port: integer('port'),
  data: text('data', { mode: 'json' }).$type<{
    aws_resources: {
      launch_template_id: string,
      autoscaling_group_id: string,
    },
    min_instances: number,
    max_instances: number,
    public_ip: boolean,
    load_balancer: boolean,
  }>(),
  production: integer('production').notNull(),
  promote_to_production: integer('promote_to_production').notNull().default(0),
  state: text('state').notNull().default('waiting for instances to come online'),
});

export const target = sqliteTable('target', {
  id: text('id').primaryKey(),
  deploymentID: text('deployment_id').notNull().references(() => deployments.id, { onDelete: 'cascade' }).notNull(),
  host: text('host').notNull(),
  completed: integer('completed').notNull().default(0),
  exitCode: integer('exit_code'),
  healthy: integer('healthy').notNull().default(1),
});



export const deploymentLogs = sqliteTable('deployment_logs', {
  id: text('id').primaryKey(),
  deploymentID: text('deployment_id').notNull().references(() => deployments.id, { onDelete: 'cascade' }).notNull(),
  logs: text('logs', { mode: 'json' }).$type<{
    date: number,
    exec: string,
    host: string,
  }[]>(),
});

export const privateBinaryCache = sqliteTable('private_binary_cache', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // user id name is a bad way to do this
  deploymentID: text('deployment_id').notNull().references(() => deployments.id, { onDelete: 'cascade' }).notNull(),
  createdAt: integer('created_at').notNull(),
  privatekey: text('private_key'),
  iv: text('initialization_vector'),
  publickey: text('public_key'),
});

export const woodpeckerToken  = sqliteTable('woodpecker_token', {
  id: text('id').primaryKey(),
  createdAt: integer('created_at').notNull(),
  token: text('token').notNull(),
  iv : text('initialization_vector').notNull(),
  userID: text('user_id').notNull(),
});