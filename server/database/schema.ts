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



// instanceDeployment
export const deployments = sqliteTable('deployments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  templateID: text('template_id').notNull().references(() => templates.id, { onDelete: 'no action' }).notNull(),
  userID: text('user_id').notNull(),
  awsInstanceID: text('aws_instance_id'),
  createdAt: integer('created_at').notNull(),
  data: text('data', { mode: 'json' }).$type<{ 
    port_mappings: {
      lb_port: number,
      instance_port: number,
    }[],
    aws_resources: { 
      security_group_id: string,
      launch_template_id: string,
      autoscaling_group_id: string,
      load_balancer_id: string,
    },
    domain: string,
   }>(),
});

