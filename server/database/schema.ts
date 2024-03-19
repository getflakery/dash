import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Template table definition
export const templates = sqliteTable('templates', {
  id: text('id').primaryKey(),
  name: text('name'),
  flakeURL: text('flake_url').notNull(),
  awsInstanceType: text('aws_instance_type'),
  userID: text('user_id').notNull(),

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

// Junction table to represent the many-to-many relationship
export const deploymentFiles = sqliteTable('deployment_files', {
  id: text('id').primaryKey(),
  fileId: text('file_id').notNull().references(() => files.id, { onDelete: 'cascade' }).notNull(),
  instanceID: text('instance_id').notNull().references(() => templates.id, { onDelete: 'cascade' }).notNull(),
});


// instanceDeployment
export const deployment = sqliteTable('deployments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  templateID: text('template_id').notNull().references(() => templates.id, { onDelete: 'no action' }).notNull(),
  userID: text('user_id').notNull(),
  flakeComputeID: text('flake_compute_id'),
  awsInstanceID: text('aws_instance_id'),
  createdAt: text('created_at').notNull(),
});

// networks 
export const networks = sqliteTable('networks', {
  id: text('id').primaryKey(),
  domain: text('domain').notNull(),
  userID: text('user_id').notNull(),
  deploymentID: text('deployment_id').references(() => deployment.id, { onDelete: 'no action' }),
})


//
export const ports = sqliteTable('ports', {
  id: text('id').primaryKey(),
  number: integer('number').notNull(),
  network: text('network_id').notNull().references(() => networks.id, { onDelete: 'cascade' }).notNull(),
})