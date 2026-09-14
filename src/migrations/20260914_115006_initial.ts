import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`private\` integer,
  	\`alt\` text NOT NULL,
  	\`caption\` text,
  	\`credit\` text,
  	\`kind\` text DEFAULT 'image',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumbnail_url\` text,
  	\`sizes_thumbnail_width\` numeric,
  	\`sizes_thumbnail_height\` numeric,
  	\`sizes_thumbnail_mime_type\` text,
  	\`sizes_thumbnail_filesize\` numeric,
  	\`sizes_thumbnail_filename\` text,
  	\`sizes_small_url\` text,
  	\`sizes_small_width\` numeric,
  	\`sizes_small_height\` numeric,
  	\`sizes_small_mime_type\` text,
  	\`sizes_small_filesize\` numeric,
  	\`sizes_small_filename\` text,
  	\`sizes_medium_url\` text,
  	\`sizes_medium_width\` numeric,
  	\`sizes_medium_height\` numeric,
  	\`sizes_medium_mime_type\` text,
  	\`sizes_medium_filesize\` numeric,
  	\`sizes_medium_filename\` text,
  	\`sizes_large_url\` text,
  	\`sizes_large_width\` numeric,
  	\`sizes_large_height\` numeric,
  	\`sizes_large_mime_type\` text,
  	\`sizes_large_filesize\` numeric,
  	\`sizes_large_filename\` text,
  	\`sizes_xlarge_url\` text,
  	\`sizes_xlarge_width\` numeric,
  	\`sizes_xlarge_height\` numeric,
  	\`sizes_xlarge_mime_type\` text,
  	\`sizes_xlarge_filesize\` numeric,
  	\`sizes_xlarge_filename\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`media_private_idx\` ON \`media\` (\`private\`);`)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_small_sizes_small_filename_idx\` ON \`media\` (\`sizes_small_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_medium_sizes_medium_filename_idx\` ON \`media\` (\`sizes_medium_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_large_sizes_large_filename_idx\` ON \`media\` (\`sizes_large_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_xlarge_sizes_xlarge_filename_idx\` ON \`media\` (\`sizes_xlarge_filename\`);`)
  await db.run(sql`CREATE TABLE \`media_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`media_texts_order_parent\` ON \`media_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`body\` text,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'medium',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_text_order_idx\` ON \`projects_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_text_parent_id_idx\` ON \`projects_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_text_path_idx\` ON \`projects_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_heading\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`level\` text DEFAULT 'h2',
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'small',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_heading_order_idx\` ON \`projects_blocks_heading\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_heading_parent_id_idx\` ON \`projects_blocks_heading\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_heading_path_idx\` ON \`projects_blocks_heading\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_statement_lines\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_statement\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_statement_lines_order_idx\` ON \`projects_blocks_statement_lines\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_statement_lines_parent_id_idx\` ON \`projects_blocks_statement_lines\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_statement\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_statement_order_idx\` ON \`projects_blocks_statement\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_statement_parent_id_idx\` ON \`projects_blocks_statement\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_statement_path_idx\` ON \`projects_blocks_statement\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_section_intro_lead\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_section_intro\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_section_intro_lead_order_idx\` ON \`projects_blocks_section_intro_lead\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_section_intro_lead_parent_id_idx\` ON \`projects_blocks_section_intro_lead\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_section_intro\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`index\` text DEFAULT '01',
  	\`label\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_section_intro_order_idx\` ON \`projects_blocks_section_intro\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_section_intro_parent_id_idx\` ON \`projects_blocks_section_intro\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_section_intro_path_idx\` ON \`projects_blocks_section_intro\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_quote\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`quote\` text,
  	\`attribution\` text,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_quote_order_idx\` ON \`projects_blocks_quote\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_quote_parent_id_idx\` ON \`projects_blocks_quote\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_quote_path_idx\` ON \`projects_blocks_quote\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_stats_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`value\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_stats_items_order_idx\` ON \`projects_blocks_stats_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_stats_items_parent_id_idx\` ON \`projects_blocks_stats_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'medium',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_stats_order_idx\` ON \`projects_blocks_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_stats_parent_id_idx\` ON \`projects_blocks_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_stats_path_idx\` ON \`projects_blocks_stats\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_location_meta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`place\` text,
  	\`date\` text,
  	\`coordinates\` text,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'medium',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_location_meta_order_idx\` ON \`projects_blocks_location_meta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_location_meta_parent_id_idx\` ON \`projects_blocks_location_meta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_location_meta_path_idx\` ON \`projects_blocks_location_meta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`fit\` text DEFAULT 'cover',
  	\`caption\` text,
  	\`alt\` text,
  	\`parallax\` integer DEFAULT false,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_image_order_idx\` ON \`projects_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_image_parent_id_idx\` ON \`projects_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_image_path_idx\` ON \`projects_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_image_image_idx\` ON \`projects_blocks_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_wide_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`fit\` text DEFAULT 'cover',
  	\`caption\` text,
  	\`alt\` text,
  	\`parallax\` integer DEFAULT true,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_wide_image_order_idx\` ON \`projects_blocks_wide_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_wide_image_parent_id_idx\` ON \`projects_blocks_wide_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_wide_image_path_idx\` ON \`projects_blocks_wide_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_wide_image_image_idx\` ON \`projects_blocks_wide_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_full_bleed_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`fit\` text DEFAULT 'cover',
  	\`caption\` text,
  	\`alt\` text,
  	\`parallax\` integer DEFAULT true,
  	\`width\` text DEFAULT 'full',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_full_bleed_image_order_idx\` ON \`projects_blocks_full_bleed_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_full_bleed_image_parent_id_idx\` ON \`projects_blocks_full_bleed_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_full_bleed_image_path_idx\` ON \`projects_blocks_full_bleed_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_full_bleed_image_image_idx\` ON \`projects_blocks_full_bleed_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_photo_pair\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`left_id\` integer,
  	\`right_id\` integer,
  	\`ratio\` text DEFAULT '50-50',
  	\`fit\` text DEFAULT 'cover',
  	\`offset\` integer DEFAULT true,
  	\`caption\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`left_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`right_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_photo_pair_order_idx\` ON \`projects_blocks_photo_pair\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_photo_pair_parent_id_idx\` ON \`projects_blocks_photo_pair\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_photo_pair_path_idx\` ON \`projects_blocks_photo_pair\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_photo_pair_left_idx\` ON \`projects_blocks_photo_pair\` (\`left_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_photo_pair_right_idx\` ON \`projects_blocks_photo_pair\` (\`right_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_image_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`body\` text,
  	\`order\` text DEFAULT 'image-left',
  	\`ratio\` text DEFAULT '50-50',
  	\`caption\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_image_text_order_idx\` ON \`projects_blocks_image_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_image_text_parent_id_idx\` ON \`projects_blocks_image_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_image_text_path_idx\` ON \`projects_blocks_image_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_image_text_image_idx\` ON \`projects_blocks_image_text\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_video\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`video_id\` integer,
  	\`poster_id\` integer,
  	\`autoplay\` integer DEFAULT true,
  	\`loop\` integer DEFAULT true,
  	\`controls\` integer DEFAULT false,
  	\`caption\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_video_order_idx\` ON \`projects_blocks_video\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_video_parent_id_idx\` ON \`projects_blocks_video\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_video_path_idx\` ON \`projects_blocks_video\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_video_video_idx\` ON \`projects_blocks_video\` (\`video_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_video_poster_idx\` ON \`projects_blocks_video\` (\`poster_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`limit\` numeric DEFAULT 6,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_gallery_order_idx\` ON \`projects_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_gallery_parent_id_idx\` ON \`projects_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_gallery_path_idx\` ON \`projects_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_project_preview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_project_preview_order_idx\` ON \`projects_blocks_project_preview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_project_preview_parent_id_idx\` ON \`projects_blocks_project_preview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_project_preview_path_idx\` ON \`projects_blocks_project_preview\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_tool_preview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_tool_preview_order_idx\` ON \`projects_blocks_tool_preview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_tool_preview_parent_id_idx\` ON \`projects_blocks_tool_preview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_tool_preview_path_idx\` ON \`projects_blocks_tool_preview\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`title\` text,
  	\`slug\` text,
  	\`summary\` text,
  	\`year\` text,
  	\`discipline\` text,
  	\`role\` text,
  	\`project_url\` text,
  	\`github_url\` text,
  	\`featured\` integer DEFAULT false,
  	\`cover_id\` integer,
  	\`preview_video_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`preview_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`projects__order_idx\` ON \`projects\` (\`_order\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_slug_idx\` ON \`projects\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`projects_cover_idx\` ON \`projects\` (\`cover_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_preview_video_idx\` ON \`projects\` (\`preview_video_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_updated_at_idx\` ON \`projects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`projects_created_at_idx\` ON \`projects\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`projects__status_idx\` ON \`projects\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`projects_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_texts_order_parent\` ON \`projects_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`gallery_id\` integer,
  	\`projects_id\` integer,
  	\`built_tools_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`gallery_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`built_tools_id\`) REFERENCES \`built_tools\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_rels_order_idx\` ON \`projects_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_parent_idx\` ON \`projects_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_path_idx\` ON \`projects_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_gallery_id_idx\` ON \`projects_rels\` (\`gallery_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_projects_id_idx\` ON \`projects_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_built_tools_id_idx\` ON \`projects_rels\` (\`built_tools_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`body\` text,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'medium',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_text_order_idx\` ON \`_projects_v_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_text_parent_id_idx\` ON \`_projects_v_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_text_path_idx\` ON \`_projects_v_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_heading\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`level\` text DEFAULT 'h2',
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'small',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_heading_order_idx\` ON \`_projects_v_blocks_heading\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_heading_parent_id_idx\` ON \`_projects_v_blocks_heading\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_heading_path_idx\` ON \`_projects_v_blocks_heading\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_statement_lines\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_statement\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_statement_lines_order_idx\` ON \`_projects_v_blocks_statement_lines\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_statement_lines_parent_id_idx\` ON \`_projects_v_blocks_statement_lines\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_statement\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_statement_order_idx\` ON \`_projects_v_blocks_statement\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_statement_parent_id_idx\` ON \`_projects_v_blocks_statement\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_statement_path_idx\` ON \`_projects_v_blocks_statement\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_section_intro_lead\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_section_intro\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_section_intro_lead_order_idx\` ON \`_projects_v_blocks_section_intro_lead\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_section_intro_lead_parent_id_idx\` ON \`_projects_v_blocks_section_intro_lead\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_section_intro\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`index\` text DEFAULT '01',
  	\`label\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_section_intro_order_idx\` ON \`_projects_v_blocks_section_intro\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_section_intro_parent_id_idx\` ON \`_projects_v_blocks_section_intro\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_section_intro_path_idx\` ON \`_projects_v_blocks_section_intro\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_quote\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`quote\` text,
  	\`attribution\` text,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_quote_order_idx\` ON \`_projects_v_blocks_quote\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_quote_parent_id_idx\` ON \`_projects_v_blocks_quote\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_quote_path_idx\` ON \`_projects_v_blocks_quote\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_stats_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`value\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_stats_items_order_idx\` ON \`_projects_v_blocks_stats_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_stats_items_parent_id_idx\` ON \`_projects_v_blocks_stats_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'medium',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_stats_order_idx\` ON \`_projects_v_blocks_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_stats_parent_id_idx\` ON \`_projects_v_blocks_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_stats_path_idx\` ON \`_projects_v_blocks_stats\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_location_meta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`place\` text,
  	\`date\` text,
  	\`coordinates\` text,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'medium',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_location_meta_order_idx\` ON \`_projects_v_blocks_location_meta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_location_meta_parent_id_idx\` ON \`_projects_v_blocks_location_meta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_location_meta_path_idx\` ON \`_projects_v_blocks_location_meta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`fit\` text DEFAULT 'cover',
  	\`caption\` text,
  	\`alt\` text,
  	\`parallax\` integer DEFAULT false,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_image_order_idx\` ON \`_projects_v_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_image_parent_id_idx\` ON \`_projects_v_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_image_path_idx\` ON \`_projects_v_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_image_image_idx\` ON \`_projects_v_blocks_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_wide_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`fit\` text DEFAULT 'cover',
  	\`caption\` text,
  	\`alt\` text,
  	\`parallax\` integer DEFAULT true,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_wide_image_order_idx\` ON \`_projects_v_blocks_wide_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_wide_image_parent_id_idx\` ON \`_projects_v_blocks_wide_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_wide_image_path_idx\` ON \`_projects_v_blocks_wide_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_wide_image_image_idx\` ON \`_projects_v_blocks_wide_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_full_bleed_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`fit\` text DEFAULT 'cover',
  	\`caption\` text,
  	\`alt\` text,
  	\`parallax\` integer DEFAULT true,
  	\`width\` text DEFAULT 'full',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_full_bleed_image_order_idx\` ON \`_projects_v_blocks_full_bleed_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_full_bleed_image_parent_id_idx\` ON \`_projects_v_blocks_full_bleed_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_full_bleed_image_path_idx\` ON \`_projects_v_blocks_full_bleed_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_full_bleed_image_image_idx\` ON \`_projects_v_blocks_full_bleed_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_photo_pair\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`left_id\` integer,
  	\`right_id\` integer,
  	\`ratio\` text DEFAULT '50-50',
  	\`fit\` text DEFAULT 'cover',
  	\`offset\` integer DEFAULT true,
  	\`caption\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`left_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`right_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_photo_pair_order_idx\` ON \`_projects_v_blocks_photo_pair\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_photo_pair_parent_id_idx\` ON \`_projects_v_blocks_photo_pair\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_photo_pair_path_idx\` ON \`_projects_v_blocks_photo_pair\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_photo_pair_left_idx\` ON \`_projects_v_blocks_photo_pair\` (\`left_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_photo_pair_right_idx\` ON \`_projects_v_blocks_photo_pair\` (\`right_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_image_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`body\` text,
  	\`order\` text DEFAULT 'image-left',
  	\`ratio\` text DEFAULT '50-50',
  	\`caption\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_image_text_order_idx\` ON \`_projects_v_blocks_image_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_image_text_parent_id_idx\` ON \`_projects_v_blocks_image_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_image_text_path_idx\` ON \`_projects_v_blocks_image_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_image_text_image_idx\` ON \`_projects_v_blocks_image_text\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_video\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`video_id\` integer,
  	\`poster_id\` integer,
  	\`autoplay\` integer DEFAULT true,
  	\`loop\` integer DEFAULT true,
  	\`controls\` integer DEFAULT false,
  	\`caption\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_video_order_idx\` ON \`_projects_v_blocks_video\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_video_parent_id_idx\` ON \`_projects_v_blocks_video\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_video_path_idx\` ON \`_projects_v_blocks_video\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_video_video_idx\` ON \`_projects_v_blocks_video\` (\`video_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_video_poster_idx\` ON \`_projects_v_blocks_video\` (\`poster_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`limit\` numeric DEFAULT 6,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_gallery_order_idx\` ON \`_projects_v_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_gallery_parent_id_idx\` ON \`_projects_v_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_gallery_path_idx\` ON \`_projects_v_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_project_preview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_project_preview_order_idx\` ON \`_projects_v_blocks_project_preview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_project_preview_parent_id_idx\` ON \`_projects_v_blocks_project_preview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_project_preview_path_idx\` ON \`_projects_v_blocks_project_preview\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_tool_preview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_tool_preview_order_idx\` ON \`_projects_v_blocks_tool_preview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_tool_preview_parent_id_idx\` ON \`_projects_v_blocks_tool_preview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_tool_preview_path_idx\` ON \`_projects_v_blocks_tool_preview\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version__order\` text,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_summary\` text,
  	\`version_year\` text,
  	\`version_discipline\` text,
  	\`version_role\` text,
  	\`version_project_url\` text,
  	\`version_github_url\` text,
  	\`version_featured\` integer DEFAULT false,
  	\`version_cover_id\` integer,
  	\`version_preview_video_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_preview_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_parent_idx\` ON \`_projects_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version__order_idx\` ON \`_projects_v\` (\`version__order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_slug_idx\` ON \`_projects_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_cover_idx\` ON \`_projects_v\` (\`version_cover_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_preview_video_idx\` ON \`_projects_v\` (\`version_preview_video_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_updated_at_idx\` ON \`_projects_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_created_at_idx\` ON \`_projects_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version__status_idx\` ON \`_projects_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_created_at_idx\` ON \`_projects_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_updated_at_idx\` ON \`_projects_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_latest_idx\` ON \`_projects_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_autosave_idx\` ON \`_projects_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_texts_order_parent\` ON \`_projects_v_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`gallery_id\` integer,
  	\`projects_id\` integer,
  	\`built_tools_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`gallery_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`built_tools_id\`) REFERENCES \`built_tools\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_order_idx\` ON \`_projects_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_parent_idx\` ON \`_projects_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_path_idx\` ON \`_projects_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_gallery_id_idx\` ON \`_projects_v_rels\` (\`gallery_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_projects_id_idx\` ON \`_projects_v_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_built_tools_id_idx\` ON \`_projects_v_rels\` (\`built_tools_id\`);`)
  await db.run(sql`CREATE TABLE \`life_blocks_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`body\` text,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'medium',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`life\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`life_blocks_text_order_idx\` ON \`life_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_text_parent_id_idx\` ON \`life_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_text_path_idx\` ON \`life_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`life_blocks_heading\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`level\` text DEFAULT 'h2',
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'small',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`life\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`life_blocks_heading_order_idx\` ON \`life_blocks_heading\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_heading_parent_id_idx\` ON \`life_blocks_heading\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_heading_path_idx\` ON \`life_blocks_heading\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`life_blocks_statement_lines\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`life_blocks_statement\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`life_blocks_statement_lines_order_idx\` ON \`life_blocks_statement_lines\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_statement_lines_parent_id_idx\` ON \`life_blocks_statement_lines\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`life_blocks_statement\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`life\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`life_blocks_statement_order_idx\` ON \`life_blocks_statement\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_statement_parent_id_idx\` ON \`life_blocks_statement\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_statement_path_idx\` ON \`life_blocks_statement\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`life_blocks_section_intro_lead\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`life_blocks_section_intro\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`life_blocks_section_intro_lead_order_idx\` ON \`life_blocks_section_intro_lead\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_section_intro_lead_parent_id_idx\` ON \`life_blocks_section_intro_lead\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`life_blocks_section_intro\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`index\` text DEFAULT '01',
  	\`label\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`life\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`life_blocks_section_intro_order_idx\` ON \`life_blocks_section_intro\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_section_intro_parent_id_idx\` ON \`life_blocks_section_intro\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_section_intro_path_idx\` ON \`life_blocks_section_intro\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`life_blocks_quote\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`quote\` text,
  	\`attribution\` text,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`life\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`life_blocks_quote_order_idx\` ON \`life_blocks_quote\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_quote_parent_id_idx\` ON \`life_blocks_quote\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_quote_path_idx\` ON \`life_blocks_quote\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`life_blocks_stats_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`value\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`life_blocks_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`life_blocks_stats_items_order_idx\` ON \`life_blocks_stats_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_stats_items_parent_id_idx\` ON \`life_blocks_stats_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`life_blocks_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'medium',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`life\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`life_blocks_stats_order_idx\` ON \`life_blocks_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_stats_parent_id_idx\` ON \`life_blocks_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_stats_path_idx\` ON \`life_blocks_stats\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`life_blocks_location_meta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`place\` text,
  	\`date\` text,
  	\`coordinates\` text,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'medium',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`life\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`life_blocks_location_meta_order_idx\` ON \`life_blocks_location_meta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_location_meta_parent_id_idx\` ON \`life_blocks_location_meta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_location_meta_path_idx\` ON \`life_blocks_location_meta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`life_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`fit\` text DEFAULT 'cover',
  	\`caption\` text,
  	\`alt\` text,
  	\`parallax\` integer DEFAULT false,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`life\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`life_blocks_image_order_idx\` ON \`life_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_image_parent_id_idx\` ON \`life_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_image_path_idx\` ON \`life_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_image_image_idx\` ON \`life_blocks_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`life_blocks_wide_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`fit\` text DEFAULT 'cover',
  	\`caption\` text,
  	\`alt\` text,
  	\`parallax\` integer DEFAULT true,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`life\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`life_blocks_wide_image_order_idx\` ON \`life_blocks_wide_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_wide_image_parent_id_idx\` ON \`life_blocks_wide_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_wide_image_path_idx\` ON \`life_blocks_wide_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_wide_image_image_idx\` ON \`life_blocks_wide_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`life_blocks_full_bleed_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`fit\` text DEFAULT 'cover',
  	\`caption\` text,
  	\`alt\` text,
  	\`parallax\` integer DEFAULT true,
  	\`width\` text DEFAULT 'full',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`life\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`life_blocks_full_bleed_image_order_idx\` ON \`life_blocks_full_bleed_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_full_bleed_image_parent_id_idx\` ON \`life_blocks_full_bleed_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_full_bleed_image_path_idx\` ON \`life_blocks_full_bleed_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_full_bleed_image_image_idx\` ON \`life_blocks_full_bleed_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`life_blocks_photo_pair\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`left_id\` integer,
  	\`right_id\` integer,
  	\`ratio\` text DEFAULT '50-50',
  	\`fit\` text DEFAULT 'cover',
  	\`offset\` integer DEFAULT true,
  	\`caption\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`left_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`right_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`life\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`life_blocks_photo_pair_order_idx\` ON \`life_blocks_photo_pair\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_photo_pair_parent_id_idx\` ON \`life_blocks_photo_pair\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_photo_pair_path_idx\` ON \`life_blocks_photo_pair\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_photo_pair_left_idx\` ON \`life_blocks_photo_pair\` (\`left_id\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_photo_pair_right_idx\` ON \`life_blocks_photo_pair\` (\`right_id\`);`)
  await db.run(sql`CREATE TABLE \`life_blocks_image_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`body\` text,
  	\`order\` text DEFAULT 'image-left',
  	\`ratio\` text DEFAULT '50-50',
  	\`caption\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`life\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`life_blocks_image_text_order_idx\` ON \`life_blocks_image_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_image_text_parent_id_idx\` ON \`life_blocks_image_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_image_text_path_idx\` ON \`life_blocks_image_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_image_text_image_idx\` ON \`life_blocks_image_text\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`life_blocks_video\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`video_id\` integer,
  	\`poster_id\` integer,
  	\`autoplay\` integer DEFAULT true,
  	\`loop\` integer DEFAULT true,
  	\`controls\` integer DEFAULT false,
  	\`caption\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`life\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`life_blocks_video_order_idx\` ON \`life_blocks_video\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_video_parent_id_idx\` ON \`life_blocks_video\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_video_path_idx\` ON \`life_blocks_video\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_video_video_idx\` ON \`life_blocks_video\` (\`video_id\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_video_poster_idx\` ON \`life_blocks_video\` (\`poster_id\`);`)
  await db.run(sql`CREATE TABLE \`life_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`limit\` numeric DEFAULT 6,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`life\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`life_blocks_gallery_order_idx\` ON \`life_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_gallery_parent_id_idx\` ON \`life_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_gallery_path_idx\` ON \`life_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`life_blocks_project_preview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`life\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`life_blocks_project_preview_order_idx\` ON \`life_blocks_project_preview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_project_preview_parent_id_idx\` ON \`life_blocks_project_preview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_project_preview_path_idx\` ON \`life_blocks_project_preview\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`life_blocks_tool_preview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`life\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`life_blocks_tool_preview_order_idx\` ON \`life_blocks_tool_preview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_tool_preview_parent_id_idx\` ON \`life_blocks_tool_preview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`life_blocks_tool_preview_path_idx\` ON \`life_blocks_tool_preview\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`life\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`title\` text,
  	\`slug\` text,
  	\`category\` text DEFAULT 'travel',
  	\`place\` text,
  	\`date\` text,
  	\`description\` text,
  	\`cover_id\` integer,
  	\`coordinates\` text,
  	\`distance\` text,
  	\`elevation\` text,
  	\`duration\` text,
  	\`difficulty\` text,
  	\`trail\` text,
  	\`preset\` text DEFAULT 'editorial',
  	\`theme\` text DEFAULT 'light',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`life__order_idx\` ON \`life\` (\`_order\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`life_slug_idx\` ON \`life\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`life_cover_idx\` ON \`life\` (\`cover_id\`);`)
  await db.run(sql`CREATE INDEX \`life_updated_at_idx\` ON \`life\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`life_created_at_idx\` ON \`life\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`life__status_idx\` ON \`life\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`life_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`gallery_id\` integer,
  	\`projects_id\` integer,
  	\`built_tools_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`life\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`gallery_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`built_tools_id\`) REFERENCES \`built_tools\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`life_rels_order_idx\` ON \`life_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`life_rels_parent_idx\` ON \`life_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`life_rels_path_idx\` ON \`life_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`life_rels_gallery_id_idx\` ON \`life_rels\` (\`gallery_id\`);`)
  await db.run(sql`CREATE INDEX \`life_rels_projects_id_idx\` ON \`life_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`life_rels_built_tools_id_idx\` ON \`life_rels\` (\`built_tools_id\`);`)
  await db.run(sql`CREATE TABLE \`_life_v_blocks_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`body\` text,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'medium',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_life_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_text_order_idx\` ON \`_life_v_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_text_parent_id_idx\` ON \`_life_v_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_text_path_idx\` ON \`_life_v_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_life_v_blocks_heading\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`level\` text DEFAULT 'h2',
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'small',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_life_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_heading_order_idx\` ON \`_life_v_blocks_heading\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_heading_parent_id_idx\` ON \`_life_v_blocks_heading\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_heading_path_idx\` ON \`_life_v_blocks_heading\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_life_v_blocks_statement_lines\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_life_v_blocks_statement\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_statement_lines_order_idx\` ON \`_life_v_blocks_statement_lines\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_statement_lines_parent_id_idx\` ON \`_life_v_blocks_statement_lines\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_life_v_blocks_statement\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_life_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_statement_order_idx\` ON \`_life_v_blocks_statement\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_statement_parent_id_idx\` ON \`_life_v_blocks_statement\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_statement_path_idx\` ON \`_life_v_blocks_statement\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_life_v_blocks_section_intro_lead\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_life_v_blocks_section_intro\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_section_intro_lead_order_idx\` ON \`_life_v_blocks_section_intro_lead\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_section_intro_lead_parent_id_idx\` ON \`_life_v_blocks_section_intro_lead\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_life_v_blocks_section_intro\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`index\` text DEFAULT '01',
  	\`label\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_life_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_section_intro_order_idx\` ON \`_life_v_blocks_section_intro\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_section_intro_parent_id_idx\` ON \`_life_v_blocks_section_intro\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_section_intro_path_idx\` ON \`_life_v_blocks_section_intro\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_life_v_blocks_quote\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`quote\` text,
  	\`attribution\` text,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_life_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_quote_order_idx\` ON \`_life_v_blocks_quote\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_quote_parent_id_idx\` ON \`_life_v_blocks_quote\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_quote_path_idx\` ON \`_life_v_blocks_quote\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_life_v_blocks_stats_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`value\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_life_v_blocks_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_stats_items_order_idx\` ON \`_life_v_blocks_stats_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_stats_items_parent_id_idx\` ON \`_life_v_blocks_stats_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_life_v_blocks_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'medium',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_life_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_stats_order_idx\` ON \`_life_v_blocks_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_stats_parent_id_idx\` ON \`_life_v_blocks_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_stats_path_idx\` ON \`_life_v_blocks_stats\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_life_v_blocks_location_meta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`place\` text,
  	\`date\` text,
  	\`coordinates\` text,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'medium',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_life_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_location_meta_order_idx\` ON \`_life_v_blocks_location_meta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_location_meta_parent_id_idx\` ON \`_life_v_blocks_location_meta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_location_meta_path_idx\` ON \`_life_v_blocks_location_meta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_life_v_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`fit\` text DEFAULT 'cover',
  	\`caption\` text,
  	\`alt\` text,
  	\`parallax\` integer DEFAULT false,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_life_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_image_order_idx\` ON \`_life_v_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_image_parent_id_idx\` ON \`_life_v_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_image_path_idx\` ON \`_life_v_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_image_image_idx\` ON \`_life_v_blocks_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_life_v_blocks_wide_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`fit\` text DEFAULT 'cover',
  	\`caption\` text,
  	\`alt\` text,
  	\`parallax\` integer DEFAULT true,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_life_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_wide_image_order_idx\` ON \`_life_v_blocks_wide_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_wide_image_parent_id_idx\` ON \`_life_v_blocks_wide_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_wide_image_path_idx\` ON \`_life_v_blocks_wide_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_wide_image_image_idx\` ON \`_life_v_blocks_wide_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_life_v_blocks_full_bleed_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`fit\` text DEFAULT 'cover',
  	\`caption\` text,
  	\`alt\` text,
  	\`parallax\` integer DEFAULT true,
  	\`width\` text DEFAULT 'full',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_life_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_full_bleed_image_order_idx\` ON \`_life_v_blocks_full_bleed_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_full_bleed_image_parent_id_idx\` ON \`_life_v_blocks_full_bleed_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_full_bleed_image_path_idx\` ON \`_life_v_blocks_full_bleed_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_full_bleed_image_image_idx\` ON \`_life_v_blocks_full_bleed_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_life_v_blocks_photo_pair\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`left_id\` integer,
  	\`right_id\` integer,
  	\`ratio\` text DEFAULT '50-50',
  	\`fit\` text DEFAULT 'cover',
  	\`offset\` integer DEFAULT true,
  	\`caption\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`left_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`right_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_life_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_photo_pair_order_idx\` ON \`_life_v_blocks_photo_pair\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_photo_pair_parent_id_idx\` ON \`_life_v_blocks_photo_pair\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_photo_pair_path_idx\` ON \`_life_v_blocks_photo_pair\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_photo_pair_left_idx\` ON \`_life_v_blocks_photo_pair\` (\`left_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_photo_pair_right_idx\` ON \`_life_v_blocks_photo_pair\` (\`right_id\`);`)
  await db.run(sql`CREATE TABLE \`_life_v_blocks_image_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`body\` text,
  	\`order\` text DEFAULT 'image-left',
  	\`ratio\` text DEFAULT '50-50',
  	\`caption\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_life_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_image_text_order_idx\` ON \`_life_v_blocks_image_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_image_text_parent_id_idx\` ON \`_life_v_blocks_image_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_image_text_path_idx\` ON \`_life_v_blocks_image_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_image_text_image_idx\` ON \`_life_v_blocks_image_text\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_life_v_blocks_video\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`video_id\` integer,
  	\`poster_id\` integer,
  	\`autoplay\` integer DEFAULT true,
  	\`loop\` integer DEFAULT true,
  	\`controls\` integer DEFAULT false,
  	\`caption\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_life_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_video_order_idx\` ON \`_life_v_blocks_video\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_video_parent_id_idx\` ON \`_life_v_blocks_video\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_video_path_idx\` ON \`_life_v_blocks_video\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_video_video_idx\` ON \`_life_v_blocks_video\` (\`video_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_video_poster_idx\` ON \`_life_v_blocks_video\` (\`poster_id\`);`)
  await db.run(sql`CREATE TABLE \`_life_v_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`limit\` numeric DEFAULT 6,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_life_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_gallery_order_idx\` ON \`_life_v_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_gallery_parent_id_idx\` ON \`_life_v_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_gallery_path_idx\` ON \`_life_v_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_life_v_blocks_project_preview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_life_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_project_preview_order_idx\` ON \`_life_v_blocks_project_preview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_project_preview_parent_id_idx\` ON \`_life_v_blocks_project_preview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_project_preview_path_idx\` ON \`_life_v_blocks_project_preview\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_life_v_blocks_tool_preview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_life_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_tool_preview_order_idx\` ON \`_life_v_blocks_tool_preview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_tool_preview_parent_id_idx\` ON \`_life_v_blocks_tool_preview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_blocks_tool_preview_path_idx\` ON \`_life_v_blocks_tool_preview\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_life_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version__order\` text,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_category\` text DEFAULT 'travel',
  	\`version_place\` text,
  	\`version_date\` text,
  	\`version_description\` text,
  	\`version_cover_id\` integer,
  	\`version_coordinates\` text,
  	\`version_distance\` text,
  	\`version_elevation\` text,
  	\`version_duration\` text,
  	\`version_difficulty\` text,
  	\`version_trail\` text,
  	\`version_preset\` text DEFAULT 'editorial',
  	\`version_theme\` text DEFAULT 'light',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`life\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_parent_idx\` ON \`_life_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_version_version__order_idx\` ON \`_life_v\` (\`version__order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_version_version_slug_idx\` ON \`_life_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_version_version_cover_idx\` ON \`_life_v\` (\`version_cover_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_version_version_updated_at_idx\` ON \`_life_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_version_version_created_at_idx\` ON \`_life_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_version_version__status_idx\` ON \`_life_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_created_at_idx\` ON \`_life_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_updated_at_idx\` ON \`_life_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_latest_idx\` ON \`_life_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_autosave_idx\` ON \`_life_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_life_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`gallery_id\` integer,
  	\`projects_id\` integer,
  	\`built_tools_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_life_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`gallery_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`built_tools_id\`) REFERENCES \`built_tools\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_life_v_rels_order_idx\` ON \`_life_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_rels_parent_idx\` ON \`_life_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_rels_path_idx\` ON \`_life_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_rels_gallery_id_idx\` ON \`_life_v_rels\` (\`gallery_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_rels_projects_id_idx\` ON \`_life_v_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`_life_v_rels_built_tools_id_idx\` ON \`_life_v_rels\` (\`built_tools_id\`);`)
  await db.run(sql`CREATE TABLE \`gallery\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`image_id\` integer NOT NULL,
  	\`title\` text,
  	\`place\` text NOT NULL,
  	\`date\` text NOT NULL,
  	\`featured\` integer DEFAULT false,
  	\`caption\` text,
  	\`camera\` text,
  	\`lens\` text,
  	\`focal_length\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`gallery__order_idx\` ON \`gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`gallery_image_idx\` ON \`gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`gallery_updated_at_idx\` ON \`gallery\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`gallery_created_at_idx\` ON \`gallery\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`gallery_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`gallery_texts_order_parent\` ON \`gallery_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`built_tools\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`name\` text NOT NULL,
  	\`description\` text NOT NULL,
  	\`website\` text,
  	\`github\` text,
  	\`screenshot_id\` integer,
  	\`video_id\` integer,
  	\`featured\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`screenshot_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`built_tools__order_idx\` ON \`built_tools\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`built_tools_screenshot_idx\` ON \`built_tools\` (\`screenshot_id\`);`)
  await db.run(sql`CREATE INDEX \`built_tools_video_idx\` ON \`built_tools\` (\`video_id\`);`)
  await db.run(sql`CREATE INDEX \`built_tools_updated_at_idx\` ON \`built_tools\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`built_tools_created_at_idx\` ON \`built_tools\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`built_tools_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`built_tools\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`built_tools_texts_order_parent\` ON \`built_tools_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`used_tools\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`name\` text NOT NULL,
  	\`category\` text DEFAULT 'development' NOT NULL,
  	\`note\` text,
  	\`url\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`used_tools__order_idx\` ON \`used_tools\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`used_tools_updated_at_idx\` ON \`used_tools\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`used_tools_created_at_idx\` ON \`used_tools\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`body\` text,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'medium',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_text_order_idx\` ON \`posts_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_text_parent_id_idx\` ON \`posts_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_text_path_idx\` ON \`posts_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_heading\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`level\` text DEFAULT 'h2',
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'small',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_heading_order_idx\` ON \`posts_blocks_heading\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_heading_parent_id_idx\` ON \`posts_blocks_heading\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_heading_path_idx\` ON \`posts_blocks_heading\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_statement_lines\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_statement\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_statement_lines_order_idx\` ON \`posts_blocks_statement_lines\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_statement_lines_parent_id_idx\` ON \`posts_blocks_statement_lines\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_statement\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_statement_order_idx\` ON \`posts_blocks_statement\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_statement_parent_id_idx\` ON \`posts_blocks_statement\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_statement_path_idx\` ON \`posts_blocks_statement\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_section_intro_lead\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_section_intro\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_section_intro_lead_order_idx\` ON \`posts_blocks_section_intro_lead\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_section_intro_lead_parent_id_idx\` ON \`posts_blocks_section_intro_lead\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_section_intro\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`index\` text DEFAULT '01',
  	\`label\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_section_intro_order_idx\` ON \`posts_blocks_section_intro\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_section_intro_parent_id_idx\` ON \`posts_blocks_section_intro\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_section_intro_path_idx\` ON \`posts_blocks_section_intro\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_quote\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`quote\` text,
  	\`attribution\` text,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_quote_order_idx\` ON \`posts_blocks_quote\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_quote_parent_id_idx\` ON \`posts_blocks_quote\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_quote_path_idx\` ON \`posts_blocks_quote\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_stats_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`value\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_stats_items_order_idx\` ON \`posts_blocks_stats_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_stats_items_parent_id_idx\` ON \`posts_blocks_stats_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'medium',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_stats_order_idx\` ON \`posts_blocks_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_stats_parent_id_idx\` ON \`posts_blocks_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_stats_path_idx\` ON \`posts_blocks_stats\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_location_meta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`place\` text,
  	\`date\` text,
  	\`coordinates\` text,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'medium',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_location_meta_order_idx\` ON \`posts_blocks_location_meta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_location_meta_parent_id_idx\` ON \`posts_blocks_location_meta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_location_meta_path_idx\` ON \`posts_blocks_location_meta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`fit\` text DEFAULT 'cover',
  	\`caption\` text,
  	\`alt\` text,
  	\`parallax\` integer DEFAULT false,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_image_order_idx\` ON \`posts_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_image_parent_id_idx\` ON \`posts_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_image_path_idx\` ON \`posts_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_image_image_idx\` ON \`posts_blocks_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_wide_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`fit\` text DEFAULT 'cover',
  	\`caption\` text,
  	\`alt\` text,
  	\`parallax\` integer DEFAULT true,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_wide_image_order_idx\` ON \`posts_blocks_wide_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_wide_image_parent_id_idx\` ON \`posts_blocks_wide_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_wide_image_path_idx\` ON \`posts_blocks_wide_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_wide_image_image_idx\` ON \`posts_blocks_wide_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_full_bleed_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`fit\` text DEFAULT 'cover',
  	\`caption\` text,
  	\`alt\` text,
  	\`parallax\` integer DEFAULT true,
  	\`width\` text DEFAULT 'full',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_full_bleed_image_order_idx\` ON \`posts_blocks_full_bleed_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_full_bleed_image_parent_id_idx\` ON \`posts_blocks_full_bleed_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_full_bleed_image_path_idx\` ON \`posts_blocks_full_bleed_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_full_bleed_image_image_idx\` ON \`posts_blocks_full_bleed_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_photo_pair\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`left_id\` integer,
  	\`right_id\` integer,
  	\`ratio\` text DEFAULT '50-50',
  	\`fit\` text DEFAULT 'cover',
  	\`offset\` integer DEFAULT true,
  	\`caption\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`left_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`right_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_photo_pair_order_idx\` ON \`posts_blocks_photo_pair\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_photo_pair_parent_id_idx\` ON \`posts_blocks_photo_pair\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_photo_pair_path_idx\` ON \`posts_blocks_photo_pair\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_photo_pair_left_idx\` ON \`posts_blocks_photo_pair\` (\`left_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_photo_pair_right_idx\` ON \`posts_blocks_photo_pair\` (\`right_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_image_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`body\` text,
  	\`order\` text DEFAULT 'image-left',
  	\`ratio\` text DEFAULT '50-50',
  	\`caption\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_image_text_order_idx\` ON \`posts_blocks_image_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_image_text_parent_id_idx\` ON \`posts_blocks_image_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_image_text_path_idx\` ON \`posts_blocks_image_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_image_text_image_idx\` ON \`posts_blocks_image_text\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_video\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`video_id\` integer,
  	\`poster_id\` integer,
  	\`autoplay\` integer DEFAULT true,
  	\`loop\` integer DEFAULT true,
  	\`controls\` integer DEFAULT false,
  	\`caption\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_video_order_idx\` ON \`posts_blocks_video\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_video_parent_id_idx\` ON \`posts_blocks_video\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_video_path_idx\` ON \`posts_blocks_video\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_video_video_idx\` ON \`posts_blocks_video\` (\`video_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_video_poster_idx\` ON \`posts_blocks_video\` (\`poster_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`limit\` numeric DEFAULT 6,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_gallery_order_idx\` ON \`posts_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_gallery_parent_id_idx\` ON \`posts_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_gallery_path_idx\` ON \`posts_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_project_preview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_project_preview_order_idx\` ON \`posts_blocks_project_preview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_project_preview_parent_id_idx\` ON \`posts_blocks_project_preview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_project_preview_path_idx\` ON \`posts_blocks_project_preview\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_tool_preview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_tool_preview_order_idx\` ON \`posts_blocks_tool_preview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_tool_preview_parent_id_idx\` ON \`posts_blocks_tool_preview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_tool_preview_path_idx\` ON \`posts_blocks_tool_preview\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`posts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`description\` text,
  	\`category\` text DEFAULT 'Notes',
  	\`featured\` integer,
  	\`cover_id\` integer,
  	\`published_at\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`posts_slug_idx\` ON \`posts\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`posts_cover_idx\` ON \`posts\` (\`cover_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_updated_at_idx\` ON \`posts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`posts_created_at_idx\` ON \`posts\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`posts__status_idx\` ON \`posts\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`posts_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_texts_order_parent\` ON \`posts_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`gallery_id\` integer,
  	\`projects_id\` integer,
  	\`built_tools_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`gallery_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`built_tools_id\`) REFERENCES \`built_tools\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_rels_order_idx\` ON \`posts_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_parent_idx\` ON \`posts_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_path_idx\` ON \`posts_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_gallery_id_idx\` ON \`posts_rels\` (\`gallery_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_projects_id_idx\` ON \`posts_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_built_tools_id_idx\` ON \`posts_rels\` (\`built_tools_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`body\` text,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'medium',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_text_order_idx\` ON \`_posts_v_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_text_parent_id_idx\` ON \`_posts_v_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_text_path_idx\` ON \`_posts_v_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_heading\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`level\` text DEFAULT 'h2',
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'small',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_heading_order_idx\` ON \`_posts_v_blocks_heading\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_heading_parent_id_idx\` ON \`_posts_v_blocks_heading\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_heading_path_idx\` ON \`_posts_v_blocks_heading\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_statement_lines\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v_blocks_statement\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_statement_lines_order_idx\` ON \`_posts_v_blocks_statement_lines\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_statement_lines_parent_id_idx\` ON \`_posts_v_blocks_statement_lines\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_statement\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_statement_order_idx\` ON \`_posts_v_blocks_statement\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_statement_parent_id_idx\` ON \`_posts_v_blocks_statement\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_statement_path_idx\` ON \`_posts_v_blocks_statement\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_section_intro_lead\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v_blocks_section_intro\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_section_intro_lead_order_idx\` ON \`_posts_v_blocks_section_intro_lead\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_section_intro_lead_parent_id_idx\` ON \`_posts_v_blocks_section_intro_lead\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_section_intro\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`index\` text DEFAULT '01',
  	\`label\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_section_intro_order_idx\` ON \`_posts_v_blocks_section_intro\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_section_intro_parent_id_idx\` ON \`_posts_v_blocks_section_intro\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_section_intro_path_idx\` ON \`_posts_v_blocks_section_intro\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_quote\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`quote\` text,
  	\`attribution\` text,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_quote_order_idx\` ON \`_posts_v_blocks_quote\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_quote_parent_id_idx\` ON \`_posts_v_blocks_quote\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_quote_path_idx\` ON \`_posts_v_blocks_quote\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_stats_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`value\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v_blocks_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_stats_items_order_idx\` ON \`_posts_v_blocks_stats_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_stats_items_parent_id_idx\` ON \`_posts_v_blocks_stats_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'medium',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_stats_order_idx\` ON \`_posts_v_blocks_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_stats_parent_id_idx\` ON \`_posts_v_blocks_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_stats_path_idx\` ON \`_posts_v_blocks_stats\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_location_meta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`place\` text,
  	\`date\` text,
  	\`coordinates\` text,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'medium',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_location_meta_order_idx\` ON \`_posts_v_blocks_location_meta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_location_meta_parent_id_idx\` ON \`_posts_v_blocks_location_meta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_location_meta_path_idx\` ON \`_posts_v_blocks_location_meta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`fit\` text DEFAULT 'cover',
  	\`caption\` text,
  	\`alt\` text,
  	\`parallax\` integer DEFAULT false,
  	\`width\` text DEFAULT 'normal',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_image_order_idx\` ON \`_posts_v_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_image_parent_id_idx\` ON \`_posts_v_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_image_path_idx\` ON \`_posts_v_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_image_image_idx\` ON \`_posts_v_blocks_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_wide_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`fit\` text DEFAULT 'cover',
  	\`caption\` text,
  	\`alt\` text,
  	\`parallax\` integer DEFAULT true,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_wide_image_order_idx\` ON \`_posts_v_blocks_wide_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_wide_image_parent_id_idx\` ON \`_posts_v_blocks_wide_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_wide_image_path_idx\` ON \`_posts_v_blocks_wide_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_wide_image_image_idx\` ON \`_posts_v_blocks_wide_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_full_bleed_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`fit\` text DEFAULT 'cover',
  	\`caption\` text,
  	\`alt\` text,
  	\`parallax\` integer DEFAULT true,
  	\`width\` text DEFAULT 'full',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_full_bleed_image_order_idx\` ON \`_posts_v_blocks_full_bleed_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_full_bleed_image_parent_id_idx\` ON \`_posts_v_blocks_full_bleed_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_full_bleed_image_path_idx\` ON \`_posts_v_blocks_full_bleed_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_full_bleed_image_image_idx\` ON \`_posts_v_blocks_full_bleed_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_photo_pair\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`left_id\` integer,
  	\`right_id\` integer,
  	\`ratio\` text DEFAULT '50-50',
  	\`fit\` text DEFAULT 'cover',
  	\`offset\` integer DEFAULT true,
  	\`caption\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`left_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`right_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_photo_pair_order_idx\` ON \`_posts_v_blocks_photo_pair\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_photo_pair_parent_id_idx\` ON \`_posts_v_blocks_photo_pair\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_photo_pair_path_idx\` ON \`_posts_v_blocks_photo_pair\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_photo_pair_left_idx\` ON \`_posts_v_blocks_photo_pair\` (\`left_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_photo_pair_right_idx\` ON \`_posts_v_blocks_photo_pair\` (\`right_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_image_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`body\` text,
  	\`order\` text DEFAULT 'image-left',
  	\`ratio\` text DEFAULT '50-50',
  	\`caption\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_image_text_order_idx\` ON \`_posts_v_blocks_image_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_image_text_parent_id_idx\` ON \`_posts_v_blocks_image_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_image_text_path_idx\` ON \`_posts_v_blocks_image_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_image_text_image_idx\` ON \`_posts_v_blocks_image_text\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_video\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`video_id\` integer,
  	\`poster_id\` integer,
  	\`autoplay\` integer DEFAULT true,
  	\`loop\` integer DEFAULT true,
  	\`controls\` integer DEFAULT false,
  	\`caption\` text,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_video_order_idx\` ON \`_posts_v_blocks_video\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_video_parent_id_idx\` ON \`_posts_v_blocks_video\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_video_path_idx\` ON \`_posts_v_blocks_video\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_video_video_idx\` ON \`_posts_v_blocks_video\` (\`video_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_video_poster_idx\` ON \`_posts_v_blocks_video\` (\`poster_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`limit\` numeric DEFAULT 6,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_gallery_order_idx\` ON \`_posts_v_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_gallery_parent_id_idx\` ON \`_posts_v_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_gallery_path_idx\` ON \`_posts_v_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_project_preview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_project_preview_order_idx\` ON \`_posts_v_blocks_project_preview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_project_preview_parent_id_idx\` ON \`_posts_v_blocks_project_preview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_project_preview_path_idx\` ON \`_posts_v_blocks_project_preview\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_tool_preview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`width\` text DEFAULT 'wide',
  	\`align\` text DEFAULT 'left',
  	\`spacing\` text DEFAULT 'large',
  	\`theme\` text DEFAULT 'auto',
  	\`motion\` text DEFAULT 'default',
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_tool_preview_order_idx\` ON \`_posts_v_blocks_tool_preview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_tool_preview_parent_id_idx\` ON \`_posts_v_blocks_tool_preview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_tool_preview_path_idx\` ON \`_posts_v_blocks_tool_preview\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_description\` text,
  	\`version_category\` text DEFAULT 'Notes',
  	\`version_featured\` integer,
  	\`version_cover_id\` integer,
  	\`version_published_at\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_parent_idx\` ON \`_posts_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_slug_idx\` ON \`_posts_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_cover_idx\` ON \`_posts_v\` (\`version_cover_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_updated_at_idx\` ON \`_posts_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_created_at_idx\` ON \`_posts_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version__status_idx\` ON \`_posts_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_created_at_idx\` ON \`_posts_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_updated_at_idx\` ON \`_posts_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_latest_idx\` ON \`_posts_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_autosave_idx\` ON \`_posts_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_texts_order_parent\` ON \`_posts_v_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`gallery_id\` integer,
  	\`projects_id\` integer,
  	\`built_tools_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`gallery_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`built_tools_id\`) REFERENCES \`built_tools\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_order_idx\` ON \`_posts_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_parent_idx\` ON \`_posts_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_path_idx\` ON \`_posts_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_gallery_id_idx\` ON \`_posts_v_rels\` (\`gallery_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_projects_id_idx\` ON \`_posts_v_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_built_tools_id_idx\` ON \`_posts_v_rels\` (\`built_tools_id\`);`)
  await db.run(sql`CREATE TABLE \`access_grants\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`recipient\` text NOT NULL,
  	\`purpose\` text NOT NULL,
  	\`code\` text,
  	\`expires_at\` text NOT NULL,
  	\`revoked\` integer,
  	\`use_count\` numeric DEFAULT 0,
  	\`first_used_at\` text,
  	\`last_used_at\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`access_grants_code_idx\` ON \`access_grants\` (\`code\`);`)
  await db.run(sql`CREATE INDEX \`access_grants_updated_at_idx\` ON \`access_grants\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`access_grants_created_at_idx\` ON \`access_grants\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`projects_id\` integer,
  	\`life_id\` integer,
  	\`gallery_id\` integer,
  	\`built_tools_id\` integer,
  	\`used_tools_id\` integer,
  	\`posts_id\` integer,
  	\`access_grants_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`life_id\`) REFERENCES \`life\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`gallery_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`built_tools_id\`) REFERENCES \`built_tools\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`used_tools_id\`) REFERENCES \`used_tools\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`access_grants_id\`) REFERENCES \`access_grants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_life_id_idx\` ON \`payload_locked_documents_rels\` (\`life_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_gallery_id_idx\` ON \`payload_locked_documents_rels\` (\`gallery_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_built_tools_id_idx\` ON \`payload_locked_documents_rels\` (\`built_tools_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_used_tools_id_idx\` ON \`payload_locked_documents_rels\` (\`used_tools_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_access_grants_id_idx\` ON \`payload_locked_documents_rels\` (\`access_grants_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`home_headline\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_headline_order_idx\` ON \`home_headline\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_headline_parent_id_idx\` ON \`home_headline\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_intro\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_intro_order_idx\` ON \`home_intro\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_intro_parent_id_idx\` ON \`home_intro\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block\` text,
  	\`visible\` integer DEFAULT true,
  	\`motion\` text DEFAULT 'default',
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_sections_order_idx\` ON \`home_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_sections_parent_id_idx\` ON \`home_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`short_name\` text,
  	\`based_in\` text,
  	\`year\` text,
  	\`currently\` text,
  	\`greeting\` text,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`home__status_idx\` ON \`home\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`home_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_texts_order_parent\` ON \`home_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_v_version_headline\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_v_version_headline_order_idx\` ON \`_home_v_version_headline\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_v_version_headline_parent_id_idx\` ON \`_home_v_version_headline\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_v_version_intro\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_v_version_intro_order_idx\` ON \`_home_v_version_intro\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_v_version_intro_parent_id_idx\` ON \`_home_v_version_intro\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_v_version_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`block\` text,
  	\`visible\` integer DEFAULT true,
  	\`motion\` text DEFAULT 'default',
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_v_version_sections_order_idx\` ON \`_home_v_version_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_v_version_sections_parent_id_idx\` ON \`_home_v_version_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_name\` text,
  	\`version_short_name\` text,
  	\`version_based_in\` text,
  	\`version_year\` text,
  	\`version_currently\` text,
  	\`version_greeting\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_v_version_version__status_idx\` ON \`_home_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_home_v_created_at_idx\` ON \`_home_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_home_v_updated_at_idx\` ON \`_home_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_home_v_latest_idx\` ON \`_home_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_home_v_autosave_idx\` ON \`_home_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_home_v_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_home_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_v_texts_order_parent\` ON \`_home_v_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`resume_profile\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`resume_profile_order_idx\` ON \`resume_profile\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`resume_profile_parent_id_idx\` ON \`resume_profile\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`resume_experience_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume_experience\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`resume_experience_body_order_idx\` ON \`resume_experience_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`resume_experience_body_parent_id_idx\` ON \`resume_experience_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`resume_experience_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume_experience\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`resume_experience_highlights_order_idx\` ON \`resume_experience_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`resume_experience_highlights_parent_id_idx\` ON \`resume_experience_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`resume_experience\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`organisation\` text,
  	\`role\` text,
  	\`start\` text,
  	\`end\` text,
  	\`current\` integer,
  	\`location\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`resume_experience_order_idx\` ON \`resume_experience\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`resume_experience_parent_id_idx\` ON \`resume_experience\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`resume_education_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume_education\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`resume_education_body_order_idx\` ON \`resume_education_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`resume_education_body_parent_id_idx\` ON \`resume_education_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`resume_education_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume_education\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`resume_education_highlights_order_idx\` ON \`resume_education_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`resume_education_highlights_parent_id_idx\` ON \`resume_education_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`resume_education\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`organisation\` text,
  	\`role\` text,
  	\`start\` text,
  	\`end\` text,
  	\`current\` integer,
  	\`location\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`resume_education_order_idx\` ON \`resume_education\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`resume_education_parent_id_idx\` ON \`resume_education\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`resume_projects\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`period\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`resume_projects_order_idx\` ON \`resume_projects\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`resume_projects_parent_id_idx\` ON \`resume_projects\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`resume_skills\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`category\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`resume_skills_order_idx\` ON \`resume_skills\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`resume_skills_parent_id_idx\` ON \`resume_skills\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`resume_awards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`period\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`resume_awards_order_idx\` ON \`resume_awards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`resume_awards_parent_id_idx\` ON \`resume_awards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`resume_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`href\` text,
  	\`external\` integer DEFAULT true,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`resume\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`resume_contact_order_idx\` ON \`resume_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`resume_contact_parent_id_idx\` ON \`resume_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`resume\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`legal_name\` text,
  	\`title\` text,
  	\`portrait_id\` integer,
  	\`print_note\` text,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`portrait_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`resume_portrait_idx\` ON \`resume\` (\`portrait_id\`);`)
  await db.run(sql`CREATE INDEX \`resume__status_idx\` ON \`resume\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`resume_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`resume\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`resume_texts_order_parent\` ON \`resume_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_resume_v_version_profile\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_resume_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_resume_v_version_profile_order_idx\` ON \`_resume_v_version_profile\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_resume_v_version_profile_parent_id_idx\` ON \`_resume_v_version_profile\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_resume_v_version_experience_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_resume_v_version_experience\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_resume_v_version_experience_body_order_idx\` ON \`_resume_v_version_experience_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_resume_v_version_experience_body_parent_id_idx\` ON \`_resume_v_version_experience_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_resume_v_version_experience_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_resume_v_version_experience\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_resume_v_version_experience_highlights_order_idx\` ON \`_resume_v_version_experience_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_resume_v_version_experience_highlights_parent_id_idx\` ON \`_resume_v_version_experience_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_resume_v_version_experience\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`organisation\` text,
  	\`role\` text,
  	\`start\` text,
  	\`end\` text,
  	\`current\` integer,
  	\`location\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_resume_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_resume_v_version_experience_order_idx\` ON \`_resume_v_version_experience\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_resume_v_version_experience_parent_id_idx\` ON \`_resume_v_version_experience\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_resume_v_version_education_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_resume_v_version_education\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_resume_v_version_education_body_order_idx\` ON \`_resume_v_version_education_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_resume_v_version_education_body_parent_id_idx\` ON \`_resume_v_version_education_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_resume_v_version_education_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_resume_v_version_education\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_resume_v_version_education_highlights_order_idx\` ON \`_resume_v_version_education_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_resume_v_version_education_highlights_parent_id_idx\` ON \`_resume_v_version_education_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_resume_v_version_education\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`organisation\` text,
  	\`role\` text,
  	\`start\` text,
  	\`end\` text,
  	\`current\` integer,
  	\`location\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_resume_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_resume_v_version_education_order_idx\` ON \`_resume_v_version_education\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_resume_v_version_education_parent_id_idx\` ON \`_resume_v_version_education\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_resume_v_version_projects\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`period\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_resume_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_resume_v_version_projects_order_idx\` ON \`_resume_v_version_projects\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_resume_v_version_projects_parent_id_idx\` ON \`_resume_v_version_projects\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_resume_v_version_skills\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`category\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_resume_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_resume_v_version_skills_order_idx\` ON \`_resume_v_version_skills\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_resume_v_version_skills_parent_id_idx\` ON \`_resume_v_version_skills\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_resume_v_version_awards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`period\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_resume_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_resume_v_version_awards_order_idx\` ON \`_resume_v_version_awards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_resume_v_version_awards_parent_id_idx\` ON \`_resume_v_version_awards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_resume_v_version_contact\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`href\` text,
  	\`external\` integer DEFAULT true,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_resume_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_resume_v_version_contact_order_idx\` ON \`_resume_v_version_contact\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_resume_v_version_contact_parent_id_idx\` ON \`_resume_v_version_contact\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_resume_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_legal_name\` text,
  	\`version_title\` text,
  	\`version_portrait_id\` integer,
  	\`version_print_note\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`version_portrait_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_resume_v_version_version_portrait_idx\` ON \`_resume_v\` (\`version_portrait_id\`);`)
  await db.run(sql`CREATE INDEX \`_resume_v_version_version__status_idx\` ON \`_resume_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_resume_v_created_at_idx\` ON \`_resume_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_resume_v_updated_at_idx\` ON \`_resume_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_resume_v_latest_idx\` ON \`_resume_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_resume_v_autosave_idx\` ON \`_resume_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_resume_v_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_resume_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_resume_v_texts_order_parent\` ON \`_resume_v_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_navigation\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`route\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`visible\` integer DEFAULT true,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_navigation_order_idx\` ON \`site_settings_navigation\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_navigation_parent_id_idx\` ON \`site_settings_navigation\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_socials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`private\` integer,
  	\`platform\` text DEFAULT 'website' NOT NULL,
  	\`label\` text NOT NULL,
  	\`handle\` text,
  	\`href\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_socials_order_idx\` ON \`site_settings_socials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_socials_parent_id_idx\` ON \`site_settings_socials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`site_name\` text NOT NULL,
  	\`site_url\` text,
  	\`email\` text NOT NULL,
  	\`demo_mode\` integer,
  	\`accent_color\` text DEFAULT 'harbor',
  	\`seo_title\` text NOT NULL,
  	\`seo_description\` text NOT NULL,
  	\`seo_image_id\` integer,
  	\`blog_enabled\` integer DEFAULT false,
  	\`cursor_enabled\` integer DEFAULT true,
  	\`webgl_gallery\` integer DEFAULT true,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_seo_image_idx\` ON \`site_settings\` (\`seo_image_id\`);`)
  await db.run(sql`CREATE TABLE \`collage_themes_pieces\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`x\` numeric DEFAULT 30 NOT NULL,
  	\`y\` numeric DEFAULT 30 NOT NULL,
  	\`width\` numeric DEFAULT 35 NOT NULL,
  	\`rotate\` numeric DEFAULT 0 NOT NULL,
  	\`behind\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`collage_themes\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`collage_themes_pieces_order_idx\` ON \`collage_themes_pieces\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`collage_themes_pieces_parent_id_idx\` ON \`collage_themes_pieces\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`collage_themes_pieces_image_idx\` ON \`collage_themes_pieces\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`collage_themes\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`card_id\` integer NOT NULL,
  	\`alt\` text,
  	\`wash_sky\` text NOT NULL,
  	\`wash_haze\` text NOT NULL,
  	\`wash_land_fade\` text NOT NULL,
  	\`wash_land\` text NOT NULL,
  	FOREIGN KEY (\`card_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`collage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`collage_themes_order_idx\` ON \`collage_themes\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`collage_themes_parent_id_idx\` ON \`collage_themes\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`collage_themes_card_idx\` ON \`collage_themes\` (\`card_id\`);`)
  await db.run(sql`CREATE TABLE \`collage\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`autoplay\` integer DEFAULT true,
  	\`dwell\` numeric DEFAULT 7,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`media_texts\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_heading\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_statement_lines\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_statement\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_section_intro_lead\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_section_intro\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_quote\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_stats_items\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_stats\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_location_meta\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_wide_image\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_full_bleed_image\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_photo_pair\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_image_text\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_video\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_project_preview\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_tool_preview\`;`)
  await db.run(sql`DROP TABLE \`projects\`;`)
  await db.run(sql`DROP TABLE \`projects_texts\`;`)
  await db.run(sql`DROP TABLE \`projects_rels\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_heading\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_statement_lines\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_statement\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_section_intro_lead\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_section_intro\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_quote\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_stats_items\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_stats\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_location_meta\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_wide_image\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_full_bleed_image\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_photo_pair\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_image_text\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_video\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_project_preview\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_tool_preview\`;`)
  await db.run(sql`DROP TABLE \`_projects_v\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_texts\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_rels\`;`)
  await db.run(sql`DROP TABLE \`life_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`life_blocks_heading\`;`)
  await db.run(sql`DROP TABLE \`life_blocks_statement_lines\`;`)
  await db.run(sql`DROP TABLE \`life_blocks_statement\`;`)
  await db.run(sql`DROP TABLE \`life_blocks_section_intro_lead\`;`)
  await db.run(sql`DROP TABLE \`life_blocks_section_intro\`;`)
  await db.run(sql`DROP TABLE \`life_blocks_quote\`;`)
  await db.run(sql`DROP TABLE \`life_blocks_stats_items\`;`)
  await db.run(sql`DROP TABLE \`life_blocks_stats\`;`)
  await db.run(sql`DROP TABLE \`life_blocks_location_meta\`;`)
  await db.run(sql`DROP TABLE \`life_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`life_blocks_wide_image\`;`)
  await db.run(sql`DROP TABLE \`life_blocks_full_bleed_image\`;`)
  await db.run(sql`DROP TABLE \`life_blocks_photo_pair\`;`)
  await db.run(sql`DROP TABLE \`life_blocks_image_text\`;`)
  await db.run(sql`DROP TABLE \`life_blocks_video\`;`)
  await db.run(sql`DROP TABLE \`life_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`life_blocks_project_preview\`;`)
  await db.run(sql`DROP TABLE \`life_blocks_tool_preview\`;`)
  await db.run(sql`DROP TABLE \`life\`;`)
  await db.run(sql`DROP TABLE \`life_rels\`;`)
  await db.run(sql`DROP TABLE \`_life_v_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`_life_v_blocks_heading\`;`)
  await db.run(sql`DROP TABLE \`_life_v_blocks_statement_lines\`;`)
  await db.run(sql`DROP TABLE \`_life_v_blocks_statement\`;`)
  await db.run(sql`DROP TABLE \`_life_v_blocks_section_intro_lead\`;`)
  await db.run(sql`DROP TABLE \`_life_v_blocks_section_intro\`;`)
  await db.run(sql`DROP TABLE \`_life_v_blocks_quote\`;`)
  await db.run(sql`DROP TABLE \`_life_v_blocks_stats_items\`;`)
  await db.run(sql`DROP TABLE \`_life_v_blocks_stats\`;`)
  await db.run(sql`DROP TABLE \`_life_v_blocks_location_meta\`;`)
  await db.run(sql`DROP TABLE \`_life_v_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`_life_v_blocks_wide_image\`;`)
  await db.run(sql`DROP TABLE \`_life_v_blocks_full_bleed_image\`;`)
  await db.run(sql`DROP TABLE \`_life_v_blocks_photo_pair\`;`)
  await db.run(sql`DROP TABLE \`_life_v_blocks_image_text\`;`)
  await db.run(sql`DROP TABLE \`_life_v_blocks_video\`;`)
  await db.run(sql`DROP TABLE \`_life_v_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`_life_v_blocks_project_preview\`;`)
  await db.run(sql`DROP TABLE \`_life_v_blocks_tool_preview\`;`)
  await db.run(sql`DROP TABLE \`_life_v\`;`)
  await db.run(sql`DROP TABLE \`_life_v_rels\`;`)
  await db.run(sql`DROP TABLE \`gallery\`;`)
  await db.run(sql`DROP TABLE \`gallery_texts\`;`)
  await db.run(sql`DROP TABLE \`built_tools\`;`)
  await db.run(sql`DROP TABLE \`built_tools_texts\`;`)
  await db.run(sql`DROP TABLE \`used_tools\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_heading\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_statement_lines\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_statement\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_section_intro_lead\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_section_intro\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_quote\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_stats_items\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_stats\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_location_meta\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_wide_image\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_full_bleed_image\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_photo_pair\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_image_text\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_video\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_project_preview\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_tool_preview\`;`)
  await db.run(sql`DROP TABLE \`posts\`;`)
  await db.run(sql`DROP TABLE \`posts_texts\`;`)
  await db.run(sql`DROP TABLE \`posts_rels\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_heading\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_statement_lines\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_statement\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_section_intro_lead\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_section_intro\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_quote\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_stats_items\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_stats\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_location_meta\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_wide_image\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_full_bleed_image\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_photo_pair\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_image_text\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_video\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_project_preview\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_tool_preview\`;`)
  await db.run(sql`DROP TABLE \`_posts_v\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_texts\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_rels\`;`)
  await db.run(sql`DROP TABLE \`access_grants\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`home_headline\`;`)
  await db.run(sql`DROP TABLE \`home_intro\`;`)
  await db.run(sql`DROP TABLE \`home_sections\`;`)
  await db.run(sql`DROP TABLE \`home\`;`)
  await db.run(sql`DROP TABLE \`home_texts\`;`)
  await db.run(sql`DROP TABLE \`_home_v_version_headline\`;`)
  await db.run(sql`DROP TABLE \`_home_v_version_intro\`;`)
  await db.run(sql`DROP TABLE \`_home_v_version_sections\`;`)
  await db.run(sql`DROP TABLE \`_home_v\`;`)
  await db.run(sql`DROP TABLE \`_home_v_texts\`;`)
  await db.run(sql`DROP TABLE \`resume_profile\`;`)
  await db.run(sql`DROP TABLE \`resume_experience_body\`;`)
  await db.run(sql`DROP TABLE \`resume_experience_highlights\`;`)
  await db.run(sql`DROP TABLE \`resume_experience\`;`)
  await db.run(sql`DROP TABLE \`resume_education_body\`;`)
  await db.run(sql`DROP TABLE \`resume_education_highlights\`;`)
  await db.run(sql`DROP TABLE \`resume_education\`;`)
  await db.run(sql`DROP TABLE \`resume_projects\`;`)
  await db.run(sql`DROP TABLE \`resume_skills\`;`)
  await db.run(sql`DROP TABLE \`resume_awards\`;`)
  await db.run(sql`DROP TABLE \`resume_contact\`;`)
  await db.run(sql`DROP TABLE \`resume\`;`)
  await db.run(sql`DROP TABLE \`resume_texts\`;`)
  await db.run(sql`DROP TABLE \`_resume_v_version_profile\`;`)
  await db.run(sql`DROP TABLE \`_resume_v_version_experience_body\`;`)
  await db.run(sql`DROP TABLE \`_resume_v_version_experience_highlights\`;`)
  await db.run(sql`DROP TABLE \`_resume_v_version_experience\`;`)
  await db.run(sql`DROP TABLE \`_resume_v_version_education_body\`;`)
  await db.run(sql`DROP TABLE \`_resume_v_version_education_highlights\`;`)
  await db.run(sql`DROP TABLE \`_resume_v_version_education\`;`)
  await db.run(sql`DROP TABLE \`_resume_v_version_projects\`;`)
  await db.run(sql`DROP TABLE \`_resume_v_version_skills\`;`)
  await db.run(sql`DROP TABLE \`_resume_v_version_awards\`;`)
  await db.run(sql`DROP TABLE \`_resume_v_version_contact\`;`)
  await db.run(sql`DROP TABLE \`_resume_v\`;`)
  await db.run(sql`DROP TABLE \`_resume_v_texts\`;`)
  await db.run(sql`DROP TABLE \`site_settings_navigation\`;`)
  await db.run(sql`DROP TABLE \`site_settings_socials\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`collage_themes_pieces\`;`)
  await db.run(sql`DROP TABLE \`collage_themes\`;`)
  await db.run(sql`DROP TABLE \`collage\`;`)
}
