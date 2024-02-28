import { sqliteTable, text, integer} from 'drizzle-orm/sqlite-core';

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
});

// Junction table to represent the many-to-many relationship
export const templateFiles = sqliteTable('template_files', {
  id: text('id').primaryKey(),
  fileId: text('file_id').notNull().references(() => files.id, {onDelete: 'no action'}).notNull(),
  templateId: text('template_id').notNull().references(() => templates.id, {onDelete: 'no action'}).notNull(),
});

// instances table definition
// id, name, and reference to template
export const instances = sqliteTable('instances', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  templateID: text('template_id').notNull().references(() => templates.id, {onDelete: 'no action'}).notNull(),
  flakeComputeID: text('flake_compute_id'),
  awsInstanceID: text('aws_instance_id'),
  userID: text('user_id').notNull(),
});

// networks 
export const networks  = sqliteTable('networks', {
  id: text('id').primaryKey(),
  domain: text('domain').notNull(),
  userID: text('user_id').notNull(),
})


//
export const ports =  sqliteTable('ports', {
  id: text('id').primaryKey(),
  number: integer('number').notNull(),
  network: text('network_id').notNull().references(() => networks.id, {onDelete: 'no action'}).notNull(),
})