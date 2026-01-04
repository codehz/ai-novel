CREATE TABLE `model_call_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider_name` text NOT NULL,
	`model_name` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`input` text,
	`output` text,
	`error_message` text,
	`input_tokens` integer DEFAULT 0,
	`output_tokens` integer DEFAULT 0,
	`input_cost` real DEFAULT 0,
	`output_cost` real DEFAULT 0,
	`total_cost` real DEFAULT 0,
	`duration_ms` integer DEFAULT 0,
	`call_reason` text NOT NULL,
	`model_config_snapshot` text NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_model_call_logs_created_at` ON `model_call_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `model_providers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider_type` text NOT NULL,
	`provider_name` text NOT NULL,
	`api_key` text,
	`api_endpoint` text,
	`config` text,
	`is_enabled` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `model_providers_provider_type_unique` ON `model_providers` (`provider_type`);--> statement-breakpoint
CREATE TABLE `models` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider_id` integer NOT NULL,
	`model_name` text NOT NULL,
	`display_name` text NOT NULL,
	`description` text,
	`parameters` text,
	`input_price` real DEFAULT 0,
	`output_price` real DEFAULT 0,
	`is_enabled` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `model_providers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tool_configs` (
	`tool_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`icon` text,
	`version` text NOT NULL,
	`input_schema` text NOT NULL,
	`output_schema` text NOT NULL,
	`prompts` text,
	`is_enabled` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_tool_configs_is_enabled` ON `tool_configs` (`is_enabled`);--> statement-breakpoint
CREATE INDEX `idx_tool_configs_created_at` ON `tool_configs` (`created_at`);--> statement-breakpoint
CREATE TABLE `tool_histories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tool_id` text NOT NULL,
	`inputs` text NOT NULL,
	`outputs` text NOT NULL,
	`timestamp` integer NOT NULL,
	`model_id` integer,
	`model_name` text,
	`provider_name` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`model_id`) REFERENCES `models`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_tool_histories_tool_id` ON `tool_histories` (`tool_id`);--> statement-breakpoint
CREATE INDEX `idx_tool_histories_created_at` ON `tool_histories` (`created_at`);