import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Template table definition
export const template = sqliteTable('templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  flakeUrl: text('flake_url').notNull(),
  awsInstanceType: text('aws_instance_type'),
});

// File table definition
export const files = sqliteTable('files', {
  id: text('id').primaryKey(),
  path: text('path').notNull(),
  content: text('content').notNull(),
  userID: text('user_id').notNull(),
});

// Junction table to represent the many-to-many relationship
export const templateFile = sqliteTable('template_files', {
  id: text('id').primaryKey(),
  fileId: text('file_id').notNull().references(() => files.id, {onDelete: 'no action'}).notNull(),
  templateId: text('template_id').notNull().references(() => template.id, {onDelete: 'no action'}).notNull(),
});
